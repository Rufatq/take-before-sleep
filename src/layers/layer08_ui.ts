// VACUUM LAYER 08 (Opus Gate 2 Upgraded):
// - Title TAKE BEFORE SLEEP auto-fits cleanly to <=86% of frame width (ZERO cropping!)
//   with vermilion tapered brush underline BELOW baseline (never crossing through middle!)
// - Top-left Rx review card shown ONLY when st.reviewScriptOpen is true (eliminates duplicate counter card!)
// - Double-stroke bone-paper knockout numerals on solid crimson-oxblood for 02:18 tag
// - Quiet Intercom dialogue strip strictly while holding talk; ZERO robot telemetry cards anywhere.

import { GameState } from '../core/state';
import { PALETTE, rgbCss } from '../core/palette';
import { dryChalkPoly, dipPenRibbon } from '../art/dryTools';
import { drawInkText, drawInkParagraph, drawSlashedTitle } from '../art/calligraphy';
import { clamp } from '../core/prng';

export function renderLayer08UI(ctx: CanvasRenderingContext2D, st: GameState, W: number, H: number): void {
  const boil = st.boilTick;
  void H;

  // ------------------------------------------------------------
  // 1. TITLE SHARD (Auto-fit <=86% width, vermilion underline BELOW baseline!)
  // ------------------------------------------------------------
  if (st.beat === 'title') {
    const rev = clamp(st.beatTime / 0.95, 0.2, 1);

    // Wide torn diagonal sumi-e shard comfortably containing full 86% title
    dryChalkPoly(
      ctx,
      [
        { x: 112, y: 194 },
        { x: 1172, y: 168 },
        { x: 1156, y: 318 },
        { x: 96, y: 342 },
      ],
      PALETTE.velvetDark,
      { underpaint: PALETTE.counterUmber, pressure: 0.96, peek: 0.18, edgeRough: 1.8, boilSeed: boil + 1, alpha: 0.93 }
    );
    dipPenRibbon(
      ctx,
      [
        { x: 110, y: 194 },
        { x: 1174, y: 168 },
      ],
      3.4,
      PALETTE.bonePaper,
      { taperMode: 'velocity', jitter: 0.5, seed: boil + 3 }
    );

    // Fit cleanly inside 86% of frame width (1100px max; inner shard margin ~980px!)
    drawSlashedTitle(
      ctx,
      'TAKE BEFORE SLEEP',
      W * 0.5,
      214,
      56,
      W * 0.78,
      PALETTE.bonePaper,
      PALETTE.waxStamp,
      boil + 7,
      rev
    );

    // Quiet deckle bone-cream pull tag
    dryChalkPoly(
      ctx,
      [
        { x: 514, y: 350 },
        { x: 766, y: 342 },
        { x: 760, y: 388 },
        { x: 508, y: 394 },
      ],
      PALETTE.bonePaper,
      { pressure: 0.95, peek: 0.14, edgeRough: 0.9, boilSeed: boil + 11 }
    );
    drawInkText(ctx, 'open night hatch', W * 0.5, 358, {
      size: 17.5,
      color: PALETTE.velvetDark,
      strokeWidth: 2.2,
      align: 'center',
      boilSeed: boil + 13,
      progress: clamp((st.beatTime - 0.25) / 0.65, 0.35, 1),
    });
    return;
  }

  // ------------------------------------------------------------
  // 2. ZOOMED RX REVIEW CARD (STRICTLY ONLY IN REVIEW MODE — Gate 2 deduplication lock!)
  // ------------------------------------------------------------
  if (st.script && st.reviewScriptOpen && st.drawerIn && !st.handedOver) {
    const cx = 62;
    const cy = 62;
    const cw = 304;
    const ch = 152;

    ctx.save();
    dryChalkPoly(
      ctx,
      [
        { x: cx - 12, y: cy - 8 },
        { x: cx + cw + 14, y: cy - 16 },
        { x: cx + cw + 8, y: cy + ch + 10 },
        { x: cx - 18, y: cy + ch + 16 },
      ],
      PALETTE.velvetDark,
      { pressure: 0.96, peek: 0.14, edgeRough: 1.6, boilSeed: boil + 21, alpha: 0.92 }
    );
    dryChalkPoly(
      ctx,
      [
        { x: cx, y: cy },
        { x: cx + cw, y: cy - 6 },
        { x: cx + cw - 4, y: cy + ch },
        { x: cx - 4, y: cy + ch + 4 },
      ],
      PALETTE.bonePaper,
      { underpaint: { r: 176, g: 162, b: 138 }, pressure: 0.96, peek: 0.14, edgeRough: 0.9, boilSeed: boil + 23 }
    );

    // Solid vermilion-oxblood tag with DOUBLE-STROKE paper knockout numerals (Opus Gate 2 lock!)
    dryChalkPoly(
      ctx,
      [
        { x: cx + cw - 88, y: cy + 6 },
        { x: cx + cw - 10, y: cy + 2 },
        { x: cx + cw - 12, y: cy + 32 },
        { x: cx + cw - 90, y: cy + 35 },
      ],
      { r: 158, g: 44, b: 32 },
      { pressure: 0.98, peek: 0.08, edgeRough: 0.4, boilSeed: boil + 25 }
    );
    drawInkText(ctx, st.script.clockText, cx + cw - 50, cy + 12, {
      size: 13.5,
      color: PALETTE.glassRim,
      strokeWidth: 2.8, // Double stroke weight crisp knockout!
      align: 'center',
      boilSeed: boil + 27,
    });

    drawInkText(ctx, st.script.heading, cx + 16, cy + 20, {
      size: 21,
      color: PALETTE.velvetDark,
      strokeWidth: 2.5,
      hand: st.script.hand,
      boilSeed: boil + 29,
    });
    dipPenRibbon(
      ctx,
      [
        { x: cx + 14, y: cy + 54 },
        { x: cx + cw - 20, y: cy + 50 },
      ],
      1.5,
      { r: 108, g: 94, b: 78 },
      { taperMode: 'velocity', inkPool: false, jitter: 0.3, seed: boil + 31 }
    );
    drawInkText(ctx, st.script.doseLine, cx + 18, cy + 68, {
      size: 15.5,
      color: PALETTE.velvetDark,
      strokeWidth: 1.9,
      hand: st.script.hand,
      boilSeed: boil + 33,
    });
    drawInkText(ctx, st.script.noteLine, cx + 18, cy + 104, {
      size: 13.5,
      color: { r: 88, g: 68, b: 54 },
      strokeWidth: 1.65,
      hand: st.script.hand,
      boilSeed: boil + 35,
    });
    ctx.restore();
  }

  // ------------------------------------------------------------
  // 3. QUIET INTERCOM VOICE STRIP (STRICTLY ONLY WHILE HOLDING INTERCOM!)
  // ------------------------------------------------------------
  if (st.intercomSpring.value > 0.08 && st.visitorLines.length > 0) {
    const vis = clamp(st.intercomSpring.value, 0, 1);
    const line = st.visitorLines[Math.min(st.visitorLineIdx, st.visitorLines.length - 1)];
    const sx = 304;
    const sy = 368 + (1 - vis) * 18;
    const sw = 650;
    const sh = 74;

    ctx.save();
    ctx.globalAlpha = vis;
    dryChalkPoly(
      ctx,
      [
        { x: sx - 10, y: sy - 6 },
        { x: sx + sw + 12, y: sy - 14 },
        { x: sx + sw + 4, y: sy + sh + 6 },
        { x: sx - 14, y: sy + sh + 12 },
      ],
      PALETTE.velvetDark,
      { pressure: 0.96, peek: 0.14, edgeRough: 1.6, boilSeed: boil + 41, alpha: 0.93 }
    );
    dryChalkPoly(
      ctx,
      [
        { x: sx, y: sy },
        { x: sx + sw, y: sy - 6 },
        { x: sx + sw - 4, y: sy + sh - 4 },
        { x: sx - 4, y: sy + sh + 2 },
      ],
      PALETTE.bonePaper,
      { pressure: 0.96, peek: 0.14, edgeRough: 0.8, boilSeed: boil + 43 }
    );
    drawInkParagraph(ctx, line, sx + 18, sy + 16, sw - 36, 26, {
      size: 16.5,
      color: PALETTE.velvetDark,
      strokeWidth: 1.95,
      progress: clamp(st.dialogueReveal, 0.1, 1),
      boilSeed: boil + 45,
    });
    ctx.restore();
  }

  // ------------------------------------------------------------
  // 4. NIGHT II CONSEQUENCE CARD
  // ------------------------------------------------------------
  if (st.beat === 'night2_preview') {
    const a = clamp(1 - Math.max(0, st.beatTime - 3.6) / 1.4, 0, 1) * clamp(st.beatTime / 0.8, 0, 1);
    if (a > 0.02) {
      ctx.save();
      ctx.globalAlpha = a;
      dryChalkPoly(
        ctx,
        [
          { x: 432, y: 242 },
          { x: 852, y: 228 },
          { x: 842, y: 322 },
          { x: 422, y: 334 },
        ],
        PALETTE.velvetDark,
        { pressure: 0.96, peek: 0.16, edgeRough: 1.4, boilSeed: boil + 61, alpha: 0.9 }
      );
      drawSlashedTitle(ctx, 'NIGHT II', W * 0.5, 250, 42, 360, PALETTE.bonePaper, PALETTE.sodiumLamp, boil + 63, 1);
      ctx.restore();
    }
  }

  // Quiet wall clock hand-inked numerals on upper-right dark oak jamb
  ctx.fillStyle = rgbCss(PALETTE.velvetDark, 0.0);
  drawInkText(ctx, st.clockDisplay, W - 76, 20, {
    size: 16,
    color: PALETTE.amberLabel,
    strokeWidth: 1.85,
    alpha: 0.82,
    align: 'center',
    boilSeed: boil + 71,
  });
}
