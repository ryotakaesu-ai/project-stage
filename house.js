/* =====================================================================
   house.js  タイプロハウス編（DAY13〜18）
   3次審査＝メンバープロデュース審査。フマ／ショリ／ソウが1チームずつ
   プロデューサーになり、候補生はタイプロハウスで5日間の共同生活を送る。
   実際のタイプロ5次審査（team KIKUCHI／SATO／MATSUSHIMA）を下敷きにした
   中間発表・夕食当番・部屋割りじゃんけん・撮影・外出・衝突・合同BBQ・手紙・プレゼント。
   ===================================================================== */
const PRODS = {
  tsukasa: { n: "フマ",   team: "team FUMA",  song: "newphase", e: "⚡", style: "かっこいい系。言語化の鬼。「攻めるぞ」",
             d: "難曲『New Phase』。厳しいが、誰よりも本気で向き合ってくれる。表現力と精神力が伸びる", up: ["ex", "me"], call: "攻めるぞ！！" },
  riku:    { n: "ショリ", team: "team SHORI", song: "kakumei",  e: "🎩", style: "王道。先輩の伝統を継ぐ。「ソロパートは自分で獲りにこい」",
             d: "『革命のDancin' Night』。生オケにこだわる本気の王道。歌唱力とダンスが伸びる", up: ["vo", "da"], call: "大人の余裕。" },
  kanade:  { n: "ソウ",   team: "team SOU",   song: "sweet",    e: "🍬", style: "自然な笑顔。「0点で楽しんでみよう」",
             d: "『SWEET』。甘く自然な笑顔が命の難曲。トーク（愛嬌）と表現力が伸びる。愛情がすごい", up: ["tk", "ex"], call: "その目に、焼き付けろや。" },
};
const PROD_IDS = ["tsukasa", "riku", "kanade"];
SONGS.push(
  { id: "newphase", n: "New Phase",            e: "⚡", k: "ex", d: "team FUMAの課題曲。激しい振り付けの難曲。表現力が審査に上乗せ" },
  { id: "kakumei",  n: "革命のDancin' Night",  e: "🎩", k: "vo", d: "team SHORIの課題曲。先輩の伝統を継ぐ王道ナンバー。歌唱力が審査に上乗せ" },
  { id: "sweet",    n: "SWEET",                e: "🍬", k: "tk", d: "team SOUの課題曲。自然な笑顔が命。トーク（愛嬌）が審査に上乗せ" },
);
const prodId = () => (G && G.prod) || "kanade";
const PR = () => PRODS[prodId()];
const pn = () => PR().n;
const hTeam = () => (G.team || []).filter(id => CANDS[id] && G.alive.includes(id));
const hName = i => { const t = hTeam(); return t.length ? CANDS[t[i % t.length]].n : "仲間"; };
const hId = i => { const t = hTeam(); return t.length ? t[i % t.length] : null; };
const affAllTeam = v => Object.fromEntries(hTeam().map(id => [id, v]));
const hb = v => { G.houseBonus = Math.min(8, (G.houseBonus || 0) + v); };
const otherProds = () => PROD_IDS.filter(p => p !== prodId());
const youngest = () => { const order = ["sora", "shuto", "noa", "shino", "shion", "haru", "roi", "masaki"]; return order.find(id => hTeam().includes(id)) || hId(0); };
const oldest = () => { const order = ["daigo", "kai", "takuto", "hara", "yuma", "ren", "masaki"]; return order.find(id => G.alive.includes(id)) || null; };

/* ---------- 合宿入り：プロデューサー選び＋チーム編成 ---------- */
function housePickProducer(after) {
  showEvent({ c: "kanade",
    t: "「今日から6日間、【タイプロハウス】で共同生活。\n3次審査は、僕たち3人が1チームずつプロデュースする\n【メンバープロデュース審査】だよ。\n\n……{name}。今回だけ、希望を聞く。\n誰のチームに入りたい？」",
    ch: PROD_IDS.map(p => ({ t: `${PRODS[p].e} ${PRODS[p].n}のチーム（${PRODS[p].style}）`, fx: {}, after: () => { G.prod = p; G.houseSeen = []; G.houseBonus = 0; save(); after(); } })) });
}
function houseStart() {
  housePickProducer(() => {
    const p = prodId();
    let pool = G.alive.filter(id => id !== "shino" || G.route !== "duo").sort(() => Math.random() - .5);
    const mine = [];
    if (G.route === "duo" && G.alive.includes("shino")) mine.push("shino");
    while (mine.length < 3 && pool.length) mine.push(pool.shift());
    const [o1, o2] = otherProds();
    const t1 = [], t2 = [];
    pool.forEach((id, i) => (i % 2 === 0 ? t1 : t2).push(id));
    G.hteams = { [p]: ["me", ...mine], [o1]: t1, [o2]: t2 };
    G.team = mine; G.song = PRODS[p].song; G.leader = null; save();
    const welcome = {
      tsukasa: "「よし。おまえら4人、俺のチームだ。\n\n先に言っとく。俺は死ぬほど売れたい。\nだから、4人対タイムレッスーだと思え。\n『俺ら3人より売れる』って気持ちを、4人で持て。\n\n課題曲は『New Phase』。……難しいぞ。攻めるぞ」",
      riku:    "「僕のチームへ、ようこそ。\n\n課題曲は『革命のDancin' Night』。\n先輩たちが作ってきた伝統を、僕らが継ぐ曲だよ。\n\nひとつだけ。パートをもらえるのは、普通じゃない。\nソロパートは、自分で獲りにきてほしい」",
      kanade:  "「わあ、僕のチーム！ よろしくね！\n\n課題曲は『SWEET』。\n甘くて、自然で、笑顔の曲。……実はいちばん難しいの。\n\n上手くやろうとしないで。\n0点でいいから、楽しんでみよう。……ね？」",
    }[p];
    const list = PROD_IDS.map(q => `${PRODS[q].team}（${PRODS[q].n}）：${G.hteams[q].map(id => id === "me" ? G.name : CANDS[id].n).join("・")}`).join("\n");
    showEvent({ c: p, t: `${welcome}\n\n──チーム発表──\n${list}`,
      ch: [{ t: "「よろしくお願いします！」", fx: { st: { me: 3 }, aff: affAllTeam(5), silent: true, msg: "チームの好感度 +5／精神力 +3" }, after: () => pickLeader() }] });
  });
}
/* 合宿の見出し用 */
function houseTag() {
  if (!G.prod) return "";
  return `${PRODS[G.prod].team}（プロデューサー：${pn()}）`;
}

