// VACUUM LAYER 05 (Phase 2 — 4 Distinct Tactile Apothecary Vessels per Opus Gate 3 Prop Feel!):
// 1. VALERIAN: Tall amber glass bottle (#7A3A1C, tilts past 14 deg to pour dry chalk tablets)
// 2. CAMPHOR: Squat milk-glass balm jar with brushed tin quarter-turn lid
// 3. SALTS: Folded semi-translucent glassine fever-salts sachet (flutters 1px when drawer closes!)
// 4. LINEN: Clean rolled linen gauze spool (unrolls loose strip)

import { GameState, PropType } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dryChalkPoly, gouacheBristle, dipPenRibbon, Pt } from '../art/dryTools';
import { drawInkText } from '../art/calligraphy';
import { clamp, lerp } from '../core/prng';

export const BOTTLE_RACK_HIT = { x: 960, y: 425, w: 300, h: 225 };

export function renderLayer05Bottles(ctx: CanvasRenderingContext2D, st: GameState): void {
  const boil = st.boilTick;
  const tilt = clamp(st.bottleTilt.value, 0, 1.1);
  const hover = st.hoverZone === 'bottle';
  const active: PropType = st.activeProp;
  // Subtle 1px sachet flutter when drawer closes rapidly (Gate 3 prop detail!)
  const flutter = Math.abs(st.drawerPos.velocity) > 0.25 ? Math.sin(st.simTime * 38) * 1.4 : 0;

  // Draw inactive props first, then active prop cleanly on top so pouring motion never clips behind siblings
  const baseOrder: PropType[] = ['linen', 'salts', 'camphor', 'valerian'];
  const order: PropType[] = baseOrder.sort((a, b) =>
    a === active ? 1 : b === active ? -1 : 0
  );

  for (const kind of order) {
    const isAct = kind === active;
    const tFrac = isAct ? tilt : 0;
    if (kind === 'valerian') drawValerianBottle(ctx, 976, 618, 66, 146, boil, hover && isAct, tFrac);
    else if (kind === 'camphor') drawCamphorMilkJar(ctx, 1054, 624, 64, 78, boil, hover && isAct, tFrac);
    else if (kind === 'salts') drawFeverSaltsSachet(ctx, 1128, 616, 60, 112, boil, hover && isAct, tFrac, flutter);
    else drawLinenGauzeRoll(ctx, 1198, 626, 54, 96, boil, hover && isAct, tFrac);
  }

  // Couple vessel shading physically to the desk lamp state (DIM drops vessels into room shadow; COUNTER adds warm left rim!)
  const counterLight = clamp(1 - Math.abs(st.lampAngle.value), 0, 1) * clamp(st.lampGlow.value, 0, 1.2);
  const dimShade = clamp(1 - st.lampGlow.value, 0, 0.92);
  if (dimShade > 0.06) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = rgbCss(PALETTE.velvetDark, dimShade * 0.46);
    ctx.fillRect(760, 380, 520, 340);
    ctx.restore();
  }
  if (counterLight > 0.15) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const rimG = ctx.createLinearGradient(960, 560, 1260, 560);
    rimG.addColorStop(0, rgbCss(PALETTE.sodiumLamp, 0.24 * counterLight));
    rimG.addColorStop(0.5, rgbCss(PALETTE.amberRim, 0.08 * counterLight));
    rimG.addColorStop(1, rgbCss(PALETTE.velvetDark, 0.14));
    ctx.fillStyle = rimG;
    ctx.fillRect(940, 420, 340, 240);
    ctx.restore();
  }
}

