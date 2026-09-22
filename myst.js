/* =====================================================================
   myst.js  🕵️ スピンオフ『消えた15秒』
   主人公はあかり（ファン代表・小6）。シュウトの「暴行事件」報道の真実を、
   7人のメンバーとやり取りしながら追う。全7章。手がかり12個。
   問題：流水算／数の性質／計算／図形（角度・面積・体積）／規則性 を中心に出題。
   ===================================================================== */
Object.assign(COACHES, {
  akari: { n: "あかり", img: "img/akari.jpg", role: "ファン代表・小6受験生" },
  mio:   { n: "みお",   img: "img/mio.jpg",   role: "中2・ライブ帰りのファン" },
  yuria: { n: "ゆりあ", img: "img/yuria.jpg", role: "あかりの親友・大ファン" },
});
const MY_MEMBERS = ["tsukasa", "riku", "kanade", "hara", "takuto", "shino", "masaki"];
const MY_CLUES = {
  c1:  { n: "事件の時刻",         d: "事件は 23:12 ごろ。ライブ終演は 21:30。打ち上げのあと、シュウトは1人で駅へ向かっていた" },
  c2:  { n: "消えた冒頭",         d: "拡散動画は15秒。画面のタイムコードは 23:12:40 から始まる。その前の40秒が、ない" },
  c3:  { n: "路地と死角",         d: "現場は駅前の大通りではなく、コンビニ横の路地。防犯カメラは入口しか映さず、奥は死角。動画は奥から撮られていた" },
  c4:  { n: "最後のLINE",         d: "マサキに届いた最後のLINEは 23:09。『駅着いた。誰か困ってる、ちょっと見てくる』" },
  c5:  { n: "酔っていた男性",     d: "相手の男性はかなり酔っていた。ハラが聞いた話。報道には一行も出ていない" },
  c6:  { n: "限定ストラップ",     d: "路地の側溝に、ライブ限定のペンライト用ストラップ。ソウの話では、シュウトが『友達の妹にあげる』と言っていたもの" },
  c7:  { n: "『言えない』",       d: "シュウトは弁護士にも相手のことを話さない。『言わない』ではなく『言えない』と言った" },
  c8:  { n: "3日前のアカウント", d: "動画の投稿アカウントは事件の3日前に作られ、投稿はこの動画1本だけ。フォロワー数の増え方が不自然" },
  c9:  { n: "店員の証言",         d: "コンビニ店員『制服の女の子が泣いてた。男の人に腕をつかまれてて……その動画、途中からじゃないですか』" },
  c10: { n: "みお",               d: "女の子は中2のファン『みお』。ゆりあの姉の友達。親に内緒でライブに来ていたため、名乗り出られなかった" },
  c11: { n: "フル動画",           d: "店員がスマホで撮っていた55秒の動画。前半40秒に、男性がみおの腕をつかみ、シュウトが割って入る場面が映っている" },
  c12: { n: "シュウトの手紙",     d: "『守れたなら、後悔はない。でも、おれの名前が残る限り、7人のステージに「あの事件の」がつく。それだけは嫌だ』" },
};
const MY_CH = ["", "速報", "七人の証言", "路地", "炎上", "みお", "面会", "RUN"];
let M = null;
function myMeta() { DB.meta.myst = DB.meta.myst || { plays: 0, best: 0, ends: [], clues: [], scenes: [] }; return DB.meta.myst; }
function mySave() { DB.meta.mystRun = M; save(); }
const myEv = (c, t, ch) => showEvent({ c, t, ch });
const myLv = () => M.ch <= 2 ? 2 : M.ch <= 4 ? 3 : 4;
const myClue = id => { if (!M.clues.includes(id)) { M.clues.push(id); const mm = myMeta(); if (!mm.clues.includes(id)) mm.clues.push(id); sfx.skill(); toast(`🔎 手がかり「${MY_CLUES[id].n}」を手帳に書いた`); } mySave(); };
const myTrust = (id, v) => { M.trust[id] = clamp((M.trust[id] || 0) + v, 0, 100); };
const myOp = v => { M.opinion = clamp(M.opinion + v, 0, 100); if (v) toast(`📣 世論 ${v > 0 ? "+" : ""}${v}`); };
const opText = () => M.opinion >= 70 ? "🌤 味方が増えた" : M.opinion >= 45 ? "⛅ 半信半疑" : M.opinion >= 25 ? "🌧 厳しい" : "⛈ 炎上中";

