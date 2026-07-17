(function () {
  "use strict";

  var state = {
    data: null,
    selectedId: null,
    dirty: false,
    saving: false,
    savedIds: new Set(),
    map: null,
    markers: [],
    tileFailed: false
  };

  var nodes = {};
  var fieldIds = ["spotStatus", "spotDate", "spotTitle", "spotSummary", "spotLatitude", "spotLongitude", "spotCharacters", "spotProps", "spotScript"];

  function byId(id) { return document.getElementById(id); }
  function selectedSpot() {
    return state.data && state.data.spots.find(function (spot) { return spot.id === state.selectedId; });
  }
  function sortedSpots() {
    return state.data.spots.slice().sort(function (a, b) { return a.order - b.order; });
  }
  function deepCopy(value) { return JSON.parse(JSON.stringify(value)); }
  function roundCoordinate(value) { return Math.round(value * 1000000) / 1000000; }

  function setSaveState(message, className) {
    nodes.saveState.textContent = message;
    nodes.saveState.className = "save-state" + (className ? " " + className : "");
  }

  function markDirty() {
    state.dirty = true;
    setSaveState("未保存の変更があります", "dirty");
  }

  function showFatal(message) {
    document.querySelector(".admin-layout").hidden = true;
    nodes.fatalError.hidden = false;
    nodes.fatalErrorMessage.textContent = message;
    setSaveState("読み込み失敗", "error");
  }

  function normalizeOrders() {
    sortedSpots().forEach(function (spot, index) { spot.order = index + 1; });
  }

  function parseCharacters(text) {
    return text.split(/\r?\n/).map(function (line) {
      var trimmed = line.trim();
      if (!trimmed) return null;
      var divider = trimmed.indexOf("|");
      if (divider < 0) return { name: trimmed, description: "" };
      return { name: trimmed.slice(0, divider).trim(), description: trimmed.slice(divider + 1).trim() };
    }).filter(function (item) { return item && item.name; });
  }

  function parseLines(text) {
    return text.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
  }

  function syncFormToSpot() {
    var spot = selectedSpot();
    if (!spot) return;
    spot.status = nodes.spotStatus.value;
    spot.date = nodes.spotDate.value;
    spot.title = nodes.spotTitle.value;
    spot.summary = nodes.spotSummary.value;
    spot.characters = parseCharacters(nodes.spotCharacters.value);
    spot.props = parseLines(nodes.spotProps.value);
    spot.script = nodes.spotScript.value;
    var latitude = nodes.spotLatitude.value.trim();
    var longitude = nodes.spotLongitude.value.trim();
    if (!latitude && !longitude) {
      spot.coordinates = null;
    } else if (latitude && longitude && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
      spot.coordinates = [Number(latitude), Number(longitude)];
    }
  }

  function renderSpotList() {
    nodes.spotList.replaceChildren();
    sortedSpots().forEach(function (spot) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "spot-list-button" + (spot.id === state.selectedId ? " selected" : "");
      button.setAttribute("aria-current", spot.id === state.selectedId ? "true" : "false");
      button.addEventListener("click", function () { selectSpot(spot.id); });

      var title = document.createElement("span");
      title.className = "spot-list-title";
      title.textContent = spot.title || "名称未設定";
      var badge = document.createElement("span");
      badge.className = "status-badge " + spot.status;
      badge.textContent = spot.status === "published" ? "公開" : "下書き";
      var meta = document.createElement("span");
      meta.className = "spot-list-meta";
      meta.textContent = (spot.coordinates ? "位置設定済み" : "位置未設定") + " · " + spot.id;
      button.append(title, badge, meta);
      nodes.spotList.appendChild(button);
    });
  }

  function renderForm() {
    var spot = selectedSpot();
    if (!spot) {
      nodes.spotForm.hidden = true;
      return;
    }
    nodes.spotForm.hidden = false;
    nodes.formTitle.textContent = (spot.title || "名称未設定") + "を編集";
    nodes.spotId.value = spot.id;
    nodes.spotStatus.value = spot.status;
    nodes.spotDate.value = spot.date || "";
    nodes.spotTitle.value = spot.title || "";
    nodes.spotSummary.value = spot.summary || "";
    nodes.spotLatitude.value = spot.coordinates ? spot.coordinates[0] : "";
    nodes.spotLongitude.value = spot.coordinates ? spot.coordinates[1] : "";
    nodes.spotCharacters.value = (spot.characters || []).map(function (character) {
      return character.name + (character.description ? " | " + character.description : "");
    }).join("\n");
    nodes.spotProps.value = (spot.props || []).join("\n");
    nodes.spotScript.value = spot.script || "";
    updateCoordinateState();
    renderPhotos();
  }

  function updateCoordinateState() {
    var spot = selectedSpot();
    if (spot && spot.coordinates) {
      nodes.coordinateState.textContent = "位置設定済み: " + spot.coordinates[0].toFixed(6) + ", " + spot.coordinates[1].toFixed(6);
    } else {
      nodes.coordinateState.textContent = "位置未設定";
    }
  }

  function renderPhotos() {
    var spot = selectedSpot();
    nodes.photoList.replaceChildren();
    (spot.photos || []).forEach(function (photo, index) {
      var card = document.createElement("article");
      card.className = "photo-card";
      var image = document.createElement("img");
      image.src = "../" + photo.src;
      image.alt = photo.alt || "";

      var fields = document.createElement("div");
      fields.className = "photo-fields";
      fields.appendChild(photoField("代替テキスト", photo.alt || "", function (value) { photo.alt = value; image.alt = value; markDirty(); }));
      fields.appendChild(photoField("キャプション", photo.caption || "", function (value) { photo.caption = value; markDirty(); }));

      var actions = document.createElement("div");
      actions.className = "photo-actions";
      actions.appendChild(photoAction("↑", "前へ移動", function () { movePhoto(index, -1); }, index === 0));
      actions.appendChild(photoAction("↓", "後ろへ移動", function () { movePhoto(index, 1); }, index === spot.photos.length - 1));
      actions.appendChild(photoAction("削除", "写真を一覧から削除", function () {
        if (window.confirm("この写真を脚本のギャラリーから外しますか？\n画像ファイル自体は安全のため残ります。")) {
          spot.photos.splice(index, 1);
          markDirty();
          renderPhotos();
        }
      }, false, "remove"));
      card.append(image, fields, actions);
      nodes.photoList.appendChild(card);
    });
  }

  function photoField(labelText, value, onInput) {
    var label = document.createElement("label");
    var span = document.createElement("span");
    span.textContent = labelText;
    var input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.addEventListener("input", function () { onInput(input.value); });
    label.append(span, input);
    return label;
  }

  function photoAction(text, label, handler, disabled, className) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.title = label;
    button.disabled = disabled;
    if (className) button.className = className;
    button.addEventListener("click", handler);
    return button;
  }

  function movePhoto(index, offset) {
    var photos = selectedSpot().photos;
    var target = index + offset;
    if (target < 0 || target >= photos.length) return;
    var moved = photos.splice(index, 1)[0];
    photos.splice(target, 0, moved);
    markDirty();
    renderPhotos();
  }

  function createPinIcon(selected) {
    return L.divIcon({
      className: "",
      html: '<div class="admin-pin' + (selected ? " selected" : "") + '"></div>',
      iconSize: selected ? [27, 27] : [22, 22],
      iconAnchor: selected ? [8, 24] : [7, 20]
    });
  }

  function renderMarkers() {
    if (!state.map || typeof L === "undefined") return;
    state.markers.forEach(function (marker) { marker.remove(); });
    state.markers = [];
    sortedSpots().forEach(function (spot) {
      if (!spot.coordinates) return;
      var isSelected = spot.id === state.selectedId;
      var marker = L.marker(spot.coordinates, {
        icon: createPinIcon(isSelected),
        draggable: isSelected,
        keyboard: true,
        title: spot.title || "名称未設定"
      }).addTo(state.map);
      marker.bindTooltip(spot.title || "名称未設定");
      marker.on("click", function () { selectSpot(spot.id); });
      if (isSelected) {
        marker.on("dragend", function () {
          var position = marker.getLatLng();
          setCoordinates(position.lat, position.lng, false);
        });
      }
      state.markers.push(marker);
    });
  }

  function setCoordinates(latitude, longitude, panMap) {
    var spot = selectedSpot();
    if (!spot) return;
    spot.coordinates = [roundCoordinate(latitude), roundCoordinate(longitude)];
    nodes.spotLatitude.value = spot.coordinates[0];
    nodes.spotLongitude.value = spot.coordinates[1];
    updateCoordinateState();
    renderMarkers();
    renderSpotList();
    if (panMap && state.map) state.map.panTo(spot.coordinates);
    markDirty();
  }

  function initMap() {
    if (typeof L === "undefined") {
      nodes.mapStatus.textContent = "地図ライブラリを取得できません。数値入力は使用できます。";
      return;
    }
    state.map = L.map("adminMap", { zoomControl: true }).setView(state.data.map.center, state.data.map.zoom);
    var tiles = L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">地理院タイル</a>'
    }).addTo(state.map);
    tiles.on("load", function () {
      if (!state.tileFailed) nodes.mapStatus.textContent = "地理院地図 · クリックで配置";
    });
    tiles.on("tileerror", function () {
      if (!state.tileFailed) {
        state.tileFailed = true;
        nodes.mapStatus.textContent = "地図画像を取得できません。数値入力は使用できます。";
      }
    });
    state.map.on("click", function (event) { setCoordinates(event.latlng.lat, event.latlng.lng, false); });
    renderMarkers();
  }

  function selectSpot(id) {
    syncFormToSpot();
    state.selectedId = id;
    renderSpotList();
    renderForm();
    renderMarkers();
    var spot = selectedSpot();
    if (state.map && spot && spot.coordinates) state.map.panTo(spot.coordinates);
  }

  function newId(base) {
    var stem = (base || "new-spot").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "new-spot";
    stem = stem.slice(0, 54);
    var candidate = stem;
    var number = 2;
    var ids = new Set(state.data.spots.map(function (spot) { return spot.id; }));
    while (ids.has(candidate)) { candidate = stem + "-" + number; number += 1; }
    return candidate;
  }

  function createSpot() {
    syncFormToSpot();
    var id = newId("new-spot");
    var spot = { id: id, status: "draft", title: "新しい脚本", summary: "", date: "", coordinates: null, characters: [], props: [], script: "", photos: [], order: state.data.spots.length + 1 };
    state.data.spots.push(spot);
    state.selectedId = id;
    markDirty();
    renderSpotList(); renderForm(); renderMarkers();
    nodes.spotTitle.focus(); nodes.spotTitle.select();
  }

  function duplicateSpot() {
    syncFormToSpot();
    var original = selectedSpot();
    if (!original) return;
    var copy = deepCopy(original);
    copy.id = newId(original.id + "-copy");
    copy.status = "draft";
    copy.title = original.title + "（複製）";
    copy.photos = [];
    copy.order = state.data.spots.length + 1;
    state.data.spots.push(copy);
    state.selectedId = copy.id;
    markDirty(); renderSpotList(); renderForm(); renderMarkers();
  }

  function deleteSpot() {
    var spot = selectedSpot();
    if (!spot || !window.confirm("「" + (spot.title || spot.id) + "」を一覧から削除しますか？\n保存するまでJSONには反映されません。画像ファイルは残ります。")) return;
    var ordered = sortedSpots();
    var index = ordered.findIndex(function (item) { return item.id === spot.id; });
    state.data.spots = state.data.spots.filter(function (item) { return item.id !== spot.id; });
    normalizeOrders();
    var next = sortedSpots()[Math.min(index, state.data.spots.length - 1)];
    state.selectedId = next ? next.id : null;
    markDirty(); renderSpotList(); renderForm(); renderMarkers();
  }

  function moveSpot(offset) {
    syncFormToSpot();
    var spots = sortedSpots();
    var index = spots.findIndex(function (spot) { return spot.id === state.selectedId; });
    var target = index + offset;
    if (index < 0 || target < 0 || target >= spots.length) return;
    var moved = spots.splice(index, 1)[0];
    spots.splice(target, 0, moved);
    spots.forEach(function (spot, orderIndex) { spot.order = orderIndex + 1; });
    state.data.spots = spots;
    markDirty(); renderSpotList();
  }

  function validateClient() {
    var ids = new Set();
    for (var i = 0; i < state.data.spots.length; i += 1) {
      var spot = state.data.spots[i];
      if (!/^[a-z0-9][a-z0-9-]{1,63}$/.test(spot.id)) throw new Error("ID「" + spot.id + "」が不正です。");
      if (ids.has(spot.id)) throw new Error("ID「" + spot.id + "」が重複しています。");
      ids.add(spot.id);
      if (spot.coordinates && (!Number.isFinite(spot.coordinates[0]) || !Number.isFinite(spot.coordinates[1]) || spot.coordinates[0] < -90 || spot.coordinates[0] > 90 || spot.coordinates[1] < -180 || spot.coordinates[1] > 180)) throw new Error("「" + spot.title + "」の位置が不正です。");
      if (spot.status === "published") {
        var missing = [];
        if (!spot.title.trim()) missing.push("題名");
        if (!spot.coordinates) missing.push("位置");
        if (!spot.script.trim()) missing.push("脚本本文");
        if (missing.length) throw new Error("「" + (spot.title || spot.id) + "」を公開するには" + missing.join("・") + "が必要です。");
      }
    }
  }

  async function saveData() {
    if (state.saving) return false;
    syncFormToSpot(); normalizeOrders();
    try { validateClient(); } catch (error) {
      setSaveState(error.message, "error"); window.alert(error.message); return false;
    }
    state.saving = true;
    nodes.saveButton.disabled = true;
    setSaveState("保存中…", "");
    try {
      var response = await fetch("/api/place-fiction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(state.data) });
      var result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "保存できませんでした。");
      state.dirty = false;
      state.savedIds = new Set(state.data.spots.map(function (spot) { return spot.id; }));
      setSaveState("保存しました", "saved");
      return true;
    } catch (error) {
      setSaveState(error.message, "error"); window.alert(error.message); return false;
    } finally {
      state.saving = false; nodes.saveButton.disabled = false;
    }
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result).split(",")[1]); };
      reader.onerror = function () { reject(new Error("画像を読み込めませんでした。")); };
      reader.readAsDataURL(blob);
    });
  }

  async function resizeToWebP(file) {
    if (!file.type.startsWith("image/")) throw new Error(file.name + " は画像ファイルではありません。");
    var bitmap = await createImageBitmap(file);
    var scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
    var canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d", { alpha: false }).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    var blob = await new Promise(function (resolve) { canvas.toBlob(resolve, "image/webp", 0.85); });
    if (!blob) throw new Error("このブラウザではWebPに変換できませんでした。");
    return blob;
  }

  async function uploadFiles(files) {
    var spot = selectedSpot();
    if (!spot || !files.length) return;
    if (!state.savedIds.has(spot.id)) {
      nodes.photoUploadState.textContent = "新しいスポットを先に保存しています…";
      if (!await saveData()) return;
    }
    nodes.photoInput.disabled = true;
    try {
      for (var i = 0; i < files.length; i += 1) {
        var file = files[i];
        nodes.photoUploadState.textContent = file.name + " を変換・保存中（" + (i + 1) + "/" + files.length + "）";
        var blob = await resizeToWebP(file);
        var base64 = await blobToBase64(blob);
        var baseName = "photo-" + Date.now() + "-" + (i + 1) + ".webp";
        var response = await fetch("/api/place-fiction/image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spotId: spot.id, fileName: baseName, mime: "image/webp", base64: base64 }) });
        var result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || "画像を保存できませんでした。");
        spot.photos.push({ src: result.src, alt: "", caption: "" });
        markDirty(); renderPhotos();
      }
      nodes.photoUploadState.textContent = "写真を追加しました。代替テキストを入力して「保存」を押してください。";
    } catch (error) {
      nodes.photoUploadState.textContent = error.message;
      window.alert(error.message);
    } finally {
      nodes.photoInput.disabled = false; nodes.photoInput.value = "";
    }
  }

  function openPreview() {
    syncFormToSpot();
    var spot = selectedSpot();
    var suffix = spot && spot.status === "published" ? "?spot=" + encodeURIComponent(spot.id) : "";
    window.open("../place-fiction.html" + suffix, "place-fiction-preview");
  }

  async function shutdown() {
    if (state.dirty && !window.confirm("未保存の変更があります。保存せず管理画面を終了しますか？")) return;
    try {
      await fetch("/api/shutdown", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      document.body.innerHTML = '<main class="fatal-error"><h1>管理画面を終了しました</h1><p>このタブを閉じてください。</p></main>';
    } catch (error) { window.alert("終了処理に失敗しました。ターミナル側でサーバーを終了してください。"); }
  }

  function handleCoordinateInput() {
    var latitude = nodes.spotLatitude.value.trim();
    var longitude = nodes.spotLongitude.value.trim();
    if (!latitude && !longitude) {
      selectedSpot().coordinates = null; updateCoordinateState(); renderMarkers(); renderSpotList(); markDirty(); return;
    }
    if (!latitude || !longitude) {
      nodes.coordinateState.textContent = "緯度と経度を両方入力してください"; markDirty(); return;
    }
    var latNumber = Number(latitude); var lngNumber = Number(longitude);
    if (Number.isFinite(latNumber) && Number.isFinite(lngNumber)) setCoordinates(latNumber, lngNumber, false);
  }

  function bindEvents() {
    nodes.newButton.addEventListener("click", createSpot);
    nodes.duplicateButton.addEventListener("click", duplicateSpot);
    nodes.deleteButton.addEventListener("click", deleteSpot);
    nodes.moveUpButton.addEventListener("click", function () { moveSpot(-1); });
    nodes.moveDownButton.addEventListener("click", function () { moveSpot(1); });
    nodes.saveButton.addEventListener("click", saveData);
    nodes.previewButton.addEventListener("click", openPreview);
    nodes.shutdownButton.addEventListener("click", shutdown);
    nodes.clearCoordinatesButton.addEventListener("click", function () {
      selectedSpot().coordinates = null; nodes.spotLatitude.value = ""; nodes.spotLongitude.value = ""; updateCoordinateState(); renderMarkers(); renderSpotList(); markDirty();
    });
    fieldIds.forEach(function (id) {
      if (id === "spotLatitude" || id === "spotLongitude") return;
      nodes[id].addEventListener("input", function () {
        syncFormToSpot(); markDirty();
        if (id === "spotTitle" || id === "spotStatus") { renderSpotList(); nodes.formTitle.textContent = (selectedSpot().title || "名称未設定") + "を編集"; }
      });
      nodes[id].addEventListener("change", function () { syncFormToSpot(); markDirty(); renderSpotList(); });
    });
    nodes.spotLatitude.addEventListener("change", handleCoordinateInput);
    nodes.spotLongitude.addEventListener("change", handleCoordinateInput);
    nodes.photoInput.addEventListener("change", function () { uploadFiles(Array.from(nodes.photoInput.files || [])); });
    ["dragenter", "dragover"].forEach(function (name) { nodes.photoDropZone.addEventListener(name, function (event) { event.preventDefault(); nodes.photoDropZone.classList.add("dragging"); }); });
    ["dragleave", "drop"].forEach(function (name) { nodes.photoDropZone.addEventListener(name, function (event) { event.preventDefault(); nodes.photoDropZone.classList.remove("dragging"); }); });
    nodes.photoDropZone.addEventListener("drop", function (event) { uploadFiles(Array.from(event.dataTransfer.files || [])); });
    nodes.photoDropZone.addEventListener("keydown", function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); nodes.photoInput.click(); } });
    window.addEventListener("beforeunload", function (event) { if (state.dirty) { event.preventDefault(); event.returnValue = ""; } });
  }

  async function init() {
    ["saveState", "previewButton", "saveButton", "shutdownButton", "newButton", "duplicateButton", "moveUpButton", "moveDownButton", "deleteButton", "spotList", "spotForm", "formTitle", "spotId", "spotStatus", "spotDate", "spotTitle", "spotSummary", "spotLatitude", "spotLongitude", "coordinateState", "clearCoordinatesButton", "spotCharacters", "spotProps", "spotScript", "photoInput", "photoDropZone", "photoUploadState", "photoList", "mapStatus", "fatalError", "fatalErrorMessage"].forEach(function (id) { nodes[id] = byId(id); });
    try {
      var response = await fetch("/api/place-fiction", { cache: "no-store" });
      var result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "脚本データを読み込めませんでした。");
      state.data = result.data;
      state.savedIds = new Set(state.data.spots.map(function (spot) { return spot.id; }));
      state.selectedId = sortedSpots()[0] ? sortedSpots()[0].id : null;
      bindEvents(); renderSpotList(); renderForm(); initMap(); setSaveState("保存済み", "saved");
    } catch (error) { showFatal(error.message || "ローカル管理サーバーへ接続できませんでした。"); }
  }

  init();
})();
