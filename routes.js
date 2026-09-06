/* =====================================================================
   routes.js  3つの新ルート（敗者復活編／ユニット対抗編／相棒編）
   game.js のあとに読み込む。フックは game.js 側の各所から呼ばれる。
   ===================================================================== */
const ROUTES = [
  { id: "normal", e: "🎬", n: "王道編",       d: "20,000人から5人へ。すべてはここから始まる。", sub: "STANDARD" },
  { id: "wild",   e: "🌑", n: "敗者復活編",   d: "1次審査で落ちたところから始まる。地下練習場から、逆転のデビューへ。", sub: "WILD CARD" },
  { id: "team",   e: "🛡", n: "ユニット対抗編", d: "きみはキャプテン。ドラフトで仲間を指名し、3ユニットで争う。負けたチームから脱落者が出る。", sub: "UNIT WARS" },
  { id: "duo",    e: "🤝", n: "相棒編",       d: "シノと2人1組のデュオ審査。ステージも点数も2人で1つ。最後に、選択が待つ。", sub: "DUO STAGE" },
];
const ROUTE = id => ROUTES.find(r => r.id === id) || ROUTES[0];
const curRoute = () => (G && G.route) || "normal";
const TEAM_NAMES_AI = { ren: "RED ZONE", shion: "SILENCE" };

/* ---------- 初期化 ---------- */
function routeInit(g) {
  g.route = g.route || "normal";
  g.routeSeen = [];
  if (g.route === "wild") {
    const pool = CAND_IDS.filter(id => !["shino", "ren", "shion"].includes(id)).sort(() => Math.random() - .5);
    g.wildGroup = pool.slice(0, 4);
    g.wildDropped = [];
  }
  if (g.route === "team") { g.teams = null; g.teamName = ""; g.teamPower = 0; g.teamLast = 0; g.leader = "me"; }
  if (g.route === "duo") { g.duo = "shino"; g.duoName = ""; g.shinoForm = 50; g.duoSign = ""; g.duoPromise = ""; }
}
function routePhase(d) {
  const r = curRoute();
  if (r === "wild") return "🌑 敗者復活編｜" + (d <= 6 ? "復活戦まで" : PHASE(d));
  if (r === "team") return "🛡 ユニット対抗編｜" + (d <= 18 ? "ユニット戦" : "個人戦");
  if (r === "duo") return "🤝 相棒編｜" + PHASE(d);
  return null;
}
const wildAlive = () => (G.wildGroup || []).filter(id => G.alive.includes(id));
const wildName = i => { const w = G.wildGroup || []; return CANDS[w[i % w.length]] ? w[i % w.length] : "shino"; };
const myTeam = () => (G.teams && G.teams.me ? G.teams.me.filter(id => id !== "me" && G.alive.includes(id)) : []);
const teamOf = id => { if (!G.teams) return null; for (const k in G.teams) if (G.teams[k].includes(id)) return k; return null; };
const dn = () => G.duoName || "ふたつ星";

/* =====================================================================
   オープニング
   ===================================================================== */
function routeOpening(name, done) {
  const n = esc(name);
  const r = curRoute();
  if (r === "wild") {
    const w0 = wildName(0), w1 = wildName(1);
    return showEvent({ c: "tsukasa",
      t: `「1次審査の結果を発表する。\n\n……以上だ。\n呼ばれなかった者は、荷物をまとめて帰れ」\n\n（呼ばれなかった。\n${n}の名前は、最後まで呼ばれなかった）`,
      ch: [{ t: "……", fx: { st: { me: 2 } }, after: () => showEvent({ c: w0,
        t: `「……おれたち、落ちたんだな」\n\n（外は雨。落ちた5人で駅までの道を、誰もしゃべらずに歩いた。\n${CANDS[w1].n}は、ずっと空を見ていた）`,
        ch: [
          { t: "「まだ、終わってない」", fx: { st: { me: 4 } }, after: call },
          { t: "（何も言えなかった）", fx: { st: { me: 2 } }, after: call },
        ] }) }] });
    function call() {
      showEvent({ c: "riku",
        t: `（夜。知らない番号から電話が鳴った）\n\n「もしもし、${n}くん？ ショリです。\n\n……落ちた5人、全員に電話してる。\n審査員権限で、【敗者復活枠】を作った。\n5日後、5人で復活戦。通れるのは3人。\n\n場所は、地下の第2練習場。今夜から使っていい。\n\n……来る？」`,
        ch: [{ t: "「行きます」", fx: { cond: 1 }, after: () => showEvent({ c: "kanade",
          t: "「地下練習場、来たね。……ここ、エアコンないの。ごめんね。\n\nでもね、ここから這い上がった人を、僕は何人も知ってる。\n\n上の階の12人より、多く汗をかけばいい。\nそれだけだよ」",
          ch: [{ t: "「はい！」", fx: { st: { me: 3 } }, after: done }] }) }] });
    }
  }
  if (r === "team") {
    return showEvent({ c: "tsukasa",
      t: `「今回のオーディションは、いつもと違う。\n\n【3ユニット対抗戦】だ。\nキャプテンは3人。レン、シオン、……そして${n}。\n\n仲間はドラフトで決めろ。\n誰を選ぶかも、審査だ」`,
      ch: [{ t: "「……おれが、キャプテン？」", fx: { st: { me: 3 } }, after: () => showEvent({ c: "riku",
        t: "「驚いた？ エントリーシートの『計算が武器』、あれを見てフマが決めたんだ。\n\n『数字で状況を読めるやつが、チームを持つべきだ』って。\n\n……ドラフト会議、始めるよ」",
        ch: [{ t: "ドラフト会議へ", fx: {}, after: () => teamDraft(() => teamNaming(done)) }] }) }] });
  }
  if (r === "duo") {
    const lines = [
      `「……ぼく。よろしく。\n\n（シノが小さく頭を下げた）\n\n……先に言っとく。ぼく、本番で固まることがある。\nだから、隣にいてほしい。それだけ」`,
      `「……${n}、だよね。エントリーシート、読んだ。『計算が武器』。\n\n……ぼくもそう。じゃあ、2人で最強だ。\n……理屈の上では」`,
      `（練習場のすみで、シノがひとりノートを開いていた）\n\n「……あ。ペアの人？ ……ちょっと待って、この問題だけ解かせて。\n\n……よし。はじめまして。シノです」`,
      `「……ぼくで、がっかりした？\n\n……冗談。がっかりさせないから。\n\n2人で1つのステージって、こわいけど、……少しだけ、うれしい」`,
    ];
    return showEvent({ c: "kanade",
      t: `「今回の審査は、少し特別なんだ。\n\n2人1組の【デュオ審査】。\nステージも、点数も、2人で1つ。\n\nペアは、こちらで決めさせてもらった。\n……${n}のペアは」`,
      ch: [{ t: "「……誰ですか」", fx: {}, after: () => showEvent({ c: "shino", t: pick(lines),
        ch: [
          { t: "「よろしく」", fx: { aff: { shino: 10 } }, after: naming },
          { t: "「頼りにしてる」", fx: { aff: { shino: 12 }, st: { me: 2 } }, after: naming },
        ] }) }] });
    function naming() {
      const names = ["ふたつ星", "紫電（しでん）", `${name} & SHINO`];
      showEvent({ c: "kanade", t: "「デュオの名前、決めて。\n呼ばれるたびに、2人の名前になるから」",
        ch: names.map(nn => ({ t: `『${esc(nn)}』`, fx: {}, after: () => { G.duoName = nn; save();
          showEvent({ c: "shino", t: `「『${esc(nn)}』……うん。悪くない。\n\n……じゃあ、最初の約束。\nどっちかが転んだら、もう片方が拾う。\n\n……それだけ、守ろう」`,
            ch: [{ t: "「約束する」", fx: { st: { me: 4 }, cond: 1 }, after: done }] }); } })) });
    }
  }
  done();
}

/* =====================================================================
   ユニット対抗編：ドラフト会議
   ===================================================================== */
