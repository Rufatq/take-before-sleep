// Unified Non-MSAA WebGL2 Compositor (Phase 2 — Eyelid-Biased 4x4 Bayer Microsleep Shader + Pitch Dip!)
// Opus Gate 3 exact microsleep formula:
//   Bayer threshold biased by abs(vUv.y - 0.5) * 0.7 so eyelids meet organically from top & bottom!
// - Luminance-weighted 12fps 2px-cell film grain (OFF in Vacuum Grid & Solo isolation renders)
// - Intel HD 4000 / Mesa safe: antialias: false, zero MSAA FBOs.

import { GameState } from '../core/state';
import { PALETTE, rgbCss, GroundMode } from '../core/palette';
import { renderLayer01Street } from '../layers/layer01_street';
import { renderLayer02Visitor } from '../layers/layer02_visitor';
import { renderLayer03Glass } from '../layers/layer03_glass';
import { renderLayer04Booth } from '../layers/layer04_booth';
import { renderLayer05Bottles } from '../layers/layer05_bottles';
import { renderLayer06Counter } from '../layers/layer06_counter';
import { renderLayer07Light } from '../layers/layer07_light';
import { renderLayer08UI } from '../layers/layer08_ui';
import { drawInkText } from '../art/calligraphy';
import { clamp } from '../core/prng';

export const STAGE_W = 1280;
export const STAGE_H = 720;

export const LAYER_NAMES = [
  '01 STREET RAIN',
  '02 VISITOR COAT',
  '03 GLASS MEMBRANE',
  '04 BOOTH DRAWER',
  '05 AMBER BOTTLES',
  '06 COUNTER PROPS',
  '07 LAMP OPTICS',
  '08 SHATTERED UI',
] as const;

const VS_SRC = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FS_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform float uGrain;
uniform float uSquint;
uniform float uBayer;
uniform float uBlink;    // Eyelid-biased 4x4 Bayer microsleep closure (0..1)
uniform float uPitchUv;  // Subtle vertical pitch dip during microsleep (0..0.02)
uniform vec2 uResolution;
out vec4 fragColor;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float bayer4x4(vec2 px) {
  int x = int(mod(px.x, 4.0));
  int y = int(mod(px.y, 4.0));
  int idx = y * 4 + x;
  float m[16] = float[16](
     0.0,  8.0,  2.0, 10.0,
    12.0,  4.0, 14.0,  6.0,
     3.0, 11.0,  1.0,  9.0,
    15.0,  7.0, 13.0,  5.0
  );
  return (m[idx] + 0.5) / 16.0;
}

