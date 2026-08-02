"use strict";
/* =========================================================
   math.js — 中学受験の計算エンジン
   5ジャンル × 難易度5段階
   pi    : 3.14の計算（円周・面積・分配）
   frac  : 分数と小数
   ratio : 割合・比・単位
   gyaku : 逆算（□をもとめる）
   kufuu : 四則混合・工夫計算・数列
   ========================================================= */
const MATH = (() => {

const R  = x => Math.round(x * 1e6) / 1e6;
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const gcd = (a, b) => { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { const t = a % b; a = b; b = t; } return a || 1; };

const num  = (v, unit) => ({ t: "num", v: R(v), unit: unit || "" });
const frac = (n, d) => { const g = gcd(n, d); return { t: "frac", n: n / g, d: d / g }; };
/* 分数の表示 */
const F = (n, d) => `<span class="fr"><i>${n}</i><b>${d}</b></span>`;
const BOX = `<span style="color:#ff5f9e">□</span>`;

/* ---------- ① 3.14の計算 ---------- */
function gPi(lv) {
  const r = Math.random();
  if (lv <= 1) {
    const n = ri(2, 9);
    return { q: `3.14 × ${n}`, a: num(3.14 * n), tag: "3.14の段" };
  }
  if (lv === 2) {
    if (r < .5) { const n = pick([11,12,13,14,15,16,17,18,19]); return { q: `3.14 × ${n}`, a: num(3.14 * n), tag: "3.14の段" }; }
    if (r < .8) { const n = pick([20,25,30,40,50,60,80]); return { q: `3.14 × ${n}`, a: num(3.14 * n), tag: "3.14の段" }; }
    const n = pick([0.5, 1.5, 2.5, 0.2, 0.4]); return { q: `3.14 × ${n}`, a: num(3.14 * n), tag: "3.14の段" };
  }
  if (lv === 3) {
    if (r < .35) { const d = ri(2, 14); return { q: `直径 ${d}cm の円の<br>まわりの長さは？`, a: num(d * 3.14, "cm"), tag: "円周", small: true }; }
    if (r < .7)  { const k = ri(2, 9);  return { q: `半径 ${k}cm の円の<br>まわりの長さは？`, a: num(2 * k * 3.14, "cm"), tag: "円周", small: true }; }
    const k = ri(2, 9); return { q: `半径 ${k}cm の円の<br>面積は？`, a: num(k * k * 3.14, "cm²"), tag: "円の面積", small: true };
  }
  if (lv === 4) {
    if (r < .3) { const a = ri(2, 9), b = ri(2, 19 - a); return { q: `3.14 × ${a} ＋ 3.14 × ${b}`, a: num(3.14 * (a + b)), tag: "くふう" }; }
    if (r < .5) { const a = ri(11, 19), b = ri(2, 9); return { q: `3.14 × ${a} − 3.14 × ${b}`, a: num(3.14 * (a - b)), tag: "くふう" }; }
    if (r < .7) { const a = ri(3, 9), b = ri(2, 8); return { q: `${a} × 3.14 ＋ ${b} × 3.14`, a: num(3.14 * (a + b)), tag: "くふう" }; }
    const set = pick([[90,[2,4,6,8,10]],[45,[4,8]],[180,[2,4,6,8]],[120,[3,6,9]],[270,[2,4,6]],[60,[6,12]]]);
    const ang = set[0], k = pick(set[1]);
    return { q: `半径 ${k}cm・中心角 ${ang}° の<br>おうぎ形の面積は？`, a: num(k * k * 3.14 * ang / 360, "cm²"), tag: "おうぎ形", small: true };
  }
  /* lv5 */
  if (r < .3) { const Ro = ri(5, 12), ir = ri(2, Ro - 2); return { q: `半径 ${Ro}cm の円から<br>半径 ${ir}cm の円をくりぬいた<br>ドーナツの面積は？`, a: num((Ro * Ro - ir * ir) * 3.14, "cm²"), tag: "円の面積", small: true }; }
  if (r < .5) { const set = pick([[90,[4,8,12]],[180,[3,6,9]],[60,[6,12]],[120,[3,6,9]]]); const ang = set[0], k = pick(set[1]);
    return { q: `半径 ${k}cm・中心角 ${ang}° の<br>おうぎ形の 弧の長さ は？`, a: num(2 * k * 3.14 * ang / 360, "cm"), tag: "おうぎ形", small: true }; }
  if (r < .7) { const a = ri(4, 9), b = ri(2, 3), c = ri(2, 5);
    return { q: `3.14 × ${a} − 3.14 × ${b} ＋ 3.14 × ${c}`, a: num(3.14 * (a - b + c)), tag: "くふう" }; }
  const k = pick([2, 4, 6, 8, 10]);
  return { q: `1辺 ${k}cm の正方形に<br>ぴったり入る円の面積は？`, a: num((k / 2) * (k / 2) * 3.14, "cm²"), tag: "円の面積", small: true };
}

/* ---------- ② 分数と小数 ---------- */
const CONV = [[1,2],[1,4],[3,4],[1,5],[2,5],[3,5],[4,5],[1,8],[3,8],[5,8],[7,8],[1,10],[3,10],[7,10],[9,10],[1,20],[3,20],[7,20],[1,25],[3,25],[1,40]];
const CONV_EASY = [[1,2],[1,4],[3,4],[1,5],[2,5],[1,10],[3,10],[1,8]];
function gFrac(lv) {
  const r = Math.random();
  if (lv <= 1) {
    const c = pick(CONV_EASY);
    if (r < .5) return { q: `${F(c[0], c[1])} を 小数で`, a: num(c[0] / c[1]), tag: "分数→小数" };
    return { q: `${R(c[0] / c[1])} を 分数で`, a: frac(c[0], c[1]), tag: "小数→分数", note: "分数は 3/4 のように入力" };
  }
  if (lv === 2) {
    if (r < .35) { const c = pick(CONV);
      return Math.random() < .5
        ? { q: `${F(c[0], c[1])} を 小数で`, a: num(c[0] / c[1]), tag: "分数→小数" }
        : { q: `${R(c[0] / c[1])} を 分数で`, a: frac(c[0], c[1]), tag: "小数→分数", note: "分数は 3/4 のように入力" };
    }
    for (let i = 0; i < 40; i++) {
      const d1 = pick([2,3,4,5,6,8,10,12]), d2 = pick([2,3,4,5,6,8,10,12]);
      if (d1 === d2) continue;
      const n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1);
      const plus = Math.random() < .6;
      const v = plus ? n1 / d1 + n2 / d2 : n1 / d1 - n2 / d2;
      if (v <= 0) continue;
      const N = plus ? n1 * d2 + n2 * d1 : n1 * d2 - n2 * d1, D = d1 * d2;
      const f = frac(N, D);
      if (f.d === 1 || f.d > 40 || f.n > 40) continue;
      return { q: `${F(n1, d1)} ${plus ? "＋" : "−"} ${F(n2, d2)}`, a: f, tag: "分数の計算", note: "分数は 3/4 のように入力" };
    }
    return gFrac(1);
  }
  if (lv === 3) {
    for (let i = 0; i < 40; i++) {
      const d1 = pick([2,3,4,5,6,8,9,10,12]), d2 = pick([2,3,4,5,6,8,9,10,12]);
      const n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1);
      const mul = Math.random() < .55;
      const f = mul ? frac(n1 * n2, d1 * d2) : frac(n1 * d2, d1 * n2);
      if (f.d === 1 || f.d > 60 || f.n > 60) continue;
      return { q: `${F(n1, d1)} ${mul ? "×" : "÷"} ${F(n2, d2)}`, a: f, tag: "分数の計算", note: "分数は 3/4 のように入力" };
    }
    return gFrac(2);
  }
  if (lv === 4) {
    for (let i = 0; i < 40; i++) {
      const c = pick([[1,2],[1,4],[3,4],[1,5],[2,5],[1,10],[3,10]]);
      const dec = R(c[0] / c[1]);
      const d2 = pick([3,4,5,6,8,9,12]), n2 = ri(1, d2 - 1);
      const op = pick(["＋", "−", "×"]);
      let f;
      if (op === "×") f = frac(c[0] * n2, c[1] * d2);
      else if (op === "＋") f = frac(c[0] * d2 + n2 * c[1], c[1] * d2);
      else { const N = c[0] * d2 - n2 * c[1]; if (N <= 0) continue; f = frac(N, c[1] * d2); }
      if (f.d === 1 || f.d > 60 || f.n > 60) continue;
      return { q: `${dec} ${op} ${F(n2, d2)}`, a: f, tag: "小数と分数", note: "分数は 3/4 のように入力" };
    }
    return gFrac(3);
  }
  /* lv5 */
  for (let i = 0; i < 60; i++) {
    if (Math.random() < .5) {
      const ds = [pick([2,3,4,6]), pick([3,4,5,6,8]), pick([2,4,6,12])];
      const ns = ds.map(d => ri(1, d - 1));
      const v = ns[0] / ds[0] + ns[1] / ds[1] - ns[2] / ds[2];
      if (v <= 0) continue;
      const D = ds[0] * ds[1] * ds[2];
      const f = frac(ns[0] * ds[1] * ds[2] + ns[1] * ds[0] * ds[2] - ns[2] * ds[0] * ds[1], D);
      if (f.d === 1 || f.d > 60 || f.n > 60) continue;
      return { q: `${F(ns[0], ds[0])} ＋ ${F(ns[1], ds[1])} − ${F(ns[2], ds[2])}`, a: f, tag: "分数の計算", note: "分数は 3/4 のように入力" };
    }
    const d1 = pick([2,3,4,5,6]), d2 = pick([2,3,4,5,6]), d3 = pick([2,3,4,5]);
    const n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1), n3 = ri(1, d3 - 1);
    const f = frac(n1 * n3 * d2, d1 * d3 * n2);
    if (f.d === 1 || f.d > 60 || f.n > 60) continue;
    return { q: `${F(n1, d1)} ÷ ${F(n2, d2)} × ${F(n3, d3)}`, a: f, tag: "分数の計算", note: "分数は 3/4 のように入力" };
  }
  return gFrac(3);
}

