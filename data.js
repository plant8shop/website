const SITE_DATA = {
  site: {
    name: "プラントショップ",
    about: `
      <p>
        映像制作コレクティブ。
      </p>
      <p>
        主に建築やデザインを背景に持つメンバーを中心とする映像制作コレクティブです。すでにそこにあるものを読み替え、共有し、その過程を通じて現実に介入していきます。
      </p>
    `,
    announcements: [
      {
        id: "matsugasaki-festival-2026",
        date: "2026.10.21",
        title: "松ヶ崎祭で「プラントショ⌇ップ」を展示・販売します",
        summary: "2026年11月14日（土）・15日（日）、京都工芸繊維大学松ヶ崎キャンパスで開催される第56回松ヶ崎祭に出展します。",
        body: "活動「プラントショ⌇ップ」として、路上のひび割れを型取りした植木鉢と、そこに生える植物から見た街のパノラマ風景をもとにしたグラフィック作品を展示・販売します。",
        status: "latest",
        relatedLinks: [
          { label: "活動「プラントショ⌇ップ」を見る", url: "work.html?id=matsugasaki-festival" },
          { label: "松ヶ崎祭公式サイトの出展ページ", url: "https://www.matsufes.info/booth/083" }
        ]
      },
      {
        id: "walking-pot-podcast",
        date: "2026.09.04",
        title: "ポッドキャスト「歩く植木鉢」を始めました",
        summary: "プラントショップの人類メンバーによるポッドキャスト「歩く植木鉢」の配信を始めました。",
        body: "制作の途中で考えていること、最近見た作品、日々の出来事などを、散歩するように話します。Spotify、YouTube、Apple Podcastsでお聴きいただけます。",
        status: "done",
        relatedLinks: [
          { label: "「歩く植木鉢」を見る", url: "index.html#walking-pot" }
        ]
      },
      {
        id: "production-talk",
        date: "2026.06.27",
        title: "展覧会「生産」で、トークをします",
        summary: "28日（日）13時より、ALC Library&Galleryで開催している「生産」展で、作品について話すトークを予定しています。",
        body: "28日（日）13時より、ALC Library&Galleryで開催している「生産」展で、作品について話すトークを予定しています。",
        status: "done",
        relatedLinks: [
          { label: "活動「生産」を見る", url: "work.html?id=production" }
        ]
      },
      {
        id: "production-exhibition",
        date: "2026.06.15",
        title: "展覧会「生産」を開催します",
        summary: "2026年6月26日から30日まで、京都・岡崎道のALC Library&Galleryで開催します。",
        body: "2026年6月26日から30日まで、京都・岡崎道のALC Library&Galleryで開催します。",
        status: "done",
        relatedLinks: [
          { label: "活動「生産」を見る", url: "work.html?id=production" }
        ]
      }
    ],
    contact: {
      text: `
        <p>
          何かありましたら、下記のメール・SNSよりご連絡ください。私たちとしても、さまざまな方とコミュニケーションを持ちたいと思っていますので、お気軽にどうぞ。参加の希望も歓迎しています。
        </p>
      `,
      email: "plant8shop@gmail.com",
      sns: [
        { name: " X ", url: "https://x.com/plant8shop" },
        { name: "Instagram", url: "https://www.instagram.com/plant8shop/" },
        { name: "note", url: "https://note.com/plant8shop" },
      ]
    },

    memberShare: {
      label: "メンバー共有サイト",
      url: "https://plantshop-member-share.umedakouki.chatgpt.site/",
      description: "プラントショップの運営や活動状況を確認するための、メンバー向け共有サイトです。アクセス権のあるメンバーのみ閲覧できます。"
    },

    operatingMembers: [
      { memberId: "aoki", roles: ["全体進行", "渉外", "Instagram", "note", "記録"] },
      { memberId: "umeda", roles: ["会計", "Webサイト", "機材備品管理"] },
      { memberId: "akiyama", roles: ["X", "note"] },
      { memberId: "yoshimura", roles: ["分析"] },
      { memberId: "okubo", roles: ["歩く植木鉢"] }
    ],

    podcast: {
      name: "歩く植木鉢",
      description: "プラントショップのメンバーが、活動の過程で考えていることや日々のことなどをゆるく話しているポッドキャストです。",
      feedUrl: "https://anchor.fm/s/116db43d8/podcast/rss",
      platforms: [
        { name: "Spotify", url: "https://open.spotify.com/show/6fRvms2YDICubHjnrbha1V" },
        { name: "YouTube", url: "https://youtube.com/playlist?list=PLPhupFXT_kck&si=ZepatBfoxZ88OlJZ" },
        { name: "Apple Podcasts", url: "https://podcasts.apple.com/us/podcast/歩く植木鉢/id6808640269" }
      ]
    },

    memberFormUrl: "#"
  },

  members: [
    {
      id: "aoki",
      name: "青木志央理",
      bio: "2004年、洛中生まれ・洛中育ち・洛中在住。京都工芸繊維大学・建築専攻の4回生。インスタレーションと映像を制作する。アフォーダンスによるフィクションの発生について考えており、のぼったり入ったりするような空間作品を作りがち。すずめ派。",
      links: [
        { label: "note", url: "https://note.com/popo2510" },
        { label: "Twitter", url: "https://x.com/ooeshiho"},
      ]
    },
    {
      id: "umeda",
      name: "梅田航輝",
      bio: `
        2001年新潟市生まれ。京都工芸繊維大学建築学専攻に在籍。
        そこにある物事や関係性を、「写し取る」ことと「見出す」ことの反復によって、共有可能なメディアへ変換する。
        しばらくは映像を媒体として研究・制作を進めながら、さまざまな場所や人とのつながりを増やし、異なる形式へ展開していくことを目指している。
        リミナルスペース的な空間を思い浮かべるのが好き。
        `,
      links: [
        { label: "ウェブサイト", url: "https://umedakouki.work/" },
      ]
    },
    {
      id: "akiyama",
      name: "秋山",
      bio: ""
    },
    {
      id: "yoshimura",
      name: "吉村",
      bio: ""
    },
    {
      id: "okubo",
      name: "大久保",
      bio: ""
    },
    {
      id: "asada",
      name: "浅田",
      bio: ""
    },
    {
      id: "yukibatan",
      name: "ユキバタン",
      bio: ""
    },
    {
      id: "minami",
      name: "南 佳步",
      bio: "2004年生まれ京都府出身。現在は龍谷大学文学部哲学科教育学専攻に所属。近畿大学理工学部にも在籍していました。幅広く芸術や哲学などを好んでいます。"
    },
  ],

  works: [
    {
      id: "coin-laundry",
      title: "ランドリーシアター",
      period: "2026.09–",
      status: "進行中",
      thumbnail: "assets/laundry/poster-photo.webp",
      summary: "まちの場所にまつわる記憶を、短い戯曲と朗読にして共有するプロジェクト",
      detailHtml: `
      <section>
        <p>シアターに投稿された情報を手がかりに、短い戯曲を一緒につくり、朗読します。</p>
        <p>2026 11/21（土）・12/6（日） 各日 13:00–17:00 @KYOTO LAUNDRY CAFE</p>
        <p>1日でも両日でも参加可</p>
        <p>参加費：ワンドリンクのご注文／使用言語：日本語</p>
        <p><a class="member-detail-link" href="laundry.html">「ランドリーシアター」を開く</a></p>
      </section>
      `,
      participantIds: ["umeda", "aoki", "yoshimura"],
      contributions: {
        umeda: "統括と企画書作成を担当しています。",
        aoki: "企画進行、場所確保、参加者募集、戯曲制作を担当する予定です。",
        yoshimura: "広報を担当する候補です。"
      }
    },
    {
      id: "matsugasaki-festival",
      title: "プラントショ⌇ップ",
      period: "2026.08-",
      status: "進行中",
      thumbnail: "assets/plantshop/view-01.webp",
      visualPage: true,
      summary: "松ヶ崎・一乗寺周辺の7地点で、植物が生える路上のひび割れと、その高さから見える街の風景を記録しました。ひび割れの形を型取りした「植木鉢」と、風景を組み替えた「反実仮草」を制作しています。",
      detailHtml: `
<article class="plant-project">
  <header class="plant-project-header">
    <h1><span>植木鉢</span><span>反実仮草</span></h1>
    <div class="plant-views"><a class="plant-image-link" href="assets/plantshop/view-01-full.webp" data-plant-image data-plant-group="views" aria-label="植木鉢と反実仮草の展示イメージ1を拡大"><img src="assets/plantshop/view-01.webp" alt="植木鉢と反実仮草の展示イメージ1" width="1000" height="667" loading="eager" decoding="async" fetchpriority="high"></a><a class="plant-image-link" href="assets/plantshop/view-02-full.webp" data-plant-image data-plant-group="views" aria-label="植木鉢と反実仮草の展示イメージ2を拡大"><img src="assets/plantshop/view-02.webp" alt="植木鉢と反実仮草の展示イメージ2" width="1000" height="667" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/view-03-full.webp" data-plant-image data-plant-group="views" aria-label="植木鉢と反実仮草の展示イメージ3を拡大"><img src="assets/plantshop/view-03.webp" alt="植木鉢と反実仮草の展示イメージ3" width="1000" height="667" loading="lazy" decoding="async"></a></div>
    <p class="plant-intro">松ヶ崎・一乗寺周辺の7地点で、植物が生える路上のひび割れと、その高さから見える街の風景を記録しました。ひび割れの形を型取りした「植木鉢」と、風景を組み替えた「反実仮草」を制作しています。</p>
  </header>
  <section class="plant-work-section" aria-labelledby="pots-title">
    <h2 id="pots-title">植木鉢</h2>
    <p>植物が生えている路上のコンクリートやアスファルトのひび割れを型取りし、植木鉢として複製しました。周辺の地図と写真を手がかりに、もとになった場所をたどることができます。</p>
    <div class="plant-pots"><a class="plant-image-link" href="assets/plantshop/pot-01-full.webp" data-plant-image data-plant-group="pots" aria-label="植木鉢の作品写真1を拡大"><img src="assets/plantshop/pot-01.webp" alt="植木鉢の作品写真1" width="675" height="900" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/pot-02-full.webp" data-plant-image data-plant-group="pots" aria-label="植木鉢の作品写真2を拡大"><img src="assets/plantshop/pot-02.webp" alt="植木鉢の作品写真2" width="675" height="900" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/pot-03-full.webp" data-plant-image data-plant-group="pots" aria-label="植木鉢の作品写真3を拡大"><img src="assets/plantshop/pot-03.webp" alt="植木鉢の作品写真3" width="675" height="900" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/pot-04-full.webp" data-plant-image data-plant-group="pots" aria-label="植木鉢の作品写真4を拡大"><img src="assets/plantshop/pot-04.webp" alt="植木鉢の作品写真4" width="675" height="900" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/pot-05-full.webp" data-plant-image data-plant-group="pots" aria-label="植木鉢の作品写真5を拡大"><img src="assets/plantshop/pot-05.webp" alt="植木鉢の作品写真5" width="675" height="900" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/pot-06-full.webp" data-plant-image data-plant-group="pots" aria-label="植木鉢の作品写真6を拡大"><img src="assets/plantshop/pot-06.webp" alt="植木鉢の作品写真6" width="675" height="900" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/pot-07-full.webp" data-plant-image data-plant-group="pots" aria-label="植木鉢の作品写真7を拡大"><img src="assets/plantshop/pot-07.webp" alt="植木鉢の作品写真7" width="675" height="900" loading="lazy" decoding="async"></a></div>
  </section>
  <section class="plant-work-section" aria-labelledby="graphics-title">
    <h2 id="graphics-title">反実仮草</h2>
    <p>7地点で、植物の高さから周囲のパノラマを撮影しました。そこに写る建物、塀、樹木などを取り出し、配置を組み替えてひとつの風景に再構成しています。</p>
    <div class="plant-graphics"><a class="plant-image-link" href="assets/plantshop/graphic-01-full.webp" data-plant-image data-plant-group="graphics" aria-label="反実仮草の作品1を拡大"><img src="assets/plantshop/graphic-01.webp" alt="反実仮草の作品1" width="1800" height="378" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/graphic-02-full.webp" data-plant-image data-plant-group="graphics" aria-label="反実仮草の作品2を拡大"><img src="assets/plantshop/graphic-02.webp" alt="反実仮草の作品2" width="1800" height="378" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/graphic-03-full.webp" data-plant-image data-plant-group="graphics" aria-label="反実仮草の作品3を拡大"><img src="assets/plantshop/graphic-03.webp" alt="反実仮草の作品3" width="1800" height="378" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/graphic-04-full.webp" data-plant-image data-plant-group="graphics" aria-label="反実仮草の作品4を拡大"><img src="assets/plantshop/graphic-04.webp" alt="反実仮草の作品4" width="1800" height="378" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/graphic-05-full.webp" data-plant-image data-plant-group="graphics" aria-label="反実仮草の作品5を拡大"><img src="assets/plantshop/graphic-05.webp" alt="反実仮草の作品5" width="1800" height="378" loading="lazy" decoding="async"></a><a class="plant-image-link" href="assets/plantshop/graphic-06-full.webp" data-plant-image data-plant-group="graphics" aria-label="反実仮草の作品6を拡大"><img src="assets/plantshop/graphic-06.webp" alt="反実仮草の作品6" width="1800" height="378" loading="lazy" decoding="async"></a></div>
  </section>
  <section class="plant-locations" aria-label="制作のもとになった7地点">
    <p class="plant-location-description">松ヶ崎・一乗寺周辺。番号は京都工芸繊維大学の中央門からの徒歩距離の目安順です。</p>
    <div class="plant-locations-layout">
      <div class="plant-map-panel">
        <div class="plant-map"><img src="assets/plantshop/map.webp" alt="京都・松ヶ崎と一乗寺周辺の地図" width="1457" height="1507" loading="lazy" decoding="async"><a class="plant-map-pin" href="#site-01" style="left:34.1733%;top:40.5383%" aria-label="01地点の写真とパノラマを見る">01</a><a class="plant-map-pin" href="#site-02" style="left:25.1982%;top:49.9359%" aria-label="02地点の写真とパノラマを見る">02</a><a class="plant-map-pin" href="#site-03" style="left:25.9636%;top:64.1987%" aria-label="03地点の写真とパノラマを見る">03</a><a class="plant-map-pin" href="#site-04" style="left:41.0255%;top:20.2028%" aria-label="04地点の写真とパノラマを見る">04</a><a class="plant-map-pin" href="#site-05" style="left:16.7509%;top:75.1409%" aria-label="05地点の写真とパノラマを見る">05</a><a class="plant-map-pin" href="#site-06" style="left:71.5497%;top:50.9871%" aria-label="06地点の写真とパノラマを見る">06</a><a class="plant-map-pin" href="#site-07" style="left:86.1430%;top:35.0622%" aria-label="07地点の写真とパノラマを見る">07</a></div>
        <p class="plant-map-credit">© OpenStreetMap contributors · ODbL<br><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">openstreetmap.org/copyright</a></p>
      </div>
      <div class="plant-sites"><article class="plant-site" id="site-01">
      <div class="plant-site-heading"><h3>01</h3><a class="plant-map-out" href="https://www.google.com/maps/search/?api=1&amp;query=35.049728,135.78433859999998" target="_blank" rel="noopener noreferrer">地図で開く<span class="sr-only">（新しいタブ）</span></a></div>
      <div class="plant-site-images"><a class="plant-image-link" href="assets/plantshop/site-01-full.webp" data-plant-image data-plant-group="sites" aria-label="01地点の路面とひび割れを拡大"><img src="assets/plantshop/site-01.webp" alt="01地点の路面とひび割れ" width="675" height="900" loading="lazy" decoding="async"></a></div>
      <div class="plant-site-panorama"><a class="plant-image-link" href="assets/plantshop/panorama-01-full.webp" data-plant-image data-plant-group="panoramas" aria-label="01地点の植物の高さから見たパノラマを拡大"><img src="assets/plantshop/panorama-01.webp" alt="01地点の植物の高さから見たパノラマ" width="1800" height="378" loading="lazy" decoding="async"></a></div>
    </article><article class="plant-site" id="site-02">
      <div class="plant-site-heading"><h3>02</h3><a class="plant-map-out" href="https://www.google.com/maps/search/?api=1&amp;query=35.0484157,135.7828577" target="_blank" rel="noopener noreferrer">地図で開く<span class="sr-only">（新しいタブ）</span></a></div>
      <div class="plant-site-images"><a class="plant-image-link" href="assets/plantshop/site-02-full.webp" data-plant-image data-plant-group="sites" aria-label="02地点の路面とひび割れを拡大"><img src="assets/plantshop/site-02.webp" alt="02地点の路面とひび割れ" width="900" height="900" loading="lazy" decoding="async"></a></div>
      <div class="plant-site-panorama"><a class="plant-image-link" href="assets/plantshop/panorama-02-full.webp" data-plant-image data-plant-group="panoramas" aria-label="02地点の植物の高さから見たパノラマを拡大"><img src="assets/plantshop/panorama-02.webp" alt="02地点の植物の高さから見たパノラマ" width="1800" height="378" loading="lazy" decoding="async"></a></div>
    </article><article class="plant-site" id="site-03">
      <div class="plant-site-heading"><h3>03</h3><a class="plant-map-out" href="https://www.google.com/maps/search/?api=1&amp;query=35.046424,135.782984" target="_blank" rel="noopener noreferrer">地図で開く<span class="sr-only">（新しいタブ）</span></a></div>
      <div class="plant-site-images"><a class="plant-image-link" href="assets/plantshop/site-03-full.webp" data-plant-image data-plant-group="sites" aria-label="03地点の路面とひび割れを拡大"><img src="assets/plantshop/site-03.webp" alt="03地点の路面とひび割れ" width="900" height="900" loading="lazy" decoding="async"></a></div>
      <div class="plant-site-panorama"><a class="plant-image-link" href="assets/plantshop/panorama-03-full.webp" data-plant-image data-plant-group="panoramas" aria-label="03地点の植物の高さから見たパノラマを拡大"><img src="assets/plantshop/panorama-03.webp" alt="03地点の植物の高さから見たパノラマ" width="1800" height="378" loading="lazy" decoding="async"></a></div>
    </article><article class="plant-site" id="site-04">
      <div class="plant-site-heading"><h3>04</h3><a class="plant-map-out" href="https://www.google.com/maps/search/?api=1&amp;query=35.0525677,135.7854692" target="_blank" rel="noopener noreferrer">地図で開く<span class="sr-only">（新しいタブ）</span></a></div>
      <div class="plant-site-images"><a class="plant-image-link" href="assets/plantshop/site-04-full.webp" data-plant-image data-plant-group="sites" aria-label="04地点の路面とひび割れを拡大"><img src="assets/plantshop/site-04.webp" alt="04地点の路面とひび割れ" width="900" height="900" loading="lazy" decoding="async"></a></div>
      <div class="plant-site-panorama"><a class="plant-image-link" href="assets/plantshop/panorama-04-full.webp" data-plant-image data-plant-group="panoramas" aria-label="04地点の植物の高さから見たパノラマを拡大"><img src="assets/plantshop/panorama-04.webp" alt="04地点の植物の高さから見たパノラマ" width="1800" height="378" loading="lazy" decoding="async"></a></div>
    </article><article class="plant-site" id="site-05">
      <div class="plant-site-heading"><h3>05</h3><a class="plant-map-out" href="https://www.google.com/maps/search/?api=1&amp;query=35.044896,135.7814639" target="_blank" rel="noopener noreferrer">地図で開く<span class="sr-only">（新しいタブ）</span></a></div>
      <div class="plant-site-images"><a class="plant-image-link" href="assets/plantshop/site-05-full.webp" data-plant-image data-plant-group="sites" aria-label="05地点の路面とひび割れを拡大"><img src="assets/plantshop/site-05.webp" alt="05地点の路面とひび割れ" width="900" height="900" loading="lazy" decoding="async"></a></div>
      <div class="plant-site-panorama"><a class="plant-image-link" href="assets/plantshop/panorama-05-full.webp" data-plant-image data-plant-group="panoramas" aria-label="05地点の植物の高さから見たパノラマを拡大"><img src="assets/plantshop/panorama-05.webp" alt="05地点の植物の高さから見たパノラマ" width="1800" height="378" loading="lazy" decoding="async"></a></div>
    </article><article class="plant-site" id="site-06">
      <div class="plant-site-heading"><h3>06</h3><a class="plant-map-out" href="https://www.google.com/maps/search/?api=1&amp;query=35.0482689,135.79050569999998" target="_blank" rel="noopener noreferrer">地図で開く<span class="sr-only">（新しいタブ）</span></a></div>
      <div class="plant-site-images"><a class="plant-image-link" href="assets/plantshop/site-06-full.webp" data-plant-image data-plant-group="sites" aria-label="06地点の路面とひび割れを拡大"><img src="assets/plantshop/site-06.webp" alt="06地点の路面とひび割れ" width="900" height="900" loading="lazy" decoding="async"></a></div>
      <div class="plant-site-panorama"><a class="plant-image-link" href="assets/plantshop/panorama-06-full.webp" data-plant-image data-plant-group="panoramas" aria-label="06地点の植物の高さから見たパノラマを拡大"><img src="assets/plantshop/panorama-06.webp" alt="06地点の植物の高さから見たパノラマ" width="1800" height="378" loading="lazy" decoding="async"></a></div>
    </article><article class="plant-site" id="site-07">
      <div class="plant-site-heading"><h3>07</h3><a class="plant-map-out" href="https://www.google.com/maps/search/?api=1&amp;query=35.0504927,135.7929136" target="_blank" rel="noopener noreferrer">地図で開く<span class="sr-only">（新しいタブ）</span></a></div>
      <div class="plant-site-images"><a class="plant-image-link" href="assets/plantshop/site-07-full.webp" data-plant-image data-plant-group="sites" aria-label="07地点の路面とひび割れを拡大"><img src="assets/plantshop/site-07.webp" alt="07地点の路面とひび割れ" width="900" height="900" loading="lazy" decoding="async"></a></div>
      <div class="plant-site-panorama"><a class="plant-image-link" href="assets/plantshop/panorama-07-full.webp" data-plant-image data-plant-group="panoramas" aria-label="07地点の植物の高さから見たパノラマを拡大"><img src="assets/plantshop/panorama-07.webp" alt="07地点の植物の高さから見たパノラマ" width="1800" height="378" loading="lazy" decoding="async"></a></div>
    </article></div>
    </div>
  </section>
  <footer class="plant-project-footer">
    <div class="plant-downloads"><a href="assets/plantshop/leaflet-a4.pdf" target="_blank" rel="noopener">リーフレット（PDF）</a><a href="assets/plantshop/project-a3.pdf" target="_blank" rel="noopener">作品説明（PDF）</a></div>
    <p>第56回松ヶ崎祭：2026年11月14日 10:00–20:30／15日 10:00–16:00<br>京都工芸繊維大学 松ヶ崎キャンパス「5の4」<br><a href="https://www.matsufes.info/booth/083" target="_blank" rel="noopener noreferrer">松ヶ崎祭の出展ページ</a></p>
    <div class="member-detail-list" id="workMemberList"></div>
  </footer>
</article>
<dialog class="plant-lightbox" aria-label="作品画像の拡大表示">
  <div class="plant-lightbox-controls"><button type="button" data-plant-zoom aria-label="画像を拡大" aria-pressed="false">＋</button><button type="button" data-plant-close aria-label="画像を閉じる">×</button></div>
  <div class="plant-lightbox-viewport"><img alt=""></div>
</dialog>
      `,
      participantIds: ["aoki", "umeda", "asada"],
      contributions: {
        aoki: "企画と制作を進めています。",
        umeda: "制作に参加しています。",
        asada: "制作に参加しています。"
      }
    },
    {
      id: "saved-space",
      title: "Saved Space",
      period: "2026.08–",
      status: "進行中",
      thumbnail: "",
      summary: "ロボット掃除機が動く無人のリビングを徐々に変容させ、空間に別の意味や生態系が立ち上がる様子を映像にするプロジェクトです。音入れを進め、再撮影と微調整を予定しています。",
      detailHtml: `
      <section>
        <p>音入れを進め、2026年10月に再撮影と微調整を行う予定です。卒業制作展や海外映画祭での発表を検討しています。</p>
      </section>
      `,
      participantIds: ["aoki", "umeda"],
      contributions: {
        aoki: "企画と制作を進めています。",
        umeda: "撮影と制作に参加しています。"
      }
    },
    {
      id: "production",
      title: "生産",
      period: "2026.03-2026.06",
      thumbnail: "assets/thumb-seisan-display.webp",
      summary: "私たちは、建築・映像・美術といった分野を横断し、持続的に制作を行うための「プラントショップ」で活動を始めました。本展は、その最初の活動です。そこで私たちはまず、自分たちにとってもっとも基本的な行為である「作る」ということを、あらためて見つめ直すことにしました。2026年6月26日～30日に、京都・岡崎道のALC Library&Galleryにて展示します。",
      detailHtml: `
      <section>
        <img src="assets/detail-seisan-display.webp" alt="展覧会「生産」の詳細ビジュアル" loading="lazy" decoding="async">
      </section>
      <section class="work-photo-grid" aria-label="展示風景">
        <figure>
          <img src="assets/production-gallery-01-display.webp" alt="展覧会「生産」の展示風景。会場奥に映像作品と椅子があり、壁面に作品と展示文が配置されている" loading="lazy" decoding="async">
          <figcaption>展示風景</figcaption>
        </figure>
        <figure>
          <img src="assets/production-gallery-02-display.webp" alt="展覧会「生産」の展示風景。テーブル上の作品と奥の展示台、天井のダクトが見える" loading="lazy" decoding="async">
          <figcaption>展示風景</figcaption>
        </figure>
      </section>
      <section>
        <p>
          社会の中で「作る」ことは、しばしば「生産」という言葉に置き換えられます。しかし、生産とは、価値ある商品や作品を新しく生み出すことだけなのでしょうか。何かを選び、捨て、残し、整えること。普段は見過ごしているものに気づくこと。生活の中の小さな違和感や、手元の所作、物の変化を捉え直すこと。そうした行為もまた、私たちの日常を作り出しているのではないかと考えました。
        </p>
        <p>
          青木の《ダクト》は、普段は意識されにくい建築設備に目を向けています。ダクトは、空気の通り道でありながら、何かを取り込み、選び、流し、外へ出していく装置でもあります。作品では、天井を這う異様な数のダクトに気づき、それを調べるようにのぼり、のぞきこむという行為を通して、生活の内側を作る「生産」の渦を体験させようとしています。
        </p>
        <p>
          梅田の《遠心力》は、壁や天井にこびりついた歯磨き粉の跡を出発点にしています。本来なら汚れとして拭き取られるはずのものを、フロッタージュによって写し取り、再配置することで、日常の中に現れた逸脱を別のかたちで保存しています。また《あの雲ing》では、曖昧な曇り空の中から「あの雲」を見出し、それを見失うまで追い続けます。ここでは、何かを作ること以前に、差異に気づき、それを見続ける身体の働きそのものが「生産」として捉えられています。
        </p>
        <p>
          秋山の作品は、ペットボトルというありふれた生産物に加工を加えることで、モノの中に潜む性質を引き出そうとするものです。私たちは多くの生産物に囲まれて生活していますが、その原料や生成の過程については、断片的な情報しか持っていません。切断や加熱といった操作を通して、モノと人間、情報と感覚、生産物と生産過程の関係をあらためて考えようとしています。
        </p>
        <p>
          南の作品は、大葉、薬の袋、充電コード、ハンカチなど、生活の中で手に取られ、形を変え、やがて見過ごされていくものや所作を描いています。千切る、開ける、巻き取る、畳むといった小さな行為は、完成品として残るものではありません。しかし、それらの瞬間をすくい上げることで、日常の中にあるささやかな「生産」の手触りが浮かび上がります。
        </p>
        <p>
          本展では、「生産」という言葉を、効率や成果、価値の創出だけに結びつけるのではなく、生活の中にある発見、判断、変化、保存、感覚の働きとして捉え直しています。それぞれの作品は、異なる素材や方法を用いながら、私たちが日々の中で何を見て、何を見過ごし、どのように世界との関係を作っているのかを問いかけています。
        </p>
      </section>
      <section class="work-photo-grid work-photo-grid--documentary" aria-label="展示写真">
        <figure>
          <img src="assets/ダクト.jpg" alt="展覧会「生産」の作品写真。透明な円形の容器の中に、エスカレーターと植物のコラージュが収められている" loading="lazy" decoding="async">
          <figcaption>ダクト</figcaption>
        </figure>
        <figure>
          <img src="assets/遠心力.jpg" alt="展覧会「生産」の作品写真。会場内に吊られた細い構造物とフロッタージュ作品が展示されている" loading="lazy" decoding="async">
          <figcaption>遠心力</figcaption>
        </figure>
        <figure>
          <img src="assets/あの雲 ing.jpg" alt="展覧会「生産」の作品写真。雲の映像が壁面に投影され、右側に作品キャプションが掲示されている" loading="lazy" decoding="async">
          <figcaption>あの雲 ing</figcaption>
        </figure>
        <figure>
          <img src="assets/生産-加工.jpg" alt="展覧会「生産」の作品写真。ペットボトルを加工した透明な造形がテーブル上に並んでいる" loading="lazy" decoding="async">
          <figcaption>生産-加工</figcaption>
        </figure>
        <figure>
          <img src="assets/大葉 薬の袋 充電コード ハンカチ.jpg" alt="展覧会「生産」の作品写真。大葉、薬の袋、充電コード、ハンカチを描いた額装作品が壁面に並んでいる" loading="lazy" decoding="async">
          <figcaption>大葉 薬の袋 充電コード ハンカチ</figcaption>
        </figure>
      </section>
      `,
      participantIds: ["aoki", "umeda", "akiyama", "minami"],
      contributions: {
        aoki: "建築物の内部空間にあるパイプに注目し、制作しました",
        umeda: "歯磨き粉が飛び散った跡、雲の動きに注目し、制作しました",
        akiyama: "日常的に使い捨てていくペットボトルに注目し、制作しました",
        minami: "日常で繰り返している瞬間的な手の動きに注目し、制作しました"
      }
    },

    {
      id: "start",
      title: "立ち上げ",
      period: "2026.02-2026.04",
      thumbnail: "",
      summary: "制作を行う団体というかプラットフォームというか……を作ろうと、大学の知り合い同士でとりあえずDiscordサーバーを作るところから始めました。",
      detailHtml: `
      <section>
        <p>
          立ち上げに関しては、<a href="https://umedakouki.work/practice/2026_plantshop.html">梅田航輝によるブログ</a>に少し書かれています。
        </p>
      </section>
      `,
      participantIds: ["aoki", "umeda", "akiyama", "yoshimura",],
      contributions: {
        aoki: "学生団体よりもう少し社会に接続したコレクティブのような存在を提案しました。",
        umeda: "青木からの相談を受け、コレクティブの基本的な考え方や進め方を整理しました。このウェブサイトを作りました。",
        akiyama: "青木や梅田の関心に近く、活動の背景や批評性の整理担当として参加しました。",
        yoshimura:  "外部との連絡方法や、マーケティングに関してのアドバイザーとして参加しました。"
      }
    },
  ]
};
