(function () {
  "use strict";

  var data = window.LAUNDRY_AREA_MAPS;

  function element(tag, className, content) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  function locationButton(className, point, number, title, english) {
    var button = element("button", className);
    button.type = "button";
    button.dataset.playLocation = point.id;
    button.setAttribute("aria-label", english ? "Open " + number + " " + title : number + " " + title + "を開く");
    button.append(element("span", "play-map-number", String(number)));
    return button;
  }

  window.renderLaundryAreaMap = function (root, key, language) {
    var map = data.maps[key];
    if (!root || !map) return false;
    var english = language === "en";
    var storeData = window.LAUNDRY_WAITING_ROOM_DATA && window.LAUNDRY_WAITING_ROOM_DATA.stores.find(function (store) { return store.id === key; });

    var layout = element("div", "play-map-layout");
    var figure = element("figure", "play-map-figure");
    var surface = element("div", "play-map-surface");
    var image = element("img");
    image.src = map.image;
    image.alt = english && map.titleEn ? map.titleEn : map.title;
    image.width = 1000;
    image.height = 1000;
    image.loading = "lazy";
    surface.append(image);

    figure.append(surface);

    var legend = element("ol", "play-map-legend");
    legend.setAttribute("aria-label", english ? "Locations in the works at this laundry" : "この店舗の戯曲の場所");
    map.locations.forEach(function (point, index) {
      var number = index + 1;
      var work = storeData && storeData.works.find(function (item) { return String(item.locationId) === String(point.id); });
      var title = work ? (english && work.titleEn ? work.titleEn : work.title) : (english && data.locationsEn ? data.locationsEn[point.id] : data.locations[point.id]);
      var pin = locationButton("play-map-pin", point, number, title, english);
      pin.style.left = point.x + "%";
      pin.style.top = point.y + "%";
      surface.append(pin);

      var item = element("li");
      var entry = locationButton("play-map-entry", point, number, title, english);
      if (work && work.images && work.images[0] && work.images[0].src) {
        var thumbnail = element("span", "play-map-entry-image");
        var thumbnailImage = element("img");
        thumbnailImage.src = work.images[0].src;
        thumbnailImage.alt = english ? title + " representative photo" : title + "の代表写真";
        thumbnailImage.loading = "lazy";
        thumbnail.append(thumbnailImage);
        entry.prepend(thumbnail);
      }
      entry.append(element("span", "play-map-entry-title", title));
      item.append(entry);
      legend.append(item);
    });
    layout.append(figure, legend);
    root.replaceChildren(layout);
    return true;
  };
})();
