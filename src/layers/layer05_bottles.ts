// VACUUM LAYER 05 (Opus Gate 2 Upgraded):
// - Amber bottle labels dropped to aged apothecary parchment #8A7A5E so they NEVER compete
//   with the singular #E8D5A8 hero light mass (counter card + pills) in 3-value squint!
// - Sculpted amber glass shoulders (#7A3A1C) + cork stoppers + grazing rim light.

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dryChalkPoly, gouacheBristle, dipPenRibbon, Pt } from '../art/dryTools';
import { drawInkText } from '../art/calligraphy';
import { clamp, lerp } from '../core/prng';

export const BOTTLE_RACK_HIT = { x: 960, y: 425, w: 280, h: 215 };

interface BottleDef {
  id: string;
  label1: string;
  label2: string;
  x: number;
  y: number;
  w: number;
  h: number;
  activePour: boolean;
}

const BOTTLES: BottleDef[] = [
  { id: 'valerian', label1: 'VALERIAN', label2: '20mg', x: 978, y: 618, w: 66, h: 146, activePour: true },
  { id: 'camphor', label1: 'CAMPHOR', label2: 'BALM', x: 1056, y: 624, w: 58, h: 122, activePour: false },
  { id: 'salts', label1: 'SALTS', label2: 'NOCT', x: 1126, y: 614, w: 64, h: 158, activePour: false },
  { id: 'tincture', label1: 'LINEN', label2: 'DROPS', x: 1200, y: 628, w: 54, h: 116, activePour: false },
];