/* ---------- 入口 ---------- */
function mystMenu() {
  const mm = myMeta(); const run = DB.meta.mystRun;
  openSheet(`<div class="ptitle">🕵️ スピンオフ『消えた15秒』<small>あかりが主人公のミステリー。全7章・手がかり12個</small></div>
    <div style="font-size:11px;color:var(--ink2);line-height:1.8;margin-bottom:10px">「タイムレッスーのシュウト、暴行の疑いで逮捕」。拡散された15秒の動画。黙秘を続けるシュウト。動揺する7人。<br>ファン代表のあかりは、信じるだけでなく「確かめる」ことを決める。流水算・数の性質・図形・計算の問題を解きながら、真実に近づいていく。</div>
    <div class="dpLine" style="margin-bottom:8px">挑戦 <b>${mm.plays}</b>回　手がかり <b>${mm.clues.length}</b>/12　エンディング <b>${mm.ends.join("・") || "未到達"}</b></div>
    <button class="btn" id="myNew">▶ 第1章から</button>
    <div style="height:6px"></div>
    <button class="btn ghost" id="myCont" ${run ? "" : "disabled"}>つづきから${run ? `（第${run.ch}章）` : ""}</button>
    <div style="height:6px"></div>
    <button class="btn dark" id="myNote">📓 手帳（集めた手がかり）</button>
    <div style="height:8px"></div><button class="btn dark" onclick="closeSheet()">閉じる</button>`);
  $("myNew").onclick = () => { sfx.tap(); if (run && !confirm("進行中の『消えた15秒』を消して、第1章からにする？")) return; closeSheet(); mystStart(); };
  $("myCont").onclick = () => { sfx.tap(); closeSheet(); M = run; myHub(); };
  $("myNote").onclick = () => { sfx.tap(); myNotebook(true); };
}
function myNotebook(fromMenu) {
  const have = M ? M.clues : myMeta().clues;
  openSheet(`<div class="ptitle">📓 あかりの手帳<small>手がかり ${have.length} / 12</small></div>
    <div class="list">${Object.entries(MY_CLUES).map(([id, c]) => `<div class="item" style="cursor:default"><span class="ie">${have.includes(id) ? "🔎" : "❓"}</span><div class="it"><b>${have.includes(id) ? c.n : "？？？"}</b><small>${have.includes(id) ? c.d : "まだ見つけていない"}</small></div></div>`).join("")}</div>
    <div style="height:8px"></div><button class="btn dark" id="nbBack">${fromMenu ? "もどる" : "閉じる"}</button>`);
  $("nbBack").onclick = () => { sfx.tap(); closeSheet(); if (fromMenu) mystMenu(); else myHub(); };
}
function mystStart() {
  M = { ch: 1, energy: 80, opinion: 18, trust: Object.fromEntries(MY_MEMBERS.map(id => [id, 0])), clues: [], done: [], seen: [], talked: [], q: 0, ok: 0, deduce: 0, miss: 0, scenes: [], letter: [] };
  myMeta().plays++; mySave();
  const seq = [
    ["akari", "（夜10時。塾から帰って、机に向かおうとしたとき。\nテレビの音が、止まったように聞こえた）\n\n『速報です。人気グループ・タイムレッスーのメンバー、シュウトさん（17）が、暴行の疑いで警視庁に逮捕されました。\n昨夜、恵比寿の路上で男性と口論になり、押し倒してけがを負わせた疑いです。\nシュウトさんは、相手については話したくない、と供述しているということです』\n\n（持っていたペンが、床に落ちた）"],
    ["yuria", "（スマホが震えた。ゆりあ）\n\nゆりあ『あかり、テレビ見た？？』\nゆりあ『うそだよね？？？』\nゆりあ『動画、まわってる。シュウトが人を押してるやつ。15秒くらいの』\nゆりあ『……見たくない。でも見ちゃった』\n\n（あかりも、見た。15秒。シュウトが男の人を突き飛ばして、男の人が倒れる。\n……それだけ。それだけの動画だった）"],
    ["tsukasa", "（翌朝。事務所の会議室。7人は、誰も座っていなかった）\n\nフマ「……本人に会うまで、何も言うな。誰にも。SNSにも」\n\n（拳が、テーブルの上で白くなっている）"],
    ["riku", "ショリ「彼は、そんなことをする人じゃない。\n\n……でも『じゃない』では、守れない。\n何があったのかを、僕らが知らないと」"],
    ["kanade", "ソウ「シュウトのこと、信じてる。信じてるけど……こわい。\n\nあの動画を見た人、全員が『見た』って思ってる。\n……わたしたちより、たくさん」\n\n（泣いていた。でも、目はそらしていなかった）"],
    ["hara", "ハラ「……ちゃぼす、って言えねえ。今日は。\n\nあいつ、ライブのあと『先に帰ります』って笑ってたんだぞ。\nあの顔で、人を殴りに行くか？」"],
    ["takuto", "タクト「事務所が動いてる。弁護士もついた。\n俺たちは、待つしかない。\n\n……のか？ ほんとに？」"],
    ["masaki", "マサキ「SNS、見るな。全員。\n\n……俺は見た。地獄だった。\n『前から怪しいと思ってた』だってさ。誰だよおまえ」"],
    ["shino", "シノ「……ぼくは、調べる。\n黙って待つのは、性に合わない。\n\n（スマホを取り出して、あかりの名前を探した）\n……小6を巻き込むのは、どうかと思う。でも、あの子はぼくらより冷静だ」"],
    ["akari", "（夜。シノからLINEが来た）\n\nシノ『あかり。ひとつ聞きたい。\nきみは、ファン代表として、どうしたい？』\n\n（少し考えて、打った）\n\nあかり『信じるだけじゃなくて、確かめたいです。\nシュウトさんが、なにを見て、なにをしたのか』\n\nシノ『……よし。一緒にやろう。\nただし、塾の宿題は減らすな。それが条件』"],
  ];
  let k = 0;
  const step = () => { if (k >= seq.length) return myChapterOpen(1); const [c, t] = seq[k++]; myEv(c, t, [{ t: "▶", fx: {}, after: step }]); };
  step();
}

