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
    const pat = Math.random();
    if (pat < .3) {
      /* かっこ付き：( a/b − c/d ) × e */
      const d1 = pick([2,3,4,6]), d2 = pick([3,4,6,8,12]);
      const n1 = ri(1, d1 - 1), n2 = ri(1, d2 - 1);
      const N = n1 * d2 - n2 * d1, D = d1 * d2;
      if (N <= 0) continue;
      const e = pick([D, D / gcd(N, D), ri(2, 6)]);
      if (e !== Math.round(e) || e < 2 || e > 24) continue;
      const f = frac(N * e, D);
      if (f.d > 40 || f.n > 60) continue;
      return { q: `( ${F(n1, d1)} − ${F(n2, d2)} ) × ${e}`, a: f.d === 1 ? num(f.n) : f, tag: "分数の計算", small: true, note: f.d === 1 ? "" : "分数は 3/4 のように入力" };
    }
    if (pat < .6) {
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
    if (r < .18) { const n = pick([11,12,13,14,15,16,17,18,19,25]); return { q: `${n} × ${n}`, a: num(n * n), tag: "平方数" }; }
    if (r < .32) { const n = pick([625,375,875,125,250,750,68,132,275]); return { q: `1000 − ${n}`, a: num(1000 - n), tag: "補数" }; }
    if (r < .48) { const n = pick([12,16,24,28,32,36,44,48]); return { q: `25 × ${n}`, a: num(25 * n), tag: "くふう" }; }
    if (r < .62) { const n = pick([8,16,24,32,40,48]); return { q: `125 × ${n}`, a: num(125 * n), tag: "くふう" }; }
    if (r < .75) { const n = ri(12, 48); return { q: `99 × ${n}`, a: num(99 * n), tag: "くふう" }; }
    if (r < .87) { const n = ri(12, 45); return { q: `101 × ${n}`, a: num(101 * n), tag: "くふう" }; }
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

/* ---------- ⑥ 一行題（文章題の型） ---------- */
/* 模試の正答率50〜70%帯：和差算・平均・植木算・周期算・つるかめ算・
   差集め算・年齢算・倍数算・組み合わせ・速さ・旅人算 */
function gBun(lv) {
  const r = Math.random();
  if (lv <= 1) {
    if (r < .55) {
      const small = ri(3, 30), diff = ri(2, 20) * 2, big = small + diff;
      return Math.random() < .5
        ? { q: `2つの数の 和は ${big + small}、差は ${diff}。<br>大きいほうの数は？`, a: num(big), tag: "和差算", small: true, note: "（和＋差）÷2 が大きいほう" }
        : { q: `2つの数の 和は ${big + small}、差は ${diff}。<br>小さいほうの数は？`, a: num(small), tag: "和差算", small: true, note: "（和−差）÷2 が小さいほう" };
    }
    const avg = ri(60, 95), n = pick([3, 4]);
    return { q: `テスト${n}回の平均点は ${avg}点。<br>合計は 何点？`, a: num(avg * n, "点"), tag: "平均", small: true, note: "合計＝平均×回数" };
  }
  if (lv === 2) {
    if (r < .35) {
      const d = pick([3,4,5,6,8,10]), k = ri(4, 12), L = d * k;
      return { q: `${L}m の道に ${d}m おきに木を植える。<br>両はしにも植えると 何本？`, a: num(k + 1, "本"), tag: "植木算", small: true, note: "両はしあり＝間の数＋1" };
    }
    if (r < .6) {
      const d = pick([3,4,5,6,8]), k = ri(5, 12), L = d * k;
      return { q: `まわり ${L}m の池のふちに ${d}m おきに<br>木を植えると 何本？`, a: num(k, "本"), tag: "植木算", small: true, note: "池のまわり＝間の数と同じ" };
    }
    const cyc = pick([3, 4, 5]), N = ri(20, 60);
    const cnt = Math.floor(N / cyc) + (N % cyc >= 1 ? 1 : 0);
    return { q: `▲■●…と ${cyc}個のもようをくり返す。<br>${N}番目までに ▲ は 何個？`, a: num(cnt, "個"), tag: "周期算", small: true, note: `${N}÷${cyc} の商とあまりで考える` };
  }
  if (lv === 3) {
    if (r < .4) {
      const kame = ri(2, 8), tsuru = ri(2, 8);
      return { q: `ツルとカメが 合わせて ${tsuru + kame}匹。<br>足は全部で ${tsuru * 2 + kame * 4}本。<br>カメは 何匹？`, a: num(kame, "匹"), tag: "つるかめ算", small: true, note: "全部ツルとして考える" };
    }
    if (r < .7) {
      for (let i = 0; i < 30; i++) {
        const ppl = ri(4, 12), a2 = ri(2, 5), c2 = a2 + pick([1, 2]);
        const rest = ri(2, 9), lack = (c2 - a2) * ppl - rest;
        if (lack <= 0) continue;
        return { q: `1人に ${a2}個ずつ配ると ${rest}個あまり、<br>${c2}個ずつ配ると ${lack}個たりない。<br>人数は 何人？`, a: num(ppl, "人"), tag: "差集め算", small: true, note: "（あまり＋不足）÷1人分の差" };
      }
      return gBun(2);
    }
    const n = pick([4, 5, 6, 7, 8]);
    return { q: `${n}チームが 総当たり戦をする。<br>試合数は ぜんぶで 何試合？`, a: num(n * (n - 1) / 2, "試合"), tag: "組み合わせ", small: true, note: "n×(n−1)÷2" };
  }
  if (lv === 4) {
    if (r < .5) {
      for (let i = 0; i < 40; i++) {
        const k = pick([2, 3]), child = ri(5, 12), yrs = ri(2, 10);
        const mom = k * (child + yrs) - yrs;
        if (mom < child + 18 || mom > 45) continue;
        return { q: `いま 母は${mom}歳、子は${child}歳。<br>母の年齢が子の${k}倍になるのは<br>何年後？`, a: num(yrs, "年後"), tag: "年齢算", small: true, note: "2人の年齢の差はずっと変わらない" };
      }
      return gBun(3);
    }
    for (let i = 0; i < 30; i++) {
      const k = pick([2, 3, 5]), x = pick([100, 150, 200, 250, 300, 400]);
      const b = 2 * x / (k - 1);
      if (b !== Math.round(b)) continue;
      return { q: `兄は弟の${k}倍のお金を持っている。<br>兄が弟に${x}円わたすと 2人は同じ金額に。<br>弟は最初 いくら？`, a: num(b, "円"), tag: "倍数算", small: true, note: "わたすと差が2×金額ちぢむ" };
    }
    return gBun(3);
  }
  /* lv5 */
  if (r < .3) {
    const va = pick([60, 70, 80]), vb = pick([40, 50, 60]);
    const t = ri(4, 12), D = (va + vb) * t;
    return { q: `${D}m はなれた2人が 向かい合って進む。<br>分速${va}m と 分速${vb}m。<br>出会うのは 何分後？`, a: num(t, "分後"), tag: "旅人算", small: true, note: "出会い＝道のり÷速さの和" };
  }
  if (r < .55) {
    const c = pick([[40,15],[40,45],[60,20],[60,45],[80,15],[80,30],[12,20],[12,45]]);
    return { q: `時速 ${c[0]}km で ${c[1]}分 進むと 何km？`, a: num(c[0] * c[1] / 60, "km"), tag: "速さ", small: true, note: "分→時間になおしてかける" };
  }
  if (r < .8) {
    const a2 = ri(2, 8), b2 = ri(2, 8);
    return { q: `50円と80円のおかしを 合わせて${a2 + b2}個買うと<br>代金は ${50 * a2 + 80 * b2}円だった。<br>80円のおかしは 何個？`, a: num(b2, "個"), tag: "つるかめ算", small: true, note: "全部50円として考える" };
  }
  const n = pick([4, 5]), avg = ri(70, 90), last = ri(50, 100);
  return { q: `${n}回のテストの平均は ${avg}点。<br>はじめの${n - 1}回の合計は ${avg * n - last}点。<br>最後の1回は 何点？`, a: num(last, "点"), tag: "平均", small: true, note: "合計＝平均×回数 から引く" };
}


/* ===== 図形（面積・角度・体積） ===== */
function gZukei(lv) {
  const r = Math.random();
  if (lv <= 1) {
    if (r < .4) { const a = ri(3, 12), b = ri(3, 12); return { q: `たて ${a}cm、よこ ${b}cm の長方形。<br>面積は 何cm²？`, a: num(a * b, "cm²"), tag: "長方形の面積", small: true, note: "たて×よこ" }; }
    if (r < .7) { const a = ri(3, 25); return { q: `1辺 ${a}cm の正方形。<br>まわりの長さは 何cm？`, a: num(a * 4, "cm"), tag: "正方形のまわり", small: true, note: "1辺×4" }; }
    const x = ri(30, 80), y = ri(30, 180 - x - 20); return { q: `三角形の2つの角が ${x}度 と ${y}度。<br>のこりの角は 何度？`, a: num(180 - x - y, "度"), tag: "三角形の内角", small: true, note: "3つの角の和は180度" };
  }
  if (lv === 2) {
    if (r < .3) { const b = ri(4, 20), h = pick([4, 6, 8, 10, 12]); return { q: `底辺 ${b}cm、高さ ${h}cm の三角形。<br>面積は 何cm²？`, a: num(b * h / 2, "cm²"), tag: "三角形の面積", small: true, note: "底辺×高さ÷2" }; }
    if (r < .55) { const b = ri(5, 20), h = ri(3, 12); return { q: `底辺 ${b}cm、高さ ${h}cm の平行四辺形。<br>面積は 何cm²？`, a: num(b * h, "cm²"), tag: "平行四辺形の面積", small: true, note: "底辺×高さ（÷2しない！）" }; }
    if (r < .8) { const a = ri(2, 9); return { q: `1辺 ${a}cm の立方体。<br>体積は 何cm³？`, a: num(a ** 3, "cm³"), tag: "立方体の体積", small: true, note: "1辺×1辺×1辺" }; }
    const top = pick([20, 30, 40, 50, 70, 80, 100, 120]); return { q: `二等辺三角形の頂角が ${top}度。<br>底角の1つは 何度？`, a: num((180 - top) / 2, "度"), tag: "二等辺三角形", small: true, note: "（180−頂角）÷2" };
  }
  if (lv === 3) {
    if (r < .3) { const a = ri(3, 10), b = a + ri(2, 10), h = pick([4, 6, 8, 10]); return { q: `上底 ${a}cm、下底 ${b}cm、高さ ${h}cm の台形。<br>面積は 何cm²？`, a: num((a + b) * h / 2, "cm²"), tag: "台形の面積", small: true, note: "（上底＋下底）×高さ÷2" }; }
    if (r < .55) { const d = pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]); return { q: `半径 ${d / 2}cm の円。<br>円周は 何cm？（円周率3.14）`, a: num(d * 3.14, "cm"), tag: "円周", small: true, note: "直径×3.14。半径×2を忘れない" }; }
    if (r < .8) { const a = ri(2, 9), b = ri(2, 9), c = ri(2, 12); return { q: `たて ${a}cm、よこ ${b}cm、高さ ${c}cm の直方体。<br>体積は 何cm³？`, a: num(a * b * c, "cm³"), tag: "直方体の体積", small: true, note: "たて×よこ×高さ" }; }
    const x = ri(30, 80), y = ri(30, 80); return { q: `三角形の2つの内角が ${x}度 と ${y}度。<br>のこりの角の【外角】は 何度？`, a: num(x + y, "度"), tag: "三角形の外角", small: true, note: "外角＝となり合わない2つの内角の和" };
  }
  if (lv === 4) {
    if (r < .3) { const rr = pick([2, 3, 4, 5, 6, 10, 20]); return { q: `半径 ${rr}cm の円。<br>面積は 何cm²？（円周率3.14）`, a: num(rr * rr * 3.14, "cm²"), tag: "円の面積", small: true, note: "半径×半径×3.14" }; }
    if (r < .55) { const d = pick([4, 6, 8, 10, 12, 20]); return { q: `直径 ${d}cm の半円。<br>まわりの長さは 何cm？（直線部分もふくむ）`, a: num(d * 3.14 / 2 + d, "cm"), tag: "半円のまわり", small: true, note: "曲線（直径×3.14÷2）＋直径。直線を忘れがち" }; }
    if (r < .8) { const a = ri(4, 16), b = ri(4, 16); return { q: `対角線が ${a}cm と ${b}cm のひし形。<br>面積は 何cm²？`, a: num(a * b / 2, "cm²"), tag: "ひし形の面積", small: true, note: "対角線×対角線÷2" }; }
    const x = ri(35, 145); return { q: `平行な2直線に1本の直線が交わる。<br>1つの角が ${x}度のとき、その【同位角】は 何度？`, a: num(x, "度"), tag: "平行線と角", small: true, note: "同位角・錯角は等しい。となりの角は180−x" };
  }
  if (r < .3) { const rr = pick([2, 3, 4, 6, 10]), deg = pick([90, 60, 45, 120, 180]); return { q: `半径 ${rr}cm、中心角 ${deg}度 のおうぎ形。<br>面積は 何cm²？（円周率3.14）`, a: num(rr * rr * 3.14 * deg / 360, "cm²"), tag: "おうぎ形の面積", small: true, note: "円の面積×中心角/360" }; }
  if (r < .55) { const n = pick([5, 6, 8, 9, 10, 12]); return { q: `正${n}角形の1つの内角は 何度？`, a: num(180 * (n - 2) / n, "度"), tag: "正多角形の内角", small: true, note: "180×(n−2)÷n。外角は360÷n" }; }
  if (r < .8) { const a = pick([4, 6, 8, 10, 20]); return { q: `1辺 ${a}cm の正方形に、ぴったり入る円をかいた。<br>正方形から円を引いた部分の面積は 何cm²？`, a: num(a * a - (a / 2) * (a / 2) * 3.14, "cm²"), tag: "正方形−円", small: true, note: "正方形の面積 − 半径(1辺÷2)の円" }; }
  const n = pick([5, 6, 8, 10, 12]); return { q: `正${n}角形の1つの外角は 何度？`, a: num(360 / n, "度"), tag: "正多角形の外角", small: true, note: "外角の和はいつも360度" };
}

