#!/usr/bin/env python3
"""Loopback-only editor server for the place-fiction prototype."""

from __future__ import annotations

import argparse
import base64
import binascii
import json
import os
import re
import shutil
import tempfile
import threading
from datetime import datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import urlparse

SITE_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = SITE_ROOT / "data" / "place-fiction.json"
ASSET_ROOT = SITE_ROOT / "assets" / "place-fiction"
BACKUP_ROOT = SITE_ROOT / ".admin-backups"
PID_FILE = SITE_ROOT / ".place-fiction-admin.pid"
ID_PATTERN = re.compile(r"^[a-z0-9][a-z0-9-]{1,63}$")
FILE_STEM_PATTERN = re.compile(r"[^a-z0-9-]+")
MAX_JSON_BYTES = 8 * 1024 * 1024
MAX_IMAGE_BYTES = 15 * 1024 * 1024
ALLOWED_IMAGE_MIMES = {"image/webp": ".webp", "image/jpeg": ".jpg", "image/png": ".png"}


class ValidationError(ValueError):
    pass


def require_string(value: Any, label: str, allow_empty: bool = True) -> str:
    if not isinstance(value, str):
        raise ValidationError(f"{label} は文字列で入力してください。")
    if not allow_empty and not value.strip():
        raise ValidationError(f"{label} は必須です。")
    return value


def validate_coordinates(value: Any, label: str) -> None:
    if value is None:
        return
    if not isinstance(value, list) or len(value) != 2:
        raise ValidationError(f"{label} は [緯度, 経度] または null にしてください。")
    latitude, longitude = value
    if isinstance(latitude, bool) or isinstance(longitude, bool) or not isinstance(latitude, (int, float)) or not isinstance(longitude, (int, float)):
        raise ValidationError(f"{label} に数値を入力してください。")
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        raise ValidationError(f"{label} が緯度経度の範囲外です。")


def validate_photo_path(src: str, spot_id: str) -> None:
    if "\\" in src or src.startswith("/"):
        raise ValidationError(f"{spot_id} の写真パスが不正です。")
    path = PurePosixPath(src)
    expected = PurePosixPath("assets") / "place-fiction" / spot_id
    if ".." in path.parts or path.parent != expected:
        raise ValidationError(f"{spot_id} の写真は assets/place-fiction/{spot_id}/ 内に置いてください。")
    if path.suffix.lower() not in {".webp", ".jpg", ".jpeg", ".png"}:
        raise ValidationError(f"{spot_id} の写真形式が不正です。")