/* ---------- 3次審査：プロデューサーの一言・チーム順位・加点 ---------- */
function housePreAud(a, idx) {
  if (idx !== 2 || !G.prod) return null;
  const t = {
    tsukasa: `「行ってこい。\n\n中間では、曲がまだおまえらのものじゃなかった。\n今は違う。……4人の個性、ぶつけてこい。\n\nこれが俺ら5人でできる最後なんだよ。\n……攻めるぞ」\n\n（4人で拳を合わせた。「攻めるぞ！！」）`,
    riku:    `「革命、起こしてきて。\n\n僕はこのチームを、お客さんとして見てたら泣いてたと思う。\n……それくらい、成長した。\n\nソロパート、獲りにいっていいからね」\n\n（4人で指を合わせた。「大人の余裕」）`,
    kanade:  `「上手くやらなくていい。\n楽しかった日のこと、思い出して。\nBBQの煙、みんなの笑った顔。……それを思い出せば、笑えるから。\n\n……その目に、焼き付けろや」\n\n（4人で肩を組んだ。「SWEET！」）`,
  }[prodId()];
  return { c: prodId(), t };
}
function houseAudAdjust(idx, finalTotal, board) {
  const out = { finalTotal, html: "" };
  if (idx !== 2 || !G.hteams) return out;
  const sc = id => id === "me" ? finalTotal : (board.find(b => b.id === id) || { s: 0 }).s;
  const stand = PROD_IDS.map(p => {
    const mem = (G.hteams[p] || []).filter(id => id === "me" || G.alive.includes(id));
    const avg = mem.length ? mem.reduce((s, id) => s + sc(id), 0) / mem.length : 0;
    return { p, avg: Math.round(avg * 10) / 10 };
  }).sort((x, y) => y.avg - x.avg);
  const pos = stand.findIndex(s => s.p === prodId()) + 1;
  const bonus = Math.min(8, G.houseBonus || 0) + (pos === 1 ? 3 : 0);
  out.finalTotal = finalTotal + bonus;
  const me = board.find(b => b.me); me.s = out.finalTotal; board.sort((x, y) => y.s - x.s);
  G.houseRank = pos;
  const cmt = {
    tsukasa: finalTotal >= 70 ? "「……覚醒したな。胸が熱くなった」" : finalTotal >= 55 ? "「悪くない。だが、まだ一歩下がってる。次は攻めろ」" : "「……甘えてたな。一人一人が、どっかで」",
    riku:    finalTotal >= 70 ? "「どこを切り取っても絵になる。革命、起こしてくれた」" : finalTotal >= 55 ? "「曲を愛してるのは伝わった。あとは技術がついてくる」" : "「悔しいよね。……その悔しさから、這い上がろう」",
    kanade:  finalTotal >= 70 ? "「4人とも最高でした！ 中間とは見違えた！」" : finalTotal >= 55 ? "「笑えてた！ それが一番むずかしいんだよ」" : "「大丈夫。楽しかった記憶は、ちゃんと残ってるから」",
  }[prodId()];
  if (G.route === "team") { out.html = `<div class="gain"><span>${pn()}の講評</span><b style="font-weight:700;font-size:10.5px">${cmt}</b></div>${G.houseBonus ? `<div class="gain"><span>ハウス生活の加点</span><b>+${Math.min(8, G.houseBonus)}</b></div>` : ""}`; return out; }
  out.html = `<div class="missBox"><div class="mt">PRODUCE STANDINGS</div>
    ${stand.map((s, i) => `<div class="missRow" style="${s.p === prodId() ? "color:var(--gold)" : ""}"><span>${i + 1}位　${PRODS[s.p].team}（${PRODS[s.p].n}）${s.p === prodId() ? "（きみ）" : ""}</span><em>${s.avg}</em></div>`).join("")}
    <div style="font-size:10px;color:var(--ink3);margin-top:6px">${pos === 1 ? "🏆 プロデュース対決1位：+3" : ""}${G.houseBonus ? `　ハウス生活の加点 +${Math.min(8, G.houseBonus)}` : ""}</div></div>
    <div class="gain"><span>${pn()}の講評</span><b style="font-weight:700;font-size:10.5px">${cmt}</b></div>`;
  return out;
}
/* 合格発表のあと（3次）：プロデューサーの別れの言葉 */
function houseAfterAnnounce(idx, done) {
  if (idx !== 2 || !G.prod) return done();
  const p = prodId();
  const before = (G.hteams && G.hteams[p] || []).filter(id => id !== "me");
  const gone = before.filter(id => !G.alive.includes(id));
  const kept = before.filter(id => G.alive.includes(id));
  let t;
  if (gone.length) {
    const g = CANDS[gone[0]].n;
    t = {
      tsukasa: `（${g}を、フマが抱きしめた）\n\n「……全員で行けなかったのは、俺のせいだ。\nわりい、${g}。おまえらの責任は1つもない。\n\n……一緒にやれて、よかった。悪いな」\n\n${g}「ごめんな。4人で行けなくて……。\n俺はホントに、この4人でよかった」\n\n（全員、泣いた）`,
      riku:    `（${g}を、ショリが抱きしめた）\n\n${g}「ありがとうございました。……楽しかったです。\n悔しいけど、違う形で絶対会えるように頑張るから」\n\nショリ「リーダーとしてパフォーマンスを作り上げる姿を、僕は見てた。\nその力を、存分に使ってほしい」\n\n（${kept.length ? CANDS[kept[0]].n + "の涙が、ポロポロ落ちた" : "誰も、言葉が出なかった"}）`,
      kanade:  `（${g}を、ソウが泣きながら抱きしめた）\n\n「2人……${g}に関しては、『ありがとう』って言葉じゃ返せない。\nそれくらい深いものを、もらった」\n\n${g}「ずっといろいろあったけど、今日のステージは純粋な気持ちでできました。\n悔いはない。やりきった。最高に幸せでした」\n\nソウ「頑張った。頑張った。……マジ」\n\n（5人で、抱き合った）`,
    }[p];
  } else {
    t = {
      tsukasa: "「……全員残ったな。\n\n（フマが、めずらしく笑った）\n\n言っただろ。4人対タイムレッスーだって。\n……ここからが本番だ。攻めるぞ」",
      riku:    "「4人で残れた。……よかった。\n\n一番近くで成長を見られる幸せって、相当あるなって思ってた。\n\n……ありがとう。革命、まだ続くよ」",
      kanade:  "「4人とも残ったーー！！\n\n（ソウが泣きながら全員をハグした）\n\nこの4人、バカなんですよ。バカ正直、バカ真面目。\n……だから、大好き」",
    }[p];
  }
  showEvent({ c: p, t, ch: [{ t: "……", fx: { st: { me: 6 }, aff: affAllTeam(6), silent: true, msg: "精神力 +6／チームの好感度 +6" }, after: done }] });
}

