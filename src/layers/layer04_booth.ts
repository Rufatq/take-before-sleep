// VACUUM LAYER 04 (Opus Gate 2 Upgraded):
// - ZERO leaked full-frame black backdrop in Vacuum isolation (strictly architectural jambs, walnut counter slab, steel drawer!)
// - Counter underpainted in warm umber #3A2A1C dropping cleanly to #0B0A0E edges
// - Drawer Z-order: tray floor -> coins -> paper slip -> FRONT WALL OF STEEL LIP + 6px deep drop shadow separating counter card!

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dryChalkPoly, gouacheBristle, dipPenRibbon, Pt } from '../art/dryTools';
import { clamp } from '../core/prng';
import { HATCH_RECT } from './layer01_street';

export const DRAWER_HANDLE_RECT = { x: 424, y: 468, w: 432, h: 112 };
export const SHUTTER_LATCH_RECT = { x: 560, y: 12, w: 160, h: 32 };

export function renderLayer04Booth(ctx: CanvasRenderingContext2D, st: GameState, W: number, H: number): void {
  const { x, y, w, h } = HATCH_RECT;
  const boil = st.boilTick;
  const peek = st.dna.underpaintPeek;
  const sillY = y + h;

  ctx.save();

  // 1. Sculpted oak window jambs & booth pillars (NEVER an opaque full-frame fill over window hole!)
  // Left pillar
  dryChalkPoly(
    ctx,
    [
      { x: 0, y: 0 },
      { x: x, y: 0 },
      { x: x, y: sillY },
      { x: 0, y: sillY },
    ],
    PALETTE.velvetDark,
    { underpaint: PALETTE.counterUmber, pressure: 0.90, peek: peek * 0.56, edgeRough: 1.0, boilSeed: boil + 1 }
  );
  // Right pillar
  dryChalkPoly(
    ctx,
    [
      { x: x + w, y: 0 },
      { x: W, y: 0 },
      { x: W, y: sillY },
      { x: x + w, y: sillY },
    ],
    PALETTE.velvetDark,
    { underpaint: PALETTE.counterUmber, pressure: 0.92, peek: peek * 0.48, edgeRough: 1.0, boilSeed: boil + 3 }
  );
  // Top oak lintel
  dryChalkPoly(
    ctx,
    [
      { x: 0, y: 0 },
      { x: W, y: 0 },
      { x: W, y: y },
      { x: 0, y: y },
    ],
    PALETTE.velvetDark,
    { underpaint: PALETTE.counterUmber, pressure: 0.94, peek: peek * 0.36, edgeRough: 0.8, boilSeed: boil + 5 }
  );
  // Subtle wood molding grooves along inner jambs so Layer 04 reads richly solo on 50% gray
  gouacheBristle(ctx, x - 18, y + 6, x - 18, sillY - 4, 4.0, PALETTE.counterUmber, {
    bristles: 4,
    alpha: 0.48,
    deplete: 0.5,
    seed: boil + 6,
  });
  gouacheBristle(ctx, x + w + 18, y + 6, x + w + 18, sillY - 4, 4.0, PALETTE.counterUmber, {
    bristles: 4,
    alpha: 0.44,
    deplete: 0.5,
    seed: boil + 7,
  });

  // 2. Dark Walnut Dispensing Counter Slab underpainted in #3A2A1C (Opus Gate 2 lock!)
  dryChalkPoly(
    ctx,
    [
      { x: 0, y: sillY },
      { x: W, y: sillY },
      { x: W, y: H },
      { x: 0, y: H },
    ],
    { r: 16, g: 13, b: 14 },
    { underpaint: PALETTE.counterUmber, pressure: 0.86, peek: peek * 0.68, edgeRough: 1.0, boilSeed: boil + 9 }
  );

  // Subtle horizontal walnut woodgrain streaks
  for (let i = 0; i < 6; i++) {
    const gy = sillY + 18 + i * 38;
    gouacheBristle(ctx, 24, gy, W - 24, gy + (i % 2 === 0 ? 3 : -2), 5.0, PALETTE.counterUmber, {
      bristles: 6,
      alpha: 0.36,
      deplete: 0.5,
      seed: boil + 20 + i,
    });
  }

  // Deep side edge anchors dropping cleanly to true #0B0A0E corners
  const cornerGradL = ctx.createLinearGradient(0, 0, 210, 0);
  cornerGradL.addColorStop(0, rgbCss(PALETTE.velvetDark, 0.94));
  cornerGradL.addColorStop(1, rgbCss(PALETTE.velvetDark, 0));
  ctx.fillStyle = cornerGradL;
  ctx.fillRect(0, sillY, 210, H - sillY);

  const cornerGradR = ctx.createLinearGradient(W, 0, W - 210, 0);
  cornerGradR.addColorStop(0, rgbCss(PALETTE.velvetDark, 0.94));
  cornerGradR.addColorStop(1, rgbCss(PALETTE.velvetDark, 0));
  ctx.fillStyle = cornerGradR;
  ctx.fillRect(W - 210, sillY, 210, H - sillY);

  // Window perimeter dip-pen framing (0.6px 12fps vertex wobble)
  dipPenRibbon(
    ctx,
    [
      { x: x, y: y },
      { x: x + w, y: y },
      { x: x + w, y: sillY },
      { x: x, y: sillY },
      { x: x, y: y },
    ],
    5.0,
    PALETTE.velvetDark,
    { taperMode: 'arch', jitter: 0.6, seed: boil + 13 }
  );

  // Top shutter brass pull-handle
  const latchHover = st.hoverZone === 'shutter';
  const latchBright = st.beat === 'night1_dawn_latch' || latchHover;
  dryChalkPoly(
    ctx,
    [
      { x: SHUTTER_LATCH_RECT.x + 18, y: 16 },
      { x: SHUTTER_LATCH_RECT.x + SHUTTER_LATCH_RECT.w - 18, y: 16 },
      { x: SHUTTER_LATCH_RECT.x + SHUTTER_LATCH_RECT.w - 10, y: 36 },
      { x: SHUTTER_LATCH_RECT.x + 10, y: 36 },
    ],
    latchBright ? PALETTE.brassWarm : PALETTE.brassDark,
    { pressure: 0.9, peek: 0.25, edgeRough: 0.7, boilSeed: boil + 14 }
  );
  dipPenRibbon(
    ctx,
    [
      { x: SHUTTER_LATCH_RECT.x + 14, y: 26 },
      { x: SHUTTER_LATCH_RECT.x + SHUTTER_LATCH_RECT.w - 14, y: 26 },
    ],
    3.4,
    PALETTE.velvetDark,
    { taperMode: 'velocity', jitter: 0.5, seed: boil + 16 }
  );

  // ------------------------------------------------------------
  // 3. INTERLOCKING STEEL DURCHREICHE DRAWER (STRICT GATE 2 Z-STRATA!)
  // Order: (a) Tray Floor -> (b) Coins & Inner Slip -> (c) Front Steel Lip Wall -> (d) 6px Deep Drop Shadow!
  // ------------------------------------------------------------
  const slide = clamp(st.drawerPos.value, 0, 1.08);
  const pullY = slide * 52; // Compact clean pull so tray never crowds lower counter card!
  const pullExpand = slide * 24;

  const trayTopY = sillY + 4;
  const trayBotY = sillY + 52 + pullY;
  const topLeftX = 446;
  const topRightX = 834;
  const botLeftX = 420 - pullExpand;
  const botRightX = 860 + pullExpand;

  // Airlock recess slit under sill
  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.96);
  ctx.fillRect(topLeftX - 10, trayTopY - 2, topRightX - topLeftX + 20, 22);

  // (a) Brushed Steel Tray Floor
  const trayPoly: Pt[] = [
    { x: topLeftX, y: trayTopY },
    { x: topRightX, y: trayTopY },
    { x: botRightX, y: trayBotY },
    { x: botLeftX, y: trayBotY },
  ];
  dryChalkPoly(ctx, trayPoly, PALETTE.steelDrawer, {
    underpaint: { r: 30, g: 36, b: 44 },
    pressure: 0.90,
    peek: 0.30,
    edgeRough: 0.8,
    boilSeed: boil + 31,
  });

  // Inner recessed back wall shadow
  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.56);
  ctx.beginPath();
  ctx.moveTo(topLeftX + 8, trayTopY + 5);
  ctx.lineTo(topRightX - 8, trayTopY + 5);
  ctx.lineTo(topRightX - 14, trayTopY + 20);
  ctx.lineTo(topLeftX + 14, trayTopY + 20);
  ctx.closePath();
  ctx.fill();

  // (b) Coins & Inner Slip / Dispensed Packet resting INSIDE the tray floor
  if (st.script && !st.handedOver) {
    const trayCx = (botLeftX + botRightX) * 0.5;
    const trayCy = (trayTopY + trayBotY) * 0.50;

    // Visitor coins on left side of tray
    const coinX = trayCx - 134;
    const coinY = trayCy + 4;
    const pairs = st.script.coinPairs;
    for (let p = 0; p < pairs; p++) {
      for (let c = 0; c < 2; c++) {
        const cx = coinX + p * 26 + c * 10;
        const cy = coinY + c * 5 - p * 3;
        ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.72);
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy + 3, 8.8, 5.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgbCss(p === 0 ? PALETTE.brassMid : { r: 148, g: 140, b: 126 }, 0.94);
        ctx.beginPath();
        ctx.ellipse(cx, cy, 8.2, 4.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgbCss(PALETTE.velvetDark, 0.85);
        ctx.lineWidth = 1.3;
        ctx.stroke();
      }
    }

    // Inner slip ONLY visible before counter card slides out (eliminates blob merging in squint!)
    if (!st.packetInDrawer && st.paperSlide < 0.7) {
      const slipA = clamp(1 - st.paperSlide * 1.4, 0, 1);
      ctx.save();
      ctx.globalAlpha = slipA;
      const sx = trayCx - 54;
      const sy = trayCy - 18 + st.paperSlide * 26;
      dryChalkPoly(
        ctx,
        [
          { x: sx, y: sy },
          { x: sx + 140, y: sy - 2 },
          { x: sx + 144, y: sy + 36 },
          { x: sx - 4, y: sy + 38 },
        ],
        PALETTE.amberLabel, // Aged subdued tone inside dark steel recess so it never merges with bright hero card!
        { pressure: 0.92, peek: 0.16, edgeRough: 0.6, boilSeed: boil + 53 }
      );
      ctx.restore();
    } else if (st.packetInDrawer) {
      // Folded & stamped waxed packet placed inside steel tray ready to slide out
      const px = trayCx - 54;
      const py = trayCy - 20;
      dryChalkPoly(
        ctx,
        [
          { x: px, y: py },
          { x: px + 132, y: py - 2 },
          { x: px + 136, y: py + 44 },
          { x: px - 4, y: py + 46 },
        ],
        PALETTE.bonePaper,
        { pressure: 0.95, peek: 0.14, edgeRough: 0.7, boilSeed: boil + 61 }
      );
      dipPenRibbon(
        ctx,
        [
          { x: px, y: py },
          { x: px + 66, y: py + 22 },
          { x: px + 132, y: py - 2 },
        ],
        2.0,
        { r: 124, g: 112, b: 94 },
        { taperMode: 'velocity', inkPool: false, jitter: 0.25, seed: boil + 63 }
      );
      ctx.strokeStyle = rgbCss(PALETTE.waxStamp, 0.92);
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(px + 96, py + 26, 12, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // (c) Front Wall of Steel Lip drawn cleanly OVER drawer contents (Gate 2 Z-strata lock!)
  const lipH = 14;
  dryChalkPoly(
    ctx,
    [
      { x: botLeftX, y: trayBotY - 4 },
      { x: botRightX, y: trayBotY - 4 },
      { x: botRightX + 2, y: trayBotY + lipH },
      { x: botLeftX - 2, y: trayBotY + lipH },
    ],
    { r: 58, g: 64, b: 72 },
    { underpaint: PALETTE.velvetDark, pressure: 0.94, peek: 0.22, edgeRough: 0.6, boilSeed: boil + 34 }
  );

  const drawerHover = st.hoverZone === 'drawer';
  gouacheBristle(
    ctx,
    botLeftX + 8,
    trayBotY - 2,
    botRightX - 8,
    trayBotY - 2,
    4.5,
    drawerHover ? PALETTE.sodiumLamp : PALETTE.glassRim,
    { bristles: 6, alpha: drawerHover ? 0.74 : 0.42, deplete: 0.35, seed: boil + 35 }
  );

  // (d) Crisp 6px Deep Shadow directly under front steel tray lip separating drawer from counter card! (Gate 2!)
  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.95);
  ctx.fillRect(botLeftX - 6, trayBotY + lipH, botRightX - botLeftX + 12, 7);

  // Heavy tubular steel pull bar mounted cleanly on front wall
  const barY = trayBotY + 8;
  dipPenRibbon(
    ctx,
    [
      { x: (botLeftX + botRightX) * 0.5 - 74, y: barY },
      { x: (botLeftX + botRightX) * 0.5 + 74, y: barY },
    ],
    7.2,
    { r: 44, g: 49, b: 56 },
    { taperMode: 'arch', jitter: 0.3, seed: boil + 39 }
  );
  gouacheBristle(
    ctx,
    (botLeftX + botRightX) * 0.5 - 64,
    barY - 2,
    (botLeftX + botRightX) * 0.5 + 64,
    barY - 2,
    2.2,
    drawerHover ? PALETTE.sodiumLamp : PALETTE.amberLabel,
    { bristles: 3, alpha: 0.72, deplete: 0.4, seed: boil + 41 }
  );

  dipPenRibbon(ctx, [...trayPoly, trayPoly[0]], 3.4, PALETTE.velvetDark, {
    taperMode: 'velocity',
    jitter: 0.5,
    seed: boil + 45,
  });

  ctx.restore();
}
