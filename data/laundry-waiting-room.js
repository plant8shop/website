window.LAUNDRY_WAITING_ROOM_DATA = {
  "apiUrl": "https://script.google.com/macros/s/AKfycbxqvrKF72LX8TN2riDJRHFfl-VcenqqlZSQUapmuRIRDYAukbSSXAJOHdDZcZQyf5MBLw/exec",
  "stores": [
    {
      "id": "kyoto-laundry-cafe",
      "index": "01",
      "name": "KYOTO LAUNDRY CAFE",
      "area": "",
      "description": "11/7（土）〜",
      "mapReady": true,
      "center": { "lat": 35.0054665, "lng": 135.7333229 },
      "mapSpanMeters": 1050,
      "mapImage": "assets/laundry/area-maps/kyoto-laundry-cafe.svg?v=20261107-7",
      "mapAlt": "KYOTO LAUNDRY CAFEから半径500mの地図",
      "works": [],
      "drinkOffer": true
    },
    {
      "id": "laundromat-nishikyogoku",
      "index": "02",
      "name": "laundromat 西京極",
      "area": "",
      "description": "11/7（土）〜",
      "mapReady": true,
      "center": { "lat": 34.9912611, "lng": 135.7205511 },
      "mapSpanMeters": 1050,
      "mapImage": "assets/laundry/area-maps/laundromat-nishikyogoku.svg?v=20261107-7",
      "mapAlt": "laundromat 西京極から半径500mの地図",
      "works": [],
      "drinkOffer": false
    },
    {
      "id": "laundromat-mibu",
      "index": "03",
      "name": "laundromat MIBU",
      "area": "",
      "description": "11/7（土）〜",
      "mapReady": true,
      "center": { "lat": 35.0037354, "lng": 135.7389614 },
      "mapSpanMeters": 1050,
      "mapImage": "assets/laundry/area-maps/laundromat-mibu.svg?v=20261107-7",
      "mapAlt": "laundromat MIBUから半径500mの地図",
      "works": [],
      "drinkOffer": false
    }
  ]
};

(function () {
  var assignments = {
    "kyoto-laundry-cafe": [3, 4, 5],
    "laundromat-nishikyogoku": [6, 7, 8],
    "laundromat-mibu": [1, 2, 3]
  };
  window.LAUNDRY_WAITING_ROOM_DATA.stores.forEach(function (store) {
    store.works = (assignments[store.id] || []).map(function (locationId, index) {
      var source = window.LAUNDRY_WORKS && window.LAUNDRY_WORKS[locationId];
      if (!source) return null;
      var photoCount = locationId === 4 ? 4 : 3;
      return Object.assign({}, source, {
        id: store.id + "-" + locationId,
        number: String(index + 1),
        images: Array.from({ length: photoCount }, function (_, photoIndex) {
          return {
            src: "assets/laundry/works/location-" + locationId + "-" + (photoIndex + 1) + ".webp",
            alt: source.place + "の写真 " + (photoIndex + 1)
          };
        })
      });
    }).filter(Boolean);
  });
}());
