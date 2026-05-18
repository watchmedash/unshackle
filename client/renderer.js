/* global PIXI */
function createRenderer(app) {

  // ── Background ──────────────────────────────────────────────────────────
  const bg = new PIXI.Graphics();
  bg.beginFill(0xC8EEFF);
  bg.drawRect(0, 0, 1080, 1920);
  bg.endFill();
  app.stage.addChild(bg);

  const ballLayer = new PIXI.Container();
  app.stage.addChild(ballLayer);

  const sprites = new Map();

  // ── Hash helper ──────────────────────────────────────────────────────────
  function uHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return Math.abs(h);
  }

  // ── Cartoon saw blade ────────────────────────────────────────────────────
  // rank: 1 = #1, 2 = top 3, 3 = top 10, 0 = everyone else
  const BLADE_COLORS = [
    { disc: 0xFFCC00, tooth: 0xFF9900 }, // default — yellow
    { disc: 0xFF2222, tooth: 0xFF6600 }, // top 10  — red/orange
    { disc: 0xBB44FF, tooth: 0xFF44CC }, // top 3   — purple/pink
    { disc: 0x111111, tooth: 0x444444 }, // #1      — black
  ];

  // rank 0 = none, 1 = top10 orange, 2 = top3 purple, 3 = #1 black
  const AURA_COLORS = [0x000000, 0xFF6600, 0xCC00FF, 0x111111];

  function buildSawBlade(g, r, score, rank) {
    g.clear();
    const t = Math.min((score || 0) / 300, 1);

    const innerR = r + 2;
    const discR  = innerR + 6 + t * 12;
    const toothH = 5 + t * 7;
    const count  = Math.round(14 + t * 8);

    const { disc: discFill, tooth: toothFill } = BLADE_COLORS[rank] || BLADE_COLORS[0];
    const outline = 0x333333;

    // Disc donut with dark cartoon outline
    g.lineStyle(1.5, outline, 1);
    g.beginFill(discFill, 1);
    g.drawCircle(0, 0, discR);
    g.beginHole();
    g.drawCircle(0, 0, innerR);
    g.endHole();
    g.endFill();
    g.lineStyle(0);

    // Teeth
    for (let i = 0; i < count; i++) {
      const a0   = (i / count) * Math.PI * 2;
      const a1   = ((i + 1) / count) * Math.PI * 2;
      const span = a1 - a0;

      const trailA = a0 + span * 0.12;
      const leadA  = a1 - span * 0.12;
      const tipA   = a0 + span * 0.35;
      const tipR   = discR + toothH;

      const r0x = Math.cos(trailA) * discR, r0y = Math.sin(trailA) * discR;
      const r1x = Math.cos(leadA)  * discR, r1y = Math.sin(leadA)  * discR;
      const tx  = Math.cos(tipA)   * tipR,  ty  = Math.sin(tipA)   * tipR;

      g.lineStyle(1, outline, 1);
      g.beginFill(toothFill, 1);
      g.drawPolygon([r0x, r0y, tx, ty, r1x, r1y]);
      g.endFill();
      g.lineStyle(0);
    }
  }

  // ── Aura — animated spiky energy, redrawn every frame ────────────────────
  function drawAura(g, r, rank, now, hash) {
    g.clear();
    if (rank === 0) return;
    const color    = AURA_COLORS[rank];
    const spikes   = 8 + rank * 4;            // 12 / 16 / 20 spikes
    const innerR   = r + 6;
    const outerR   = r + 22 + rank * 12;
    const rotation = now * 0.0008 * rank;      // slow outward rotation per rank

    for (let layer = 3; layer >= 1; layer--) {
      const scale = 0.5 + layer * 0.18;
      const alpha = layer === 3 ? 0.18 : layer === 2 ? 0.38 : 0.65;
      const pts   = [];
      const total = spikes * 2;

      for (let i = 0; i < total; i++) {
        const angle   = (i / total) * Math.PI * 2 + rotation * layer;
        const isOuter = i % 2 === 0;
        const flutter = isOuter
          ? Math.sin(now * 0.006 * layer + i * 1.7 + hash) * 0.35 + 0.65
          : 1;
        const rad = isOuter ? outerR * scale * flutter : innerR * scale;
        pts.push(Math.cos(angle) * rad, Math.sin(angle) * rad);
      }

      g.beginFill(color, alpha);
      g.drawPolygon(pts);
      g.endFill();
    }
  }

  // ── HP arc ring ──────────────────────────────────────────────────────────
  function buildHpRing(g, r, hp, maxHp) {
    g.clear();
    const ringR = r + 1;
    g.lineStyle(3, 0x555555, 0.3);
    g.drawCircle(0, 0, ringR);
    if (hp > 0) {
      const ratio   = hp / (maxHp || 100);
      const hpColor = ratio > 0.6 ? 0x44dd44 : ratio > 0.3 ? 0xffbb00 : 0xff3300;
      const start   = -Math.PI / 2;
      g.lineStyle(3, hpColor, 1);
      g.moveTo(Math.cos(start) * ringR, Math.sin(start) * ringR);
      g.arc(0, 0, ringR, start, start + Math.PI * 2 * ratio);
    }
  }

  // ── Sprite factory ───────────────────────────────────────────────────────
  function getOrCreate(ball) {
    const { u, dn, c, r, av } = ball;
    if (sprites.has(u)) return sprites.get(u);

    const container = new PIXI.Container();

    // 1 — saw blade wrapper (behind ball, spins)
    const bladeContainer = new PIXI.Container();
    const bladeGfx = new PIXI.Graphics();
    buildSawBlade(bladeGfx, r, ball.s || 0);
    bladeContainer.addChild(bladeGfx);
    bladeContainer.cacheAsBitmap = true;
    container.addChild(bladeContainer);

    // 2 — aura (behind fill, rank-based)
    const aura = new PIXI.Graphics();
    container.addChild(aura);

    // 3 — solid color fill with cartoon outline
    const fill = new PIXI.Graphics();
    fill.lineStyle(3, 0x333333, 1);
    fill.beginFill(c); fill.drawCircle(0, 0, r); fill.endFill();
    container.addChild(fill);

    // 3 — profile picture (optional)
    let avatar = null, avatarMask = null;
    if (av) {
      avatarMask = new PIXI.Graphics();
      avatarMask.beginFill(0xffffff); avatarMask.drawCircle(0, 0, r - 1); avatarMask.endFill();
      avatar = PIXI.Sprite.from('/api/avatar?url=' + encodeURIComponent(av));
      avatar.width = (r - 1) * 2; avatar.height = (r - 1) * 2;
      avatar.anchor.set(0.5);
      avatar.mask = avatarMask;
      container.addChild(avatarMask);
      container.addChild(avatar);
    }

    // 4 — HP arc ring
    const hpRing = new PIXI.Graphics();
    buildHpRing(hpRing, r, 100, 100);
    container.addChild(hpRing);

    // 5 — display name
    const label = new PIXI.Text(dn || u, {
      fontSize: 20, fill: 0xffffff,
      fontWeight: 'bold', fontFamily: 'Arial Rounded MT Bold, Arial Black, Arial, sans-serif',
      stroke: 0x222222, strokeThickness: 5,
    });
    label.anchor.set(0.5, 0);
    label.y = r + 14;
    container.addChild(label);

    ballLayer.addChild(container);

    sprites.set(u, {
      container, bladeContainer, bladeGfx,
      aura, fill, avatarMask, avatar, hpRing, label,
      _r: r, _hp: 100, _mhp: 100, _dn: dn || u, _labelRank: -1,
      _bladeTier: -1, _bladeRank: -1,
      _flashTimer: 0,
    });
    return sprites.get(u);
  }

  // ── Stale cleanup ────────────────────────────────────────────────────────
  function removeStaleBalls(activeBalls) {
    const active = new Set(activeBalls.map(b => b.u));
    for (const [u, s] of sprites) {
      if (!active.has(u)) { s.container.destroy({ children: true }); sprites.delete(u); }
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // ── Main render ──────────────────────────────────────────────────────────
  function render(prevSnap, currSnap, alpha) {
    if (!currSnap) return;
    const balls = currSnap.balls || [];
    const now   = performance.now();

    const prevMap = new Map();
    if (prevSnap) for (const b of prevSnap.balls || []) prevMap.set(b.u, b);

    removeStaleBalls(balls);

    // Build rank maps from score order
    const sorted = balls.slice().sort((a, b) => (b.s || 0) - (a.s || 0));
    const posMap  = new Map(); // username → position (1-based)
    const rankMap = new Map(); // username → tier (0-3)
    sorted.forEach((b, i) => {
      posMap.set(b.u, i + 1);
      rankMap.set(b.u, i === 0 ? 3 : i < 3 ? 2 : i < 10 ? 1 : 0);
    });

    for (const ball of balls) {
      const prev = prevMap.get(ball.u);
      const x = prev ? lerp(prev.x, ball.x, alpha) : ball.x;
      const y = prev ? lerp(prev.y, ball.y, alpha) : ball.y;

      const s           = getOrCreate(ball);
      s.container.x     = x;
      s.container.y     = y;

      const hash      = uHash(ball.u);
      const score     = ball.s || 0;
      const bladeTier = Math.floor(score / 60);
      const bladeRank = rankMap.get(ball.u) ?? 0;

      // ── Saw blade spin ──
      const spinRate = bladeRank === 3 ? 0.005 : bladeRank === 2 ? 0.0035 : bladeRank === 1 ? 0.0025 : 0.0015;
      s.bladeContainer.rotation = (now * spinRate + hash * 0.001) % (Math.PI * 2);

      if (bladeTier !== s._bladeTier || bladeRank !== s._bladeRank) {
        s._bladeTier  = bladeTier;
        s._bladeRank  = bladeRank;
        s.bladeContainer.cacheAsBitmap = false;
        buildSawBlade(s.bladeGfx, ball.r, score, bladeRank);
        s.bladeContainer.cacheAsBitmap = true;
      }

      // ── Aura — redrawn every frame for animation ──
      drawAura(s.aura, ball.r, bladeRank, now, hash);

      // ── Display name / rank label update ──
      const dn  = ball.dn || ball.u;
      const pos = posMap.get(ball.u) || 0;
      const rankLabel = pos <= 10 ? `#${pos} ${dn}` : dn;
      if (s._dn !== dn || s._labelRank !== pos) {
        s._dn = dn; s._labelRank = pos;
        s.label.text = rankLabel;
      }

      // ── Avatar added retroactively ──
      if (!s.avatar && ball.av) {
        const inner = ball.r - 1;
        const am = new PIXI.Graphics();
        am.beginFill(0xffffff); am.drawCircle(0, 0, inner); am.endFill();
        const av = PIXI.Sprite.from('/api/avatar?url=' + encodeURIComponent(ball.av));
        av.width = inner * 2; av.height = inner * 2; av.anchor.set(0.5); av.mask = am;
        const ri = s.container.children.indexOf(s.hpRing);
        s.container.addChildAt(am, ri);
        s.container.addChildAt(av, ri + 1);
        s.avatar = av; s.avatarMask = am;
      }

      // ── Radius change ──
      if (s._r !== ball.r) {
        s._r = ball.r;
        s.fill.clear();
        s.fill.lineStyle(3, 0x333333, 1);
        s.fill.beginFill(ball.c); s.fill.drawCircle(0, 0, ball.r); s.fill.endFill();
        if (s.avatar) {
          const inner = ball.r - 1;
          s.avatar.width = inner * 2; s.avatar.height = inner * 2;
          s.avatarMask.clear();
          s.avatarMask.beginFill(0xffffff); s.avatarMask.drawCircle(0, 0, inner); s.avatarMask.endFill();
        }
        buildHpRing(s.hpRing, ball.r, ball.hp, ball.mhp);
        s.bladeContainer.cacheAsBitmap = false;
        buildSawBlade(s.bladeGfx, ball.r, score, bladeRank);
        s.bladeContainer.cacheAsBitmap = true;
        s.label.y = ball.r + 14;
      }

      // ── HP change ──
      if (s._hp !== ball.hp || s._mhp !== ball.mhp) {
        if (s._hp > ball.hp && s._hp >= 0) {
          s.fill.tint   = 0xff6666;
          s._flashTimer = 7;
        }
        s._hp  = ball.hp;
        s._mhp = ball.mhp;
        buildHpRing(s.hpRing, ball.r, ball.hp, ball.mhp);
      }

      if (s._flashTimer > 0) {
        s._flashTimer--;
        if (s._flashTimer === 0) s.fill.tint = 0xffffff;
      }

    }
  }

  return { render };
}