function drawSculptedBottle(
  ctx: CanvasRenderingContext2D,
  b: BottleDef,
  boil: number,
  hover: boolean,
  tiltFrac: number
): void {
  ctx.save();
  if (b.activePour && tiltFrac > 0.005) {
    const tx = lerp(b.x + b.w * 0.5, 845, tiltFrac);
    const ty = lerp(b.y - b.h * 0.5, 515, tiltFrac);
    ctx.translate(tx, ty);
    ctx.rotate(-tiltFrac * 1.18);
    ctx.translate(-(b.x + b.w * 0.5), -(b.y - b.h * 0.5));
  }

  const bx = b.x;
  const by = b.y;
  const bw = b.w;
  const bh = b.h;
  const shoulderY = by - bh * 0.78;
  const neckTopY = by - bh - 20;
  const neckL = bx + bw * 0.30;
  const neckR = bx + bw * 0.70;

  if (tiltFrac < 0.3) {
    ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.76 * (1 - tiltFrac * 3));
    ctx.beginPath();
    ctx.ellipse(bx + bw * 0.55, by + 5, bw * 0.62, 11, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const bodyPoly: Pt[] = [
    { x: bx + 3, y: by },
    { x: bx + bw - 3, y: by },
    { x: bx + bw, y: by - 10 },
    { x: bx + bw, y: shoulderY + 8 },
    { x: neckR + 4, y: shoulderY - 12 },
    { x: neckR, y: neckTopY },
    { x: neckL, y: neckTopY },
    { x: neckL - 4, y: shoulderY - 12 },
    { x: bx, y: shoulderY + 8 },
    { x: bx, y: by - 10 },
  ];

  dryChalkPoly(ctx, bodyPoly, PALETTE.amberBottle, {
    underpaint: { r: 58, g: 24, b: 12 },
    pressure: 0.92,
    peek: 0.32,
    edgeRough: 0.8,
    boilSeed: boil + bx,
  });

  const amberGrad = ctx.createLinearGradient(bx, by - bh, bx + bw, by);
  amberGrad.addColorStop(0, rgbCss(PALETTE.sodiumLamp, hover ? 0.44 : 0.28));
  amberGrad.addColorStop(0.36, rgbCss(PALETTE.amberBottle, 0.14));
  amberGrad.addColorStop(0.76, rgbCss(PALETTE.velvetDark, 0.52));
  amberGrad.addColorStop(1, rgbCss(PALETTE.velvetDark, 0.74));
  ctx.fillStyle = amberGrad;
  ctx.beginPath();
  ctx.moveTo(bodyPoly[0].x, bodyPoly[0].y);
  for (let i = 1; i < bodyPoly.length; i++) ctx.lineTo(bodyPoly[i].x, bodyPoly[i].y);
  ctx.closePath();
  ctx.fill();

  if (tiltFrac < 0.22) {
    const corkY = neckTopY - 13;
    dryChalkPoly(
      ctx,
      [
        { x: neckL + 2, y: neckTopY + 2 },
        { x: neckR - 2, y: neckTopY + 2 },
        { x: neckR, y: corkY },
        { x: neckL, y: corkY },
      ],
      { r: 126, g: 94, b: 64 },
      { underpaint: PALETTE.brassDark, pressure: 0.90, peek: 0.32, edgeRough: 0.6, boilSeed: boil + bx + 2 }
    );
  }
  dipPenRibbon(
    ctx,
    [
      { x: neckL - 3, y: neckTopY + 1 },
      { x: neckR + 3, y: neckTopY + 1 },
    ],
    4.0,
    PALETTE.brassMid,
    { taperMode: 'arch', alpha: 0.76, jitter: 0.25, seed: boil + bx + 5 }
  );

  // Aged Apothecary Label dropped to #8A7A5E (Opus Gate 2 3-Value Squint Lock!)
  const lx = bx + 6;
  const lw = bw - 12;
  const ly = shoulderY + 18;
  const lh = bh * 0.44;
  dryChalkPoly(
    ctx,
    [
      { x: lx, y: ly },
      { x: lx + lw, y: ly - 1 },
      { x: lx + lw, y: ly + lh },
      { x: lx, y: ly + lh + 1 },
    ],
    PALETTE.amberLabel,
    { underpaint: { r: 96, g: 82, b: 64 }, pressure: 0.94, peek: 0.18, edgeRough: 0.5, boilSeed: boil + bx + 9 }
  );

  dipPenRibbon(
    ctx,
    [
      { x: lx + 3, y: ly + 4 },
      { x: lx + lw - 3, y: ly + 3 },
    ],
    1.1,
    PALETTE.velvetDark,
    { taperMode: 'velocity', inkPool: false, jitter: 0.2, seed: boil + bx }
  );
  drawInkText(ctx, b.label1, lx + lw * 0.5, ly + 11, {
    size: 8.6,
    color: PALETTE.velvetDark,
    strokeWidth: 1.25,
    align: 'center',
    boilSeed: boil + bx,
    jitter: 0.16,
  });
  drawInkText(ctx, b.label2, lx + lw * 0.5, ly + 28, {
    size: 7.4,
    color: { r: 122, g: 36, b: 26 },
    strokeWidth: 1.15,
    align: 'center',
    boilSeed: boil + bx + 3,
    jitter: 0.15,
  });

  // Crisp grazing rim catch on left glass edge
  gouacheBristle(ctx, bx + 5, shoulderY + 12, bx + 6, by - 12, 3.6, PALETTE.amberRim, {
    bristles: 3,
    alpha: hover ? 0.84 : 0.58,
    deplete: 0.48,
    seed: boil + bx + 11,
  });

  dipPenRibbon(ctx, [...bodyPoly, bodyPoly[0]], 2.8, PALETTE.velvetDark, {
    taperMode: 'velocity',
    jitter: 0.6,
    seed: boil + bx + 19,
  });

  ctx.restore();
}

export function renderLayer05Bottles(ctx: CanvasRenderingContext2D, st: GameState): void {
  const boil = st.boilTick;
  const tilt = clamp(st.bottleTilt.value, 0, 1.1);
  const hover = st.hoverZone === 'bottle';

  for (let i = BOTTLES.length - 1; i >= 0; i--) {
    const b = BOTTLES[i];
    drawSculptedBottle(ctx, b, boil, hover && b.activePour, b.activePour ? tilt : 0);
  }
}
