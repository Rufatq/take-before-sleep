// VACUUM LAYER 02 (Opus Gate 2 Upgraded):
// - Backlit #0B0A0E hooded silhouette cutting cleanly against Layer 01's #34404C mist halo
// - NO pentagon face! Organic 10-vertex three-quarter turned face with uneven jaw, eyes buried in hood shadow,
//   and ONLY ONE sodium-lit cheek sliver (#C89048 at 40%)
// - Attached hand with overlapping cuff polygon + 4 knuckle notches + 1 tiny wet highlight dot
// - Rim streaks redrawn as tapered strokes w0*(1-s)^1.35 hugging the exact coat outline, broken into 2-3 pieces!

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dryChalkPoly, dipPenRibbon, Pt } from '../art/dryTools';
import { clamp, smoothstep } from '../core/prng';
import { HATCH_RECT } from './layer01_street';

export function renderLayer02Visitor(ctx: CanvasRenderingContext2D, st: GameState): void {
  const pres = clamp(st.visitorPresence.value, 0, 1);
  if (pres <= 0.02 || st.visitor === 'none') return;

  const { x, y, w, h } = HATCH_RECT;
  const boil = st.boilTick;
  const breath = Math.sin(boil * 0.42) * 2.8;
  const walkShift = (1 - pres) * 145;
  const cx = x + w * 0.44 - walkShift;
  const baseY = y + h + 8;

  const curbMix = smoothstep(1.2, 2.0, st.lampAngle.value);
  const dimMix = 1 - Math.min(1, Math.abs(st.lampAngle.value - 1));
  const rimGain = 0.56 + dimMix * 0.28 + curbMix * 0.42;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.globalAlpha = smoothstep(0.02, 0.35, pres);

  if (st.visitor === 'maren') {
    const shoulderY = y + 234 + breath;
    const headY = y + 148 + breath * 1.1;

    // 1. Deep #0B0A0E hunched wool coat silhouette (cuts crisply off #34404C backlight!)
    const coat: Pt[] = [
      { x: cx - 138, y: baseY },
      { x: cx - 126, y: shoulderY + 38 },
      { x: cx - 92, y: shoulderY + 6 },
      { x: cx - 54, y: shoulderY - 8 },
      { x: cx + 48, y: shoulderY - 6 },
      { x: cx + 96, y: shoulderY + 14 },
      { x: cx + 122, y: shoulderY + 56 },
      { x: cx + 130, y: baseY },
    ];
    dryChalkPoly(ctx, coat, PALETTE.velvetDark, {
      underpaint: { r: 22, g: 18, b: 22 },
      pressure: 0.96,
      peek: 0.22,
      edgeRough: 0.9,
      boilSeed: boil + 3,
    });

    // Knotted damp wool head-scarf & shawl fold
    const scarf: Pt[] = [
      { x: cx - 64, y: shoulderY - 6 },
      { x: cx + 44, y: shoulderY - 6 },
      { x: cx + 68, y: shoulderY + 36 },
      { x: cx + 16, y: shoulderY + 52 },
      { x: cx - 38, y: shoulderY + 44 },
      { x: cx - 72, y: shoulderY + 20 },
    ];
    dryChalkPoly(ctx, scarf, { r: 26, g: 20, b: 22 }, {
      underpaint: { r: 52, g: 32, b: 26 },
      pressure: 0.92,
      peek: 0.34,
      edgeRough: 0.9,
      boilSeed: boil + 7,
    });

    // Organic hooded head mass
    const hood: Pt[] = [
      { x: cx - 54, y: shoulderY - 6 },
      { x: cx - 60, y: headY + 18 },
      { x: cx - 44, y: headY - 22 },
      { x: cx - 12, y: headY - 36 },
      { x: cx + 22, y: headY - 32 },
      { x: cx + 48, y: headY - 6 },
      { x: cx + 52, y: headY + 28 },
      { x: cx + 42, y: shoulderY - 4 },
    ];
    dryChalkPoly(ctx, hood, PALETTE.velvetDark, {
      underpaint: { r: 24, g: 20, b: 24 },
      pressure: 0.96,
      peek: 0.18,
      edgeRough: 0.9,
      boilSeed: boil + 11,
    });

    // 2. Three-quarter turned organic face (10 vertices, uneven jaw, deep hood shadow over eyes!)
    const faceShadow: Pt[] = [
      { x: cx - 22, y: headY - 10 },
      { x: cx + 16, y: headY - 12 },
      { x: cx + 30, y: headY + 4 },
      { x: cx + 28, y: headY + 22 },
      { x: cx + 33, y: headY + 31 }, // Subtle nose tip profile
      { x: cx + 25, y: headY + 41 },
      { x: cx + 21, y: headY + 54 },
      { x: cx + 6, y: headY + 62 },  // Uneven narrow chin
      { x: cx - 14, y: headY + 55 },
      { x: cx - 26, y: headY + 28 },
    ];
    dryChalkPoly(ctx, faceShadow, { r: 24, g: 20, b: 22 }, {
      pressure: 0.95,
      peek: 0.12,
      edgeRough: 0.6,
      boilSeed: boil + 13,
    });

    // ONLY ONE Sodium-Lit Cheek & Jaw Sliver (#C89048 at 40% alpha — Opus Gate 2 lock!)
    const cheekAlpha = clamp(0.40 * (0.45 + dimMix * 0.55 + curbMix * 0.35), 0.15, 0.52);
    const cheekSliver: Pt[] = [
      { x: cx + 14, y: headY + 10 },
      { x: cx + 27, y: headY + 12 },
      { x: cx + 31, y: headY + 30 },
      { x: cx + 23, y: headY + 42 },
      { x: cx + 19, y: headY + 53 },
      { x: cx + 9, y: headY + 58 },
      { x: cx + 14, y: headY + 36 },
    ];
    dryChalkPoly(ctx, cheekSliver, PALETTE.cheekLight, {
      pressure: 0.88,
      peek: 0.22,
      edgeRough: 0.6,
      boilSeed: boil + 15,
      alpha: cheekAlpha,
    });

    // Deep hood brow shadow draping firmly across upper eyes
    dryChalkPoly(
      ctx,
      [
        { x: cx - 32, y: headY - 14 },
        { x: cx + 34, y: headY - 14 },
        { x: cx + 30, y: headY + 14 },
        { x: cx - 28, y: headY + 18 },
      ],
      PALETTE.velvetDark,
      { pressure: 0.96, peek: 0.08, edgeRough: 0.7, boilSeed: boil + 16 }
    );

    // 3. Tapered Sodium Coat Rim Strokes hugging exact outline w0*(1-s)^1.35, broken into 3 organic pieces!
    // Piece A: Hood crown-to-temple rim
    dipPenRibbon(
      ctx,
      [
        { x: cx + 16, y: headY - 32 },
        { x: cx + 38, y: headY - 18 },
        { x: cx + 48, y: headY + 6 },
      ],
      4.4,
      PALETTE.sodiumLamp,
      { taperMode: 'velocity', alpha: 0.72 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 21 }
    );
    // Piece B: Scarf shoulder drape rim
    dipPenRibbon(
      ctx,
      [
        { x: cx + 48, y: shoulderY - 5 },
        { x: cx + 76, y: shoulderY + 5 },
        { x: cx + 98, y: shoulderY + 18 },
      ],
      4.8,
      PALETTE.sodiumLamp,
      { taperMode: 'velocity', alpha: 0.68 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 23 }
    );
    // Piece C: Outer sleeve break lower down
    dipPenRibbon(
      ctx,
      [
        { x: cx + 106, y: shoulderY + 32 },
        { x: cx + 121, y: shoulderY + 60 },
        { x: cx + 126, y: shoulderY + 96 },
      ],
      3.8,
      PALETTE.amberRim,
      { taperMode: 'velocity', alpha: 0.54 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 25 }
    );

    // 4. Attached Wrist, Overlapping Wool Cuff Polygon, Hand with 4 Knuckle Notches & 1 Wet Highlight Dot!
    drawAttachedHand(ctx, cx - 22, y + h - 22 + breath * 0.4, baseY, false, rimGain, boil + 31);

    // Cohesive 12fps vertex-wobble silhouette contours
    dipPenRibbon(ctx, [...coat, coat[0]], 2.6, PALETTE.velvetDark, { taperMode: 'arch', jitter: 0.6, seed: boil + 41 });
    dipPenRibbon(ctx, [...hood, hood[0]], 2.4, PALETTE.velvetDark, { taperMode: 'arch', jitter: 0.6, seed: boil + 43 });
  } else if (st.visitor === 'tomas') {
    const shoulderY = y + 216 + breath;
    const headY = y + 128 + breath * 1.1;

    // 1. Tall narrow soaked canvas jacket in #0B0A0E backlit silhouette
    const jacket: Pt[] = [
      { x: cx - 130, y: baseY },
      { x: cx - 118, y: shoulderY + 26 },
      { x: cx - 68, y: shoulderY - 10 },
      { x: cx + 62, y: shoulderY - 6 },
      { x: cx + 108, y: shoulderY + 32 },
      { x: cx + 120, y: baseY },
    ];
    dryChalkPoly(ctx, jacket, PALETTE.velvetDark, {
      underpaint: { r: 20, g: 26, b: 32 },
      pressure: 0.96,
      peek: 0.2,
      edgeRough: 0.9,
      boilSeed: boil + 51,
    });

    // High upturned wet canvas collar framing jaw
    const collar: Pt[] = [
      { x: cx - 54, y: shoulderY - 6 },
      { x: cx - 48, y: shoulderY - 40 },
      { x: cx - 14, y: shoulderY - 18 },
      { x: cx + 18, y: shoulderY - 18 },
      { x: cx + 52, y: shoulderY - 38 },
      { x: cx + 54, y: shoulderY - 2 },
    ];
    dryChalkPoly(ctx, collar, { r: 19, g: 24, b: 30 }, {
      underpaint: PALETTE.velvetDark,
      pressure: 0.94,
      peek: 0.22,
      edgeRough: 0.8,
      boilSeed: boil + 55,
    });

    // Bowed damp hair & head silhouette
    const head: Pt[] = [
      { x: cx - 40, y: headY + 46 },
      { x: cx - 42, y: headY + 2 },
      { x: cx - 22, y: headY - 28 },
      { x: cx + 22, y: headY - 26 },
      { x: cx + 42, y: headY + 6 },
      { x: cx + 36, y: headY + 48 },
    ];
    dryChalkPoly(ctx, head, PALETTE.velvetDark, {
      pressure: 0.96,
      peek: 0.14,
      edgeRough: 0.8,
      boilSeed: boil + 59,
    });

    // Three-quarter bowed jaw + single sodium cheek sliver (#C89048 at 40%)
    const cheekAlpha = clamp(0.40 * (0.45 + dimMix * 0.55 + curbMix * 0.38), 0.14, 0.52);
    const cheekSliver: Pt[] = [
      { x: cx + 10, y: headY + 12 },
      { x: cx + 24, y: headY + 14 },
      { x: cx + 28, y: headY + 34 },
      { x: cx + 18, y: headY + 52 },
      { x: cx + 4, y: headY + 58 },
      { x: cx + 8, y: headY + 34 },
    ];
    dryChalkPoly(ctx, cheekSliver, PALETTE.cheekLight, {
      pressure: 0.88,
      peek: 0.2,
      edgeRough: 0.6,
      boilSeed: boil + 61,
      alpha: cheekAlpha,
    });

    // 3 tapered outline-hugging sodium rim pieces along hair, upturned collar, and wet canvas shoulder!
    dipPenRibbon(
      ctx,
      [
        { x: cx + 18, y: headY - 25 },
        { x: cx + 36, y: headY - 8 },
        { x: cx + 41, y: headY + 18 },
      ],
      4.0,
      PALETTE.sodiumLamp,
      { taperMode: 'velocity', alpha: 0.72 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 63 }
    );
    dipPenRibbon(
      ctx,
      [
        { x: cx + 52, y: shoulderY - 37 },
        { x: cx + 62, y: shoulderY - 6 },
        { x: cx + 88, y: shoulderY + 14 },
      ],
      4.5,
      PALETTE.sodiumLamp,
      { taperMode: 'velocity', alpha: 0.68 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 65 }
    );
    dipPenRibbon(
      ctx,
      [
        { x: cx + 96, y: shoulderY + 26 },
        { x: cx + 111, y: shoulderY + 56 },
        { x: cx + 117, y: shoulderY + 92 },
      ],
      3.5,
      PALETTE.amberRim,
      { taperMode: 'velocity', alpha: 0.54 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 67 }
    );

    // Attached taped-thumb hand with overlapping cuff + 4 knuckle notches + 1 wet highlight dot!
    drawAttachedHand(ctx, cx + 18, y + h - 22 + breath * 0.45, baseY, true, rimGain, boil + 71);

    dipPenRibbon(ctx, [...jacket, jacket[0]], 2.6, PALETTE.velvetDark, { taperMode: 'arch', jitter: 0.6, seed: boil + 75 });
  }

  ctx.restore();
}

