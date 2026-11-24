// VACUUM LAYER 01 (Phase 2 — Dynamic 4-Night Storm & Dawn Atmosphere + Tomas's Steady Lamp Consequence)

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dryChalkPoly, gouacheBristle, dipPenRibbon, rainHalftoneScreen } from '../art/dryTools';
import { clamp, hash2, fbmRot, smoothstep } from '../core/prng';

export const HATCH_RECT = { x: 184, y: 44, w: 912, h: 422 };

export function renderLayer01Street(ctx: CanvasRenderingContext2D, st: GameState, W: number, H: number): void {
  const { x, y, w, h } = HATCH_RECT;
  const isDawn =
    st.beat === 'n1_dawn' ||
    st.beat === 'n2_dawn' ||
    st.beat === 'n3_dawn' ||
    st.beat === 'n4_dawn_packet' ||
    st.beat === 'ending_dawn';
  const boil = st.boilTick;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x - 2, y - 2, w + 4, h + 4);
  ctx.clip();

  // 1. Cold #1A2230 glass-side underpaint & wet storm sky (paling slightly at 04:48..05:00 dawn)
  const skyCol =
    st.beat === 'ending_dawn'
      ? { r: 58, g: 72, b: 86 }
      : isDawn
        ? { r: 36, g: 48, b: 62 }
        : PALETTE.rainIndigo;
  dryChalkPoly(
    ctx,
    [
      { x: x - 2, y: y - 2 },
      { x: x + w + 2, y: y - 2 },
      { x: x + w + 2, y: y + h + 2 },
      { x: x - 2, y: y + h + 2 },
    ],
    skyCol,
    { underpaint: PALETTE.glassUnderpaint, pressure: 0.90, peek: 0.34, edgeRough: 0.8, boilSeed: boil }
  );

  // Far corner rowhouses across wet lane
  dryChalkPoly(
    ctx,
    [
      { x: x, y: y + 196 },
      { x: x + 225, y: y + 168 },
      { x: x + 245, y: y + 112 },
      { x: x + 468, y: y + 118 },
      { x: x + 482, y: y + 180 },
      { x: x + 710, y: y + 150 },
      { x: x + 736, y: y + 96 },
      { x: x + w, y: y + 104 },
      { x: x + w, y: y + 292 },
      { x: x, y: y + 292 },
    ],
    { r: 14, g: 20, b: 30 },
    { underpaint: PALETTE.velvetDark, pressure: 0.92, peek: 0.22, edgeRough: 1.2, boilSeed: boil }
  );

  // 2. Backlight halo (#34404C, 120px radial) behind visitor head/shoulders
  if (st.visitor !== 'none' && st.visitorPresence.value > 0.05) {
    const pres = clamp(st.visitorPresence.value, 0, 1);
    const vcx = x + w * 0.44 - (1 - pres) * 145;
    const vcy = y + 206;
    const backGrad = ctx.createRadialGradient(vcx, vcy, 12, vcx, vcy, 138);
    backGrad.addColorStop(0, rgbCss(PALETTE.glassBacklight, 0.92 * pres));
    backGrad.addColorStop(0.55, rgbCss(PALETTE.glassBacklight, 0.56 * pres));
    backGrad.addColorStop(1, rgbCss(PALETTE.glassBacklight, 0));
    ctx.fillStyle = backGrad;
    ctx.beginPath();
    ctx.arc(vcx, vcy, 138, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wet cobblestone / asphalt street ground
  dryChalkPoly(
    ctx,
    [
      { x: x, y: y + 286 },
      { x: x + w, y: y + 286 },
      { x: x + w, y: y + h + 2 },
      { x: x, y: y + h + 2 },
    ],
    isDawn ? { r: 42, g: 52, b: 64 } : { r: 20, g: 28, b: 40 },
    { underpaint: PALETTE.glassUnderpaint, pressure: 0.88, peek: 0.32, edgeRough: 1.0, boilSeed: boil }
  );

  // Recessed stone Wischnische side masonry cheeks
  dryChalkPoly(
    ctx,
    [
      { x: x, y: y },
      { x: x + 64, y: y + 22 },
      { x: x + 64, y: y + h },
      { x: x, y: y + h },
    ],
    { r: 15, g: 19, b: 26 },
    { underpaint: PALETTE.velvetDark, pressure: 0.92, peek: 0.25, edgeRough: 1.2, boilSeed: boil }
  );
  dryChalkPoly(
    ctx,
    [
      { x: x + w, y: y },
      { x: x + w - 64, y: y + 22 },
      { x: x + w - 64, y: y + h },
      { x: x + w, y: y + h },
    ],
    { r: 14, g: 18, b: 25 },
    { underpaint: PALETTE.velvetDark, pressure: 0.92, peek: 0.25, edgeRough: 1.2, boilSeed: boil }
  );

  // 3. Pulled-down halved Muted Verdigris Pharmacy Cross (#2F6B62) + vertical wet-street smear
  const crossX = x + 158;
  const crossY = y + 116;
  const vg = clamp(st.dna.verdigrisGlow, 0, 2.5);
  if (vg > 0.01) {
    const rad = 46 * Math.min(1.6, 0.72 + vg * 0.5);
    const grad = ctx.createRadialGradient(crossX, crossY, 3, crossX, crossY, rad);
    grad.addColorStop(0, rgbCss(PALETTE.verdigrisCross, 0.50 * Math.min(1.5, vg)));
    grad.addColorStop(0.55, rgbCss(PALETTE.verdigrisCross, 0.14 * Math.min(1.5, vg)));
    grad.addColorStop(1, rgbCss(PALETTE.verdigrisCross, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(crossX - rad, crossY - rad, rad * 2, rad * 2);

    ctx.fillStyle = rgbCss({ r: 62, g: 132, b: 120 }, 0.34 * Math.min(1.4, vg));
    ctx.fillRect(crossX - 5, crossY - 15, 10, 30);
    ctx.fillRect(crossX - 15, crossY - 5, 30, 10);

    drawVerticalStreetSmear(ctx, crossX + 4, y + 292, 18, 102, PALETTE.verdigrisCross, 0.28 * Math.min(1.4, vg), boil + 11, st.simTime);
  }

  // 4. Corner Sodium Streetlamp (FLICKERS Night I; STEADY Nights II..IV if Tomas graced!)
  const poleX = x + 742;
  const lampY = y + 92;
  const isSteady = st.nightNum >= 2 && st.tomasGraced;
  let polePower = 1.0;
  if (!isSteady && !isDawn) {
    const phase = st.simTime * 3.7;
    const stutter = hash2(Math.floor(st.simTime * 9), 3, 29);
    if (stutter < 0.14) polePower = 0.24;
    else if (stutter < 0.24) polePower = 0.62;
    else polePower = 0.88 + 0.1 * Math.sin(phase);
  } else if (isDawn) {
    polePower = st.beat === 'ending_dawn' ? 0.28 : 0.44;
  }

  dipPenRibbon(
    ctx,
    [
      { x: poleX, y: y + 292 },
      { x: poleX + 2, y: lampY + 4 },
      { x: poleX - 24, y: lampY - 4 },
    ],
    5.0,
    PALETTE.velvetDark,
    { taperMode: 'velocity', inkPool: true, jitter: 0.6, seed: boil + 5 }
  );

  // Noisy broken sodium bloom halo
  const lampHeadX = poleX - 26;
  const lampHeadY = lampY + 2;
  const haloR = (108 + (isSteady ? 24 : 0)) * (0.72 + 0.28 * polePower);
  for (let p = 0; p < 9; p++) {
    const ang = (p / 9) * Math.PI * 2 + hash2(p, boil, 19) * 0.5;
    const dist = p === 0 ? 0 : 14 + hash2(p, 2, 19) * 32;
    const pr = p === 0 ? haloR * 0.62 : haloR * (0.42 + hash2(p, 3, 19) * 0.36);
    const px = lampHeadX + Math.cos(ang) * dist;
    const py = lampHeadY + Math.sin(ang) * dist * 0.85;
    const g = ctx.createRadialGradient(px, py, 2, px, py, pr);
    g.addColorStop(0, rgbCss(p === 0 ? { r: 252, g: 214, b: 142 } : PALETTE.sodiumLamp, (p === 0 ? 0.72 : 0.14) * polePower));
    g.addColorStop(0.5, rgbCss(PALETTE.sodiumLamp, (p === 0 ? 0.22 : 0.06) * polePower));
    g.addColorStop(1, rgbCss(PALETTE.sodiumLamp, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  drawVerticalStreetSmear(ctx, lampHeadX, y + 290, 26, 134, PALETTE.sodiumLamp, 0.46 * polePower, boil + 31, st.simTime);
  drawVerticalStreetSmear(ctx, lampHeadX - 38, y + 298, 14, 88, PALETTE.amberRim, 0.22 * polePower, boil + 37, st.simTime);

  // 5. Exterior CURB Lamp Cast onto wet exterior sill/pavement
  const curbMix = smoothstep(1.25, 2.0, st.lampAngle.value);
  if (curbMix > 0.02) {
    const cg = ctx.createRadialGradient(x + w * 0.48, y + h + 15, 18, x + w * 0.5, y + h - 45, 340);
    cg.addColorStop(0, rgbCss(PALETTE.sodiumLamp, 0.52 * curbMix * st.dna.lampIntensity));
    cg.addColorStop(0.55, rgbCss(PALETTE.amberRim, 0.18 * curbMix * st.dna.lampIntensity));
    cg.addColorStop(1, rgbCss(PALETTE.sodiumLamp, 0));
    ctx.fillStyle = cg;
    ctx.fillRect(x, y + h - 220, w, 240);
  }

  // 6. Rotated-Octave FBM (36.87 deg) + Ordered Halftone Storm Screen (EXTERIOR ONLY)
  rainHalftoneScreen(ctx, x, y, w, h, { r: 150, g: 176, b: 198 }, st.dna.halftoneStrength * st.weatherIntensity, st.simTime, 11);

  // 7. Smooth 60fps slanting exterior winter rain streaks scaling with night storm intensity!
  const rainCount = Math.floor(82 * clamp(st.dna.rainDensity * st.weatherIntensity, 0, 2.8));
  ctx.lineCap = 'round';
  for (let i = 0; i < rainCount; i++) {
    const rxBase = hash2(i, 1, 88) * (w + 140) - 70;
    const speed = 420 + hash2(i, 2, 88) * 340;
    const yOff = (st.simTime * speed + hash2(i, 3, 88) * 900) % (h + 90) - 45;
    const xPos = x + rxBase - yOff * 0.22;
    const yPos = y + yOff;
    const len = 18 + hash2(i, 4, 88) * 34;

    const dPole = Math.hypot(xPos - lampHeadX, yPos - lampHeadY);
    const warmCatch = clamp(1 - dPole / 220, 0, 1) * polePower + curbMix * clamp((yPos - (y + 210)) / 200, 0, 1) * 0.7;
    const col = warmCatch > 0.28 ? { r: 238, g: 192, b: 122 } : { r: 144, g: 170, b: 192 };
    const a = 0.14 + warmCatch * 0.34 + hash2(i, 5, 88) * 0.12;
    ctx.strokeStyle = rgbCss(col, clamp(a, 0, 0.72));
    ctx.lineWidth = 0.8 + hash2(i, 6, 88) * 0.9;
    ctx.beginPath();
    ctx.moveTo(xPos, yPos);
    ctx.lineTo(xPos - len * 0.22, yPos + len);
    ctx.stroke();
  }

  dipPenRibbon(ctx, [{ x: x + 64, y: y + 22 }, { x: x + 64, y: y + h }], 3.0, PALETTE.velvetDark, {
    taperMode: 'velocity',
    jitter: 0.6,
    seed: boil + 19,
  });
  dipPenRibbon(ctx, [{ x: x + w - 64, y: y + 22 }, { x: x + w - 64, y: y + h }], 3.0, PALETTE.velvetDark, {
    taperMode: 'velocity',
    jitter: 0.6,
    seed: boil + 23,
  });

  ctx.restore();
  void W;
  void H;
}

function drawVerticalStreetSmear(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  width: number,
  height: number,
  color: { r: number; g: number; b: number },
  alpha: number,
  seed: number,
  t: number
): void {
  const vg = ctx.createLinearGradient(cx, topY, cx, topY + height);
  vg.addColorStop(0, rgbCss(color, alpha * 0.52));
  vg.addColorStop(0.65, rgbCss(color, alpha * 0.24));
  vg.addColorStop(1, rgbCss(color, 0));
  ctx.fillStyle = vg;
  ctx.fillRect(cx - width * 0.45, topY, width * 0.9, height);

  const slices = Math.floor(height / 5);
  for (let i = 0; i < slices; i++) {
    const sy = topY + i * 5 + (hash2(i, seed, 41) - 0.5) * 2.5;
    const u = i / Math.max(1, slices);
    const n = fbmRot(cx * 0.03 + u * 2.2, i * 0.45 + t * 0.7, 2, seed + 5);
    if (n < 0.36) continue;
    const spread = width * (0.45 + u * 0.95) * (0.55 + n * 0.85);
    const ox = (hash2(i, seed, 73) - 0.5) * width * 0.8;
    gouacheBristle(ctx, cx + ox - spread * 0.5, sy, cx + ox + spread * 0.5, sy + 0.8, 3.2, color, {
      bristles: 3,
      alpha: alpha * (1 - u * 0.65) * (0.5 + n * 0.5),
      deplete: 0.45,
      seed: seed + i,
    });
  }
}
