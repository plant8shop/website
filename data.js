const SITE_DATA = {
  site: {
    name: "プラントショップ",
    about: `
      <p>
        プラントショップは、建築・映像・アート・デザインなどを横断しながら、制作・展示・販売を行うためのコレクティブです。
      </p>
      <p>
        1人では難しいことを実現したり、活動を通じてコミュニケーションを持つことを目指しています。
      </p>
    `,
    contact: {
      email: "plant8shop@gmail.com",
      text: `
        <p>
          ご連絡は、下記のメール・SNSよりお願いします。基本的には、なんでも積極的に対応いたします。
        </p>
      `,
      sns: [
        { name: "X", url: "#" },
        { name: "Instagram", url: "#" },
        { name: "YouTube", url: "#" }
      ]
    },

    apiBaseUrl: "https://script.google.com/macros/s/AKfycbwf3i8RJZPmo5UeXs-Sm_LVgYcOa4LblQ6igTZEH1L3mzdqRDhjnhxy7mw7GDMxLZ2PEA/exec",
    memberFormUrl: "#"
  },

  members: [
    {
      id: "aoki",
      name: "青木志央理",
      icon: "青",
      bio: "2004年、洛中生まれ・洛中育ち・洛中在住。京都工芸繊維大学・建築専攻在籍。ものづくりが好きで、小中高では小説、大学からは映画と建築もつくっている。猫派か犬派か聞かれたらすずめ派と答えるくらいすずめが好き。リミナルスペースに関心が強い。"
      links: [
        { label: "note", url: "https://note.com/popo2510" },
        { label: "Twitter", url: "https://x.com/ooeshiho"},
      ]
    },
    {
      id: "umeda",
      name: "梅田航輝",
      icon: "梅",
      bio: "2001年新潟市生まれ。現在は京都工芸繊維大学建築学専攻修士課程に在籍。建築、映像、美術に関心があり、関連した活動や作品制作を行っています。",
      links: [
        { label: "ウェブサイト", url: "https://umedakouki.github.io" },
      ]
    },
    {
      id: "akiyama",
      name: "秋山",
      icon: "秋",
      bio: ""
    },
    {
      id: "yoshimura",
      name: "吉村",
      icon: "吉",
      bio: ""
    },
    {
      id: "minami",
      name: "南 佳步",
      icon: "南",
      bio: "2004年生まれ京都府出身。現在は龍谷大学文学部哲学科教育学専攻に所属。近畿大学理工学部にも在籍していました。幅広く芸術や哲学などを好んでいます。"
    },
  ],

  works: [
    {
      id: "production",
      title: "生産",
      period: "2026.03–",
      thumbnail: "assets/20260308_164209.jpg",
      summary: "プラントショップは、持続的に制作・展示・販売するコレクティブとして活動を始めました。まずは、作るということを考えてみます。すると、作ることは主に「生産」という名前で社会にありふれていて、その概念すらも拡張可能なものだということに気づきました。ありふれた「生産」の中で、いったい何を作品にできるのかを考えていきます。",
      detailHtml: `
        <p>Under Construction......</p>
      `,
      participantIds: ["aoki", "umeda", "akiyama", "minami"],
      contributions: {
        aoki: "実際に制作するものを模索しています。",
        umeda: "企画を立案し、実際に制作するものを模索しています。",
        akiyama: "実際に制作するものを模索しています。",
        minami: "実際に制作するものを模索しています。"
      }
    },

    {
      id: "start",
      title: "立ち上げ",
      period: "2026.02-2026.04",
      thumbnail: "",
      summary: "制作を行う団体というかプラットフォームというか……を作ろうと、大学の知り合い同士でとりあえずDiscordサーバーを作るところから始めました。",
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