/* ===== 規則性（数列・周期・数表） ===== */
function gKisoku(lv) {
  const r = Math.random();
  if (lv <= 1) {
    const a = ri(1, 9), d = ri(2, 7), n = ri(6, 20);
    return { q: `${a}, ${a + d}, ${a + 2 * d}, ${a + 3 * d}, …と続く。<br>${n}番目の数は？`, a: num(a + (n - 1) * d), tag: "等差数列", small: true, note: `はじめの数＋公差×(${n}−1)` };
  }
  if (lv === 2) {
    if (r < .5) { const n = ri(5, 12); return { q: `1, 3, 6, 10, 15, …と続く。<br>${n}番目の数は？`, a: num(n * (n + 1) / 2), tag: "三角数", small: true, note: "1から順に足していく。n×(n+1)÷2" }; }
    const n = ri(4, 12); return { q: `碁石を正方形のわく（中は空）にならべる。<br>1辺が ${n}個のとき、碁石は全部で 何個？`, a: num(4 * (n - 1), "個"), tag: "方陣算", small: true, note: "(1辺−1)×4。角を2回数えない" };
  }
  if (lv === 3) {
    if (r < .5) { const n = pick([10, 20, 25, 30, 40, 50, 100]); return { q: `1＋2＋3＋…＋${n} は？`, a: num(n * (n + 1) / 2), tag: "数列の和", small: true, note: "（はじめ＋おわり）×個数÷2" }; }
    const a = ri(2, 9), d = pick([2, 3, 4, 5]), n = ri(6, 12); const last = a + (n - 1) * d;
    return { q: `${a}, ${a + d}, ${a + 2 * d}, …, ${last}<br>（${n}個）の和は？`, a: num((a + last) * n / 2), tag: "数列の和", small: true, note: "（はじめ＋おわり）×個数÷2" };
  }
  if (lv === 4) {
    if (r < .5) { const w = pick([5, 6, 7, 8, 9]), N = ri(30, 90); return { q: `1から順に、1行に ${w}個ずつ数をならべる。<br>${N} は 何行目？`, a: num(Math.ceil(N / w), "行目"), tag: "数表", small: true, note: `${N}÷${w} の商とあまり。あまりがあれば＋1` }; }
    const n = ri(5, 9); let v = 1, d = 1; for (let i = 1; i < n; i++) { v += d; d++; }
    return { q: `1, 2, 4, 7, 11, 16, …と続く。<br>${n}番目の数は？`, a: num(v), tag: "階差数列", small: true, note: "ふえ方が 1,2,3,4… とふえていく" };
  }
  if (r < .4) { const n = ri(6, 10); let a = 1, b = 1; for (let i = 2; i < n; i++) { const t = a + b; a = b; b = t; } return { q: `1, 1, 2, 3, 5, 8, …と続く。<br>${n}番目の数は？`, a: num(n <= 2 ? 1 : b), tag: "フィボナッチ", small: true, note: "前の2つの和" }; }
  if (r < .7) { const base = pick([2, 3, 7, 8]), n = ri(10, 40); const cyc = { 2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 7: [7, 9, 3, 1], 8: [8, 4, 2, 6] }[base]; return { q: `${base} を ${n}回かけた数の 一の位は？`, a: num(cyc[(n - 1) % 4]), tag: "一の位の周期", small: true, note: "一の位は4つごとにくり返す" }; }
  const w = pick([6, 7, 8]), N = ri(40, 99); return { q: `1から順に、1行に ${w}個ずつ数をならべる。<br>${N} は 左から 何番目？`, a: num(((N - 1) % w) + 1, "番目"), tag: "数表", small: true, note: `${N}÷${w} のあまり（0なら右はし）` };
}

