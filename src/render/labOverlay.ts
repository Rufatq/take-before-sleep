// Hidden 5-Strata Visual-DNA & Vacuum Calibration Lab (?lab=1 or `L` key, mobile pull-tab <= 980px)
// 100% PURE CODE ON CANVAS: ZERO HTML <button>, ZERO <input>, ZERO fonts anywhere!

import { GameState } from '../core/state';
import {
  PALETTE,
  rgbCss,
  PRESETS,
  VisualDNA,
  blendDNA,
  diffDNA,
  GroundMode,
  ViewMode,
  AspectLock,
} from '../core/palette';
import { dryChalkPoly, dipPenRibbon } from '../art/dryTools';
import { drawInkText } from '../art/calligraphy';
import { clamp } from '../core/prng';

export interface LabButtonRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'btn' | 'scrub';
  min?: number;
  max?: number;
  key?: keyof VisualDNA | 'slotBlend';
}

const SCRUBBERS: { key: keyof VisualDNA | 'slotBlend'; label: string; min: number; max: number; safeMax: number }[] = [
  { key: 'lampIntensity', label: 'LAMP GAIN', min: 0.1, max: 2.5, safeMax: 1.3 },
  { key: 'lampPoolRadius', label: 'POOL SIZE', min: 0.12, max: 0.85, safeMax: 0.34 },
  { key: 'underpaintPeek', label: 'CHALK TOOTH', min: 0.0, max: 1.2, safeMax: 0.72 },
  { key: 'glassReflect', label: 'GLASS GHOST', min: 0.0, max: 2.0, safeMax: 1.0 },
  { key: 'rainDensity', label: 'RAIN DENSE', min: 0.0, max: 2.5, safeMax: 1.4 },
  { key: 'boilFps', label: 'BOIL FPS', min: 2.0, max: 24.0, safeMax: 12.0 },
  { key: 'slotBlend', label: 'A/B MERGE', min: -0.5, max: 1.8, safeMax: 1.0 },
];

export class CalibrationLab {
  private rects: LabButtonRect[] = [];

