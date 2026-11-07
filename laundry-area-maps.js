(function () {
  "use strict";

  var data = window.LAUNDRY_AREA_MAPS;
  var creditUrl = "https://github.com/gsi-cyberjapan/gsimaps-vector-experiment";

  function element(tag, className, content) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (content) node.textContent = content;
    return node;
  }

  window.renderLaundryAreaMap = function (root, key) {
    var map = data.maps[key];
    if (!root || !map) return;

    var layout = element("div", "play-map-layout");
    var figure = element("figure", "play-map-figure");
    var fullSize = element("a", "play-map-image-link");
    fullSize.href = map.image;
    fullSize.setAttribute("aria-label", map.title + "を拡大表示");
    var image = element("img");
    image.src = map.image;
    image.alt = map.title + "。緑の番号は隣の一覧に対応します。";
    image.width = 1000;
    image.height = 1000;
    image.loading = "lazy";
    fullSize.append(image);

    var caption = element("figcaption", "play-map-caption");
    var expand = element("a", null, "地図を拡大");
    expand.href = map.image;
    var credit = element("a", null, "国土地理院ベクトルタイル提供実験のデータを加工して作成");
    credit.href = creditUrl;
    caption.append(expand, credit);
    figure.append(fullSize, caption);

    var legend = element("ol", "play-map-legend");
    legend.setAttribute("aria-label", "戯曲の地点一覧");
    map.locations.forEach(function (number) {
      var item = element("li");
      item.value = number;
      item.append(element("span", "play-map-number", String(number)), element("span", null, data.locations[number]));
      legend.append(item);
    });

    layout.append(figure, legend);
    root.replaceChildren(layout);
  };
})();