function drawValerianBottle(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  boil: number,
  hover: boolean,
  tiltFrac: number
): void {
  ctx.save();
  if (tiltFrac > 0.005) {
    const tx = lerp(bx + bw * 0.5, 845, tiltFrac);
    const ty = lerp(by - bh * 0.5, 515, tiltFrac);
    ctx.translate(tx, ty);
    ctx.rotate(-tiltFrac * 1.18);
    ctx.translate(-(bx + bw * 0.5), -(by - bh * 0.5));
  }

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

  dryChalkPoly(ctx, bodyPoly, PALETTE.amberBottle, { underpaint: { r: 58, g: 24, b: 12 }, pressure: 0.92, peek: 0.32, edgeRough: 0.8, boilSeed: boil + bx });

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
      [{ x: neckL + 2, y: neckTopY + 2 }, { x: neckR - 2, y: neckTopY + 2 }, { x: neckR, y: corkY }, { x: neckL, y: corkY }],
      { r: 126, g: 94, b: 64 },
      { underpaint: PALETTE.brassDark, pressure: 0.90, peek: 0.32, edgeRough: 0.6, boilSeed: boil + bx + 2 }
    );
  }
  dipPenRibbon(ctx, [{ x: neckL - 3, y: neckTopY + 1 }, { x: neckR + 3, y: neckTopY + 1 }], 4.0, PALETTE.brassMid, { taperMode: 'arch', alpha: 0.76, jitter: 0.25, seed: boil + bx + 5 });

  const lx = bx + 6;
  const lw = bw - 12;
  const ly = shoulderY + 18;
  const lh = bh * 0.44;
  dryChalkPoly(ctx, [{ x: lx, y: ly }, { x: lx + lw, y: ly - 1 }, { x: lx + lw, y: ly + lh }, { x: lx, y: ly + lh + 1 }], PALETTE.amberLabel, { underpaint: { r: 96, g: 82, b: 64 }, pressure: 0.94, peek: 0.18, edgeRough: 0.5, boilSeed: boil + bx + 9 });
  drawInkText(ctx, 'VALERIAN', lx + lw * 0.5, ly + 11, { size: 8.4, color: PALETTE.velvetDark, strokeWidth: 1.25, align: 'center', boilSeed: boil + bx, jitter: 0.15 });
  drawInkText(ctx, '20mg', lx + lw * 0.5, ly + 28, { size: 7.4, color: { r: 122, g: 36, b: 26 }, strokeWidth: 1.15, align: 'center', boilSeed: boil + bx + 3, jitter: 0.15 });

  gouacheBristle(ctx, bx + 5, shoulderY + 12, bx + 6, by - 12, 3.6, PALETTE.amberRim, { bristles: 3, alpha: hover ? 0.84 : 0.58, deplete: 0.48, seed: boil + bx + 11 });
  dipPenRibbon(ctx, [...bodyPoly, bodyPoly[0]], 2.8, PALETTE.velvetDark, { taperMode: 'velocity', jitter: 0.6, seed: boil + bx + 19 });
  ctx.restore();
}

// Squat Milk-Glass Camphor Balm Jar + Quarter-Turn Brushed Tin Lid! (Opus Gate 3!)
function drawCamphorMilkJar(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  boil: number,
  hover: boolean,
  glideFrac: number
): void {
  ctx.save();
  if (glideFrac > 0.005) {
    // Low-friction glide across counter toward slate tray (does NOT pour upside-down!)
    const gx = lerp(0, -195, glideFrac);
    const gy = lerp(0, -34, glideFrac);
    ctx.translate(gx, gy);
  }

  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.74);
  ctx.beginPath();
  ctx.ellipse(bx + bw * 0.52, by + 5, bw * 0.56, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Squat milk-glass cylinder body (muted slate-milk so it sits mid-value in 3-value squint!)
  const jarPoly: Pt[] = [
    { x: bx + 4, y: by },
    { x: bx + bw - 4, y: by },
    { x: bx + bw, y: by - 8 },
    { x: bx + bw, y: by - bh + 12 },
    { x: bx + bw - 6, y: by - bh },
    { x: bx + 6, y: by - bh },
    { x: bx, y: by - bh + 12 },
    { x: bx, y: by - 8 },
  ];
  dryChalkPoly(ctx, jarPoly, { r: 124, g: 120, b: 112 }, { underpaint: { r: 64, g: 60, b: 56 }, pressure: 0.92, peek: 0.24, edgeRough: 0.7, boilSeed: boil + 201 });

  // Brushed tin quarter-turn screw lid (lifts slightly when gliding open!)
  const lidOffY = -glideFrac * 14;
  const lidPoly: Pt[] = [
    { x: bx + 3, y: by - bh + lidOffY },
    { x: bx + bw - 3, y: by - bh + lidOffY },
    { x: bx + bw - 2, y: by - bh - 15 + lidOffY },
    { x: bx + 2, y: by - bh - 15 + lidOffY },
  ];
  dryChalkPoly(ctx, lidPoly, hover ? PALETTE.brassWarm : { r: 94, g: 98, b: 102 }, { underpaint: PALETTE.velvetDark, pressure: 0.94, peek: 0.24, edgeRough: 0.5, boilSeed: boil + 205 });

  // Aged parchment band label
  const ly = by - bh * 0.68;
  dryChalkPoly(ctx, [{ x: bx + 5, y: ly }, { x: bx + bw - 5, y: ly }, { x: bx + bw - 5, y: ly + 34 }, { x: bx + 5, y: ly + 34 }], PALETTE.amberLabel, { pressure: 0.92, peek: 0.16, edgeRough: 0.4, boilSeed: boil + 207 });
  drawInkText(ctx, 'CAMPHOR', bx + bw * 0.5, ly + 8, { size: 7.8, color: PALETTE.velvetDark, strokeWidth: 1.2, align: 'center', boilSeed: boil + 209 });
  drawInkText(ctx, 'BALM', bx + bw * 0.5, ly + 21, { size: 6.8, color: { r: 118, g: 38, b: 28 }, strokeWidth: 1.05, align: 'center', boilSeed: boil + 210 });

  dipPenRibbon(ctx, [...jarPoly, jarPoly[0]], 2.5, PALETTE.velvetDark, { taperMode: 'velocity', jitter: 0.5, seed: boil + 211 });
  dipPenRibbon(ctx, [...lidPoly, lidPoly[0]], 2.2, PALETTE.velvetDark, { taperMode: 'velocity', jitter: 0.4, seed: boil + 212 });
  ctx.restore();
}