/* ---------- ③ 割合・比・単位 ---------- */
function gRatio(lv) {
  const r = Math.random();
  if (lv <= 1) {
    if (r < .6) { const base = pick([100,200,300,400,500,600,800,1000,2000]); const p = pick([10,20,25,50,5,30,40,60,75,80]);
      return { q: `${base} の ${p}% は？`, a: num(base * p / 100), tag: "割合", small: true }; }
    const d = pick([0.05,0.1,0.15,0.2,0.25,0.3,0.4,0.5,0.6,0.75,0.8]);
    return { q: `${d} を 百分率で`, a: num(d * 100, "%"), tag: "割合" };
  }
  if (lv === 2) {
    if (r < .5) { const base = pick([20,25,40,50,80,100,200,250,400]); const p = pick([5,10,20,25,40,50,60,75,80]);
      return { q: `${R(base * p / 100)} は ${base} の 何%？`, a: num(p, "%"), tag: "割合", small: true }; }
    if (r < .8) { const base = pick([20,40,50,60,80,100,200]); const w = pick([1,2,3,4,5,6,7,8,9]);
      return { q: `${R(base * w / 10)} は ${base} の 何割？`, a: num(w, "割"), tag: "歩合", small: true }; }
    const d = pick([1,2,3,4,5,6,7,8]);
    return { q: `${d}割 を 小数で`, a: num(d / 10), tag: "歩合" };
  }
  if (lv === 3) {
    if (r < .5) { const p = pick([10,20,25,40,50,60,75,80]); const ans = pick([20,40,60,80,120,200,300,400]);
      return { q: `ある数の ${p}% が ${R(ans * p / 100)}。<br>ある数は？`, a: num(ans), tag: "割合", small: true }; }
    if (r < .8) { const rt = pick([[1,2],[1,3],[2,3],[3,5],[2,7],[4,5],[3,4],[5,7]]);
      const s = rt[0] + rt[1], total = s * ri(3, 12);
      return { q: `${total}個 を ${rt[0]} : ${rt[1]} に分けます。<br>多いほうは 何個？`, a: num(total / s * Math.max(rt[0], rt[1]), "個"), tag: "比例配分", small: true }; }
    const k = ri(2, 9); const p = pick([[2,3],[3,4],[2,5],[3,5],[4,5],[5,7],[3,7],[4,9],[5,8]]);
    const a = p[0], b = p[1];
    return { q: `${a * k} : ${b * k} を もっとも簡単な<br>整数の比にすると ${a} : ${BOX}`, a: num(b), tag: "比", small: true };
  }
  if (lv === 4) {
    if (r < .35) { const price = pick([800,1200,1500,2000,2400,3000,4000]); const p = pick([1,2,3]);
      return { q: `${price}円 の ${p}割引 は いくら？`, a: num(price * (10 - p) / 10, "円"), tag: "割引", small: true }; }
    if (r < .65) { const c = pick([400,600,800,1200,1600,2000]); const p = pick([10,20,25,30,50]);
      return { q: `原価 ${c}円 に ${p}% の利益を<br>つけた 定価は？`, a: num(c * (100 + p) / 100, "円"), tag: "利益", small: true }; }
    const w = pick([100,150,200,250,300,400,500]); const p = pick([2,4,5,6,8,10]);
    return { q: `${p}% の食塩水 ${w}g に<br>とけている食塩は 何g？`, a: num(w * p / 100, "g"), tag: "濃度", small: true };
  }
  /* lv5 */
  if (r < .25) { const c = pick([[100,10,100],[200,6,100],[300,8,100],[200,9,100],[100,20,100],[400,5,100],[200,12,200],[300,10,200],[150,8,50],[100,15,200]]);
    return { q: `${c[1]}% の食塩水 ${c[0]}g に<br>水 ${c[2]}g を加えると 何%？`, a: num(c[0] * c[1] / (c[0] + c[2]), "%"), tag: "濃度", small: true }; }
  if (r < .45) { const m = pick([1.2, 2.5, 0.8, 3.4, 1.05]);
    return { q: `${m} m² は 何 cm²？`, a: num(m * 10000, "cm²"), tag: "単位", small: true }; }
  if (r < .6) { const km = ri(1, 9), m = pick([50,120,250,400,600,750]);
    return { q: `${km}km ${m}m は 何 m？`, a: num(km * 1000 + m, "m"), tag: "単位", small: true }; }
  if (r < .75) { const h = ri(1, 3), mi = pick([15,20,30,40,45,50]);
    return { q: `${h}時間 ${mi}分 は 何分？`, a: num(h * 60 + mi, "分"), tag: "単位", small: true }; }
  const price = pick([1200,1600,2000,2500,3000]); const p = pick([2,3]); const t = pick([10]);
  return { q: `${price}円 の ${p}割引 に<br>消費税 ${t}% を たすと？`, a: num(price * (10 - p) / 10 * (100 + t) / 100, "円"), tag: "割合", small: true };
}