  render(ctx: CanvasRenderingContext2D, st: GameState, viewW: number, viewH: number): void {
    this.rects = [];
    const isMobile = viewW <= 980;

    // On mobile <= 980px when labOpen is enabled via ?lab=1/L, show crisp pull-tab when drawer collapsed
    if (!st.labOpen) return;

    if (isMobile && !st.labMobileOpen) {
      const tx = viewW - 44;
      const ty = viewH * 0.42;
      dryChalkPoly(
        ctx,
        [
          { x: tx, y: ty },
          { x: viewW, y: ty - 6 },
          { x: viewW, y: ty + 96 },
          { x: tx, y: ty + 92 },
        ],
        PALETTE.velvetDark,
        { pressure: 0.96, peek: 0.15, edgeRough: 1.0, boilSeed: 1 }
      );
      drawInkText(ctx, 'LAB', tx + 22, ty + 38, {
        size: 13,
        color: PALETTE.sodiumLamp,
        strokeWidth: 1.8,
        align: 'center',
        boilSeed: 1,
      });
      this.rects.push({ id: 'mobile_toggle', x: tx, y: ty - 6, w: 44, h: 102, kind: 'btn' });
      return;
    }

    const panelW = isMobile ? Math.min(340, viewW - 24) : 336;
    const panelH = Math.min(viewH - 28, 668);
    const px = viewW - panelW - 14;
    const py = 14;

    ctx.save();

    // Stratum 1: Torn sumi-e backing shard
    dryChalkPoly(
      ctx,
      [
        { x: px - 6, y: py - 4 },
        { x: px + panelW + 4, y: py - 2 },
        { x: px + panelW + 6, y: py + panelH + 6 },
        { x: px - 8, y: py + panelH + 2 },
      ],
      PALETTE.velvetDark,
      { underpaint: PALETTE.underpaint, pressure: 0.97, peek: 0.16, edgeRough: 1.5, boilSeed: 2, alpha: 0.94 }
    );
    dipPenRibbon(
      ctx,
      [
        { x: px - 5, y: py - 3 },
        { x: px + panelW + 3, y: py - 2 },
      ],
      2.6,
      PALETTE.bonePaper,
      { taperMode: 'velocity', jitter: 0.2, seed: 2 }
    );

    // Header
    drawInkText(ctx, 'VISUAL-DNA LAB', px + 14, py + 12, {
      size: 15,
      color: PALETTE.sodiumLamp,
      strokeWidth: 2.0,
      boilSeed: 1,
    });
    this.drawChip(ctx, 'close_lab', 'X', px + panelW - 36, py + 8, 26, 22, false);

    let cy = py + 42;

    // Stratum 2: View Modes (COMP / 4X2 GRID / 3-VAL) + Grounds (DARK / 50% / WHT)
    drawInkText(ctx, 'VIEW + GROUND', px + 14, cy, { size: 10.5, color: PALETTE.bonePaper, strokeWidth: 1.4, boilSeed: 1 });
    cy += 18;
    const vModes: [ViewMode, string][] = [
      ['composite', 'COMP'],
      ['grid', '4X2 GRID'],
      ['squint', '3-VALUE'],
    ];
    vModes.forEach(([m, lbl], i) => {
      this.drawChip(ctx, `view_${m}`, lbl, px + 12 + i * 104, cy, 98, 24, st.viewMode === m);
    });
    cy += 30;
    const gModes: [GroundMode, string][] = [
      ['dark', 'DARK'],
      ['gray50', '50% GRAY'],
      ['white', 'WHITE'],
    ];
    gModes.forEach(([g, lbl], i) => {
      this.drawChip(ctx, `ground_${g}`, lbl, px + 12 + i * 104, cy, 98, 24, st.groundMode === g);
    });
    cy += 34;

    // Stratum 3: Vacuum Layer Solo Selector (ALL + 01..08)
    drawInkText(ctx, 'VACUUM SOLO (01..08)', px + 14, cy, { size: 10.5, color: PALETTE.bonePaper, strokeWidth: 1.4, boilSeed: 1 });
    cy += 18;
    this.drawChip(ctx, 'solo_0', 'ALL', px + 12, cy, 56, 23, st.soloLayer === 0);
    for (let i = 1; i <= 8; i++) {
      const col = (i - 1) % 4;
      const row = Math.floor((i - 1) / 4);
      this.drawChip(ctx, `solo_${i}`, `0${i}`, px + 76 + col * 62, cy + row * 27, 56, 23, st.soloLayer === i);
    }
    cy += 62;

    // Stratum 4: 6 Curated Presets + Aspect Locks
    drawInkText(ctx, 'PRESETS + ASPECT', px + 14, cy, { size: 10.5, color: PALETTE.bonePaper, strokeWidth: 1.4, boilSeed: 1 });
    cy += 18;
    PRESETS.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      this.drawChip(ctx, `preset_${idx}`, p.name.slice(0, 12), px + 12 + col * 158, cy + row * 26, 152, 22, st.activePresetIdx === idx);
    });
    cy += 84;

    const aspects: AspectLock[] = ['free', '16:9', '4:3', '9:16'];
    aspects.forEach((asp, i) => {
      this.drawChip(ctx, `aspect_${asp}`, asp.toUpperCase(), px + 12 + i * 78, cy, 72, 22, st.aspectLock === asp);
    });
    cy += 32;

    // Stratum 5: Uncapped Hazard-Striped Overdrive Scrubbers
    drawInkText(ctx, 'OVERDRIVE SCRUBBERS', px + 14, cy, { size: 10.5, color: PALETTE.bonePaper, strokeWidth: 1.4, boilSeed: 1 });
    cy += 18;
    for (const sc of SCRUBBERS) {
      const val = sc.key === 'slotBlend' ? st.slotBlend : st.dna[sc.key];
      const norm = clamp((val - sc.min) / (sc.max - sc.min), 0, 1);
      const isOverdrive = val > sc.safeMax || val < 0;
      const bx = px + 12;
      const bw = panelW - 24;
      const bh = 24;

      // Track
      ctx.fillStyle = rgbCss({ r: 22, g: 24, b: 30 }, 0.95);
      ctx.fillRect(bx, cy, bw, bh);

      // Hazard-striped overdrive zone beyond safeMax!
      const safeNorm = clamp((sc.safeMax - sc.min) / (sc.max - sc.min), 0, 1);
      const hzX = bx + bw * safeNorm;
      const hzW = bw * (1 - safeNorm);
      if (hzW > 4) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(hzX, cy, hzW, bh);
        ctx.clip();
        ctx.fillStyle = rgbCss(PALETTE.waxStamp, 0.22);
        ctx.fillRect(hzX, cy, hzW, bh);
        ctx.strokeStyle = rgbCss(PALETTE.sodiumLamp, 0.42);
        ctx.lineWidth = 3;
        for (let sx = hzX - bh; sx < hzX + hzW + bh; sx += 11) {
          ctx.beginPath();
          ctx.moveTo(sx, cy + bh);
          ctx.lineTo(sx + bh, cy);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Fill bar
      ctx.fillStyle = rgbCss(isOverdrive ? PALETTE.waxStamp : PALETTE.brassWarm, 0.78);
      ctx.fillRect(bx, cy + 2, bw * norm, bh - 4);
      ctx.strokeStyle = rgbCss(PALETTE.bonePaper, 0.35);
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, cy, bw, bh);

      drawInkText(ctx, sc.label, bx + 6, cy + 6, { size: 10, color: PALETTE.bonePaper, strokeWidth: 1.35, boilSeed: 1 });
      drawInkText(ctx, val.toFixed(2), bx + bw - 8, cy + 6, {
        size: 10,
        color: PALETTE.bonePaper,
        strokeWidth: 1.35,
        align: 'right',
        boilSeed: 1,
      });

      this.rects.push({ id: `scrub_${sc.key}`, x: bx, y: cy, w: bw, h: bh, kind: 'scrub', min: sc.min, max: sc.max, key: sc.key });
      cy += 29;
    }

    // Bottom Action Row: COPY DIFF JSON + RESET
    cy += 4;
    const copied = st.copyDiffFlash > 0;
    this.drawChip(ctx, 'copy_diff', copied ? 'DIFF COPIED' : 'COPY DIFF JSON', px + 12, cy, 194, 28, copied);
    this.drawChip(ctx, 'reset_dna', 'RESET', px + 214, cy, 108, 28, false);

    ctx.restore();
  }

  private drawChip(
    ctx: CanvasRenderingContext2D,
    id: string,
    label: string,
    x: number,
    y: number,
    w: number,
    h: number,
    active: boolean
  ): void {
    ctx.fillStyle = rgbCss(active ? PALETTE.waxStamp : { r: 28, g: 31, b: 38 }, active ? 0.92 : 0.92);
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = rgbCss(active ? PALETTE.sodiumLamp : PALETTE.bonePaper, active ? 0.88 : 0.35);
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x, y, w, h);
    drawInkText(ctx, label, x + w * 0.5, y + (h - 10) * 0.5, {
      size: 10,
      color: PALETTE.bonePaper,
      strokeWidth: 1.35,
      align: 'center',
      boilSeed: 1,
      jitter: 0.1,
    });
    this.rects.push({ id, x, y, w, h, kind: 'btn' });
  }

  handlePointerDown(st: GameState, x: number, y: number): boolean {
    if (!st.labOpen) return false;
    for (const r of this.rects) {
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        if (r.kind === 'scrub' && r.key) {
          st.activeScrubber = r.id;
          this.applyScrub(st, r, x);
          return true;
        }
        this.applyButton(st, r.id);
        return true;
      }
    }
    return false;
  }

  handlePointerMove(st: GameState, x: number): boolean {
    if (!st.activeScrubber) return false;
    const r = this.rects.find((b) => b.id === st.activeScrubber);
    if (r) {
      this.applyScrub(st, r, x);
      return true;
    }
    return false;
  }

  handlePointerUp(st: GameState): void {
    st.activeScrubber = null;
  }

  private applyScrub(st: GameState, r: LabButtonRect, x: number): void {
    if (!r.key || r.min === undefined || r.max === undefined) return;
    const t = clamp((x - r.x) / Math.max(1, r.w), 0, 1);
    const val = r.min + (r.max - r.min) * t;
    if (r.key === 'slotBlend') {
      st.slotBlend = val;
      st.dna = blendDNA(st.slotA, st.slotB, val);
    } else {
      st.dna[r.key] = val;
    }
  }

  private applyButton(st: GameState, id: string): void {
    if (id === 'mobile_toggle') {
      st.labMobileOpen = !st.labMobileOpen;
    } else if (id === 'close_lab') {
      if (window.innerWidth <= 980) st.labMobileOpen = false;
      else st.labOpen = false;
    } else if (id.startsWith('view_')) {
      st.viewMode = id.slice(5) as ViewMode;
      if (st.viewMode === 'grid') st.groundMode = 'gray50';
    } else if (id.startsWith('ground_')) {
      st.groundMode = id.slice(7) as GroundMode;
    } else if (id.startsWith('solo_')) {
      st.soloLayer = Number(id.slice(5));
      st.viewMode = 'composite';
    } else if (id.startsWith('preset_')) {
      const idx = Number(id.slice(7));
      st.activePresetIdx = idx;
      st.dna = { ...PRESETS[idx].dna };
      st.slotA = { ...PRESETS[idx].dna };
    } else if (id.startsWith('aspect_')) {
      st.aspectLock = id.slice(7) as AspectLock;
    } else if (id === 'copy_diff') {
      const payload = JSON.stringify({ preset: PRESETS[st.activePresetIdx].id, diff: diffDNA(st.dna) }, null, 2);
      (window as unknown as { __lastDiffJson?: string }).__lastDiffJson = payload;
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(payload).catch(() => undefined);
      }
      st.copyDiffFlash = 1.6;
    } else if (id === 'reset_dna') {
      st.activePresetIdx = 0;
      st.dna = { ...PRESETS[0].dna };
      st.slotBlend = 0;
    }
  }
}
