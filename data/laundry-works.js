(function () {
  "use strict";

  function lines(text) {
    return text.trim().split(/\n+/).map(function (line) { return line.trim(); }).filter(Boolean);
  }

  function work(id, title, titleEn, place, placeEn, summary, summaryEn, japanese, english) {
    return {
      id: String(id),
      locationId: id,
      title: title,
      titleEn: titleEn,
      place: place,
      placeEn: placeEn,
      summary: summary,
      summaryEn: summaryEn,
      script: lines(japanese),
      scriptEn: lines(english),
      credit: {
        label: "グループA",
        labelEn: "Group A",
        names: ["青木志央理", "AOMOU", "浅井", "O", "ユキバタン", "らんまる"]
      }
    };
  }

  window.LAUNDRY_WORKS = {
    1: work(1, "トレイル", "Trail", "線路沿いの空地", "Vacant lot beside the railway",
      "予定していた電車に乗り遅れたAはタイムスリップし過去へ行く。大陸横断鉄道、馬車からAとそっくりなB,Cが現れ、原因は祠にあるのではと推測する。祠を壊すとAと全く同一のA’が現れ「次の電車まで一分もないよ」と大声でいい、AがハッとするとB,C,A’は消える。",
      "After missing a train, A slips into the past. Lookalikes B and C arrive by transcontinental railway and carriage. They suspect a small shrine is causing the time shifts, but destroying it brings another identical A into view.",
`奥の角からAが現れる
予定の電車が通り過ぎ、息を弾ませて立ち止まる
まぶたを閉じ、呼吸を落ち着かせる
A　（まず連絡して、次の時間を調べて、それから、、、）
まぶたを上げる
白い光が広がる
［大正五年（1916年）シベリア横断鉄道が全線開通］
Aはタイムスリップした、動揺している
石垣の上をシベリア鉄道が走ってくる
けたたましいブレーキ音と白煙を空き地に充満させて停止した
BはAとそっくりな顔立ち、背丈をしたこの時代の人物である
B　「ああ、師走とはよく言ったもんや、迎えの人はまだ来てへんの」
Bは周りを見渡し、Aと目が合う
二人の間を白い光が満たした
［大正五年（1916年）に馬車は登録台数のピークを迎えたが、大正末期から昭和初期にかけて急速に姿を消した］
AとBはタイムスリップした、Bは動揺している
石垣の上を馬車が走ってくる
CはA,Bとそっくりな顔立ち、背丈（以下略）
Cが馬車から降りてくる
C　「、、、」
A,B,Cの三人は驚きつつ集まる
C　「世界にはそっくりな人が三人いるって言いますけど、本当なんですね、皆さんどこからいらしたんですか」
A,Bは顔を見合わせる
A　「それが、場所は同じなんですけど、周りの景色が違っていて、時間が違っているといいますか」
そばの祠から光が漏れ出す
C　「何をおしゃっているのか分かりませ」
［令和八年（2026年）北陸新幹線の桂川ルートが決定］
A,B,Cのはタイムスリップした
A　「元の時代に戻れた」
きっと祠のせいである、と三人は考え、祠を壊すことにした
祠を壊すとAとそっくりなA’が現れ
A’　「次の電車まで一分もないよ！」
Aはハッとした
B,C,A’は消え去った
Aはこちらへ走ってくる
私とのすれ違いざま、Aは
A　「あなたはいつのひと？」
と言った`,
`A appears from around the far corner.
The train A meant to catch passes by. A stops, out of breath.
A closes their eyes and steadies their breathing.
A: (First I should contact them, check the next train, and then...)
A opens their eyes. White light spreads everywhere.
[1916: the Trans-Siberian Railway is completed.]
A has slipped through time and is shaken.
The Siberian Railway approaches along the top of the stone wall.
It stops, filling the vacant lot with shrieking brakes and white smoke.
B belongs to this period and has the same face and build as A.
B: "December really does keep everyone running. Is no one here to meet me yet?"
B looks around and meets A's eyes. White light fills the space between them.
[In 1916, registered horse-drawn carriages peaked in number, then rapidly disappeared from the late Taisho into the early Showa era.]
A and B slip through time. B is shaken.
A carriage approaches along the top of the stone wall.
C has the same face and build as A and B (and so on).
C steps down from the carriage.
C: "..."
Startled, A, B, and C gather together.
C: "They say everyone has three lookalikes in the world. It is true. Where did you all come from?"
A and B look at each other.
A: "It is the same place, but everything around it looks different. It is as if the time is different."
Light leaks from a small shrine nearby.
C: "I do not understa—"
[2026: the Katsuragawa route is selected for the Hokuriku Shinkansen.]
A, B, and C slip through time.
A: "I am back in my own time."
The three decide the shrine must be responsible and resolve to destroy it.
When they break the shrine, A', identical to A, appears.
A': "There is less than a minute until the next train!"
A snaps back to awareness. B, C, and A' vanish.
A runs toward us. As A passes me, they say:
A: "What time are you from?"`),

    2: work(2, "アーケード", "Arcade", "布の日よけが続く商店街", "Shopping street with fabric awnings", "", "",
`その商店街はさびれていた。
道路に上向きに張り出したアーケードはほつれやぶれてしまっている
「ここに絵をかいてもいいですか」
1人の少年がやってきた。少年ははしごをかけ、アーケードにかかれた女の子の横に絵をかきはじめる。毎日毎日、描いていた。
「私も描きたいです」
ここを毎日通っていた女子高生だ。
はしごの数は2本になった。
「僕も描くよ」
店じまいした2軒隣の店の店主だった。
はしごは3本になった。
「俺も描く」
向かいの店の息子だ。
「私も混ざりたいわ」
はす向かいの奥さんだ。
「私も」「僕もいいかな」
人の数が増えていった。
商店街には入れかわりたちかわり、何人かの人が立ち、ずいぶん騒がしくなった。
ボロボロだったアーケードは一枚のキャンバスになり、女の子はその中をころころと動き回っている。
アーケードを作ったころのことを思い出す。
この道に店が増えはじめたころ、アーケードのあの女の子の幕をつくったのは私だった。`,
`The shopping street had fallen quiet.
The arcade projecting over the road was frayed and torn.
"May I paint here?"
A boy arrived, set up a ladder, and began painting beside the girl already pictured on the arcade. He painted there day after day.
"I want to paint too."
It was a high-school girl who walked this way every day. Now there were two ladders.
"I will paint too."
It was the owner of a shop two doors down that had closed. Now there were three ladders.
"Count me in."
It was the son of the shop across the street.
"I want to join as well."
It was the woman from the shop diagonally opposite.
"Me too." "May I?"
More and more people joined.
People came and went along the shopping street. It grew wonderfully noisy.
The tattered arcade became a single canvas, and the girl moved freely through it.
I remember when we first built the arcade.
When shops were beginning to fill this street, I was the one who made the banner with that girl on it.`),

    3: work(3, "何が見えるの？", "What Can You See?", "学校へ続く曲がり道", "Curving road leading to a school", "", "",
`ユ……ユウタ
リ……リカ
ユ「まってよリカちゃん」
リ「あ、みて。バラが咲いてる」
ユ「どこなのリカちゃん」
リ「ほらー、こっちこっち」
ユ「ほんとだ。バラが咲いてる」
リ「あ、みて。すぐい大きな葉っぱ」
ユ「え、どこのなのリカちゃん」
リ「ほらー、ここ、ここ」
ユ「ほんとだ、すごく大きい」
リ「あ、今度は2つならんでる」
ユ「え、どこなのリカちゃん」
リ「そこからじゃみえないよー」`,
`Y... Yuta
R... Rika
Y: "Wait for me, Rika."
R: "Oh, look. A rose is blooming."
Y: "Where is it, Rika?"
R: "Over here. This way."
Y: "You are right. A rose is blooming."
R: "Oh, look. That leaf is enormous."
Y: "Where is it, Rika?"
R: "Right here. Here."
Y: "You are right. It is huge."
R: "Oh, now there are two side by side."
Y: "Where are they, Rika?"
R: "You cannot see them from there."`),

    4: work(4, "あったか〜い / つめた〜い", "Warm / Cold", "踏切のそばの駐車場", "Car park beside a railway crossing", "", "",
`踏切の音、止まる車。
通り過ぎる電車、助手席の犬。
佇む男、自販機のコーヒー。
あったか〜い、つめた〜い。
たるむ電線、広い空。
月が落ちてくる。`,
`The sound of the crossing. Cars come to a stop.
A passing train. A dog in the passenger seat.
A man standing still. Coffee from a vending machine.
Warm. Cold.
Sagging power lines. A wide-open sky.
The moon comes falling down.`),

    5: work(5, "御手洗あおい", "Aoi Mitarai", "地下の線路に沿う細い道", "Narrow road following an underground railway", "", "",
`大学からの帰り道。バックヤード感漂う道を歩き、ある焼き鳥屋へ向かっていた。昨日、役所からこんな手紙が届いたのだ。
「明日の夜18時、立ち飲み焼き鳥　空　というお店に来てください」
たくさんの看板を通り過ぎ、やっと店に辿り着いた。
SE ガラガラガラ
店主「いらっしゃいませー。もしかして……手紙の方ですか？」
「はい、そうです」
店主「……あちらのお席にどうぞ」
席には、男性2人、女性2人が神妙な面持ちで座っていた。
大朏御手洗1「全員揃ったようですね。それでは自己紹介をしましょう。御手洗あおいです」
青木御手洗2「御手洗あおいです」
浅田御手洗3「御手洗あおいです」
木畑御手洗4「御手洗あおいです」
私「えっと……御手洗あおいです」
御手洗1「この狭い町内に、御手洗あおいという名前の人が5人もいる。書類の手続きなどがややこしく、役所の職員はすっかり疲弊してしまったそうです。そこで、役所から、この町内で、御手洗あおいを1人にしろという命令が下りました」
ざわめき（口々に言う）
御手洗3「そんな……子供が小学校入ったばっかりなのに……」
御手洗2「嘘でしょ……困るよ……」
御手洗4「ずっとこの町にいるのに……！今更出ていくなんて無茶だ……！」
御手洗1「落ち着いてください！まだ暮らせないと決まったわけじゃありません」
店主がやってきて、1人1本焼き鳥を手渡し始めた。
御手洗1「みなさん、焼き鳥を食べてください」
焼き鳥は、鶏肉を食べると、鋭い剣のようになった。
御手洗2「戦って決める……ということですか」
御手洗1「その通り。この戦いで生き残ったものが、この町内の御手洗あおいです」
SE 戦い＋走り回る音
御手洗4「や、やめてくれ！」
御手洗3「ごめんなさい！子供が小学校に入ったばかりなんです！　引っ越すわけにはいかないんです！」
御手洗4「お、俺も、ようやくそこのレンタサイクル屋でエリア長になったんだ！引っ越すわけには……」
SE ぐさっ
御手洗4「ぐああ！！」
その場に倒れ込む男。速やかに店の外に運び出され、ゴミ収集車で回収されていった。
SE 戦い
SE ガラガラガラ
走る　息切れ
私「はあ…はあ……よし、家まで逃げ切ったぞ。近くにレンタサイクルがあってよかった。とりあえず今日は寝よう……」
SE 鳥のさえずり
朝起きると、ポストに一通の手紙が入っていた。
「あなたは戦いの途中で逃げ出したため、棄権したとみなします。よって、この町内に御手洗あおいとして住むことはできません。速やかに引越しをしてください」`,
`On the way home from university, I walked along a road that felt like the city's backstage, heading for a yakitori bar. The previous day, a letter from city hall had arrived.
"Please come tomorrow at 6 p.m. to a standing yakitori bar called Sora."
After passing countless signs, I finally reached the bar.
SFX: Rattle, rattle.
Owner: "Welcome. Are you... here about the letter?"
"Yes, that's right."
Owner: "Please take that seat."
Two men and two women sat there with solemn expressions.
Otsuki / Mitarai 1: "It seems everyone is here. Let us introduce ourselves. I am Aoi Mitarai."
Aoki / Mitarai 2: "I am Aoi Mitarai."
Asada / Mitarai 3: "I am Aoi Mitarai."
Kibata / Mitarai 4: "I am Aoi Mitarai."
Me: "Um... I am Aoi Mitarai."
Mitarai 1: "Five people named Aoi Mitarai live in this tiny neighborhood. The paperwork has become so confusing that the city staff are exhausted. City hall has therefore ordered us to reduce the number of Aoi Mitarais here to one."
The group erupts in alarm.
Mitarai 3: "But... my child has only just started elementary school."
Mitarai 2: "You cannot be serious. This is terrible."
Mitarai 4: "I have lived here all my life! You cannot make me leave now!"
Mitarai 1: "Please calm down. It has not yet been decided that you cannot stay."
The owner approaches and hands each person one yakitori skewer.
Mitarai 1: "Everyone, eat your yakitori."
Once the chicken was eaten, each skewer turned into a sharp sword.
Mitarai 2: "You mean... we fight to decide?"
Mitarai 1: "Exactly. Whoever survives will be this neighborhood's Aoi Mitarai."
SFX: Fighting and running.
Mitarai 4: "S-stop!"
Mitarai 3: "I am sorry! My child just started school. I cannot move away!"
Mitarai 4: "I finally became area manager at the rental-cycle shop! I cannot move—"
SFX: Stab.
Mitarai 4: "Aaargh!"
He collapses. He is promptly carried outside and collected by a garbage truck.
SFX: Fighting.
SFX: Rattle, rattle.
Running. Gasping for breath.
Me: "Hah... hah... I made it home. Thank goodness there was a rental bicycle nearby. I will just sleep for now."
SFX: Birds singing.
When I wake up, a letter is waiting in the postbox.
"Because you fled during the battle, you are deemed to have withdrawn. You may no longer live in this neighborhood as Aoi Mitarai. Move away immediately."`),

    6: work(6, "交換", "Exchange", "スタジアムと並木のあいだ", "Between the stadium and the trees", "", "",
`運動公園のスタジアムへ続く通路を進むと、広い広場に出る。木でほどよく囲まれていて心地よい。運動部の集団が横を通り過ぎていった。
広場の脇で、男はひたすらハトをおいかけていた。やがて、木にとまったハトを捕まえることができた。
A「よし、15時に間に合いそうだ」
広場の中央へ行く。しばらくして、川の方から鴨を手に持った男が、道路の方からカラスを手に持った男がやってきた。
3人で輪になり、手に持った鳥たちを向かい合わせる。
SE 鳥たちの声
A「なんか……しゃべってるんですかね」
B「そう見えますね」
C「やっぱり、なんかヤバいバイトだったんですかね……！？　みなさん、どこで見つけました？」
A「Xです」
B「自分もXです」
Cやっぱり闇バイトですかね……」
A「あの、せっかくなので連絡先交換しませんか？」
B「良いですね、しましょう！」
鳥が鳴き止む
A「あ、鳴きやんだ」
B「じゃあ、指示通りやりますか」
指示通り、ハトを川に、鴨を道路に、カラスを木にはなして解散した。`,
`The passage leading to the stadium opens into a broad square, comfortably enclosed by trees. A group of athletes passes by.
At the edge of the square, a man is relentlessly chasing a pigeon. At last, he catches it when it lands in a tree.
A: "Good. I should make it by three."
He moves to the center of the square. After a while, a man carrying a duck arrives from the river, and another carrying a crow arrives from the road.
The three form a circle and hold the birds facing one another.
SFX: Birds calling.
A: "Do you think they are... talking?"
B: "It looks that way."
C: "So this really is some kind of dangerous job, right? Where did you find it?"
A: "On X."
B: "Me too."
C: "Then it really is an illegal gig..."
A: "Since we are here, should we exchange contact details?"
B: "Good idea. Let us."
The birds fall silent.
A: "Oh. They stopped."
B: "Then shall we do what the instructions say?"
As instructed, they release the pigeon by the river, the duck by the road, and the crow into the trees, then go their separate ways.`),

    7: work(7, "地元", "Hometown", "川と車道に挟まれた歩道", "Walkway between river and road", "", "",
`「何もないところなんですよ」
「はあ」
ガラガラガラガラ
スーツケースを引きながら前を歩く彼女は言う
ガラ、、、。
「この店、品揃え良いんですよ」
「へえ」
ガラガラガラガラ
ガラ、、、。と、また止まる
「この川、小さい頃はフェンスなかったな」
「危ないですね」
ガラガラガラガラ
にこやかに前を歩いている
「なんもないところなんですよ」`,
`"There is nothing here, really."
"I see."
Rattle, rattle, rattle, rattle.
She says this as she walks ahead, pulling a suitcase.
Rattle... It stops.
"This shop has a great selection."
"Oh?"
Rattle, rattle, rattle, rattle.
Rattle... It stops again.
"There was no fence along this river when I was little."
"That sounds dangerous."
Rattle, rattle, rattle, rattle.
She walks ahead with a smile.
"There is nothing here, really."`),

    8: work(8, "何が見える？", "What Do You See?", "神社の前の曲がり角", "Corner in front of a shrine", "", "",
`辺りは薄暗くなってきた
太郎「三神さんとお付き合いしていたんですか？！」
花子「ええ、でも10年以上前の話だわ」
太郎「じゃあ、何か特別な理由で呼ばれたんじゃ……」
花子「私はあの人との関係を知っている友人のいたずらだと思っているわ、でも何となく待っているの」
花子「あ、見て。誰か人が来る」
――しかし、誰も来なかった。
花子「たしかに、今人影が動いていたのに……」
太郎「そういえば、三神さん、あの有名な〇〇教に入信しているらしいですよ。最初にお会いしたときにぶ厚い本を渡されて、困ったもんですよ」
花子「そんな……あの人は現実主義者だったのに」
太郎「三神さん、すごく熱心に僕に何か伝えようとしていたけど何も分からなかったですね。とても人柄は良さそうなのに」
花子「え、また誰か来るわ、しかもあの人に似ている」
太郎「あれ？ あんな感じじゃなかったような……」
――見知らぬ人が2人の前を通り過ぎる。
太郎「ほら、最近お会いしたんですよ。三神さんはもっと背が低かったですよ」
花子「あの人、さっきも1度ここに来たわ」
花子「私たちに話しがあるんじゃないかしら」
太郎「ええ！？僕はもう2時間もいますけど、今通りかかった人以外に、ここら辺で人は見かけてないですよ。」
花子「あの人は極度の恥ずかしがり屋だったわ。きっと話しかけるタイミングを見失っているのよ」
太郎「いやいや、三神さんは自分からすごく話しかけてくれる人だよ。この前なんて、ずっとぐいぐい話されるから、すごく疲れたんだもの」
花子「なによ、あなたにはあの人のことがちゃんと見えていないのよ」
花子「さっきだって、通りすぎて行った人がまるで見えていないような素振りだったわ。」
花子「あなたには何も見えていないのよ」
花子「あ、またこっちに人が近づいてきてるわ。」
花子「やっぱりこっちから話しかけるのを待っているのよ。」
花子「あ、ちょっと……待ちなさいよ」
――花子は暗がりに消えていくかのようにその場を立ち去った。
太郎「……今の人も三神さんじゃないよ。三神さんは普段から、高そうなバッグを持ち歩いてるし」`,
`The light around them is beginning to fade.
Taro: "You used to date Mikami?!"
Hanako: "Yes, but that was more than ten years ago."
Taro: "Then perhaps you were invited here for some special reason..."
Hanako: "I think a friend who knew about us is playing a trick on me. Still, somehow, I keep waiting."
Hanako: "Oh, look. Someone is coming."
But no one came.
Hanako: "I am sure I just saw a figure move..."
Taro: "Come to think of it, I hear Mikami joined that famous religion. When we first met, I was handed an enormous book. I did not know what to do with it."
Hanako: "No... Mikami was always a realist."
Taro: "Mikami tried very hard to tell me something, but I could not understand any of it. Still, Mikami seemed very kind."
Hanako: "Wait, someone else is coming. They even look like Mikami."
Taro: "Really? I do not remember Mikami looking like that..."
A stranger passes in front of them.
Taro: "See? I met Mikami recently. Mikami was shorter than that."
Hanako: "That person came here once before."
Hanako: "Perhaps there is something they want to tell us."
Taro: "What? I have been here for two hours, and that is the first person I have seen around here."
Hanako: "Mikami was painfully shy. They must have missed the right moment to speak."
Taro: "No, Mikami was always the one starting conversations. Last time, Mikami talked at me so intensely that I was exhausted."
Hanako: "What do you know? You do not really see Mikami at all."
Hanako: "Even a moment ago, you acted as if you could not see the person walking past."
Hanako: "You cannot see anything."
Hanako: "Oh, someone is coming this way again."
Hanako: "I knew it. They are waiting for us to speak first."
Hanako: "Wait... please wait!"
Hanako leaves, as if disappearing into the darkness.
Taro: "...That was not Mikami either. Mikami always carries an expensive-looking bag."`)
  };
}());
