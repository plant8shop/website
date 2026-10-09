(function () {
  "use strict";
  var data = window.LAUNDRY_WAITING_ROOM_DATA || { stores: [] };
  var list = document.getElementById("storeList");
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }
  list.innerHTML = data.stores.map(function (store) {
    return '<a class="store-link-card" href="laundry-store.html?store=' + encodeURIComponent(store.id) + '">' +
      '<span class="store-index">STORE ' + escapeHtml(store.index) + '</span>' +
      '<div><p>' + escapeHtml(store.area) + '</p><h2>' + escapeHtml(store.name) + '</h2><small>' + escapeHtml(store.description) + '</small></div>' +
      '<span class="store-link-arrow" aria-hidden="true">→</span>' +
    '</a>';
  }).join("");
})();
