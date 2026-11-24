// Locked Opus Gate 1 + Gate 2 Color Key + Visual-DNA Calibration Parameters & 6 Presets

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const PALETTE = {
  velvetDark: { r: 11, g: 10, b: 14 },        // #0B0A0E — true D-max corners & visitor backlit cut
  rainIndigo: { r: 18, g: 28, b: 41 },        // #121C29 — exterior storm deep
  glassUnderpaint: { r: 26, g: 34, b: 48 },   // #1A2230 — cold glass underpaint (Gate 2)
  glassMid: { r: 42, g: 48, b: 56 },          // #2A3038 — squint glass cap
  glassBacklight: { r: 52, g: 64, b: 76 },    // #34404C — 120px radial backlight behind visitor (Gate 2)
  counterUmber: { r: 58, g: 42, b: 28 },      // #3A2A1C — counter umber bleeding 8px into glass (Gate 2)
  underpaint: { r: 90, g: 46, b: 26 },        // #5A2E1A — burnt sienna tooth peek
  amberBottle: { r: 122, g: 58, b: 28 },      // #7A3A1C — raised off underpaint
  amberLabel: { r: 138, g: 122, b: 94 },      // #8A7A5E — aged apothecary label (Gate 2 squint lock!)
  amberRim: { r: 238, g: 166, b: 70 },        // #EEA646 — grazing amber highlight
  cheekLight: { r: 200, g: 144, b: 72 },      // #C89048 — 40% sodium cheek sliver (Gate 2)
  steelDrawer: { r: 82, g: 91, b: 100 },      // #525B64 — Durchreiche brushed steel
  verdigrisCross: { r: 47, g: 107, b: 98 },   // #2F6B62 — restrained pulled-down cross
  sodiumLamp: { r: 238, g: 166, b: 70 },      // #EEA646 — hero warm pool
  bonePaper: { r: 224, g: 210, b: 182 },      // #E0D2B6 — singular hero light mass (card + pills!)
  glassRim: { r: 235, g: 224, b: 204 },       // #EBE0CC — 1px 40% glass edge + knockout numerals
  waxStamp: { r: 184, g: 59, b: 40 },         // #B83B28 — vermilion stamp face
  brassMid: { r: 140, g: 102, b: 52 },        // #8C6634 — mid-value lamp hood & porthole ring (Gate 2!)
  brassWarm: { r: 178, g: 130, b: 64 },       // #B28240 — brass highlight catch
  brassDark: { r: 74, g: 49, b: 23 },         // #4A3117 — shaded brass
  slateGroove: { r: 34, g: 40, b: 48 },       // #222830 — grooved slate pill tray
  coldSkin: { r: 154, g: 130, b: 116 },       // #9A8274 — chilled shadow skin
  dawnSlate: { r: 132, g: 152, b: 170 },      // #8498AA — 5:00 a.m. gray dawn
} as const;

export function rgbCss(c: RGB, a = 1): string {
  return a >= 1 ? `rgb(${c.r | 0},${c.g | 0},${c.b | 0})` : `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${a.toFixed(3)})`;
}

export type GroundMode = 'dark' | 'gray50' | 'white';
export type ViewMode = 'composite' | 'grid' | 'squint';
export type AspectLock = 'free' | '16:9' | '4:3' | '9:16';

export interface VisualDNA {
  lampIntensity: number;
  lampPoolRadius: number;
  underpaintPeek: number;
  glassReflect: number;
  rainDensity: number;
  verdigrisGlow: number;
  boilFps: number;
  boilJitter: number;
  halftoneStrength: number;
  vignetteFloor: number;
  grainAmount: number;          // Gate 2 lock: luminance-weighted 0.07 on 2px cells @ 12fps!
  bayerDither: number;
}

export const DEFAULT_DNA: VisualDNA = {
  lampIntensity: 1.0,
  lampPoolRadius: 0.30,
  underpaintPeek: 0.48,
  glassReflect: 0.56,
  rainDensity: 1.0,
  verdigrisGlow: 0.45,
  boilFps: 12,
  boilJitter: 0.65,
  halftoneStrength: 0.36,
  vignetteFloor: 0.92,
  grainAmount: 0.07,
  bayerDither: 0.0,
};

export interface PresetDef {
  id: string;
  name: string;
  dna: VisualDNA;
}

export const PRESETS: PresetDef[] = [
  { id: 'nocturne', name: '01 NOCTURNE AMBER', dna: { ...DEFAULT_DNA } },
  { id: 'wet_cobalt', name: '02 WET COBALT', dna: { ...DEFAULT_DNA, lampIntensity: 0.84, rainDensity: 1.45, verdigrisGlow: 0.62, glassReflect: 0.46, halftoneStrength: 0.50 } },
  { id: 'dry_chalk', name: '03 RAW CHALK TOOTH', dna: { ...DEFAULT_DNA, underpaintPeek: 0.78, boilJitter: 1.15, grainAmount: 0.11, vignetteFloor: 0.96 } },
  { id: 'mirror_glass', name: '04 MIRROR GHOST', dna: { ...DEFAULT_DNA, glassReflect: 0.95, lampIntensity: 1.18, lampPoolRadius: 0.28, verdigrisGlow: 0.28 } },
  { id: 'sodium_bleed', name: '05 SODIUM OVERDRIVE', dna: { ...DEFAULT_DNA, lampIntensity: 1.55, lampPoolRadius: 0.42, underpaintPeek: 0.62, halftoneStrength: 0.46 } },
  { id: 'quiet_dawn', name: '06 COLD 05:00', dna: { ...DEFAULT_DNA, lampIntensity: 0.55, verdigrisGlow: 0.22, rainDensity: 0.65, glassReflect: 0.32, vignetteFloor: 0.72 } },
];

export function blendDNA(a: VisualDNA, b: VisualDNA, t: number): VisualDNA {
  const out = { ...a };
  (Object.keys(a) as (keyof VisualDNA)[]).forEach((k) => {
    out[k] = a[k] + (b[k] - a[k]) * t;
  });
  return out;
}

export function diffDNA(current: VisualDNA): Record<string, number> {
  const diff: Record<string, number> = {};
  (Object.keys(DEFAULT_DNA) as (keyof VisualDNA)[]).forEach((k) => {
    if (Math.abs(current[k] - DEFAULT_DNA[k]) > 0.001) {
      diff[k] = Number(current[k].toFixed(3));
    }
  });
  return diff;
}
