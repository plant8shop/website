const SITE_DATA = {
  site: {
    name: "プラントショップ",
    about: `
      <p>
        プラントショップは、空間や場所をモチーフとした、体験の創造や映像表現を主軸とし、共同で持続的に制作するコレクティブです。
      </p>
      <p>
        個人では得にくい人員、技術、道具、場所、人脈などをつなぎ、制作、発表、販売へ進める環境をつくっています。
      </p>
    `,
    announcements: [
      {
        id: "walking-pot-podcast",
        date: "2026.09.04",
        title: "ポッドキャスト「歩く植木鉢」を始めました",
        summary: "プラントショップの人類メンバーによるポッドキャスト「歩く植木鉢」の配信を始めました。",
        body: "制作の途中で考えていること、最近見た作品、日々の出来事などを、散歩するように話します。Spotify、YouTube、Apple Podcastsでお聴きいただけます。",
        status: "latest",
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
      { memberId: "aoki", roles: ["全体進行", "渉外", "広報・Instagram", "広報・note", "記録"] },
      { memberId: "umeda", roles: ["会計", "Webサイト運営", "機材備品管理"] },
      { memberId: "akiyama", roles: ["広報・X", "広報・note"] },
      { memberId: "yoshimura", roles: ["分析"] },
      { memberId: "okubo", roles: [] }
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
      bio: "2004年、洛中生まれ・洛中育ち・洛中在住。京都工芸繊維大学・建築専攻在籍。ものづくりが好きで、小中高では小説、大学からは映画と建築もつくっている。猫派か犬派か聞かれたらすずめ派と答えるくらいすずめが好き。リミナルスペースに関心が強い。",
      links: [
        { label: "note", url: "https://note.com/popo2510" },
        { label: "Twitter", url: "https://x.com/ooeshiho"},
      ]
    },
    {
      id: "umeda",
      name: "梅田航輝",
      bio: "2001年新潟市生まれ。現在は京都工芸繊維大学建築学専攻修士課程に在籍。建築、映像、美術に関心があり、関連した活動や作品制作を行っています。",
      links: [
        { label: "ウェブサイト", url: "https://umedakouki.github.io" },
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
      id: "saved-space",
      title: "Saved Space",
      period: "2026.08–",
      status: "進行中",
      thumbnail: "",
      summary: "ロボット掃除機が動く無人のリビングを徐々に変容させ、空間に別の意味や生態系が立ち上がる様子を映像にするプロジェクトです。音入れを進め、再撮影と微調整を予定しています。",
      detailHtml: `
      <section>
        <h4>進行状況</h4>
        <p>音入れを進め、2026年10月に再撮影と微調整を行う予定です。卒業制作展や海外映画祭での発表を検討しています。</p>
      </section>
      `,
      participantIds: ["aoki", "umeda"],
      additionalParticipants: "木畑ほか撮影参加者",
      contributions: {
        aoki: "企画と制作を進めています。",
        umeda: "撮影と制作に参加しています。"
      }
    },
    {
      id: "plantshop-document",
      title: "プラントショ⌇ップ",
      period: "2026–",
      status: "進行中",
      thumbnail: "",
      summary: "プラントショップとは何かを、活動を見る人と参加を考える人に伝えるための資料をつくるプロジェクトです。目的や参加の仕組みを、Web・PDF・冊子などで説明することを検討しています。",
      detailHtml: `
      <section>
        <h4>進行状況</h4>
        <p>見る人向けの資料と参加者向けの資料を分けて検討し、参加者向け資料の制作を進める予定です。</p>
      </section>
      `,
      participantIds: ["umeda"],
      contributions: {
        umeda: "企画と資料制作を進めています。"
      }
    },
    {
      id: "coin-laundry",
      title: "コインランドリー（仮）",
      period: "2026.09–",
      status: "進行中",
      thumbnail: "",
      summary: "コインランドリーの待ち時間に、街の記憶や他者の存在を想像する小さな演劇的状況をつくるプロジェクトです。写真・地図・短い戯曲・音声を公開し、ワークショップを通じて戯曲を制作する計画です。",
      detailHtml: `
      <section>
        <h4>進行状況</h4>
        <p>実施場所の確保、参加者募集、広報などを分担し、2026年10月後半から11月末の実施に向けて準備しています。</p>
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
      id: "production",
      title: "生産",
      period: "2026.03–",
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
        <h4>トークについて</h4>
        <p>
          6月28日（日）13時より、展示会場にて30分～1時間程度のトークを開催します。建築家で、京都工芸繊維大学特任准教授の木内俊克先生をお呼びし、作品について話します。予約は必要ありません。気軽にお越しください。
        </p>
        <h4>展示について</h4>  
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
          立ち上げに関しては、<a href="https://umedakouki.github.io/practice/2026_plantshop.html">梅田航輝によるブログ</a>に少し書かれています。
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