/* ---------- 章の冒頭 ---------- */
const MY_OPEN = {
  1: [["akari", "── 第1章「速報」──\n\n（まず、見えているものを全部見る。\n動画、ニュース、そしてシノの話。\nどれも『事実』のはずなのに、なにかが足りない気がした）"]],
  2: [["shino", "── 第2章「七人の証言」──\n\n（シノに連れられて、事務所のレッスン場へ。\n7人が、あかりを見た）\n\nフマ「……小6を巻き込むのか」\nシノ「彼女はファン代表です。それに、ぼくらより冷静だ」\nフマ「…………1時間だけだ」"], ["akari", "（7人、ひとりずつ話を聞く。\n同じ夜のことを話しているのに、それぞれ違うものを見ていた）"]],
  3: [["akari", "── 第3章「路地」──\n\n（恵比寿。駅から歩いて3分。コンビニの横の、細い路地。\nシノとハラが一緒に来てくれた）\n\nハラ「……ここか。思ったより、せまいな」\nシノ「大通りから1本入ってる。なんでシュウトは、ここに入った？」"]],
  4: [["masaki", "── 第4章「炎上」──\n\n（スポンサー2社が降板。番組の出演が消えた。\nハラが生配信で泣いて、それがまた切り抜かれた）\n\nフマ「黙ってろと言ったろ！」\nタクト「黙ってたら、あいつが悪者のまま終わるだろ！」\nマサキ「やめろよ、2人とも……」\n\n（初めて見た。7人が、ぶつかっているところ）"], ["akari", "あかり「……ケンカしてる場合じゃ、ないと思います！」\n\n（しん、とした。\nソウが、小さく笑った）\n\nソウ「……小6に言われちゃった」\nフマ「…………悪かった。続けろ、あかり」"]],
  5: [["yuria", "── 第5章「みお」──\n\nゆりあ「あかり、そのストラップの写真……これ、みお先輩のだ。\n中2の。うちのお姉ちゃんの友達。\n\nあの日、ライブ行ってたって。\n……でも、親には内緒だったって」"], ["mio", "（放課後の公園。みおは、ベンチの端に座っていた）\n\nみお「……わたしのせいで。\nシュウトさん、わたしの名前が出ないように、ずっと黙ってるんでしょ。\n\nこわくて。言えなくて。……ごめんなさい」"]],
  6: [["shuto", "── 第6章「面会」──\n\n（不起訴。釈放。\nでも、そのニュースは、逮捕のときの100分の1の大きさだった）\n\n（事務所の会議室。シュウトが、7人とあかりの前に立った）\n\nシュウト「……ごめん」"], ["tsukasa", "フマ「なんで言わなかった」\nシュウト「言えるわけないだろ。中学生だぞ。名前が出る」\nフマ「おれたちにも、か」\nシュウト「……7人が知ってたら、7人が隠すことになる。それは、させたくなかった」\n\n（ソウが、声を上げて泣いた）"], ["shuto", "シュウト「……それでさ。\n\nおれ、抜ける」\n\nハラ「は？ ふざけんな」\nタクト「世間は忘れる。半年もすれば」\nマサキ「忘れねえよ、あいつらは。……でも、抜けるのは違う」\nソウ「……シュウトが決めたなら」\nショリ「決めるのは早い」\nフマ「…………1週間、待て。結論は、それからだ」"]],
  7: [["akari", "── 最終章「RUN」──\n\n（脱退が発表された。\n『守るべき人を守れた。後悔はない。7人を、これからもよろしくお願いします』\n\n1か月後。7人の再出発ライブ。\nあかりと、ゆりあと、みおは、客席の真ん中にいた）"]],
};
function myChapterOpen(ch) {
  M.ch = ch; M.done = []; M.energy = clamp(M.energy + 25, 0, 100); mySave();
  const seq = MY_OPEN[ch]; let k = 0;
  const step = () => { if (k >= seq.length) return ch === 6 ? myCh6Choice() : myHub(); const [c, t] = seq[k++]; myEv(c, t, [{ t: "▶", fx: {}, after: step }]); };
  step();
}
function myCh6Choice() {
  myEv("akari", "（7人の目が、あかりに向いた。ファン代表として、なにか言わなきゃいけない）", [
    { t: "「戻ってきてほしいです。ファンはみんな、待ってます」", fx: {}, after: () => { myOp(4); myEv("shuto", "シュウト「……ありがとう。でも『みんな』じゃない。\nおれの名前を見て、チケットを買わない人が、確実にいる。\nそれを7人に背負わせたくない」", [{ t: "▶", fx: {}, after: myHub }]); } },
    { t: "「シュウトさんが決めたことなら、尊重したいです」", fx: {}, after: () => { myTrust("kanade", 6); myEv("kanade", "ソウ「……あかりちゃんは、強いね。\nわたしは、まだ言えない」", [{ t: "▶", fx: {}, after: myHub }]); } },
    { t: "「決める前に、みおさんの気持ちを聞いてほしいです」", fx: {}, after: () => { myOp(6); MY_MEMBERS.forEach(id => myTrust(id, 4)); myEv("riku", "ショリ「……そうだね。\n守った相手の声を聞かずに決めるのは、優しさじゃなくて、逃げだ。\n\nあかり、みおさんに会わせてもらえる？」\n\n（フマが、初めてあかりに頭を下げた）", [{ t: "▶", fx: {}, after: myHub }]); } },
  ]);
}