/* ---------- ④ 逆算 ---------- */
function gGyaku(lv) {
  const r = Math.random();
  if (lv <= 1) {
    const x = ri(3, 30), a = ri(2, 25);
    if (r < .2) return { q: `${BOX} ＋ ${a} = ${x + a}`, a: num(x), tag: "逆算" };
    if (r < .4) return { q: `${BOX} − ${a} = ${x}`, a: num(x + a), tag: "逆算" };
    if (r < .6) return { q: `${x + a} − ${BOX} = ${a}`, a: num(x), tag: "逆算" };
    if (r < .8) { const b = ri(2, 9); return { q: `${BOX} × ${b} = ${x * b}`, a: num(x), tag: "逆算" }; }
    const b = ri(2, 9); return { q: `${BOX} ÷ ${b} = ${x}`, a: num(x * b), tag: "逆算" };
  }
  if (lv === 2) {
    const x = ri(2, 20), a = ri(2, 15), b = ri(2, 9);
    if (r < .3) return { q: `( ${BOX} ＋ ${a} ) × ${b} = ${(x + a) * b}`, a: num(x), tag: "逆算" };
    if (r < .55) return { q: `${BOX} × ${b} ＋ ${a} = ${x * b + a}`, a: num(x), tag: "逆算" };
    if (r < .8) { const v = x * b - a; if (v <= 0) return gGyaku(2); return { q: `${BOX} × ${b} − ${a} = ${v}`, a: num(x), tag: "逆算" }; }
    return { q: `( ${BOX} − ${a} ) × ${b} = ${x * b}`, a: num(x + a), tag: "逆算" };
  }
  if (lv === 3) {
    const x = ri(2, 15), a = ri(2, 12), b = ri(2, 9);
    if (r < .3) return { q: `${x * b + a * b} ÷ ${b} − ${a} = ${BOX}`, a: num(x), tag: "逆算" };
    if (r < .55) return { q: `${(x + a) * b} ÷ ( ${BOX} ＋ ${a} ) = ${b}`, a: num(x), tag: "逆算" };
    if (r < .8) return { q: `${x * b + a} − ${BOX} × ${b} = ${a}`, a: num(x), tag: "逆算" };
    return { q: `( ${x + a} − ${BOX} ) × ${b} = ${a * b}`, a: num(x), tag: "逆算" };
  }
  if (lv === 4) {
    const x = ri(2, 12);
    if (r < .35) { const a = pick([0.2,0.4,0.5,1.2,2.5]), b = pick([1.2,2.4,3.6,0.8]);
      return { q: `${a} × ${BOX} ＋ ${b} = ${R(a * x + b)}`, a: num(x), tag: "逆算" }; }
    if (r < .6) { const a = pick([0.5,0.25,0.2,1.5]), b = ri(2, 9);
      return { q: `${BOX} ÷ ${a} − ${b} = ${R(x / a - b)}`, a: num(x), tag: "逆算" }; }
    if (r < .8) { const d = pick([2,3,4,5]), n = ri(1, d - 1);
      const g = gcd(n * x, d), rn = n * x / g, rd = d / g;
      return { q: `${BOX} × ${F(n, d)} = ${rd === 1 ? rn : F(rn, rd)}`, a: num(x), tag: "逆算" }; }
    const a = ri(2, 9), b = ri(2, 9);
    return { q: `${BOX} × ${a} ＋ ${BOX} × ${b} = ${x * (a + b)}`, a: num(x), tag: "逆算" };
  }
  /* lv5 */
  const x = ri(2, 12), a = ri(2, 9), b = ri(2, 8), c = ri(2, 12);
  if (r < .35) return { q: `( ${BOX} ＋ ${a} ) × ${b} − ${c} = ${(x + a) * b - c}`, a: num(x), tag: "逆算" };
  if (r < .6) { const d = ri(2, 6); return { q: `( ${BOX} × ${a} − ${c} ) ÷ ${d} = ${R((x * a - c) / d)}`, a: num(x), tag: "逆算" }; }
  if (r < .8) return { q: `${a} × ( ${b} ＋ ${BOX} ) = ${a * (b + x)}`, a: num(x), tag: "逆算" };
  const d = pick([2,4,5]); return { q: `( ${BOX} ＋ ${a} ) ÷ ${d} ＋ ${b} = ${R((x + a) / d + b)}`, a: num(x), tag: "逆算" };
}