/* ---------- ファイナル：脱落した仲間がバルコニー席から ---------- */
function houseBalcony(next) {
  const gone = CAND_IDS.filter(id => !G.alive.includes(id));
  if (gone.length < 2) return next();
  const picks = gone.sort(() => Math.random() - .5).slice(0, 3);
  const LINES = [
    n => `${n}「カッコいいよ、みんな！ 楽しいことも辛いことも乗り越えてきた仲間の晴れ舞台だ！」`,
    n => `${n}「どんな形であっても正解だと思う。気負わず、楽しんで！」`,
    n => `${n}「お客さんを楽しませることだけ考えて。……俺たちを泣かせるくらいの気持ちで！」`,
    n => `${n}「{name}ーー！！ 地声で言うぞ！ おまえが一番練習してたの、俺は知ってる！！」`,
    n => `${n}「うざいくらい応援するからな！ 泣くなよ！ ……俺はもう泣いてるけど！」`,
  ].sort(() => Math.random() - .5);
  const body = picks.map((id, i) => LINES[i % LINES.length](CANDS[id].n)).join("\n\n");
  showEvent({ c: picks[0],
    t: `（ステージ袖。客席のバルコニーに、見覚えのある顔が並んでいた。\n──脱落したはずの仲間たちだ）\n\n${body}\n\n（「こんなサプライズ、聞いてない……！」\n涙で前が見えない。でも、背負うものが増えた）`,
    ch: [
      { t: "「……みんなの想いも背負って、行ってくる」", fx: { st: { me: 7 }, cond: 1 }, after: next },
      { t: "（しゃべったら泣く。だから手を振った）", fx: { st: { me: 6, ex: 3 } }, after: next },
    ] });
}

/* =====================================================================
   共同生活の日付イベント（DAY13〜17。その日の終わりに必ず起きる）
   ===================================================================== */
