(function () {
  "use strict";

  var data = window.LAUNDRY_WAITING_ROOM_DATA || { stores: [] };
  var tabsNode = document.getElementById("storeTabs");
  var summaryNode = document.getElementById("storeSummary");
  var mapNode = document.getElementById("mapCanvas");
  var listNode = document.getElementById("workList");
  var countNode = document.getElementById("workCount");
  var storeSelect = document.getElementById("submissionStore");
  var form = document.getElementById("submissionForm");
  var formStatus = document.getElementById("formStatus");
  var dialog = document.getElementById("workDialog");
  var dialogContent = document.getElementById("dialogContent");
  var closeButton = document.getElementById("dialogClose");
  var activeStoreId = new URL(window.location.href).searchParams.get("store") || (data.stores[0] && data.stores[0].id);
  var speech = null;

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  function currentStore() {
    return data.stores.find(function (store) { return store.id === activeStoreId; }) || data.stores[0];
  }

  function setStore(id, updateUrl) {
    if (!data.stores.some(function (store) { return store.id === id; })) return;
    activeStoreId = id;
    if (updateUrl) {
      var url = new URL(window.location.href);
      url.searchParams.set("store", id);
      history.replaceState(null, "", url);
    }
    render();
    storeSelect.value = id;
  }

  function renderTabs() {
    tabsNode.innerHTML = data.stores.map(function (store) {
      var selected = store.id === activeStoreId;
      return '<button class="store-tab' + (selected ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + selected + '" data-store-id="' + escapeHtml(store.id) + '">' +
        '<span>STORE ' + escapeHtml(store.index) + '</span>' +
        '<strong>' + escapeHtml(store.name) + '</strong>' +
      '</button>';
    }).join("");
  }

  function renderSummary(store) {
    summaryNode.innerHTML = '<div><p class="store-kicker">' + escapeHtml(store.area) + '</p><h3>' + escapeHtml(store.name) + '</h3></div>' +
      '<p>' + escapeHtml(store.description) + '</p>' +
      '<span class="status-chip">' + escapeHtml(store.status) + '</span>';
  }

  function renderMap(store) {
    var paths = '<span class="map-road map-road-a"></span><span class="map-road map-road-b"></span><span class="map-road map-road-c"></span><span class="map-block map-block-a"></span><span class="map-block map-block-b"></span><span class="map-block map-block-c"></span>';
    var markers = store.works.map(function (work) {
      return '<button class="map-marker" type="button" data-work-id="' + escapeHtml(work.id) + '" style="--x:' + Number(work.x || 50) + '%;--y:' + Number(work.y || 50) + '%" aria-label="' + escapeHtml(work.title) + 'を開く"><span>' + escapeHtml(work.number) + '</span></button>';
    }).join("");
    var empty = store.works.length ? "" : '<p class="map-empty">作品の位置を準備しています。</p>';
    mapNode.innerHTML = paths + markers + empty + '<span class="map-shop"><i></i>現在の店舗</span>';
  }

  function renderWorks(store) {
    countNode.textContent = store.works.length ? store.works.length + "作品を試作表示しています" : "公開準備中です";
    if (!store.works.length) {
      listNode.innerHTML = '<div class="empty-card"><strong>この店舗の作品は準備中です</strong><p>周辺地域の調査と初期作品の制作後に追加します。</p></div>';
      return;
    }
    listNode.innerHTML = store.works.map(function (work) {
      return '<button class="work-card" type="button" data-work-id="' + escapeHtml(work.id) + '">' +
        '<span class="work-number">' + escapeHtml(work.number) + '</span>' +
        '<span class="work-card-main"><strong>' + escapeHtml(work.title) + '</strong><small>' + escapeHtml(work.place) + '</small></span>' +
        '<span class="work-duration">' + escapeHtml(work.duration) + '</span>' +
        '<span class="work-arrow" aria-hidden="true">↗</span>' +
      '</button>';
    }).join("");
  }

  function openWork(workId) {
    var store = currentStore();
    var work = store.works.find(function (item) { return item.id === workId; });
    if (!work) return;
    stopSpeech();
    dialogContent.innerHTML = '<p class="dialog-index">STORE ' + escapeHtml(store.index) + ' / WORK ' + escapeHtml(work.number) + '</p>' +
      '<h2 id="dialogTitle">' + escapeHtml(work.title) + '</h2>' +
      '<p class="dialog-place">' + escapeHtml(work.place) + '</p>' +
      '<div class="dialog-photo" role="img" aria-label="' + escapeHtml(work.imageLabel) + '"><span>' + escapeHtml(work.imageLabel) + '</span></div>' +
      '<p class="dialog-summary">' + escapeHtml(work.summary) + '</p>' +
      '<div class="listen-row"><button id="listenButton" class="button button-primary" type="button">仮朗読を再生</button><span>ブラウザの音声で試聴します</span></div>' +
      '<div class="script"><h3>短い戯曲</h3>' + work.script.map(function (paragraph) { return '<p>' + escapeHtml(paragraph) + '</p>'; }).join("") + '</div>';
    dialog.showModal();
    document.getElementById("listenButton").addEventListener("click", function (event) {
      var listenButton = event.currentTarget;
      if (speechSynthesis.speaking) {
        stopSpeech();
        listenButton.textContent = "仮朗読を再生";
        return;
      }
      speech = new SpeechSynthesisUtterance(work.script.join("。\n"));
      speech.lang = "ja-JP";
      speech.rate = 0.92;
      speech.onend = function () {
        if (listenButton.isConnected) listenButton.textContent = "仮朗読を再生";
      };
      speechSynthesis.speak(speech);
      listenButton.textContent = "朗読を停止";
    });
  }

  function stopSpeech() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    speech = null;
  }

  function render() {
    var store = currentStore();
    if (!store) return;
    renderTabs();
    renderSummary(store);
    renderMap(store);
    renderWorks(store);
  }

  data.stores.forEach(function (store) {
    var option = document.createElement("option");
    option.value = store.id;
    option.textContent = store.name;
    storeSelect.appendChild(option);
  });

  tabsNode.addEventListener("click", function (event) {
    var button = event.target.closest("[data-store-id]");
    if (button) setStore(button.dataset.storeId, true);
  });

  document.getElementById("works").addEventListener("click", function (event) {
    var trigger = event.target.closest("[data-work-id]");
    if (trigger) openWork(trigger.dataset.workId);
  });

  closeButton.addEventListener("click", function () {
    stopSpeech();
    dialog.close();
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) {
      stopSpeech();
      dialog.close();
    }
  });
  dialog.addEventListener("close", stopSpeech);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    var values = new FormData(form);
    var selectedStore = data.stores.find(function (store) { return store.id === values.get("store"); });
    var photo = document.getElementById("submissionPhoto").files[0];
    var subject = "【ランドリー待合室 投稿】" + String(values.get("place") || "場所の断片");
    var lines = [
      "店舗: " + (selectedStore ? selectedStore.name : values.get("store")),
      "場所: " + values.get("place"),
      "種類: " + values.get("kind"),
      "",
      String(values.get("story") || ""),
      "",
      "お名前: " + (values.get("name") || "匿名"),
      "返信先: " + (values.get("replyTo") || "記載なし"),
      "写真: " + (photo ? photo.name + "（このメールに添付してください）" : "なし")
    ];
    formStatus.textContent = "メールアプリを開きます。内容を確認し、写真がある場合は添付してから送信してください。";
    window.location.href = "mailto:" + encodeURIComponent(data.submissionEmail) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
  });

  setStore(activeStoreId, false);
})();