/* ---------- ⑤ 四則混合・工夫・数列 ---------- */
function gKufuu(lv) {
  const r = Math.random();
  if (lv <= 1) {
    const a = ri(2, 20), b = ri(2, 9), c = ri(2, 9);
    if (r < .35) return { q: `${a} ＋ ${b} × ${c}`, a: num(a + b * c), tag: "四則" };
    if (r < .7) { const a2 = ri(1, b * c - 1); return { q: `${b} × ${c} − ${a2}`, a: num(b * c - a2), tag: "四則" }; }
    const d = ri(2, 9); return { q: `${a} × ${b} ＋ ${c} × ${d}`, a: num(a * b + c * d), tag: "四則" };
  }
  if (lv === 2) {
    const a = ri(2, 15), b = ri(2, 12), c = ri(2, 9), d = ri(2, 9);
    if (r < .3) return { q: `( ${a} ＋ ${b} ) × ${c} − ${d}`, a: num((a + b) * c - d), tag: "四則" };
    if (r < .55) { const bb = b + c; return { q: `${a} × ( ${bb} − ${c} ) ＋ ${d}`, a: num(a * b + d), tag: "四則" }; }
    if (r < .8) { const t = c * d; return { q: `${t} ÷ ${c} ＋ ${a} × ${b}`, a: num(d + a * b), tag: "四則" }; }
    { const t = c * d + ri(2, 40); return { q: `${t} − ${c} × ${d}`, a: num(t - c * d), tag: "四則" }; }
  }
  if (lv === 3) {
    if (r < .25) { const n = pick([12,16,24,28,32,36,44,48]); return { q: `25 × ${n}`, a: num(25 * n), tag: "くふう" }; }
    if (r < .45) { const n = pick([8,16,24,32,40,48]); return { q: `125 × ${n}`, a: num(125 * n), tag: "くふう" }; }
    if (r < .65) { const n = ri(12, 48); return { q: `99 × ${n}`, a: num(99 * n), tag: "くふう" }; }
    if (r < .8) { const n = ri(12, 45); return { q: `101 × ${n}`, a: num(101 * n), tag: "くふう" }; }
    const s = pick([[4,25],[8,125],[2,50],[5,20]]); const m = ri(3, 19);
    return { q: `${s[0]} × ${m} × ${s[1]}`, a: num(s[0] * m * s[1]), tag: "くふう" };
  }
  if (lv === 4) {
    if (r < .3) { const n = pick([10,20,30,40,50,60,100]);
      return { q: `1 ＋ 2 ＋ 3 ＋ … ＋ ${n}`, a: num(n * (n + 1) / 2), tag: "数列", small: true }; }
    if (r < .5) { const n = pick([10,12,16,20,24,30]);
      return { q: `2 ＋ 4 ＋ 6 ＋ … ＋ ${n}`, a: num((2 + n) * (n / 2) / 2), tag: "数列", small: true }; }
    if (r < .68) { const k = pick([5,7,9,10,12,15]); const last = 2 * k - 1;
      return { q: `1 ＋ 3 ＋ 5 ＋ … ＋ ${last}`, a: num(k * k), tag: "数列", small: true }; }
    if (r < .85) { const n = pick([3,4,5,6]);
      let terms = []; for (let i = 1; i <= n; i++) terms.push(F(1, `${i}×${i + 1}`));
      return { q: terms.join(" ＋ "), a: frac(n, n + 1), tag: "部分分数", small: true, note: "分数は 3/4 のように入力" }; }
    const a = pick([2.5,1.5,0.5,3.5]), b = ri(2, 8), c = ri(2, 8);
    return { q: `${a} × ${b} ＋ ${a} × ${c}`, a: num(a * (b + c)), tag: "くふう" };
  }
  /* lv5 */
  if (r < .25) { const a = pick([2.5,1.25,0.75,3.5]), b = ri(11, 19), c = ri(2, 9);
    return { q: `${a} × ${b} − ${a} × ${c}`, a: num(a * (b - c)), tag: "くふう" }; }
  if (r < .45) { const d = pick([2,4,5,8]), n = ri(1, d - 1); const dec = R(1 - n / d);
    return { q: `( ${F(n, d)} ＋ ${dec} ) × ${d * 2}`, a: num(d * 2), tag: "くふう", small: true }; }
  if (r < .6) { const a = pick([1.2,2.4,3.6,4.8]), b = pick([0.4,0.6,1.2]), c = ri(2, 9), d = pick([0.5,1.5,2.5]);
    return { q: `${a} ÷ ${b} ＋ ${c} × ${d}`, a: num(a / b + c * d), tag: "四則", small: true }; }
  if (r < .8) { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 6);
    return { q: `{ ( ${a} ＋ ${b} ) × ${c} − ${b} × ${c} } ÷ ${c}`, a: num(a), tag: "四則", small: true }; }
  const k = pick([2.5,1.25,0.5]); const m = ri(2, 8);
  return { q: `3.14 × ${k} × ${m * 4}`, a: num(3.14 * k * m * 4), tag: "くふう" };
}

