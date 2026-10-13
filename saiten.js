/* =====================================================================
   saiten.js  ✍️ シノの採点室（v2）
   受験でよくある間違いを含んだ答案を見て、
   ① 「わかった／わからなかった」 → ② どこが間違いかを4択（わからなければヒントのあと）
   → ③ 正しい答えを自分で書く → シノの解説と防止策。
   ===================================================================== */
const SA_TYPES = {
  laststep: { n: "最後の一歩",     e: "🎯", d: "途中までは合っているのに、聞かれたものを答えていない" },
  misread:  { n: "読み落とし",     e: "👀", d: "問題文の『どっち？』『何を？』を読み落として、別のものを答えた" },
  calc:     { n: "計算ミス",       e: "✖️", d: "考え方は合っているのに、かけ算・ひき算の途中でズレた" },
  formula:  { n: "公式・立式ミス", e: "📐", d: "式の形が違う（÷2を忘れる、＋1を忘れる、順序を間違える）" },
  unit:     { n: "単位ミス",       e: "📏", d: "数は合っているのに、単位の直し方や書き方が違う" },
  reduce:   { n: "約分・分数",     e: "🍰", d: "分数の処理（約分・逆数）を間違えた" },
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
/* 各テンプレート → { q, lines:[文], opts:[正解, ひっかけ×3], hint, ans | choice, type, k(解説), tip(防止策) } */
const SA_GEN = [
  () => { const P = pick([1200, 1500, 2000, 2400, 3000]), r = pick([12, 15, 18, 20, 25, 30]); const S = P * (100 - r) / 100; return { q: `定価${P}円の品物を □%引きで売ったら、売値は${S}円になった。□は？`, lines: [`${S}÷${P}＝${(100 - r) / 100}`, `答え　${100 - r}%`], opts: [`${(100 - r) / 100}は『売値が定価の何倍か』。聞かれているのは『引いた割合』だから 100−${100 - r} が要る`, `${S}÷${P} の割り算の答えがちがう`, `定価÷売値 で計算しなければいけない`, `${(100 - r) / 100}を%にするには ×1000 が必要`], hint: `${(100 - r) / 100}は『何の割合』？ 問題文は『□%引き』。引いた分を聞いている。`, ans: nu(r, "%"), type: "laststep", k: `${(100 - r) / 100}（${100 - r}%）は売値の割合。引いた割合は 100−${100 - r}＝${r}%。計算は完璧で、最後の引き算1回だけが抜けた。受験でいちばん多い失点。`, tip: "答えを書く前に、問題文の『聞かれていること』に線を引く。3秒。" }; },
  () => { const v = pick([60, 70, 80, 90]), t = pick([12, 15, 20, 25]); return { q: `分速${v}mで${t}分歩いた。進んだ道のりは何m？`, lines: [`道のり＝速さ×時間`, `${v}×${t}＝${v * t}`, `答え　${v * t}km`], opts: [`分速${v}『m』だから、答えの単位も m。${v * t}m が正しい`, `速さ×時間ではなく、時間÷速さ で求める`, `${t}分を時間に直して 0.25 を掛けなければいけない`, `${v}×${t} のかけ算がちがう`], hint: `問題文の速さは『分速${v}m』。計算はmのまま。答えの単位を見直して。`, ans: nu(v * t, "m"), type: "unit", k: `式も計算も合っている。分速がmなら答えもm。${v * t}m（1.2kmと書きたいなら ÷1000 が要る）。単位は問題文からそのまま持ってくる。`, tip: "答えの単位は、計算に使った数の単位と同じになる。km と m を見たら一度止まる。" }; },
  () => { const d = pick([4, 5, 6, 8]), k = ri(8, 15), L = d * k; return { q: `${L}mの道に${d}mおきに木を植える。両はしにも植えると何本？`, lines: [`間の数＝${L}÷${d}＝${k}`, `答え　${k}本`], opts: [`両はしに植えるので、本数は 間の数＋1。${k}＋1`, `${L}÷${d} の割り算がちがう`, `両はしに植えるので、本数は 間の数−1`, `${d}mおきなら ${L}×${d} で求める`], hint: `間が${k}個。木は『間と間のあいだ』と『両はし』にある。指で数えてみて。`, ans: nu(k + 1, "本"), type: "formula", k: `間の数は${k}で合っている。両はしに植えるなら 木＝間＋1＝${k + 1}本。池のまわり（輪）なら 木＝間、両はしに植えないなら 間−1。`, tip: "植木算は『両はし あり／なし／輪』の3パターンを、図を1本かいて確かめる。" }; },
  () => { const b = pick([8, 10, 12, 14]), h = pick([5, 6, 7, 9]); return { q: `底辺${b}cm、高さ${h}cmの三角形の面積は？`, lines: [`${b}×${h}＝${b * h}`, `答え　${b * h}cm²`], opts: [`三角形は 底辺×高さ÷2。÷2 が抜けている`, `面積の単位は cm² ではなく cm`, `三角形の面積は ${b}＋${h} で求める`, `高さではなく、ななめの辺の長さを使う`], hint: `${b}×${h} は長方形の面積。三角形は長方形の何分の1？`, ans: nu(b * h / 2, "cm²"), type: "formula", k: `三角形＝底辺×高さ÷2＝${b * h / 2}cm²。平行四辺形（÷2なし）と混ざりやすい。`, tip: "三角形・台形・ひし形は『÷2がある仲間』。公式を書くとき÷2を先に書く。" }; },
  () => { const a = pick([76, 78, 80, 82, 84]), a2 = a + pick([2, 3, 4]); const c = a * 3, c2 = a2 * 4, wrong = c2 - 10; return { q: `テスト3回の平均は${a}点。4回目を受けたら4回の平均が${a2}点になった。4回目は何点？`, lines: [`3回の合計　${a}×3＝${c}`, `4回の合計　${a2}×4＝${wrong}`, `4回目　${wrong}−${c}＝${wrong - c}`, `答え　${wrong - c}点`], opts: [`${a2}×4 は ${c2}。かけ算がずれている`, `3回の合計を求める式がちがう`, `合計は 平均÷回数 で求める`, `4回目は ${c2}＋${c} で求める`], hint: `考え方（合計の差）は正しい。2行目のかけ算を、もう一度やってみて。`, ans: nu(c2 - c, "点"), type: "calc", k: `${a2}×4＝${c2}、${c2}−${c}＝${c2 - c}点。考え方は満点。かけ算を1回見直すだけで取れた問題。`, tip: `かけ算は『一の位だけ』を先に暗算で確かめる。${a2}×4 の一の位は ${(a2 * 4) % 10}。` }; },
  () => { const a = pick([2, 3, 4]), b = a + pick([2, 3]), u = pick([3, 4, 5, 6]); const diff = (b - a) * u; return { q: `AとBの枚数の比は${a}:${b}で、差は${diff}枚。Bは何枚？`, lines: [`差＝${b}−${a}＝${b - a}`, `①＝${diff}÷${b - a}＝${u}`, `答え　${u}枚`], opts: [`${u}は『①の値』。Bは${b}だから ${b}×${u} が答え`, `差は ${b}−${a} ではなく ${b}＋${a}`, `${diff}÷${b - a} の割り算がちがう`, `聞かれているのはAなので ${a}×${u}`], hint: `①＝${u}は『比の1つ分』。Bは比で言うと いくつ分？`, ans: nu(b * u, "枚"), type: "laststep", k: `①＝${u}まで完璧。Bは${b}だから ${b}×${u}＝${b * u}枚。①を出して満足してしまう、比の問題の定番の失点。`, tip: "比の問題は、答えを書く前に『①を答えてないか？』を確認する。" }; },
  () => { const d = pick([8, 10, 12]), n1 = ri(1, d / 2 - 1), n2 = ri(1, d / 2 - 1); const s = n1 + n2; const g = (x, y) => y ? g(y, x % y) : x; if (g(s, d) === 1) return SA_GEN[6](); const f = fr(s, d); return { q: `${n1}/${d}＋${n2}/${d} を計算しなさい。`, lines: [`分母はそのまま、分子をたす`, `答え　${s}/${d}`], opts: [`${s}/${d} は約分できる。${f.n}/${f.d} まで直す`, `分母もたして ${s}/${d * 2} にする`, `分子をかけて ${n1 * n2}/${d} にする`, `分母がちがうので通分が必要`], hint: `${s}と${d}、どちらも同じ数で割れない？`, ans: f, type: "reduce", k: `${s}/${d}＝${f.n}/${f.d}。計算は合っているのに、約分していないと×になる学校が多い。`, tip: "分数の答えは『約分したか？』を最後に1秒だけ確認。" }; },
  () => { const m = pick([1.5, 2, 2.5, 3, 4]); return { q: `${m}m² は何cm²？`, lines: [`1m＝100cm だから`, `${m}×100＝${m * 100}`, `答え　${m * 100}cm²`], opts: [`面積は たて100倍×よこ100倍 で 10000倍。${m}×10000`, `1m＝100cm なので100倍で正しく、単位だけ cm に直す`, `面積は ×1000`, `m²→cm² は ÷100`], hint: `1m²は、1辺1mの正方形。1辺は100cm。100cm×100cmは？`, ans: nu(m * 10000, "cm²"), type: "unit", k: `面積は100×100＝10000倍。${m}×10000＝${m * 10000}cm²。長さ×100、面積×10000、体積×1000000。`, tip: "単位換算は『1辺が何倍か』を書いてから、面積なら2回かける。" }; },
  () => { const N = ri(20, 50), r = N % 3, q = Math.floor(N / 3); const marks = ["▲", "■", "●"]; const right = r === 0 ? "●" : marks[r - 1]; const wrongM = r === 0 ? "▲" : marks[r % 3]; return { q: `▲■●▲■●…とくり返す。${N}番目の記号は？`, lines: [`${N}÷3＝${q} あまり ${r}`, `答え　${wrongM}`], opts: [`あまり${r}なら、${r === 0 ? "割り切れる＝周期の最後の●" : `周期の${r}番目の${right}`}。あまりと記号の対応がずれている`, `${N}÷3 の割り算がちがう`, `周期は4つで1まわりとして数える`, `あまりではなく商の数で記号を決める`], hint: `あまり0・1・2 が、それぞれ周期のどこを指すか。3番目の●は「あまり0」。`, choice: { right, opts: marks }, type: "formula", k: `あまり1→▲、あまり2→■、あまり0→●（周期の最後）。${N}番目は${right}。『割り切れる＝最後』が落とし穴。`, tip: "周期算は、小さい番号（3番目、6番目）であまりと記号の対応を確かめてから使う。" }; },
  () => { const k = ri(2, 7), t = ri(2, 7); return { q: `ツルとカメが合わせて${k + t}匹、足は全部で${t * 2 + k * 4}本。カメは何匹？`, lines: [`全部ツルなら足は ${(k + t) * 2}本`, `差 ${t * 2 + k * 4 - (k + t) * 2}÷2＝${k}`, `答え　ツル${k}匹`], opts: [`『全部ツル』から始めて出た${k}は『カメ』の数。答えの名前がちがう`, `全部カメから始めないと解けない`, `足の差は ÷2 ではなく ÷4`, `全部ツルなら足は ${(k + t) * 4}本`], hint: `全部ツルだと仮定して、1匹をカメに入れかえると足が2本ふえる。だから差÷2で出るのは……どっち？`, ans: nu(k, "匹"), type: "misread", k: `差÷2＝${k}はカメの数。問題もカメを聞いている。なのに答えに『ツル』と書いた。数は合っていて、名前で落とす。`, tip: "つるかめ算は、出た数の横に『カメ』と書いてから答えを書く。" }; },
  () => { const a = pick([20, 30, 36, 40]), b = pick([8, 12, 16]), c = pick([2, 4]); return { q: `${a}−${b}÷${c} を計算しなさい。`, lines: [`${a}−${b}＝${a - b}`, `${a - b}÷${c}＝${(a - b) / c}`, `答え　${(a - b) / c}`], opts: [`÷を先に計算する。${a}−（${b}÷${c}）`, `左から順で合っているが、割り算がずれている`, `−を先にしたあと ×${c} する`, `${b}÷${c} を先にしたあと、たし算にする`], hint: `たし算・ひき算と、かけ算・わり算。先にやるのはどっち？`, ans: nu(a - b / c), type: "formula", k: `${b}÷${c}＝${b / c}、${a}−${b / c}＝${a - b / c}。『左から順に』は、×÷が混ざったら使えない。`, tip: "式を見たら、×÷の部分を先に丸で囲む。囲んだところから計算する。" }; },
  () => { const s = ri(5, 20), d = pick([4, 6, 8, 10]), b = s + d; return { q: `2つの数の和は${s + b}、差は${d}。小さいほうの数は？`, lines: [`（和＋差）÷2＝（${s + b}＋${d}）÷2＝${b}`, `答え　${b}`], opts: [`（和＋差）÷2 で出るのは『大きいほう』。小さいほうは（和−差）÷2`, `和と差をたしてはいけない。ひく`, `÷2 ではなく ÷3`, `${b}は小さいほうで合っている`], hint: `${b}は2つの数のうち、大きい？小さい？ 和が${s + b}なら、もう1つは？`, ans: nu(s), type: "misread", k: `（和＋差）÷2＝大きいほう＝${b}。小さいほうは（和−差）÷2＝${s}、または ${b}−${d}。問題は『小さいほう』。`, tip: "和差算は、出した数に『大』『小』を書いてから、問題の聞いているほうを答える。" }; },
  () => { const p = pick([120, 130, 150, 180]), n = ri(6, 9); const wrongP = p + pick([-20, 10, 20]); return { q: `1本${p}円のえんぴつを${n}本買う。代金は？`, lines: [`${wrongP}×${n}＝${wrongP * n}`, `答え　${wrongP * n}円`], opts: [`問題は1本${p}円なのに、式では${wrongP}円になっている`, `本数が${n}本ではない`, `代金は かけ算ではなく たし算`, `答えの単位は 円 ではなく 本`], hint: `問題文の値段と、式の値段を見比べて。`, ans: nu(p * n, "円"), type: "copy", k: `${p}×${n}＝${p * n}円。式に写すときに数字が変わった。計算は合っているぶん、気づきにくい。`, tip: "式を書いたら、問題文の数字に○をつけて、式の数字と1つずつ照合する。" }; },
  () => { const r = pick([20, 25, 40, 60]), part = pick([30, 45, 60, 90]); const whole = part * 100 / r; if (!Number.isInteger(whole)) return SA_GEN[13](); return { q: `ある学校の${r}%が${part}人。全校生徒は何人？`, lines: [`${part}×${r / 100}＝${part * r / 100}`, `答え　${part * r / 100}人`], opts: [`『${r}%『が』${part}人』なので、全体＝${part}÷${r / 100}。× ではなく ÷`, `${r / 100} ではなく ${r} を掛ける`, `${part}÷${r} で求める`, `${part}×（1−${r / 100}）で求める`], hint: `全体の${r}%が${part}人。全体は${part}人より多い？少ない？ ${part}×0.4 はどっち？`, ans: nu(whole, "人"), type: "formula", k: `全体×${r / 100}＝${part} だから、全体＝${part}÷${r / 100}＝${whole}人。『もとにする量』を求めるときは ÷。`, tip: "割合の文章題は『○の□%が△』の形に直す。○（もと）を聞かれたら ÷。" }; },
  () => { const L = pick([24, 36, 48, 60]), w = pick([2, 3, 4]); return { q: `たて${w}cm、よこ${L}cmの長方形のまわりの長さは？`, lines: [`${w}＋${L}＝${w + L}`, `答え　${w + L}cm`], opts: [`まわりは たてとよこが2本ずつ。（${w}＋${L}）×2`, `まわりは たて×よこ`, `まわりは たて＋よこ＋2`, `単位は cm ではなく cm²`], hint: `長方形の辺は何本？ たてが何本、よこが何本？`, ans: nu((w + L) * 2, "cm"), type: "formula", k: `（${w}＋${L}）×2＝${(w + L) * 2}cm。『まわり』は4本の辺の合計。`, tip: "『まわりの長さ』は図に4本の辺の長さを書き込んでからたす。" }; },
  () => { const t = pick([2, 3, 4]), sp = pick([40, 45, 50, 60]); const wrongH = t + .3; const wrongV = sp * wrongH; return { q: `時速${sp}kmで${t}時間30分走った。道のりは何km？`, lines: [`${t}時間30分＝${wrongH}時間`, `${sp}×${wrongH}＝${wrongV}`, `答え　${wrongV}km`], opts: [`30分は 30÷60＝0.5時間。${t}.5時間 にする`, `${sp}×${t} のあとに 30 をたす`, `30分＝0.3時間で合っていて、かけ算がずれている`, `時速なので ${sp}÷${wrongH} で求める`], hint: `1時間は60分。30分は1時間の何分の何？`, ans: nu(sp * (t + .5), "km"), type: "unit", k: `30分＝0.5時間。${sp}×${t}.5＝${sp * (t + .5)}km。『分→時間は÷60』。0.3と書く子が本当に多い。`, tip: "15分＝0.25、30分＝0.5、45分＝0.75、20分＝1/3、40分＝2/3 を暗記。" }; },
  () => { const D = pick([1200, 1500, 1800, 2000]), a = pick([60, 70, 80]), b = pick([40, 50]); if (D % (a + b)) return SA_GEN[16](); return { q: `${D}mはなれた2人が向かい合って同時に歩き出す。分速${a}mと分速${b}m。出会うのは何分後？`, lines: [`${D}÷${a}＝${D / a}`, `答え　${D / a}分後`], opts: [`2人で近づくので、速さの和（${a}＋${b}）で割る`, `速さの差（${a}−${b}）で割る`, `${D}×${a} で求める`, `速いほうの分速${a}だけで割ってよい`], hint: `1分間に、2人の間は何mちぢまる？ 1人の速さだけで考えていない？`, ans: nu(D / (a + b), "分後"), type: "formula", k: `1分で${a}＋${b}＝${a + b}mちぢまる。${D}÷${a + b}＝${D / (a + b)}分後。向かい合う＝速さの和、追いかける＝速さの差。`, tip: "旅人算は『近づく向き』の矢印を図に書く。向かい合えば和、同じ向きなら差。" }; },
  () => { const x = pick([40, 50, 55, 60, 65]), y = pick([45, 50, 60, 70]); return { q: `三角形の2つの内角が${x}度と${y}度。のこりの角の外角は何度？`, lines: [`180−${x}−${y}＝${180 - x - y}`, `答え　${180 - x - y}度`], opts: [`${180 - x - y}度は『内角』。聞かれているのは外角。外角＝${x}＋${y}（＝180−${180 - x - y}）`, `三角形の内角の和は360度`, `${x}＋${y} が内角になる`, `外角は 180−${x} で求める`], hint: `${180 - x - y}度は、のこりの『内角』。外角は、その角の『外側』の角。内角と外角をたすと？`, ans: nu(x + y, "度"), type: "misread", k: `内角${180 - x - y}度まで正解。外角＝180−${180 - x - y}＝${x + y}度。『となり合わない2つの内角の和』でもある。`, tip: "『外角』の字を見たら、図に外角の位置を書き込んでから計算する。" }; },
  () => { const r = pick([3, 4, 5, 6, 10]); return { q: `半径${r}cmの円の円周は何cm？（円周率3.14）`, lines: [`${r}×3.14＝${(r * 3.14).toFixed(2).replace(/\.?0+$/, "")}`, `答え　${(r * 3.14).toFixed(2).replace(/\.?0+$/, "")}cm`], opts: [`円周は 直径×3.14。半径${r}なら直径は${r * 2}`, `円周は 半径×半径×3.14`, `3.14のかけ算がずれている`, `単位は cm²`], hint: `円周の公式は『直径×3.14』。問題に書いてあるのは半径？直径？`, ans: nu(r * 2 * 3.14, "cm"), type: "formula", k: `直径${r * 2}×3.14＝${(r * 2 * 3.14).toFixed(2).replace(/\.?0+$/, "")}cm。半径と直径の読み違いは、円の問題で最多の失点。`, tip: "円の問題は、まず図に半径か直径かを書き込む。円周＝直径×3.14、面積＝半径×半径×3.14。" }; },
  () => { const P = pick([1200, 1500, 2000, 2500]), r = pick([10, 20, 30]); return { q: `${P}円の品物を${r}%増しの値段で売る。売る値段はいくら？`, lines: [`${P}×${r / 100}＝${P * r / 100}`, `答え　${P * r / 100}円`], opts: [`${P * r / 100}円は『増えた分』。売る値段は ${P}＋${P * r / 100}（または ${P}×${1 + r / 100}）`, `${r}%増しは ${P}÷${r / 100}`, `${P}−${P * r / 100} が売る値段`, `${r / 100} ではなく 0.0${r} を掛ける`], hint: `${P * r / 100}円は何の金額？ 『${r}%増しの値段』は、もとの値段より高い？`, ans: nu(P * (1 + r / 100), "円"), type: "laststep", k: `増える分${P * r / 100}円を出して止まった。売る値段＝${P}＋${P * r / 100}＝${P * (1 + r / 100)}円。×${1 + r / 100} で一発でもいい。`, tip: "『○%増し』『○%引き』は、1＋○ か 1−○ を先に作ってから掛ける。" }; },
  () => { const a = pick([2, 3, 4]), b = pick([5, 7, 9]), c = pick([2, 3]), d = pick([5, 7]); const wrong = fr(a * c, b * d), right = fr(a * d, b * c); return { q: `${a}/${b} ÷ ${c}/${d} を計算しなさい。`, lines: [`${a}/${b} × ${c}/${d}`, `＝${wrong.n}/${wrong.d}`, `答え　${wrong.n}/${wrong.d}`], opts: [`÷分数は『逆数』を掛ける。× ${d}/${c} にしなければいけない`, `分母どうし、分子どうしを割る`, `約分がまちがっている`, `答えは帯分数にしなければいけない`], hint: `分数のわり算は、わる数を『ひっくり返して』かける。ひっくり返した？`, ans: right, type: "reduce", k: `${a}/${b}×${d}/${c}＝${right.n}/${right.d}。『÷→×』にするときに逆数にする。×にしただけで逆数を忘れるのが典型。`, tip: "÷分数は、まず『×と逆数』を同時に書く。÷を×に直した瞬間に分子分母を入れかえる。" }; },
];
function saMeta() { DB.meta.saiten = DB.meta.saiten || { sessions: 0, pts: 0, best: 0, byType: {}, bestStreak: 0, tsumori: 0, honest: 0 }; return DB.meta.saiten; }
let SA = null;
function openSaiten() {
  const m = saMeta();
  const typeRows = Object.entries(SA_TYPES).map(([k, t]) => { const s = m.byType[k] || { hit: 0, n: 0 }; return `<div class="strow"><span class="sn" style="width:auto;min-width:110px">${t.e} ${t.n}</span><div class="gauge"><u style="width:${s.n ? s.hit / s.n * 100 : 0}%;background:${s.n && s.hit / s.n >= .8 ? "#3ddc97" : "#ffcf5c"}"></u></div><span class="sv">${s.n ? Math.round(s.hit / s.n * 100) + "%" : "-"}</span></div>`; }).join("");
  openSheet(`<div class="ptitle">✍️ シノの採点室<small>受験で本当によくある「間違い答案」を見抜く</small></div>
    <div style="font-size:11px;color:var(--ink2);line-height:1.8;margin-bottom:8px">1回8枚。答案を見て「わかった／わからなかった」→ どこが間違いかを4択 → 正しい答えを自分で書く。わからなければヒントが出る。</div>
    <div class="dpLine" style="margin-bottom:6px">採点 <b>${m.sessions}</b>回　最高 <b>${m.best}</b>点　わかったつもり <b>${m.tsumori || 0}</b>回</div>
    <div class="lbl" style="margin:6px 0 4px">ミスの型ごとの見抜き率</div>
    <div class="card statCard" style="margin-bottom:10px">${typeRows}</div>
    <button class="btn" id="saGo">✍️ 採点をはじめる（8枚）</button>
    <div style="height:8px"></div><button class="btn dark" onclick="closeSheet()">閉じる</button>`);
  $("saGo").onclick = () => { sfx.tap(); closeSheet(); saStart(); };
}
function saStart() {
  SA = { k: 0, pts: 0, streak: 0, best: 0, log: [], usedGen: [] };
  showEvent({ c: "shino", t: "「採点室へようこそ。今日は、きみが先生。\n\nこれから見せる答案は、ぜんぶ『受験生が本当にやる間違い』だ。\nぼくも、全部やった。\n\n正直に答えてほしい。『わかった』か『わからなかった』か。\nわからなければ、ヒントを出す。\n『わかったつもり』が、いちばんこわいから。\n\n……8枚。いこう」", ch: [{ t: "✍️ 赤ペンを持つ", fx: {}, after: saNext }] });
}
function saNext() {
  if (SA.k >= 8) return saEnd();
  let gi, tries = 0;
  do { gi = ri(0, SA_GEN.length - 1); tries++; } while (SA.usedGen.includes(gi) && tries < 40);
  SA.usedGen.push(gi); const g = SA_GEN[gi]();
  const writers = Object.keys(SA_WRITERS).filter(w => SA_WRITERS[w].pref.includes(g.type));
  const w = pick(writers.length ? writers : Object.keys(SA_WRITERS));
  SA.cur = { g, w, honest: null, gotWhy: false, gotAns: false, hinted: false };
  SA.k++;
  saShowPaper("まちがいが、わかった？", [["✅ わかった", () => saWhy(true)], ["🤔 わからなかった（ヒントを見る）", () => saHint()]]);
}
function saShowPaper(prompt, btns) {
  const { g, w } = SA.cur; const wr = SA_WRITERS[w];
  openSheet(`<div class="ptitle">答案 ${SA.k} / 8<small>${wr.n}の答案　🖊 ${SA.pts}点　${SA.streak >= 2 ? "🔥" + SA.streak + "連続" : ""}</small></div>
    <div class="card" style="padding:12px;margin-bottom:10px;background:#f7f3e8;color:#1a1a1a;border-radius:8px;font-family:serif">
      <div style="font-size:12.5px;line-height:1.7;margin-bottom:8px;border-bottom:1px dashed #9a8f7a;padding-bottom:6px">【問題】${g.q}</div>
      <div style="font-size:10.5px;color:#6b6252;margin-bottom:4px">${wr.n}の答案（どこかに、よくある間違いが1つ）</div>
      ${g.lines.map((l, i) => `<div style="font-size:13px;line-height:1.9;padding-left:6px;${i === g.lines.length - 1 ? "color:#b3261e;font-weight:700" : ""}">${l}</div>`).join("")}
    </div>
    <div class="lbl" style="margin:4px 0 6px">${prompt}</div>
    ${btns.map((b, i) => `<button class="btn ${i === 0 ? "" : "dark"}" id="saB${i}" style="margin-bottom:6px">${b[0]}</button>`).join("")}`);
  btns.forEach((b, i) => $("saB" + i).onclick = () => { sfx.tap(); closeSheet(); b[1](); });
}
function saHint() {
  SA.cur.honest = false; SA.cur.hinted = true; saMeta().honest++;
  showEvent({ c: "shino", t: `「正直でいい。わからないって言えるのは、強い。\n\n💡 ヒント\n${SA.cur.g.hint}\n\n……もう一回、答案を見てみよう」`, ch: [{ t: "▶ 答案を見る", fx: {}, after: () => saWhy(false) }] });
}
function saWhy(claimed) {
  const { g } = SA.cur; if (claimed) SA.cur.honest = true;
  const order = [0, 1, 2, 3].sort(() => Math.random() - .5);
  saShowPaper(claimed ? "どこが間違い？" : "ヒントを手がかりに。どこが間違い？", order.map(i => [g.opts[i], () => saWhyPick(i === 0)]));
}
function saWhyPick(ok) {
  const { g, w } = SA.cur; const m = saMeta();
  const s = m.byType[g.type] = m.byType[g.type] || { hit: 0, n: 0 }; s.n++; if (ok) s.hit++;
  if (ok) { SA.cur.gotWhy = true; SA.pts += SA.cur.hinted ? 8 : 15; sfx.good(); }
  else { sfx.bad(); if (SA.cur.honest) { m.tsumori++; SA.cur.tsumori = true; } }
  save();
  const t = ok
    ? `「正解。${SA_TYPES[g.type].e}『${SA_TYPES[g.type].n}』の型だ。\n\n${g.k}\n\n……じゃあ先生、正しい答えを書いて」`
    : `「ちがう。正しくは……\n\n👉 ${g.opts[0]}\n\n${g.k}${SA.cur.tsumori ? "\n\n……『わかった』と言って外した。これが『わかったつもり』。\n自分の答案でも、いちばん点を落とす瞬間だ。覚えておいて" : ""}\n\n……じゃあ先生、正しい答えを書いて」`;
  showEvent({ c: "shino", t, ch: [{ t: "✏️ 正しい答えを書く", fx: {}, after: saAnswer }] });
}
function saAnswer() {
  const { g } = SA.cur;
  if (g.choice) return showEvent({ c: "shino", t: `【問題】${g.q}\n\n正しい答えは？`, ch: g.choice.opts.map(o => ({ t: o, fx: {}, after: () => saJudged(o === g.choice.right) })) });
  startQuiz({ mode: "lesson", genre: "kufuu", lv: 3, total: 1, fixed: [{ q: g.q, a: g.ans, tag: "✍️ 正しい答え", small: true, time: 90, genre: "kufuu" }], title: `✍️ 答案 ${SA.k}/8　正解を書く`, onEnd: r => { $("ovResult").classList.remove("on"); saJudged(r.correct === 1); } });
}
function saJudged(ok) {
  const { g, w } = SA.cur; const wr = SA_WRITERS[w];
  if (ok) { SA.cur.gotAns = true; SA.pts += 10; }
  const full = SA.cur.gotWhy && SA.cur.gotAns && !SA.cur.hinted;
  if (full) { SA.streak++; SA.best = Math.max(SA.best, SA.streak); if (SA.streak >= 3) SA.pts += 5; confetti(24); sfx.clear(); } else SA.streak = 0;
  SA.log.push({ type: g.type, full, why: SA.cur.gotWhy, ans: SA.cur.gotAns, hinted: SA.cur.hinted, tsumori: !!SA.cur.tsumori });
  const ansTxt = g.choice ? g.choice.right : MATH.ansText(g.ans);
  showEvent({ c: ["hara", "daigo", "shuto"].includes(w) ? w : "shino", t: `${ok ? "✅ 正解　" : "❌ 正解は　"}${ansTxt}\n\n${wr.n}${wr.say}\n\n🛡 防止策\n${g.tip}${full ? `\n\n🖊 完全採点！（ヒントなしで見抜いて、正しく解いた）${SA.streak >= 2 ? `　🔥${SA.streak}連続` : ""}` : ""}`, ch: [{ t: SA.k >= 8 ? "▶ 採点結果へ" : "▶ 次の答案", fx: {}, after: saNext }] });
}
function saEnd() {
  const m = saMeta(); m.sessions++; m.pts += SA.pts; m.best = Math.max(m.best, SA.pts); m.bestStreak = Math.max(m.bestStreak, SA.best); save();
  const rank = SA.pts >= 180 ? ["👹 鬼教官", "#ffcf5c"] : SA.pts >= 140 ? ["🏅 ベテラン採点官", "#ff9f43"] : SA.pts >= 90 ? ["✍️ 一人前", "#3ddc97"] : ["🌱 見習い", "#4cc9f0"];
  const missed = {}; SA.log.forEach(l => { if (!l.why) missed[l.type] = (missed[l.type] || 0) + 1; });
  const worst = Object.entries(missed).sort((a, b) => b[1] - a[1])[0];
  const fullN = SA.log.filter(l => l.full).length, hintN = SA.log.filter(l => l.hinted).length, tsN = SA.log.filter(l => l.tsumori).length;
  if (SA.pts >= 140) { confetti(60); sfx.clear(); }
  showEvent({ c: "shino", t: `✍️ 採点結果\n\n${rank[0]}　${SA.pts}点\n完全採点 ${fullN}/8　ヒントを使った ${hintN}枚　わかったつもり ${tsN}回\n\n${worst ? `「今日いちばん見抜けなかったのは ${SA_TYPES[worst[0]].e}『${SA_TYPES[worst[0]].n}』。\n人の答案で見抜けない型は、自分の答案でもやる型だ。\n次のテストで、その型が出たら、答えを書く前に3秒止まれ」` : "「全部、見抜いた。……先生、本物だな。\n人のミスが全部見える人は、自分のミスも見える」"}${tsN ? `\n\n「それと。『わかった』と言って外したのが${tsN}回。\n……わからないときは、わからないと言っていい。それが一番速い」` : ""}\n\n（通算 ${m.sessions}回　最高 ${m.best}点）`, ch: [{ t: "タイトルへ", fx: {}, after: () => { SA = null; renderTitle(); } }] });
}
