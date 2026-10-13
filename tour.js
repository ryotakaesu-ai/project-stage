/* =====================================================================
   tour.js  🚌 タイムレッスー 全国ツアー（弱点別ステージ）
   14都市＝14単元。各都市でライブ（10問）。8問以上で公演成功、正解数で★1〜3。
   受験本番レベル：各都市は Lv3 から始まり、クリアするたびに上がる（Lv3→5）。
   弱点分析（DB.meta.gstat）から「次に回るべき都市」を提案する。
   6都市クリアでアンコール（苦手3単元ミックス）、全都市★でドーム公演。
   ===================================================================== */
const TOUR_CITIES = [
  { id: "sapporo",  n: "札幌",   g: "hayasa",    e: "🚃", venue: "札幌ドーム前広場",        food: "スープカレー",   host: "hara" },
  { id: "sendai",   n: "仙台",   g: "ratio",     e: "⚖️", venue: "仙台サンプラザ",          food: "牛タン",         host: "takuto" },
  { id: "niigata",  n: "新潟",   g: "tani",      e: "📏", venue: "朱鷺メッセ",              food: "へぎそば",       host: "masaki" },
  { id: "kanazawa", n: "金沢",   g: "pi",        e: "🥧", venue: "金沢歌劇座",              food: "のどぐろ",       host: "shino" },
  { id: "tokyo",    n: "東京",   g: "kufuu",     e: "💡", venue: "日本武道館",              food: "もんじゃ",       host: "tsukasa" },
  { id: "yokohama", n: "横浜",   g: "gyaku",     e: "🔙", venue: "横浜アリーナ",            food: "中華まん",       host: "riku" },
  { id: "nagoya",   n: "名古屋", g: "zukei",     e: "📐", venue: "日本ガイシホール",        food: "ひつまぶし",     host: "daigo" },
  { id: "osaka",    n: "大阪",   g: "seishitsu", e: "🔢", venue: "大阪城ホール",            food: "たこ焼き",       host: "daigo" },
  { id: "kobe",     n: "神戸",   g: "tsurukame", e: "🐢", venue: "神戸ワールド記念ホール",  food: "神戸牛コロッケ", host: "kanade" },
  { id: "nagano",   n: "長野",   g: "anki",      e: "🧠", venue: "長野ビッグハット",        food: "信州そば",       host: "shino" },
  { id: "kagoshima",n: "鹿児島", g: "tabibito",  e: "🚄", venue: "鹿児島アリーナ",          food: "黒豚とんかつ",   host: "takuto" },
  { id: "hiroshima",n: "広島",   g: "kisoku",    e: "🔢", venue: "広島グリーンアリーナ",    food: "お好み焼き",     host: "yuma" },
  { id: "fukuoka",  n: "福岡",   g: "frac",      e: "🍰", venue: "マリンメッセ福岡",        food: "豚骨ラーメン",   host: "noa" },
  { id: "okinawa",  n: "沖縄",   g: "ryusui",    e: "🚤", venue: "沖縄コンベンションセンター", food: "サーターアンダギー", host: "roi" },
];
const TOUR_SCENES = [
  (c, h) => `（楽屋。${h}が真っ先にケータリングへ）\n\n${h}「${c.food}！！ 先に食う！ リハはそのあと！」\nフマ「逆だ」`,
  (c, h) => `（${c.venue}のリハーサル。音響トラブルでマイクが入らない）\n\n${h}「……生声でいくか」\nソウ「えっ」\n${h}「冗談。でも、本番は何が起きても止まらない。計算と同じ。1問飛ばしても、次へ」`,
  (c, h) => `（会場の外に、朝から並んでいるファンの列）\n\nあかり「わたしも並んだ！ 塾のテキスト持ってきた！」\n${h}「……えらい。ライブ前に1ページ進めたら、おれがサインする」`,
  (c, h) => `（楽屋。ケータリングの${c.food}を囲んで）\n\n${h}「${c.n}のお客さんは、乗りがいいって聞いた。……でも、どの街でも、最初の1曲は同じだ。全力。計算の1問目と同じ」`,
  (c, h) => `（ステージ袖。シノがノートを広げている）\n\nシノ「ライブ前に、苦手な単元を10問。……ジンクスなんだ。合格した日の朝もやってた」\n${h}「……おれにも1問くれ」`,
  (c, h) => `（開演5分前。客席の手拍子が、壁ごしに聞こえる）\n\n${h}「聞こえるか。あれ全部、おれたちを待ってる。\n……行くぞ。10問、全部取る」`,
];
const TOUR_WIN = [
  (c, h) => `${h}「${c.n}、最高だった！！ ${c.food}もらったぞ！」\n\n（アンコールの手拍子が鳴りやまない。……次の街へ）`,
  (c, h) => `フマ「……${c.n}公演、成功だ。\n\n言っとくが、まぐれじゃない。10問の積み重ねが、この拍手だ」`,
  (c, h) => `ソウ「${c.n}のみんな、ありがとうーー！！\n\n……あかりちゃん、最前列で解いてたでしょ。見えてたよ（笑）」`,
];
const TOUR_LOSE = [
  (c, h) => `${h}「……${c.n}、悔しいな。\n\nでも覚えとけ。今日できなかった問題は、明日の${c.n}で、絶対に取る。\nツアーは、まだ続く」`,
  (c, h) => `シノ「${c.n}は、もう一回来よう。\n\n……間違えた問題、いま見直す。ライブは終わったけど、勉強は終わってない」`,
];
function tourMeta() { DB.meta.tour = DB.meta.tour || { stars: {}, lv: {}, plays: 0, encore: 0, dome: 0, visits: {} }; return DB.meta.tour; }
function tourAcc(g) { const s = (DB.meta.gstat || {})[g]; return s && s.n >= 8 ? s.ok / s.n : null; }
function tourRecommend() {
  const scored = TOUR_CITIES.map(c => { const acc = tourAcc(c.g); const st = tourMeta().stars[c.id] || 0; return { c, acc, st, score: (acc === null ? .6 : acc) + st * .1 }; }).sort((a, b) => a.score - b.score);
  return scored[0].c;
}
function openTour() {
  const m = tourMeta(); const rec = tourRecommend();
  const cleared = TOUR_CITIES.filter(c => (m.stars[c.id] || 0) >= 1).length;
  const allStar = cleared === TOUR_CITIES.length;
  TOUR_CITIES.forEach(c => { if (!m.lv[c.id] || m.lv[c.id] < 3) m.lv[c.id] = 3; });
  openSheet(`<div class="ptitle">🚌 タイムレッスー 全国ツアー<small>14都市＝14単元。受験本番レベル（Lv3〜5）。苦手な街を回って全国制覇</small></div>
    <div class="dpLine" style="margin-bottom:6px">制覇 <b>${cleared}</b>/14都市　★合計 <b>${Object.values(m.stars).reduce((a, b) => a + b, 0)}</b>　公演 <b>${m.plays}</b>回</div>
    <div style="font-size:11px;color:var(--gold);margin-bottom:8px">🧭 シノのおすすめ：<b>${rec.e} ${rec.n}（${MATH.GENRE_NAME[rec.g]}）</b>${tourAcc(rec.g) !== null ? `　正答率 ${Math.round(tourAcc(rec.g) * 100)}%` : "　まだデータが少ない"}</div>
    <div class="list">${TOUR_CITIES.map(c => { const st = m.stars[c.id] || 0, lv = m.lv[c.id] || 3, acc = tourAcc(c.g); return `<button class="item" data-c="${c.id}" style="${c.id === rec.id ? "box-shadow:0 0 0 1.5px var(--gold) inset" : ""}"><span class="ie">${c.e}</span><div class="it"><b>${c.n}　<span style="color:#ffcf5c">${"★".repeat(st)}${"☆".repeat(3 - st)}</span>　<small style="color:var(--ink3)">Lv.${lv}</small></b><small>${MATH.GENRE_NAME[c.g]}　${c.venue}${acc !== null ? `　正答率${Math.round(acc * 100)}%${acc < .7 ? " ⚠苦手" : ""}` : ""}</small></div></button>`; }).join("")}</div>
    <div style="height:8px"></div>
    <button class="btn ${cleared >= 7 ? "gold" : "dark"}" id="tourEnc" ${cleared >= 7 ? "" : "disabled"}>🎤 アンコール公演（苦手3単元ミックス15問）${cleared >= 7 ? "" : "　7都市制覇で解放"}</button>
    <div style="height:6px"></div>
    <button class="btn ${allStar ? "gold" : "dark"}" id="tourDome" ${allStar ? "" : "disabled"}>🏟 東京ドーム（全単元20問）${allStar ? "" : "　全都市★で解放"}</button>
    <div style="height:8px"></div>
    <div class="row3"><button class="btn sm dark" id="tourBond">💞 メンバーとの絆</button><button class="btn sm dark" id="tourDiary">📔 ツアー日記</button><button class="btn sm dark" onclick="closeSheet()">閉じる</button></div>`);
  $("sheetPanel").querySelectorAll("[data-c]").forEach(b => b.onclick = () => { sfx.tap(); closeSheet(); tourCity(b.dataset.c); });
  $("tourBond").onclick = () => { sfx.tap(); tourBondView(); };
  $("tourDiary").onclick = () => { sfx.tap(); tourDiaryView(); };
  $("tourEnc").onclick = () => { sfx.tap(); closeSheet(); tourEncore(); };
  $("tourDome").onclick = () => { sfx.tap(); closeSheet(); tourDome(); };
}
function tourCity(id) {
  const c = TOUR_CITIES.find(x => x.id === id); const m = tourMeta(); const lv = Math.max(3, m.lv[id] || 3);
  m.visits[id] = (m.visits[id] || 0) + 1; m.talkSeen = m.talkSeen || {}; m.happenSeen = m.happenSeen || []; tourBond(); save();
  const arr = pick(TOUR_ARRIVE[id] || [{ c: c.host, t: `（${c.n}に到着した）` }]);
  showEvent({ c: arr.c, t: `🚌 ${c.n}到着\n\n${arr.t}`, ch: [{ t: "▶", fx: {}, after: () => tourTalkPick(c, lv) }] });
}
function tourTalkPick(c, lv) {
  const cands = TM.slice().sort(() => Math.random() - .5).slice(0, 3);
  showEvent({ c: c.host, t: "（会場までの移動中。……誰のとなりに座る？）", ch: cands.map(id => ({ t: `${TN(id)}のとなり`, fx: {}, after: () => tourTalk(c, lv, id) })) });
}
function tourTalk(c, lv, id) {
  const m = tourMeta(); const seen = m.talkSeen[id] = m.talkSeen[id] || [];
  let pool = TOUR_TALK[id].map((_, i) => i).filter(i => !seen.includes(i)); if (!pool.length) { m.talkSeen[id] = []; pool = TOUR_TALK[id].map((_, i) => i); }
  const ti = pick(pool); seen.push(ti); save();
  const tk = TOUR_TALK[id][ti];
  showEvent({ c: id, t: tk.t, ch: tk.ch.map(o => ({ t: o.t, fx: {}, after: () => { addBond(id, o.b); m.diary.unshift(`${c.n}：${TN(id)}と話した「${o.t.replace(/[「」（）]/g, "")}」`); m.diary = m.diary.slice(0, 40); save(); showEvent({ c: id, t: o.r, ch: [{ t: "▶", fx: {}, after: () => tourHappen(c, lv) }] }); } })) });
}
function tourHappen(c, lv) {
  const m = tourMeta();
  if (Math.random() < .4) return tourOpen(c, lv);
  let pool = TOUR_HAPPEN.map((_, i) => i).filter(i => !m.happenSeen.includes(i)); if (!pool.length) { m.happenSeen = []; pool = TOUR_HAPPEN.map((_, i) => i); }
  const hi = pick(pool); m.happenSeen.push(hi); save();
  const h = TOUR_HAPPEN[hi];
  showEvent({ c: h.c, t: `⚡ ハプニング\n\n${h.t}`, ch: h.ch.map(o => ({ t: o.t, fx: {}, after: () => { Object.entries(o.fx).forEach(([id, v]) => addBond(id, v)); tourOpen(c, lv); } })) });
}
function tourOpen(c, lv) {
  const hn = TN(c.host); const b = tourBond();
  const guard = TM.filter(id => (b[id] || 0) >= 25);
  const g = guard.length ? pick(guard) : null;
  showEvent({ c: c.host, t: `🎤 ${c.venue}　開演前\n単元：${MATH.GENRE_NAME[c.g]}　Lv.${lv}\n\n${pick(TOUR_SCENES)(c, hn)}${g ? `\n\n（${TN(g)}が、そっと肩を叩いた。「……お守り、持ってけ」。絆のお守り：ミス1回を帳消しにできる）` : ""}`, ch: [{ t: "🎤 開演（10問）", fx: {}, after: () => { startQuiz({ mode: "lesson", genre: c.g, lv, total: 10, title: `🎤 ${c.n}公演　${MATH.GENRE_NAME[c.g]} Lv.${lv}`, onEnd: r => { $("ovResult").classList.remove("on"); tourResult(c, lv, r); } }); if (g) Q.shield = 1; } }] });
}
function tourResult(c, lv, r) {
  const m = tourMeta(); m.plays++;
  const stars = r.correct >= 10 ? 3 : r.correct >= 9 ? 2 : r.correct >= 8 ? 1 : 0;
  const prev = m.stars[c.id] || 0; const hn = PERSON(c.host).n;
  let up = "";
  if (stars) { m.stars[c.id] = Math.max(prev, stars); if (lv < 5) { m.lv[c.id] = lv + 1; up = `\n📈 ${c.n}のレベルが Lv.${lv + 1} に上がった`; } }
  save();
  if (stars) { confetti(stars * 20); sfx.clear(); } else sfx.bad();
  const miss = r.misses.slice(0, 4).map(mi => `・${mi.q.replace(/<[^>]+>/g, "")}　→ ${MATH.ansText(mi.a)}`).join("\n");
  showEvent({ c: c.host, t: `🎤 ${c.n}公演　${stars ? "成功！" : "……届かず"}\n\n正解 ${r.correct}/10　${"★".repeat(stars)}${"☆".repeat(3 - stars)}${prev && stars > prev ? "　（記録更新！）" : ""}${up}\n\n${stars ? pick(TOUR_WIN)(c, hn) : pick(TOUR_LOSE)(c, hn)}${miss ? `\n\n──間違えた問題──\n${miss}` : ""}`, ch: [
    { t: "🍻 打ち上げへ", fx: {}, after: () => tourAfterParty(c) },
    ...(r.misses.length ? [{ t: "📖 復習タイム（解説→リベンジ）のあと打ち上げ", fx: {}, after: () => startRevenge(r.misses, () => tourAfterParty(c)) }] : []),
  ] });
}
function tourAfterParty(c) {
  const m = tourMeta();
  const cands = TM.slice().sort(() => Math.random() - .5).slice(0, 3);
  showEvent({ c: c.host, t: `🍻 ${c.n}の打ち上げ　${c.food}の店\n\n（テーブルがにぎやか。……誰のとなりに座る？）`, ch: cands.map(id => ({ t: `${TN(id)}のとなり`, fx: {}, after: () => {
    const line = pick(TOUR_AFTER[id]); addBond(id, 4);
    m.diary.unshift(`${c.n}：打ち上げで${TN(id)}と${c.food}`); m.diary = m.diary.slice(0, 40); save();
    showEvent({ c: id, t: line, ch: [{ t: "▶", fx: {}, after: () => tourLetter(c) }] });
  } })) });
}
function tourLetter(c) {
  const m = tourMeta(); m.letterSeen = m.letterSeen || [];
  if (m.letterSeen.includes(c.id) || Math.random() < .25) return tourBondCheck(c);
  m.letterSeen.push(c.id); save();
  showEvent({ c: "akari", t: `💌 ホテルで、手紙とメッセージが届いていた\n\n${TOUR_LETTER[c.id]}`, ch: [{ t: "▶", fx: {}, after: () => tourBondCheck(c) }] });
}
function tourBondCheck(c) {
  const m = tourMeta(); const b = tourBond();
  for (const id of TM) {
    const v = b[id] || 0;
    const lvl = v >= 80 ? 2 : v >= 50 ? 1 : v >= 25 ? 0 : -1;
    for (let k = 0; k <= lvl; k++) {
      const key = `${id}_${k}`;
      if (!m.bondSeen.includes(key)) { m.bondSeen.push(key); m.diary.unshift(`${c.n}：${TN(id)}との絆イベント（${[25, 50, 80][k]}）`); save(); confetti(30); sfx.skill();
        return showEvent({ c: id, t: `💞 絆イベント\n\n${TOUR_BOND_EV[id][k]}`, ch: [{ t: "▶", fx: {}, after: () => tourBondCheck(c) }] }); }
    }
  }
  openTour();
}
function tourBondView() {
  const b = tourBond(); const m = tourMeta();
  openSheet(`<div class="ptitle">💞 メンバーとの絆<small>移動中の会話・打ち上げ・ハプニングで深まる。25で本番のお守り、25／50／80で特別な場面</small></div>
    <div class="card statCard" style="margin-bottom:10px">${TM.map(id => `<div class="strow"><span class="sn" style="width:auto;min-width:64px">${TN(id)}</span><div class="gauge"><u style="width:${b[id] || 0}%;background:${(b[id] || 0) >= 50 ? "#ff8ad8" : (b[id] || 0) >= 25 ? "#ffcf5c" : "#4cc9f0"}"></u></div><span class="sv">${Math.round(b[id] || 0)}${[0, 1, 2].map(k => m.bondSeen.includes(id + "_" + k) ? "✦" : "").join("")}</span></div>`).join("")}</div>
    <button class="btn dark" id="bondBack">もどる</button>`);
  $("bondBack").onclick = () => { sfx.tap(); closeSheet(); openTour(); };
}
function tourDiaryView() {
  const m = tourMeta(); tourBond();
  openSheet(`<div class="ptitle">📔 ツアー日記<small>最近の出来事 ${m.diary.length}件</small></div>
    <div class="list">${m.diary.length ? m.diary.map(d => `<div class="item" style="cursor:default"><div class="it"><small style="color:var(--ink2)">${d}</small></div></div>`).join("") : `<div class="smallnote">まだ何も起きていない。最初の街へ。</div>`}</div>
    <div style="height:8px"></div><button class="btn dark" id="diaryBack">もどる</button>`);
  $("diaryBack").onclick = () => { sfx.tap(); closeSheet(); openTour(); };
}
function tourEncore() {
  const weak = TOUR_CITIES.map(c => ({ c, acc: tourAcc(c.g) ?? .6 })).sort((a, b) => a.acc - b.acc).slice(0, 3);
  const gs = weak.map(w => w.c.g); const names = weak.map(w => w.c.n).join("・");
  showEvent({ c: "tsukasa", t: `🎤 アンコール公演\n\nフマ「アンコールは、おまえの苦手だけでやる。\n${names}。……逃げ場なしだ。15問」`, ch: [{ t: "🔥 やる", fx: {}, after: () => {
    const fixed = Array.from({ length: 15 }, (_, i) => MATH.gen(gs[i % 3], clamp(4 + Math.floor(i / 8), 4, 5)));
    startQuiz({ mode: "lesson", genre: gs[0], lv: 4, total: 15, fixed, title: "🎤 アンコール　苦手3単元", onEnd: r => { $("ovResult").classList.remove("on"); const m = tourMeta(); m.encore++; save(); const ok = r.correct >= 12; if (ok) { confetti(60); sfx.clear(); } showEvent({ c: "tsukasa", t: `アンコール　正解 ${r.correct}/15\n\n${ok ? "フマ「……苦手で12本取った。それはもう、苦手じゃない」" : "フマ「まだ苦手だな。……いい。苦手がわかってるやつは、伸びる」"}`, ch: [{ t: "🚌 ツアーマップへ", fx: {}, after: openTour }, ...(r.misses.length ? [{ t: "📖 復習タイム", fx: {}, after: () => startRevenge(r.misses, openTour) }] : [])] }); } });
  } }] });
}
function tourDome() {
  showEvent({ c: "kanade", t: "🏟 東京ドーム\n\nソウ「全国14都市、ぜんぶ回ったね。\n最後は、ドーム。全単元から20問。\n\n……ここに立てるのは、苦手から逃げなかった人だけ。行こう」", ch: [{ t: "🏟 開演", fx: {}, after: () => {
    const gs = TOUR_CITIES.map(c => c.g);
    const fixed = Array.from({ length: 20 }, (_, i) => MATH.gen(gs[i % gs.length], 5));
    startQuiz({ mode: "aud", lv: 4, total: 20, fixed, title: "🏟 東京ドーム公演", onEnd: r => { $("ovResult").classList.remove("on"); const m = tourMeta(); m.dome++; m.domeBest = Math.max(m.domeBest || 0, r.correct); save(); if (r.correct >= 16) { confetti(100); sfx.clear(); } showEvent({ c: "tsukasa", t: `🏟 東京ドーム　正解 ${r.correct}/20\n\n${r.correct >= 18 ? "フマ「……完璧だ。全国ツアー、完走。おまえはもう、どの単元が出ても戦える」" : r.correct >= 16 ? "フマ「ドーム、成功だ。……ここまで来たやつを、おれは誇りに思う」" : "フマ「ドームは、甘くない。……でも、ここに立った。それが全部だ。また来い」"}\n\n（ドーム最高記録 ${m.domeBest}/20）`, ch: [{ t: "🚌 ツアーマップへ", fx: {}, after: openTour }] }); } });
  } }] });
}
