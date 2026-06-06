const SITE_DATA = {
  site: {
    name: "プラントショップ",
    about: `
      <p>
        プラントショップは、建築・美術・映像・デザインなどを横断しながら、共同で持続的に制作を行うためのコレクティブです。
      </p>
      <p>
        現在は、そこに存在するもののから想像するフィクションと、それを共有することについて話すことが多いです。
      </p>
    `,
    contact: {
      text: `
        <p>
          何かありましたら、下記のメール・SNSよりご連絡ください。私たちとしても、さまざまな方とコミュニケーションを持ちたいと思っていますので、お気軽にどうぞ。
        </p>
      `,
      email: "plant8shop@gmail.com",
      sns: [
        { name: "X", url: "https://x.com/plant8shop" },
        { name: "Instagram", url: "https://www.instagram.com/plant8shop/" },
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
      id: "minami",
      name: "南 佳步",
      bio: "2004年生まれ京都府出身。現在は龍谷大学文学部哲学科教育学専攻に所属。近畿大学理工学部にも在籍していました。幅広く芸術や哲学などを好んでいます。"
    },
  ],

  works: [
    {
      id: "production",
      title: "生産",
      period: "2026.03–",
      thumbnail: "assets/thumb-seisan.png",
      summary: "プラントショップは、分野を横断し、共同で持続的をするコレクティブとして活動を始めました。1回目の活動として、まずは作るということを見つめなおしました。そして、何かしらの作品を作って展示することを活動の成果に設定しました。2026年6月26日～30日に、京都・岡崎道の「ALC Library&Gallery」にて展示予定です。（2026年6月6日更新）",
      detailHtml: `
      <section>
        <h4>展示のステートメント</h4>  
        <p>作ることは主に「生産」という名前で社会にありふれていて、その概念すらも拡張可能なものだということに気づきました。ありふれた「生産」のうち、私たちは日々繰り返している小さなことに注目しました。それは、刹那的な手の動きであったり、ペットボトルであったり、歯磨き粉であったり、パイプやダクトであったりします。これらへの見方を少し変えることで、「生産」的な日常の内側と外側と、その中間にあるものを提示します。</p>
        </section>
      `,
      participantIds: ["aoki", "umeda", "akiyama", "minami"],
      contributions: {
        aoki: "建築物の内部空間にあるパイプに注目し、制作しています",
        umeda: "歯磨き粉が飛び散った跡に注目し、制作しています",
        akiyama: "日常的に使い捨てていくペットボトルに注目し、制作しています",
        minami: "日常で繰り返している瞬間的な手の動きに注目し、制作しています"
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
        aoki: "学生団体よりもう少し社会に接続したコレクティブのような存在をを提案しました。",
        umeda: "青木からの相談を受け、コレクティブの基本的な考え方や進め方を整理しました。このウェブサイトを作りました。",
        akiyama: "青木や梅田の関心に近く、活動の背景や批評性の整理担当として参加しました。",
        yoshimura:  "外部との連絡方法や、マーケティングに関してのアドバイザーとして参加しました。"
      }
    },
  ]
};