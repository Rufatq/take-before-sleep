// VACUUM LAYER 06 (Opus Gate 2 Upgraded):
// - Brass desk lamp hood in mid-value #8C6634 with crisp 2px bright rim catch
// - Counter paper card (THE singular #E8D5A8 hero mass alongside pills!) slides smoothly out from under
//   the steel tray lip over 10 frames ease-out, clearly separated below the 6px tray lip shadow
// - Exact 60fps Stamp Choreography:
//     f0..4: wind-up (+6px up, +3 deg tilt)
//     f5..9: accelerating strike travel (u^2, zero ease-out into contact)
//     f10: EXACT CONTACT -> vermilion seal prints + 1-frame inverted contact patch strictly around seal
//          + 7 uneven vermilion ink-spatter dots (NO thin UI ring!) + +8ms thud audio
//     f10..13: 4-frame hitstop; ONLY the paper card mesh shakes +-2px horizontally!
//     f14..20: recoil back to ink pad with 2px overshoot!

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dryChalkPoly, gouacheBristle, dipPenRibbon, Pt } from '../art/dryTools';
import { drawInkText } from '../art/calligraphy';
import { clamp, lerp, hash2 } from '../core/prng';

export const LAMP_HOOD_HIT = { x: 42, y: 278, w: 205, h: 165 };
export const GRACE_TIN_HIT = { x: 244, y: 552, w: 96, h: 66 };
export const SLATE_TRAY_RECT = { x: 644, y: 582, w: 266, h: 92 };
export const PAPER_WRAP_RECT = { x: 374, y: 590, w: 234, h: 112 }; // Clearly below tray lip shadow!
export const STAMP_HIT_RECT = { x: 152, y: 556, w: 84, h: 124 };

// Compute exact world-space circular brass hood mouth endpoints so Layer 07 lamp cone starts STRICTLY at mouth!
export function getLampMouthGeometry(st: GameState): {
  topX: number;
  topY: number;
  botX: number;
  botY: number;
  cx: number;
  cy: number;
  dirX: number;
  dirY: number;
  mouthHalf: number;
} {
  const pivotX = 130;
  const pivotY = 348;
  const aVal = st.lampAngle.value;
  const hoodRot = aVal <= 1 ? lerp(0.32, 0.64, clamp(aVal, 0, 1)) : lerp(0.64, -0.34, clamp(aVal - 1, 0, 1));
  const cos = Math.cos(hoodRot);
  const sin = Math.sin(hoodRot);
  const tx = (lx: number, ly: number) => ({
    x: pivotX + lx * cos - ly * sin,
    y: pivotY + lx * sin + ly * cos,
  });
  const top = tx(106, -8);
  const bot = tx(94, 42);
  const mid = tx(100, 17);
  return {
    topX: top.x,
    topY: top.y,
    botX: bot.x,
    botY: bot.y,
    cx: mid.x,
    cy: mid.y,
    dirX: cos,
    dirY: sin,
    mouthHalf: Math.hypot(bot.x - top.x, bot.y - top.y) * 0.5,
  };
}

