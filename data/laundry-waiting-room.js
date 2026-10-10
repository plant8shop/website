window.LAUNDRY_WAITING_ROOM_DATA = {
  apiUrl: "https://script.google.com/macros/s/AKfycbxqvrKF72LX8TN2riDJRHFfl-VcenqqlZSQUapmuRIRDYAukbSSXAJOHdDZcZQyf5MBLw/exec",
  stores: [
    {
      id: "kitaoji-model",
      index: "01",
      name: "北大路モデル店舗（仮）",
      area: "京都・北大路周辺",
      mapImage: "assets/laundry-kitaoji-map.png",
      mapAlt: "北大路周辺の地図",
      status: "試作表示",
      description: "店舗と周辺地域の調整前に、視聴と投稿の流れを確認するためのモデルページです。",
      center: { lat: 35.0443, lng: 135.7588 },
      works: [
        {
          id: "lost-property",
          number: "01",
          title: "落とし物",
          place: "大通りから斜めに入る細い道",
          duration: "朗読 約4分",
          x: 78,
          y: 33,
          summary: "買い物帰りの大学生が、木陰に残されたごみと、それを黙って掃く人に出会う。",
          images: [
            { label: "場所の写真 1 / 準備中" },
            { label: "場所の写真 2 / 準備中" }
          ],
          areaMap: {
            notes: [
              { x: 18, y: 54, text: "大通り" },
              { x: 53, y: 38, text: "斜めに入る細い道" },
              { x: 72, y: 24, text: "木陰" },
              { x: 68, y: 70, text: "掃く音が聞こえた場所" }
            ]
          },
          script: [
            "大学生が、大通りに面した店から歩いてくる。片手には、食べ終えたアイスの袋がある。",
            "道路の向こうに、斜めに入る細い道を見つける。木の枝が道の上へ張り出し、小さな屋根のようになっている。",
            "木陰には、落ち葉、空き缶、吸い殻が同じように重なっている。奥から、ほうきが地面を擦る音が聞こえる。",
            "大学生は袋を鞄へ戻し、道路を渡ったところで一度だけ振り返る。"
          ]
        },
        {
          id: "wind-passage",
          number: "02",
          title: "風の通り道",
          place: "建物の間の短い通路",
          duration: "朗読 約3分",
          x: 37,
          y: 62,
          summary: "通り抜けるだけだった路地で、風と音を待つ二人の短い場面。",
          images: [
            { label: "場所の写真 1 / 準備中" },
            { label: "場所の写真 2 / 準備中" }
          ],
          areaMap: {
            notes: [
              { x: 18, y: 48, text: "入口" },
              { x: 48, y: 52, text: "建物の間" },
              { x: 78, y: 42, text: "明るい出口" },
              { x: 54, y: 24, text: "風が抜ける方向" }
            ]
          },
          script: [
            "二つの建物の間に、細い通路がある。奥は明るいが、入口から出口までは見えない。",
            "一人が壁に手を当てる。もう一人は、風が来るまで待っている。",
            "自転車のベルが遠くで鳴り、紙片だけが先に通路を抜けていく。"
          ]
        }
      ]
    },
    {
      id: "store-02",
      index: "02",
      name: "店舗 02（準備中）",
      area: "京都市内・調整中",
      status: "準備中",
      description: "協力店舗との調整後に、店舗名、周辺地図、初期作品を掲載します。",
      center: { lat: 35.0116, lng: 135.7681 },
      works: []
    }
  ]
};