/* ===== 速さ ===== */
function gHayasa(lv) {
  const r = Math.random();
  if (lv <= 1) {
    if (r < .5) { const v = pick([50, 60, 70, 80, 90]), t = ri(5, 30); return { q: `分速 ${v}m で ${t}分 歩いた。<br>進んだ道のりは 何m？`, a: num(v * t, "m"), tag: "速さ×時間", small: true, note: "道のり＝速さ×時間" }; }
    const v = pick([50, 60, 75, 80]), t = ri(4, 20); return { q: `${v * t}m の道を 分速 ${v}m で歩くと 何分？`, a: num(t, "分"), tag: "道のり÷速さ", small: true, note: "時間＝道のり÷速さ" };
  }
  if (lv === 2) {
    if (r < .5) { const k = pick([30, 36, 42, 48, 54, 60, 72, 90]); return { q: `時速 ${k}km は 分速 何m？`, a: num(k * 1000 / 60, "m"), tag: "速さの単位", small: true, note: "km→m は×1000、時→分 は÷60" }; }
    const s = pick([5, 10, 15, 20, 25]); return { q: `秒速 ${s}m は 時速 何km？`, a: num(s * 3.6, "km"), tag: "速さの単位", small: true, note: "×3600 でm/時、÷1000 でkm" };
  }
  if (lv === 3) {
    const a = pick([60, 70, 80]), b = pick([40, 50, 60]), t = ri(5, 20);
    return { q: `${(a + b) * t}m はなれた2人が、同時に向かい合って歩き出す。<br>分速 ${a}m と 分速 ${b}m。出会うのは 何分後？`, a: num(t, "分後"), tag: "出会い算", small: true, note: "2人の速さの和で、道のりをちぢめる" };
  }
  if (lv === 4) {
    const b = pick([50, 60, 70]), a = b + pick([10, 20, 30]), t = ri(4, 15);
    return { q: `弟が分速 ${b}m で先に出発。${(a - b) * t}m はなれたところで<br>兄が分速 ${a}m で追いかけた。追いつくのは 何分後？`, a: num(t, "分後"), tag: "追いつき算", small: true, note: "速さの差で、はなれた分をつめる" };
  }
  if (r < .5) { const L = pick([100, 120, 150, 200]), B = pick([300, 400, 500, 600, 800]), v = pick([10, 20, 25, 30]); return { q: `長さ ${L}m の電車が 秒速 ${v}m で<br>長さ ${B}m の鉄橋をわたり切るのに 何秒？`, a: num((L + B) / v, "秒"), tag: "通過算", small: true, note: "電車の長さ＋橋の長さ を進む" }; }
  const st = pick([12, 15, 18, 20]), fl = pick([2, 3, 4, 5]), t = ri(2, 6);
  return Math.random() < .5
    ? { q: `静水での速さが 時速 ${st}km の船。川の流れは 時速 ${fl}km。<br>${(st + fl) * t}km 下るのに 何時間？`, a: num(t, "時間"), tag: "流水算", small: true, note: "下り＝静水＋流れ" }
    : { q: `静水での速さが 時速 ${st}km の船。川の流れは 時速 ${fl}km。<br>${(st - fl) * t}km 上るのに 何時間？`, a: num(t, "時間"), tag: "流水算", small: true, note: "上り＝静水−流れ" };
}