// Folded Semi-Translucent Glassine Fever Salts Sachet (flutters 1px on drawer slam!)
function drawFeverSaltsSachet(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  boil: number,
  hover: boolean,
  tiltFrac: number,
  flutter: number
): void {
  ctx.save();
  if (tiltFrac > 0.005) {
    const tx = lerp(bx + bw * 0.5, 836, tiltFrac);
    const ty = lerp(by - bh * 0.5, 526, tiltFrac);
    ctx.translate(tx, ty);
    ctx.rotate(-tiltFrac * 0.95);
    ctx.translate(-(bx + bw * 0.5), -(by - bh * 0.5));
  }

  const f = flutter;
  const poly: Pt[] = [
    { x: bx + 2 + f, y: by },
    { x: bx + bw - 2 + f, y: by + 2 },
    { x: bx + bw + 4 - f, y: by - bh + 18 },
    { x: bx + bw - 4 - f, y: by - bh },
    { x: bx - 2 + f, y: by - bh + 4 },
    { x: bx - 4 + f, y: by - bh + 22 },
  ];
  dryChalkPoly(ctx, poly, hover ? { r: 162, g: 150, b: 126 } : { r: 132, g: 124, b: 106 }, {
    underpaint: { r: 78, g: 70, b: 58 },
    pressure: 0.88,
    peek: 0.24,
    edgeRough: 0.8,
    boilSeed: boil + 221,
  });
  // Folded glassine top lip seam
  dipPenRibbon(ctx, [{ x: bx - 3, y: by - bh + 20 }, { x: bx + bw + 3, y: by - bh + 17 }], 1.8, { r: 82, g: 72, b: 60 }, { taperMode: 'velocity', inkPool: false, jitter: 0.3, seed: boil + 223 });
  drawInkText(ctx, 'SALTS', bx + bw * 0.5, by - bh * 0.56, { size: 8.6, color: PALETTE.velvetDark, strokeWidth: 1.25, align: 'center', boilSeed: boil + 225 });
  drawInkText(ctx, 'PULV.', bx + bw * 0.5, by - bh * 0.36, { size: 7.4, color: { r: 122, g: 36, b: 26 }, strokeWidth: 1.1, align: 'center', boilSeed: boil + 227 });
  dipPenRibbon(ctx, [...poly, poly[0]], 2.2, PALETTE.velvetDark, { taperMode: 'velocity', jitter: 0.5, seed: boil + 229 });
  ctx.restore();
}

// Rolled Linen Gauze Spool (silent damped cloth roll)
function drawLinenGauzeRoll(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  boil: number,
  hover: boolean,
  tiltFrac: number
): void {
  ctx.save();
  if (tiltFrac > 0.005) {
    const tx = lerp(bx + bw * 0.5, 840, tiltFrac);
    const ty = lerp(by - bh * 0.5, 534, tiltFrac);
    ctx.translate(tx, ty);
    ctx.rotate(-tiltFrac * 0.65);
    ctx.translate(-(bx + bw * 0.5), -(by - bh * 0.5));
  }

  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.72);
  ctx.beginPath();
  ctx.ellipse(bx + bw * 0.52, by + 5, bw * 0.56, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  const poly: Pt[] = [
    { x: bx + 2, y: by },
    { x: bx + bw - 2, y: by },
    { x: bx + bw, y: by - bh },
    { x: bx, y: by - bh },
  ];
  dryChalkPoly(ctx, poly, hover ? { r: 158, g: 146, b: 124 } : { r: 126, g: 116, b: 98 }, {
    underpaint: { r: 76, g: 68, b: 56 },
    pressure: 0.92,
    peek: 0.28,
    edgeRough: 0.8,
    boilSeed: boil + 241,
  });
  // Spiral top end of rolled gauze cylinder
  ctx.strokeStyle = rgbCss(PALETTE.velvetDark, 0.72);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.ellipse(bx + bw * 0.5, by - bh, bw * 0.46, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(bx + bw * 0.5, by - bh, bw * 0.22, 3.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  drawInkText(ctx, 'LINEN', bx + bw * 0.5, by - bh * 0.54, { size: 8.2, color: PALETTE.velvetDark, strokeWidth: 1.2, align: 'center', boilSeed: boil + 245 });
  dipPenRibbon(ctx, [...poly, poly[0]], 2.4, PALETTE.velvetDark, { taperMode: 'velocity', jitter: 0.5, seed: boil + 247 });
  ctx.restore();
}
