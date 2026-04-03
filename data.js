const SITE_DATA = {
  site: {
    name: "プラントショップ",
    about: `
      <p>
        プラントショップは、建築・映像・アート・デザインなどを横断しながら、
        ものの見方や生産のあり方を考えるコレクティブです。
      </p>
    `,
    contact: {
      email: "plant8shop@gmail.com",
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
      id: "umeda",
      name: "梅田",
      icon: "梅",
      bio: "建築・批評・ウェブ担当。機能や効率だけでは捉えきれない身体的経験や、場所との関係を考える。"
    },
    {
      id: "aoki",
      name: "青木",
      icon: "青",
      bio: "写真・感覚的表現・SNS担当。不穏さやストーリー以前の感覚に関心がある。"
    },
    {
      id: "akiyama",
      name: "秋山",
      icon: "秋",
      bio: "言語化・概念整理。現れるものと現れていないものの間、異なる目線の協働に関心がある。"
    },
    {
      id: "yoshimura",
      name: "吉村",
      icon: "吉",
      bio: ""
    },
  ],

  works: [
    {
      id: "production",
      title: "生産",
      period: "2026.03–",
      thumbnail: "assets/20260308_164209.jpg",
      summary: "「生産」と呼ばれていない生産を、写真・文章・映像を通して観察し直すプロジェクト。",
      participantIds: ["umeda", "aoki", "akiyama"],
      contributions: {
        umeda: "企画立案とウェブサイト設計をしました。",
        aoki: "写真収集とSNS展開の検討をしました。",
        akiyama: "概念整理と言語化をしました。"
      }
    },

    {
      id: "start",
      title: "立ち上げ",
      period: "2026.02",
      thumbnail: "",
      summary: "制作を行う団体というかプラットフォームというか……を作ろうと、大学の知り合い同士でとりあえずDiscordサーバーを作るところから始める。",
      participantIds: ["umeda", "aoki", "akiyama", "yoshimura"],
      contributions: {
        umeda: "企画立案とウェブサイト設計をしました。",
        aoki: "写真収集とSNS展開の検討をしました。",
        akiyama: "概念整理と言語化をしました。"
      }
    },
  ]
};