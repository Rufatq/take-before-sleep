// VACUUM LAYER 03 (Phase 2 — Multi-Bottle Height-Ordered Reflections, Nadia's Finger Fog Ovals,
// Halvorsen's Night IV Glass Knock Ripple, Warm-Latch Condensation Clearing, 1.4s Steel Shutter)

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dipPenRibbon, gouacheBristle, buildEllipsePts } from '../art/dryTools';
import { clamp, hash2, smoothstep } from '../core/prng';
import { HATCH_RECT } from './layer01_street';

export const INTERCOM_GRILLE = { cx: 954, cy: 274, r: 44 };

export function renderLayer03Glass(ctx: CanvasRenderingContext2D, st: GameState): void {
  const { x, y, w, h } = HATCH_RECT;
  const boil = st.boilTick;

  const counterMix = clamp(1 - Math.abs(st.lampAngle.value), 0, 1);
  const curbMix = smoothstep(1.2, 2.0, st.lampAngle.value);
  const reflectGain = counterMix * clamp(st.dna.glassReflect, 0, 2.0) * clamp(st.dna.lampIntensity, 0.2, 2.5);

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  // 1. Subtle laminated glass tint
  const glassGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  glassGrad.addColorStop(0, rgbCss(PALETTE.glassMid, 0.20 + counterMix * 0.14));
  glassGrad.addColorStop(0.5, rgbCss(PALETTE.glassUnderpaint, 0.10 + counterMix * 0.08));
  glassGrad.addColorStop(1, rgbCss(PALETTE.velvetDark, 0.20));
  ctx.fillStyle = glassGrad;
  ctx.fillRect(x, y, w, h);

  // 2. Warm Counter Umber (#3A2A1C) bleeding 8px UP into bottom edge of glass at 25%
  const bleedGrad = ctx.createLinearGradient(0, y + h - 10, 0, y + h);
  bleedGrad.addColorStop(0, rgbCss(PALETTE.counterUmber, 0));
  bleedGrad.addColorStop(0.2, rgbCss(PALETTE.counterUmber, 0.18));
  bleedGrad.addColorStop(1, rgbCss(PALETTE.counterUmber, 0.28));
  ctx.fillStyle = bleedGrad;
  ctx.fillRect(x, y + h - 10, w, 10);

  // 3. COUNTER-MODE MIRRORED BACK-SHELF GHOST (Pharmacy-native microsleep proof: uncorked stoppers + loose tablets + chalk tallies!)
  if (reflectGain > 0.04) {
    ctx.save();
    ctx.globalAlpha = clamp(reflectGain * 0.64, 0, 0.88);

    const lampGhost = ctx.createRadialGradient(x + 210, y + 320, 12, x + 210, y + 320, 240);
    lampGhost.addColorStop(0, rgbCss(PALETTE.sodiumLamp, 0.30));
    lampGhost.addColorStop(0.6, rgbCss(PALETTE.underpaint, 0.12));
    lampGhost.addColorStop(1, rgbCss(PALETTE.sodiumLamp, 0));
    ctx.fillStyle = lampGhost;
    ctx.fillRect(x, y, w, h);

    const shelfY = y + 188;
    gouacheBristle(ctx, x + 260, shelfY, x + 810, shelfY + 2, 8, PALETTE.amberRim, {
      bristles: 6,
      alpha: 0.32,
      deplete: 0.4,
      seed: boil + 7,
    });

    // Unremembered tally strokes scratched softly into the mirrored back-shelf wood edge
    if (st.ledgerTallies > 0) {
      const tx0 = x + 278;
      for (let t = 0; t < Math.min(st.ledgerTallies, 5); t++) {
        if (t === 4) {
          dipPenRibbon(ctx, [{ x: tx0 - 4, y: shelfY - 12 }, { x: tx0 + 28, y: shelfY - 30 }], 2.2, PALETTE.bonePaper, { taperMode: 'velocity', alpha: 0.68, inkPool: false, jitter: 0.25, seed: boil + 61 });
        } else {
          const tx = tx0 + t * 7;
          dipPenRibbon(ctx, [{ x: tx, y: shelfY - 32 }, { x: tx + 1, y: shelfY - 10 }], 2.0, PALETTE.bonePaper, { taperMode: 'velocity', alpha: 0.62, inkPool: false, jitter: 0.2, seed: boil + 62 + t });
        }
      }
    }

    const ghostBottles = [
      { bx: x + 325, bw: 44, bh: 92 },
      { bx: x + 412, bw: 48, bh: 106 },
      { bx: x + 506, bw: 42, bh: 86 },
      { bx: x + 592, bw: 46, bh: 98 },
    ];

    ghostBottles.forEach((b, idx) => {
      const uncorked = st.uncorkedBottles.includes(idx);
      ctx.fillStyle = rgbCss(PALETTE.amberBottle, uncorked ? 0.56 : 0.44);
      ctx.fillRect(b.bx, shelfY - b.bh, b.bw, b.bh);
      ctx.fillRect(b.bx + b.bw * 0.28, shelfY - b.bh - 18, b.bw * 0.44, 18);
      ctx.strokeStyle = rgbCss(PALETTE.amberRim, uncorked ? 0.62 : 0.36);
      ctx.lineWidth = 1.4;
      ctx.strokeRect(b.bx, shelfY - b.bh, b.bw, b.bh);

      // Every bottle keeps its front label facing forward; when uncorked during a lost minute,
      // its stopper sits neatly beside its base with a single loose measured tablet / wax slip!
      ctx.fillStyle = rgbCss(PALETTE.amberLabel, 0.58);
      ctx.fillRect(b.bx + 6, shelfY - b.bh * 0.72, b.bw - 12, b.bh * 0.42);
      ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.36);
      ctx.fillRect(b.bx + 10, shelfY - b.bh * 0.58, b.bw - 20, 2);
      ctx.fillRect(b.bx + 10, shelfY - b.bh * 0.46, b.bw - 26, 2);

      if (!uncorked) {
        // Seated cork stopper in neck
        ctx.fillStyle = rgbCss({ r: 158, g: 122, b: 84 }, 0.66);
        ctx.fillRect(b.bx + b.bw * 0.31, shelfY - b.bh - 28, b.bw * 0.38, 11);
      } else {
        // ANOMALY: Open hollow bottle mouth + cork laid neatly on shelf beside base + loose chalk tablet!
        ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.78);
        ctx.fillRect(b.bx + b.bw * 0.32, shelfY - b.bh - 18, b.bw * 0.36, 6);
        ctx.fillStyle = rgbCss({ r: 174, g: 136, b: 92 }, 0.78);
        ctx.fillRect(b.bx + b.bw + 5, shelfY - 12, 13, 10);
        // Loose measured bone tablet / folded slip beside uncorked bottle
        ctx.fillStyle = rgbCss(PALETTE.bonePaper, 0.82);
        ctx.beginPath();
        ctx.ellipse(b.bx + b.bw + 24, shelfY - 5, 5.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.22);
    ctx.beginPath();
    ctx.moveTo(x + 24, y + h);
    ctx.quadraticCurveTo(x + 125, y + h - 145, x + 235, y + h);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // 4. Nadia's Two Fading Fingertip Condensation Ovals on Cold Glass (3s decay per Gate 3!)
  if (st.nadiaFogAlpha > 0.02) {
    const fx = x + w * 0.44 - 14 + 84;
    const fy = y + 298;
    for (const [dx, dy] of [
      [-6, -4],
      [6, 1],
    ]) {
      const fg = ctx.createRadialGradient(fx + dx, fy + dy, 1, fx + dx, fy + dy, 14);
      fg.addColorStop(0, rgbCss(PALETTE.glassRim, 0.26 * st.nadiaFogAlpha));
      fg.addColorStop(0.6, rgbCss(PALETTE.glassRim, 0.10 * st.nadiaFogAlpha));
      fg.addColorStop(1, rgbCss(PALETTE.glassRim, 0));
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.ellipse(fx + dx, fy + dy, 10, 15, 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 5. Night IV Halvorsen Single Knuckle Knock Ripple on Glass (interrupts microsleep!)
  if (st.microsleep.knockFlash > 0.02) {
    const kx = x + w * 0.56;
    const ky = y + 252;
    const u = 1 - st.microsleep.knockFlash;
    ctx.strokeStyle = rgbCss(PALETTE.glassRim, 0.55 * st.microsleep.knockFlash);
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(kx, ky, 8 + u * 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = rgbCss(PALETTE.sodiumLamp, 0.45 * st.microsleep.knockFlash);
    ctx.beginPath();
    ctx.arc(kx, ky, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. CURB mode warm flare glare on lower glass
  if (curbMix > 0.02) {
    const fg = ctx.createRadialGradient(x + 260, y + h - 14, 8, x + 280, y + h - 30, 320);
    fg.addColorStop(0, rgbCss(PALETTE.sodiumLamp, 0.44 * curbMix));
    fg.addColorStop(0.5, rgbCss(PALETTE.amberRim, 0.14 * curbMix));
    fg.addColorStop(1, rgbCss(PALETTE.sodiumLamp, 0));
    ctx.fillStyle = fg;
    ctx.fillRect(x, y, w, h);
  }

  // 7. Glass condensation & running water beads (leaving a quiet DRY patch directly above warm latch!)
  for (let i = 0; i < 6; i++) {
    const sx = x + 48 + hash2(i, 1, 55) * (w - 96);
    const sy = y + 36 + hash2(i, 2, 55) * (h - 90);
    gouacheBristle(ctx, sx, sy, sx + 52 + hash2(i, 3, 55) * 85, sy - 16, 2.0, PALETTE.glassRim, {
      bristles: 2,
      alpha: 0.10 + counterMix * 0.07,
      deplete: 0.85,
      seed: 100 + i,
    });
  }

  const dropCount = Math.floor(38 * clamp(st.dna.rainDensity * st.weatherIntensity, 0.2, 2.8));
  for (let i = 0; i < dropCount; i++) {
    const bx = x + 22 + hash2(i, 7, 131) * (w - 44);
    const fallRate = 14 + hash2(i, 8, 131) * 32;
    const by = y + ((st.simTime * fallRate + hash2(i, 9, 131) * 600) % (h - 20)) + 10;
    const r = 1.6 + hash2(i, 10, 131) * 2.2;

    ctx.strokeStyle = rgbCss(PALETTE.glassRim, 0.08);
    ctx.lineWidth = r * 0.65;
    ctx.beginPath();
    ctx.moveTo(bx, Math.max(y, by - r * 14));
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.42);
    ctx.beginPath();
    ctx.arc(bx + 0.5, by + 1.1, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = rgbCss(PALETTE.glassRim, 0.48);
    ctx.beginPath();
    ctx.arc(bx - 0.5, by - 0.5, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Structural mullions + 1px #EBE0CC 40% perimeter rim
  const leftMullionX = x + 196;
  const rightMullionX = x + w - 196;
  for (const mx of [leftMullionX, rightMullionX]) {
    ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.84);
    ctx.fillRect(mx - 4, y, 8, h);
    ctx.strokeStyle = rgbCss(PALETTE.glassRim, 0.40);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mx + 4.5, y);
    ctx.lineTo(mx + 4.5, y + h);
    ctx.stroke();
  }
  ctx.strokeStyle = rgbCss(PALETTE.glassRim, 0.40);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);

  // 9. Circular Brass Intercom Grille (Middle-value brass #8C6634)
  const { cx, cy, r } = INTERCOM_GRILLE;
  const pressed = st.intercomSpring.value;
  const hover = st.hoverZone === 'intercom';
  const ringPts = buildEllipsePts(cx, cy, r, r, 22, 0.6, boil + 17);

  ctx.fillStyle = rgbCss({ r: 20, g: 17, b: 16 }, 0.94);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = rgbCss(hover || pressed > 0.2 ? PALETTE.brassWarm : PALETTE.brassMid, 0.90);
  ctx.lineWidth = 4.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
  ctx.stroke();
  dipPenRibbon(ctx, ringPts, 2.5, PALETTE.velvetDark, { taperMode: 'arch', jitter: 0.5, seed: boil + 29 });

  const holeScale = 1 - pressed * 0.06;
  for (const ringR of [12, 25]) {
    const count = ringR === 12 ? 6 : 12;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (ringR === 12 ? 0.2 : 0);
      const hx = cx + Math.cos(a) * ringR * holeScale;
      const hy = cy + Math.sin(a) * ringR * holeScale;
      ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.96);
      ctx.beginPath();
      ctx.arc(hx, hy, 3.0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = rgbCss(pressed > 0.15 ? PALETTE.sodiumLamp : PALETTE.brassDark, 0.95);
  ctx.beginPath();
  ctx.arc(cx, cy, 4.8 - pressed * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // 10. 1.4s Corrugated Steel Night Shutter Slats descending cleanly over glass
  const shut = clamp(Math.max(st.shutterProgress, st.shutterClosed.value), 0, 1);
  if (shut > 0.01) {
    const shH = h * shut;
    ctx.fillStyle = rgbCss({ r: 22, g: 26, b: 32 }, 0.98);
    ctx.fillRect(x, y, w, shH);
    for (let sy = y + 18; sy < y + shH; sy += 22) {
      ctx.strokeStyle = rgbCss(PALETTE.velvetDark, 0.88);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x, sy);
      ctx.lineTo(x + w, sy);
      ctx.stroke();
      ctx.strokeStyle = rgbCss(PALETTE.glassRim, 0.16);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, sy + 2);
      ctx.lineTo(x + w, sy + 2);
      ctx.stroke();
    }
    // Heavy steel bottom rail lip
    ctx.fillStyle = rgbCss(PALETTE.brassDark, 0.92);
    ctx.fillRect(x, y + shH - 8, w, 8);
  }

  ctx.restore();
}
