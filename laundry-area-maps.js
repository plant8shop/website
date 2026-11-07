(function () {
  "use strict";

  var data = window.LAUNDRY_AREA_MAPS;
  var creditUrl = "https://maps.gsi.go.jp/help/use.html";

  function element(tag, className, content) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  function locationButton(className, point, number, title) {
    var button = element("button", className);
    button.type = "button";
    button.dataset.playLocation = point.id;
    button.setAttribute("aria-label", number + " " + title + "を開く");
    button.append(element("span", "play-map-number", String(number)));
    return button;
  }

  window.renderLaundryAreaMap = function (root, key) {
    var map = data.maps[key];
    if (!root || !map) return false;

    var layout = element("div", "play-map-layout");
    var figure = element("figure", "play-map-figure");
    var surface = element("div", "play-map-surface");
    var image = element("img");
    image.src = map.image;
    image.alt = map.title;
    image.width = 1000;
    image.height = 1000;
    image.loading = "lazy";
    surface.append(image);

    var caption = element("figcaption", "play-map-caption");
    var credit = element("a", null, "国土地理院の地理院タイルを加工して作成");
    credit.href = creditUrl;
    caption.append(credit);
    figure.append(surface, caption);

    var legend = element("ol", "play-map-legend");
    legend.setAttribute("aria-label", "この店舗の戯曲の場所");
    map.locations.forEach(function (point, index) {
      var number = index + 1;
      var title = data.locations[point.id];
      var pin = locationButton("play-map-pin", point, number, title);
      pin.style.left = point.x + "%";
      pin.style.top = point.y + "%";
      surface.append(pin);

      var item = element("li");
      var entry = locationButton("play-map-entry", point, number, title);
      entry.append(element("span", null, title));
      item.append(entry);
      legend.append(item);
    });

    layout.append(figure, legend);
    root.replaceChildren(layout);
    return true;
  };
})();
