// VACUUM LAYER 07 (Opus Gate 2 Upgraded):
// - Lamp cone starts STRICTLY at circular brass hood mouth (tip = mouth width!)
// - Long edges feathered 18px -> 30px widening with distance (^1.35) into existing desk pool
// - 8% 4x4 Bayer ordered dither woven into lamp falloff so it shares the game's tactile dither grammar
// - NO thin UI shockwave ring (localized 1-frame inverted seal patch + 7 spatter dots live in Layer 06!)

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { clamp, smoothstep, bayer4 } from '../core/prng';
import { getLampMouthGeometry } from './layer06_counter';

// Cached soft feathered + 8% Bayer-dithered volumetric cone strip for crisp 60fps performance
let coneCacheCanvas: HTMLCanvasElement | null = null;
let coneCacheKey = '';

function renderFeatheredBayerCone(
  ctx: CanvasRenderingContext2D,
  st: GameState,
  W: number,
  H: number,
  counterMix: number,
  intensity: number,
  poolR: number
): void {
  const m = getLampMouthGeometry(st);
  const targetX = 520;
  const targetY = 626;
  const key = `${m.cx | 0}_${m.cy | 0}_${(counterMix * 40) | 0}_${(intensity * 20) | 0}_${(poolR * 30) | 0}`;

  if (!coneCacheCanvas) {
    coneCacheCanvas = document.createElement('canvas');
    coneCacheCanvas.width = W / 2; // 2px Bayer cell pitch matches Gate 2 2px texture rhythm!
    coneCacheCanvas.height = H / 2;
  }

  if (coneCacheKey !== key) {
    coneCacheKey = key;
    const cw = coneCacheCanvas.width;
    const ch = coneCacheCanvas.height;
    const cctx = coneCacheCanvas.getContext('2d')!;
    const img = cctx.createImageData(cw, ch);
    const d = img.data;

    const ox = m.cx * 0.5;
    const oy = m.cy * 0.5;
    const tx = targetX * 0.5;
    const ty = targetY * 0.5;
    const ax = tx - ox;
    const ay = ty - oy;
    const axisLen = Math.max(1, Math.hypot(ax, ay));
    const ux = ax / axisLen;
    const uy = ay / axisLen;
    const nx = -uy;
    const ny = ux;

    const mouthHalf = m.mouthHalf * 0.5; // Starts strictly as wide as hood mouth!
    const endHalf = Math.min(cw, ch) * poolR * 0.92;
    const poolRx = Math.min(cw, ch) * poolR * 1.38;
    const poolRy = Math.min(cw, ch) * poolR * 0.72;

    const sr = PALETTE.sodiumLamp.r;
    const sg = PALETTE.sodiumLamp.g;
    const sb = PALETTE.sodiumLamp.b;
    const gain = counterMix * intensity;

    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const dx = x - ox;
        const dy = y - oy;
        const along = dx * ux + dy * uy;
        const perp = Math.abs(dx * nx + dy * ny);

        let alpha = 0;
        // Feathered volumetric cone strictly in front of brass hood mouth (along >= 0)
        if (along >= -2 && along <= axisLen * 1.18) {
          const s = clamp(along / axisLen, 0, 1.18);
          const halfW = mouthHalf + (endHalf - mouthHalf) * Math.pow(Math.min(1, s), 1.05);
          // Gate 2 exact feather math: 18px -> 30px (9..15 at half-res) widening with distance (^1.35)!
          const feather = 9 + 6 * Math.pow(clamp(s, 0, 1), 1.35);
          const edgeFade = 1 - smoothstep(halfW - feather * 0.4, halfW + feather, perp);
          const frontFade = smoothstep(-2, 4, along);
          const distFade = Math.pow(clamp(1 - s * 0.72, 0, 1), 1.25);
          alpha = Math.max(alpha, edgeFade * frontFade * distFade * 0.34);
        }

        // Smooth desk contact pool ellipse
        const pdx = (x - tx) / poolRx;
        const pdy = (y - ty) / poolRy;
        const pr2 = pdx * pdx + pdy * pdy;
        if (pr2 < 1.0) {
          const pFall = Math.pow(1 - Math.sqrt(pr2), 1.65);
          alpha = Math.max(alpha, pFall * 0.36);
        }

        if (alpha > 0.004) {
          // 8% 4x4 Bayer ordered dither woven cleanly into falloff! (Opus Gate 2 lock!)
          const b = bayer4(x, y) - 0.5;
          const aFinal = clamp((alpha + b * 0.08 * clamp(alpha * 3.5, 0, 1)) * gain, 0, 0.58);
          const idx = (y * cw + x) * 4;
          d[idx] = sr;
          d[idx + 1] = sg;
          d[idx + 2] = sb;
          d[idx + 3] = (aFinal * 255) | 0;
        }
      }
    }
    cctx.putImageData(img, 0, 0);
  }

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.imageSmoothingEnabled = false; // Preserves crisp 2px Bayer falloff dots!
  ctx.drawImage(coneCacheCanvas, 0, 0, W, H);
  ctx.restore();
}