export function renderLayer06Counter(ctx: CanvasRenderingContext2D, st: GameState): void {
  const boil = st.boilTick;

  // ------------------------------------------------------------
  // 1. ARTICULATED BRASS DESK LAMP (Mid-Value Brass #8C6634 + Crisp 2px Rim!)
  // ------------------------------------------------------------
  const clampX = 86;
  const clampY = 636;
  const elbowX = 48;
  const elbowY = 472;
  const wristX = 122;
  const wristY = 342;

  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.84);
  ctx.beginPath();
  ctx.ellipse(clampX + 10, clampY + 14, 62, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  dryChalkPoly(
    ctx,
    [
      { x: clampX - 42, y: clampY + 12 },
      { x: clampX + 46, y: clampY + 12 },
      { x: clampX + 36, y: clampY - 22 },
      { x: clampX - 32, y: clampY - 22 },
    ],
    PALETTE.brassDark,
    { underpaint: PALETTE.velvetDark, pressure: 0.92, peek: 0.28, edgeRough: 0.8, boilSeed: boil + 1 }
  );

  dipPenRibbon(
    ctx,
    [
      { x: clampX - 6, y: clampY - 20 },
      { x: elbowX - 4, y: elbowY },
      { x: wristX, y: wristY },
    ],
    7.4,
    PALETTE.brassDark,
    { taperMode: 'arch', jitter: 0.5, seed: boil + 4 }
  );
  dipPenRibbon(
    ctx,
    [
      { x: clampX + 8, y: clampY - 20 },
      { x: elbowX + 10, y: elbowY + 4 },
      { x: wristX + 6, y: wristY + 8 },
    ],
    4.2,
    PALETTE.brassMid,
    { taperMode: 'velocity', jitter: 0.4, seed: boil + 6 }
  );

  for (const [jx, jy] of [
    [elbowX + 2, elbowY + 2],
    [wristX + 2, wristY + 4],
  ]) {
    ctx.fillStyle = rgbCss(PALETTE.brassMid, 0.95);
    ctx.beginPath();
    ctx.arc(jx, jy, 8.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgbCss(PALETTE.velvetDark, 0.95);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Pivoting Brass Hood — kept strictly mid-value (#8C6634) with 2px bright rim catch (Gate 2!)
  const aVal = st.lampAngle.value;
  const hoodRot = aVal <= 1 ? lerp(0.32, 0.64, clamp(aVal, 0, 1)) : lerp(0.64, -0.34, clamp(aVal - 1, 0, 1));
  const lampHover = st.hoverZone === 'lamp';

  ctx.save();
  ctx.translate(wristX + 8, wristY + 6);
  ctx.rotate(hoodRot);

  const hoodPoly: Pt[] = [
    { x: -12, y: -18 },
    { x: 36, y: -28 },
    { x: 108, y: -8 },
    { x: 94, y: 42 },
    { x: -4, y: 24 },
  ];
  dryChalkPoly(ctx, hoodPoly, lampHover ? PALETTE.brassWarm : PALETTE.brassMid, {
    underpaint: PALETTE.brassDark,
    pressure: 0.92,
    peek: 0.34,
    edgeRough: 0.8,
    boilSeed: boil + 11,
  });

  // Warm inner hood mouth
  const bulbGlow = clamp(st.lampGlow.value, 0.06, 1.3);
  ctx.fillStyle = rgbCss(PALETTE.sodiumLamp, clamp(0.18 + bulbGlow * 0.72, 0.14, 0.92));
  ctx.beginPath();
  ctx.ellipse(98, 17, 10, 24, 0.24, 0, Math.PI * 2);
  ctx.fill();

  // Crisp 2px bright rim catch on hood crown & mouth edge (Opus Gate 2 lock!)
  ctx.strokeStyle = rgbCss(PALETTE.glassRim, 0.78);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(4, -20);
  ctx.lineTo(36, -26);
  ctx.lineTo(106, -8);
  ctx.stroke();

  dipPenRibbon(ctx, [...hoodPoly, hoodPoly[0]], 3.2, PALETTE.velvetDark, {
    taperMode: 'velocity',
    jitter: 0.6,
    seed: boil + 17,
  });
  ctx.restore();

  // ------------------------------------------------------------
  // 2. QUIET UNBILLED BRASS GRACE TIN (Mid-value matte brass; zero loud squint hotspot!)
  // ------------------------------------------------------------
  const tin = GRACE_TIN_HIT;
  const tinHover = st.hoverZone === 'grace';
  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.72);
  ctx.beginPath();
  ctx.ellipse(tin.x + tin.w * 0.52, tin.y + tin.h - 4, tin.w * 0.52, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  const tinPoly: Pt[] = [
    { x: tin.x + 8, y: tin.y + 18 },
    { x: tin.x + tin.w - 8, y: tin.y + 16 },
    { x: tin.x + tin.w - 2, y: tin.y + tin.h - 10 },
    { x: tin.x + 2, y: tin.y + tin.h - 8 },
  ];
  dryChalkPoly(ctx, tinPoly, tinHover ? PALETTE.brassMid : { r: 78, g: 58, b: 36 }, {
    underpaint: PALETTE.brassDark,
    pressure: 0.92,
    peek: 0.28,
    edgeRough: 0.7,
    boilSeed: boil + 21,
  });
  if (!st.graceTucked) {
    // Subdued aged cloth peeking inside tin so it doesn't compete in 3-value squint!
    dryChalkPoly(
      ctx,
      [
        { x: tin.x + 18, y: tin.y + 22 },
        { x: tin.x + tin.w - 18, y: tin.y + 20 },
        { x: tin.x + tin.w - 22, y: tin.y + 39 },
        { x: tin.x + 22, y: tin.y + 41 },
      ],
      PALETTE.amberLabel,
      { pressure: 0.90, peek: 0.16, edgeRough: 0.5, boilSeed: boil + 23 }
    );
  }
  dipPenRibbon(ctx, [...tinPoly, tinPoly[0]], 2.4, PALETTE.velvetDark, {
    taperMode: 'velocity',
    jitter: 0.5,
    seed: boil + 27,
  });

  // ------------------------------------------------------------
  // 3. GROOVED DARK-SLATE PILL CHANNEL + TUMBLING #E0D2B6 PILLS (Hero Light Mass!)
  // ------------------------------------------------------------
  const tr = SLATE_TRAY_RECT;
  const slatePoly: Pt[] = [
    { x: tr.x + 16, y: tr.y },
    { x: tr.x + tr.w - 8, y: tr.y - 6 },
    { x: tr.x + tr.w + 10, y: tr.y + tr.h - 4 },
    { x: tr.x - 10, y: tr.y + tr.h + 4 },
  ];
  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.78);
  ctx.beginPath();
  ctx.moveTo(tr.x - 4, tr.y + tr.h + 12);
  ctx.lineTo(tr.x + tr.w + 18, tr.y + tr.h + 4);
  ctx.lineTo(tr.x + tr.w + 10, tr.y + tr.h - 4);
  ctx.lineTo(tr.x - 10, tr.y + tr.h + 4);
  ctx.closePath();
  ctx.fill();

  dryChalkPoly(ctx, slatePoly, PALETTE.slateGroove, {
    underpaint: PALETTE.velvetDark,
    pressure: 0.92,
    peek: 0.24,
    edgeRough: 0.8,
    boilSeed: boil + 31,
  });

  const grooveY = tr.y + tr.h * 0.48;
  ctx.strokeStyle = rgbCss(PALETTE.velvetDark, 0.88);
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(tr.x + 22, grooveY + 2);
  ctx.lineTo(tr.x + tr.w - 18, grooveY - 4);
  ctx.stroke();

  gouacheBristle(ctx, tr.x + 20, tr.y + 6, tr.x + tr.w - 14, tr.y, 3.6, PALETTE.amberLabel, {
    bristles: 4,
    alpha: 0.36,
    deplete: 0.5,
    seed: boil + 33,
  });
  dipPenRibbon(ctx, [...slatePoly, slatePoly[0]], 2.8, PALETTE.velvetDark, {
    taperMode: 'velocity',
    jitter: 0.6,
    seed: boil + 35,
  });

  // Hero pills in #E0D2B6 bone tone
  for (const p of st.pills) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.72);
    ctx.beginPath();
    ctx.ellipse(3, 5, 13, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = rgbCss(PALETTE.bonePaper, 0.98);
    ctx.beginPath();
    ctx.ellipse(0, 0, 12.5, 8.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgbCss({ r: 146, g: 132, b: 112 }, 0.85);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.stroke();
    ctx.strokeStyle = rgbCss(PALETTE.velvetDark, 0.92);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12.5, 8.2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------
  // 4. COUNTER DISPENSING PAPER CARD (THE Singular #E8D5A8 Hero Mass!)
  //    - Slides smoothly out from under steel tray lip over 10 frames ease-out (st.paperSlide)
  //    - During f10..f13 hitstop, ONLY this card mesh shakes +-2px horizontally!
  // ------------------------------------------------------------
  const slideEase = 1 - Math.pow(1 - clamp(st.paperSlide, 0, 1), 3);
  if (st.script && slideEase > 0.02 && !st.packetInDrawer && !st.handedOver) {
    const wr = PAPER_WRAP_RECT;
    const fold = clamp(st.paperFoldSpring.value, 0, 1);
    const wrapHover = st.hoverZone === 'paper';
    const cardOffY = (1 - slideEase) * -46;
    const shakeX = st.stampChoreo.cardShakeX; // Strictly card-only +-2px horizontal shake!

    ctx.save();
    ctx.translate(shakeX, cardOffY);
    ctx.globalAlpha = clamp(slideEase * 1.4, 0, 1);

    const baseH = wr.h - fold * 18;
    ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.72);
    ctx.fillRect(wr.x + 7, wr.y + 9 + fold * 12, wr.w, baseH);

    const paperPoly: Pt[] = [
      { x: wr.x, y: wr.y + fold * 12 },
      { x: wr.x + wr.w, y: wr.y - 3 + fold * 12 },
      { x: wr.x + wr.w + 5, y: wr.y + baseH + fold * 12 },
      { x: wr.x - 5, y: wr.y + baseH + 3 + fold * 12 },
    ];
    dryChalkPoly(ctx, paperPoly, PALETTE.bonePaper, {
      underpaint: { r: 176, g: 162, b: 138 },
      pressure: 0.96,
      peek: 0.14,
      edgeRough: 0.7,
      boilSeed: boil + 41,
    });

    // Subtle folded unbilled grace cloth peeking cleanly inside the paper fold
    if (st.graceTucked) {
      const gx = wr.x + 24;
      const gy = wr.y + 44 + fold * 10;
      dryChalkPoly(
        ctx,
        [
          { x: gx, y: gy },
          { x: gx + 54, y: gy - 4 },
          { x: gx + 58, y: gy + 22 },
          { x: gx + 2, y: gy + 26 },
        ],
        { r: 204, g: 184, b: 146 },
        { underpaint: PALETTE.brassMid, pressure: 0.88, peek: 0.24, edgeRough: 0.5, boilSeed: boil + 43 }
      );
      dipPenRibbon(
        ctx,
        [
          { x: gx + 6, y: gy + 11 },
          { x: gx + 48, y: gy + 8 },
        ],
        1.3,
        PALETTE.underpaint,
        { taperMode: 'velocity', inkPool: false, jitter: 0.2, seed: boil + 44 }
      );
    }

    // Complete hand-calligraphed Rx lines directly on counter card (zero duplicate top-left UI clutter!)
    drawInkText(ctx, st.script.heading, wr.x + 16, wr.y + 14 + fold * 12, {
      size: 16.5,
      color: PALETTE.velvetDark,
      strokeWidth: 2.05,
      hand: st.script.hand,
      boilSeed: boil + 45,
    });
    drawInkText(ctx, st.script.doseLine, wr.x + 16, wr.y + 40 + fold * 12, {
      size: 12.5,
      color: PALETTE.velvetDark,
      strokeWidth: 1.55,
      hand: st.script.hand,
      boilSeed: boil + 46,
    });
    drawInkText(ctx, st.script.noteLine, wr.x + 16, wr.y + 62 + fold * 12, {
      size: 11.2,
      color: { r: 84, g: 66, b: 52 },
      strokeWidth: 1.4,
      hand: st.script.hand,
      boilSeed: boil + 47,
    });

    // Subtle ink pill-count dots on bottom-left corner of counter card
    for (let i = 0; i < st.script.pillsNeeded; i++) {
      const dx = wr.x + 18 + i * 16;
      const dy = wr.y + baseH - 12 + fold * 12;
      ctx.beginPath();
      ctx.arc(dx, dy, 3.8, 0, Math.PI * 2);
      if (i < st.pills.length) {
        ctx.fillStyle = rgbCss(PALETTE.waxStamp, 0.92);
        ctx.fill();
      } else {
        ctx.strokeStyle = rgbCss(PALETTE.velvetDark, 0.72);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
    }

    // Animated 1-drag folding envelope flap with crisp paper-thickness crease shadow!
    const flapTipY = lerp(wr.y - 16, wr.y + 68, fold);
    if (fold > 0.05) {
      const flapPoly: Pt[] = [
        { x: wr.x, y: wr.y + fold * 12 },
        { x: wr.x + wr.w, y: wr.y - 3 + fold * 12 },
        { x: wr.x + wr.w * 0.5, y: flapTipY },
      ];
      // Paper flap drop shadow onto lower sheet
      ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.22 * fold);
      ctx.beginPath();
      ctx.moveTo(wr.x + 2, wr.y + fold * 12 + 4);
      ctx.lineTo(wr.x + wr.w, wr.y - 3 + fold * 12 + 4);
      ctx.lineTo(wr.x + wr.w * 0.5, flapTipY + 6);
      ctx.closePath();
      ctx.fill();

      dryChalkPoly(ctx, flapPoly, { r: 210, g: 196, b: 168 }, {
        underpaint: { r: 158, g: 144, b: 118 },
        pressure: 0.95,
        peek: 0.16,
        edgeRough: 0.5,
        boilSeed: boil + 48,
      });
      dipPenRibbon(ctx, [...flapPoly, flapPoly[0]], 1.9, { r: 108, g: 94, b: 76 }, {
        taperMode: 'velocity',
        inkPool: false,
        jitter: 0.3,
        seed: boil + 49,
      });
    } else if (wrapHover && st.pills.length >= st.script.pillsNeeded) {
      dipPenRibbon(
        ctx,
        [
          { x: wr.x + wr.w - 28, y: wr.y - 2 },
          { x: wr.x + wr.w - 3, y: wr.y + 22 },
        ],
        2.0,
        PALETTE.underpaint,
        { taperMode: 'velocity', jitter: 0.25, seed: boil + 50 }
      );
    }

    // Vermilion 02:18 / 03:14 rubber stamp seal + 7 uneven ink-spatter dots (ONLY printed at f10 contact!)
    if (st.stamped) {
      const sx = wr.x + wr.w - 58;
      const sy = wr.y + 62;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(-0.11);

      // 1-Frame Inverted Contact Patch strictly around the seal ONLY on f10 (Opus Gate 2 lock!)
      if (st.stampChoreo.invertFlash) {
        ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.96);
        ctx.beginPath();
        ctx.ellipse(0, 0, 42, 34, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const sealCol = st.stampChoreo.invertFlash ? PALETTE.glassRim : PALETTE.waxStamp;
      ctx.strokeStyle = rgbCss(sealCol, 0.94);
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.ellipse(0, 0, 34, 27, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 21, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawInkText(ctx, st.stampTimeText, 0, -7, {
        size: 13.5,
        color: sealCol,
        strokeWidth: 2.1,
        align: 'center',
        boilSeed: boil + 51,
      });

      // 7 uneven vermilion ink-spatter droplets around seal (replaces UI selection ring per Opus Gate 2!)
      const spSeed = st.stampChoreo.spatterSeed;
      for (let d = 0; d < 7; d++) {
        const ang = (d / 7) * Math.PI * 2 + hash2(d, spSeed, 13) * 0.7;
        const rad = 35 + hash2(d, spSeed, 29) * 18;
        const dr = 1.1 + hash2(d, spSeed, 43) * 2.4;
        ctx.fillStyle = rgbCss(sealCol, 0.78);
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(ang) * rad,
          Math.sin(ang) * rad * 0.82,
          dr * (1 + hash2(d, spSeed, 61) * 0.6),
          dr,
          ang,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();
    }

    dipPenRibbon(ctx, [...paperPoly, paperPoly[0]], 2.6, PALETTE.velvetDark, {
      taperMode: 'velocity',
      jitter: 0.5,
      seed: boil + 53,
    });

    ctx.restore();
  }

  // ------------------------------------------------------------
  // 5. TURNED BRASS-HANDLED VERMILION RUBBER STAMP (EXACT 60FPS CHOREOGRAPHY!)
  //    f0..4: wind-up (+6px rise, +3 deg tilt)
  //    f5..9: accelerating strike travel (u^2, ZERO ease-out into f10 contact!)
  //    f10..13: 4-frame contact hitstop firmly pressed onto paper seal!
  //    f14..20: recoil back to ink pad with 2px overshoot!
  // ------------------------------------------------------------
  const padX = 156;
  const padY = 638;
  dryChalkPoly(
    ctx,
    [
      { x: padX - 10, y: padY + 14 },
      { x: padX + 74, y: padY + 12 },
      { x: padX + 78, y: padY + 42 },
      { x: padX - 14, y: padY + 44 },
    ],
    { r: 38, g: 34, b: 34 },
    { underpaint: PALETTE.velvetDark, pressure: 0.94, peek: 0.22, edgeRough: 0.7, boilSeed: boil + 61 }
  );
  dryChalkPoly(
    ctx,
    [
      { x: padX - 2, y: padY + 18 },
      { x: padX + 66, y: padY + 16 },
      { x: padX + 68, y: padY + 34 },
      { x: padX - 4, y: padY + 36 },
    ],
    PALETTE.waxStamp,
    { underpaint: { r: 88, g: 24, b: 18 }, pressure: 0.92, peek: 0.24, edgeRough: 0.5, boilSeed: boil + 63 }
  );

  const restCx = 194;
  const restCy = 634;
  const contactCx = PAPER_WRAP_RECT.x + PAPER_WRAP_RECT.w - 58;
  const contactCy = PAPER_WRAP_RECT.y + 46;

  let scx = restCx;
  let scy = restCy;
  let srot = -0.06;

  const ch = st.stampChoreo;
  if (ch.active && ch.frame >= 0) {
    const f = ch.frame;
    if (f <= 4) {
      // f0..4: wind-up — rising 6px and tilting 3 deg (+0.052 rad)
      const u = f / 4;
      scx = restCx - u * 4;
      scy = restCy - u * 6;
      srot = -0.06 - u * (3 * Math.PI / 180);
    } else if (f <= 9) {
      // f5..9: strike travel accelerating cleanly into contact with ZERO ease-out (u^2)!
      const u = (f - 4) / 6; // f5=1/6 .. f9=5/6 -> hits 1.0 dead-on at f10!
      const accel = u * u;
      scx = lerp(restCx - 4, contactCx, accel);
      scy = lerp(restCy - 6, contactCy, accel) - Math.sin(u * Math.PI) * 44;
      srot = lerp(-0.112, 0.02, accel);
    } else if (f <= 13) {
      // f10..13: 4-frame contact hitstop firmly seated on seal!
      scx = contactCx + ch.cardShakeX * 0.5;
      scy = contactCy + 3;
      srot = 0.02;
    } else {
      // f14..20: recoil back to ink pad with 2px overshoot at f18-19!
      const u = clamp((f - 13) / 7, 0, 1);
      const easeOut = 1 - Math.pow(1 - u, 2.4);
      const overshoot = Math.sin(u * Math.PI) * -2.2;
      scx = lerp(contactCx, restCx, easeOut) + overshoot;
      scy = lerp(contactCy, restCy, easeOut) - Math.sin(u * Math.PI) * 34;
      srot = lerp(0.02, -0.06, easeOut);
    }
  }

  const stampHover = st.hoverZone === 'stamp';
  ctx.save();
  ctx.translate(scx, scy);
  ctx.rotate(srot);

  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.72);
  ctx.beginPath();
  ctx.ellipse(4, 18, 28, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  dryChalkPoly(
    ctx,
    [
      { x: -24, y: 10 },
      { x: 24, y: 10 },
      { x: 22, y: 17 },
      { x: -22, y: 17 },
    ],
    PALETTE.waxStamp,
    { pressure: 0.96, peek: 0.14, edgeRough: 0.4, boilSeed: boil + 65 }
  );

  // Mid-value turned brass stamp handle (keeps focus cleanly on counter card in 3-value squint!)
  const handlePoly: Pt[] = [
    { x: -24, y: 10 },
    { x: 24, y: 10 },
    { x: 20, y: -4 },
    { x: 8, y: -18 },
    { x: 9, y: -44 },
    { x: 18, y: -62 },
    { x: 15, y: -82 },
    { x: 0, y: -92 },
    { x: -15, y: -82 },
    { x: -18, y: -62 },
    { x: -9, y: -44 },
    { x: -8, y: -18 },
    { x: -20, y: -4 },
  ];
  dryChalkPoly(ctx, handlePoly, stampHover ? PALETTE.brassWarm : PALETTE.brassMid, {
    underpaint: PALETTE.brassDark,
    pressure: 0.92,
    peek: 0.34,
    edgeRough: 0.7,
    boilSeed: boil + 67,
  });
  dryChalkPoly(
    ctx,
    [
      { x: -16, y: -64 },
      { x: 16, y: -64 },
      { x: 14, y: -82 },
      { x: 0, y: -91 },
      { x: -14, y: -82 },
    ],
    { r: 50, g: 30, b: 22 },
    { underpaint: PALETTE.velvetDark, pressure: 0.92, peek: 0.28, edgeRough: 0.5, boilSeed: boil + 69 }
  );
  gouacheBristle(ctx, -6, -80, -14, 6, 3.2, PALETTE.glassRim, {
    bristles: 3,
    alpha: 0.52,
    deplete: 0.45,
    seed: boil + 71,
  });
  dipPenRibbon(ctx, [...handlePoly, handlePoly[0]], 2.5, PALETTE.velvetDark, {
    taperMode: 'velocity',
    jitter: 0.5,
    seed: boil + 73,
  });

  ctx.restore();
}