/* ===== 単位換算 ===== */
function gTani(lv) {
  const r = Math.random();
  if (lv <= 1) {
    if (r < .5) { const m = ri(1, 9), c = pick([5, 20, 50, 75]); return { q: `${m}m ${c}cm は 何cm？`, a: num(m * 100 + c, "cm"), tag: "長さの単位", small: true, note: "1m＝100cm" }; }
    const k = pick([1.5, 2.5, 3.2, 0.8, 4.6]); return { q: `${k * 1000}m は 何km？（小数で）`, a: num(k, "km"), tag: "長さの単位", small: true, note: "1km＝1000m" };
  }
  if (lv === 2) {
    if (r < .35) { const k = pick([1.2, 2.5, 0.7, 3.4, 0.05]); return { q: `${k}kg は 何g？`, a: num(k * 1000, "g"), tag: "重さの単位", small: true, note: "1kg＝1000g" }; }
    if (r < .7) { const l = pick([1.5, 2, 0.3, 4.2, 0.75]); return { q: `${l}L は 何mL？`, a: num(l * 1000, "mL"), tag: "かさの単位", small: true, note: "1L＝1000mL" }; }
    const d = pick([30, 45, 12, 8, 150]); return { q: `${d}dL は 何L？（小数で）`, a: num(d / 10, "L"), tag: "かさの単位", small: true, note: "1L＝10dL" };
  }
  if (lv === 3) {
    if (r < .35) { const m = pick([2, 3, 0.5, 1.5, 4]); return { q: `${m}m² は 何cm²？`, a: num(m * 10000, "cm²"), tag: "面積の単位", small: true, note: "1m²＝100cm×100cm＝10000cm²" }; }
    if (r < .7) { const mn = pick([90, 150, 75, 45, 105]); return { q: `${mn}分 は 何時間？（小数で）`, a: num(mn / 60, "時間"), tag: "時間の単位", small: true, note: "÷60。0.5時間＝30分" }; }
    const h = ri(1, 3), mn = pick([10, 20, 25, 40, 50]); return { q: `${h}時間${mn}分 は 何分？`, a: num(h * 60 + mn, "分"), tag: "時間の単位", small: true, note: "1時間＝60分" };
  }
  if (lv === 4) {
    if (r < .35) { const h = pick([1, 2, 3, 0.5, 2.5]); return { q: `${h}ha は 何m²？`, a: num(h * 10000, "m²"), tag: "面積の単位", small: true, note: "1ha＝100m×100m＝10000m²" }; }
    if (r < .7) { const a = pick([250, 150, 30, 480, 1200]); return { q: `${a}a は 何ha？（小数で）`, a: num(a / 100, "ha"), tag: "面積の単位", small: true, note: "1ha＝100a" }; }
    const k = pick([1, 2, 0.5, 3, 0.25]); return { q: `${k}km² は 何ha？`, a: num(k * 100, "ha"), tag: "面積の単位", small: true, note: "1km²＝100ha" };
  }
  if (r < .35) { const m = pick([2, 3, 0.5, 1.5, 0.2]); return { q: `${m}m³ は 何L？`, a: num(m * 1000, "L"), tag: "体積の単位", small: true, note: "1m³＝1000L" }; }
  if (r < .7) { const c = pick([500, 250, 1500, 800, 50]); return { q: `${c}cm³ は 何dL？（小数で）`, a: num(c / 100, "dL"), tag: "体積の単位", small: true, note: "1L＝1000cm³、1dL＝100cm³" }; }
  const k = pick([36, 72, 54, 90, 108]); return { q: `時速 ${k}km は 秒速 何m？`, a: num(k * 1000 / 3600, "m"), tag: "速さの単位", small: true, note: "×1000÷3600。÷3.6 と同じ" };
}