function teamDraft(done) {
  const teams = { me: ["me"], ren: ["ren"], shion: ["shion"] };
  let pool = CAND_IDS.filter(id => id !== "ren" && id !== "shion");
  const power = id => (AUDS[0].base[id] || 50) + ((G.talent && G.talent[id]) || 0);
  const stars = id => { const p = power(id); return p >= 56 ? "★★★" : p >= 50 ? "★★☆" : "★☆☆"; };
  const order = ["me", "ren", "shion", "shion", "ren", "me", "me", "ren", "shion", "shion", "ren", "me"];
  let step = 0;
  const aiPick = who => {
    const sorted = [...pool].sort((a, b) => power(b) - power(a) + (Math.random() - .5) * 6);
    const id = sorted[0];
    pool = pool.filter(x => x !== id); teams[who].push(id);
    return id;
  };
  const render = () => {
    if (step >= order.length) return finish();
    const who = order[step];
    if (who !== "me") {
      const id = aiPick(who); step++;
      toast(`${CANDS[who].n}が ${CANDS[id].n} を指名`); sfx.tap();
      return setTimeout(render, 650);
    }
    openSheet(`<div class="ptitle">ドラフト会議　第${Math.floor(step / 3) + 1}巡<small>きみの指名。★は下馬評（当日は変わる）</small></div>
      <div style="font-size:10.5px;color:var(--ink3);margin-bottom:8px">
        きみ：${teams.me.slice(1).map(i => CANDS[i].n).join("・") || "（まだいない）"}<br>
        レン：${teams.ren.slice(1).map(i => CANDS[i].n).join("・") || "－"}<br>
        シオン：${teams.shion.slice(1).map(i => CANDS[i].n).join("・") || "－"}</div>
      <div class="list">${pool.map(id => { const c = CANDS[id]; return `<button class="item" data-c="${id}">
        <img class="ii" src="${c.img}" alt=""><div class="it"><b>${c.n}</b><small>${c.role}</small></div>
        <span style="font-size:11px;color:var(--gold)">${stars(id)}</span></button>`; }).join("")}</div>`);
    $("sheetPanel").querySelectorAll(".item").forEach(b => b.onclick = () => {
      const id = b.dataset.c; pool = pool.filter(x => x !== id); teams.me.push(id); step++;
      sfx.good(); closeSheet(); toast(`きみが ${CANDS[id].n} を指名！`);
      setTimeout(render, 500);
    });
  };
  const finish = () => {
    G.teams = teams; G.team = teams.me.slice(1); G.leader = "me"; save();
    showEvent({ c: "tsukasa",
      t: `「決まったな。\n\n${G.name}ユニット：${teams.me.slice(1).map(i => CANDS[i].n).join("・")}\nレンユニット：${teams.ren.slice(1).map(i => CANDS[i].n).join("・")}\nシオンユニット：${teams.shion.slice(1).map(i => CANDS[i].n).join("・")}\n\n1次から3次まではユニット戦。\n最下位のユニットから、毎回2人が消える。\n……キャプテンの責任は、重いぞ」`,
      ch: [{ t: "「背負います」", fx: { st: { me: 5 } }, after: done }] });
  };
  render();
}
function teamNaming(done) {
  const names = ["BLUE PRINT", "NEXT LINE", "ゼロから", `${G.name}組`];
  showEvent({ c: "riku", t: "「ユニット名、決めてね。\n審査でも、密着でも、その名前で呼ばれるよ」",
    ch: names.map(nn => ({ t: `『${esc(nn)}』`, fx: {}, after: () => { G.teamName = nn; save();
      const f = G.team[0];
      showEvent({ c: f, t: `「……よろしく、キャプテン。\n\n正直、選ばれると思ってなかった。\n『${esc(nn)}』か。……いい名前だ。\n\nレンのチームより、絶対に上に行こう」`,
        ch: [{ t: "「行こう」", fx: { aff: Object.fromEntries(G.team.map(i => [i, 8])), silent: true, msg: "ユニット全員の好感度 +8" }, after: done }] }); } })) });
}
function teamCamp() {
  showEvent({ c: "tsukasa",
    t: `「今日から6日間、タイプロハウスで共同生活だ。\n3次審査はユニットの課題曲対決。\n\n『${esc(G.teamName)}』のキャプテンとして、曲を選べ。\nこの選択も、審査の対象だ」`,
    ch: [{ t: "▶", fx: {}, after: () => housePickProducer(() => {
      /* ユニット編でもプロデューサー制（ハウス生活）を重ねる */
      const [o1, o2] = otherProds();
      G.hteams = { [G.prod]: G.teams.me, [o1]: G.teams.ren, [o2]: G.teams.shion }; save();
      pickSong();
    }) }] });
}
function duoCamp() {
  showEvent({ c: "kanade",
    t: `「今日から強化合宿。3次審査はチーム課題曲だよ。\n\n『${esc(dn())}』に、もう1人加えて3人ユニットにしてほしい。\n……誰を呼ぶ？」`,
    ch: [{ t: "もう1人を選ぶ", fx: {}, after: () => pickTeam(["shino"]) }] });
}

/* =====================================================================
   ルート専用コマンド（メイン画面の追加ボタン）
   ===================================================================== */
const ROUTE_CMD = {
  wild: { e: "🌑", n: "地下特訓", s: "暗算スプリント（短時間×大量）", g: ["anzan"], total: 15, cost: 16, main: "me", sub: "ex" },
  team: { e: "🛡", n: "ユニット練習", s: "図形（面積・角度・体積）", g: ["zukei"], total: 10, cost: 24, main: "da", sub: "ex" },
  duo:  { e: "🤝", n: "相棒練習", s: "規則性・速さ・単位換算", g: ["kisoku", "hayasa", "tani"], total: 10, cost: 22, main: "tk", sub: "me" },
};
function routeCmdHtml() {
  const rc = ROUTE_CMD[curRoute()];
  if (!rc) return "";
  const lv = lessonLv();
  const extra = curRoute() === "team" && G.teams ? `　ユニット力 +${G.teamPower || 0}` : curRoute() === "duo" ? `　シノの調子 ${G.shinoForm || 50}` : "";
  return `<button class="cmd route wide" data-c="rcmd"><span class="ce">${rc.e}</span><span><b>${rc.n}</b><small>${rc.s}　<span style="color:var(--gold)">Lv.${lv}</span>${extra}</small>
    <span class="cost" style="${G.stam < rc.cost ? "color:#e63946" : ""}">体力 −${rc.cost}</span></span></button>`;
}
function routeCmd() {
  const rc = ROUTE_CMD[curRoute()];
  if (!rc) return;
  if (G.stam < rc.cost) {
    if (!confirm("体力が足りない。無理をすると失敗しやすくなる。それでも練習する？")) return;
    G.over = true;
  } else G.over = false;
  G.stam = Math.max(0, G.stam - rc.cost);
  const genre = pick(rc.g);
  const title = `${rc.e} ${rc.n}`;
  startQuiz({
    mode: "lesson", genre, lv: lessonLv(), total: rc.total, title,
    onEnd: r => {
      const fx = skillFx();
      let mult = CONDS[G.cond].m * (1 + fx.all) * (1 + DB.meta.up.eff * .1);
      if (G.over) mult *= .6;
      const base = 2.5 + r.score / 13;
      const gains = [];
      const d1 = addStat(rc.main, gainFor(rc.main, base * mult)); gains.push([STATS.find(s => s.k === rc.main).n, d1]);
      const d2 = addStat(rc.sub, gainFor(rc.sub, base * mult * .45)); if (d2) gains.push([STATS.find(s => s.k === rc.sub).n, d2]);
      let fans = 0;
      if (r.score >= 70) { fans = Math.round((r.score - 60) * ri(3, 7) * (1 + fx.fan)); G.fans += fans; }
      if (r.score >= 95 && r.correct === r.total) G.perfectLesson++;
      G.totalQ += r.total; G.totalOK += r.correct;
      G.bestCombo = Math.max(G.bestCombo, r.best);
      G.recentScores = (G.recentScores || []).concat(r.score).slice(-5);
      ensureProg();
      G.mProg.lessons++;
      G.mProg.bestCorrect = Math.max(G.mProg.bestCorrect, r.correct);
      if (r.correct === r.total) G.mProg.nomiss = true;
      let extra = "";
      if (curRoute() === "wild") {
        const ws = wildAlive();
        ws.forEach(id => { G.aff[id] = clamp(G.aff[id] + 4, 0, 100); });
        if (ws.length) extra = `<div class="smallnote">地下組（${ws.map(i => CANDS[i].n).join("・")}）の好感度 +4</div>`;
      } else if (curRoute() === "team") {
        const tm = myTeam();
        tm.forEach(id => { G.aff[id] = clamp(G.aff[id] + 5, 0, 100); });
        const up = r.score >= 85 ? 2 : r.score >= 60 ? 1 : 0;
        G.teamPower = Math.min(10, (G.teamPower || 0) + up);
        extra = `<div class="smallnote">${tm.length ? `ユニットの好感度 +5　` : ""}ユニット力 ${up ? "+" + up : "±0"}（いま ${G.teamPower}）</div>`;
      } else if (curRoute() === "duo") {
        G.aff.shino = clamp(G.aff.shino + 6, 0, 100);
        const up = r.score >= 85 ? 6 : r.score >= 60 ? 4 : 2;
        G.shinoForm = clamp((G.shinoForm || 50) + up, 0, 100);
        extra = `<div class="smallnote">シノの好感度 +6　シノの調子 +${up}（いま ${G.shinoForm}）</div>`;
      }
      showResult({ title, r, gains, fans, extra, after: () => checkSkills(() => checkTitles(() => maybeAdvice(() => endDay()))) });
    },
  });
}