const HOUSE_SCHED = {
  /* DAY13 入居日：部屋割りじゃんけん → 中間発表 → 夕食当番 */
  13: done => {
    const hands = ["✊ グー", "✌️ チョキ", "✋ パー"];
    const old = oldest();
    const jan = i => {
      const cpu = ri(0, 2), win = (i - cpu + 3) % 3 === 2, draw = i === cpu;
      let t, fx;
      if (draw) { t = "あいこで……もう一回！ ……結果、きみの勝ち。ベッド確保！"; fx = { stam: 10 }; }
      else if (win) { t = "きみの勝ち！ ベッド確保。\n負けた" + (old ? CANDS[old].n : "誰か") + "が「マジかよ〜」と布団を敷いている"; fx = { stam: 10, cond: 1 }; }
      else if (old) { t = `負けた……布団か。\n\n……と思ったら、最年長の${CANDS[old].n}が「俺が布団でいい。若いやつはベッドで寝ろ」と替わってくれた。\n\n（ハウスの空気が、一気にあったかくなった）`; fx = { stam: 8, aff: { [old]: 10 } }; }
      else { t = "負けた……今夜は布団。まあ、寝られればいい"; fx = { stam: -4, st: { me: 2 } }; }
      showEvent({ c: "kanade", t: `（じゃんけんぽん！）\n\n${t}`, ch: [{ t: "▶ 中間発表へ", fx, after: chukan }] });
    };
    showEvent({ c: "kanade",
      t: "「タイプロハウス、とうちゃーく！\n\n……で、いきなり問題。ベッドが1つ足りない（笑）\nじゃんけんで決めよう。負けた人は布団ね」",
      ch: hands.map((h, i) => ({ t: h, fx: {}, after: () => jan(i) })) });
    function chukan() {
      const weak = pickWeak(), strong = STATS.reduce((a, b) => G.st[a.k] >= G.st[b.k] ? a : b).k;
      const wn = STATS.find(s => s.k === weak).n, sn = STATS.find(s => s.k === strong).n;
      G.houseTask = weak;
      const t = {
        tsukasa: `──中間発表──\n\n「${G.name}。${sn}は、この曲の顔だと思う。導入で惹きつけられた。\n\nでも${wn}。……まだ素人っぽく見える。気が抜けてる。\nスケール感を、もっと大きく。\n\n4日間で、大きく見せてください」`,
        riku:    `──中間発表──\n\n「${G.name}。${sn}は、格が違うように見えた。正直、胸にきた。\n\nただ、${wn}がまだアマチュアな部分がある。\nだから追加課題。ヘッドセットじゃなくてハンドマイク、後半はダブルターン。\n\nショーにこのまま出したい気持ちはある。だからこそ、もっと高いところ目指そう」`,
        kanade:  `──中間発表──\n\n「${G.name}の${sn}、すっごくよかった！\n\n……ただね、${wn}のとき、顔がガチガチ（笑）\n上手くやろうとしすぎてる。\n\n0点で楽しんでみよう。……それが今回の課題ね」`,
      }[prodId()];
      showEvent({ c: prodId(), t, ch: [
        { t: `🔥 「${wn}、4日で仕上げます」`, fx: { st: { me: 4, [weak]: 3 } }, after: dinner },
        { t: "「……悔しいです。でも、納得しました」", fx: { st: { me: 6 } }, after: dinner },
      ] });
    }
    function dinner() {
      showEvent({ c: hId(0) || "kanade",
        t: `「今夜の夕食当番、うちのチームだって！\n${hTeam().map(id => CANDS[id].n).join("・")}と${G.name}で作る。\n\n……何にする？」`,
        ch: [
          { t: "🥟 みんなで餃子を包む", fx: { stam: 15, aff: affAllTeam(5), silent: true, msg: "体力 +15／チームの好感度 +5（餃子、大盛り上がり）" }, after: () => { hb(1); done(); } },
          { t: "🍜 SWEET焼きそば＆SWEETワンタンスープ", fx: { stam: 12, cond: 1, msg: "体力 +12／調子アップ（ネーミングで大ウケ）" }, after: () => { hb(1); done(); } },
          { t: "🍳 ショリのお母さんレシピの唐揚げ＆オムライス", fx: { stam: 15, fans: 300, st: { me: 2 }, msg: "ケチャップで「timelesz」と書いた。ショリが喜んだ" }, after: () => { hb(1); done(); } },
        ] });
    }
  },
  /* DAY14 プロデューサーのレッスン → 他チーム見学 → 深夜の自主練 */
  14: done => {
    const p = prodId();
    const lesson = {
      tsukasa: { t: "「今日はスマホで、1人ずつ追いかけて撮る。\n自分の『見え方』を見ろ。\n\n……ほらな。全部が一定。踊りも歌も表情も、全部うまく見せたいがために、全部できてない。\n\n重心もフラフラだ。着地したとき、押したら倒れる。\n……4人でナルシストになれ。もっと、いきっちゃっていい」", ch: [
        { t: "「もっと、いきります」", fx: { st: { ex: 5, me: 2 } } },
        { t: "動画を見て、自分の癖を3つ書き出した", fx: { st: { me: 4, da: 3 } } } ] },
      riku:    { t: "「……聞いて。生オケ、録ってきた。\n本番は打ち込みじゃなくて、生の演奏でやる。……絶対に譲れないから。\n\n（流れてきた音に、全員のテンションが跳ね上がった）\n\nこの音に負けないで。\nソロパートを歌いたい気持ち、ちゃんと持って」", ch: [
        { t: "「ソロ、獲りにいきます」", fx: { st: { vo: 5, me: 3 } } },
        { t: "「……この音、泣きそうです」", fx: { st: { vo: 3, ex: 3 }, cond: 1 } } ] },
      kanade:  { t: "「はい、今日のレッスンはね……笑顔の練習！\n\n（全員で鏡の前に並んだ）\n\n違う違う、作り笑いじゃなくて。\n楽しかったこと、思い出して。……そう、それ！\n\n笑顔ってね、たぶん一番むずかしいの。\nだから、しんどいときこそ、楽しかった記憶を思い出して」", ch: [
        { t: "（昨日の餃子を思い出した。笑えた）", fx: { st: { tk: 5, ex: 2 } } },
        { t: "「……むずかしいです。でも、やります」", fx: { st: { me: 4, tk: 2 } } } ] },
    }[p];
    showEvent({ c: p, t: lesson.t, ch: lesson.ch.map(c => ({ ...c, after: visit })) });
    function visit() {
      const [o1, o2] = otherProds();
      const go = q => {
        const mem = (G.hteams && G.hteams[q] || []).filter(id => G.alive.includes(id));
        const who = mem.length ? mem[0] : "kanade";
        const sname = SONGS.find(s => s.id === PRODS[q].song).n;
        showEvent({ c: who,
          t: `（${PRODS[q].team}のスタジオへ、見学に行った。\n\n『${sname}』の通し。……ショーだった。\n\n中間発表より、明らかに上がっている。\n帰り道、誰かがつぶやいた。「すっげー成長してる」「刺激し合える環境だもんな」）\n\n${CANDS[who] ? CANDS[who].n : "ソウ"}「……見てたな。うちも負けないから。……そっちもな」`,
          ch: [
            { t: "「めちゃくちゃ感動した。……涙がこの辺まで来た」", fx: { st: { me: 5, ex: 2 }, aff: CANDS[who] ? { [who]: 6 } : {} }, after: night },
            { t: "「チームとしてのクオリティが高い。……うちも上げる」", fx: { st: { me: 4, da: 2 } }, after: night },
          ] });
      };
      showEvent({ c: "riku", t: "「午後は空いてるでしょ。他のチームの練習、見に行っておいで。\n\n……刺激、もらってきて」",
        ch: [
          { t: `${PRODS[o1].team} を見に行く`, fx: {}, after: () => go(o1) },
          { t: `${PRODS[o2].team} を見に行く`, fx: {}, after: () => go(o2) },
        ] });
    }
    function night() {
      showEvent({ c: hId(1) || hId(0) || "kanade",
        t: "（深夜1時。ハウスの練習部屋に、まだ明かりがついている）\n\n「……あ、{name}。……悔しくてさ。\n中間で言われたこと、納得しちゃった自分が、いちばん悔しい。\n\n……もうちょっとだけ、やる」",
        ch: [
          { t: "「付き合う。2時までな」", fx: { stam: -15, st: { [G.houseTask || "me"]: 5, me: 3 }, aff: affAllTeam(6), silent: true, msg: "深夜練。課題ステータス +5／精神力 +3／チームの好感度 +6" }, after: () => { hb(1); done(); } },
          { t: "「明日に響く。寝よう。……一緒に」", fx: { stam: 10, st: { me: 3 } }, after: done },
        ] });
    }
  },
  /* DAY15 anan撮影 → チーム別の外出（ドライブ／中華と絵馬／ピクニック） */
  15: done => {
    const p = prodId();
    showEvent({ c: "riku",
      t: "「今日の午前は、雑誌『anan』の撮影！\nチーム写真とソロ写真。……人生初の雑誌の人、手あげて」\n\n（半分くらいの手が上がった。全員、ちょっとにやけている）",
      ch: [
        { t: "🔥 かっこつけて決める", fx: { fans: 800, st: { ex: 3 } }, after: outing },
        { t: "😊 自然体で笑う", fx: { fans: 700, st: { tk: 3 }, cond: 1 }, after: outing },
        { t: "「ホント憧れじゃないですか……めちゃくちゃうれしいです」", fx: { fans: 750, st: { me: 3 } }, after: outing },
      ] });
    function outing() {
      if (p === "tsukasa") {
        const shinoLate = hTeam().includes("shino");
        return showEvent({ c: hId(0) || "tsukasa",
          t: `「撮影のあとは、練習なし！ 気分転換に車で遠出しようぜ」\n\n（${shinoLate ? "シノは大学の授業で途中まで別行動。" : ""}高速に乗って、海へ。\n窓を全開にして、みんなで課題曲を大声で歌った）`,
          ch: [
            { t: "🌊 海に向かって、思いきり叫ぶ", fx: { st: { me: 5, vo: 2 }, cond: 1, aff: affAllTeam(6), silent: true, msg: "調子アップ／精神力 +5／チームの好感度 +6" }, after: () => { hb(1); shinoLate ? pickup() : done(); } },
            { t: "🍦 砂浜でソフトクリーム。振りの確認もこっそり", fx: { st: { da: 3, me: 3 }, stam: 15, aff: affAllTeam(5), silent: true, msg: "体力 +15／チームの好感度 +5" }, after: () => { hb(1); shinoLate ? pickup() : done(); } },
          ] });
      }
      if (p === "riku") {
        return showEvent({ c: hId(0) || "riku",
          t: "「よし、遠出だ。祐天寺の中華、『三久飯店』行くぞ！」\n\n（餃子が絶品だった。\nカメラを向けられて、食リポに挑戦する流れに）",
          ch: [
            { t: "🎤 ノリノリで食リポ「皮がパリッと……肉汁がジュワッと……！」", fx: { st: { tk: 5 }, fans: 400, stam: 15 }, after: ema },
            { t: "😐 棒読み食リポ「おいしいです」（全員爆笑）", fx: { st: { tk: 3 }, cond: 1, stam: 15, aff: affAllTeam(6), silent: true, msg: "体力 +15／調子アップ／チームの好感度 +6" }, after: ema },
          ] });
      }
      return showEvent({ c: "kanade",
        t: "「撮影お疲れさま！ 午後は練習お休み。\n豊洲の公園で、ピクニックしよう。\n\n……じゃーん。手作りお弁当。全員ぶん、朝5時に起きて作った」\n\n（卵焼きに、ひとつずつ違う顔が描いてある）",
        ch: [
          { t: "「……ソウ先輩、泣きそうです」", fx: { stam: 20, st: { me: 4 }, cond: 1 }, after: () => { hb(1); done(); } },
          { t: "みんなで芝生に寝転んで、空を見た", fx: { stam: 25, st: { tk: 3 }, aff: affAllTeam(6), silent: true, msg: "体力 +25／チームの好感度 +6" }, after: () => { hb(1); done(); } },
        ] });
    }
    function pickup() {
      showEvent({ c: "shino",
        t: "（19時半。大学の授業を終えたシノを、みんなで迎えに行った）\n\n「……え、みんなで来たの？\n……授業、ぜんぜん頭に入らなかった。\n\n……ただいま。……夕飯、5人で食べよう」",
        ch: [{ t: "「おかえり」", fx: { aff: { shino: 12 }, st: { me: 3 } }, after: done }] });
    }
    function ema() {
      showEvent({ c: "riku",
        t: "（帰り道、牛天神北野神社へ。本殿の横に、芸能の神様が祀られている）\n\n「絵馬、書いていこうか。……願いごと、ひとつだけ」",
        ch: [
          { t: "『誰よりも努力する分、見守ってサポートしてください』", fx: { st: { me: 6 } }, after: () => { hb(1); done(); } },
          { t: "『タイムレッスーのメンバーとして、3人と同じステージに立てますように』", fx: { st: { me: 4, ex: 2 }, cond: 1 }, after: () => { hb(1); done(); } },
          { t: "『みんなのパフォーマンスが100％うまくいきますように』", fx: { st: { me: 4 }, aff: affAllTeam(8), silent: true, msg: "チームの好感度 +8（誰かの願いが、自分の願いになった）" }, after: () => { hb(1); done(); } },
        ] });
    }
  },
  /* DAY16 チーム別の衝突ドラマ → 全員でお台場バーベキュー */
  16: done => {
    const p = prodId();
    if (p === "tsukasa") {
      const who = hName(2);
      showEvent({ c: prodId(),
        t: `（仕事から戻ったフマが、スタジオの空気に気づいた。\n${who}が午前中、ショリに怒られたらしい。全員、沈んでいる）\n\n「……こんなんじゃ『New Phase』歌えないでしょ。\n\nできないんだったら、もうやらない方がいい。\n一人一人が、どっかで何かに甘えてんだよ。\n\nここで1歩2歩下がってどうすんだよ。\n……攻めるぞ。\n\nこれが俺ら5人でできる最後なんだよ。諦めんな。絶対」\n\n（全員、泣きながら聞いていた）`,
        ch: [
          { t: "「……攻めます」", fx: { st: { me: 8, ex: 3 } }, after: () => { hb(2); bbq(); } },
          { t: "（泣いた。でも、目は上げた）", fx: { st: { me: 7 }, cond: 1, aff: affAllTeam(6), silent: true, msg: "精神力 +7／調子アップ／チームの好感度 +6" }, after: () => { hb(2); bbq(); } },
        ] });
    } else if (p === "riku") {
      const rival = hId(0), rn = hName(0);
      const meStrong = G.st.vo >= 60;
      showEvent({ c: "riku",
        t: meStrong
          ? `（ダンスレッスン中、ショリが手を止めた）\n\n「演出、変えます。\n『超えてゆけ』のソロ、${rn}のパートを、${G.name}にやってもらいます。\n\n一番輝いていた人に、スポットライトを当てる。\n……${rn}。悔しいよね。でも、納得してほしい」\n\n（${rn}は、小さくうなずいた。……目が、赤い）`
          : `（ダンスレッスン中、ショリが手を止めた）\n\n「演出、変えます。\n『超えてゆけ』のソロ、${G.name}のパートを、${rn}にやってもらいます。\n\n一番輝いていた人に、スポットライトを当てる。\n……${G.name}。悔しいよね。でも、納得してほしい」\n\n（納得してしまった自分が、いちばん悔しかった）`,
        ch: meStrong ? [
          { t: `「${rn}でよかったって、みんなに思わせる。……全力でやる」`, fx: { st: { vo: 5, me: 4 } }, after: () => { hb(2); bbq(); } },
          { t: `夜、${rn}の部屋へ「……一緒に、いちばんいい形にしよう」`, fx: { st: { me: 5 }, aff: { [rival]: 14 } }, after: () => { hb(2); bbq(); } },
        ] : [
          { t: "「……正直、悔しいです。納得してしまった自分が」", fx: { st: { me: 8 } }, after: () => { hb(2); latePractice(); } },
          { t: `「${rn}なら、いい。……おれは別のところで光る」`, fx: { st: { me: 5, ex: 4 }, aff: { [rival]: 8 } }, after: () => { hb(2); bbq(); } },
        ] });
      function latePractice() {
        showEvent({ c: "riku",
          t: "（21時、ショリに呼ばれた）\n\n「悔しさから這い上がろうって気持ち、ちゃんと伝わってるから。\n\n……見てるよ。ずっと」\n\n（深夜1時。ひとりで、同じ8小節を何十回も踊った）",
          ch: [{ t: "🔥 這い上がる", fx: { stam: -18, st: { da: 6, me: 4 } }, after: bbq }] });
      }
    } else {
      const y = youngest(), yn = CANDS[y] ? CANDS[y].n : "後輩";
      showEvent({ c: y || "kanade",
        t: `（昼食のとき、${yn}の様子がおかしかった。\n問いつめると、涙をこぼした）\n\n「……ダンスしてると、すごくイヤな気持ちになる。\n全力でやってるのに、成果が出せてない。\n……自分だけ、できてない気がして」`,
        ch: [
          { t: "「一人じゃないよ。うちのチームは、そういうチームだ」", fx: { st: { me: 5 }, aff: { [y]: 15 } }, after: () => { hb(2); souFollow(); } },
          { t: "「わからないなら、いろんな人に聞くのが最強。おれにも聞け」", fx: { st: { tk: 4, me: 3 }, aff: { [y]: 12 } }, after: () => { hb(2); souFollow(); } },
          { t: "（何も言わず、隣で一緒に踊った）", fx: { st: { da: 3, me: 4 }, aff: { [y]: 12 } }, after: () => { hb(2); souFollow(); } },
        ] });
      function souFollow() {
        showEvent({ c: "kanade",
          t: `（夕方、ソウがそっと言った）\n\n「${yn}のこと、ありがとうね。\n\n……あのね、ショリが言ってた。\n『0点で楽しんでみよう』って。\n\n上手くやろうとしてガチガチになるくらいなら、0点でいい。\n自由に、自然に。……それが『SWEET』だから」`,
          ch: [{ t: "「0点で、楽しみます」", fx: { st: { tk: 4, me: 3 }, cond: 1 }, after: bbq }] });
      }
    }
    function bbq() {
      const alive = G.alive.filter(id => CANDS[id]);
      const meat = ["daigo", "hara", "takuto", "kai", "yuma"].find(id => alive.includes(id)) || alive[0];
      const talk = alive.filter(id => id !== meat).sort(() => Math.random() - .5).slice(0, 3);
      showEvent({ c: meat,
        t: `（夜。3チーム全員と、フマ・ショリ・ソウで、お台場のバーベキュー場へ）\n\n${CANDS[meat].n}「肉奉行は俺だ！ まだ裏返すな！ ……よし、いまだ！！」\n\n（海風。向こうにレインボーブリッジ。\n焼きそばの鉄板の前で、ソウが「おいしー！！」を連発している。\nフマは黙々と野菜を焼き、ショリはみんなの皿に肉を配って回っていた）`,
        ch: [{ t: "🍖 いただきます！", fx: { stam: 30, cond: 1, msg: "体力 +30／調子アップ" }, after: chat }] });
      function chat() {
        showEvent({ c: talk[0] || "kanade",
          t: "（火のそばは、いつもより本音が出る。……誰と話す？）",
          ch: talk.map(id => ({ t: `${CANDS[id].n}と話す`, fx: { aff: { [id]: 12 }, st: { me: 2 } }, after: () => bbqTalk(id) })) });
      }
      function bbqTalk(id) {
        const lines = [
          `「……なあ。落ちたら、ここに来ることも二度とないんだよな。\n……だから、今日の煙の匂い、覚えとこうと思って」`,
          `「{name}のチーム、いい顔してるよな。……羨ましいって、ちょっと思った。\n……うちも、負けないけど」`,
          `「（マシュマロを焼きながら）\n……おれさ、ここに来る前、誰ともしゃべれなかったんだよ。\nいまは焼きそば取り合ってる。……変わったよな、おれら」`,
          `「フマさんがさっき、野菜焼きながら小さく言ってた。『こいつら全員デビューさせてやりてえな』って。\n……聞こえなかったふり、した」`,
        ];
        showEvent({ c: id, t: pick(lines), ch: [{ t: "▶", fx: {}, after: fireworks }] });
      }
      function fireworks() {
        showEvent({ c: "kanade",
          t: "（帰り際。ソウが「はい、集合ー！」と全員を並ばせた）\n\n「3チーム、全員で写真！ ……はい、SWEET！」\n\n（フマ「なんでSWEETなんだよ」と言いながら、ちゃんと笑っていた。\n海の向こうで、遠くの花火が小さく上がった）",
          ch: [
            { t: "「……最高の夜だった」", fx: { st: { me: 5 }, fans: 600, aff: Object.fromEntries(G.alive.map(id => [id, 3])), silent: true, msg: "注目度 +600／全員の好感度 +3" }, after: () => { hb(1); done(); } },
            { t: "（この写真、一生の宝物になる気がした）", fx: { st: { me: 6 }, cond: 1 }, after: () => { hb(1); done(); } },
          ] });
      }
    }
  },
  /* DAY17 前夜：プロデューサーへの手紙 → プレゼント → 最終ミーティング */
  17: done => {
    const p = prodId(), name = pn();
    const L1 = [`${name}へ。この5日間、ずっと言いたかったことがあります。`, `${name}さん。手紙なんて書くの、初めてです。`, `${name}。面と向かうと照れるので、紙に書きます。`];
    const L2 = [
      "怒られた日、本当は泣きそうでした。でも、あの言葉がなかったら、いまの自分はいません。",
      "「楽しんで」って言われるたびに、楽しんでいい自分を許せるようになりました。",
      "誰かの輝きを、素直に喜べる自分になれました。それは、この5日間のおかげです。",
      "一人じゃないって、ここで初めて思えました。泣き虫で会話が下手な自分に、全力で向き合ってくれて。",
    ];
    const L3 = ["必ず受かって、隣で成長していきます。", "あなたが自分のプロデューサーだったこと、一生自慢します。", "こんなに愛情深い人がいるんだって、感動しました。……好きです。"];
    const letter = [];
    const step = (arr, label, next) => showEvent({ c: hId(0) || "kanade",
      t: (letter.length ? `（書きかけの便せん）\n『${letter.join("\n")}』\n\n` : `（${hName(0)}が小声で言った。「明日の前に……みんなで${name}に手紙、書かない？ サプライズで」）\n\n`) + `──${label}──`,
      ch: arr.map(s => ({ t: s, fx: {}, after: () => { letter.push(s); next(); } })) });
    step(L1, "書き出し", () => step(L2, "いちばん伝えたいこと", () => step(L3, "結び", read)));
    function read() {
      G.letter = letter; save();
      const reply = {
        tsukasa: "（フマは、手紙を読み終えて、しばらく黙っていた）\n\n「……やめろよ、こういうの。\n\n……泣くだろ。\n\n……ありがとな。\n……攻めるぞ、明日」\n\n（目元を、腕でぬぐった）",
        riku:    "（ショリは、手紙を何度も読み返していた）\n\n「……僕の方こそ、だよ。\n\n参加してる人が成長するのを、パフォーマンスがよくなるのを、\n一番近くで見られる幸せって、相当あるなって思ってた。\n\n……ありがとう。明日、革命だ」",
        kanade:  "（ソウは、1行目で泣いた）\n\n「危なかった……マジで……耐えた耐えた……\n……無理。耐えられなかった。\n\nあのね。アイドルってね、メンバーがファンに手を振るだけで、喜んでもらえるの。\nそれが、全部。\n君たちに、それを教えたかった。\n\n……ありがとう。明日、楽しんで」",
      }[p];
      showEvent({ c: p,
        t: `（夜。4人で${name}を呼び出して、手紙を渡した。\n${name}が、声に出して読む）\n\n『${letter.join("\n")}』\n\n${reply}`,
        ch: [{ t: "……", fx: { st: { me: 8 }, cond: 1, fans: 500 }, after: present }] });
    }
    function present() {
      const gift = {
        tsukasa: { t: "「……俺からも、ある。\n\n（差し出されたのは、4人ぶんのタオル。全部に手書きで『攻めるぞ』）\n\n本番、汗ふけ。……それだけだ」\n\n（照れ隠しに、すぐ背中を向けた）", fx: { st: { me: 5, ex: 3 } } },
        riku:    { t: "「僕からも、サプライズ。……今夜の夕食は、僕が作る」\n\n（お母さんのレシピの唐揚げと、ホットプレートのオムライス。\nケチャップで、ひとりひとりの名前を書いてくれた）\n\n「明日、これ食べた力で、革命起こしてきて」", fx: { stam: 100, cond: 1, msg: "🍳 体力全回復！ ショリの手料理" } },
        kanade:  "album",
      }[p];
      if (gift === "album") {
        return showEvent({ c: "kanade",
          t: "「僕からも、プレゼント！\n\n（差し出されたのは、手作りのアルバム。\n5日間の写真が、ひとりずつコメント付きで貼ってある。\nBBQの煙で目を細めた顔。深夜練の寝ぐせ。餃子の粉まみれの手）\n\n……見て。全部、笑ってる。\nこの顔で、明日出よう」\n\n（そのまま5人で、『SWEET』を歌って踊った）",
          ch: [{ t: "「……一生、大事にします」", fx: { st: { me: 6, tk: 3 }, cond: 1, aff: affAllTeam(8), silent: true, msg: "精神力 +6／トーク +3／調子アップ／チームの好感度 +8" }, after: meeting }] });
      }
      showEvent({ c: p, t: gift.t, ch: [{ t: "「……ありがとうございます」", fx: gift.fx, after: meeting }] });
    }
    function meeting() {
      const call = PR().call;
      showEvent({ c: hId(0) || "kanade",
        t: `（消灯前の、最終ミーティング。4人で円になった）\n\n「明日で、この5人でやるのは最後だ。\n……${hName(0)}も${hName(1)}も、ぜんぶ出そう。\n\n${G.leader === "me" ? "リーダー、締めて" : "……最後は、リーダーから"}」`,
        ch: [
          { t: `🔥 「タイムレッスーを、超えるぞーー！！」`, fx: { st: { me: 7 }, cond: 1, aff: affAllTeam(6), silent: true, msg: "精神力 +7／調子アップ／チームの好感度 +6" }, after: () => { hb(2); done(); } },
          { t: `「${call}」（4人で声を合わせた）`, fx: { st: { me: 6, ex: 3 }, aff: affAllTeam(6), silent: true, msg: "精神力 +6／表現力 +3／チームの好感度 +6" }, after: () => { hb(2); done(); } },
        ] });
    }
  },
};
function houseDayEvent(done) {
  if (!G || !G.prod || !G.hteams) return false;
  G.houseSeen = G.houseSeen || [];
  const days = Object.keys(HOUSE_SCHED).map(Number).filter(d => d <= G.day && d >= 13 && G.day <= 17 && !G.houseSeen.includes(d)).sort((a, b) => a - b);
  if (!days.length) return false;
  const d = days[0];
  G.houseSeen.push(d); save();
  HOUSE_SCHED[d](done);
  return true;
}
