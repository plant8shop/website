(function () {
  "use strict";

  var DATA_URL = "./data/place-fiction.json";
  var mapNode = document.getElementById("map");
  var statusNode = document.getElementById("mapStatus");
  var panelNode = document.getElementById("storyPanel");
  var contentNode = document.getElementById("storyContent");
  var closeButton = document.getElementById("closePanel");
  var scrimNode = document.getElementById("panelScrim");
  var map = null;
  var spotsById = {};
  var markerById = {};
  var activeSpotId = null;
  var lastTrigger = null;
  var ROLE_COLORS = ["#b84632", "#2f6f8f", "#477a51", "#8a5a9e", "#a66a20", "#5f5a93"];

  function createElement(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function createMap(config) {
    var center = Array.isArray(config.center) ? config.center : [35.052255, 135.751019];
    var zoom = Number.isFinite(config.zoom) ? config.zoom : 15;

    map = L.map(mapNode, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      keyboard: true
    });

    L.control.zoom({ position: "bottomleft" }).addTo(map);
    L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "<a href=\"https://maps.gsi.go.jp/development/ichiran.html\" target=\"_blank\" rel=\"noopener noreferrer\">地理院タイル</a>"
    }).addTo(map);
  }

  function markerIcon(index) {
    return L.divIcon({
      className: "story-marker-shell",
      html: "<div class=\"story-marker\"><span>" + String(index).padStart(2, "0") + "</span></div>",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -42]
    });
  }

  function spotCoordinates(spot) {
    var coordinates = spot.coordinates;
    if (Array.isArray(coordinates) && coordinates.length === 2 &&
        Number.isFinite(coordinates[0]) && Number.isFinite(coordinates[1])) {
      return coordinates;
    }
    if (coordinates && Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lng)) {
      return [coordinates.lat, coordinates.lng];
    }
    return null;
  }

  function renderMarkers(spots) {
    var published = spots
      .filter(function (spot) {
        return spot.status === "published" && spotCoordinates(spot);
      })
      .sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      });

    statusNode.classList.toggle("is-visible", published.length === 0);

    published.forEach(function (spot, index) {
      spotsById[spot.id] = spot;
      var marker = L.marker(spotCoordinates(spot), {
        icon: markerIcon(index + 1),
        keyboard: true,
        title: spot.title,
        alt: spot.title + "の脚本を開く"
      }).addTo(map);

      marker.on("click", function (event) {
        lastTrigger = event.originalEvent && event.originalEvent.target
          ? event.originalEvent.target
          : null;
        openStory(spot.id, true);
      });

      var markerElement = marker.getElement();
      if (markerElement) {
        markerElement.setAttribute("role", "button");
        markerElement.setAttribute("aria-label", spot.title + "の脚本を開く");
        markerElement.addEventListener("keydown", function (event) {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          lastTrigger = markerElement;
          openStory(spot.id, true);
        });
      }

      markerById[spot.id] = marker;
    });
  }

  function appendSectionHeading(parent, text) {
    var heading = createElement("h3", "", text);
    parent.appendChild(heading);
  }

  function findPhoto(spot, src) {
    return (spot.photos || []).find(function (photo) { return photo.src === src; }) || null;
  }

  function appendScriptImage(parent, spot, block) {
    var photo = findPhoto(spot, block.src);
    if (!photo) return;
    var figure = createElement("figure", "script-image");
    var image = createElement("img");
    image.src = photo.src;
    image.alt = photo.alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    figure.appendChild(image);
    var caption = Object.prototype.hasOwnProperty.call(block, "caption") ? block.caption : photo.caption;
    if (caption) figure.appendChild(createElement("figcaption", "", caption));
    parent.appendChild(figure);
  }

  function roleColor(spot, actor) {
    var index = (spot.characters || []).findIndex(function (character) {
      return character.name === actor;
    });
    return ROLE_COLORS[(index < 0 ? 0 : index) % ROLE_COLORS.length];
  }

  function createRoleBadge(spot, actor) {
    var badge = createElement("span", "script-role-badge", actor);
    badge.style.setProperty("--role-color", roleColor(spot, actor));
    return badge;
  }

  function blockActors(spot, block) {
    var knownNames = (spot.characters || []).map(function (character) { return character.name; });
    var actors = Array.isArray(block.actors) ? block.actors : [];
    if (!actors.length && block.type === "dialogue" && knownNames.includes(block.speaker)) {
      actors = [block.speaker];
    }
    return actors.filter(function (actor, index) {
      return knownNames.includes(actor) && actors.indexOf(actor) === index;
    });
  }

  function appendRoleLegend(parent, spot) {
    if (!Array.isArray(spot.characters) || !spot.characters.length) return;
    var legend = createElement("div", "script-role-legend");
    legend.appendChild(createElement("p", "script-role-legend-title", "役の色（段落で動く／話す人）"));
    var badges = createElement("div", "script-role-badges");
    spot.characters.forEach(function (character) {
      badges.appendChild(createRoleBadge(spot, character.name));
    });
    legend.appendChild(badges);
    parent.appendChild(legend);
  }

  function renderScriptBlocks(spot) {
    var documentNode = createElement("div", "script-document");
    spot.scriptBlocks.forEach(function (block) {
      if (!block || !block.type) return;
      var beat = createElement("article", "script-beat script-beat-" + block.type);
      var actors = blockActors(spot, block);
      if (actors.length) {
        beat.classList.add("has-actors");
        beat.style.setProperty("--role-color", roleColor(spot, actors[0]));
        var actorRow = createElement("div", "script-beat-actors");
        actorRow.setAttribute("aria-label", "この段落で動く、または話す人");
        actors.forEach(function (actor) { actorRow.appendChild(createRoleBadge(spot, actor)); });
        beat.appendChild(actorRow);
      }
      if (block.type === "scene") {
        beat.appendChild(createElement("p", "script-scene", block.text || ""));
      } else if (block.type === "text") {
        beat.appendChild(createElement("div", "script-prose", block.text || ""));
      } else if (block.type === "dialogue") {
        var dialogue = createElement("div", "script-dialogue");
        dialogue.appendChild(createElement("span", "script-speaker", block.speaker || ""));
        dialogue.appendChild(createElement("p", "script-line", block.text || ""));
        beat.appendChild(dialogue);
      } else if (block.type === "image") {
        appendScriptImage(beat, spot, block);
      } else if (block.type === "end") {
        beat.appendChild(createElement("p", "script-end", block.text || "終わり"));
      }
      documentNode.appendChild(beat);
    });
    return documentNode;
  }

  function renderStory(spot) {
    contentNode.replaceChildren();

    contentNode.appendChild(createElement("p", "story-index", "FIELD SCRIPT / " + String(spot.order || "").padStart(2, "0")));
    var title = createElement("h2", "story-title", spot.title);
    title.id = "storyTitle";
    contentNode.appendChild(title);
    contentNode.appendChild(createElement("p", "story-date", spot.date || ""));
    contentNode.appendChild(createElement("p", "story-summary", spot.summary || ""));

    if (Array.isArray(spot.characters) && spot.characters.length) {
      var characterSection = createElement("section", "story-section");
      appendSectionHeading(characterSection, "登場人物");
      var list = createElement("dl", "character-list");
      spot.characters.forEach(function (character) {
        var row = createElement("div");
        row.appendChild(createElement("dt", "", character.name || ""));
        row.appendChild(createElement("dd", "", character.description || ""));
        list.appendChild(row);
      });
      characterSection.appendChild(list);
      contentNode.appendChild(characterSection);
    }

    if (Array.isArray(spot.props) && spot.props.length) {
      var propSection = createElement("section", "story-section");
      appendSectionHeading(propSection, "使用するもの");
      var props = createElement("ul", "prop-list");
      spot.props.forEach(function (prop) {
        props.appendChild(createElement("li", "", prop));
      });
      propSection.appendChild(props);
      contentNode.appendChild(propSection);
    }

    var hasStructuredScript = Array.isArray(spot.scriptBlocks) && spot.scriptBlocks.length;

    if (!hasStructuredScript && Array.isArray(spot.photos) && spot.photos.length) {
      var photoSection = createElement("section", "story-section");
      appendSectionHeading(photoSection, "場所の写真");
      var grid = createElement("div", "photo-grid");
      spot.photos.forEach(function (photo) {
          var figure = createElement("figure");
          var image = createElement("img");
          image.src = photo.src;
          image.alt = photo.alt || "";
          image.loading = "lazy";
          image.decoding = "async";
          figure.appendChild(image);
          if (photo.caption) figure.appendChild(createElement("figcaption", "", photo.caption));
          grid.appendChild(figure);
        });
      photoSection.appendChild(grid);
      contentNode.appendChild(photoSection);
    }

    var scriptSection = createElement("section", "story-section");
    appendSectionHeading(scriptSection, "脚本");
    if (hasStructuredScript) {
      appendRoleLegend(scriptSection, spot);
      scriptSection.appendChild(renderScriptBlocks(spot));
    } else {
      scriptSection.appendChild(createElement("div", "script-text", spot.script || ""));
    }
    contentNode.appendChild(scriptSection);
  }

  function setSpotInUrl(id) {
    var url = new URL(window.location.href);
    if (id) {
      url.searchParams.set("spot", id);
    } else {
      url.searchParams.delete("spot");
    }
    history.replaceState({}, "", url);
  }

  function openStory(id, updateUrl) {
    var spot = spotsById[id];
    if (!spot) return;

    activeSpotId = id;
    renderStory(spot);
    panelNode.classList.add("is-open");
    panelNode.setAttribute("aria-hidden", "false");
    scrimNode.hidden = false;
    if (updateUrl) setSpotInUrl(id);
    window.setTimeout(function () {
      closeButton.focus({ preventScroll: true });
    }, 50);
  }

  function closeStory(updateUrl) {
    if (!activeSpotId) return;
    activeSpotId = null;
    panelNode.classList.remove("is-open");
    panelNode.setAttribute("aria-hidden", "true");
    scrimNode.hidden = true;
    if (updateUrl) setSpotInUrl(null);
    if (lastTrigger && typeof lastTrigger.focus === "function") {
      lastTrigger.focus({ preventScroll: true });
    }
  }

  function showLoadError(message) {
    statusNode.classList.add("is-visible");
    statusNode.querySelector("strong").textContent = "地図を読み込めませんでした";
    statusNode.querySelector("span").textContent = message;
  }

  async function init() {
    try {
      var response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("脚本データの取得に失敗しました。");
      var data = await response.json();
      createMap(data.map || {});
      renderMarkers(Array.isArray(data.spots) ? data.spots : []);

      var requestedId = new URL(window.location.href).searchParams.get("spot");
      if (requestedId && spotsById[requestedId]) {
        var marker = markerById[requestedId];
        if (marker) map.panTo(marker.getLatLng());
        openStory(requestedId, false);
      } else if (requestedId) {
        setSpotInUrl(null);
      }
    } catch (error) {
      if (!map) createMap({});
      showLoadError(error instanceof Error ? error.message : "しばらくしてから再読み込みしてください。");
    }
  }

  closeButton.addEventListener("click", function () { closeStory(true); });
  scrimNode.addEventListener("click", function () { closeStory(true); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeStory(true);
  });

  init();
})();