export function renderLayer07Light(ctx: CanvasRenderingContext2D, st: GameState, W: number, H: number): void {
  const intensity = clamp(st.dna.lampIntensity, 0, 2.5);
  const poolR = clamp(st.dna.lampPoolRadius, 0.12, 0.85);
  const counterMix = clamp(1 - Math.abs(st.lampAngle.value), 0, 1);
  const dimMix = clamp(1 - Math.abs(st.lampAngle.value - 1), 0, 1);
  const curbMix = smoothstep(1.2, 2.0, st.lampAngle.value);

  ctx.save();

  // 1. COUNTER MODE: Feathered + 8% Bayer-dithered cone emerging strictly from brass hood mouth!
  if (counterMix > 0.02 && intensity > 0.01) {
    renderFeatheredBayerCone(ctx, st, W, H, counterMix, intensity, poolR);
  }

  // 2. DIM MODE: Interior counter & frame fall into deep 4% velvet dark while glass opens crystal clear!
  if (dimMix > 0.04) {
    ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.54 * dimMix);
    ctx.fillRect(0, 466, W, H - 466);
    ctx.fillRect(0, 0, 184, 466);
    ctx.fillRect(1096, 0, W - 1096, 466);
  }

  // 3. CURB MODE: Outward headlight-warm golden blade angling up-right from hood mouth across wet sill!
  if (curbMix > 0.02 && intensity > 0.01) {
    const m = getLampMouthGeometry(st);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const bladeGrad = ctx.createLinearGradient(m.cx, m.cy, 790, 290);
    bladeGrad.addColorStop(0, rgbCss({ r: 252, g: 204, b: 122 }, 0.50 * curbMix * intensity));
    bladeGrad.addColorStop(0.42, rgbCss(PALETTE.sodiumLamp, 0.20 * curbMix * intensity));
    bladeGrad.addColorStop(1, rgbCss(PALETTE.sodiumLamp, 0));
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(m.topX, m.topY);
    ctx.lineTo(m.botX, m.botY);
    ctx.lineTo(840, 470);
    ctx.lineTo(860, 154);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 4. D-max velvet vignette protecting all 4 corners cleanly (suppressed in Vacuum grid/solo isolation!)
  if (st.viewMode !== 'grid' && st.soloLayer === 0) {
    const vf = clamp(st.dna.vignetteFloor, 0, 1.5);
    const vGrad = ctx.createRadialGradient(W * 0.5, H * 0.48, H * 0.34, W * 0.5, H * 0.5, W * 0.68);
    vGrad.addColorStop(0, rgbCss(PALETTE.velvetDark, 0));
    vGrad.addColorStop(0.72, rgbCss(PALETTE.velvetDark, 0.16 * vf));
    vGrad.addColorStop(1, rgbCss(PALETTE.velvetDark, clamp(0.76 * vf, 0, 0.96)));
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();
}
