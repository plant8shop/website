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
  var remote = { works: {}, submissions: [] };
  var likedOnly = false;
  var selectedPoint = null;
  var activeWork = null;
  var activeSubmission = null;
  var speech = null;
  var mapNode = document.getElementById("mapCanvas");
  var listNode = document.getElementById("workList");
  var countNode = document.getElementById("workCount");
  var dialog = document.getElementById("workDialog");
  var dialogContent = document.getElementById("dialogContent");
  var commentDialog = document.getElementById("commentDialog");
  var editDialog = document.getElementById("editDialog");
  var submitMap = document.getElementById("submissionMap");
  var unknown = document.getElementById("locationUnknown");
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
    return remote.works[workId] || { likeCount: 0, liked: false };
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
    dialogContent.innerHTML = '<p class="dialog-index">STORE ' + escapeHtml(store.index) + ' / WORK ' + escapeHtml(activeWork.number) + '</p><h2 id="dialogTitle">' + escapeHtml(activeWork.title) + '</h2><p class="dialog-place">' + escapeHtml(activeWork.place) + '</p><div class="dialog-photo" role="img" aria-label="' + escapeHtml(activeWork.imageLabel) + '"><span>' + escapeHtml(activeWork.imageLabel) + '</span></div><p class="dialog-summary">' + escapeHtml(activeWork.summary) + '</p><div class="listen-row"><button id="listenButton" class="button button-primary" type="button">仮朗読を再生</button><span>ブラウザの音声で試聴します</span></div><div class="script"><h3>短い戯曲</h3>' + activeWork.script.map(function (paragraph) { return '<p>' + escapeHtml(paragraph) + '</p>'; }).join("") + '</div><section class="reactions"><button id="likeButton" class="like-button' + (state.liked ? ' is-liked' : '') + '" type="button" aria-pressed="' + state.liked + '">♡ <strong>' + (state.liked ? 'いいね済み' : 'いいね') + '</strong><span>' + state.likeCount + '</span></button><button id="commentButton" class="button" type="button">コメントする</button></section>';
    document.getElementById("listenButton").addEventListener("click", toggleSpeech);
    document.getElementById("likeButton").addEventListener("click", toggleLike);
    document.getElementById("commentButton").addEventListener("click", openCommentForm);
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
    if (speechSynthesis.speaking) {
      stopSpeech();
      button.textContent = "仮朗読を再生";
      return;
    }
    speech = new SpeechSynthesisUtterance(activeWork.script.join("。\n"));
    speech.lang = "ja-JP";
    speech.rate = 0.92;
    speech.onend = function () { if (button.isConnected) button.textContent = "仮朗読を再生"; };
    speechSynthesis.speak(speech);
    button.textContent = "朗読を停止";
  }

  function stopSpeech() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    speech = null;
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
    var state = stateFor(activeWork.id);
    state.liked = !state.liked;
    state.likeCount += state.liked ? 1 : -1;
    renderDialog();
    renderWorks();
    post({ action: "toggleLike", workId: activeWork.id }).then(function () {
      setTimeout(loadRemote, 700);
    }).catch(function () {
      state.liked = !state.liked;
      state.likeCount += state.liked ? 1 : -1;
      renderDialog();
      renderWorks();
    });
  }

  function openCommentForm() {
    document.getElementById("commentWorkTitle").textContent = activeWork.title;
    document.getElementById("commentForm").reset();
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

  function mySubmissions() {
    var combined = readLocalSubmissions();
    var fromRemote = remote.submissions || remote.mine || [];
    fromRemote.filter(function (item) { return !item.storeId || item.storeId === store.id; }).forEach(function (item) {
      var normalized = Object.assign({}, item, { id: item.id || item.submissionId });
      var index = combined.findIndex(function (localItem) { return localItem.id === normalized.id; });
      if (index >= 0) combined[index] = Object.assign({}, combined[index], normalized);
      else combined.push(normalized);
    });
    return combined.filter(function (item) { return item.storeId === store.id; }).sort(function (a, b) {
      return String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || ""));
    });
  }

  function renderMySubmissions() {
    var node = document.getElementById("mySubmissionList");
    var submissions = mySubmissions();
    if (!submissions.length) {
      node.innerHTML = '<div class="empty-card"><strong>まだ投稿はありません</strong><p>「投稿する」または作品の「コメントする」から送った内容がここに並びます。</p></div>';
      return;
    }
    node.innerHTML = submissions.map(function (item) {
      var isComment = item.type === "comment";
      var title = isComment ? (item.workTitle || "作品へのコメント") : (item.placeLabel || "場所の投稿");
      return '<button class="my-submission-card" type="button" data-submission-id="' + escapeHtml(item.id) + '"><span class="submission-type">' + (isComment ? "作品へのコメント" : "場所の投稿") + '</span><strong>' + escapeHtml(title) + '</strong><p>' + escapeHtml(item.body) + '</p><small>' + escapeHtml(formatDate(item.updatedAt || item.createdAt)) + '</small><span class="work-arrow" aria-hidden="true">↗</span></button>';
    }).join("");
  }

  function formatDate(value) {
    if (!value) return "送信済み";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("ja-JP", { year: "numeric", month: "numeric", day: "numeric" });
  }

  function filePayload(file) {
    if (!file) return Promise.resolve({ photoData: "", photoName: "", photoType: "" });
    if (!file.type.match(/^image\//)) return Promise.reject(new Error("写真ファイルを選んでください。"));
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("写真を読み込めませんでした。")); };
      reader.onload = function () {
        var image = new Image();
        image.onerror = function () { reject(new Error("写真を読み込めませんでした。")); };
        image.onload = function () {
          var scale = Math.min(1, 1600 / Math.max(image.width, image.height));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          var dataUrl = canvas.toDataURL("image/jpeg", 0.82);
          resolve({ photoData: dataUrl.split(",")[1], photoName: file.name.replace(/\.[^.]+$/, "") + ".jpg", photoType: "image/jpeg" });
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function bindPhotoPreview(input, preview, altText) {
    var objectUrl = "";

    function clearPreview() {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      objectUrl = "";
      preview.replaceChildren();
      preview.hidden = true;
    }

    input.addEventListener("change", function () {
      clearPreview();
      var file = input.files && input.files[0];
      if (!file) return;
      if (!file.type.match(/^image\//)) {
        preview.innerHTML = '<p>写真ファイルを選んでください。</p>';
        preview.hidden = false;
        return;
      }
      objectUrl = URL.createObjectURL(file);
      preview.innerHTML = '<img src="' + objectUrl + '" alt="' + escapeHtml(altText) + '"><p>' + escapeHtml(file.name) + '</p>';
      preview.hidden = false;
    });

    return clearPreview;
  }

  var clearSubmissionPhotoPreview = bindPhotoPreview(form.elements.photo, document.getElementById("submissionPhotoPreview"), "投稿する写真のプレビュー");
  var clearEditPhotoPreview = bindPhotoPreview(editForm.elements.photo, document.getElementById("editPhotoPreview"), "変更後の写真のプレビュー");

  function submitRecord(options) {
    return filePayload(options.file).then(function (photo) {
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
        photoData: photo.photoData,
        photoName: photo.photoName,
        photoType: photo.photoType,
        website: options.website || ""
      }, options.keepPhotoId ? { keepPhotoId: options.keepPhotoId } : {});
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
          photoName: photo.photoName || existing.photoName || "",
          photoId: photo.photoData ? "pending" : (existing.photoId || ""),
          createdAt: existing.createdAt || now,
          updatedAt: now
        });
        writeLocalSubmission(record);
        return record;
      });
    });
  }

  function positionFromEvent(event) {
    var rect = submitMap.getBoundingClientRect();
    var x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    var y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    return { x: x, y: y, latitude: store.center.lat + (0.5 - y) * 0.02, longitude: store.center.lng + (x - 0.5) * 0.03 };
  }

  function renderSubmissionMap() {
    submitMap.innerHTML = mapScenery() + (selectedPoint && !unknown.checked ? '<span class="submission-pin" style="--x:' + (selectedPoint.x * 100) + '%;--y:' + (selectedPoint.y * 100) + '%">＋</span>' : '<span class="map-help">地図上の場所を押してください</span>');
    document.getElementById("selectedLocation").textContent = unknown.checked ? "場所の名前を入力してください。" : (selectedPoint ? "地図上の場所を選びました。" : "場所はまだ選ばれていません。");
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
    document.getElementById("editPlaceField").hidden = activeSubmission.type === "comment";
    document.getElementById("editTypeLabel").textContent = activeSubmission.type === "comment" ? "「" + (activeSubmission.workTitle || "作品") + "」へのコメント" : "場所の投稿";
    document.getElementById("currentPhoto").innerHTML = activeSubmission.photoId ? '<p>写真を読み込んでいます…</p>' : "";
    document.getElementById("editStatus").textContent = "";
    editDialog.showModal();
    if (activeSubmission.photoId) loadSubmissionDetails(activeSubmission.id);
  }

  function loadSubmissionDetails(submissionId) {
    if (!api) return;
    var callback = "laundrySubmissionCallback_" + Date.now();
    var script = document.createElement("script");
    window[callback] = function (payload) {
      var photoNode = document.getElementById("currentPhoto");
      if (payload && payload.ok && payload.submission && payload.submission.photoData) {
        var detail = payload.submission;
        photoNode.innerHTML = '<img src="data:' + escapeHtml(detail.photoType || "image/jpeg") + ';base64,' + detail.photoData + '" alt="現在の写真">';
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
    if (!api) return;
    var callback = "laundryCallback_" + Date.now();
    var script = document.createElement("script");
    window[callback] = function (payload) {
      if (payload && payload.ok) {
        remote = payload;
        remote.works = remote.works || {};
        remote.submissions = remote.submissions || remote.mine || [];
        renderWorks();
        renderMySubmissions();
        if (dialog.open) renderDialog();
      }
      delete window[callback];
      script.remove();
    };
    script.src = api + "?action=snapshot&visitorId=" + encodeURIComponent(visitorId) + "&storeId=" + encodeURIComponent(store.id) + "&callback=" + callback;
    script.onerror = function () { delete window[callback]; script.remove(); };
    document.head.appendChild(script);
  }

  submitMap.addEventListener("click", function (event) {
    if (unknown.checked) return;
    selectedPoint = positionFromEvent(event);
    renderSubmissionMap();
  });
  unknown.addEventListener("change", renderSubmissionMap);

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
      file: values.get("photo"), website: values.get("website")
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
    submitRecord({ id: makeId(), type: "comment", workId: activeWork.id, workTitle: activeWork.title, body: values.get("body"), file: values.get("photo") }).then(function () {
      event.target.reset();
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
    status.textContent = "修正を保存しています…";
    submitRecord({
      action: "updateSubmission", id: activeSubmission.id, type: activeSubmission.type,
      workId: activeSubmission.workId, workTitle: activeSubmission.workTitle,
      placeLabel: activeSubmission.type === "comment" ? "" : values.get("placeLabel"), body: values.get("body"),
      locationUnknown: activeSubmission.locationUnknown, latitude: activeSubmission.latitude, longitude: activeSubmission.longitude,
      file: values.get("photo"), keepPhotoId: activeSubmission.photoId, existing: activeSubmission
    }).then(function (record) {
      activeSubmission = record;
      status.textContent = "修正を保存しました。";
      setTimeout(loadRemote, 700);
      setTimeout(function () { editDialog.close(); }, 650);
    }).catch(function (error) { status.textContent = error.message; });
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
  document.getElementById("likedFilter").addEventListener("click", function (event) {
    likedOnly = !likedOnly;
    event.currentTarget.setAttribute("aria-pressed", likedOnly);
    event.currentTarget.textContent = likedOnly ? "すべての作品を表示" : "「いいね」した作品を表示";
    renderWorks();
  });

  document.title = store.name + "｜ランドリーシアター";
  document.getElementById("headerStoreName").textContent = store.name;
  document.getElementById("storeKicker").textContent = "STORE " + store.index + " / " + store.area;
  document.getElementById("storeTitle").textContent = store.name;
  document.getElementById("storeDescription").textContent = store.description;
  renderWorks();
  renderSubmissionMap();
  renderMySubmissions();
  loadRemote();
})();