void main() {
  vec2 sampleUv = vec2(vUv.x, clamp(vUv.y + uPitchUv, 0.0, 1.0));
  vec4 c = texture(uTex, sampleUv);
  vec3 col = c.rgb;
  float L = dot(col, vec3(0.299, 0.587, 0.114));

  vec3 vDark = vec3(11.0, 10.0, 14.0) / 255.0;

  if (uSquint > 0.5) {
    vec3 vMid = vec3(42.0, 48.0, 56.0) / 255.0;
    vec3 vLit = vec3(232.0, 213.0, 168.0) / 255.0;
    if (L < 0.105) col = vDark;
    else if (L < 0.58) col = vMid;
    else col = vLit;
    fragColor = vec4(col, 1.0);
    return;
  }

  vec2 px = vUv * uResolution;
  if (uGrain > 0.001) {
    float gTick = floor(uTime * 12.0);
    float weight = smoothstep(0.04, 0.30, L) * (1.0 - smoothstep(0.75, 0.95, L));
    float noise = hash12(floor(px * 0.5) + gTick * 17.3) - 0.5;
    float g = noise * uGrain * weight * 2.0;
    col = clamp(col + vec3(g, g * 0.94, g * 0.86), 0.0, 1.0);
  }

  // Flat 4x4 Bayer dissolve between scenes/nights
  if (uBayer > 0.005) {
    float th = bayer4x4(floor(px * 0.5));
    if (uBayer > th) col = vDark;
  }

  // Eyelid-Biased 4x4 Bayer Microsleep Blink (Opus Gate 3 exact formula: abs(uv.y - 0.5) * 0.7!)
  if (uBlink > 0.005) {
    if (uBlink >= 0.995) {
      col = vDark;
    } else {
      float lidBias = abs(vUv.y - 0.5) * 0.7;
      float th = bayer4x4(floor(px * 0.5)) * 0.68 + (0.35 - lidBias);
      if (uBlink > th) col = vDark;
    }
  }

  fragColor = vec4(col, 1.0);
}
`;

function groundFillStyle(mode: GroundMode): string {
  if (mode === 'gray50') return '#808080';
  if (mode === 'white') return '#f2eee6';
  return '#0b0a0e';
}

export class StageCompositor {
  private layerCanvases: HTMLCanvasElement[] = [];
  private layerCtxs: CanvasRenderingContext2D[] = [];
  private compositeCanvas: HTMLCanvasElement;
  private compositeCtx: CanvasRenderingContext2D;

  private glCanvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private tex: WebGLTexture | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private uLocs: Record<string, WebGLUniformLocation | null> = {};
  readonly webglActive: boolean;

  constructor() {
    for (let i = 0; i < 8; i++) {
      const c = document.createElement('canvas');
      c.width = STAGE_W;
      c.height = STAGE_H;
      this.layerCanvases.push(c);
      this.layerCtxs.push(c.getContext('2d')!);
    }

    this.compositeCanvas = document.createElement('canvas');
    this.compositeCanvas.width = STAGE_W;
    this.compositeCanvas.height = STAGE_H;
    this.compositeCtx = this.compositeCanvas.getContext('2d')!;

    this.glCanvas = document.createElement('canvas');
    this.glCanvas.width = STAGE_W;
    this.glCanvas.height = STAGE_H;
    this.webglActive = this.initWebGL2();
  }

  private initWebGL2(): boolean {
    const gl = this.glCanvas.getContext('webgl2', {
      antialias: false,
      depth: false,
      stencil: false,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'default',
    });
    if (!gl) return false;

    const compile = (type: number, src: string): WebGLShader | null => {
      const sh = gl.createShader(type);
      if (!sh) return null;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, VS_SRC);
    const fs = compile(gl.FRAGMENT_SHADER, FS_SRC);
    if (!vs || !fs) return false;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.gl = gl;
    this.program = prog;
    this.vao = vao;
    this.tex = tex;
    this.uLocs = {
      uTex: gl.getUniformLocation(prog, 'uTex'),
      uTime: gl.getUniformLocation(prog, 'uTime'),
      uGrain: gl.getUniformLocation(prog, 'uGrain'),
      uSquint: gl.getUniformLocation(prog, 'uSquint'),
      uBayer: gl.getUniformLocation(prog, 'uBayer'),
      uBlink: gl.getUniformLocation(prog, 'uBlink'),
      uPitchUv: gl.getUniformLocation(prog, 'uPitchUv'),
      uResolution: gl.getUniformLocation(prog, 'uResolution'),
    };
    return true;
  }

  private renderAllVacuumLayers(st: GameState): void {
    const fns = [
      (c: CanvasRenderingContext2D) => renderLayer01Street(c, st, STAGE_W, STAGE_H),
      (c: CanvasRenderingContext2D) => renderLayer02Visitor(c, st),
      (c: CanvasRenderingContext2D) => renderLayer03Glass(c, st),
      (c: CanvasRenderingContext2D) => renderLayer04Booth(c, st, STAGE_W, STAGE_H),
      (c: CanvasRenderingContext2D) => renderLayer05Bottles(c, st),
      (c: CanvasRenderingContext2D) => renderLayer06Counter(c, st),
      (c: CanvasRenderingContext2D) => renderLayer07Light(c, st, STAGE_W, STAGE_H),
      (c: CanvasRenderingContext2D) => renderLayer08UI(c, st, STAGE_W, STAGE_H),
    ];

    for (let i = 0; i < 8; i++) {
      const shouldDraw = st.viewMode === 'grid' || st.soloLayer === 0 || st.soloLayer === i + 1;
      if (!shouldDraw) continue;
      const lctx = this.layerCtxs[i];
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.globalAlpha = 1;
      lctx.globalCompositeOperation = 'source-over';
      lctx.clearRect(0, 0, STAGE_W, STAGE_H);
      fns[i](lctx);
    }
  }

  renderFrame(st: GameState): HTMLCanvasElement {
    this.renderAllVacuumLayers(st);
    const ctx = this.compositeCtx;
    const isIsolation = st.viewMode === 'grid' || st.soloLayer > 0;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = groundFillStyle(st.groundMode);
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);

    const hasVisitor = st.visitor !== 'none' && st.visitorPresence.value > 0.02;

    if (st.viewMode === 'grid') {
      const cols = 4;
      const rows = 2;
      const cellW = STAGE_W / cols;
      const cellH = STAGE_H / rows;
      for (let i = 0; i < 8; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = col * cellW;
        const cy = row * cellH;
        ctx.fillStyle = groundFillStyle(st.groundMode);
        ctx.fillRect(cx, cy, cellW, cellH);
        if (i !== 1 || hasVisitor) {
          ctx.drawImage(this.layerCanvases[i], cx, cy, cellW, cellH);
        }

        ctx.strokeStyle = rgbCss(PALETTE.velvetDark, 0.85);
        ctx.lineWidth = 2;
        ctx.strokeRect(cx + 1, cy + 1, cellW - 2, cellH - 2);
        ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.78);
        ctx.fillRect(cx + 6, cy + 6, 174, 22);
        drawInkText(ctx, LAYER_NAMES[i], cx + 12, cy + 11, {
          size: 11,
          color: PALETTE.bonePaper,
          strokeWidth: 1.5,
          boilSeed: 1,
          jitter: 0.12,
        });
      }
    } else if (st.soloLayer > 0) {
      if (st.soloLayer !== 2 || hasVisitor) {
        ctx.drawImage(this.layerCanvases[st.soloLayer - 1], 0, 0);
      }
    } else {
      for (let i = 0; i < 8; i++) {
        if (i === 1 && !hasVisitor) continue;
        ctx.drawImage(this.layerCanvases[i], 0, 0);
      }
    }

    if (this.webglActive && this.gl && this.program && this.tex && this.vao) {
      const gl = this.gl;
      gl.viewport(0, 0, STAGE_W, STAGE_H);
      gl.useProgram(this.program);
      gl.bindVertexArray(this.vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.compositeCanvas);

      gl.uniform1i(this.uLocs.uTex, 0);
      gl.uniform1f(this.uLocs.uTime, st.simTime);
      gl.uniform1f(this.uLocs.uGrain, isIsolation ? 0.0 : clamp(st.dna.grainAmount, 0, 0.35));
      gl.uniform1f(this.uLocs.uSquint, st.viewMode === 'squint' ? 1.0 : 0.0);
      gl.uniform1f(this.uLocs.uBayer, isIsolation ? 0.0 : clamp(Math.max(st.bayerTransition, st.dna.bayerDither), 0, 1));
      gl.uniform1f(this.uLocs.uBlink, isIsolation ? 0.0 : clamp(st.microsleep.lidAmount, 0, 1));
      // Convert degrees pitch dip (~0.4..1.1 deg) to subtle vertical UV offset
      gl.uniform1f(this.uLocs.uPitchUv, isIsolation ? 0.0 : -st.cameraPitch.value * 0.011);
      gl.uniform2f(this.uLocs.uResolution, STAGE_W, STAGE_H);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      return this.glCanvas;
    }

    if (st.viewMode === 'squint') {
      const img = ctx.getImageData(0, 0, STAGE_W, STAGE_H);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const L = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
        if (L < 0.105) {
          d[i] = 11; d[i + 1] = 10; d[i + 2] = 14;
        } else if (L < 0.58) {
          d[i] = 42; d[i + 1] = 48; d[i + 2] = 56;
        } else {
          d[i] = 232; d[i + 1] = 213; d[i + 2] = 168;
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    return this.compositeCanvas;
  }
}
