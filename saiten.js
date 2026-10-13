/* =====================================================================
   saiten.js  ✍️ シノの採点室
   候補生や塾の仲間の「答案」を見て、どの行が間違いかを見つけ、ミスの型を当て、
   正しい答えを自分で出す。採点する側に回ると、同じミスをしなくなる。
   ===================================================================== */
const SA_TYPES = {
  laststep: { n: "最後の一歩",     e: "🎯", d: "途中までは合っているのに、聞かれたものを答えていない" },
  misread:  { n: "読み落とし",     e: "👀", d: "問題文の『どっち？』『何を？』を読み落として、別のものを答えた" },
  calc:     { n: "計算ミス",       e: "✖️", d: "考え方は合っているのに、かけ算・ひき算の途中でズレた" },
  formula:  { n: "公式・立式ミス", e: "📐", d: "式の形が違う（÷2を忘れる、＋1を忘れる、順序を間違える）" },
  unit:     { n: "単位ミス",       e: "📏", d: "数は合っているのに、単位の直し方や書き方が違う" },
  reduce:   { n: "約分忘れ",       e: "🍰", d: "分数の答えを、いちばん簡単な形にしていない" },
  copy:     { n: "写し間違い",     e: "📝", d: "問題文の数字を、式に写すときに間違えた" },
};
const SA_WRITERS = {
  ryotaro: { n: "りょうたろう", img: "img/akari.jpg", say: "「……うわ。開成志望が、こんなとこで」", pref: ["calc", "copy"] },
  yuria:   { n: "ゆりあ",       img: "img/yuria.jpg", say: "「え〜！ また読み落とし！？ 問題文が長いのが悪い！」", pref: ["misread", "laststep"] },
  moka:    { n: "もか",         img: "img/akari.jpg", say: "「単位……。数は合ってたのに……」", pref: ["unit", "reduce"] },
  icchan:  { n: "いっちゃん",   img: "img/akari.jpg", say: "「公式、覚えてたつもりだったんだけどな」", pref: ["formula"] },
  maki:    { n: "まき",         img: "img/akari.jpg", say: "「あ、そこで止まっちゃった。もう1行だったのに」", pref: ["laststep"] },
  hara:    { n: "ハラ",         img: "img/hara.jpg",  say: "「ちゃぼす……。豪快にいきすぎた」", pref: ["calc", "reduce"] },
  daigo:   { n: "ダイゴ",       img: "img/daigo.jpg", say: "「兄ちゃん、数字を写すとこで負けたわ」", pref: ["copy", "unit"] },
  shuto:   { n: "シュウト",     img: "img/shuto.jpg", say: "「……惜しかった？ 惜しくない？」", pref: ["formula", "misread"] },
};
const nu = (v, u) => ({ t: "num", v, unit: u || "" });
const fr = (n, d) => { const g = (a, b) => b ? g(b, a % b) : a; const k = g(n, d); return { t: "frac", n: n / k, d: d / k }; };
/* 各テンプレートは { q, lines:[{t, bad}], ans, type, k } を返す。bad=true が1行だけ */
const SA_GEN = [
  () => { const P = pick([1200, 1500, 2000, 2400, 3000]), r = pick([12, 15, 18, 20, 25, 30]); const S = P * (100 - r) / 100; return { q: `定価${P}円の品物を □%引きで売ったら、売値は${S}円になった。□は？`, lines: [{ t: `${S}÷${P}＝${(100 - r) / 100}` }, { t: `答え　${100 - r}%`, bad: true }], ans: nu(r, "%"), type: "laststep", k: `${(100 - r) / 100}は『売値の割合』。聞かれているのは『引いた割合』。100−${100 - r}＝${r}%。あと1回の引き算。` }; },
  () => { const v = pick([60, 70, 80, 90]), t = pick([12, 15, 20, 25]); return { q: `分速${v}mで${t}分歩いた。進んだ道のりは何m？`, lines: [{ t: `道のり＝速さ×時間` }, { t: `${v}×${t}＝${v * t}` }, { t: `答え　${v * t}km`, bad: true }], ans: nu(v * t, "m"), type: "unit", k: `分速${v}『m』だから、答えも m。${v * t}m（＝${v * t / 1000}km）。単位は問題文からそのまま持ってくる。` }; },
  () => { const d = pick([4, 5, 6, 8]), k = ri(8, 15), L = d * k; return { q: `${L}mの道に${d}mおきに木を植える。両はしにも植えると何本？`, lines: [{ t: `間の数＝${L}÷${d}＝${k}` }, { t: `答え　${k}本`, bad: true }], ans: nu(k + 1, "本"), type: "formula", k: `両はしに植えるなら、本数＝間の数＋1。${k}＋1＝${k + 1}本。池のまわりなら＋1しない。` }; },
  () => { const b = pick([8, 10, 12, 14]), h = pick([5, 6, 7, 9]); return { q: `底辺${b}cm、高さ${h}cmの三角形の面積は？`, lines: [{ t: `${b}×${h}＝${b * h}`, bad: true }, { t: `答え　${b * h}cm²` }], ans: nu(b * h / 2, "cm²"), type: "formula", k: `三角形は 底辺×高さ÷2。${b}×${h}÷2＝${b * h / 2}cm²。平行四辺形と混ざりやすい。` }; },
  () => { const a = pick([76, 78, 80, 82, 84]), n = 3, a2 = a + pick([2, 3, 4]); const c = a * n, c2 = a2 * 4, wrong = c2 - 10; return { q: `テスト3回の平均は${a}点。4回目を受けたら4回の平均が${a2}点になった。4回目は何点？`, lines: [{ t: `3回の合計　${a}×3＝${c}` }, { t: `4回の合計　${a2}×4＝${wrong}`, bad: true }, { t: `4回目　${wrong}−${c}＝${wrong - c}` }, { t: `答え　${wrong - c}点` }], ans: nu(c2 - c, "点"), type: "calc", k: `${a2}×4＝${c2}。考え方（合計の差）は完璧。かけ算を1回だけ見直せば${c2 - c}点。` }; },
  () => { const a = pick([2, 3, 4]), b = a + pick([2, 3]), u = pick([3, 4, 5, 6]); const diff = (b - a) * u; return { q: `AとBの枚数の比は${a}:${b}で、差は${diff}枚。Bは何枚？`, lines: [{ t: `差＝${b}−${a}＝${b - a}` }, { t: `①＝${diff}÷${b - a}＝${u}` }, { t: `答え　${u}枚`, bad: true }], ans: nu(b * u, "枚"), type: "laststep", k: `${u}は『①の値』。Bは${b}だから ${b}×${u}＝${b * u}枚。①を出して満足しない。` }; },
  () => { const d = pick([8, 10, 12]), n1 = ri(1, d / 2 - 1), n2 = ri(1, d / 2 - 1); const s = n1 + n2; const g = (x, y) => y ? g(y, x % y) : x; if (g(s, d) === 1) return SA_GEN[6](); return { q: `${n1}/${d}＋${n2}/${d} を計算しなさい。`, lines: [{ t: `分母はそのまま、分子をたす` }, { t: `答え　${s}/${d}`, bad: true }], ans: fr(s, d), type: "reduce", k: `${s}/${d} は約分できる。答えは ${fr(s, d).n}/${fr(s, d).d}。分数の答えは『約分したか』を最後に1秒だけ確認。` }; },
  () => { const m = pick([1.5, 2, 2.5, 3, 4]); return { q: `${m}m² は何cm²？`, lines: [{ t: `1m＝100cm だから` }, { t: `${m}×100＝${m * 100}`, bad: true }, { t: `答え　${m * 100}cm²` }], ans: nu(m * 10000, "cm²"), type: "unit", k: `面積は 100×100＝10000倍。${m}×10000＝${m * 10000}cm²。長さは×100、面積は×10000、体積は×1000000。` }; },
  () => { const N = ri(20, 50), r = N % 3, q = Math.floor(N / 3); const marks = ["▲", "■", "●"]; const right = r === 0 ? "●" : marks[r - 1]; const wrongM = marks[(r + 1) % 3 === 0 ? 2 : (r + 1) % 3 - 1]; return { q: `▲■●▲■●…とくり返す。${N}番目の記号は？`, lines: [{ t: `${N}÷3＝${q} あまり ${r}` }, { t: `答え　${wrongM}`, bad: true }], ans: null, choice: { right, opts: marks }, type: "formula", k: `あまり1なら1番目の▲、あまり2なら■、あまり0（割り切れる）なら最後の●。${N}番目は ${right}。『あまり0＝最後』が落とし穴。` }; },
  () => { const k = ri(2, 7), t = ri(2, 7); return { q: `ツルとカメが合わせて${k + t}匹、足は全部で${t * 2 + k * 4}本。カメは何匹？`, lines: [{ t: `全部ツルなら足は ${(k + t) * 2}本` }, { t: `差 ${t * 2 + k * 4 - (k + t) * 2}÷2＝${k}` }, { t: `答え　ツルは${t}匹`, bad: true }], ans: nu(k, "匹"), type: "misread", k: `出した${k}はカメの数。聞かれているのもカメ。なのに答えでツルを書いた。最後に『聞かれたのはどっち？』を見る。` }; },
  () => { const a = pick([20, 30, 36, 40]), b = pick([8, 12, 16]), c = pick([2, 4]); return { q: `${a}−${b}÷${c} を計算しなさい。`, lines: [{ t: `${a}−${b}＝${a - b}`, bad: true }, { t: `${a - b}÷${c}＝${(a - b) / c}` }, { t: `答え　${(a - b) / c}` }], ans: nu(a - b / c), type: "formula", k: `÷が先。${b}÷${c}＝${b / c}、${a}−${b / c}＝${a - b / c}。左から順にやると外れる。` }; },
  () => { const s = ri(5, 20), d = pick([4, 6, 8, 10]), b = s + d; return { q: `2つの数の和は${s + b}、差は${d}。小さいほうの数は？`, lines: [{ t: `（和＋差）÷2＝（${s + b}＋${d}）÷2＝${b}` }, { t: `答え　${b}`, bad: true }], ans: nu(s), type: "misread", k: `（和＋差）÷2 は『大きいほう』。小さいほうは（和−差）÷2＝${s}。または ${b}−${d}＝${s}。` }; },
  () => { const p = pick([120, 130, 150, 180]), n = ri(6, 9); const wrongP = p + pick([-20, 10, 20]); return { q: `1本${p}円のえんぴつを${n}本買う。代金は？`, lines: [{ t: `${wrongP}×${n}＝${wrongP * n}`, bad: true }, { t: `答え　${wrongP * n}円` }], ans: nu(p * n, "円"), type: "copy", k: `問題は1本${p}円。式に写すとき${wrongP}になっている。式を書いたら、問題文の数字と1回だけ照合する。` }; },
  () => { const r = pick([20, 25, 40, 60]), part = pick([30, 45, 60, 90]); const whole = part * 100 / r; if (!Number.isInteger(whole)) return SA_GEN[13](); return { q: `ある学校の${r}%が${part}人。全校生徒は何人？`, lines: [{ t: `${part}×${r / 100}＝${part * r / 100}`, bad: true }, { t: `答え　${part * r / 100}人` }], ans: nu(whole, "人"), type: "formula", k: `『${r}%が${part}人』→ 全体×${r / 100}＝${part}。だから全体＝${part}÷${r / 100}＝${whole}人。『の』が付く方（もとにする量）を求めるときは、÷。` }; },
  () => { const L = pick([24, 36, 48, 60]), w = pick([2, 3, 4]); return { q: `たて${w}cm、よこ${L}cmの長方形のまわりの長さは？`, lines: [{ t: `${w}＋${L}＝${w + L}` }, { t: `答え　${w + L}cm`, bad: true }], ans: nu((w + L) * 2, "cm"), type: "formula", k: `まわり＝（たて＋よこ）×2。${w + L}×2＝${(w + L) * 2}cm。『まわり』は2周ぶん…ではなく、たてよこ2本ずつ。` }; },
  () => { const t = pick([2, 3, 4]), sp = pick([40, 45, 50, 60]); return { q: `時速${sp}kmで${t}時間${30}分走った。道のりは何km？`, lines: [{ t: `${t}時間30分＝${t}.3時間`, bad: true }, { t: `${sp}×${t}.3＝${(sp * (t + .3)).toFixed(1).replace(/\.0$/, "")}` }, { t: `答え　${(sp * (t + .3)).toFixed(1).replace(/\.0$/, "")}km` }], ans: nu(sp * (t + .5), "km"), type: "unit", k: `30分は0.5時間（30÷60）。${t}.5時間。${sp}×${t}.5＝${sp * (t + .5)}km。『分→時間は÷60』。` }; },
];
function saMeta() { DB.meta.saiten = DB.meta.saiten || { sessions: 0, pts: 0, best: 0, byType: {}, bestStreak: 0 }; return DB.meta.saiten; }
let SA = null;
function openSaiten() {
  const m = saMeta();
  const typeRows = Object.entries(SA_TYPES).map(([k, t]) => { const s = m.byType[k] || { hit: 0, n: 0 }; return `<div class="strow"><span class="sn" style="width:auto;min-width:110px">${t.e} ${t.n}</span><div class="gauge"><u style="width:${s.n ? s.hit / s.n * 100 : 0}%;background:${s.n && s.hit / s.n >= .8 ? "#3ddc97" : "#ffcf5c"}"></u></div><span class="sv">${s.n ? Math.round(s.hit / s.n * 100) + "%" : "-"}</span></div>`; }).join("");
  openSheet(`<div class="ptitle">✍️ シノの採点室<small>仲間の答案に赤ペンを入れる。見つけたミスは、自分がしなくなる</small></div>
    <div style="font-size:11px;color:var(--ink2);line-height:1.8;margin-bottom:8px">1回8枚。①まちがっている行をタップ → ②ミスの型を当てる → ③正しい答えを自分で出す。</div>
    <div class="dpLine" style="margin-bottom:6px">採点した回数 <b>${m.sessions}</b>　最高 <b>${m.best}</b>点　最長連続 <b>${m.bestStreak}</b></div>
    <div class="lbl" style="margin:6px 0 4px">ミスの型ごとの発見率</div>
    <div class="card statCard" style="margin-bottom:10px">${typeRows}</div>
    <button class="btn" id="saGo">✍️ 採点をはじめる（8枚）</button>
    <div style="height:8px"></div><button class="btn dark" onclick="closeSheet()">閉じる</button>`);
  $("saGo").onclick = () => { sfx.tap(); closeSheet(); saStart(); };
}
function saStart() {
  SA = { k: 0, pts: 0, streak: 0, best: 0, log: [], usedGen: [] };
  showEvent({ c: "shino", t: "「採点室へようこそ。\n\n今日は、きみが先生。\nみんなの答案に、赤ペンを入れてもらう。\n\n人のミスは、よく見える。\nそして、一度『見つけた』ミスは、自分ではしなくなる。\n……8枚。いこう」", ch: [{ t: "✍️ 赤ペンを持つ", fx: {}, after: saNext }] });
}
function saNext() {
  if (SA.k >= 8) return saEnd();
  let gi, g, tries = 0;
  do { gi = ri(0, SA_GEN.length - 1); tries++; } while (SA.usedGen.includes(gi) && tries < 30);
  SA.usedGen.push(gi); g = SA_GEN[gi]();
  const writers = Object.keys(SA_WRITERS).filter(w => SA_WRITERS[w].pref.includes(g.type));
  const w = pick(writers.length ? writers : Object.keys(SA_WRITERS));
  SA.cur = { g, w, gotLine: false, gotType: false, gotAns: false };
  SA.k++;
  const wr = SA_WRITERS[w];
  openSheet(`<div class="ptitle">答案 ${SA.k} / 8<small>${wr.n}の答案　🖊 ${SA.pts}点　${SA.streak >= 2 ? "🔥" + SA.streak + "連続" : ""}</small></div>
    <div class="card" style="padding:12px;margin-bottom:10px;background:#f7f3e8;color:#1a1a1a;border-radius:8px;font-family:serif">
      <div style="font-size:12px;line-height:1.7;margin-bottom:8px;border-bottom:1px dashed #9a8f7a;padding-bottom:6px">【問題】${g.q}</div>
      <div style="font-size:11px;color:#6b6252;margin-bottom:4px">答案（まちがっている行をタップ）</div>
      ${g.lines.map((l, i) => `<button class="item" data-l="${i}" style="background:#fffdf7;color:#1a1a1a;margin:3px 0;box-shadow:0 0 0 1px #d8cfb8 inset;font-family:serif"><span class="ie" style="color:#9a8f7a">${i + 1}</span><div class="it"><b style="font-weight:600">${l.t}</b></div></button>`).join("")}
    </div>`);
  $("sheetPanel").querySelectorAll("[data-l]").forEach(b => b.onclick = () => { sfx.tap(); saLine(+b.dataset.l); });
}
function saLine(i) {
  const { g, w } = SA.cur; const badIdx = g.lines.findIndex(l => l.bad);
  const ok = i === badIdx;
  if (ok) { SA.cur.gotLine = true; SA.pts += 10; sfx.good(); } else sfx.bad();
  closeSheet();
  const t = ok ? `（${i + 1}行目に赤ペン。……当たり）\n\nシノ「そこ。よく見つけた。\nじゃあ、これは『どの型』のミスだ？」` : `（${i + 1}行目に赤ペン。……そこは合っている）\n\nシノ「惜しい。間違いは${badIdx + 1}行目。『${g.lines[badIdx].t}』\n……じゃあ、これは『どの型』のミスだ？」`;
  const opts = [g.type, ...Object.keys(SA_TYPES).filter(k => k !== g.type).sort(() => Math.random() - .5).slice(0, 2)].sort(() => Math.random() - .5);
  showEvent({ c: "shino", t, ch: opts.map(k => ({ t: `${SA_TYPES[k].e} ${SA_TYPES[k].n}`, fx: {}, after: () => saType(k) })) });
}
function saType(k) {
  const { g, w } = SA.cur; const ok = k === g.type;
  if (ok) { SA.cur.gotType = true; SA.pts += 5; sfx.good(); } else sfx.bad();
  const m = saMeta(); const s = m.byType[g.type] = m.byType[g.type] || { hit: 0, n: 0 }; s.n++; if (ok) s.hit++; save();
  const t = ok ? `シノ「正解。${SA_TYPES[g.type].e}『${SA_TYPES[g.type].n}』。\n${SA_TYPES[g.type].d}。\n\n……じゃあ、先生。正しい答えを書いて」` : `シノ「ちがう。これは${SA_TYPES[g.type].e}『${SA_TYPES[g.type].n}』。\n${SA_TYPES[g.type].d}。\n\n……じゃあ、先生。正しい答えを書いて」`;
  showEvent({ c: "shino", t, ch: [{ t: "✏️ 正しい答えを書く", fx: {}, after: saAnswer }] });
}
function saAnswer() {
  const { g, w } = SA.cur;
  if (g.choice) {
    return showEvent({ c: "shino", t: `【問題】${g.q}\n\n正しい答えは？`, ch: g.choice.opts.map(o => ({ t: o, fx: {}, after: () => saJudged(o === g.choice.right) })) });
  }
  startQuiz({ mode: "lesson", genre: "kufuu", lv: 3, total: 1, fixed: [{ q: g.q, a: g.ans, tag: "✍️ 正しい答え", small: true, time: 75, genre: "kufuu" }], title: `✍️ 答案 ${SA.k}/8　正解を書く`, onEnd: r => { $("ovResult").classList.remove("on"); saJudged(r.correct === 1); } });
}
function saJudged(ok) {
  const { g, w } = SA.cur; const wr = SA_WRITERS[w];
  if (ok) { SA.cur.gotAns = true; SA.pts += 10; }
  const full = SA.cur.gotLine && SA.cur.gotType && SA.cur.gotAns;
  if (full) { SA.streak++; SA.best = Math.max(SA.best, SA.streak); SA.pts += SA.streak >= 3 ? 5 : 0; confetti(24); sfx.clear(); } else SA.streak = 0;
  SA.log.push({ type: g.type, full, line: SA.cur.gotLine, ans: SA.cur.gotAns });
  const ansTxt = g.choice ? g.choice.right : MATH.ansText(g.ans);
  showEvent({ c: w === "hara" || w === "daigo" || w === "shuto" ? w : "shino", t: `${ok ? "✅ 正解　" : "❌ 正解は　"}${ansTxt}\n\n${wr.n}${wr.say}\n\n──シノの赤ペン──\n${g.k}${full ? `\n\n🖊 完全採点！（行・型・答え すべて正解）${SA.streak >= 2 ? `　🔥${SA.streak}連続` : ""}` : ""}`, ch: [{ t: SA.k >= 8 ? "▶ 採点結果へ" : "▶ 次の答案", fx: {}, after: saNext }] });
}
function saEnd() {
  const m = saMeta(); m.sessions++; m.pts += SA.pts; m.best = Math.max(m.best, SA.pts); m.bestStreak = Math.max(m.bestStreak, SA.best); save();
  const rank = SA.pts >= 190 ? ["👹 鬼教官", "#ffcf5c"] : SA.pts >= 150 ? ["🏅 ベテラン採点官", "#ff9f43"] : SA.pts >= 100 ? ["✍️ 一人前", "#3ddc97"] : ["🌱 見習い", "#4cc9f0"];
  const missed = {}; SA.log.forEach(l => { if (!l.full) missed[l.type] = (missed[l.type] || 0) + 1; });
  const worst = Object.entries(missed).sort((a, b) => b[1] - a[1])[0];
  const fullN = SA.log.filter(l => l.full).length;
  if (SA.pts >= 150) { confetti(60); sfx.clear(); }
  showEvent({ c: "shino", t: `✍️ 採点結果\n\n${rank[0]}　${SA.pts}点\n完全採点 ${fullN}/8　最長連続 ${SA.best}\n\n${worst ? `シノ「今日いちばん見逃したのは ${SA_TYPES[worst[0]].e}『${SA_TYPES[worst[0]].n}』。\n……人の答案で見逃す型は、自分の答案でもやる型だ。\n次のテストで、その型の問題が出たら、答えを書く前に3秒止まれ」` : "シノ「全部、完全採点。……先生、本物だな。\n人のミスが全部見える人は、自分のミスも見える」"}\n\n（通算 ${m.sessions}回　最高 ${m.best}点）`, ch: [{ t: "タイトルへ", fx: {}, after: () => { SA = null; renderTitle(); } }] });
}