/* =====================================================================
   審査のルート調整
   ===================================================================== */
function routeAud(a) {
  if (!a) return a;
  if (curRoute() === "wild" && a.d === 6) return { ...a, n: "敗者復活戦", sub: "WILD CARD　5人で3枠", need: a.need + 3, dropN: 2 };
  if (curRoute() === "team" && a.d <= 18) return { ...a, sub: a.sub + "　ユニット対抗" };
  if (curRoute() === "duo") return { ...a, sub: a.sub + "　デュオ審査" };
  return a;
}
function routePreAud(a, idx) {
  const r = curRoute();
  if (r === "duo") {
    const sign = G.duoSign ? `\n\n合図は『${esc(G.duoSign)}』。……忘れないで」` : "」";
    return { c: "shino", t: pick([
      `「……本番。\n\n（シノの手が、少し震えている）\n\n……大丈夫。隣に、いるよね${sign}`,
      `「『${esc(dn())}』、行こう。\n\n……ぼくが固まったら、拾って。\n${G.name}が転んだら、ぼくが拾う${sign}`,
      `「……深呼吸、した。\n\n2人で1つの点数。……ぼくの分まで、稼がなくていい。\n2人で、ちょうどいい点を取ろう${sign}`,
      `「（シノが、拳を差し出した）\n\n……いってきます、じゃなくて。\n……いこう${sign}`,
    ]) };
  }
  if (r === "wild" && idx === 0) {
    const w = wildAlive();
    const c = w.length ? pick(w) : "kanade";
    return { c, t: `「復活戦だ。……5人で3枠。\n\n${w.length ? "おれたち、この5人で円陣組んだよな。\n" : ""}全員で上がれないのは、わかってる。\n\nでも、全力でやろう。……地下組の意地、見せてやろうぜ」` };
  }
  if (r === "team" && idx <= 2) {
    const tm = myTeam();
    const c = tm.length ? pick(tm) : "kanade";
    return { c, t: `「キャプテン。……『${esc(G.teamName)}』、行こう。\n\nおれたちの点は、全員の点。\n${tm.length ? "誰かがこけたら、残りで拾う。" : ""}……そういうチームだろ、うちは」` };
  }
  return null;
}
function routeRivals(a, idx) {
  if (curRoute() === "wild" && idx === 0) return wildAlive();
  return G.alive;
}
/* 審査後の補正。finalTotal と board を受け取り、{ finalTotal, board, html, drops, fanMul } を返す */
function routeAudAdjust(a, idx, r, finalTotal, board) {
  const out = { finalTotal, board, html: "", drops: null, fanMul: 1 };
  const rt = curRoute();
  if (rt === "wild") {
    out.fanMul = 1.5;
    if (idx === 0) out.html = `<div class="gain"><span>🌑 地下組の意地（注目度1.5倍）</span><b>復活戦</b></div>`;
    else out.html = `<div class="gain"><span>🌑 逆転ストーリーに世間が沸く</span><b>注目度 1.5倍</b></div>`;
    return out;
  }
  if (rt === "duo") {
    const sh = board.find(b => b.id === "shino");
    if (!sh) return out;
    const formB = Math.round(((G.shinoForm || 50) - 50) / 10);
    sh.s += formB;
    const gap = sh.s - finalTotal;
    const meB = clamp(Math.round(gap * .3), -5, 9);
    const shB = clamp(Math.round(-gap * .3), -5, 9);
    out.finalTotal = finalTotal + meB;
    const me = board.find(b => b.me); me.s = out.finalTotal;
    sh.s += shB;
    board.sort((x, y) => y.s - x.s);
    out.html = `<div class="gain"><span>🤝 デュオ補正（シノ ${sh.s}点との平均化）</span><b>${meB >= 0 ? "+" : ""}${meB}</b></div>
      <div class="gain"><span>シノの調子 ${G.shinoForm || 50}</span><b>${formB >= 0 ? "+" : ""}${formB}（シノ側）</b></div>`;
    return out;
  }
  if (rt === "team" && idx <= 2 && G.teams) {
    const sc = id => id === "me" ? finalTotal : (board.find(b => b.id === id) || { s: 0 }).s;
    const standings = Object.keys(G.teams).map(k => {
      const mem = G.teams[k].filter(id => id === "me" || G.alive.includes(id));
      const avg = mem.length ? mem.reduce((s, id) => s + sc(id), 0) / mem.length : 0;
      const bonus = k === "me" ? (G.teamPower || 0) * .6 : 0;
      return { k, mem, avg: Math.round((avg + bonus) * 10) / 10, name: k === "me" ? G.teamName : TEAM_NAMES_AI[k] };
    }).sort((x, y) => y.avg - x.avg);
    const myPos = standings.findIndex(s => s.k === "me") + 1;
    G.teamLast = myPos;
    const loser = standings[standings.length - 1];
    let cands = loser.mem.filter(id => id !== "me").sort((x, y) => sc(x) - sc(y));
    let drops = cands.slice(0, 2);
    if (drops.length < 2) {
      const second = standings[standings.length - 2];
      const more = second.mem.filter(id => id !== "me" && !drops.includes(id)).sort((x, y) => sc(x) - sc(y));
      drops = drops.concat(more.slice(0, 2 - drops.length));
    }
    out.drops = drops;
    if (myPos === 1) { out.finalTotal = finalTotal + 3; board.find(b => b.me).s = out.finalTotal; board.sort((x, y) => y.s - x.s); out.fanMul = 1.4; }
    out.html = `<div class="missBox"><div class="mt">UNIT STANDINGS</div>
      ${standings.map((s, i) => `<div class="missRow" style="${s.k === "me" ? "color:var(--gold)" : ""}"><span>${i + 1}位　『${esc(s.name)}』${s.k === "me" ? "（きみ）" : ""}</span><em>${s.avg}</em></div>`).join("")}
      <div style="font-size:10px;color:var(--ink3);margin-top:6px">${myPos === 1 ? "🏆 ユニット1位：きみの点に +3、注目度1.4倍" : myPos === 2 ? "2位。脱落者は出ない" : "⚠ 最下位。ユニットから2人が脱落する"}</div></div>`;
    return out;
  }
  return out;
}
function routeAfterAnnounce(idx, done) {
  const rt = curRoute();
  if (rt === "team" && idx === 2 && G.teams) {
    const tm = myTeam();
    G.teams = null; G.team = null; save();
    const c = tm.length ? tm[0] : "tsukasa";
    return showEvent({ c: "tsukasa",
      t: "「ユニット戦は、ここまでだ。\n\n今日をもって、3ユニットは解体。\nここからは個人戦。……仲間は、敵になる」",
      ch: [{ t: "▶", fx: {}, after: () => showEvent({ c,
        t: tm.length
          ? `「……キャプテン。いや、もうキャプテンじゃないか。\n\n『${esc(G.teamName)}』、楽しかった。\n……ここからは敵だ。手加減しないからな。\n\n……でも、おまえがセンター獲ったら、たぶんおれ泣くわ」`
          : `「……最後まで、キャプテンだったな。\n1人になっても、な。\n\n……ここからは、おまえ自身のステージだ」`,
        ch: [{ t: "「おれも、泣くと思う」", fx: { st: { me: 6 }, aff: tm.length ? { [c]: 10 } : {} }, after: done }] }) }] });
  }
  if (rt === "wild" && idx === 0) {
    const ws = wildAlive();
    return showEvent({ c: "riku",
      t: `「……復活戦、終わり。\n\n上に上がるのは、${ws.length ? ws.map(i => CANDS[i].n).join("と") + "と、" : ""}${G.name}。\n\n今日から、地下組も上の練習場を使っていい。\n……でも忘れないで。きみたちの居場所は、ここで自分で取ったんだ」`,
      ch: [{ t: "「はい」", fx: { st: { me: 5 }, cond: 1 }, after: done }] });
  }
  done();
}

