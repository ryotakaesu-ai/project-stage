/* =====================================================================
   tour.js  🚌 タイムレッスー 全国ツアー（弱点別ステージ）
   12都市＝12単元。各都市でライブ（10問）。8問以上で公演成功、正解数で★1〜3。
   都市をクリアするたびに、その都市のレベルが上がる（Lv1→5）。
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
  { id: "kobe",     n: "神戸",   g: "bun",       e: "📖", venue: "神戸ワールド記念ホール",  food: "神戸牛コロッケ", host: "kanade" },
  { id: "hiroshima",n: "広島",   g: "kisoku",    e: "🔢", venue: "広島グリーンアリーナ",    food: "お好み焼き",     host: "yuma" },
  { id: "fukuoka",  n: "福岡",   g: "frac",      e: "🍰", venue: "マリンメッセ福岡",        food: "豚骨ラーメン",   host: "noa" },
  { id: "okinawa",  n: "沖縄",   g: "ryusui",    e: "🚤", venue: "沖縄コンベンションセンター", food: "サーターアンダギー", host: "roi" },
];
const TOUR_SCENES = [
  (c, h) => `（${c.n}到着。${h}が真っ先に空港の売店へ）\n\n${h}「${c.food}！！ 先に食う！ リハはそのあと！」\nフマ「逆だ」`,
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
  openSheet(`<div class="ptitle">🚌 タイムレッスー 全国ツアー<small>12都市＝12単元。苦手な街を回って、全国を制覇する</small></div>
    <div class="dpLine" style="margin-bottom:6px">制覇 <b>${cleared}</b>/12都市　★合計 <b>${Object.values(m.stars).reduce((a, b) => a + b, 0)}</b>　公演 <b>${m.plays}</b>回</div>
    <div style="font-size:11px;color:var(--gold);margin-bottom:8px">🧭 シノのおすすめ：<b>${rec.e} ${rec.n}（${MATH.GENRE_NAME[rec.g]}）</b>${tourAcc(rec.g) !== null ? `　正答率 ${Math.round(tourAcc(rec.g) * 100)}%` : "　まだデータが少ない"}</div>
    <div class="list">${TOUR_CITIES.map(c => { const st = m.stars[c.id] || 0, lv = m.lv[c.id] || 1, acc = tourAcc(c.g); return `<button class="item" data-c="${c.id}" style="${c.id === rec.id ? "box-shadow:0 0 0 1.5px var(--gold) inset" : ""}"><span class="ie">${c.e}</span><div class="it"><b>${c.n}　<span style="color:#ffcf5c">${"★".repeat(st)}${"☆".repeat(3 - st)}</span>　<small style="color:var(--ink3)">Lv.${lv}</small></b><small>${MATH.GENRE_NAME[c.g]}　${c.venue}${acc !== null ? `　正答率${Math.round(acc * 100)}%${acc < .7 ? " ⚠苦手" : ""}` : ""}</small></div></button>`; }).join("")}</div>
    <div style="height:8px"></div>
    <button class="btn ${cleared >= 6 ? "gold" : "dark"}" id="tourEnc" ${cleared >= 6 ? "" : "disabled"}>🎤 アンコール公演（苦手3単元ミックス15問）${cleared >= 6 ? "" : "　6都市制覇で解放"}</button>
    <div style="height:6px"></div>
    <button class="btn ${allStar ? "gold" : "dark"}" id="tourDome" ${allStar ? "" : "disabled"}>🏟 東京ドーム（全単元20問）${allStar ? "" : "　全都市★で解放"}</button>
    <div style="height:8px"></div><button class="btn dark" onclick="closeSheet()">閉じる</button>`);
  $("sheetPanel").querySelectorAll("[data-c]").forEach(b => b.onclick = () => { sfx.tap(); closeSheet(); tourCity(b.dataset.c); });
  $("tourEnc").onclick = () => { sfx.tap(); closeSheet(); tourEncore(); };
  $("tourDome").onclick = () => { sfx.tap(); closeSheet(); tourDome(); };
}
function tourCity(id) {
  const c = TOUR_CITIES.find(x => x.id === id); const m = tourMeta(); const lv = m.lv[id] || 1;
  const host = PERSON(c.host) ? c.host : "hara"; const hn = PERSON(host).n;
  m.visits[id] = (m.visits[id] || 0) + 1; save();
  showEvent({ c: host, t: `🚌 ${c.n}公演　${c.venue}\n単元：${MATH.GENRE_NAME[c.g]}　Lv.${lv}\n\n${pick(TOUR_SCENES)(c, hn)}`, ch: [{ t: "🎤 開演（10問）", fx: {}, after: () => startQuiz({ mode: "lesson", genre: c.g, lv, total: 10, title: `🎤 ${c.n}公演　${MATH.GENRE_NAME[c.g]} Lv.${lv}`, onEnd: r => { $("ovResult").classList.remove("on"); tourResult(c, lv, r); } }) }] });
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
    { t: "🚌 ツアーマップへ", fx: {}, after: openTour },
    ...(r.misses.length ? [{ t: "📖 復習タイム（解説→リベンジ）", fx: {}, after: () => startRevenge(r.misses, openTour) }] : []),
  ] });
}
function tourEncore() {
  const weak = TOUR_CITIES.map(c => ({ c, acc: tourAcc(c.g) ?? .6 })).sort((a, b) => a.acc - b.acc).slice(0, 3);
  const gs = weak.map(w => w.c.g); const names = weak.map(w => w.c.n).join("・");
  showEvent({ c: "tsukasa", t: `🎤 アンコール公演\n\nフマ「アンコールは、おまえの苦手だけでやる。\n${names}。……逃げ場なしだ。15問」`, ch: [{ t: "🔥 やる", fx: {}, after: () => {
    const fixed = Array.from({ length: 15 }, (_, i) => MATH.gen(gs[i % 3], clamp(3 + Math.floor(i / 6), 3, 5)));
    startQuiz({ mode: "lesson", genre: gs[0], lv: 4, total: 15, fixed, title: "🎤 アンコール　苦手3単元", onEnd: r => { $("ovResult").classList.remove("on"); const m = tourMeta(); m.encore++; save(); const ok = r.correct >= 12; if (ok) { confetti(60); sfx.clear(); } showEvent({ c: "tsukasa", t: `アンコール　正解 ${r.correct}/15\n\n${ok ? "フマ「……苦手で12本取った。それはもう、苦手じゃない」" : "フマ「まだ苦手だな。……いい。苦手がわかってるやつは、伸びる」"}`, ch: [{ t: "🚌 ツアーマップへ", fx: {}, after: openTour }, ...(r.misses.length ? [{ t: "📖 復習タイム", fx: {}, after: () => startRevenge(r.misses, openTour) }] : [])] }); } });
  } }] });
}
function tourDome() {
  showEvent({ c: "kanade", t: "🏟 東京ドーム\n\nソウ「全国12都市、ぜんぶ回ったね。\n最後は、ドーム。全単元から20問。\n\n……ここに立てるのは、苦手から逃げなかった人だけ。行こう」", ch: [{ t: "🏟 開演", fx: {}, after: () => {
    const gs = TOUR_CITIES.map(c => c.g);
    const fixed = Array.from({ length: 20 }, (_, i) => MATH.gen(gs[i % gs.length], 4));
    startQuiz({ mode: "aud", lv: 4, total: 20, fixed, title: "🏟 東京ドーム公演", onEnd: r => { $("ovResult").classList.remove("on"); const m = tourMeta(); m.dome++; m.domeBest = Math.max(m.domeBest || 0, r.correct); save(); if (r.correct >= 16) { confetti(100); sfx.clear(); } showEvent({ c: "tsukasa", t: `🏟 東京ドーム　正解 ${r.correct}/20\n\n${r.correct >= 18 ? "フマ「……完璧だ。全国ツアー、完走。おまえはもう、どの単元が出ても戦える」" : r.correct >= 16 ? "フマ「ドーム、成功だ。……ここまで来たやつを、おれは誇りに思う」" : "フマ「ドームは、甘くない。……でも、ここに立った。それが全部だ。また来い」"}\n\n（ドーム最高記録 ${m.domeBest}/20）`, ch: [{ t: "🚌 ツアーマップへ", fx: {}, after: openTour }] }); } });
  } }] });
}