const GEN = { pi: gPi, frac: gFrac, ratio: gRatio, gyaku: gGyaku, kufuu: gKufuu };
const GENRE_NAME = { pi: "3.14マスター", frac: "分数と小数", ratio: "割合と比", gyaku: "逆算", kufuu: "四則と工夫" };
const BASE_TIME = { pi: 14, frac: 16, ratio: 18, gyaku: 16, kufuu: 16 };

function gen(genre, lv) {
  lv = Math.max(1, Math.min(5, lv | 0));
  let q;
  try { q = GEN[genre](lv); } catch (e) { q = gPi(1); }
  q.genre = genre; q.lv = lv;
  q.time = BASE_TIME[genre] + (lv - 1) * 3;
  return q;
}

/* 答えの判定 */
function parseVal(s) {
  s = String(s || "").trim();
  if (!s) return null;
  if (s.includes("/")) {
    const p = s.split("/");
    if (p.length !== 2) return null;
    const n = parseFloat(p[0]), d = parseFloat(p[1]);
    if (!isFinite(n) || !isFinite(d) || d === 0) return null;
    return n / d;
  }
  const v = parseFloat(s);
  return isFinite(v) ? v : null;
}
function check(input, a) {
  const s = String(input || "").trim();
  if (!s) return false;
  if (a.t === "frac") {
    if (!s.includes("/")) {
      const v = parseVal(s);
      return v !== null && Math.abs(v - a.n / a.d) < 1e-9 && a.d === 1;
    }
    const p = s.split("/");
    const n = parseFloat(p[0]), d = parseFloat(p[1]);
    if (!isFinite(n) || !isFinite(d) || d === 0) return false;
    if (Math.abs(n - Math.round(n)) > 1e-9 || Math.abs(d - Math.round(d)) > 1e-9) return false;
    const g = gcd(n, d);
    return Math.round(n) / g === a.n && Math.round(d) / g === a.d;
  }
  const v = parseVal(s);
  return v !== null && Math.abs(v - a.v) < 1e-7;
}
function ansText(a) {
  if (a.t === "frac") return `${a.n}/${a.d}`;
  return String(a.v) + (a.unit || "");
}
function ansHtml(a) {
  if (a.t === "frac") return F(a.n, a.d);
  return String(a.v) + (a.unit || "");
}

return { gen, check, ansText, ansHtml, GENRE_NAME, F, R, ri, pick };
})();