function drawAttachedHand(
  ctx: CanvasRenderingContext2D,
  hx: number,
  hy: number,
  baseY: number,
  tapedThumb: boolean,
  rimGain: number,
  seed: number
): void {
  // Forearm sleeve reaching seamlessly into coat body
  const sleeve: Pt[] = [
    { x: hx - 66, y: baseY },
    { x: hx - 48, y: hy - 14 },
    { x: hx - 6, y: hy - 6 },
    { x: hx - 12, y: baseY },
  ];
  dryChalkPoly(ctx, sleeve, { r: 18, g: 20, b: 25 }, { pressure: 0.94, peek: 0.2, edgeRough: 0.8, boilSeed: seed });

  // Hand polygon with 4 sculpted knuckle notches resting along outer steel lip!
  const handPoly: Pt[] = [
    { x: hx - 10, y: hy - 4 },
    { x: hx + 4, y: hy - 11 },   // Knuckle 1
    { x: hx + 11, y: hy - 8 },
    { x: hx + 18, y: hy - 12 },  // Knuckle 2
    { x: hx + 24, y: hy - 8 },
    { x: hx + 31, y: hy - 11 },  // Knuckle 3
    { x: hx + 37, y: hy - 6 },
    { x: hx + 43, y: hy - 7 },   // Knuckle 4
    { x: hx + 47, y: hy + 8 },
    { x: hx + 34, y: hy + 18 },
    { x: hx - 8, y: hy + 18 },
  ];
  dryChalkPoly(ctx, handPoly, PALETTE.coldSkin, {
    underpaint: { r: 78, g: 52, b: 48 },
    pressure: 0.86,
    peek: 0.34,
    edgeRough: 0.5,
    boilSeed: seed + 3,
  });

  // Subtle knuckle crease notches
  for (let k = 0; k < 3; k++) {
    const kx = hx + 11 + k * 12;
    dipPenRibbon(
      ctx,
      [
        { x: kx, y: hy - 7 },
        { x: kx + 1, y: hy + 4 },
      ],
      1.3,
      PALETTE.velvetDark,
      { alpha: 0.58, inkPool: false, jitter: 0.2, seed: seed + k }
    );
  }

  // Tomas's quiet electrician's tape strip wrapped around thumb
  if (tapedThumb) {
    dryChalkPoly(
      ctx,
      [
        { x: hx - 6, y: hy + 1 },
        { x: hx + 10, y: hy - 3 },
        { x: hx + 12, y: hy + 11 },
        { x: hx - 4, y: hy + 14 },
      ],
      PALETTE.amberLabel,
      { pressure: 0.92, peek: 0.16, edgeRough: 0.4, boilSeed: seed + 7 }
    );
  }

  // Overlapping thick wool/canvas cuff polygon covering the wrist cleanly (Gate 2!)
  const cuff: Pt[] = [
    { x: hx - 24, y: hy - 12 },
    { x: hx - 2, y: hy - 10 },
    { x: hx - 4, y: hy + 20 },
    { x: hx - 26, y: hy + 22 },
  ];
  dryChalkPoly(ctx, cuff, { r: 28, g: 28, b: 34 }, { pressure: 0.94, peek: 0.22, edgeRough: 0.6, boilSeed: seed + 9 });
  dipPenRibbon(
    ctx,
    [
      { x: hx - 20, y: hy - 11 },
      { x: hx - 3, y: hy - 9 },
    ],
    2.6,
    PALETTE.sodiumLamp,
    { taperMode: 'velocity', alpha: 0.68 * rimGain, inkPool: false, jitter: 0.3, seed: seed + 11 }
  );

  // One tiny crisp wet highlight dot on leading knuckle!
  ctx.fillStyle = rgbCss(PALETTE.glassRim, 0.72 * rimGain);
  ctx.beginPath();
  ctx.arc(hx + 18, hy - 8, 1.8, 0, Math.PI * 2);
  ctx.fill();

  dipPenRibbon(ctx, [...handPoly, handPoly[0]], 1.9, PALETTE.velvetDark, {
    taperMode: 'velocity',
    inkPool: false,
    jitter: 0.35,
    seed: seed + 13,
  });
}