/* ===== 暗算スプリント（短時間・大量） ===== */
function gAnzan(lv) {
  const r = Math.random();
  if (lv <= 1) {
    if (r < .4) { const a = ri(11, 49), b = ri(11, 49); return { q: `${a} ＋ ${b}`, a: num(a + b), tag: "たし算" }; }
    if (r < .7) { const a = ri(2, 9), b = ri(2, 9); return { q: `${a} × ${b}`, a: num(a * b), tag: "九九" }; }
    const a = ri(20, 99), b = ri(2, 9); return { q: `${a} − ${b}`, a: num(a - b), tag: "ひき算" };
  }
  if (lv === 2) {
    if (r < .35) { const a = ri(35, 89), b = ri(35, 89); return { q: `${a} ＋ ${b}`, a: num(a + b), tag: "くり上がり" }; }
    if (r < .7) { const a = ri(12, 49), b = ri(3, 9); return { q: `${a} × ${b}`, a: num(a * b), tag: "2桁×1桁" }; }
    const a = ri(120, 500), b = ri(35, 99); return { q: `${a} − ${b}`, a: num(a - b), tag: "3桁−2桁" };
  }
  if (lv === 3) {
    if (r < .25) { const a = ri(12, 89); return { q: `${a} × 11`, a: num(a * 11), tag: "×11のワザ", note: "両はしをそのまま、真ん中に和" }; }
    if (r < .5) { const a = pick([4, 8, 12, 16, 24, 32, 36, 44]); return { q: `${a} × 25`, a: num(a * 25), tag: "×25のワザ", note: "÷4 して ×100" }; }
    if (r < .75) { const a = ri(11, 19); return { q: `${a} × ${a}`, a: num(a * a), tag: "平方数" }; }
    const b = ri(3, 9), q = ri(11, 40); return { q: `${b * q} ÷ ${b}`, a: num(q), tag: "わり算" };
  }
  if (lv === 4) {
    if (r < .25) { const a = ri(12, 89); return { q: `99 × ${a}`, a: num(99 * a), tag: "×99のワザ", note: "100倍から1回ひく" }; }
    if (r < .5) { const a = ri(120, 899), b = ri(120, 899); return { q: `${a} ＋ ${b}`, a: num(a + b), tag: "3桁＋3桁" }; }
    if (r < .75) { const a = ri(11, 19), b = ri(11, 19); return { q: `${a} × ${b}`, a: num(a * b), tag: "2桁×2桁", note: "(a+一の位)×10 ＋ 一の位どうしの積" }; }
    const b = ri(3, 9), q = ri(41, 130); return { q: `${b * q} ÷ ${b}`, a: num(q), tag: "3桁÷1桁" };
  }
  if (r < .25) { const n = ri(2, 9); return { q: `3.14 × ${n}`, a: num(3.14 * n), tag: "3.14の暗記" }; }
  if (r < .45) { const a = pick([15, 25, 35, 45, 55]); return { q: `${a} × ${a}`, a: num(a * a), tag: "5で終わる平方", note: "十の位×(十の位+1) のあとに 25" }; }
  if (r < .65) { const a = ri(101, 999); return { q: `1000 − ${a}`, a: num(1000 - a), tag: "補数", note: "各位を9から、最後だけ10から" }; }
  if (r < .85) { const a = pick([120, 240, 360, 480, 560, 640, 720, 880]); return { q: `${a} の 12.5%`, a: num(a / 8), tag: "12.5%＝1/8" }; }
  const a = ri(3, 9) * 4 * ri(3, 12); return { q: `${a} ÷ 4`, a: num(a / 4), tag: "÷4", note: "半分の半分" };
}