/* =====================================================================
   相棒編：ファイナルの分岐
   ===================================================================== */
function duoFinal(board) {
  const myRank = board.findIndex(b => b.me) + 1;
  const shRank = board.findIndex(b => b.id === "shino") + 1;
  const meIn = myRank <= 5, shIn = shRank > 0 && shRank <= 5;
  G.duoResult = meIn && shIn ? "both" : meIn ? "meOnly" : shIn ? "shinoOnly" : "none";
  save();
  const challenge = (okKind, ngKind) => startQuiz({
    mode: "aud", lv: 5, total: 10, title: "🤝 2人で追加枠チャレンジ",
    onEnd: r => {
      G.totalQ += r.total; G.totalOK += r.correct; G.bestCombo = Math.max(G.bestCombo, r.best);
      if (r.score >= 60) return ending(okKind, board);
      ending(ngKind, board);
    }
  });
  if (G.duoResult === "both") return ending("final", board);
  if (G.duoResult === "meOnly") {
    return showEvent({ c: "shino",
      t: `「……おめでとう。\n\n（シノが笑った。泣きながら）\n\n……行って。ぼくは、大丈夫。\n『${esc(dn())}』は、${G.name}が連れて行って」`,
      ch: [
        { t: "「一人では行かない」", fx: { st: { me: 5 } }, after: () => showEvent({ c: "tsukasa",
          t: "「……デビューを蹴る気か。\n\n……ばかだな。\n\n……いや。……わかった。\nなら証明しろ。2人で、いまここで。\n【追加枠チャレンジ】だ。2人分の点を、おまえが出せ」",
          ch: [{ t: "ステージへ", fx: { cond: 1 }, after: () => challenge("duoExtra", "duoHalf") }] }) },
        { t: "「行ってくる。……待ってて」", fx: { st: { me: 3 } }, after: () => ending("duoSolo", board) },
      ] });
  }
  if (G.duoResult === "shinoOnly") {
    return showEvent({ c: "shino",
      t: `「……フマさん。\n\nぼく、辞退します。\n${G.name}がいないなら、『${esc(dn())}』じゃない。\n\n……約束したんです。転んだら、拾うって」`,
      ch: [{ t: "「シノ……！」", fx: {}, after: () => showEvent({ c: "tsukasa",
        t: `「……ばかか、おまえら。\n\n（長い沈黙。フマが、ため息をついた）\n\n……なら、2人で追加枠に挑め。\n${G.name}。おまえが証明しろ。シノが人生を懸けた相棒だってことを」`,
        ch: [{ t: "ステージへ", fx: { cond: 1 }, after: () => challenge("duoExtra", "duoRev") }] }) }] });
  }
  ending("final", board);
}

/* =====================================================================
   エンディング文面のルート差し替え
   ===================================================================== */
function routeEndingText(kind, rk, board) {
  const rt = curRoute();
  const n = G.name;
  if (rt === "duo") {
    if (kind === "duoExtra") return { rk: "A", title: `『${dn()}』2人でデビュー！`, text: `「──2人とも、合格だ」\n\nフマの声が、震えていた気がした。\n\n一度は割れたはずの2つの名前が、\n最後の最後で、1つのデュオ名で呼ばれた。\n\nシノが、はじめて声を上げて泣いた。\n${n}は、ただ肩を2回たたいた。\n\n約束は、守られた。` };
    if (kind === "duoHalf") return { rk: "A", title: "デビュー、そして約束", text: `2人分の点には、届かなかった。\n\nでもフマは言った。\n「${n}、デビューだ。シノは特別練習生。半年後、追いつけ」\n\nシノが小さく笑った。\n「……半年。……待ってて、じゃなくて。追いつくから」\n\n『${dn()}』は、まだ終わっていない。` };
    if (kind === "duoRev") return { rk: "B+", title: "相棒を、先に行かせた", text: `届かなかった。\n\nでもシノは、辞退を取り下げた。${n}がそう頼んだから。\n\n「……先に行ってる。ステージの上で、待ってる」\n\n${n}は特別練習生。半年後のデビューが約束された。\n\n2人の名前が並ぶ日は、少しだけ先になった。` };
    if (kind === "duoSolo") return { rk: "A", title: "1人で立つステージ", text: `${n}の名前が呼ばれた。\nシノの名前は、呼ばれなかった。\n\n控室で、シノが言った。\n「……行って。ぼくの分まで、なんて思わなくていい。\n${n}の分だけ、全部出して」\n\nステージの上で、${n}は肩を2回たたいた。\n客席のいちばん後ろで、シノが同じ合図を返した。` };
    if (kind === "final" && board) {
      const myRank = board.findIndex(b => b.me) + 1;
      if (G.duoResult === "both") {
        if (myRank === 1) return { rk: "S", title: `『${dn()}』センターデビュー`, text: `最初に呼ばれたのは、${n}。\n2人目に呼ばれたのは、シノ。\n\n「タイムレッスーの新しいセンターは、おまえだ。\n……そして、隣にはずっとシノがいる」\n\n20,000人の頂点に、2人で立った。\n\nどっちかが転んだら、もう片方が拾う。\nその約束を、30日間、1度も破らなかった。` };
        return { rk: "A", title: `『${dn()}』2人でデビュー`, text: `${n}の名前が呼ばれ、少しあとに、シノの名前が呼ばれた。\n\nステージの上で目が合った瞬間、\nシノが小さく、拳を突き出した。\n\n2人で1つのステージ。\nここからが、本当の『${dn()}』だ。` };
      }
      if (G.duoResult === "none") return { text: `2人とも、呼ばれなかった。\n\n帰り道、シノが言った。\n「……2人で落ちたね。……でも、2人だった」\n\n悔しさは半分にならなかった。\nでも、来年の約束は、2倍になった。` };
    }
  }
  if (rt === "wild" && kind === "final" && board) {
    const myRank = board.findIndex(b => b.me) + 1;
    if (myRank === 1) return { text: `最初に呼ばれたのは、${n}の名前だった。\n\n1次審査で、名前を呼ばれなかった男が。\n地下練習場から、20,000人の頂点に立った。\n\n「タイムレッスーの新しいセンターは、おまえだ」\n\nショリが、客席の隅で泣いていた。\n枠を作った責任は、最高の形で果たされた。` };
    if (myRank <= 5) return { text: `${myRank}人目に、${n}の名前が呼ばれた。\n\n1次で落ちた。地下で汗をかいた。\nネットに叩かれ、レンに茶番と言われ、それでも上がってきた。\n\n地下組の代表として、ステージに立つ。\n……あの雨の日に、もう終わったと思った男が。` };
    return { text: `届かなかった。\n\nでも、1次で落ちたあの日より、ずっと遠くまで来た。\n地下から上がってきた30日間は、誰にも取れない。\n\nソウが言った。\n「地下の壁の汗のあと、あれは消さないでおくよ。……来年、見に来て」` };
  }
  if (rt === "team" && kind === "final" && board) {
    const myRank = board.findIndex(b => b.me) + 1;
    const tn = G.teamName || "ユニット";
    if (myRank === 1) return { text: `最初に呼ばれたのは、${n}の名前だった。\n\n『${tn}』のキャプテンだった男が、センターに。\n\n客席の元チームメイトが、声をからして叫んでいた。\n「言ったろ！ 泣くって！！」\n\n仲間を背負った30日間が、いちばん高い場所に連れてきた。` };
    if (myRank <= 5) return { text: `${myRank}人目に、${n}の名前が呼ばれた。\n\n『${tn}』のキャプテンとして、仲間を守り、仲間と別れ、1人で立った。\n\nレンが、すれ違いざまに小さく言った。\n「……キャプテンどうし、また会おうぜ。上で」` };
  }
  return null;
}

