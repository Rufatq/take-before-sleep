// Deterministic math & procedural noise — zero Math.random() anywhere.

export function hash1(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

export function hash2(x: number, y: number, seed = 13): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return s - Math.floor(s);
}

export function vnoise2(x: number, y: number, seed = 13): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

// Rotated-octave FBM using exact 36.87 deg Pythagorean rotation matrix (0.8, -0.6; 0.6, 0.8)
export function fbmRot(x: number, y: number, octaves = 4, seed = 13): number {
  let val = 0;
  let amp = 0.5;
  let px = x;
  let py = y;
  for (let i = 0; i < octaves; i++) {
    val += amp * vnoise2(px, py, seed + i * 19);
    const nx = 0.8 * px - 0.6 * py;
    const ny = 0.6 * px + 0.8 * py;
    px = nx * 2.04 + 11.73;
    py = ny * 2.04 + 5.29;
    amp *= 0.5;
  }
  return val;
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// 4x4 Bayer ordered dithering threshold (0..1)
const BAYER_4X4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
];

export function bayer4(x: number, y: number): number {
  const idx = ((y & 3) << 2) | (x & 3);
  return (BAYER_4X4[idx] + 0.5) / 16;
}