const GEN = { pi: gPi, frac: gFrac, ratio: gRatio, gyaku: gGyaku, kufuu: gKufuu, bun: gBun, zukei: gZukei, kisoku: gKisoku, hayasa: gHayasa, tani: gTani, anzan: gAnzan };
const GENRE_NAME = { pi: "3.14マスター", frac: "分数と小数", ratio: "割合と比", gyaku: "逆算", kufuu: "四則と工夫", bun: "一行題", zukei: "図形", kisoku: "規則性", hayasa: "速さ", tani: "単位換算", anzan: "暗算スプリント" };
const BASE_TIME = { pi: 50, frac: 60, ratio: 65, gyaku: 60, kufuu: 60, bun: 140, zukei: 75, kisoku: 80, hayasa: 90, tani: 45, anzan: 12 };
const TIME_STEP = { pi: 8, frac: 10, ratio: 10, gyaku: 10, kufuu: 10, bun: 15, zukei: 12, kisoku: 12, hayasa: 15, tani: 5, anzan: 2 };

/* ---------- 型レクチャー（まちがえた問題の解説） ---------- */
const LECTURES = {
  "3.14の段": { t: "3.14のかけ算のコツ", b: "3.14×7なら、3×7=21 と 0.14×7=0.98 に分けて 21+0.98=21.98。\n「3の段」と「0.14の段」に分けると暗算できる。よく出る答えは丸ごと覚えると最強。" },
  "円周": { t: "円周のもとめ方", b: "円周＝直径×3.14。\n半径が出てきたら、まず2倍して直径にしてから3.14をかける。" },
  "円の面積": { t: "円の面積のもとめ方", b: "円の面積＝半径×半径×3.14。\n直径が出てきたら÷2して半径に。ドーナツ型は「大きい円−小さい円」。" },
  "おうぎ形": { t: "おうぎ形のコツ", b: "おうぎ形は円の一部。面積＝半径×半径×3.14×(中心角/360)。\n弧の長さ＝直径×3.14×(中心角/360)。まず(中心角/360)を約分すると計算が楽。" },
  "くふう": { t: "計算のくふう", b: "同じ数のかけ算はまとめる：3.14×8＋3.14×2＝3.14×(8＋2)＝31.4。\n25×4=100、125×8=1000 のペアを先に作るのも定石。" },
  "平方数": { t: "平方数は暗記", b: "11×11=121、12×12=144、13×13=169、14×14=196、15×15=225…25×25=625。\n入試最頻出。九九と同じように覚えてしまうのが最速。" },
  "補数": { t: "1000からのひき算", b: "1000−625は、999−625＝374 を出してから＋1＝375。\nくり下がりを1回もしなくていいから速くて正確。" },
  "分数→小数": { t: "分数→小数の変換", b: "分子÷分母で小数になる。1/2=0.5、1/4=0.25、3/4=0.75、1/8=0.125、1/5=0.2。\nこの変換表は暗記しておくと計算が一気に速くなる。" },
  "小数→分数": { t: "小数→分数の変換", b: "0.25＝25/100。あとは約分して1/4。\n0.125=1/8、0.375=3/8、0.625=5/8、0.875=7/8 は丸ごと覚える。" },
  "分数の計算": { t: "分数の計算のコツ", b: "たし算・ひき算は通分（分母をそろえる）してから分子だけ計算。\nかけ算は分子どうし・分母どうし。わり算は後ろの分数をひっくり返してかけ算に。最後に必ず約分。" },
  "小数と分数": { t: "小数と分数がまざったら", b: "どちらかにそろえるのが鉄則。\nかけ算・わり算は分数に、たし算・ひき算はやりやすい方に。0.75=3/4 などの変換表が武器になる。" },
  "割合": { t: "割合の3公式", b: "くらべる量＝もとにする量×割合。\n割合＝くらべる量÷もとにする量。もとにする量＝くらべる量÷割合。\n「の」の前が「もとにする量」。" },
  "歩合": { t: "歩合の変換", b: "1割=0.1=10%。3割=0.3、7割5分=0.75。\n「割」を見たら0.1をかける、と覚える。" },
  "比": { t: "比を簡単にする", b: "両方を同じ数で割れるだけ割る。12:18なら6で割って2:3。\n最大公約数で一気に割るのがコツ。" },
  "比例配分": { t: "比例配分のコツ", b: "3:2に分けるなら、全体を3+2=5等分して考える。\n全体÷(比の和)×自分の比、の順で計算。" },
  "割引": { t: "割引の計算", b: "2割引＝もとの値段の8割（0.8倍）。\n「引いた後に何割残るか」を先に考えると1回のかけ算で終わる。" },
  "利益": { t: "利益の計算", b: "定価＝原価×(1＋利益の割合)。\n25%の利益なら×1.25。原価を1とみて図をかくと迷わない。" },
  "濃度": { t: "食塩水の3公式", b: "食塩＝食塩水×濃度。濃度＝食塩÷食塩水。\n水を加えても食塩の量は変わらない。まず食塩の重さを出すのが定石。" },
  "単位": { t: "単位換算のコツ", b: "1km=1000m、1m²=10000cm²、1時間=60分。\n大きい単位→小さい単位は「かけ算」、逆は「わり算」。" },
  "逆算": { t: "逆算（□をもとめる）のコツ", b: "「＝」の右から逆にたどる。たし算⇔ひき算、かけ算⇔わり算に置きかえながら□に近づく。\nかっこの外から1枚ずつはがすイメージ。最後に□の値を式に入れて検算すると完璧。" },
  "四則": { t: "四則混合の順番", b: "①かっこの中 ②かけ算・わり算 ③たし算・ひき算 の順。\n式に順番の番号をふってから計算するとミスが激減する。" },
  "数列": { t: "数列の公式", b: "1からnまでの和＝n×(n+1)÷2。\n等差数列の和＝(はじめ＋おわり)×個数÷2。まず「何個あるか」を数えるのが第一歩。" },
  "部分分数": { t: "部分分数のワザ", b: "1/(2×3)＝1/2−1/3 のように分解すると、となりどうしが消えていく。\n残るのは最初と最後だけ：1/1−1/(n+1)。" },
  "和差算": { t: "和差算の公式", b: "大きい方＝(和＋差)÷2。小さい方＝(和−差)÷2。\n線分図をかくと一目でわかる。" },
  "平均": { t: "平均の3公式", b: "合計＝平均×個数。これが一番大事。\n「見えない合計」を先に出せば、あとは引き算で解ける。" },
  "植木算": { t: "植木算の3パターン", b: "両はしに植える→木の数＝間の数＋1。\n両はしに植えない→間の数−1。池のまわり→間の数と同じ。" },
  "周期算": { t: "周期算のコツ", b: "「何個ずつのくり返しか」を見つけて、全体÷周期＝商とあまり。\nあまりの分だけ、くり返しの最初から数える。" },
  "つるかめ算": { t: "つるかめ算の定石", b: "「全部ツル（足2本）だったら」と仮定して足の数を計算。\n実際との差÷(4−2)＝カメの数。全部○○だったら、が魔法の言葉。" },
  "差集め算": { t: "差集め算の公式", b: "人数＝(あまり＋不足)÷1人あたりの差。\n配り方の差が積み重なって全体の差になる、と考える。" },
  "組み合わせ": { t: "総当たり戦の公式", b: "n チームの総当たり＝n×(n−1)÷2。\n「全員が(n−1)回握手、ただし2人で1回だから÷2」と覚える。" },
  "年齢算": { t: "年齢算の鉄則", b: "2人の年齢の差は、何年たっても変わらない。\n差に注目して、「差÷(倍率−1)＝あとの方の年齢」を使う。" },
  "倍数算": { t: "倍数算のコツ", b: "やりとりしても「2人の合計」は変わらない。\nわたすと差は「わたした分×2」ちぢまる。変わらないものに注目するのが鍵。" },
  "旅人算": { t: "旅人算（出会い）", b: "向かい合って進むとき、2人は1分に「速さの和」だけ近づく。\n出会う時間＝道のり÷速さの和。" },
  "速さ": { t: "速さの3公式", b: "道のり＝速さ×時間。速さ＝道のり÷時間。時間＝道のり÷速さ。\n分を時間になおすときは÷60。「は・じ・き」の図で確認。" },
};
function lecture(tag) {
  return LECTURES[tag] || { t: "見直しのコツ", b: "問題文の数字に印をつけて、何を聞かれているかをもう一度確認しよう。\n式を書いてから計算すると、ミスがぐっと減る。" };
}

function gen(genre, lv) {
  lv = Math.max(1, Math.min(5, lv | 0));
  let q;
  try { q = GEN[genre](lv); } catch (e) { q = gPi(1); }
  q.genre = genre; q.lv = lv;
  q.time = BASE_TIME[genre] + (lv - 1) * (TIME_STEP[genre] || 3);
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

return { gen, check, ansText, ansHtml, lecture, GENRE_NAME, F, R, ri, pick };
})();