/* =====================================================================
   ルート専用の日付イベント（その日の終わりに必ず発生。審査日は避ける）
   ===================================================================== */
const ROUTE_SCHED = {
  wild: {
    2: done => showEvent({ c: wildName(1), t: "「なあ。おれたち、上で『地下組』って呼ばれてるらしいぞ。\n\n……上等だよ。\n地下から這い上がるやつが、いちばん強い。\n\n……明日から、朝5時集合な。上のやつらより2時間早く」", ch: [
      { t: "「5時な。寝坊すんなよ」", fx: { st: { me: 4 }, aff: { [wildName(1)]: 8 } }, after: done },
      { t: "「4時半でもいい」", fx: { st: { me: 6 }, stam: -8, aff: { [wildName(1)]: 10 } }, after: done } ] }),
    3: done => showEvent({ c: "shino", t: "（夜。合格組のシノが、ひとりで地下練習場に降りてきた）\n\n「……ここ、静かでいいね。\n\n上は、ずっとざわざわしてる。誰が残るとか、誰が有利とか。\n……ぼくは、静かに解きたい。\n\n……となり、いい？」", ch: [
      { t: "「いいよ」", fx: { aff: { shino: 12 }, st: { me: 3 } }, after: done },
      { t: "「合格組が、なんで地下に」", fx: { aff: { shino: 6 }, st: { me: 5 } }, after: done } ] }),
    4: done => showEvent({ c: "tsukasa", t: "（フマが地下に降りてきた。全員の背筋が伸びた）\n\n「地下に来た理由は一つだ。ショリの顔を立てるためじゃない。\n\n情けでは通さない。\n復活戦の合格ラインは、上の1次より高く設定する。\n\n……それでも、ここにいるか？」", ch: [
      { t: "「います」", fx: { st: { me: 6 } }, after: done },
      { t: "「見ててください」", fx: { st: { ex: 3, me: 4 } }, after: done } ] }),
    5: done => { const ws = wildAlive(); const aff = Object.fromEntries(ws.map(i => [i, 6])); return showEvent({ c: wildName(2), t: "「明日だな。……円陣、組もうぜ。\n\n落ちた5人でやる円陣なんて、かっこ悪いかもしれないけど。\n\n……でも、おれ。この5人でよかったって思ってる」", ch: [
      { t: "🤝 円陣を組む", fx: { st: { me: 5 }, aff, silent: true, msg: "地下組の円陣。精神力 +5／地下組の好感度 +6" }, after: done },
      { t: "「明日、全員で上がろう」", fx: { st: { me: 4 }, cond: 1, aff, silent: true, msg: "調子アップ／地下組の好感度 +6" }, after: done } ] }); },
    7: done => showEvent({ c: G.alive.includes("hara") ? "hara" : "takuto", t: G.alive.includes("hara")
      ? "「ちゃぼすーーー！！ おかえり！！\n\nおれさ、実は前のオーディションで1回落ちてるんだよ。……だから知ってる。\n落ちてから上がってきたやつは、強いぞ。\n\n……いっしょに、いこうぜ！」"
      : "「……おかえり。地下、きつかっただろ。\n\nおれは上で見てただけだ。でも、おまえの復活戦、正直しびれた。\n\n……ここからは、同じ土俵だ」", ch: [
      { t: "「ただいま」", fx: { st: { me: 5 }, cond: 1 }, after: done } ] }),
    8: done => G.alive.includes("ren") ? showEvent({ c: "ren", t: "「ワイルドカード、ね。……茶番だと思ってる。\n\n一度落ちたやつが、おれと同じ土俵にいるのが気に入らない。\n\n……証明しろよ。次の審査で」", ch: [
      { t: "「する」", fx: { st: { me: 6 } }, after: done },
      { t: "「土俵に立ってから言えって顔だな」", fx: { st: { tk: 4, me: 3 }, aff: { ren: 4 } }, after: done } ] }) : done(),
    10: done => { const gone = (G.wildGroup || []).filter(id => !G.alive.includes(id)); const c = gone.length ? gone[0] : wildName(0); return showEvent({ c, t: `（地下で一緒だった${CANDS[c].n}から、LINEが届いた）\n\n『上、どう？ おれは実家に帰った。\n……でも、おまえがテレビに出るの、待ってる。\n\n地下組の代表、頼んだぞ。\n朝5時集合、続けろよ』`, ch: [
      { t: "『続けてる。見てろ』", fx: { st: { me: 7 } }, after: done },
      { t: "『……ありがとう』", fx: { st: { me: 5 }, cond: 1 }, after: done } ] }); },
    14: done => showEvent({ c: "riku", t: "「密着番組、見た？\n『地下からの逆転』特集、きみが主役だったよ。\n\nSNS、大変なことになってる。\n……いい意味でも、悪い意味でも」", ch: [
      { t: "「見ました」", fx: { fans: 2500, st: { tk: 3 } }, after: done },
      { t: "「見てません。練習してました」", fx: { fans: 2000, st: { me: 5 } }, after: done } ] }),
    20: done => showEvent({ c: "riku", t: "「……正直に言うね。\n復活枠を作ったとき、フマにもソウにも反対された。\n『情に流された』って。\n\nだから、きみが結果を出してくれると、僕も救われる。\n\n……重いこと言って、ごめんね」", ch: [
      { t: "「背負います」", fx: { st: { me: 7 } }, after: done },
      { t: "「重くないです。うれしいです」", fx: { st: { me: 5 }, cond: 1 }, after: done } ] }),
    28: done => showEvent({ c: "kanade", t: "（ファイナル2日前。ふと、地下練習場に降りてみた）\n\n「……来ると思ってた。\n\n見て。壁のあの汗のあと、きみのだよ。\n\n30日前のきみに、言ってあげて。\n『大丈夫だった』って」", ch: [
      { t: "「……大丈夫だった」", fx: { st: { me: 8 }, cond: 1 }, after: done } ] }),
  },
  team: {
    2: done => { const tm = myTeam(); const c = tm[0] || "riku"; const affAll = Object.fromEntries(tm.map(i => [i, 4])); return showEvent({ c, t: "「キャプテン。ミーティングしよ。\n\n……役割、決めない？ 全員で全部やるのか、得意を1つずつ持つのか」", ch: [
      { t: "「全員で全部やる」", fx: { aff: affAll, st: { da: 2 }, silent: true, msg: "ユニットの好感度 +4／ダンス +2" }, after: done },
      { t: "「得意を1つずつ決めよう」", fx: { st: { me: 4, tk: 3 } }, after: done },
      { t: "「おれが全部背負う」", fx: { st: { me: 6 }, stam: -10 }, after: done } ] }); },
    3: done => showEvent({ c: "ren", t: `「おまえのチーム、見たよ。『${esc(G.teamName)}』だっけ。\n\n……悪くない。でも、おれのチームには勝てない。\n理由を教えてやろうか。\n\n……おれがいるからだ」`, ch: [
      { t: "「見てろ」", fx: { st: { me: 5 } }, after: done },
      { t: "「その自信、うちにも分けてくれ」", fx: { st: { tk: 3 }, aff: { ren: 5 } }, after: done } ] }),
    5: done => { const tm = myTeam(); const c = tm[1] || tm[0] || "riku"; return showEvent({ c, t: "「……なあ、キャプテン。\n\nおれ、明日、足引っぱるかもしれない。\n……正直、こわい」", ch: [
      { t: "「こわいのは、本気の証拠だ」", fx: { aff: { [c]: 12 }, st: { me: 4 } }, after: done },
      { t: "「おれもこわいよ。一緒にこわがろう」", fx: { aff: { [c]: 10 }, cond: 1 }, after: done },
      { t: "「大丈夫。数字はおれが稼ぐ」", fx: { aff: { [c]: 6 }, st: { me: 6 } }, after: done } ] }); },
    7: done => { const tm = myTeam(); const c = tm[0] || "riku"; const affAll = Object.fromEntries(tm.map(i => [i, 6])); return G.teamLast === 1
      ? showEvent({ c, t: `「勝ったーーー！！！\n『${esc(G.teamName)}』、1位！！\n\nキャプテン、おまえの点がでかかった。……ありがとな」`, ch: [{ t: "「全員の点だ」", fx: { cond: 1, aff: affAll, silent: true, msg: "調子アップ／ユニットの好感度 +6" }, after: done }] })
      : showEvent({ c, t: G.teamLast === 2 ? "「2位、か。……誰も落ちなかった。それだけで、今日は良しとしよう。\n\n次は、勝つ」" : "「……最下位。2人、消えた。\n\n誰のせいでもない。……いや、違うな。全員のせいだ。\n\nキャプテン。次、勝とう。絶対に」", ch: [{ t: "「次、勝つ」", fx: { st: { me: 6 } }, after: done }] }); },
    9: done => { const tm = myTeam(); if (tm.length < 2) return done(); const a = tm[0], b = tm[1]; return showEvent({ c: b, t: `「……ちょっと、${CANDS[a].n}とケンカした。練習のやり方で。\n\n……キャプテン、どうする？」`, ch: [
      { t: "「2人と、3人で話そう」", fx: { aff: { [a]: 8, [b]: 8 }, st: { me: 4 } }, after: done },
      { t: "「放っておく。自分たちで解決できる」", fx: { st: { me: 3 }, aff: { [a]: -3, [b]: -3 } }, after: done },
      { t: "「フマに相談する」", fx: { st: { tk: 3, me: 2 } }, after: done } ] }); },
    11: done => G.alive.includes("shion") ? showEvent({ c: "shion", t: "（シオンのチームの練習を、廊下から見た。誰もしゃべらない。ただ、揃っている）\n\n「……見てた？\n\n……うちは、しゃべらない。\nしゃべる時間で、1回多く踊る」", ch: [
      { t: "「参考にする」", fx: { st: { da: 4 } }, after: done },
      { t: "「うちは、うちのやり方で」", fx: { st: { me: 5 } }, after: done } ] }) : done(),
    15: done => { const tm = myTeam(); const c = tm[2] || tm[0] || "shuto"; return showEvent({ c, t: `「密着カメラ、今日うちのユニット特集だって！\n『${esc(G.teamName)}』のキャプテン、一言！！」`, ch: [
      { t: "「勝って、全員でデビューします」", fx: { fans: 1800, st: { me: 4 } }, after: done },
      { t: "「うちのメンバー、最高です」", fx: { fans: 1400, aff: Object.fromEntries(tm.map(i => [i, 6])), silent: true, msg: "注目度 +1,400／ユニットの好感度 +6" }, after: done } ] }); },
    17: done => { const tm = myTeam(); const c = tm[tm.length - 1] || "riku"; return showEvent({ c, t: "「……キャプテン。正直に言う。\n\nおれ、レンのチームに移りたいって、一瞬思った。\n……あっちのほうが、勝てそうだから。\n\n……ごめん」", ch: [
      { t: "「行きたいなら、止めない」", fx: { st: { me: 8 }, aff: { [c]: 10 } }, after: done },
      { t: "「うちで勝とう。おれが勝たせる」", fx: { aff: { [c]: 8 }, st: { me: 5 } }, after: done },
      { t: "「……正直に言ってくれて、ありがとう」", fx: { aff: { [c]: 12 } }, after: done } ] }); },
    25: done => { const ex = CAND_IDS.filter(id => G.alive.includes(id) && G.aff[id] >= 30 && id !== "ren" && id !== "shion"); const c = ex.length ? pick(ex) : "kanade"; return showEvent({ c, t: "「元チームメイトとして言う。\n\n……ここからは敵だ。手加減しない。\n\nでも、おまえがセンター獲ったら、たぶんおれ泣くわ。……たぶんじゃないな。絶対泣く」", ch: [
      { t: "「泣かせてやる」", fx: { st: { me: 6 }, aff: { [c]: 8 } }, after: done } ] }); },
    29: done => G.alive.includes("ren") ? showEvent({ c: "ren", t: "「明日でぜんぶ終わりだ。\n\n……キャプテンどうし、最後に握手しとくか。\n\n……勝つのは、おれだけどな」", ch: [
      { t: "🤝 握手する", fx: { st: { me: 6 }, aff: { ren: 10 }, cond: 1 }, after: done } ] }) : done(),
  },
  duo: {
    2: done => showEvent({ c: "shino", t: "「相棒練習、やろう。……ぼくの解き方、教える。\n\n『まず、答えの見当をつける』。\n大きいか小さいか、だいたい何くらいか。\n\n見当があると、計算ミスに自分で気づける。\n……メイン画面の【相棒練習】、毎日やろう」", ch: [
      { t: "「見当、つけてから解く」", fx: { st: { me: 3, tk: 2 } }, after: done } ] }),
    4: done => showEvent({ c: "shino", t: "「……ぼくの弱点、言っとく。\n\n本番で、頭が真っ白になる。1次の前も、そうだった。\n\n……合図、決めない？\nぼくが固まったら、{name}が、何かしてくれる合図」", ch: [
      { t: "「肩を2回たたく」", fx: { aff: { shino: 10 } }, after: () => { G.duoSign = "肩を2回たたく"; save(); done(); } },
      { t: "「目を見て、うなずく」", fx: { aff: { shino: 10 } }, after: () => { G.duoSign = "目を見てうなずく"; save(); done(); } },
      { t: "「小声で『見当』って言う」", fx: { aff: { shino: 12 } }, after: () => { G.duoSign = "小声で『見当』"; save(); done(); } } ] }),
    7: done => showEvent({ c: "shino", t: G.warn ? "「……崖っぷち、か。\n\n……大丈夫。次は、ぼくが引っぱり上げる番。\n約束、覚えてる？ 転んだら、拾う」" : "「……2人で、通った。\n\n（シノが、拳を突き出した）\n\n……よかった。本番、固まらなかった。\n{name}が隣にいたから」", ch: [
      { t: "（拳を合わせた）", fx: { aff: { shino: 10 }, st: { me: 4 } }, after: done } ] }),
    9: done => showEvent({ c: "shino", t: "（けんか、した）\n\n「ぼくは『基礎を固めたい』。{name}は『難しい問題に行きたい』。\n\n……どっちも正しい。\nだから、腹が立つ」", ch: [
      { t: "「シノに合わせる」", fx: { aff: { shino: 8 }, st: { me: 2 } }, after: done },
      { t: "「おれに合わせてくれ」", fx: { aff: { shino: 3 }, st: { me: 6 } }, after: done },
      { t: "「半分ずつ、やろう」", fx: { aff: { shino: 10 }, st: { me: 4 } }, after: done } ] }),
    10: done => showEvent({ c: "shino", t: "（自販機の前で、シノがココアを2本持っていた）\n\n「……昨日は、ごめん。\n\n……はい、これ。\n仲直りの、ココア」", ch: [
      { t: "「……あったかい」", fx: { aff: { shino: 12 }, cond: 1, stam: 15 }, after: done } ] }),
    16: done => showEvent({ c: "shino", t: "「……受験のとき、母さんが毎朝おにぎりを2個、机に置いてった。\n何も言わずに。\n\n落ちた日も、置いてあった。\n\n……ぼく、あのおにぎりのために、次の年に受かった」", ch: [
      { t: "「……いい話」", fx: { st: { me: 5 }, aff: { shino: 8 } }, after: done },
      { t: "「おれも、誰かのために」", fx: { st: { me: 6 }, cond: 1 }, after: done } ] }),
    20: done => showEvent({ c: "shino", t: "（シノの顔色が悪い。熱があるらしい）\n\n「……大丈夫。明日の練習、出る。\n……出るったら出る」", ch: [
      { t: "「休め。今日はおれが2人分やる」", fx: { aff: { shino: 15 }, stam: -20 }, after: () => { G.shinoForm = clamp((G.shinoForm || 50) + 10, 0, 100); save(); done(); } },
      { t: "「無理するな。でも、隣にはいて」", fx: { aff: { shino: 10 } }, after: () => { G.shinoForm = clamp((G.shinoForm || 50) + 5, 0, 100); save(); done(); } },
      { t: "「シノがそう言うなら」", fx: { st: { me: 2 } }, after: () => { G.shinoForm = clamp((G.shinoForm || 50) - 10, 0, 100); save(); done(); } } ] }),
    23: done => showEvent({ c: "shino", t: "「……もし、だよ。\n\nもし、どっちか片方しかデビューできなかったら。\n\n……どうする？」", ch: [
      { t: "「2人じゃなきゃ、意味がない」", fx: { aff: { shino: 12 }, st: { me: 4 } }, after: () => { G.duoPromise = "both"; save(); done(); } },
      { t: "「片方が先に行って、もう片方を引き上げる」", fx: { aff: { shino: 8 }, st: { me: 6 } }, after: () => { G.duoPromise = "pull"; save(); done(); } },
      { t: "「……わからない」", fx: { aff: { shino: 6 }, st: { me: 3 } }, after: () => { G.duoPromise = "unknown"; save(); done(); } } ] }),
    27: done => showEvent({ c: "shino", t: "（屋上。シノが座っている）\n\n「……ここ、ぼくの秘密の場所。\n\n30日間、ここで空を見て、深呼吸してた。\n……{name}にだけ、教える」", ch: [
      { t: "「……いい場所」", fx: { aff: { shino: 12 }, st: { me: 4 } }, after: done } ] }),
    29: done => showEvent({ c: "shino", t: `「明日だね。\n\n……『${esc(dn())}』として、最後のステージ。\n\n……ぼく、たぶん固まらない。\n隣に{name}がいるから」`, ch: [
      { t: "「隣にいる」", fx: { st: { me: 8 }, cond: 1, aff: { shino: 8 } }, after: done } ] }),
  },
};
function routeDayEvent(done) {
  const sch = ROUTE_SCHED[curRoute()];
  if (!sch || !G || G.day >= TOTAL_D) return false;
  G.routeSeen = G.routeSeen || [];
  const days = Object.keys(sch).map(Number).filter(d => d <= G.day && d > G.day - 7 && !G.routeSeen.includes(d)).sort((a, b) => a - b);
  if (!days.length) return false;
  const d = days[0];
  G.routeSeen.push(d); save();
  sch[d](done);
  return true;
}

