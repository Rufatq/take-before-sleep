// VACUUM LAYER 02 (Phase 2 — All 4 Recurring Human Voices per Opus Gate 3 Voice Bible):
// - Maren (61): Knotted wool scarf hood, hunched silhouette, 3/4 sodium cheek sliver, cuffed cold knuckles
// - Tomas (24): Upturned soaked canvas collar, bowed damp hair, taped thumb on outer lip
// - Nadia (34): Rain slicker hood pushed back, wet shoulder speculars, pale mint-grey scrub collar above zip,
//               7 deg head tilt on left hip, slow 280ms blinks, index & middle fingertips pressed lightly on glass!
// - Dr. Halvorsen (74): Upright buttoned wool coat, single-knotted scarf, closed umbrella ferrule dripping a
//               sodium-lit flash every 1.3s, single silver brow sliver in 3/4 sodium light, NEVER touches glass!

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dryChalkPoly, gouacheBristle, dipPenRibbon, Pt } from '../art/dryTools';
import { clamp, smoothstep } from '../core/prng';
import { HATCH_RECT } from './layer01_street';

export function renderLayer02Visitor(ctx: CanvasRenderingContext2D, st: GameState): void {
  const pres = clamp(st.visitorPresence.value, 0, 1);
  if (pres <= 0.02 || st.visitor === 'none') return;

  const { x, y, w, h } = HATCH_RECT;
  const boil = st.boilTick;
  const breath = Math.sin(boil * 0.42) * 2.6;
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
    dryChalkPoly(ctx, coat, PALETTE.velvetDark, { underpaint: { r: 22, g: 18, b: 22 }, pressure: 0.96, peek: 0.22, edgeRough: 0.9, boilSeed: boil + 3 });

    const scarf: Pt[] = [
      { x: cx - 64, y: shoulderY - 6 },
      { x: cx + 44, y: shoulderY - 6 },
      { x: cx + 68, y: shoulderY + 36 },
      { x: cx + 16, y: shoulderY + 52 },
      { x: cx - 38, y: shoulderY + 44 },
      { x: cx - 72, y: shoulderY + 20 },
    ];
    dryChalkPoly(ctx, scarf, { r: 26, g: 20, b: 22 }, { underpaint: { r: 52, g: 32, b: 26 }, pressure: 0.92, peek: 0.34, edgeRough: 0.9, boilSeed: boil + 7 });

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
    dryChalkPoly(ctx, hood, PALETTE.velvetDark, { underpaint: { r: 24, g: 20, b: 24 }, pressure: 0.96, peek: 0.18, edgeRough: 0.9, boilSeed: boil + 11 });

    drawThreeQuarterFace(ctx, cx, headY, dimMix, curbMix, boil + 13, false);

    // 3 tapered outline-hugging sodium rim pieces
    dipPenRibbon(ctx, [{ x: cx + 16, y: headY - 32 }, { x: cx + 38, y: headY - 18 }, { x: cx + 48, y: headY + 6 }], 4.4, PALETTE.sodiumLamp, { taperMode: 'velocity', alpha: 0.72 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 21 });
    dipPenRibbon(ctx, [{ x: cx + 48, y: shoulderY - 5 }, { x: cx + 76, y: shoulderY + 5 }, { x: cx + 98, y: shoulderY + 18 }], 4.8, PALETTE.sodiumLamp, { taperMode: 'velocity', alpha: 0.68 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 23 });
    dipPenRibbon(ctx, [{ x: cx + 106, y: shoulderY + 32 }, { x: cx + 121, y: shoulderY + 60 }, { x: cx + 126, y: shoulderY + 96 }], 3.8, PALETTE.amberRim, { taperMode: 'velocity', alpha: 0.54 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 25 });

    drawAttachedHand(ctx, cx - 22, y + h - 22 + breath * 0.4, baseY, false, rimGain, boil + 31);
    dipPenRibbon(ctx, [...coat, coat[0]], 2.6, PALETTE.velvetDark, { taperMode: 'arch', jitter: 0.6, seed: boil + 41 });
  } else if (st.visitor === 'tomas') {
    const shoulderY = y + 216 + breath;
    const headY = y + 128 + breath * 1.1;

    const jacket: Pt[] = [
      { x: cx - 130, y: baseY },
      { x: cx - 118, y: shoulderY + 26 },
      { x: cx - 68, y: shoulderY - 10 },
      { x: cx + 62, y: shoulderY - 6 },
      { x: cx + 108, y: shoulderY + 32 },
      { x: cx + 120, y: baseY },
    ];
    dryChalkPoly(ctx, jacket, PALETTE.velvetDark, { underpaint: { r: 20, g: 26, b: 32 }, pressure: 0.96, peek: 0.2, edgeRough: 0.9, boilSeed: boil + 51 });

    const collar: Pt[] = [
      { x: cx - 54, y: shoulderY - 6 },
      { x: cx - 48, y: shoulderY - 40 },
      { x: cx - 14, y: shoulderY - 18 },
      { x: cx + 18, y: shoulderY - 18 },
      { x: cx + 52, y: shoulderY - 38 },
      { x: cx + 54, y: shoulderY - 2 },
    ];
    dryChalkPoly(ctx, collar, { r: 19, g: 24, b: 30 }, { underpaint: PALETTE.velvetDark, pressure: 0.94, peek: 0.22, edgeRough: 0.8, boilSeed: boil + 55 });

    const head: Pt[] = [
      { x: cx - 40, y: headY + 46 },
      { x: cx - 42, y: headY + 2 },
      { x: cx - 22, y: headY - 28 },
      { x: cx + 22, y: headY - 26 },
      { x: cx + 42, y: headY + 6 },
      { x: cx + 36, y: headY + 48 },
    ];
    dryChalkPoly(
      ctx,
      [
        { x: cx - 19, y: headY + 40 },
        { x: cx + 17, y: headY + 40 },
        { x: cx + 22, y: shoulderY + 4 },
        { x: cx - 22, y: shoulderY + 4 },
      ],
      PALETTE.velvetDark,
      { pressure: 0.96, peek: 0.1, edgeRough: 0.5, boilSeed: boil + 58 }
    );
    dryChalkPoly(ctx, head, PALETTE.velvetDark, { pressure: 0.96, peek: 0.14, edgeRough: 0.8, boilSeed: boil + 59 });

    drawThreeQuarterFace(ctx, cx - 2, headY + 4, dimMix, curbMix, boil + 61, false);

    dipPenRibbon(ctx, [{ x: cx + 18, y: headY - 25 }, { x: cx + 36, y: headY - 8 }, { x: cx + 41, y: headY + 18 }], 4.0, PALETTE.sodiumLamp, { taperMode: 'velocity', alpha: 0.72 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 63 });
    dipPenRibbon(ctx, [{ x: cx + 52, y: shoulderY - 37 }, { x: cx + 62, y: shoulderY - 6 }, { x: cx + 88, y: shoulderY + 14 }], 4.5, PALETTE.sodiumLamp, { taperMode: 'velocity', alpha: 0.68 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 65 });
    dipPenRibbon(ctx, [{ x: cx + 96, y: shoulderY + 26 }, { x: cx + 111, y: shoulderY + 56 }, { x: cx + 117, y: shoulderY + 92 }], 3.5, PALETTE.amberRim, { taperMode: 'velocity', alpha: 0.54 * rimGain, inkPool: false, jitter: 0.5, seed: boil + 67 });

    drawAttachedHand(ctx, cx + 18, y + h - 22 + breath * 0.45, baseY, true, rimGain, boil + 71);
    dipPenRibbon(ctx, [...jacket, jacket[0]], 2.6, PALETTE.velvetDark, { taperMode: 'arch', jitter: 0.6, seed: boil + 75 });
  } else if (st.visitor === 'nadia') {
    // NADIA (34) — Opus Gate 3 Exact Signature:
    // Weight on left hip, head tilted 7 deg, rain slicker hood pushed back with wet shoulder speculars,
    // pale mint-grey scrub collar above zip, slow 280ms blinks, index & middle fingertips resting on glass!
    const nx = cx - 14; // Weight shifted onto left hip!
    const shoulderY = y + 228 + breath;
    const headY = y + 142 + breath * 1.1;

    // Rain slicker torso (hood pushed back bunched around neck!)
    const slicker: Pt[] = [
      { x: nx - 118, y: baseY },
      { x: nx - 112, y: shoulderY + 32 },
      { x: nx - 72, y: shoulderY - 4 },
      { x: nx + 54, y: shoulderY + 4 },
      { x: nx + 98, y: shoulderY + 42 },
      { x: nx + 108, y: baseY },
    ];
    dryChalkPoly(ctx, slicker, { r: 14, g: 18, b: 22 }, { underpaint: { r: 24, g: 34, b: 36 }, pressure: 0.96, peek: 0.24, edgeRough: 0.8, boilSeed: boil + 81 });

    // Bunched pushed-back slicker hood behind collar
    dryChalkPoly(
      ctx,
      [
        { x: nx - 64, y: shoulderY - 12 },
        { x: nx + 48, y: shoulderY - 8 },
        { x: nx + 62, y: shoulderY + 24 },
        { x: nx - 68, y: shoulderY + 20 },
      ],
      { r: 20, g: 24, b: 29 },
      { pressure: 0.94, peek: 0.18, edgeRough: 0.8, boilSeed: boil + 83 }
    );

    // Shadowed neck connecting Nadia's chin cleanly into scrub V-collar (no floating head gap!)
    dryChalkPoly(
      ctx,
      [
        { x: nx - 18, y: headY + 46 },
        { x: nx + 16, y: headY + 46 },
        { x: nx + 20, y: shoulderY + 6 },
        { x: nx - 20, y: shoulderY + 6 },
      ],
      { r: 24, g: 20, b: 22 },
      { underpaint: PALETTE.velvetDark, pressure: 0.96, peek: 0.14, edgeRough: 0.5, boilSeed: boil + 84 }
    );

    // Pale mint-grey pediatric scrub V-collar peeking cleanly above coat zip! (#8AA49E)
    dryChalkPoly(
      ctx,
      [
        { x: nx - 30, y: shoulderY - 12 },
        { x: nx + 26, y: shoulderY - 10 },
        { x: nx + 2, y: shoulderY + 36 },
      ],
      { r: 126, g: 148, b: 142 },
      { underpaint: { r: 62, g: 78, b: 74 }, pressure: 0.88, peek: 0.22, edgeRough: 0.5, boilSeed: boil + 85, alpha: 0.72 + dimMix * 0.22 }
    );
    // Coat zipper seam below V-collar
    dipPenRibbon(ctx, [{ x: nx + 2, y: shoulderY + 34 }, { x: nx + 1, y: baseY - 10 }], 2.0, { r: 66, g: 74, b: 82 }, { taperMode: 'velocity', inkPool: false, jitter: 0.3, seed: boil + 86 });

    // Head tilted 7 deg (+0.122 rad) looking past your shoulder toward wall clock / back bottles!
    ctx.save();
    ctx.translate(nx, headY + 24);
    ctx.rotate(0.122);
    ctx.translate(-nx, -(headY + 24));

    const hair: Pt[] = [
      { x: nx - 44, y: headY + 52 },
      { x: nx - 46, y: headY + 2 },
      { x: nx - 28, y: headY - 30 },
      { x: nx + 22, y: headY - 28 },
      { x: nx + 42, y: headY + 6 },
      { x: nx + 34, y: headY + 54 },
    ];
    dryChalkPoly(ctx, hair, PALETTE.velvetDark, { pressure: 0.96, peek: 0.14, edgeRough: 0.8, boilSeed: boil + 87 });
    drawThreeQuarterFace(ctx, nx, headY + 2, dimMix, curbMix, boil + 89, false);

    // Slow 280ms blink every ~4.4s (visible in DIM mode!)
    const blinkCycle = st.simTime % 4.4;
    const isBlinking = blinkCycle > 3.9 && blinkCycle < 4.18;
    if (!isBlinking && dimMix > 0.3) {
      ctx.fillStyle = rgbCss(PALETTE.glassRim, 0.38 * dimMix);
      ctx.fillRect(nx + 12, headY + 14, 3, 2);
    }
    ctx.restore();

    // Wet specular streaks along slicker shoulders (Opus Gate 3!)
    gouacheBristle(ctx, nx - 64, shoulderY - 2, nx - 102, shoulderY + 34, 4.2, PALETTE.glassRim, { bristles: 3, alpha: 0.44 * rimGain, deplete: 0.65, seed: boil + 91 });
    dipPenRibbon(ctx, [{ x: nx + 48, y: shoulderY + 3 }, { x: nx + 82, y: shoulderY + 20 }, { x: nx + 100, y: shoulderY + 46 }], 4.4, PALETTE.sodiumLamp, { taperMode: 'velocity', alpha: 0.76 * rimGain, inkPool: false, jitter: 0.45, seed: boil + 93 });

    // Index & middle fingertips raised lightly onto the chilled glass pane! (Matches Layer 03 fog ovals!)
    const fx = nx + 84;
    const fy = y + 300 + breath * 0.4;
    dryChalkPoly(
      ctx,
      [
        { x: fx - 24, y: baseY },
        { x: fx - 14, y: fy + 24 },
        { x: fx + 12, y: fy + 24 },
        { x: fx + 18, y: baseY },
      ],
      { r: 16, g: 20, b: 25 },
      { pressure: 0.94, peek: 0.2, edgeRough: 0.6, boilSeed: boil + 95 }
    );
    // Two slender fingertips pressed against glass
    for (const [dx, dy] of [
      [-6, 0],
      [6, 4],
    ]) {
      dryChalkPoly(
        ctx,
        [
          { x: fx + dx - 4, y: fy + dy + 24 },
          { x: fx + dx - 3, y: fy + dy - 10 },
          { x: fx + dx + 4, y: fy + dy - 10 },
          { x: fx + dx + 5, y: fy + dy + 24 },
        ],
        PALETTE.coldSkin,
        { pressure: 0.88, peek: 0.22, edgeRough: 0.4, boilSeed: boil + 97 + dx }
      );
    }
  } else if (st.visitor === 'halvorsen') {
    // DR. HALVORSEN (74) — Opus Gate 3 Exact Signature:
    // Upright posture, wool coat buttoned to the top, scarf knotted once, closed umbrella ferrule
    // dripping a small sodium-lit flash every 1.3s, 3/4 sodium light catching ONE silver brow sliver,
    // NEVER touches glass (except Night IV single knuckle knock!).
    const shoulderY = y + 214 + breath * 0.55; // Tall upright stillness
    const headY = y + 124 + breath * 0.6;

    // Upright buttoned wool overcoat
    const overcoat: Pt[] = [
      { x: cx - 126, y: baseY },
      { x: cx - 118, y: shoulderY + 24 },
      { x: cx - 74, y: shoulderY - 12 },
      { x: cx + 70, y: shoulderY - 10 },
      { x: cx + 114, y: shoulderY + 26 },
      { x: cx + 122, y: baseY },
    ];
    dryChalkPoly(ctx, overcoat, PALETTE.velvetDark, { underpaint: { r: 28, g: 24, b: 22 }, pressure: 0.96, peek: 0.22, edgeRough: 0.8, boilSeed: boil + 101 });

    // Shadowed neck & high buttoned coat collar connecting Halvorsen's chin cleanly into knotted scarf!
    dryChalkPoly(
      ctx,
      [
        { x: cx - 22, y: headY + 42 },
        { x: cx + 20, y: headY + 42 },
        { x: cx + 28, y: shoulderY + 6 },
        { x: cx - 28, y: shoulderY + 6 },
      ],
      PALETTE.velvetDark,
      { underpaint: { r: 28, g: 24, b: 22 }, pressure: 0.96, peek: 0.14, edgeRough: 0.5, boilSeed: boil + 102 }
    );

    // Single-knotted dark wool scarf tucked neatly inside buttoned lapel
    dryChalkPoly(
      ctx,
      [
        { x: cx - 28, y: shoulderY - 22 },
        { x: cx + 28, y: shoulderY - 20 },
        { x: cx + 18, y: shoulderY + 42 },
        { x: cx - 20, y: shoulderY + 40 },
      ],
      { r: 44, g: 38, b: 36 },
      { underpaint: PALETTE.velvetDark, pressure: 0.92, peek: 0.28, edgeRough: 0.6, boilSeed: boil + 103 }
    );

    // Upright bare head with swept silver-white hair crown
    const head: Pt[] = [
      { x: cx - 38, y: headY + 48 },
      { x: cx - 40, y: headY - 2 },
      { x: cx - 22, y: headY - 32 },
      { x: cx + 22, y: headY - 30 },
      { x: cx + 38, y: headY + 4 },
      { x: cx + 32, y: headY + 50 },
    ];
    dryChalkPoly(ctx, head, PALETTE.velvetDark, { pressure: 0.96, peek: 0.14, edgeRough: 0.7, boilSeed: boil + 105 });

    // 3/4 sodium light catching ONE silver sliver of brow & temple (Gate 3 lock!)
    drawThreeQuarterFace(ctx, cx, headY + 4, dimMix, curbMix, boil + 107, true);
    dipPenRibbon(
      ctx,
      [
        { x: cx + 2, y: headY - 28 },
        { x: cx + 22, y: headY - 26 },
        { x: cx + 34, y: headY - 8 },
      ],
      4.2,
      PALETTE.glassRim,
      { taperMode: 'velocity', alpha: 0.72 * rimGain, inkPool: false, jitter: 0.4, seed: boil + 109 }
    );
    // Silver brow sliver
    dipPenRibbon(
      ctx,
      [
        { x: cx + 8, y: headY + 12 },
        { x: cx + 25, y: headY + 10 },
      ],
      2.6,
      PALETTE.glassRim,
      { taperMode: 'velocity', alpha: 0.80 * rimGain, inkPool: false, jitter: 0.25, seed: boil + 111 }
    );

    // Tapered shoulder sodium rims
    dipPenRibbon(ctx, [{ x: cx + 62, y: shoulderY - 10 }, { x: cx + 96, y: shoulderY + 6 }, { x: cx + 112, y: shoulderY + 28 }], 4.4, PALETTE.sodiumLamp, { taperMode: 'velocity', alpha: 0.72 * rimGain, inkPool: false, jitter: 0.45, seed: boil + 113 });
    dipPenRibbon(ctx, [{ x: cx + 114, y: shoulderY + 46 }, { x: cx + 119, y: shoulderY + 86 }], 3.2, PALETTE.amberRim, { taperMode: 'velocity', alpha: 0.50 * rimGain, inkPool: false, jitter: 0.4, seed: boil + 115 });

    // Closed umbrella leaning cleanly against his right arm with brass ferrule dripping every 1.3s!
    const umbTopX = cx + 132;
    const umbTopY = shoulderY + 6;
    const umbTipX = cx + 118;
    const umbTipY = y + h - 44;
    dipPenRibbon(ctx, [{ x: umbTopX, y: umbTopY }, { x: umbTipX, y: umbTipY }], 6.2, { r: 22, g: 24, b: 30 }, { taperMode: 'velocity', jitter: 0.35, seed: boil + 117 });
    // Brass ferrule tip
    dipPenRibbon(ctx, [{ x: umbTipX, y: umbTipY - 4 }, { x: umbTipX - 3, y: umbTipY + 14 }], 3.2, PALETTE.brassWarm, { taperMode: 'velocity', jitter: 0.2, seed: boil + 119 });

    // Every 1.3s a single sodium-lit droplet detaches from the ferrule and flashes down! (Opus Gate 3!)
    const dripPhase = (st.simTime % 1.3) / 1.3;
    if (dripPhase < 0.28) {
      const dU = dripPhase / 0.28;
      const dx = umbTipX - 3;
      const dy = umbTipY + 14 + dU * dU * 46;
      ctx.fillStyle = rgbCss(PALETTE.sodiumLamp, (1 - dU * 0.5) * 0.92);
      ctx.beginPath();
      ctx.ellipse(dx, dy, 2.2, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgbCss(PALETTE.glassRim, (1 - dU * 0.6) * 0.85);
      ctx.beginPath();
      ctx.arc(dx, dy - 1, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    dipPenRibbon(ctx, [...overcoat, overcoat[0]], 2.6, PALETTE.velvetDark, { taperMode: 'arch', jitter: 0.6, seed: boil + 121 });
  }

  ctx.restore();
}

function drawThreeQuarterFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  headY: number,
  dimMix: number,
  curbMix: number,
  seed: number,
  silverTone: boolean
): void {
  const faceShadow: Pt[] = [
    { x: cx - 22, y: headY - 10 },
    { x: cx + 16, y: headY - 12 },
    { x: cx + 30, y: headY + 4 },
    { x: cx + 28, y: headY + 22 },
    { x: cx + 33, y: headY + 31 },
    { x: cx + 25, y: headY + 41 },
    { x: cx + 21, y: headY + 54 },
    { x: cx + 6, y: headY + 62 },
    { x: cx - 14, y: headY + 55 },
    { x: cx - 26, y: headY + 28 },
  ];
  dryChalkPoly(ctx, faceShadow, { r: 24, g: 20, b: 22 }, { pressure: 0.95, peek: 0.12, edgeRough: 0.6, boilSeed: seed });

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
  dryChalkPoly(ctx, cheekSliver, silverTone ? PALETTE.glassRim : PALETTE.cheekLight, {
    pressure: 0.88,
    peek: 0.22,
    edgeRough: 0.6,
    boilSeed: seed + 2,
    alpha: cheekAlpha,
  });

  // Deep brow shadow over upper eyes
  dryChalkPoly(
    ctx,
    [
      { x: cx - 30, y: headY - 12 },
      { x: cx + 32, y: headY - 12 },
      { x: cx + 28, y: headY + 12 },
      { x: cx - 26, y: headY + 16 },
    ],
    PALETTE.velvetDark,
    { pressure: 0.96, peek: 0.08, edgeRough: 0.6, boilSeed: seed + 4 }
  );
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
  const sleeve: Pt[] = [
    { x: hx - 66, y: baseY },
    { x: hx - 48, y: hy - 14 },
    { x: hx - 6, y: hy - 6 },
    { x: hx - 12, y: baseY },
  ];
  dryChalkPoly(ctx, sleeve, { r: 18, g: 20, b: 25 }, { pressure: 0.94, peek: 0.2, edgeRough: 0.8, boilSeed: seed });

  const handPoly: Pt[] = [
    { x: hx - 10, y: hy - 4 },
    { x: hx + 4, y: hy - 11 },
    { x: hx + 11, y: hy - 8 },
    { x: hx + 18, y: hy - 12 },
    { x: hx + 24, y: hy - 8 },
    { x: hx + 31, y: hy - 11 },
    { x: hx + 37, y: hy - 6 },
    { x: hx + 43, y: hy - 7 },
    { x: hx + 47, y: hy + 8 },
    { x: hx + 34, y: hy + 18 },
    { x: hx - 8, y: hy + 18 },
  ];
  dryChalkPoly(ctx, handPoly, PALETTE.coldSkin, { underpaint: { r: 78, g: 52, b: 48 }, pressure: 0.86, peek: 0.34, edgeRough: 0.5, boilSeed: seed + 3 });

  for (let k = 0; k < 3; k++) {
    const kx = hx + 11 + k * 12;
    dipPenRibbon(ctx, [{ x: kx, y: hy - 7 }, { x: kx + 1, y: hy + 4 }], 1.3, PALETTE.velvetDark, { alpha: 0.58, inkPool: false, jitter: 0.2, seed: seed + k });
  }

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

  const cuff: Pt[] = [
    { x: hx - 24, y: hy - 12 },
    { x: hx - 2, y: hy - 10 },
    { x: hx - 4, y: hy + 20 },
    { x: hx - 26, y: hy + 22 },
  ];
  dryChalkPoly(ctx, cuff, { r: 28, g: 28, b: 34 }, { pressure: 0.94, peek: 0.22, edgeRough: 0.6, boilSeed: seed + 9 });
  dipPenRibbon(ctx, [{ x: hx - 20, y: hy - 11 }, { x: hx - 3, y: hy - 9 }], 2.6, PALETTE.sodiumLamp, { taperMode: 'velocity', alpha: 0.68 * rimGain, inkPool: false, jitter: 0.3, seed: seed + 11 });

  ctx.fillStyle = rgbCss(PALETTE.glassRim, 0.72 * rimGain);
  ctx.beginPath();
  ctx.arc(hx + 18, hy - 8, 1.8, 0, Math.PI * 2);
  ctx.fill();

  dipPenRibbon(ctx, [...handPoly, handPoly[0]], 1.9, PALETTE.velvetDark, { taperMode: 'velocity', inkPool: false, jitter: 0.35, seed: seed + 13 });
}