def validate_document(document: Any) -> dict[str, Any]:
    if not isinstance(document, dict) or document.get("version") != 1:
        raise ValidationError("データ形式またはversionが不正です。")
    map_settings = document.get("map")
    if not isinstance(map_settings, dict):
        raise ValidationError("map の設定がありません。")
    validate_coordinates(map_settings.get("center"), "地図中心")
    if map_settings.get("center") is None:
        raise ValidationError("地図中心は必須です。")
    zoom = map_settings.get("zoom")
    if isinstance(zoom, bool) or not isinstance(zoom, (int, float)) or not 1 <= zoom <= 20:
        raise ValidationError("地図のズーム値が不正です。")
    spots = document.get("spots")
    if not isinstance(spots, list):
        raise ValidationError("spots は配列にしてください。")

    ids: set[str] = set()
    orders: set[int] = set()
    for index, spot in enumerate(spots):
        prefix = f"スポット{index + 1}"
        if not isinstance(spot, dict):
            raise ValidationError(f"{prefix} の形式が不正です。")
        spot_id = require_string(spot.get("id"), f"{prefix}のID", False)
        if not ID_PATTERN.fullmatch(spot_id):
            raise ValidationError(f"{spot_id} のIDは半角小文字・数字・ハイフンで入力してください。")
        if spot_id in ids:
            raise ValidationError(f"ID {spot_id} が重複しています。")
        ids.add(spot_id)
        status = spot.get("status")
        if status not in {"draft", "published"}:
            raise ValidationError(f"{spot_id} の公開状態が不正です。")
        title = require_string(spot.get("title"), f"{spot_id}の題名")
        require_string(spot.get("summary"), f"{spot_id}の概要")
        require_string(spot.get("date"), f"{spot_id}の日付")
        script = require_string(spot.get("script"), f"{spot_id}の脚本")
        validate_coordinates(spot.get("coordinates"), f"{spot_id}の位置")
        order = spot.get("order")
        if isinstance(order, bool) or not isinstance(order, int) or order < 1 or order in orders:
            raise ValidationError(f"{spot_id} の並び順が不正または重複しています。")
        orders.add(order)
        characters = spot.get("characters")
        if not isinstance(characters, list):
            raise ValidationError(f"{spot_id} の登場人物は配列にしてください。")
        for character in characters:
            if not isinstance(character, dict):
                raise ValidationError(f"{spot_id} の登場人物の形式が不正です。")
            require_string(character.get("name"), f"{spot_id}の人物名", False)
            require_string(character.get("description"), f"{spot_id}の人物説明")
        props = spot.get("props")
        if not isinstance(props, list) or any(not isinstance(item, str) for item in props):
            raise ValidationError(f"{spot_id} の小道具は文字列の配列にしてください。")
        photos = spot.get("photos")
        if not isinstance(photos, list):
            raise ValidationError(f"{spot_id} の写真は配列にしてください。")
        photo_paths: set[str] = set()
        for photo in photos:
            if not isinstance(photo, dict):
                raise ValidationError(f"{spot_id} の写真情報が不正です。")
            src = require_string(photo.get("src"), f"{spot_id}の写真パス", False)
            require_string(photo.get("alt"), f"{spot_id}の写真代替テキスト")
            require_string(photo.get("caption"), f"{spot_id}の写真キャプション")
            validate_photo_path(src, spot_id)
            photo_paths.add(src)
        script_blocks = spot.get("scriptBlocks", [])
        if not isinstance(script_blocks, list):
            raise ValidationError(f"{spot_id} の脚本レイアウトは配列にしてください。")
        for block_index, block in enumerate(script_blocks):
            block_label = f"{spot_id}の脚本レイアウト{block_index + 1}"
            if not isinstance(block, dict):
                raise ValidationError(f"{block_label} の形式が不正です。")
            block_type = block.get("type")
            if block_type not in {"scene", "text", "dialogue", "image", "end"}:
                raise ValidationError(f"{block_label} の種類が不正です。")
            if block_type in {"scene", "text", "end"}:
                require_string(block.get("text"), f"{block_label}の本文")
            elif block_type == "dialogue":
                require_string(block.get("speaker"), f"{block_label}の話者", False)
                require_string(block.get("text"), f"{block_label}の台詞")
            elif block_type == "image":
                block_src = require_string(block.get("src"), f"{block_label}の写真", False)
                require_string(block.get("caption", ""), f"{block_label}のキャプション")
                if block_src not in photo_paths:
                    raise ValidationError(f"{block_label} が未登録の写真を参照しています。")
        if status == "published":
            missing = []
            if not title.strip(): missing.append("題名")
            if spot.get("coordinates") is None: missing.append("位置")
            if not script.strip() and not script_blocks: missing.append("脚本本文")
            if missing:
                raise ValidationError(f"{spot_id} を公開するには {'、'.join(missing)} が必要です。")
    return document