/* =====================================================================
   ルート専用のランダムイベント（一般プールに route 付きで混ぜる）
   ===================================================================== */
EVENTS.push(
  { id: "w_r1", route: "wild", c: "kanade", t: "（SNSを開いた。『落ちた奴が何しに戻ってきた』『ワイルドカードとか萎える』……）\n\nソウ「……見ちゃった？ 見なくていいのに。\n\nでもね、書かれるってことは、見られてるってことだよ」", ch: [
    { t: "エゴサをやめる", fx: { st: { me: 5 }, cond: 1 } },
    { t: "全部読んで、燃料にする", fx: { st: { me: 3, ex: 3 }, stam: -8 } } ] },
  { id: "w_r2", route: "wild", c: "shuto", t: "「地下組の話、上でも噂になってるよ。\n『あいつら、朝5時から練習してる』って。\n\n……おれも、負けてらんない。\nてか、混ぜてくんない？ 地下の朝練」", ch: [
    { t: "「5時な」", fx: { aff: { shuto: 12 }, st: { me: 3 } } },
    { t: "「合格組は寝てろ（笑）」", fx: { aff: { shuto: 8 }, st: { tk: 3 } } } ] },
  { id: "w_r3", route: "wild", c: "shino", t: "「地下の階段、数えた？ 42段。\n\n……1段1問、解きながら上がると、着くころには42問。\nぼくはそうしてる」", ch: [
    { t: "「明日からやる」", fx: { aff: { shino: 10 }, st: { me: 4 } } },
    { t: "「シノ、変わってるな（笑）」", fx: { aff: { shino: 8 }, st: { tk: 2 } } } ] },
  { id: "w_r4", route: "wild", c: "daigo", t: "「兄ちゃん、地下上がりやろ？ ええやん！\n関西では『落ちてからが本番』言うねん。\n\n……嘘やけど。でも、ほんまにそう思う」", ch: [
    { t: "「嘘かい！」", fx: { aff: { daigo: 10 }, st: { tk: 4 }, cond: 1 } },
    { t: "「……ありがとう」", fx: { aff: { daigo: 8 }, st: { me: 4 } } } ] },
  { id: "w_r5", route: "wild", c: "tsukasa", t: "「地下組の{name}か。\n\n……悪くない目になったな。\n落ちる前より、いい」", ch: [
    { t: "「落ちてよかったとは、思いません」", fx: { st: { me: 7 } } },
    { t: "「……ありがとうございます」", fx: { st: { me: 5 }, fans: 500 } } ] },
  { id: "w_r6", route: "wild", c: "masaki", t: "「地下、カビくさくなかった？（笑）\n\n……でもさ。その匂い、あとで絶対なつかしくなるよ。\nおれ、地方の練習場がそうだった」", ch: [
    { t: "「もうなつかしい」", fx: { aff: { masaki: 9 }, st: { me: 3 } } } ] },

  { id: "t_r1", route: "team", c: "haru", t: "「ユニット名で呼ばれるの、なんか照れるよな。\n……でも、うれしい。\n\n1人の名前より、ちょっと強くなった気がする」", ch: [
    { t: "「おれも」", fx: { aff: { haru: 8 }, st: { me: 3 } } } ] },
  { id: "t_r2", route: "team", c: "kai", t: "「キャプテンが一番しんどい。知ってる。\n\n……たまには、おれたちに頼れ。\n背負うだけがキャプテンじゃない」", ch: [
    { t: "「……頼らせてもらう」", fx: { aff: { kai: 10 }, stam: 20 } },
    { t: "「まだ、大丈夫」", fx: { st: { me: 5 }, aff: { kai: 4 } } } ] },
  { id: "t_r3", route: "team", c: "sora", t: "「シオンさんのチーム、朝6時から練習してるって……。\n\nうちも、やる？ ……ぼく、早起き得意」", ch: [
    { t: "「5時半にしよう」", fx: { aff: { sora: 10 }, st: { da: 3 }, stam: -10 } },
    { t: "「量より質で行く」", fx: { st: { me: 4 }, aff: { sora: 5 } } } ] },
  { id: "t_r4", route: "team", c: "tsukasa", t: "「キャプテン。ひとつ聞く。\n\nチームでいちばん下手なやつを、おまえはどう扱う？」", ch: [
    { t: "「いちばん時間をかける」", fx: { st: { me: 6 } } },
    { t: "「いちばんいいところで使う」", fx: { st: { tk: 4, ex: 3 } } } ] },
  { id: "t_r5", route: "team", c: "takuto", t: "「ユニットのグッズ、勝手に作っといた。\n……貝のキーホルダー。全員ぶん。\n\nえ、なんで貝かって？ 貝はいいぞ」", ch: [
    { t: "「つける」", fx: { aff: { takuto: 10 }, fans: 600 } },
    { t: "「なんで貝……」", fx: { aff: { takuto: 6 }, st: { tk: 3 } } } ] },
  { id: "t_r6", route: "team", c: "ren", t: "「……おまえのチーム、いい顔してるな。\n\n腹立つ」", ch: [
    { t: "「そっちもな」", fx: { aff: { ren: 8 }, st: { me: 4 } } } ] },

  { id: "d_r1", route: "duo", c: "shino", t: "「……ねえ、ぼくのノート、見る？\n間違えた問題、ぜんぶ書いてある。\n\n……恥ずかしいけど。相棒には、見せとく」", ch: [
    { t: "「見せて」", fx: { aff: { shino: 10 }, st: { me: 4 } } },
    { t: "「おれのも見せる」", fx: { aff: { shino: 12 }, st: { me: 3, tk: 2 } } } ] },
  { id: "d_r2", route: "duo", c: "hara", t: "「ちゃぼす！ おまえらいいコンビだな！\n\n……おれもペア欲しかったーー！！\nちょっとだけ混ぜて。3人組でもいいだろ？」", ch: [
    { t: "「今日だけな」", fx: { aff: { hara: 10 }, cond: 1 } },
    { t: "「デュオなんで（笑）」", fx: { aff: { hara: 6 }, st: { tk: 3 } } } ] },
  { id: "d_r3", route: "duo", c: "ren", t: "「デュオ、か。\n……ひとりで戦えないやつのための制度だと思ってた。\n\n……おまえら見てると、ちょっと違うみたいだな」", ch: [
    { t: "「2人のほうが、強い」", fx: { st: { me: 5 }, aff: { ren: 5 } } } ] },
  { id: "d_r4", route: "duo", c: "shino", t: "「……{name}のミス、気づいた？\n最後の1問、単位を書き忘れてた。\n\n……ぼくが見てるから、大丈夫。\nでも、次は自分で気づいて」", ch: [
    { t: "「見当と、単位。……了解」", fx: { aff: { shino: 8 }, st: { me: 4 } } } ] },
  { id: "d_r5", route: "duo", c: "kanade", t: "「シノくんとのペア、どう？\n\n……あの子ね、ペアがきみだって聞いたとき、小さくガッツポーズしてたよ。\n本人には内緒ね」", ch: [
    { t: "（内緒にする）", fx: { aff: { shino: 8 }, st: { me: 3 }, cond: 1 } } ] },
  { id: "d_r6", route: "duo", c: "shino", t: "（シノが机で寝落ちしている。ノートの端に『{name}に聞くこと：3.14×17』と書いてある）\n\n「……ん。……53.38、だよね。……寝てない」", ch: [
    { t: "「寝てたよ。正解だけど」", fx: { aff: { shino: 10 }, st: { me: 3 } } },
    { t: "（そっと上着をかけた）", fx: { aff: { shino: 14 } } } ] },

  /* ---- 全ルート共通の新イベント 10本 ---- */
  { id: "n46", c: "shuto", t: "（深夜のコンビニ。シュウトが肉まんを2個持っている）\n\n「……1個、食う？ 内緒な。\nフマさんに見つかったら、2人とも走らされる」", ch: [
    { t: "食べる", fx: { stam: 18, aff: { shuto: 8 } } },
    { t: "「半分こしよう」", fx: { stam: 10, aff: { shuto: 12 } } } ] },
  { id: "n47", c: "noa", t: "（ノアが課題曲の歌詞を、ノートに何度も書き写している）\n\n「……歌詞はね、書くと、体に入るの。\n……{name}も、やってみる？」", ch: [
    { t: "書き写す", fx: { st: { vo: 4, me: 2 } } },
    { t: "「ノアの字、きれいだね」", fx: { aff: { noa: 9 } } } ] },
  { id: "n48", c: "tsukasa", t: "「抜き打ちだ。いまから1人ずつ、アカペラで16小節。\n準備時間なし。\n\n……本番は、いつも準備時間なしで来る」", ch: [
    { t: "一番手で行く", fx: { st: { vo: 5, me: 4 }, fans: 400 } },
    { t: "最後に回して、人の歌を聞く", fx: { st: { vo: 3, tk: 3 } } } ] },
  { id: "n49", c: "roi", t: "「あのピアスさ。……母さんにもらったやつだったんだ。\n\nでも、外した。\nアイドルになって、堂々とつけられる日まで」", ch: [
    { t: "「その日、絶対来る」", fx: { aff: { roi: 12 } } },
    { t: "「おれも、何か置いてきた」", fx: { st: { me: 5 }, aff: { roi: 7 } } } ] },
  { id: "n50", c: "masaki", t: "（マサキがカメラの前で盛大にスベった。空気が凍る）\n\n「……た、助けて」", ch: [
    { t: "「いまのは前フリだよな？」と拾う", fx: { st: { tk: 5 }, aff: { masaki: 12 }, fans: 500 } },
    { t: "一緒に凍る", fx: { aff: { masaki: 5 }, st: { me: 2 } } } ] },
  { id: "n51", c: "takuto", t: "（タクトが寝坊した。集合に10分遅刻）\n\n「……{name}、頼む。\nおれが先に来てトイレ行ってたことにしてくれ」", ch: [
    { t: "口裏を合わせる", fx: { aff: { takuto: 8 }, st: { tk: 2 } } },
    { t: "「正直に言おう。一緒に謝る」", fx: { aff: { takuto: 12 }, st: { me: 6 } } } ] },
  { id: "n52", c: "riku", t: "「密着スタッフからの質問ね。\n『自分を一言で表すと？』\n\n……即答で。考えたら負けだよ」", ch: [
    { t: "「計算機」", fx: { st: { tk: 3 }, fans: 300 } },
    { t: "「まだ、途中」", fx: { st: { me: 5 }, fans: 400 } },
    { t: "「シノの相棒」", fx: { aff: { shino: 8 }, fans: 200 } } ] },
  { id: "n53", c: "shion", t: "（雨の日の屋上。シオンが1人で歌っていた。\n……ダンスの人だと思っていた）\n\n「……聞いてた？\n……誰にも言うな」", ch: [
    { t: "「言わない。でも、もっと聞きたい」", fx: { aff: { shion: 14 } } },
    { t: "黙って、となりに座る", fx: { aff: { shion: 10 }, st: { me: 4 } } } ] },
  { id: "n54", c: "daigo", t: "「兄ちゃん、ツッコミの練習しよか。ボケるから、ツッコんで。\n\n……『昨日、3.14を314回書いてん』」", ch: [
    { t: "「多いわ！」", fx: { st: { tk: 5 }, aff: { daigo: 10 }, cond: 1 } },
    { t: "「円周率愛が強すぎる」", fx: { st: { tk: 3 }, aff: { daigo: 8 }, fans: 300 } } ] },
  { id: "n55", c: "yuma", t: "「筋トレしようぜ。体幹ないと、ダンスも歌も、最後に崩れる。\n\n……腕立て、何回いける？」", ch: [
    { t: "限界までやる", fx: { stam: -15, st: { da: 4, me: 4 }, aff: { yuma: 10 } } },
    { t: "「明日から本気出す」", fx: { aff: { yuma: 3 }, stam: 5 } } ] },
);

/* ---------- ルート称号 ---------- */
TITLES.push(
  { id: "t_wild",  e: "🌑", n: "地下からの逆転",   d: "敗者復活編でデビュー",       chk: () => ((DB.meta.routeClears || {}).wild || 0) >= 1 },
  { id: "t_team",  e: "🛡", n: "勝たせるキャプテン", d: "ユニット対抗編でデビュー",   chk: () => ((DB.meta.routeClears || {}).team || 0) >= 1 },
  { id: "t_duo",   e: "🤝", n: "相棒",             d: "相棒編で2人そろってデビュー", chk: () => ((DB.meta.routeClears || {}).duoBoth || 0) >= 1 },
  { id: "t_route4", e: "🗺", n: "すべての物語",     d: "4つのルートすべてでデビュー", chk: () => ["normal", "wild", "team", "duo"].every(k => ((DB.meta.routeClears || {})[k] || 0) >= 1) },
);