/* ---------- 章ごとの調査アクション ---------- */
const MY_ACTS = {
  1: [
    { id: "a1", e: "📱", n: "拡散動画を、何度も見る", s: "集中して細部を見る（暗算4問）", g: "anzan", clue: "c2", who: "akari",
      intro: "（15秒の動画。見るたびに胸が痛い。でも、見る。\n……画面の右下。数字が動いている）", ok: "（タイムコード。23:12:40 から始まっている。\n……40秒。この動画の前に、40秒がある。\nなんで、そこから始まってるの？）", ng: "（数字がぼやけて見えない。……もう一回、目をこすって見た。23:12:40。\n……冒頭が、ない）" },
    { id: "a2", e: "📰", n: "ニュース記事を全部読み比べる", s: "情報を整理する（計算の工夫4問）", g: "kufuu", clue: "c1", who: "akari",
      intro: "（新聞5紙、ネットニュース12本。全部読む。\n同じ事件なのに、書いてあることが少しずつ違う）", ok: "（『23時12分ごろ』と書いてあるのは1紙だけ。あとは『深夜』。\nライブの終演は21:30。打ち上げのあと、シュウトは1人で駅へ。\n……時間は、うそをつかない）", ng: "（頭がごちゃごちゃする。……メモに時刻だけ書き出した。23:12。\nこれだけは、全部の記事で同じだった）" },
    { id: "a3", e: "📞", n: "シノと電話する", s: "話を聞く前に頭を整える（3.14の計算4問）", g: "pi", clue: "c4", who: "shino", trust: "shino",
      intro: "シノ「……あかり。マサキが、変なこと言ってた。\nシュウトから最後に来たLINEの時間が、事件の3分前だって」", ok: "シノ「23:09。『駅着いた。誰か困ってる、ちょっと見てくる』\n\n……『誰か困ってる』。\nあかり、これ、殴りに行く人のLINEじゃないよね」", ng: "シノ「……ごめん、電波悪いね。もう一回言う。23:09、『誰か困ってる、ちょっと見てくる』。\n……これが最後のLINE」" },
  ],
  2: [
    { id: "i_tsukasa", e: "⚡", n: "フマに聞く", s: "集中（計算の工夫4問）", g: "kufuu", clue: "c7", who: "tsukasa", trust: "tsukasa", intro: "フマ「……弁護士から聞いた。あいつ、相手のことを何も話さない。\n『言わない』じゃない。『言えない』って言ったそうだ」", ok: "フマ「『言えない』ってのは、言ったら誰かが困るってことだ。\n……あいつは、誰を守ってる？」", ng: "フマ「……聞いてるか。『言えない』だ。『言わない』じゃなくて」" },
    { id: "i_riku", e: "🎩", n: "ショリに聞く", s: "集中（図形4問）", g: "zukei", clue: "c3", who: "riku", trust: "riku", intro: "ショリ「釈放のとき、彼の靴を見た。底に、細かい砂利がついてた。\n駅前の大通りに、砂利はない」", ok: "ショリ「現場は、大通りじゃなくて路地だ。コンビニの横の。\n……駅へ帰る人が、わざわざ入る場所じゃない。入る『理由』があった」", ng: "ショリ「……路地だよ。大通りじゃない。そこを覚えておいて」" },
    { id: "i_kanade", e: "🍬", n: "ソウに聞く", s: "集中（3.14の計算4問）", g: "pi", clue: "c6", who: "kanade", trust: "kanade", intro: "ソウ「あの夜ね、シュウト、ライブでもらった限定ストラップを大事そうに持ってて。\n『友達の妹にあげるんです』って」", ok: "ソウ「あのストラップ、あの日のライブに来た人しか持ってないの。\n……もし現場に落ちてたら、それは『あの日ライブに来た誰か』がいたってこと」", ng: "ソウ「……ストラップ。限定の。覚えておいてね」" },
    { id: "i_hara", e: "💪", n: "ハラに聞く", s: "集中（暗算4問）", g: "anzan", clue: "c5", who: "hara", trust: "hara", intro: "ハラ「これ、言っていいのかわかんねえけど……相手の男、かなり酔ってたらしい。\n知り合いが……いや、聞いた話だ」", ok: "ハラ「報道には一行も出てねえ。『被害者の男性』としか。\n……酔った男が、夜の路地で、なにをしてた？」", ng: "ハラ「……酔ってたんだよ、相手は。それだけ覚えとけ」" },
    { id: "i_takuto", e: "🐚", n: "タクトに聞く", s: "集中（規則性4問）", g: "kisoku", clue: "c8", who: "takuto", trust: "takuto", intro: "タクト「動画を投稿したアカウント、名前が『@run_0916』。\n事件は19日。……16って、3日前だよな」", ok: "タクト「作られたのが3日前。投稿は、この動画1本だけ。\nフォロワーは1日で3万。……買ったな、これ」", ng: "タクト「……3日前に作られたアカウントだ。それだけは間違いない」" },
    { id: "i_masaki", e: "🎤", n: "マサキに聞く", s: "集中（数の性質4問）", g: "seishitsu", clue: "c4", who: "masaki", trust: "masaki", intro: "マサキ「……最後のLINE、見せる。23:09。\n『駅着いた。誰か困ってる、ちょっと見てくる』」", ok: "マサキ「その3分後に、事件。\n……『困ってる誰か』を見に行って、殴るか？ 普通」", ng: "マサキ「……23:09。『誰か困ってる』。頼む、これだけは覚えてくれ」" },
  ],
  3: [
    { id: "b1", e: "📐", n: "現場の見取り図を描く", s: "角度と面積で死角を出す（図形4問）", g: "zukei", clue: "c3", who: "akari",
      intro: "（コンビニの防犯カメラは、路地の入口を向いている。\n路地の幅、カメラの高さ、角度。……メモに描いてみる）", ok: "（カメラが映せるのは入口から4mまで。奥は死角。\n拡散動画は、奥から入口に向かって撮られている。\n……撮った人は、最初から奥にいた）", ng: "（うまく描けない。でも、ひとつだけわかった。カメラは奥を映していない。\n動画は、奥から撮られている）" },
    { id: "b2", e: "⏱", n: "駅からの時間を計算する", s: "速さと流れの計算（流水算4問）", g: "ryusui", clue: "c6", who: "shino",
      intro: "シノ「駅の改札からここまで、歩いて3分。LINEが23:09、事件が23:12。\n……迷ってない。まっすぐ来てる」", ok: "（路地の側溝に、なにか光った。\nペンライトのストラップ。あの日のライブ限定。\n……ソウさんの話と同じ。ここに『あの日のライブに来た誰か』がいた）", ng: "シノ「……あかり、足元。それ、ストラップじゃない？」\n\n（限定の。あの日のライブの）" },
    { id: "b3", e: "🏪", n: "コンビニの店員に話を聞く", s: "落ち着いて聞く（数の性質4問）", g: "seishitsu", clue: "c9", who: "hara",
      intro: "ハラ「すんません、ちょっとだけ。……あの夜のこと、なんか見てないっすか」\n\n店員「……あー。あの、アイドルの」", ok: "店員「あの動画、途中からじゃないですか？\n女の子が泣いてたんですよ。制服の。男の人に腕つかまれてて。\nそこにあの子が走ってきて……」\n\n（ハラの拳が、震えていた）", ng: "店員「……女の子、いましたよ。制服の。泣いてた。\nそれだけは、ほんとです」" },
  ],
  4: [
    { id: "d1", e: "🔢", n: "投稿アカウントを調べる", s: "数字の規則を読む（数の性質4問）", g: "seishitsu", clue: "c8", who: "takuto",
      intro: "タクト「フォロワーの増え方、見てくれ。1時間ごとに、きっちり同じ数ずつ増えてる。\n人間の増え方じゃない」", ok: "（アカウント作成は事件の3日前。投稿は1本。フォロワーは機械的に増えている。\n……この動画は『たまたま撮れた』ものじゃない。誰かが、待っていた）", ng: "タクト「……とにかく、3日前に作られて、1本しか投稿してない。それが全部だ」" },
    { id: "d2", e: "💬", n: "ファンとしてできることを考える", s: "冷静に整理する（計算の工夫4問）", g: "kufuu", clue: null, op: 12, who: "yuria",
      intro: "ゆりあ「あかり、わたしたちにもできること、ある？\n悪口には、悪口で返したくない」", ok: "（2人で考えた。『#見てから話そう』。\n動画の前に40秒あること、店員さんの証言。事実だけを、静かに。\n……夜には、ファンの人たちが同じタグで書き始めていた）", ng: "（うまく言葉にならない。でも、ゆりあと決めた。『事実だけを、静かに』）" },
    { id: "d3", e: "🎞", n: "マサキと動画のコマを数える", s: "規則を数える（規則性4問）", g: "kisoku", clue: "c2", who: "masaki", trust: "masaki", op: 5,
      intro: "マサキ「1秒30コマ。15秒で450コマ。……全部、止めて見る」", ok: "（23:12:40 から 23:12:55。店員さんが言った『女の子が泣いてた』のは、23:12:00ごろ。\n……40秒が、消えている。誰かが、切った）", ng: "マサキ「……40秒。40秒が足りねえ。それだけは確かだ」" },
  ],
  5: [
    { id: "e1", e: "🌊", n: "みおの話を、順番に整理する", s: "流れに逆らって遡る（流水算4問）", g: "ryusui", clue: "c10", who: "mio", trust: null,
      intro: "みお「ライブのあと、駅で……酔ったおじさんに声かけられて。\nこわくて、路地に逃げたら、ついてきて。腕を……」", ok: "みお「そしたら、シュウトさんが走ってきて。『やめてください』って。\nおじさんが振り払おうとして、シュウトさんがわたしの前に出て……おじさんが、転んだ」\n\n（涙で、言葉が途切れた）", ng: "みお「……シュウトさんは、わたしを守ってくれただけです。それだけは、ほんとです」" },
    { id: "e2", e: "📹", n: "フル動画を探す", s: "手がかりの数を数える（数の性質4問）", g: "seishitsu", clue: "c11", who: "hara",
      intro: "ハラ「店員さん、あの夜スマホで撮ってたって言ってたよな。……頼んでみる」", ok: "（55秒の動画。前半40秒。\n男性が、みおの腕をつかんでいる。みおが泣いている。\nシュウトが走ってきて、間に入る。……それが、全部だった）", ng: "ハラ「……あった。フル動画。55秒。前半に、全部映ってる」" },
    { id: "e3", e: "🎩", n: "ショリに相談する", s: "落ち着いて話す（3.14の計算4問）", g: "pi", clue: null, who: "riku", trust: "riku", op: 6,
      intro: "ショリ「動画は、まず弁護士から警察へ。SNSに上げるのは最後だ。\nみおさんを、二度目の被害者にしない」", ok: "ショリ「……あかり。きみがいなかったら、僕らはSNSで叫んで終わってた。\nありがとう。ここからは、大人の仕事だ」", ng: "ショリ「……順番を間違えないこと。それだけ、覚えておいて」" },
  ],
  6: [
    { id: "f1", e: "✉️", n: "シュウトと2人で話す", s: "頭を整える（計算の工夫4問）", g: "kufuu", clue: "c12", who: "shuto",
      intro: "シュウト「……あかりちゃん、だっけ。シノから聞いた。\nありがとな。……手紙、書いた。7人には、まだ渡せてない」", ok: "（手紙）\n『守れたなら、後悔はない。\nでも、おれの名前が残る限り、7人のステージに「あの事件の」がつく。\nそれだけは嫌だ。\n……7人のことを、これからも見ていてください』", ng: "シュウト「……手紙、読んでくれるか。『守れたなら、後悔はない』。それが全部だ」" },
    { id: "f2", e: "🗣", n: "7人それぞれの本音を聞く", s: "1人ずつ（ランダムなジャンル4問）", g: "mix", clue: null, who: "rand",
      intro: "（まだちゃんと話せていないメンバーのところへ）", ok: "（本音を聞けた。……みんな、同じことを言った。『抜けてほしくない。でも、あいつが決めたなら』）", ng: "（うまく話せなかった。でも、目を見て話せた）" },
    { id: "f3", e: "💌", n: "みおの手紙を届ける", s: "落ち着いて（図形4問）", g: "zukei", clue: null, who: "mio", op: 10,
      intro: "みお「シュウトさんに、渡してほしいの。……直接は、まだ勇気が出なくて」", ok: "（シュウトは、手紙を読んで、初めて笑った）\n\nシュウト「……『わたしも、いつか誰かを守れる人になります』だって。\n……よかった。ほんとに、よかった」", ng: "（シュウトは黙って手紙を読んで、うなずいた）" },
  ],
  7: [
    { id: "g1", e: "🎤", n: "ファン代表の手紙を書く", s: "言葉を選ぶ（3択×3）", g: null, clue: null, who: "akari" },
    { id: "g2", e: "🏃", n: "RUNのカウントダウン", s: "最後の5問（ミックス）", g: "final", clue: null, who: "akari" },
  ],
};
function myActsAvail() {
  let acts = MY_ACTS[M.ch].filter(a => !M.done.includes(a.id));
  if (M.ch === 2) acts = acts.filter(a => !M.talked.includes(a.who));
  if (M.ch >= 3 && M.ch <= 6) {
    const left = MY_ACTS[2].filter(a => !M.talked.includes(a.who));
    if (left.length && !M.done.includes("re" + M.ch)) acts.push({ id: "re" + M.ch, e: "🔁", n: "まだ話せていないメンバーに聞く", s: `${left.map(a => PERSON(a.who).n).join("・")}`, g: "interview" });
  }
  return acts;
}
function myNeedDone() { return M.ch === 2 ? 3 : M.ch === 7 ? 2 : 2; }
function myHub() {
  mySave();
  const acts = myActsAvail();
  const doneN = M.done.filter(id => !id.startsWith("re")).length;
  const canDeduce = doneN >= myNeedDone();
  openSheet(`<div class="ptitle">第${M.ch}章「${MY_CH[M.ch]}」<small>気力 ${Math.round(M.energy)}　世論 ${opText()}（${Math.round(M.opinion)}）　手がかり ${M.clues.length}/12</small></div>
    <div class="card statCard" style="margin-bottom:10px">${MY_MEMBERS.map(id => `<div class="strow"><span class="sn" style="width:auto;min-width:64px">${PERSON(id).n}</span><div class="gauge"><u style="width:${M.trust[id]}%;background:${M.trust[id] >= 30 ? "#ffcf5c" : "#4cc9f0"}"></u></div><span class="sv">${Math.round(M.trust[id])}</span></div>`).join("")}</div>
    <div class="lbl" style="margin:4px 0 6px">調査する（気力 −20）</div>
    <div class="list">${acts.map(a => `<button class="item" data-a="${a.id}" ${M.energy < 20 && a.g !== null ? "disabled style='opacity:.45'" : ""}><span class="ie">${a.e}</span><div class="it"><b>${a.n}</b><small>${a.s}</small></div></button>`).join("")}
      <button class="item" data-a="rest"><span class="ie">📚</span><div class="it"><b>塾の宿題をやる（気力回復）</b><small>あかりは受験生。4問解くと頭が切り替わる　気力 +35</small></div></button>
    </div>
    <div style="height:8px"></div>
    ${M.ch < 7 ? `<button class="btn ${canDeduce ? "gold" : "dark"}" id="myDed" ${canDeduce ? "" : "disabled"}>🧩 章末の推理へ${canDeduce ? "" : `（あと${myNeedDone() - doneN}つ調査）`}</button>` : `<button class="btn ${canDeduce ? "gold" : "dark"}" id="myDed" ${canDeduce ? "" : "disabled"}>🎬 エンディングへ</button>`}
    <div style="height:6px"></div>
    <div class="row3"><button class="btn sm dark" id="myNb">📓 手帳</button><button class="btn sm dark" id="myQuit">タイトルへ</button><button class="btn sm dark" id="myHelp">？</button></div>`);
  $("sheetPanel").querySelectorAll("[data-a]").forEach(b => b.onclick = () => { sfx.tap(); closeSheet(); b.dataset.a === "rest" ? myRest() : myAct(b.dataset.a); });
  $("myDed").onclick = () => { sfx.tap(); closeSheet(); M.ch < 7 ? myDeduce() : myEnding(); };
  $("myNb").onclick = () => { sfx.tap(); myNotebook(false); };
  $("myQuit").onclick = () => { sfx.tap(); closeSheet(); mySave(); renderTitle(); };
  $("myHelp").onclick = () => { sfx.tap(); closeSheet(); myEv("akari", "（手帳のルール）\n\n・調査は1回につき気力20。問題を4問解いて、3問以上正解なら手がかりがはっきり見える\n・気力が足りないときは『塾の宿題』で回復\n・章末の推理は、集めた手がかりで答える。間違えると気力が減る\n・メンバーの信頼が30を超えると、特別な場面が起きる\n・手がかり12個をぜんぶ集めて世論を上げると、いちばんいい結末になる", [{ t: "▶", fx: {}, after: myHub }]); };
}
/* ---------- 調査アクション本体 ---------- */
function myQuiz(genre, n, title, onEnd) {
  const lv = myLv();
  const gsel = genre === "mix" ? pick(["zukei", "ryusui", "seishitsu", "kufuu", "anzan", "kisoku"]) : genre;
  startQuiz({ mode: "lesson", genre: gsel, lv, total: n, title, onEnd: r => { $("ovResult").classList.remove("on"); M.q += r.total; M.ok += r.correct; onEnd(r); } });
}
function myAct(id) {
  if (id.startsWith("re")) {
    const left = MY_ACTS[2].filter(a => !M.talked.includes(a.who));
    const a = pick(left); M.done.push(id); return runAct(a, true);
  }
  const a = MY_ACTS[M.ch].find(x => x.id === id);
  if (a.g === null) return myLetter();
  if (a.g === "final") return myFinalQuiz();
  runAct(a, false);
  function runAct(a, reint) {
    M.energy = clamp(M.energy - 20, 0, 100);
    const who = a.who === "rand" ? pick(MY_MEMBERS.filter(id => (M.trust[id] || 0) < 30).concat(MY_MEMBERS)) : a.who;
    if (MY_MEMBERS.includes(who) && M.ch === 2 || reint) M.talked.push(a.who);
    M.done.push(a.id); mySave();
    myEv(who, a.intro, [{ t: "▶ 問題を解く", fx: {}, after: () => myQuiz(a.g, 4, `🔎 ${a.n}`, r => {
      const good = r.correct >= 3;
      if (a.clue) myClue(a.clue);
      const tr = a.trust || (MY_MEMBERS.includes(who) ? who : null);
      if (tr) myTrust(tr, good ? 10 : 5);
      if (a.op) myOp(good ? a.op : Math.round(a.op / 2));
      if (good) { M.energy = clamp(M.energy + 5, 0, 100); }
      mySave();
      myEv(who, (good ? a.ok : a.ng) + `\n\n（${r.correct}/4 正解${good ? "。頭が冴えている" : "。少し焦っている"}）`, [{ t: "▶", fx: {}, after: () => myNight() }]);
    }) }]);
  }
}
function myRest() {
  const intro = pick(["（塾の宿題。……不思議と、問題を解いているときだけは、こわくなかった）", "シノ『宿題やった？』　あかり『いまからです』　シノ『よし。頭を切り替えるのも、調査のうち』", "（お母さん「テレビ、消しなさい。勉強」。……ありがたかった。今は）"]);
  myEv("akari", intro, [{ t: "✏️ 3問解く", fx: {}, after: () => myQuiz("mix", 4, "📚 塾の宿題", r => { M.energy = clamp(M.energy + 35 + r.correct * 3, 0, 100); mySave(); myEv("akari", `（${r.correct}/4。……よし。戻れる）\n\n気力が回復した`, [{ t: "▶", fx: {}, after: myNight }]); }) }]);
}
/* ---------- 夜のランダムイベント／信頼の特別シーン ---------- */
const MY_NIGHT = [
  { id: "n1", c: "yuria", t: "ゆりあ『ねえ、クラスの子に「あかりって、まだあのグループ推してるの？」って言われた』\nゆりあ『……わたし、なんて言えばよかったんだろ』", ch: [
    { t: "『「見てから話そう」って言えばいい』", fx: () => myOp(3) }, { t: "『言い返さなくていい。わたしたちは、確かめてるだけ』", fx: () => { M.energy += 5; } }] },
  { id: "n2", c: "akari", t: "（テレビのコメンテーター「アイドルという立場を考えれば、どんな理由があっても……」\nお母さんが、リモコンでテレビを消した）\n\nお母さん「……あなたが信じてるなら、それでいい。でも、寝なさい」", ch: [{ t: "「うん。……ありがとう」", fx: () => { M.energy = clamp(M.energy + 10, 0, 100); } }] },
  { id: "n3", c: "shino", t: "シノ『あかり。今日、ぼくがフマさんに怒られた。「小6に頼りすぎだ」って』\nシノ『……でも、そのあと言われた。「あの子、いい目をしてるな」って』", ch: [{ t: "『……がんばります』", fx: () => { myTrust("shino", 5); myTrust("tsukasa", 4); } }] },
  { id: "n4", c: "akari", t: "（SAPIXのりょうたろうからLINE）\n\nりょうたろう『おまえのとこの推し、大変だな。……開成の過去問やってる場合じゃないだろ』\nりょうたろう『……手伝えることあったら言え。数の性質なら得意だ』", ch: [{ t: "『ありがと。数の性質、こんど教えて』", fx: () => { M.energy += 5; } }] },
  { id: "n5", c: "hara", t: "ハラ「ちゃぼす……って、今日は言えた。小さくだけど。\n\nあかりちゃんのおかげだ。前に進んでる気がする」", ch: [{ t: "「ちゃぼす！」", fx: () => myTrust("hara", 8) }] },
  { id: "n6", c: "kanade", t: "ソウ「あかりちゃん、受験、いつ？」\nあかり「2月です」\nソウ「……そっか。こんなときに、ごめんね。\nでもね、あかりちゃんがいてくれて、わたしたち、ちゃんと立ってられる」", ch: [{ t: "「わたしも、みんなに支えられてます」", fx: () => myTrust("kanade", 8) }] },
  { id: "n7", c: "takuto", t: "タクト「調べれば調べるほど、誰かが仕組んだ感じがする。\n……腹が立つ。でも、腹を立ててる場合じゃないよな」", ch: [{ t: "「事実を、順番に並べましょう」", fx: () => myTrust("takuto", 7) }] },
  { id: "n8", c: "masaki", t: "マサキ「SNS、まだ見てる。やめられねえ。\n……でも今日、1個だけあった。『動画の前、40秒あるらしいよ』って書いてる人」", ch: [{ t: "「増えます。きっと」", fx: () => { myOp(3); myTrust("masaki", 5); } }] },
  { id: "n9", c: "riku", t: "ショリ「あかり。ひとつだけ約束して。\nこの件が終わったら、ちゃんと受験に戻ること。\n……僕らのせいで、きみの未来を削らせたくない」", ch: [{ t: "「約束します」", fx: () => myTrust("riku", 8) }] },
  { id: "n10", c: "tsukasa", t: "フマ「……おい。今日の調査、聞いた。\n\n……悪くない。以上だ」\n\n（それだけ言って、背中を向けた。耳が赤かった）", ch: [{ t: "（小さくガッツポーズ）", fx: () => myTrust("tsukasa", 8) }] },
  { id: "n11", c: "yuria", t: "ゆりあ『あかり、寝てる？ ……わたし、今日ペンライト振ってみた。部屋で1人で。\nそしたら、なんか泣けてきた。早くライブ行きたい』", ch: [{ t: "『行こう。ぜったい』", fx: () => { M.energy = clamp(M.energy + 8, 0, 100); } }] },
  { id: "n12", c: "akari", t: "（塾の先生「あかりさん、最近、算数の目つきが変わったね。……なにかあった？」\n……『真実を追ってます』とは言えなかった）", ch: [{ t: "「ちょっと、謎解きにハマってて」", fx: () => { M.energy += 5; } }] },
];
const MY_SPECIAL = {
  tsukasa: "（レッスン場。フマが1人で、シュウトのパートを踊っていた）\n\nフマ「……見るな。\n\n……あいつのパート、誰が踊っても、あいつじゃない。\nそれでも踊るのが、おれの仕事だ」",
  riku: "ショリ「僕ね、昔、活動を休んだメンバーを見送ったことがある。\nそのとき何もできなかった。\n\n……今回は、できることを全部やる。あかりが教えてくれた」",
  kanade: "ソウ「あかりちゃん、手、出して。\n\n（手のひらに、小さなお守り）\n\nわたしが活動休んでたとき、ファンの子がくれたの。……次は、あかりちゃんの番」",
  hara: "ハラ「ちゃぼす！！ ……よし、言えた。全力で。\n\nあかりちゃん、俺な、あいつが戻っても戻らなくても、笑ってステージ立つって決めた。\n泣くのは、袖でやる」",
  takuto: "タクト「昔、舞台で共演者が降板したことがあってさ。\n穴は、埋まらない。でも、幕は開く。\n……開けるのが、残った者の仕事なんだ」",
  shino: "シノ「あかり。……ぼく、きみのこと、ちょっと尊敬してる。\n受験生で、小6で、ここまでやる人、見たことない。\n\n……合格したら、ライブ来て。最前列、取っとく」",
  masaki: "マサキ「SNS、消した。今日。\n\n……あかりちゃんが『事実だけを、静かに』って言ったの、効いた。\n俺、静かにするの苦手だけど。やってみる」",
};
function myNight() {
  mySave();
  const sp = MY_MEMBERS.find(id => M.trust[id] >= 30 && !M.scenes.includes(id));
  if (sp) { M.scenes.push(sp); const mm = myMeta(); if (!mm.scenes.includes(sp)) mm.scenes.push(sp); mySave(); return myEv(sp, `✨ 特別な場面\n\n${MY_SPECIAL[sp]}`, [{ t: "▶", fx: {}, after: () => { myTrust(sp, 5); myHub(); } }]); }
  if (Math.random() < .45) return myHub();
  const pool = MY_NIGHT.filter(e => !M.seen.includes(e.id));
  if (!pool.length) return myHub();
  const e = pick(pool); M.seen.push(e.id);
  myEv(e.c, e.t, e.ch.map(c => ({ t: c.t, fx: {}, after: () => { c.fx(); M.energy = clamp(M.energy, 0, 100); myHub(); } })));
}
/* ---------- 章末の推理 ---------- */
const MY_DEDUCE = {
  1: { q: "（手帳を見返す。動画、ニュース、LINE。……いちばん引っかかることは？）", o: [["動画の最初の40秒が、ない", true], ["シュウトの服装が、ライブのときと違う", false], ["事件の場所が、報道と違う", false]], ok: "（そう。誰も『前の40秒』を見ていない。\n見ていないのに、全員が『見た』と思っている）", hint: "タイムコードは 23:12:40 から始まっていた。" },
  2: { q: "（7人の話を並べる。『言えない』『誰か困ってる』『限定ストラップ』……シュウトが黙っている理由は？）", o: [["誰かを守っている", true], ["自分が悪いと思っている", false], ["なにも覚えていない", false]], ok: "（『言わない』じゃなく『言えない』。『誰か困ってる、見てくる』。\n……シュウトさんは、その『誰か』の名前を出さないために黙っている）", hint: "『言えない』は、言ったら誰かが困るということ。" },
  3: { q: "（路地、死角、ストラップ、店員さんの証言。……あの夜、現場にいた『もう一人』は？）", o: [["制服の女の子", true], ["動画を投稿した人だけ", false], ["マサキ", false]], ok: "（制服の女の子。あの日のライブに来ていた。酔った男性に腕をつかまれて、泣いていた。\n……シュウトさんが見た『困ってる誰か』は、この子だ）", hint: "店員さんは『制服の女の子が泣いてた』と言った。" },
  4: { q: "（3日前のアカウント。買われたフォロワー。奥から撮られた動画。……動画を投稿したのは？）", o: [["事件を待ち構えていた、悪意のある第三者", true], ["たまたま通りかかった人", false], ["シュウト本人", false]], ok: "（たまたま撮れた動画を、3日前に作ったアカウントで、40秒切って投稿する人はいない。\n……誰かが、シュウトさんを『そういう人』にしたかった）", hint: "アカウントは事件の3日前に作られていた。" },
  5: { q: "（フル動画が見つかった。みおの証言もある。……真実を伝える、いちばん正しい順番は？）", o: [["まず弁護士から警察へ。SNSは最後", true], ["いますぐSNSにフル動画を上げる", false], ["テレビ局に送る", false]], ok: "（みおさんを、二度目の被害者にしない。\n順番を間違えたら、真実でも人を傷つける。……ショリさんの言うとおりだ）", hint: "みおさんの名前を守ることが最優先。" },
  6: { q: "（シュウトは抜けると言った。手紙も読んだ。……ファン代表として、あかりが言うべきことは？）", o: [["シュウトの決断を受け止めて、7人を全力で応援する。そして、忘れない", true], ["脱退反対の署名を集める", false], ["なにも言わない", false]], ok: "（引き止めることが優しさじゃない。忘れないことが、ファンにできる全部だ。\n……7人のステージを、ちゃんと見届ける）", hint: "シュウトの手紙をもう一度読む。『7人のことを、これからも見ていてください』" },
};
function myDeduce() {
  const d = MY_DEDUCE[M.ch];
  myEv("akari", `🧩 第${M.ch}章の推理\n\n${d.q}`, d.o.map(o => ({ t: o[0], fx: {}, after: () => {
    if (o[1]) { M.deduce++; myOp(3); mySave(); confetti(30); sfx.clear(); return myEv("akari", d.ok, [{ t: "▶ 次の章へ", fx: {}, after: () => myChapterOpen(M.ch + 1) }]); }
    M.miss++; M.energy = clamp(M.energy - 10, 0, 100); mySave(); sfx.bad();
    myEv("shino", `シノ「……ちがう。もう一回、手帳を見て。\n\nヒント：${d.hint}」`, [{ t: "▶ 考え直す", fx: {}, after: myDeduce }]);
  } })));
}
/* ---------- 最終章：手紙と最後の5問 ---------- */
function myLetter() {
  const L1 = ["7人のみなさんへ。ファン代表の、あかりです。", "7人へ。……これ、読むの、すごく緊張してます。", "タイムレッスーの7人へ。小6のあかりです。"];
  const L2 = ["この1か月、わたしは信じるだけじゃなくて、確かめました。だから、胸を張って言えます。あなたたちは、守る人たちです。", "シュウトさんは、誰かを守って、そして7人を守って、去りました。わたしたちは、それを忘れません。", "つらいとき、7人がケンカして、泣いて、それでも立っているのを見ました。……それが、いちばんかっこよかったです。"];
  const L3 = ["わたしは2月に受験です。合格して、最前列に行きます。……走り続けてください。わたしも走ります。", "8人だった日のことも、7人のこれからも、ぜんぶ好きです。RUN、聴かせてください。", "みおさんも、ゆりあも、ここにいます。……ファンは、いなくなりません。"];
  const letter = [];
  const step = (arr, label, next) => myEv("akari", (letter.length ? `（書きかけの手紙）\n『${letter.join("\n")}』\n\n` : "（ステージで読む手紙。……言葉を、選ぶ）\n\n") + `──${label}──`, arr.map(s => ({ t: s, fx: {}, after: () => { letter.push(s); next(); } })));
  step(L1, "書き出し", () => step(L2, "いちばん伝えたいこと", () => step(L3, "結び", () => { M.letter = letter; M.done.push("g1"); myOp(8); mySave(); myEv("akari", `（手紙が、できた）\n\n『${letter.join("\n")}』`, [{ t: "▶", fx: {}, after: myHub }]); })));
}
function myFinalQuiz() {
  myEv("shino", "シノ「……あかり。本番前の儀式、覚えてる？\n\nライブが始まるまで、あと5問ぶんの時間。\nこの5問は、きみがこの1か月で強くなった証明だ。……いこう」", [{ t: "🏃 5問に挑む", fx: {}, after: () => startQuiz({ mode: "lesson", genre: "kufuu", lv: 4, total: 5, title: "🏃 RUNのカウントダウン", onEnd: r => { $("ovResult").classList.remove("on"); M.q += 5; M.ok += r.correct; M.finalOk = r.correct; M.done.push("g2"); mySave(); myEv("shino", `シノ「${r.correct}問。……${r.correct >= 4 ? "見てた。ぜんぶ見てた。……強くなったな" : r.correct >= 2 ? "十分だ。1か月前のきみなら、手も出なかった問題だ" : "……いい。解けたかどうかじゃない。逃げなかった"}」\n\n（客席の照明が、落ちた）`, [{ t: "▶", fx: {}, after: myHub }]); } }) }]);
}
/* ---------- エンディング ---------- */
function myEnding() {
  const mm = myMeta();
  const avgT = MY_MEMBERS.reduce((s, id) => s + M.trust[id], 0) / 7;
  const tier = (M.clues.length >= 12 && M.opinion >= 55) ? "S" : M.clues.length >= 10 ? "A" : "B";
  const score = Math.round(M.clues.length * 5 + M.opinion * .3 + avgT * .3 + (M.finalOk || 0) * 4);
  mm.best = Math.max(mm.best, score); if (!mm.ends.includes(tier)) mm.ends.push(tier);
  DB.meta.mystRun = null; save();
  const live = `（1曲目、『RUN』。\n7人が、8人ぶんの熱で走った。\nサビの前、フマがマイクを客席に向けた。\n\n……客席が、シュウトのパートを歌った。\n全員で。\n\nあかりも、ゆりあも、みおも、泣きながら歌った）`;
  const END = {
    S: `${live}\n\n（MCで、フマがあかりの手紙を読んだ。\n『${M.letter.join("　")}』\n\n会場が、静かになって、それから、いちばん大きな拍手になった）\n\n（翌週。フル動画が正式に公表され、世論は静かに変わった。\n「#見てから話そう」が、トレンドの1位になった）`,
    A: `${live}\n\n（MCで、ショリがあかりの手紙を読んだ。\n『${M.letter.join("　")}』\n\nフマ「……ファン代表は、小6です。おれたちより、大人です」\n会場が、笑って、泣いた）`,
    B: `${live}\n\n（手紙は、ファンクラブのサイトに載った。\n『${M.letter.join("　")}』\n\n世間の風は、まだ冷たい。でも、客席は満員だった。\n……それで、いい。まずは）`,
  }[tier];
  const shutoLetter = `\n\n──シュウトからの手紙（あかり宛）──\n『あかりちゃんへ。ライブ、見てました。配信で。\n7人が、おれのパートを客席に歌わせたとき、久しぶりに声出して泣いた。\n${tier === "S" ? "真実が届いたのは、きみのおかげです。みおちゃんが、もう泣いてないのも。" : "みおちゃんが元気なのは、きみのおかげです。"}\nおれは、いま、地元で子どもにダンスを教えてます。\n……いつか、客席から7人を見ます。きみの隣で。\n受験、がんばれ。逃げなかった人は、強い』`;
  if (tier !== "B") { confetti(80); sfx.clear(); }
  myEv("akari", `🕵️ 『消えた15秒』　結末 ${tier}\n\n手がかり ${M.clues.length}/12　世論 ${Math.round(M.opinion)}　7人の信頼（平均）${Math.round(avgT)}\nあかりの正答率 ${M.q ? Math.round(M.ok / M.q * 100) : 0}%（${M.ok}/${M.q}問）　推理ミス ${M.miss}\n\n${END}${shutoLetter}`, [{ t: "タイトルへ", fx: {}, after: () => { M = null; G = null; renderTitle(); } }]);
}
