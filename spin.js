/* =====================================================================
   spin.js  📝 スピンオフ「シノと7日間」
   主人公はシノ。日能研目黒校の先生に頼まれ、育成テストまでの7日間、
   あかりの家庭教師になる。プレイヤー（＝シノ）が問題を解けると、あかりの
   理解度が上がる。7日目にあかりが本番を受け、答案が○×で埋まる。
   問題は IKUSEI_QS の18問だけ。毎回ランダム順。
   ===================================================================== */
const SP_UNITS = {
  keisan:  { n: "計算",         e: "🧮", idx: [0, 1] },
  tokushu: { n: "文章題の型",   e: "📖", idx: [2, 3, 5, 6] },
  hi:      { n: "比と割合",     e: "⚖️", idx: [4, 7, 8, 9] },
  hyo:     { n: "平均とニュートン算", e: "📊", idx: [10, 11, 12, 13] },
  baai:    { n: "場合の数",     e: "🃏", idx: [14, 15] },
  kisoku:  { n: "規則性",       e: "🔢", idx: [16, 17] },
};
const SP_PTS = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 7, 7, 8, 8];   /* 配点（合計100） */
const spUnitOf = i => Object.keys(SP_UNITS).find(k => SP_UNITS[k].idx.includes(i));
let SP = null;
function spMeta() { DB.meta.spin = DB.meta.spin || { plays: 0, best: 0, ends: [], stars: 0 }; return DB.meta.spin; }
function spSave() { DB.meta.spinRun = SP; save(); }
const spMood = () => SP.mood >= 80 ? "🔥 絶好調" : SP.mood >= 60 ? "😊 前向き" : SP.mood >= 40 ? "😐 ふつう" : SP.mood >= 20 ? "😢 弱気" : "😭 限界";
const spGain = (unit, v) => { const mult = SP.mood >= 70 ? 1.2 : SP.mood < 35 ? .7 : 1; SP.und[unit] = clamp(SP.und[unit] + v * mult, 0, 100); };
const spEv = (t, ch, c) => showEvent({ c: c || "shino", t, ch });
const spPoint = p => p.k.split("\n\n").slice(-1)[0].replace(/^「/, "").replace(/」$/, "");

/* ---------- 入口 ---------- */
function spinMenu() {
  const m = spMeta();
  const run = DB.meta.spinRun;
  openSheet(`<div class="ptitle">📝 スピンオフ「シノと7日間」<small>${IKUSEI_TITLE}の18問だけで進む、もうひとつの物語</small></div>
    <div style="font-size:11px;color:var(--ink2);line-height:1.8;margin-bottom:10px">主人公はシノ。日能研目黒校の先生に頼まれて、育成テストまでの7日間、あかりの家庭教師になる。<br>きみが問題を解けるほど、あかりの理解度が上がる。7日目、あかりが本番を受ける。</div>
    <div class="dpLine" style="margin-bottom:8px">挑戦 <b>${m.plays}</b>回　あかりの最高点 <b>${m.best}</b>点　⭐ <b>${m.stars}</b></div>
    <button class="btn" id="spNew">▶ はじめから</button>
    <div style="height:6px"></div>
    <button class="btn ghost" id="spCont" ${run ? "" : "disabled"}>つづきから${run ? `（DAY${run.day}）` : ""}</button>
    <div style="height:6px"></div>
    <button class="btn dark" id="spList">📚 問題だけ復習する（18問リスト）</button>
    <div style="height:8px"></div><button class="btn dark" onclick="closeSheet()">閉じる</button>`);
  $("spNew").onclick = () => { sfx.tap(); if (run && !confirm("進行中のスピンオフを消して、はじめからにする？")) return; closeSheet(); spinStart(); };
  $("spCont").onclick = () => { sfx.tap(); closeSheet(); SP = run; spinDay(); };
  $("spList").onclick = () => { sfx.tap(); closeSheet(); openIkusei(); };
}
function spinStart() {
  SP = { day: 1, mood: 55, trust: 10, und: { keisan: 30, tokushu: 20, hi: 15, hyo: 20, baai: 25, kisoku: 20 }, used: [], q: 0, ok: 0, rev: 0, seen: [], akariMiss: [] };
  spMeta().plays++; spSave();
  spEv("（オーディションの合間。日能研目黒校の先生から、シノに電話があった）\n\n先生「この前の受験生応援、ありがとうございました。\n……実は、お願いがあって。\n\nあかりさん、覚えてますか。あの子、7日後に『合格力育成テスト』があるんです。\n算数だけ、どうしても伸びなくて。\n\n受験経験者のシノくんに、7日間だけ……見てもらえませんか」",
    [{ t: "「……やります。ぼくも、算数で泣いた側なので」", fx: {}, after: () => spEv("（翌日。目黒校の自習室。あかりが、少し緊張した顔で座っていた）\n\nあかり「……シノさん！？ ほんとに来てくれたんですか……！」\n\nシノ「うん。7日間、算数だけ一緒にやろう。\n……先に言っとくね。ぼくは天才じゃない。\n落ちた問題を、しつこく拾い直しただけの人間だから」\n\nあかり「……それ、いちばん心強いです」",
      [{ t: "「じゃあ、始めよう」", fx: {}, after: () => spinDay() }]) }]);
}

