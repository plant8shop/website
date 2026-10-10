(function () {
  "use strict";

  var data = window.LAUNDRY_WAITING_ROOM_DATA || { stores: [] };
  var params = new URL(window.location.href).searchParams;
  var store = data.stores.find(function (item) { return item.id === params.get("store"); }) || data.stores[0];
  var visitorId = localStorage.getItem("plantshop_laundry_theater_visitor_id");
  if (!visitorId) {
    visitorId = "v_" + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "_" + Math.random().toString(36).slice(2));
    localStorage.setItem("plantshop_laundry_theater_visitor_id", visitorId);
  }

  var api = data.apiUrl || "";
  var localKey = "plantshop_laundry_theater_submissions_" + visitorId;
  var deletedKey = "plantshop_laundry_theater_deleted_" + visitorId;
  var likeOverrideKey = "plantshop_laundry_theater_likes_" + visitorId;
  var remote = { works: {}, submissions: [] };
  var remoteLoaded = false;
  var likeOverrides = readLikeOverrides();
  var photoPreviewCache = {};
  var photoDbPromise = null;
  var likedOnly = false;
  var selectedPoint = null;
  var editPoint = null;
  var activeWork = null;
  var activeSubmission = null;
  var speech = null;
  var speechTimer = null;
  var speechStartedAt = 0;
  var speechPausedAt = 0;
  var speechPausedTotal = 0;
  var speechDuration = 0;
  var mapNode = document.getElementById("mapCanvas");
  var listNode = document.getElementById("workList");
  var countNode = document.getElementById("workCount");
  var dialog = document.getElementById("workDialog");
  var dialogContent = document.getElementById("dialogContent");
  var commentDialog = document.getElementById("commentDialog");
  var editDialog = document.getElementById("editDialog");
  var submitMap = document.getElementById("submissionMap");
  var editMap = document.getElementById("editSubmissionMap");
  var unknown = document.getElementById("locationUnknown");
  var editUnknown = document.getElementById("editLocationUnknown");
  var form = document.getElementById("submissionForm");
  var editForm = document.getElementById("editForm");
  var formStatus = document.getElementById("formStatus");

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function makeId() {
    return "p_" + (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "_" + Math.random().toString(36).slice(2));
  }

  function stateFor(workId) {
    var base = remote.works[workId] || { likeCount: 0, liked: false };
    var override = likeOverrides[workId];
    if (!override) return base;
    var count = Number(base.likeCount) || 0;
    if (Boolean(base.liked) !== override.liked) count += override.liked ? 1 : -1;
    return { likeCount: Math.max(0, count), liked: override.liked, syncing: true };
  }

  function readLikeOverrides() {
    try { return JSON.parse(localStorage.getItem(likeOverrideKey) || "{}"); } catch (error) { return {}; }
  }

  function saveLikeOverrides() {
    try { localStorage.setItem(likeOverrideKey, JSON.stringify(likeOverrides)); } catch (error) {}
  }

  function reconcileLikeOverrides() {
    if (!remoteLoaded) return;
    var changed = false;
    Object.keys(likeOverrides).forEach(function (workId) {
      var serverState = remote.works[workId];
      if (serverState && Boolean(serverState.liked) === likeOverrides[workId].liked) {
        delete likeOverrides[workId];
        changed = true;
      }
    });
    if (changed) saveLikeOverrides();
  }

  function mapScenery() {
    return '<span class="map-road map-road-a"></span><span class="map-road map-road-b"></span><span class="map-road map-road-c"></span><span class="map-block map-block-a"></span><span class="map-block map-block-b"></span><span class="map-block map-block-c"></span><span class="map-shop"><i></i>' + escapeHtml(store.name) + '</span>';
  }

  function visibleWork(work) {
    return !likedOnly || stateFor(work.id).liked;
  }

  function renderMap() {
    var markers = store.works.filter(visibleWork).map(function (work) {
      return '<button class="map-marker" type="button" data-work-id="' + escapeHtml(work.id) + '" style="--x:' + Number(work.x || 50) + '%;--y:' + Number(work.y || 50) + '%" aria-label="' + escapeHtml(work.title) + 'を開く"><span>' + escapeHtml(work.number) + '</span><em>' + escapeHtml(work.title) + '</em></button>';
    }).join("");
    mapNode.innerHTML = mapScenery() + markers + (store.works.length ? "" : '<p class="map-empty">作品の位置を準備しています。</p>');
  }

  function renderWorks() {
    var works = store.works.filter(visibleWork);
    countNode.textContent = likedOnly ? works.length + "件の「いいね」した作品" : (works.length ? works.length + "作品" : "公開準備中です");
    if (!works.length) {
      listNode.innerHTML = '<div class="empty-card"><strong>' + (likedOnly ? "「いいね」した作品はまだありません" : "この店舗の作品は準備中です") + '</strong></div>';
      renderMap();
      return;
    }
    listNode.innerHTML = works.map(function (work) {
      var state = stateFor(work.id);
      return '<button class="work-card" type="button" data-work-id="' + escapeHtml(work.id) + '"><span class="work-number">' + escapeHtml(work.number) + '</span><span class="work-card-main"><strong>' + escapeHtml(work.title) + '</strong></span><span class="work-reactions">♡ ' + state.likeCount + '</span><span class="work-arrow" aria-hidden="true">↗</span></button>';
    }).join("");
    renderMap();
  }

  function renderDialog() {
    if (!activeWork) return;
    var state = stateFor(activeWork.id);
    var images = activeWork.images && activeWork.images.length ? activeWork.images : [{ label: activeWork.imageLabel || "場所の写真 / 準備中" }];
    var gallery = images.map(function (item, index) {
      var content = item.src ? '<img src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.alt || item.label || activeWork.title + "の写真") + '">' : '<div class="work-gallery-placeholder" role="img" aria-label="' + escapeHtml(item.label || "場所の写真 / 準備中") + '"><span>' + escapeHtml(item.label || "場所の写真 / 準備中") + '</span></div>';
      return '<figure data-gallery-item="' + index + '">' + content + (item.caption ? '<figcaption>' + escapeHtml(item.caption) + '</figcaption>' : '') + '</figure>';
    }).join("");
    var notes = activeWork.areaMap && activeWork.areaMap.notes || [];
    var areaMap = notes.map(function (note) { return '<span class="map-note" style="--x:' + Number(note.x || 50) + '%;--y:' + Number(note.y || 50) + '%">' + escapeHtml(note.text) + '</span>'; }).join("");
    dialogContent.innerHTML = '<h2 id="dialogTitle">' + escapeHtml(activeWork.title) + '</h2><p class="dialog-place">' + escapeHtml(activeWork.place) + '</p><div id="workGallery" class="work-gallery">' + gallery + '</div><div class="gallery-toolbar"><span id="galleryCounter" class="gallery-counter">1 / ' + images.length + '</span><div><button id="galleryPrev" type="button" aria-label="前の写真">←</button><button id="galleryNext" type="button" aria-label="次の写真">→</button></div></div><button id="areaMapToggle" class="area-map-toggle" type="button" aria-expanded="false" aria-controls="areaMapPanel">周辺図を表示する</button><div id="areaMapPanel" class="area-map-panel" hidden><div class="detailed-map" role="img" aria-label="' + escapeHtml(activeWork.title) + 'の場所周辺図">' + areaMap + '</div></div><p class="dialog-summary">' + escapeHtml(activeWork.summary) + '</p><div class="audio-player"><button id="listenButton" class="audio-play" type="button" aria-label="朗読を再生">▶</button><div class="audio-track"><progress id="audioProgress" class="audio-progress" max="100" value="0"></progress><div class="audio-time"><span id="audioCurrent">0:00</span><span id="audioDuration">' + formatTime(estimateSpeechDuration()) + '</span></div></div><p class="audio-caption">ブラウザの音声でテキストを再生します</p></div><div class="script"><h3>テキスト</h3>' + activeWork.script.map(function (paragraph) { return '<p>' + escapeHtml(paragraph) + '</p>'; }).join("") + '</div><section class="reactions"><button id="likeButton" class="like-button' + (state.liked ? ' is-liked' : '') + '" type="button" aria-pressed="' + state.liked + '">♡ <strong>' + (state.liked ? 'いいね済み' : 'いいね') + '</strong><span>' + state.likeCount + '</span>' + (state.syncing ? '<small>保存中</small>' : '') + '</button><button id="commentButton" class="button" type="button">コメントする</button></section>';
    document.getElementById("listenButton").addEventListener("click", toggleSpeech);
    document.getElementById("likeButton").addEventListener("click", toggleLike);
    document.getElementById("commentButton").addEventListener("click", openCommentForm);
    document.getElementById("areaMapToggle").addEventListener("click", toggleAreaMap);
    document.getElementById("galleryPrev").addEventListener("click", function () { moveGallery(-1); });
    document.getElementById("galleryNext").addEventListener("click", function () { moveGallery(1); });
    document.getElementById("workGallery").addEventListener("scroll", updateGalleryCounter);
  }

  function updateDialogReactionState() {
    if (!activeWork) return;
    var button = document.getElementById("likeButton");
    if (!button) return;
    var state = stateFor(activeWork.id);
    button.classList.toggle("is-liked", state.liked);
    button.setAttribute("aria-pressed", String(state.liked));
    button.innerHTML = '♡ <strong>' + (state.liked ? 'いいね済み' : 'いいね') + '</strong><span>' + state.likeCount + '</span>' + (state.syncing ? '<small>保存中</small>' : '');
  }

  function moveGallery(direction) {
    var gallery = document.getElementById("workGallery");
    gallery.scrollBy({ left: direction * gallery.clientWidth * 0.86, behavior: "smooth" });
  }

  function updateGalleryCounter() {
    var gallery = document.getElementById("workGallery");
    var items = Array.from(gallery.querySelectorAll("[data-gallery-item]"));
    if (!items.length) return;
    var nearest = items.reduce(function (best, item, index) {
      var distance = Math.abs(item.offsetLeft - gallery.scrollLeft);
      return distance < best.distance ? { index: index, distance: distance } : best;
    }, { index: 0, distance: Infinity });
    document.getElementById("galleryCounter").textContent = (nearest.index + 1) + " / " + items.length;
  }

  function toggleAreaMap(event) {
    var button = event.currentTarget;
    var panel = document.getElementById("areaMapPanel");
    var expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.textContent = expanded ? "周辺図を表示する" : "周辺図を閉じる";
    panel.hidden = expanded;
  }

  function openWork(workId) {
    activeWork = store.works.find(function (work) { return work.id === workId; });
    if (!activeWork) return;
    stopSpeech();
    renderDialog();
    dialog.showModal();
  }

  function toggleSpeech(event) {
    var button = event.currentTarget;
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
      speechPausedAt = Date.now();
      button.textContent = "▶";
      button.setAttribute("aria-label", "朗読を再開");
      return;
    }
    if (speechSynthesis.paused && speech) {
      speechSynthesis.resume();
      speechPausedTotal += Date.now() - speechPausedAt;
      button.textContent = "❚❚";
      button.setAttribute("aria-label", "朗読を一時停止");
      return;
    }
    stopSpeech();
    speech = new SpeechSynthesisUtterance(activeWork.script.join("。\n"));
    speech.lang = "ja-JP";
    speech.rate = 0.92;
    speechDuration = estimateSpeechDuration();
    speechStartedAt = Date.now();
    speechPausedTotal = 0;
    speech.onend = function () { finishSpeechPlayer(); };
    speech.onerror = function () { finishSpeechPlayer(); };
    speechSynthesis.speak(speech);
    button.textContent = "❚❚";
    button.setAttribute("aria-label", "朗読を一時停止");
    speechTimer = setInterval(updateSpeechPlayer, 250);
  }

  function estimateSpeechDuration() {
    if (!activeWork) return 0;
    return Math.max(1, Math.round(activeWork.script.join("").length / 5.5));
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Math.round(Number(seconds) || 0));
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  }

  function updateSpeechPlayer() {
    var progress = document.getElementById("audioProgress");
    var current = document.getElementById("audioCurrent");
    if (!progress || !current || !speechStartedAt) return;
    var pausedNow = speechSynthesis.paused && speechPausedAt ? Date.now() - speechPausedAt : 0;
    var elapsed = Math.min(speechDuration, (Date.now() - speechStartedAt - speechPausedTotal - pausedNow) / 1000);
    progress.value = speechDuration ? elapsed / speechDuration * 100 : 0;
    current.textContent = formatTime(elapsed);
  }

  function finishSpeechPlayer() {
    if (speechTimer) clearInterval(speechTimer);
    speechTimer = null;
    speech = null;
    var button = document.getElementById("listenButton");
    var progress = document.getElementById("audioProgress");
    var current = document.getElementById("audioCurrent");
    if (button) { button.textContent = "▶"; button.setAttribute("aria-label", "朗読を再生"); }
    if (progress) progress.value = 0;
    if (current) current.textContent = "0:00";
  }

  function stopSpeech() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    if (speechTimer) clearInterval(speechTimer);
    speechTimer = null;
    speech = null;
    speechStartedAt = 0;
    speechPausedAt = 0;
    speechPausedTotal = 0;
  }

  function post(values) {
    if (!api) return Promise.reject(new Error("投稿受付の準備中です"));
    values.visitorId = visitorId;
    return fetch(api, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(values)
    });
  }

  function toggleLike() {
    var workId = activeWork.id;
    var state = stateFor(activeWork.id);
    var previousOverride = likeOverrides[workId];
    likeOverrides[workId] = { liked: !state.liked, changedAt: Date.now() };
    saveLikeOverrides();
    updateDialogReactionState();
    renderWorks();
    post({ action: "toggleLike", workId: workId }).then(function () {
      setTimeout(loadRemote, 1200);
      setTimeout(loadRemote, 3500);
    }).catch(function () {
      if (previousOverride) likeOverrides[workId] = previousOverride;
      else delete likeOverrides[workId];
      saveLikeOverrides();
      updateDialogReactionState();
      renderWorks();
    });
  }

  function openCommentForm() {
    document.getElementById("commentWorkTitle").textContent = activeWork.title;
    document.getElementById("commentForm").reset();
    clearCommentPhotoPreview();
    document.getElementById("commentStatus").textContent = "";
    commentDialog.showModal();
  }

  function readLocalSubmissions() {
    try { return JSON.parse(localStorage.getItem(localKey) || "[]"); } catch (error) { return []; }
  }

  function writeLocalSubmission(record) {
    var records = readLocalSubmissions();
    var index = records.findIndex(function (item) { return item.id === record.id; });
    if (index >= 0) records[index] = Object.assign({}, records[index], record);
    else records.unshift(record);
    localStorage.setItem(localKey, JSON.stringify(records.slice(0, 100)));
    renderMySubmissions();
  }

  function readDeletedSubmissions() {
    try { return JSON.parse(localStorage.getItem(deletedKey) || "{}"); } catch (error) { return {}; }
  }

  function removeLocalSubmission(id) {
    var records = readLocalSubmissions().filter(function (item) { return item.id !== id; });
    localStorage.setItem(localKey, JSON.stringify(records));
    var deleted = readDeletedSubmissions();
    deleted[id] = Date.now();
    localStorage.setItem(deletedKey, JSON.stringify(deleted));
    for (var index = 0; index < 5; index++) delete photoPreviewCache[photoCacheKey(id, index)];
    openPhotoDb().then(function (db) {
      if (!db) return;
      var transaction = db.transaction("photoPreviews", "readwrite");
      for (var index = 0; index < 5; index++) transaction.objectStore("photoPreviews").delete(photoCacheKey(id, index));
    });
    renderMySubmissions();
  }

  function mySubmissions() {
    var combined = readLocalSubmissions();
    var deleted = readDeletedSubmissions();
    var fromRemote = remote.submissions || remote.mine || [];
    fromRemote.filter(function (item) { return !item.storeId || item.storeId === store.id; }).forEach(function (item) {
      var normalized = Object.assign({}, item, { id: item.id || item.submissionId });
      var index = combined.findIndex(function (localItem) { return localItem.id === normalized.id; });
      if (index >= 0) combined[index] = Object.assign({}, combined[index], normalized);
      else combined.push(normalized);
    });
    return combined.filter(function (item) { return item.storeId === store.id && !deleted[item.id]; }).sort(function (a, b) {
      return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
    });
  }

  function parseArrayValue(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    try {
      var parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) { return []; }
  }

  function submissionPhotoIds(item) {
    var ids = parseArrayValue(item && (item.photoIds || item.photo_ids));
    if (!ids.length && item && item.photoId) ids = [item.photoId];
    return ids;
  }

  function submissionPhotoNames(item) {
    var names = parseArrayValue(item && (item.photoNames || item.photo_names));
    if (!names.length && item && item.photoName) names = [item.photoName];
    return names;
  }

  function renderMySubmissions() {
    var node = document.getElementById("mySubmissionList");
    var submissions = mySubmissions();
    if (!submissions.length) {
      node.innerHTML = '<div class="empty-card"><strong>まだ投稿・コメントはありません</strong><p>「投稿する」または作品の「コメントする」から送った内容がここに並びます。</p></div>';
      return;
    }
    node.innerHTML = submissions.map(function (item) {
      var isComment = item.type === "comment";
      var title = isComment ? (item.workTitle || "作品へのコメント") : (item.placeLabel || "場所の投稿");
      var photoSlot = submissionPhotoIds(item).length || submissionPhotoNames(item).length ? '<span class="my-submission-thumb" data-photo-slot="' + escapeHtml(item.id) + '" hidden></span>' : '';
      return '<button class="my-submission-card" type="button" data-submission-id="' + escapeHtml(item.id) + '">' + photoSlot + '<span class="submission-type">' + (isComment ? "作品へのコメント" : "場所の投稿") + '</span><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(item.body) + '</p><small>' + escapeHtml(formatDate(item.updatedAt || item.createdAt)) + '</small><span class="work-arrow" aria-hidden="true">↗</span></button>';
    }).join("");
    hydrateSubmissionThumbnails(submissions);
  }

  function openPhotoDb() {
    if (photoDbPromise) return photoDbPromise;
    if (!("indexedDB" in window)) return Promise.resolve(null);
    photoDbPromise = new Promise(function (resolve) {
      var request = indexedDB.open("plantshop_laundry_theater", 1);
      request.onupgradeneeded = function () {
        if (!request.result.objectStoreNames.contains("photoPreviews")) request.result.createObjectStore("photoPreviews", { keyPath: "id" });
      };
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { resolve(null); };
    });
    return photoDbPromise;
  }

  function photoCacheKey(id, index) {
    return id + "::" + (Number(index) || 0);
  }

  function cachePhotoPreview(id, index, dataUrl) {
    if (!id || !dataUrl) return Promise.resolve();
    var key = photoCacheKey(id, index);
    photoPreviewCache[key] = dataUrl;
    return openPhotoDb().then(function (db) {
      if (!db) return;
      return new Promise(function (resolve) {
        var transaction = db.transaction("photoPreviews", "readwrite");
        transaction.objectStore("photoPreviews").put({ id: key, dataUrl: dataUrl, updatedAt: Date.now() });
        transaction.oncomplete = function () { resolve(); };
        transaction.onerror = function () { resolve(); };
      });
    });
  }

  function getCachedPhotoPreview(id, index) {
    var key = photoCacheKey(id, index);
    if (photoPreviewCache[key]) return Promise.resolve(photoPreviewCache[key]);
    return openPhotoDb().then(function (db) {
      if (!db) return "";
      return new Promise(function (resolve) {
        var request = db.transaction("photoPreviews", "readonly").objectStore("photoPreviews").get(key);
        request.onsuccess = function () {
          var value = request.result && request.result.dataUrl || "";
          if (value) photoPreviewCache[key] = value;
          resolve(value);
        };
        request.onerror = function () { resolve(""); };
      });
    });
  }

  function setPhotoNode(node, dataUrl, altText) {
    if (!node || !dataUrl) return;
    node.hidden = false;
    node.innerHTML = '<img src="' + dataUrl + '" alt="' + escapeHtml(altText) + '">';
  }

  function hydrateSubmissionThumbnails(submissions) {
    submissions.forEach(function (item) {
      if (!submissionPhotoIds(item).length && !submissionPhotoNames(item).length) return;
      getCachedPhotoPreview(item.id, 0).then(function (dataUrl) {
        if (!dataUrl) return;
        var slot = Array.from(document.querySelectorAll("[data-photo-slot]")).find(function (node) { return node.dataset.photoSlot === item.id; });
        setPhotoNode(slot, dataUrl, "投稿写真");
      });
    });
  }

  function formatDate(value) {
    if (!value) return "送信済み";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });
  }

  function filePayload(file) {
    if (!file || !file.name || !file.size) return Promise.resolve({ photoData: "", photoName: "", photoType: "", photoPreview: "" });
    if (!file.type.match(/^image\//)) return Promise.reject(new Error("写真ファイルを選んでください。"));
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("写真を読み込めませんでした。")); };
      reader.onload = function () {
        var image = new Image();
        image.onerror = function () { reject(new Error("写真を読み込めませんでした。")); };
        image.onload = function () {
          var scale = Math.min(1, 1280 / Math.max(image.width, image.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          var dataUrl = canvas.toDataURL("image/jpeg", 0.76);
          var thumbScale = Math.min(1, 420 / Math.max(image.width, image.height));
          var thumb = document.createElement("canvas");
          thumb.width = Math.max(1, Math.round(image.width * thumbScale));
          thumb.height = Math.max(1, Math.round(image.height * thumbScale));
          thumb.getContext("2d").drawImage(image, 0, 0, thumb.width, thumb.height);
          resolve({ photoData: dataUrl.split(",")[1], photoName: file.name.replace(/\.[^.]+$/, "") + ".jpg", photoType: "image/jpeg", photoPreview: thumb.toDataURL("image/jpeg", 0.7) });
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function filePayloads(files) {
    var selected = Array.from(files || []).filter(function (file) { return file && file.name && file.size; });
    if (selected.length > 5) return Promise.reject(new Error("写真は5枚まで選択できます。"));
    return Promise.all(selected.map(filePayload));
  }

  function bindPhotoPreview(input, preview, altText) {
    var objectUrls = [];
    var selectedFiles = [];

    function clearPreview() {
      objectUrls.forEach(function (url) { URL.revokeObjectURL(url); });
      objectUrls = [];
      selectedFiles = [];
      input.value = "";
      preview.replaceChildren();
      preview.hidden = true;
    }

    function syncInputFiles() {
      if (!("DataTransfer" in window)) return;
      var transfer = new DataTransfer();
      selectedFiles.forEach(function (file) { transfer.items.add(file); });
      input.files = transfer.files;
    }

    function renderPreview() {
      objectUrls.forEach(function (url) { URL.revokeObjectURL(url); });
      objectUrls = [];
      if (!selectedFiles.length) {
        preview.replaceChildren();
        preview.hidden = true;
        return;
      }
      preview.innerHTML = selectedFiles.map(function (file, index) {
        var url = URL.createObjectURL(file);
        objectUrls.push(url);
        return '<figure><img src="' + url + '" alt="' + escapeHtml(altText + " " + (index + 1)) + '"><figcaption>' + escapeHtml(file.name) + '</figcaption><button class="photo-remove" type="button" data-remove-photo="' + index + '" aria-label="' + escapeHtml(file.name + "を削除") + '">削除</button></figure>';
      }).join("");
      preview.hidden = false;
    }

    input.addEventListener("change", function () {
      var incoming = Array.from(input.files || []);
      var files = selectedFiles.concat(incoming.filter(function (file) {
        return !selectedFiles.some(function (selected) { return selected.name === file.name && selected.size === file.size && selected.lastModified === file.lastModified; });
      }));
      if (files.length > 5) {
        preview.innerHTML = '<p>写真は5枚まで選択できます。</p>';
        preview.hidden = false;
        input.value = "";
        return;
      }
      if (files.some(function (file) { return !file.type.match(/^image\//); })) {
        preview.innerHTML = '<p>写真ファイルを選んでください。</p>';
        preview.hidden = false;
        return;
      }
      selectedFiles = files;
      syncInputFiles();
      renderPreview();
    });

    preview.addEventListener("click", function (event) {
      var button = event.target.closest("[data-remove-photo]");
      if (!button) return;
      selectedFiles.splice(Number(button.dataset.removePhoto), 1);
      syncInputFiles();
      renderPreview();
    });

    return clearPreview;
  }

  var clearSubmissionPhotoPreview = bindPhotoPreview(form.elements.photo, document.getElementById("submissionPhotoPreview"), "投稿する写真のプレビュー");
  var clearCommentPhotoPreview = bindPhotoPreview(document.getElementById("commentForm").elements.photo, document.getElementById("commentPhotoPreview"), "コメントに添える写真のプレビュー");
  var clearEditPhotoPreview = bindPhotoPreview(editForm.elements.photo, document.getElementById("editPhotoPreview"), "変更後の写真のプレビュー");

  function submitRecord(options) {
    return filePayloads(options.files).then(function (photos) {
      var firstPhoto = photos[0] || { photoData: "", photoName: "", photoType: "" };
      var values = Object.assign({
        action: options.action || "addSubmission",
        submissionId: options.id,
        submissionType: options.type,
        storeId: store.id,
        workId: options.workId || "",
        workTitle: options.workTitle || "",
        placeLabel: options.placeLabel || "",
        body: options.body,
        locationUnknown: String(Boolean(options.locationUnknown)),
        latitude: options.latitude || "",
        longitude: options.longitude || "",
        photosJson: JSON.stringify(photos.map(function (photo) { return { data: photo.photoData, name: photo.photoName, type: photo.photoType }; })),
        photoData: firstPhoto.photoData,
        photoName: firstPhoto.photoName,
        photoType: firstPhoto.photoType,
        website: options.website || ""
      }, options.keepPhotoIds && options.keepPhotoIds.length ? { keepPhotoIds: JSON.stringify(options.keepPhotoIds), keepPhotoId: options.keepPhotoIds[0] } : {});
      return post(values).then(function () {
        var now = new Date().toISOString();
        var existing = options.existing || {};
        var record = Object.assign({}, existing, {
          id: options.id,
          type: options.type,
          storeId: store.id,
          workId: options.workId || "",
          workTitle: options.workTitle || "",
          placeLabel: options.placeLabel || "",
          body: options.body,
          locationUnknown: Boolean(options.locationUnknown),
          latitude: options.latitude || "",
          longitude: options.longitude || "",
          photoNames: photos.length ? photos.map(function (photo) { return photo.photoName; }) : submissionPhotoNames(existing),
          photoIds: photos.length ? photos.map(function () { return "pending"; }) : submissionPhotoIds(existing),
          photoName: photos.length ? firstPhoto.photoName : (existing.photoName || ""),
          photoId: photos.length ? "pending" : (existing.photoId || ""),
          createdAt: existing.createdAt || now,
          updatedAt: now
        });
        return Promise.all(photos.map(function (photo, index) { return cachePhotoPreview(options.id, index, photo.photoPreview); })).then(function () {
          writeLocalSubmission(record);
          return record;
        });
      });
    });
  }

  function positionFromEvent(event, mapElement) {
    var rect = mapElement.getBoundingClientRect();
    var x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    var y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    return { x: x, y: y, latitude: store.center.lat + (0.5 - y) * 0.02, longitude: store.center.lng + (x - 0.5) * 0.03 };
  }

  function pointFromCoordinates(latitude, longitude) {
    if (latitude == null || longitude == null || String(latitude).trim() === "" || String(longitude).trim() === "") return null;
    var lat = Number(latitude);
    var lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      x: Math.max(0, Math.min(1, 0.5 + (lng - store.center.lng) / 0.03)),
      y: Math.max(0, Math.min(1, 0.5 - (lat - store.center.lat) / 0.02)),
      latitude: lat,
      longitude: lng
    };
  }

  function locationIsUnknown(value) {
    return value === true || String(value).toLowerCase() === "true";
  }

  function renderSubmissionMap() {
    submitMap.innerHTML = mapScenery() + (selectedPoint && !unknown.checked ? '<span class="submission-pin" style="--x:' + (selectedPoint.x * 100) + '%;--y:' + (selectedPoint.y * 100) + '%">＋</span>' : '<span class="map-help">地図上の場所を押してください</span>');
    document.getElementById("selectedLocation").textContent = unknown.checked ? "場所の名前を入力してください。" : (selectedPoint ? "地図上の場所を選びました。" : "場所はまだ選ばれていません。");
  }

  function renderEditMap() {
    editMap.innerHTML = mapScenery() + (editPoint && !editUnknown.checked ? '<span class="submission-pin" style="--x:' + (editPoint.x * 100) + '%;--y:' + (editPoint.y * 100) + '%">＋</span>' : '<span class="map-help">地図上の場所を押してください</span>');
    document.getElementById("editSelectedLocation").textContent = editUnknown.checked ? "場所の名前で記録されています。" : (editPoint ? "現在の投稿場所です。地図を押すと変更できます。" : "場所はまだ選ばれていません。");
  }

  function setMode(mode) {
    document.querySelectorAll("[data-mode]").forEach(function (button) {
      var active = button.dataset.mode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll("[data-panel]").forEach(function (panel) {
      var active = panel.dataset.panel === mode;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    if (mode === "mine") renderMySubmissions();
    var panel = document.querySelector('[data-panel="' + mode + '"]');
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openEditForm(id) {
    activeSubmission = mySubmissions().find(function (item) { return item.id === id; });
    if (!activeSubmission) return;
    editForm.reset();
    clearEditPhotoPreview();
    editForm.elements.placeLabel.value = activeSubmission.placeLabel || "";
    editForm.elements.body.value = activeSubmission.body || "";
    editForm.elements.consent.checked = false;
    var isComment = activeSubmission.type === "comment";
    document.getElementById("editPlaceField").hidden = isComment;
    document.getElementById("editLocationFields").hidden = isComment;
    document.getElementById("editTypeLabel").textContent = isComment ? "「" + (activeSubmission.workTitle || "作品") + "」へのコメント" : "場所の投稿";
    editUnknown.checked = locationIsUnknown(activeSubmission.locationUnknown);
    editPoint = isComment || editUnknown.checked ? null : pointFromCoordinates(activeSubmission.latitude, activeSubmission.longitude);
    if (!isComment) renderEditMap();
    var currentPhotoNode = document.getElementById("currentPhoto");
    var photoIds = submissionPhotoIds(activeSubmission);
    currentPhotoNode.innerHTML = photoIds.length ? '<p>写真を読み込んでいます…</p>' : "";
    document.getElementById("editStatus").textContent = "";
    editDialog.showModal();
    if (photoIds.length) {
      Promise.all(photoIds.map(function (_, index) { return getCachedPhotoPreview(activeSubmission.id, index); })).then(function (dataUrls) {
        var available = dataUrls.filter(Boolean);
        if (available.length) renderCurrentPhotos(currentPhotoNode, available);
        else if (photoIds.every(function (id) { return id === "pending"; })) currentPhotoNode.innerHTML = '<p>写真を保存しています…</p>';
        else loadSubmissionDetails(activeSubmission.id);
      });
    }
  }

  function renderCurrentPhotos(node, dataUrls) {
    if (!node) return;
    node.innerHTML = '<div class="current-photo-grid">' + dataUrls.map(function (dataUrl, index) { return '<img src="' + dataUrl + '" alt="現在の写真 ' + (index + 1) + '">'; }).join("") + '</div>';
  }

  function loadSubmissionDetails(submissionId) {
    if (!api) return;
    var callback = "laundrySubmissionCallback_" + Date.now();
    var script = document.createElement("script");
    window[callback] = function (payload) {
      var photoNode = document.getElementById("currentPhoto");
      if (payload && payload.ok && payload.submission) {
        var detail = payload.submission;
        var photos = detail.photos && detail.photos.length ? detail.photos : (detail.photoData ? [{ data: detail.photoData, type: detail.photoType || "image/jpeg" }] : []);
        var dataUrls = photos.map(function (photo) { return "data:" + escapeHtml(photo.type || "image/jpeg") + ";base64," + photo.data; });
        if (dataUrls.length) {
          renderCurrentPhotos(photoNode, dataUrls);
          dataUrls.forEach(function (dataUrl, index) { cachePhotoPreview(submissionId, index, dataUrl); });
        } else photoNode.innerHTML = '<p>写真を読み込めませんでした。</p>';
      } else if (photoNode) {
        photoNode.innerHTML = '<p>写真を読み込めませんでした。</p>';
      }
      delete window[callback];
      script.remove();
    };
    script.src = api + "?action=submission&visitorId=" + encodeURIComponent(visitorId) + "&submissionId=" + encodeURIComponent(submissionId) + "&callback=" + callback;
    script.onerror = function () {
      var photoNode = document.getElementById("currentPhoto");
      if (photoNode) photoNode.innerHTML = '<p>写真を読み込めませんでした。</p>';
      delete window[callback];
      script.remove();
    };
    document.head.appendChild(script);
  }

  function loadRemote() {
    if (!api) return Promise.resolve(false);
    return new Promise(function (resolve) {
    var callback = "laundryCallback_" + Date.now();
    var script = document.createElement("script");
    window[callback] = function (payload) {
      if (payload && payload.ok) {
        remote = payload;
        remoteLoaded = true;
        remote.works = remote.works || {};
        remote.submissions = remote.submissions || remote.mine || [];
        reconcileLikeOverrides();
        renderWorks();
        renderMySubmissions();
        if (dialog.open) updateDialogReactionState();
      }
      delete window[callback];
      script.remove();
      resolve(Boolean(payload && payload.ok));
    };
    script.src = api + "?action=snapshot&visitorId=" + encodeURIComponent(visitorId) + "&storeId=" + encodeURIComponent(store.id) + "&callback=" + callback;
    script.onerror = function () { delete window[callback]; script.remove(); resolve(false); };
    document.head.appendChild(script);
    });
  }

  submitMap.addEventListener("click", function (event) {
    if (unknown.checked) return;
    selectedPoint = positionFromEvent(event, submitMap);
    renderSubmissionMap();
  });
  unknown.addEventListener("change", renderSubmissionMap);
  editMap.addEventListener("click", function (event) {
    if (editUnknown.checked) return;
    editPoint = positionFromEvent(event, editMap);
    renderEditMap();
  });
  editUnknown.addEventListener("change", renderEditMap);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var values = new FormData(form);
    if (!unknown.checked && !selectedPoint) {
      formStatus.textContent = "地図上の場所を選ぶか、「地図では場所がわからない」を選んでください。";
      return;
    }
    formStatus.textContent = "投稿しています…";
    submitRecord({
      id: makeId(), type: "place", placeLabel: values.get("placeLabel"), body: values.get("body"),
      locationUnknown: unknown.checked, latitude: selectedPoint ? selectedPoint.latitude : "", longitude: selectedPoint ? selectedPoint.longitude : "",
      files: values.getAll("photo"), website: values.get("website")
    }).then(function () {
      form.reset();
      clearSubmissionPhotoPreview();
      selectedPoint = null;
      renderSubmissionMap();
      formStatus.textContent = "投稿を受け付けました。";
      setTimeout(loadRemote, 700);
    }).catch(function (error) { formStatus.textContent = error.message; });
  });

  document.getElementById("commentForm").addEventListener("submit", function (event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity() || !activeWork) return;
    var values = new FormData(event.currentTarget);
    var status = document.getElementById("commentStatus");
    status.textContent = "投稿しています…";
    submitRecord({ id: makeId(), type: "comment", workId: activeWork.id, workTitle: activeWork.title, body: values.get("body"), files: values.getAll("photo") }).then(function () {
      event.target.reset();
      clearCommentPhotoPreview();
      status.textContent = "投稿を受け付けました。";
      setTimeout(loadRemote, 700);
      setTimeout(function () { commentDialog.close(); }, 650);
    }).catch(function (error) { status.textContent = error.message; });
  });

  editForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity() || !activeSubmission) return;
    var values = new FormData(event.currentTarget);
    var status = document.getElementById("editStatus");
    if (activeSubmission.type !== "comment" && !editUnknown.checked && !editPoint) {
      status.textContent = "地図上の場所を選ぶか、「地図では場所がわからない」を選んでください。";
      return;
    }
    status.textContent = "修正を保存しています…";
    submitRecord({
      action: "updateSubmission", id: activeSubmission.id, type: activeSubmission.type,
      workId: activeSubmission.workId, workTitle: activeSubmission.workTitle,
      placeLabel: activeSubmission.type === "comment" ? "" : values.get("placeLabel"), body: values.get("body"),
      locationUnknown: activeSubmission.type === "comment" ? activeSubmission.locationUnknown : editUnknown.checked,
      latitude: activeSubmission.type === "comment" ? activeSubmission.latitude : (editPoint ? editPoint.latitude : ""),
      longitude: activeSubmission.type === "comment" ? activeSubmission.longitude : (editPoint ? editPoint.longitude : ""),
      files: values.getAll("photo"), keepPhotoIds: submissionPhotoIds(activeSubmission), existing: activeSubmission
    }).then(function (record) {
      activeSubmission = record;
      status.textContent = "修正を保存しました。";
      setTimeout(loadRemote, 700);
      setTimeout(function () { editDialog.close(); }, 650);
    }).catch(function (error) { status.textContent = error.message; });
  });

  document.getElementById("deleteSubmissionButton").addEventListener("click", function (event) {
    if (!activeSubmission) return;
    var item = activeSubmission;
    var label = item.type === "comment" ? "コメント" : "投稿";
    if (!window.confirm("この" + label + "を削除しますか？\n削除すると元に戻せません。")) return;
    var button = event.currentTarget;
    var status = document.getElementById("editStatus");
    button.disabled = true;
    status.textContent = "削除しています…";
    post({ action: "deleteSubmission", submissionId: item.id }).then(function () {
      removeLocalSubmission(item.id);
      activeSubmission = null;
      status.textContent = "削除しました。";
      setTimeout(loadRemote, 700);
      setTimeout(function () { editDialog.close(); button.disabled = false; }, 500);
    }).catch(function (error) {
      status.textContent = error.message;
      button.disabled = false;
    });
  });

  document.querySelectorAll("[data-mode]").forEach(function (button) {
    button.addEventListener("click", function () { setMode(button.dataset.mode); });
  });
  document.getElementById("works").addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-work-id]");
    if (trigger) openWork(trigger.dataset.workId);
  });
  document.getElementById("mySubmissionList").addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-submission-id]");
    if (trigger) openEditForm(trigger.dataset.submissionId);
  });
  document.getElementById("dialogClose").addEventListener("click", function () { stopSpeech(); dialog.close(); });
  document.querySelectorAll("[data-close-dialog]").forEach(function (button) {
    button.addEventListener("click", function () { document.getElementById(button.dataset.closeDialog).close(); });
  });
  [dialog, commentDialog, editDialog].forEach(function (item) {
    item.addEventListener("click", function (event) { if (event.target === item) { if (item === dialog) stopSpeech(); item.close(); } });
  });
  editDialog.addEventListener("close", clearEditPhotoPreview);
  commentDialog.addEventListener("close", clearCommentPhotoPreview);
  document.getElementById("likedFilter").addEventListener("click", function (event) {
    likedOnly = !likedOnly;
    event.currentTarget.setAttribute("aria-pressed", likedOnly);
    event.currentTarget.textContent = likedOnly ? "すべての作品を表示" : "「いいね」した作品を表示";
    renderWorks();
  });

  document.title = store.name + "｜ランドリーシアター";
  document.getElementById("headerStoreName").textContent = store.name;
  document.getElementById("storeTitle").textContent = store.name;
  renderWorks();
  renderSubmissionMap();
  renderMySubmissions();
  loadRemote();
  setInterval(function () { if (!document.hidden) loadRemote(); }, 10000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) loadRemote(); });
})();