def write_json_atomically(document: dict[str, Any]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    if DATA_FILE.exists():
        BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().strftime("%Y%m%d-%H%M%S-%f")
        shutil.copy2(DATA_FILE, BACKUP_ROOT / f"place-fiction-{stamp}.json")
    descriptor, temporary_name = tempfile.mkstemp(prefix=".place-fiction-", suffix=".tmp", dir=DATA_FILE.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as stream:
            json.dump(document, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary_name, DATA_FILE)
    finally:
        if os.path.exists(temporary_name):
            os.unlink(temporary_name)


class LocalAdminServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


class AdminHandler(SimpleHTTPRequestHandler):
    server_version = "PlaceFictionAdmin/1.0"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(SITE_ROOT), **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        super().end_headers()

    def send_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def read_json(self, limit: int) -> Any:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValidationError("Content-Length が不正です。") from error
        if length <= 0 or length > limit:
            raise ValidationError("送信データのサイズが不正です。")
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ValidationError("JSONを読み取れませんでした。") from error

    def do_GET(self) -> None:
        route = urlparse(self.path).path
        if route == "/api/health":
            self.send_json(HTTPStatus.OK, {"ok": True, "localOnly": True})
            return
        if route == "/api/place-fiction":
            try:
                document = validate_document(json.loads(DATA_FILE.read_text(encoding="utf-8")))
            except (OSError, json.JSONDecodeError, ValidationError) as error:
                self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": str(error)})
                return
            self.send_json(HTTPStatus.OK, {"ok": True, "data": document})
            return
        super().do_GET()

    def do_POST(self) -> None:
        route = urlparse(self.path).path
        try:
            if route == "/api/place-fiction":
                write_json_atomically(validate_document(self.read_json(MAX_JSON_BYTES)))
                self.send_json(HTTPStatus.OK, {"ok": True})
            elif route == "/api/place-fiction/image":
                self.save_image()
            elif route == "/api/shutdown":
                self.send_json(HTTPStatus.OK, {"ok": True})
                threading.Thread(target=self.server.shutdown, daemon=True).start()
            else:
                self.send_json(HTTPStatus.NOT_FOUND, {"ok": False, "error": "APIが見つかりません。"})
        except ValidationError as error:
            self.send_json(HTTPStatus.BAD_REQUEST, {"ok": False, "error": str(error)})
        except OSError as error:
            self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"ok": False, "error": f"保存に失敗しました: {error}"})

    def save_image(self) -> None:
        payload = self.read_json(MAX_IMAGE_BYTES * 2)
        if not isinstance(payload, dict):
            raise ValidationError("画像データの形式が不正です。")
        spot_id = require_string(payload.get("spotId"), "スポットID", False)
        if not ID_PATTERN.fullmatch(spot_id):
            raise ValidationError("スポットIDが不正です。")
        try:
            existing = validate_document(json.loads(DATA_FILE.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError) as error:
            raise ValidationError("現在の脚本データを確認できません。") from error
        if spot_id not in {spot["id"] for spot in existing["spots"]}:
            raise ValidationError("先に新しいスポットを保存してから写真を追加してください。")
        mime = require_string(payload.get("mime"), "画像形式", False)
        if mime not in ALLOWED_IMAGE_MIMES:
            raise ValidationError("WebP、JPEG、PNG以外は保存できません。")
        raw_name = require_string(payload.get("fileName"), "ファイル名", False)
        if Path(raw_name).name != raw_name or "\\" in raw_name:
            raise ValidationError("ファイル名が不正です。")
        stem = FILE_STEM_PATTERN.sub("-", Path(raw_name).stem.lower()).strip("-")[:56] or "photo"
        encoded = require_string(payload.get("base64"), "画像データ", False)
        try:
            image_bytes = base64.b64decode(encoded, validate=True)
        except (ValueError, binascii.Error) as error:
            raise ValidationError("画像データを復号できません。") from error
        if not image_bytes or len(image_bytes) > MAX_IMAGE_BYTES:
            raise ValidationError("画像サイズが大きすぎます。")
        signatures = {
            "image/webp": image_bytes.startswith(b"RIFF") and image_bytes[8:12] == b"WEBP",
            "image/jpeg": image_bytes.startswith(b"\xff\xd8\xff"),
            "image/png": image_bytes.startswith(b"\x89PNG\r\n\x1a\n"),
        }
        if not signatures[mime]:
            raise ValidationError("指定された形式の画像として認識できません。")
        target_directory = (ASSET_ROOT / spot_id).resolve()
        if target_directory.parent != ASSET_ROOT.resolve():
            raise ValidationError("プロジェクト外へは保存できません。")
        target_directory.mkdir(parents=True, exist_ok=True)
        suffix = ALLOWED_IMAGE_MIMES[mime]
        target = target_directory / f"{stem}{suffix}"
        counter = 2
        while target.exists():
            target = target_directory / f"{stem}-{counter}{suffix}"
            counter += 1
        target.write_bytes(image_bytes)
        self.send_json(HTTPStatus.OK, {"ok": True, "src": target.relative_to(SITE_ROOT).as_posix()})

    def log_message(self, format_string: str, *args: Any) -> None:
        print(f"[{self.log_date_time_string()}] {format_string % args}")


def main() -> int:
    parser = argparse.ArgumentParser(description="地図脚本のローカル管理サーバー")
    parser.add_argument("--port", type=int, default=8765)
    arguments = parser.parse_args()
    if not 1024 <= arguments.port <= 65535:
        parser.error("port は 1024 から 65535 の範囲で指定してください")
    server = LocalAdminServer(("127.0.0.1", arguments.port), AdminHandler)
    PID_FILE.write_text(str(os.getpid()), encoding="ascii")
    print(f"Place Fiction editor: http://127.0.0.1:{arguments.port}/admin/place-fiction-admin.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        try: PID_FILE.unlink()
        except FileNotFoundError: pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