/* ---------- 1日の流れ ---------- */
function spinDay() {
  if (SP.day >= 7) return spinTest();
  spSave();
  const u = Object.entries(SP_UNITS);
  openSheet(`<div class="ptitle">DAY ${SP.day} ／ 7<small>あかりの育成テストまで あと${7 - SP.day}日</small></div>
    <div class="dpLine" style="margin-bottom:6px">あかりのやる気 <b>${spMood()}</b>　信頼 <b>${Math.round(SP.trust)}</b></div>
    <div class="card statCard" style="margin-bottom:10px">${u.map(([k, v]) => `<div class="strow"><span class="sn" style="width:auto;min-width:96px">${v.e} ${v.n}</span>
      <div class="gauge"><u style="width:${Math.round(SP.und[k])}%;background:${SP.und[k] >= 75 ? "#3ddc97" : SP.und[k] >= 45 ? "#ffcf5c" : "#ff4d63"}"></u></div><span class="sv">${Math.round(SP.und[k])}</span></div>`).join("")}</div>
    <div class="lbl" style="margin:4px 0 6px">今日はどうする？</div>
    <div class="list">
      <button class="item" data-a="unit"><span class="ie">📗</span><div class="it"><b>単元特訓</b><small>苦手な単元をえらんで2問。伸びが大きい</small></div></button>
      <button class="item" data-a="mix"><span class="ie">🎲</span><div class="it"><b>ミックス演習</b><small>全単元からランダムに3問。本番に近い</small></div></button>
      <button class="item" data-a="rest"><span class="ie">☕</span><div class="it"><b>息抜き</b><small>問題はやらない。あかりのやる気が回復する</small></div></button>
    </div>
    <div style="height:8px"></div><button class="btn dark" id="spQuit">タイトルへ（続きは保存）</button>`);
  $("sheetPanel").querySelectorAll("[data-a]").forEach(b => b.onclick = () => { sfx.tap(); closeSheet(); ({ unit: spUnitPick, mix: spMix, rest: spRest })[b.dataset.a](); });
  $("spQuit").onclick = () => { sfx.tap(); closeSheet(); spSave(); renderTitle(); };
}
function spPick(unit) {
  let pool = (unit ? SP_UNITS[unit].idx : IKUSEI_QS.map((_, i) => i)).filter(i => !SP.used.includes(i));
  if (!pool.length) { SP.used = SP.used.filter(i => !(unit ? SP_UNITS[unit].idx : IKUSEI_QS.map((_, j) => j)).includes(i)); pool = unit ? SP_UNITS[unit].idx : IKUSEI_QS.map((_, i) => i); }
  const i = pick(pool); SP.used.push(i); return i;
}
const AKARI_OK = [
  "あかり「あっ……そういうことか！ 線分図にすると見えるんだ！」",
  "あかり「待って、いまの、もう一回自分でやらせて！ ……できた！」",
  "あかり「シノさんの説明、先生より……あ、いや、なんでもないです（笑）」",
  "あかり「これ、この前のテストで空欄にしたやつ……！ 悔しい〜！ でもわかった！」",
  "あかり「ノートに『型』って書いていいですか。この形、次も絶対出る気がする」",
];
const AKARI_NG = [
  "あかり「……シノさんでも止まるんですね。ちょっと安心しました（笑）」",
  "あかり「一緒に考えていいですか。2人ならいけるかも」",
];
/* 1問を「あかりに教える」形で解く */
function spTeach(i, done) {
  const unit = spUnitOf(i), p = IKUSEI_QS[i];
  const m = ikMeta();
  const runQ = (sec, onWin, onLose, onTimeout) => startQuiz({ mode: "lesson", genre: "bun", lv: 4, total: 1,
    fixed: [{ ...p, small: true, time: sec, genre: "bun" }], title: `📝 あかりに教える　大問${p.no}`,
    onEnd: r => { $("ovResult").classList.remove("on"); SP.q++; m.tries[i] = (m.tries[i] || 0) + 1; if (r.correct === 1) return onWin(); if (r.timedOut && onTimeout) return onTimeout(); onLose(); } });
  const win = big => { SP.ok++; m.clear[i] = true; spGain(unit, big ? 24 : 14); SP.mood = clamp(SP.mood + (big ? 6 : 3), 0, 100); SP.trust += 3; spSave(); confetti(24); sfx.clear();
    spEv(`${pick(AKARI_OK)}\n\nシノ「${spPoint(p)}」\n\n（${SP_UNITS[unit].e} ${SP_UNITS[unit].n} の理解度が上がった）`, [{ t: "▶", fx: {}, after: done }]); };
  const lose = () => { SP.mood = clamp(SP.mood - 3, 0, 100); spGain(unit, 4); spSave();
    spEv(`（……手が止まった。あかりが、こっちを見ている）\n\n${pick(AKARI_NG)}\n\nシノ「……ごめん、いま整理する。1回、解説を読ませて」`, [{ t: "📖 解説を読む", fx: {}, after: () => spEv(`──📖 解説──\n\n${p.k}\n\nシノ「……見えた。あかり、もう一回、いま説明しながら解くね」`, [{ t: "🔥 解き直す（5分）", fx: {}, after: () => runQ(300, () => { SP.rev++; win(false); }, () => { spGain(unit, 2); spSave(); spEv(`シノ「……今日はここまで。答えは【${MATH.ansText(p.a)}】。\nこの型、明日もう一回やろう。2回目は違う景色になるから」\n\nあかり「はい。……わたしも、家で解いてみます」`, [{ t: "▶", fx: {}, after: done }]); }) }]) }]); };
  spEv(`📝 大問${p.no}【${p.tag}】\n\nあかり「これ、テスト範囲のやつです。……教えてください」\n\nシノ「よし。ぼくが先に解くから、手元を見てて。3分」`, [{ t: "▶ 解く", fx: {}, after: () => runQ(180, () => win(true), lose, () => spEv("シノ「……時間切れ。でも途中まで合ってる。あと3分だけ延長させて」", [{ t: "🔥 続ける", fx: {}, after: () => runQ(180, () => win(false), lose) }])) }]);
}
function spUnitPick() {
  openSheet(`<div class="ptitle">単元特訓<small>どの単元をやる？（2問）</small></div>
    <div class="list">${Object.entries(SP_UNITS).map(([k, v]) => `<button class="item" data-u="${k}"><span class="ie">${v.e}</span><div class="it"><b>${v.n}</b><small>理解度 ${Math.round(SP.und[k])}　${SP.und[k] < 45 ? "⚠ 要注意" : SP.und[k] < 75 ? "あと少し" : "得意"}</small></div></button>`).join("")}</div>
    <div style="height:8px"></div><button class="btn dark" id="spBack">もどる</button>`);
  $("sheetPanel").querySelectorAll("[data-u]").forEach(b => b.onclick = () => { sfx.tap(); closeSheet(); const u = b.dataset.u; spTeach(spPick(u), () => spTeach(spPick(u), () => spEvening())); });
  $("spBack").onclick = () => { sfx.tap(); closeSheet(); spinDay(); };
}
function spMix() {
  const a = spPick(), b = spPick(), c = spPick();
  spEv("シノ「今日は本番形式。単元をバラバラに3問いく。\n『どの型か』を見抜くところから、勝負だよ」", [{ t: "▶", fx: {}, after: () => spTeach(a, () => spTeach(b, () => spTeach(c, () => { SP.mood = clamp(SP.mood + 4, 0, 100); spEvening(); }))) }]);
}
const SP_REST = [
  "（自習室を出て、公園のベンチへ。あかりがベンチに座ってため息をついた）\n\nあかり「……わたし、算数が嫌いなんじゃなくて、算数に嫌われてる気がしてました」\n\nシノ「ぼくもそう思ってた。中学受験のとき。\nでもね、算数は誰も嫌ってない。ただ『型を知ってる人』にだけ、扉を開けるんだ」",
  "あかり「シノさん、オーディションのとき、こわくないんですか」\n\nシノ「こわいよ。毎回。\nでも、こわいのは本気の証拠だって、ショリさんが言ってた。\n……あかりのテストも、同じ」",
  "（ゆりあが乱入してきた）\n\nゆりあ「あかりばっかりずるい！ シノさん、推しは誰なんですか！」\nシノ「……推し？」\nゆりあ「タイムレッスーの中で！」\nシノ「（少し考えて）……ソウさん、かな。あの人の優しさは、技術だから」\n\nあかり「（メモしてる）」",
  "（自販機の前）\n\nシノ「ココアでいい？」\nあかり「え、いいんですか」\nシノ「受験のとき、母さんが夜食に毎日ココア入れてくれてさ。\n……それだけで、もう1問がんばれたんだよね」",
  "もか「シノさん、自分の受験のとき、いちばん効いた勉強法って何ですか」\n\nシノ「……間違えた問題だけを集めたノート。\n正解した問題は、もう二度と見なかった。\n時間は、まだできないことにだけ使う」\n\nあかり「（ノートの表紙に『まだ』って書いた）」",
  "いっちゃん「シノさーん、テストの見直しってどうやるんですか」\n\nシノ「答えを出したら、問題文にもどって『これ、聞かれたこと？』って3秒だけ確認する。\n82%を出したあとに『引いた割合は？』って聞かれてたら、答えは18%。\nこの3秒で、10点変わる」",
  "まき「暗記が苦手で……」\n\nシノ「算数は暗記じゃなくて『型の引き出し』。\n差集め算の引き出し、ニュートン算の引き出し。\n引き出しの数が増えると、問題を見た瞬間に手が動く」\n\nあかり「引き出し……いま、いくつあるんだろ」",
];
function spRest() {
  SP.mood = clamp(SP.mood + 22, 0, 100); SP.trust += 5; spSave();
  spEv(pick(SP_REST) + "\n\n（あかりのやる気が回復した）", [{ t: "▶", fx: {}, after: () => spEvening() }]);
}

/* ---------- 夜のイベント（固定＋ランダム） ---------- */
const SP_NIGHT = [
  { id: "n1", t: "（帰り際。あかりが小さな声で）\n\nあかり「今日のところ、家でもう一回やっていいですか」", ch: [
    { t: "「これ、宿題プリント。今日の型だけ3問」", fx: () => { Object.keys(SP.und).forEach(k => spGain(k, 3)); } },
    { t: "「今日はもう寝な。寝ると、脳が勝手に整理してくれる」", fx: () => { SP.mood = clamp(SP.mood + 10, 0, 100); } } ] },
  { id: "n2", t: "（あかりのお母さんが迎えに来た。少し険しい顔）\n\nお母さん「……成績、上がってます？ 前回、共通問題がぜんぜんで」\n\n（あかりが、うつむいた）", ch: [
    { t: "「今日、○○算の型が入りました。次のテストで、まず1問取ります」", fx: () => { SP.mood = clamp(SP.mood + 8, 0, 100); SP.trust += 6; } },
    { t: "「……点数より、いま『考え方が合ってて最後の一歩』の段階です。そこは一番伸びる直前です」", fx: () => { SP.mood = clamp(SP.mood + 12, 0, 100); SP.trust += 8; } } ] },
  { id: "n3", t: "（自習室に、見覚えのある男の子が入ってきた。SAPIX白金校の、りょうたろうだ）\n\nりょうたろう「日能研の育成テストって、うちの復習テストより簡単なんでしょ」\n\n（あかりの顔が、こわばった）", ch: [
    { t: "「簡単なテストなんてない。取るべき問題を取るのが、いちばん難しい」", fx: () => { SP.mood = clamp(SP.mood + 6, 0, 100); SP.trust += 4; } },
    { t: "「りょうたろう。開成の過去問、ニュートン算あったよね。……あかり、今日やったやつだ。説明できる？」", fx: () => { spGain("hyo", 8); SP.mood = clamp(SP.mood + 10, 0, 100); } } ] },
  { id: "n4", t: "（あかりが、突然泣き出した）\n\nあかり「……なんで、わたしだけできないの。\nゆりあも、もかも、どんどん進んでるのに」", ch: [
    { t: "「落ち込んでも、成績は1ミリも良くならない。……でも、泣いていい。泣き終わったら1問やろう」", fx: () => { SP.mood = clamp(SP.mood + 15, 0, 100); SP.trust += 8; } },
    { t: "「ぼくも1次審査で、11位だった。……比べる相手は、昨日の自分だけでいい」", fx: () => { SP.mood = clamp(SP.mood + 12, 0, 100); SP.trust += 6; } },
    { t: "（黙って、ノートの『まだ』の文字を指さした）", fx: () => { SP.mood = clamp(SP.mood + 10, 0, 100); SP.trust += 10; } } ] },
  { id: "n5", t: "（スマホが震えた。フマからLINE）\n\nフマ『そっちはどうだ』\nシノ『教えるって、むずかしいです』\nフマ『だろうな。おれもだ。\n……教えてるつもりで、こっちが教わってる。それに気づいたら本物だ。攻めるぞ』", ch: [
    { t: "『攻めます』", fx: () => { SP.mood = clamp(SP.mood + 4, 0, 100); SP.trust += 3; } } ] },
  { id: "n6", t: "先生「シノくん、教え方うまいね。……オーディション落ちたら、うちで講師やらない？（笑）」\n\nあかり「落ちませんから！！」\n\n（教室が笑った）", ch: [
    { t: "「……ぼくも、落ちないつもりです」", fx: () => { SP.mood = clamp(SP.mood + 8, 0, 100); SP.trust += 4; } } ] },
  { id: "n7", t: "あかり「テスト、こわいです。……前の日、いつも眠れなくて」", ch: [
    { t: "「本番前の儀式を教える。【自己宣言】。『わたしは型を18個入れてきた。やれる』って声に出す」", fx: () => { SP.mood = clamp(SP.mood + 12, 0, 100); } },
    { t: "「眠れなくても大丈夫。横になってるだけで、体は7割休んでる」", fx: () => { SP.mood = clamp(SP.mood + 8, 0, 100); } } ] },
  { id: "n8", t: "ゆりあ「シノさん、あかりのこと、どう思います？」\nあかり「ちょっ、ゆりあ！！」\nゆりあ「生徒として！ 生徒として！」\n\nシノ「……1週間前より、手が止まらなくなった。それが全部」", ch: [
    { t: "▶", fx: () => { SP.mood = clamp(SP.mood + 10, 0, 100); SP.trust += 5; } } ] },
  { id: "n9", t: "（あかりのノートを見せてもらった。間違えた問題の横に、全部『なぜ』が書いてある）\n\nシノ「……これ、いつから？」\nあかり「シノさんが来た日から」", ch: [
    { t: "「このノートは、合格したあとも捨てないで」", fx: () => { Object.keys(SP.und).forEach(k => spGain(k, 4)); SP.trust += 6; } } ] },
  { id: "n10", t: "（帰り道。あかりが、ぽつりと）\n\nあかり「本命、東京女学館なんです。……算数、足を引っぱりたくなくて」\n\nシノ「足を引っぱる教科じゃなくて、貯金する教科に変えよう。\n……計算と『型』の問題を全部取れば、それだけで合格点の半分だ」", ch: [
    { t: "▶", fx: () => { spGain("keisan", 6); SP.mood = clamp(SP.mood + 6, 0, 100); } } ] },
];
function spEvening() {
  SP.mood = clamp(SP.mood - 4, 0, 100);
  const fixed = { 6: () => spEv("（前夜。あかりが、折りたたんだ紙を差し出した）\n\nあかり「……お守り、作りました。シノさんのぶんも。\nオーディション、がんばってください」\n\n（開くと、『まだ』の文字と、18個の小さな丸が描いてあった。\n7日間で入れた『型』の数だ）", [
    { t: "「……明日、全部の丸を、○にしておいで」", fx: {}, after: () => { SP.mood = clamp(SP.mood + 15, 0, 100); SP.trust += 10; nextDay(); } } ]) };
  const nextDay = () => { SP.day++; spSave(); spinDay(); };
  if (fixed[SP.day]) return fixed[SP.day]();
  const pool = SP_NIGHT.filter(e => !SP.seen.includes(e.id));
  if (!pool.length || Math.random() < .15) return nextDay();
  const e = pick(pool); SP.seen.push(e.id);
  spEv(e.t, e.ch.map(c => ({ t: c.t, fx: {}, after: () => { c.fx(); nextDay(); } })));
}

/* ---------- DAY7 本番：あかりの答案が埋まる ---------- */
function spinTest() {
  spEv("（DAY7。テスト会場の前。あかりは、いつもより背筋がのびていた）\n\nあかり「シノさん。……行ってきます」\nシノ「うん。……型は18個、ぜんぶ入ってる。\n聞かれたことに答える。それだけ」\n\nあかり「（小声で）わたしは型を18個入れてきた。やれる」", [{ t: "▶ 開始", fx: {}, after: run }]);
  function run() {
    const moodB = (SP.mood - 50) / 400;
    const res = IKUSEI_QS.map((p, i) => { const u = spUnitOf(i); const pr = clamp(SP.und[u] / 100 * .92 + moodB + .04, .05, .98); return { i, ok: Math.random() < pr }; });
    const score = res.reduce((s, r) => s + (r.ok ? SP_PTS[r.i] : 0), 0);
    SP.result = res; SP.score = score; SP.akariMiss = res.filter(r => !r.ok).map(r => r.i); spSave();
    const rows = res.map(r => `<div class="missRow" style="${r.ok ? "" : "color:#ff4d63"}"><span>大問${IKUSEI_QS[r.i].no}　${IKUSEI_QS[r.i].tag}</span><em>${r.ok ? "○" : "×"} ${SP_PTS[r.i]}点</em></div>`).join("");
    $("resPanel").innerHTML = `<div class="resHead"><div class="lbl">あかりの答案　${IKUSEI_TITLE}</div>
      <div class="resScore">${score}<small> 点</small></div>
      <div class="resRank" style="background:${score >= 90 ? "#ffcf5c" : score >= 75 ? "#ff9f43" : score >= 60 ? "#3ddc97" : "#4cc9f0"};color:#08080d">${score >= 90 ? "🏆 満点級" : score >= 75 ? "自己ベスト更新" : score >= 60 ? "共通問題を突破" : "基礎は固まった"}</div>
      <div style="font-size:10.5px;color:var(--ink3);margin-top:8px">正解 ${res.filter(r => r.ok).length} / 18　やる気 ${spMood()}</div></div>
      <div class="missBox"><div class="mt">答案</div>${rows}</div>
      <button class="btn" id="resOk">結果を受け止める</button>`;
    $("ovResult").classList.add("on");
    $("resOk").onclick = () => { sfx.tap(); $("ovResult").classList.remove("on"); redo(); };
  }
  function redo() {
    const miss = SP.akariMiss.slice(0, 3);
    if (!miss.length) return spinEnding(0);
    spEv(`（テストの帰り道。あかりが答案のコピーを握りしめていた）\n\nあかり「……間違えたところ、今日のうちに解き直したいです。\nシノさん、一緒にやってくれますか」\n\n（${miss.length}問。全部○にできたら、この7日間は完成だ）`, [{ t: "「もちろん。……全部、○にしよう」", fx: {}, after: () => { let k = 0, stars = 0; const step = () => { if (k >= miss.length) return spinEnding(stars); const i = miss[k++]; const p = IKUSEI_QS[i]; startQuiz({ mode: "lesson", genre: "bun", lv: 4, total: 1, fixed: [{ ...p, small: true, time: 240, genre: "bun" }], title: `📝 解き直し　大問${p.no}`, onEnd: r => { $("ovResult").classList.remove("on"); SP.q++; if (r.correct === 1) { SP.ok++; stars++; ikMeta().clear[i] = true; confetti(20); spEv(`あかり「……○になった！！」\n\nシノ「${spPoint(p)}」`, [{ t: "▶", fx: {}, after: step }]); } else { spEv(`シノ「……この問題は、ぼくの宿題にする。答えは【${MATH.ansText(p.a)}】。\n\n${p.k.split("\n\n")[0]}」`, [{ t: "▶", fx: {}, after: step }]); } } }); }; step(); } }]);
  }
}
function spinEnding(stars) {
  const m = spMeta(); const score = SP.score;
  const tier = score >= 90 ? "S" : score >= 75 ? "A" : score >= 60 ? "B" : "C";
  m.best = Math.max(m.best, score); m.stars += stars; if (!m.ends.includes(tier)) m.ends.push(tier);
  const acc = SP.q ? Math.round(SP.ok / SP.q * 100) : 0;
  const END = {
    S: "（1週間後。目黒校の掲示板に、あかりの名前がいちばん上にあった）\n\nあかり「シノさん……！ 算数、クラスで1位でした……！」\n\nシノ「……あかりが取ったんだよ。ぼくは、型を見せただけ」\n\nあかり「ちがいます。『まだ』って書いていいって、教えてくれたから」\n\n（ゆりあが後ろで泣いていた。理由は、たぶん違う）",
    A: "（1週間後。あかりが答案を持って走ってきた）\n\nあかり「自己ベストです！！ 共通問題、はじめて半分以上取れました！」\n\nシノ「……よし。次は『最後の一歩』を全部取る。\n考え方は、もう合ってるから」\n\nあかり「はい！ ……あの、オーディション、絶対見ます」",
    B: "（1週間後。あかりは、答案を見て少し笑った）\n\nあかり「基礎は全部取れました。共通は……まだ」\n\nシノ「『まだ』でいい。1週間で、ここまで来た。\n次の7日間は、あかりが1人でやれる」\n\nあかり「……1人じゃないです。ノートに、シノさんの声が残ってるので」",
    C: "（1週間後。あかりは、少し落ち込んでいた）\n\nあかり「……ごめんなさい。せっかく教えてもらったのに」\n\nシノ「謝らない。落ち込んでも、成績は1ミリも良くならない。\nでも、今日の『なぜ』を書けば、1ミリ良くなる。\n……次のテストまで、また来るよ」\n\nあかり「（涙をふいて）……はい。待ってます」",
  }[tier];
  const letter = `\n\n──あかりからの手紙──\n『シノさんへ。7日間、ありがとうございました。\n${stars ? `解き直しで${stars}問、○にできました。` : ""}わたしの引き出しは、いま18個です。\nオーディション、がんばってください。わたしも、がんばります。\n${tier === "S" || tier === "A" ? "……こんど、ゆりあと一緒にライブに行きます。" : "……次は、もっといい点を報告します。"}』`;
  DB.meta.spinRun = null; save();
  if (tier === "S" || tier === "A") { confetti(70); sfx.clear(); }
  spEv(`📝 スピンオフ「シノと7日間」　結果\n\nあかりの点数　${score}点（ランク ${tier}）\nきみ（シノ）の正答率　${acc}%（${SP.ok}/${SP.q}問）　解き直しの⭐ ${stars}\n\n${END}${letter}`, [{ t: "タイトルへ", fx: {}, after: () => { SP = null; G = null; renderTitle(); } }]);
}
