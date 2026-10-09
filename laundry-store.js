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
  var remote = { works: {} };
  var likedOnly = false;
  var selectedPoint = null;
  var activeWork = null;
  var speech = null;
  var mapNode = document.getElementById("mapCanvas");
  var listNode = document.getElementById("workList");
  var countNode = document.getElementById("workCount");
  var dialog = document.getElementById("workDialog");
  var dialogContent = document.getElementById("dialogContent");
  var submitMap = document.getElementById("submissionMap");
  var unknown = document.getElementById("locationUnknown");
  var form = document.getElementById("submissionForm");
  var formStatus = document.getElementById("formStatus");

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }
  function stateFor(workId) { return remote.works[workId] || { likeCount: 0, liked: false, comments: [] }; }
  function mapScenery() { return '<span class="map-road map-road-a"></span><span class="map-road map-road-b"></span><span class="map-road map-road-c"></span><span class="map-block map-block-a"></span><span class="map-block map-block-b"></span><span class="map-block map-block-c"></span><span class="map-shop"><i></i>現在の店舗</span>'; }

  function renderMap() {
    var markers = store.works.filter(visibleWork).map(function (work) {
      return '<button class="map-marker" type="button" data-work-id="' + escapeHtml(work.id) + '" style="--x:' + Number(work.x || 50) + '%;--y:' + Number(work.y || 50) + '%" aria-label="' + escapeHtml(work.title) + 'を開く"><span>' + escapeHtml(work.number) + '</span></button>';
    }).join("");
    mapNode.innerHTML = mapScenery() + markers + (store.works.length ? "" : '<p class="map-empty">作品の位置を準備しています。</p>');
  }
  function visibleWork(work) { return !likedOnly || stateFor(work.id).liked; }
  function renderWorks() {
    var works = store.works.filter(visibleWork);
    countNode.textContent = likedOnly ? works.length + "件の「いいね」した作品" : (works.length ? works.length + "作品" : "公開準備中です");
    if (!works.length) {
      listNode.innerHTML = '<div class="empty-card"><strong>' + (likedOnly ? "「いいね」した作品はまだありません" : "この店舗の作品は準備中です") + '</strong></div>';
      renderMap(); return;
    }
    listNode.innerHTML = works.map(function (work) {
      var state = stateFor(work.id);
      return '<button class="work-card" type="button" data-work-id="' + escapeHtml(work.id) + '"><span class="work-number">' + escapeHtml(work.number) + '</span><span class="work-card-main"><strong>' + escapeHtml(work.title) + '</strong><small>' + escapeHtml(work.place) + '</small></span><span class="work-reactions">♡ ' + state.likeCount + '<br>' + state.comments.length + ' コメント</span><span class="work-arrow" aria-hidden="true">↗</span></button>';
    }).join("");
    renderMap();
  }

  function renderDialog() {
    if (!activeWork) return;
    var state = stateFor(activeWork.id);
    dialogContent.innerHTML = '<p class="dialog-index">STORE ' + escapeHtml(store.index) + ' / WORK ' + escapeHtml(activeWork.number) + '</p><h2 id="dialogTitle">' + escapeHtml(activeWork.title) + '</h2><p class="dialog-place">' + escapeHtml(activeWork.place) + '</p><div class="dialog-photo" role="img" aria-label="' + escapeHtml(activeWork.imageLabel) + '"><span>' + escapeHtml(activeWork.imageLabel) + '</span></div><p class="dialog-summary">' + escapeHtml(activeWork.summary) + '</p><div class="listen-row"><button id="listenButton" class="button button-primary" type="button">仮朗読を再生</button><span>ブラウザの音声で試聴します</span></div><div class="script"><h3>短い戯曲</h3>' + activeWork.script.map(function (paragraph) { return '<p>' + escapeHtml(paragraph) + '</p>'; }).join("") + '</div>' +
      '<section class="reactions"><button id="likeButton" class="like-button' + (state.liked ? ' is-liked' : '') + '" type="button" aria-pressed="' + state.liked + '">♡ <strong>' + (state.liked ? 'いいね済み' : 'いいね') + '</strong><span>' + state.likeCount + '</span></button><div class="comments"><h3>コメント</h3><div class="comment-list">' + (state.comments.length ? state.comments.map(function (comment) { return '<p class="comment' + (comment.mine ? ' is-mine' : '') + '"><span>' + escapeHtml(comment.text) + '</span><small>' + (comment.mine ? 'あなたのコメント' : '匿名') + '</small></p>'; }).join("") : '<p class="comment-empty">まだコメントはありません。</p>') + '</div><form id="commentForm" class="comment-form"><label><span>コメントを残す</span><textarea name="comment" maxlength="500" rows="3" required></textarea></label><button class="button" type="submit">送信する</button><p id="commentStatus" class="form-status" role="status"></p></form></div></section>';
    document.getElementById("listenButton").addEventListener("click", toggleSpeech);
    document.getElementById("likeButton").addEventListener("click", toggleLike);
    document.getElementById("commentForm").addEventListener("submit", addComment);
  }
  function openWork(workId) {
    activeWork = store.works.find(function (work) { return work.id === workId; });
    if (!activeWork) return;
    stopSpeech(); renderDialog(); dialog.showModal();
  }
  function toggleSpeech(event) {
    var button = event.currentTarget;
    if (speechSynthesis.speaking) { stopSpeech(); button.textContent = "仮朗読を再生"; return; }
    speech = new SpeechSynthesisUtterance(activeWork.script.join("。\n")); speech.lang = "ja-JP"; speech.rate = 0.92;
    speech.onend = function () { if (button.isConnected) button.textContent = "仮朗読を再生"; };
    speechSynthesis.speak(speech); button.textContent = "朗読を停止";
  }
  function stopSpeech() { if ("speechSynthesis" in window) speechSynthesis.cancel(); speech = null; }

  function post(values) {
    if (!api) return Promise.reject(new Error("投稿受付の準備中です"));
    values.visitorId = visitorId;
    return fetch(api, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(values) });
  }
  function toggleLike() {
    var state = stateFor(activeWork.id);
    state.liked = !state.liked; state.likeCount += state.liked ? 1 : -1;
    renderDialog(); renderWorks();
    post({ action: "toggleLike", workId: activeWork.id }).then(function () { setTimeout(loadRemote, 700); }).catch(function () { state.liked = !state.liked; state.likeCount += state.liked ? 1 : -1; renderDialog(); renderWorks(); });
  }
  function addComment(event) {
    event.preventDefault();
    var text = new FormData(event.currentTarget).get("comment").trim();
    if (!text) return;
    var status = document.getElementById("commentStatus"); status.textContent = "送信しています…";
    post({ action: "addComment", workId: activeWork.id, comment: text }).then(function () { status.textContent = "コメントを送信しました。"; setTimeout(loadRemote, 700); }).catch(function (error) { status.textContent = error.message; });
  }
  function loadRemote() {
    if (!api) return;
    var callback = "laundryCallback_" + Date.now();
    var script = document.createElement("script");
    window[callback] = function (payload) { if (payload && payload.ok) { remote = payload; renderWorks(); if (dialog.open) renderDialog(); } delete window[callback]; script.remove(); };
    script.src = api + "?action=snapshot&visitorId=" + encodeURIComponent(visitorId) + "&callback=" + callback;
    script.onerror = function () { delete window[callback]; script.remove(); };
    document.head.appendChild(script);
  }

  function positionFromEvent(event) {
    var rect = submitMap.getBoundingClientRect();
    var x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    var y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    return { x: x, y: y, latitude: store.center.lat + (0.5 - y) * 0.02, longitude: store.center.lng + (x - 0.5) * 0.03 };
  }
  function renderSubmissionMap() {
    submitMap.innerHTML = mapScenery() + (selectedPoint && !unknown.checked ? '<span class="submission-pin" style="--x:' + (selectedPoint.x * 100) + '%;--y:' + (selectedPoint.y * 100) + '%">＋</span>' : '<span class="map-help">地図上の場所を押してください</span>');
    document.getElementById("selectedLocation").textContent = unknown.checked ? "場所の名前・目印を文章で入力してください。" : (selectedPoint ? "地図上の場所を選びました。" : "場所はまだ選ばれていません。");
  }
  submitMap.addEventListener("click", function (event) { if (unknown.checked) return; selectedPoint = positionFromEvent(event); renderSubmissionMap(); });
  unknown.addEventListener("change", renderSubmissionMap);
  form.addEventListener("submit", function (event) {
    event.preventDefault(); if (!form.reportValidity()) return;
    var values = new FormData(form);
    if (!unknown.checked && !selectedPoint) { formStatus.textContent = "地図上の場所を選ぶか、「地図では場所がわからない」を選んでください。"; return; }
    formStatus.textContent = "投稿しています…";
    post({ action: "addSubmission", storeId: store.id, placeLabel: values.get("placeLabel"), body: values.get("body"), displayName: values.get("displayName"), locationUnknown: String(unknown.checked), latitude: selectedPoint ? selectedPoint.latitude : "", longitude: selectedPoint ? selectedPoint.longitude : "", website: values.get("website") }).then(function () { form.reset(); selectedPoint = null; renderSubmissionMap(); formStatus.textContent = "投稿を受け付けました。内容を確認後、作品づくりに使用します。"; }).catch(function (error) { formStatus.textContent = error.message; });
  });

  document.title = store.name + "｜ランドリーシアター";
  document.getElementById("storeKicker").textContent = "STORE " + store.index + " / " + store.area;
  document.getElementById("storeTitle").textContent = store.name;
  document.getElementById("storeDescription").textContent = store.description;
  document.getElementById("submissionStoreName").textContent = store.name;
  document.getElementById("likedFilter").addEventListener("click", function (event) { likedOnly = !likedOnly; event.currentTarget.setAttribute("aria-pressed", likedOnly); event.currentTarget.textContent = likedOnly ? "すべての作品を表示" : "「いいね」した作品を表示"; renderWorks(); });
  document.getElementById("works").addEventListener("click", function (event) { var trigger = event.target.closest("[data-work-id]"); if (trigger) openWork(trigger.dataset.workId); });
  document.getElementById("dialogClose").addEventListener("click", function () { stopSpeech(); dialog.close(); });
  dialog.addEventListener("click", function (event) { if (event.target === dialog) { stopSpeech(); dialog.close(); } });
  renderWorks(); renderSubmissionMap(); loadRemote();
})();
