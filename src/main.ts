// TAKE BEFORE SLEEP — Entry, Deterministic Dual-Clock Loop, Exact 60fps Stamp Choreography & window.D Harness

import {
  createInitialState,
  enterBeat,
  GameState,
  LampMode,
  SceneBeat,
} from './core/state';
import { clamp, hash2 } from './core/prng';
import { StageCompositor, STAGE_W, STAGE_H } from './render/compositor';
import { CalibrationLab } from './render/labOverlay';
import { FoleyEngine, AudioStemId } from './audio/foley';
import { INTERCOM_GRILLE } from './layers/layer03_glass';
import { DRAWER_HANDLE_RECT, SHUTTER_LATCH_RECT } from './layers/layer04_booth';
import { BOTTLE_RACK_HIT } from './layers/layer05_bottles';
import {
  LAMP_HOOD_HIT,
  GRACE_TIN_HIT,
  SLATE_TRAY_RECT,
  PAPER_WRAP_RECT,
  STAMP_HIT_RECT,
} from './layers/layer06_counter';
import { GroundMode, ViewMode } from './core/palette';

const canvas = document.getElementById('stage') as HTMLCanvasElement;
const screenCtx = canvas.getContext('2d')!;
const st: GameState = createInitialState();
const compositor = new StageCompositor();
const lab = new CalibrationLab();
const foley = new FoleyEngine();

const params = new URLSearchParams(window.location.search);
if (params.get('lab') === '1') {
  st.labOpen = true;
  // On mobile <=980px default to collapsed side pull-tab so playable booth fills viewport cleanly first!
  st.labMobileOpen = window.innerWidth > 980;
}

let viewTransform = { ox: 0, oy: 0, sw: 1280, sh: 720, scale: 1 };

function resizeCanvas(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  canvas.width = Math.max(1, Math.floor(vw * dpr));
  canvas.height = Math.max(1, Math.floor(vh * dpr));
  screenCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let targetAspect = STAGE_W / STAGE_H;
  if (st.aspectLock === '4:3') targetAspect = 4 / 3;
  else if (st.aspectLock === '9:16') targetAspect = 9 / 16;

  if (st.aspectLock === 'free') {
    const scale = Math.min(vw / STAGE_W, vh / STAGE_H);
    const sw = STAGE_W * scale;
    const sh = STAGE_H * scale;
    viewTransform = { ox: (vw - sw) * 0.5, oy: (vh - sh) * 0.5, sw, sh, scale };
  } else {
    const boxW = Math.min(vw, vh * targetAspect);
    const boxH = boxW / targetAspect;
    const scale = Math.min(boxW / STAGE_W, boxH / STAGE_H);
    const sw = STAGE_W * scale;
    const sh = STAGE_H * scale;
    viewTransform = { ox: (vw - sw) * 0.5, oy: (vh - sh) * 0.5, sw, sh, scale };
  }
}

function screenToStage(sx: number, sy: number): { x: number; y: number } {
  return {
    x: (sx - viewTransform.ox) / Math.max(1e-4, viewTransform.scale),
    y: (sy - viewTransform.oy) / Math.max(1e-4, viewTransform.scale),
  };
}

function inRect(px: number, py: number, r: { x: number; y: number; w: number; h: number }): boolean {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

function hitTestZone(x: number, y: number): string {
  if (st.beat === 'title') return 'title_start';
  if (Math.hypot(x - INTERCOM_GRILLE.cx, y - INTERCOM_GRILLE.cy) <= INTERCOM_GRILLE.r + 8) return 'intercom';
  if (inRect(x, y, LAMP_HOOD_HIT)) return 'lamp';
  if (inRect(x, y, SHUTTER_LATCH_RECT) && st.beat === 'night1_dawn_latch') return 'shutter';
  if (inRect(x, y, DRAWER_HANDLE_RECT)) return 'drawer';
  if (inRect(x, y, BOTTLE_RACK_HIT)) return 'bottle';
  if (inRect(x, y, GRACE_TIN_HIT)) return 'grace';
  if (inRect(x, y, STAMP_HIT_RECT)) return 'stamp';
  if (st.script && st.drawerIn && !st.packetInDrawer && inRect(x, y, PAPER_WRAP_RECT)) return 'paper';
  return '';
}

// ----------------------------------------------------------------------
// CORE PHYSICAL ACTIONS
// ----------------------------------------------------------------------
function setLampMode(mode: LampMode): void {
  if (st.lampMode === mode) return;
  st.lampMode = mode;
  st.lampAngle.target = mode === 'COUNTER' ? 0 : mode === 'DIM' ? 1 : 2;
  st.lampGlow.target = mode === 'COUNTER' ? 1 : mode === 'DIM' ? 0.08 : 0.78;
  foley.playLampClick(mode !== 'DIM');
}

function cycleLampMode(): void {
  const order: LampMode[] = ['COUNTER', 'DIM', 'CURB'];
  setLampMode(order[(order.indexOf(st.lampMode) + 1) % order.length]);
}

function toggleIntercom(held: boolean): void {
  if (st.beat === 'title') return;
  if (st.intercomHeld === held) return;
  st.intercomHeld = held;
  st.intercomSpring.target = held ? 1 : 0;
  if (held) {
    st.bottleTilting = false;
    st.bottleTilt.target = 0;
    st.dialogueReveal = 0.08;
    const tone = st.visitor === 'tomas' ? 'tomas' : 'maren';
    foley.setIntercom(true, st.visitor !== 'none' ? tone : undefined);
  } else {
    foley.setIntercom(false);
    if (st.visitorLines.length > 1) {
      st.visitorLineIdx = (st.visitorLineIdx + 1) % st.visitorLines.length;
    }
  }
}

function toggleDrawer(): void {
  if (st.beat === 'title' || st.intercomHeld) return;
  if (!st.drawerIn) {
    st.drawerIn = true;
    st.drawerPos.target = 1;
    foley.playDrawerSlide(true);
  } else {
    if (st.stamped && !st.packetInDrawer) {
      st.packetInDrawer = true;
    }
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.reviewScriptOpen = false;
    foley.playDrawerSlide(false);

    if (st.packetInDrawer && !st.handedOver) {
      st.handedOver = true;
      const graced = st.graceTucked || st.lampMode === 'CURB' || st.curbHoldTimer > 0.35;
      if (st.beat === 'night1_maren' && graced) st.marenGraced = true;
      else if (st.beat === 'night1_tomas') st.tomasGraced = true;
      st.visitorPresence.target = 0;
    }
  }
}

function startPourPill(): void {
  if (st.intercomHeld || !st.script || !st.drawerIn || st.paperFold > 0.4 || st.stamped) return;
  if (!st.bottleTilting) foley.playBottleRattle();
  st.bottleTilting = true;
  st.bottleTilt.target = 1;
}

function stopPourPill(): void {
  st.bottleTilting = false;
  st.bottleTilt.target = 0;
}

function spawnOnePill(): void {
  if (!st.script) return;
  const maxPills = Math.min(st.script.pillsNeeded + 1, 5);
  if (st.pills.length >= maxPills) {
    stopPourPill();
    return;
  }
  const slot = st.pills.length;
  const id = slot + 1;
  st.pills.push({
    id,
    x: 806 + (hash2(id, st.boilTick, 17) - 0.5) * 14,
    y: 526,
    vx: -48 - slot * 24 + (hash2(id, 3, 29) - 0.5) * 18,
    vy: 28,
    rot: (hash2(id, 5, 31) - 0.5) * 1.4,
    vrot: (hash2(id, 7, 37) - 0.5) * 8,
    settled: false,
    grooveSlot: slot,
    clacked: false,
  });
}

function tuckUnbilledGrace(): void {
  if (st.intercomHeld || !st.script || !st.drawerIn || st.paperFold > 0.4 || st.graceTucked) return;
  st.graceTucked = true;
  st.graceAnim.target = 1;
  foley.playPaperFold(true);
}

function completePaperFold(): void {
  if (!st.script || !st.drawerIn || st.pills.length < st.script.pillsNeeded || st.paperFold >= 0.99) return;
  st.paperFold = 1;
  st.paperFoldSpring.target = 1;
  foley.playPaperFold(false);
}

// Start exact 60fps Stamp Choreography (f0..f4 wind-up -> f5..f9 strike -> f10 EXACT CONTACT -> f10..f13 hitstop -> f14..f20 recoil!)
function slamStamp(): void {
  if (st.intercomHeld || !st.script || !st.drawerIn || st.paperFold < 0.85 || st.stamped || st.stampChoreo.active) return;
  st.stampChoreo.active = true;
  st.stampChoreo.frame = 0;
  st.stampChoreo.accum = 0;
  st.stampChoreo.hitstopLeft = 0;
  st.stampChoreo.invertFlash = false;
  st.stampChoreo.cardShakeX = 0;
  st.stampChoreo.spatterSeed = (st.boilTick + 17) | 0;
}

function closeDawnShutter(): void {
  if (st.beat !== 'night1_dawn_latch') return;
  st.shutterClosed.target = 1;
  foley.playDrawerSlide(false);
}

function beginFromTitle(): void {
  if (st.beat !== 'title') return;
  st.bayerTransition = 1;
  enterBeat(st, 'night1_maren');
  foley.playLampClick(true);
}

// ----------------------------------------------------------------------
// DETERMINISTIC FIXED-STEP SIMULATION UPDATE
// ----------------------------------------------------------------------
function advanceStamp60Hz(): void {
  const ch = st.stampChoreo;
  if (!ch.active) return;
  ch.frame++;
  ch.invertFlash = false;

  if (ch.frame === 10) {
    // EXACT CONTACT FRAME f10 (Opus Gate 2 lock!):
    // Seal prints NOW, 1-frame inverted patch around seal, 4-frame hitstop (f10..f13), +8ms thud audio!
    st.stamped = true;
    ch.invertFlash = true;
    ch.hitstopLeft = 4;
    ch.cardShakeX = 2.0;
    foley.playStampImpact();
  } else if (ch.frame >= 11 && ch.frame <= 13) {
    // f11..13: card-only +-2px horizontal shake decaying monotonically across hitstop!
    const decay = (14 - ch.frame) / 4;
    ch.cardShakeX = (ch.frame % 2 === 1 ? -2.0 : 2.0) * decay;
  } else {
    ch.cardShakeX = 0;
  }

  if (ch.frame > 20) {
    ch.active = false;
    ch.frame = -1;
    ch.cardShakeX = 0;
    ch.invertFlash = false;
  }
}

function stepSim(dt: number): void {
  const cdt = Math.min(dt, 1 / 24);

  // Step exact 60fps stamp choreography accumulator
  if (st.stampChoreo.active) {
    st.stampChoreo.accum += cdt;
    while (st.stampChoreo.accum >= 1 / 60 - 1e-6 && st.stampChoreo.active) {
      st.stampChoreo.accum -= 1 / 60;
      advanceStamp60Hz();
    }
  }

  // During 4-frame stamp hitstop (f10..f13), hold world physics still while card shakes +-2px!
  if (st.stampChoreo.active && st.stampChoreo.frame >= 10 && st.stampChoreo.frame <= 13) {
    st.simTime += cdt;
    return;
  }

  st.simTime += cdt;
  st.beatTime += cdt;
  if (st.copyDiffFlash > 0) st.copyDiffFlash = Math.max(0, st.copyDiffFlash - cdt);

  st.boilTick = Math.floor(st.simTime * clamp(st.dna.boilFps, 2, 24));

  if (st.bayerTransition > 0) {
    st.bayerTransition = Math.max(0, st.bayerTransition - cdt * 1.45);
  }

  st.visitorPresence.step(cdt);
  st.lampAngle.step(cdt);
  st.lampGlow.step(cdt);
  st.intercomSpring.step(cdt);
  st.drawerPos.step(cdt);
  st.bottleTilt.step(cdt);
  st.graceAnim.step(cdt);
  st.paperFoldSpring.step(cdt);
  st.shutterClosed.step(cdt);

  // Smooth 10-frame (~0.42s @ 24fps) ease-out counter card slide from under steel lip (Opus Gate 2 lock!)
  if (st.script && st.drawerIn && !st.packetInDrawer && !st.handedOver) {
    st.paperSlide = Math.min(1, st.paperSlide + cdt / (10 / 24));
  } else if (!st.drawerIn) {
    st.paperSlide = Math.max(0, st.paperSlide - cdt / (6 / 24));
  }

  if (st.intercomHeld && st.dialogueReveal < 1) {
    st.dialogueReveal = Math.min(1, st.dialogueReveal + cdt * 0.92);
  }

  if (st.lampMode === 'CURB' && st.visitor !== 'none') {
    st.curbHoldTimer += cdt;
    if (st.handedOver && st.beat === 'night1_maren') st.marenGraced = true;
    if (st.handedOver && st.beat === 'night1_tomas') st.tomasGraced = true;
  }

  // Bottle pour cadence (fast & crisp <= 1.2s for 2-3 pills)
  if (st.bottleTilting && st.bottleTilt.value > 0.56) {
    st.pourCooldown -= cdt;
    if (st.pourCooldown <= 0) {
      spawnOnePill();
      st.pourCooldown = 0.36;
      if (st.script && st.pills.length >= st.script.pillsNeeded) {
        stopPourPill();
      }
    }
  }

  const grooveY = SLATE_TRAY_RECT.y + SLATE_TRAY_RECT.h * 0.48;
  for (const p of st.pills) {
    if (p.settled) continue;
    p.vy += 1080 * cdt;
    p.x += p.vx * cdt;
    p.y += p.vy * cdt;
    p.rot += p.vrot * cdt;

    const targetX = SLATE_TRAY_RECT.x + 48 + p.grooveSlot * 42;
    if (p.y >= grooveY) {
      p.y = grooveY;
      if (!p.clacked) {
        p.clacked = true;
        foley.playPillClack(0.94 + p.grooveSlot * 0.06, p.id * 11);
      }
      if (Math.abs(p.vy) > 95) {
        p.vy = -p.vy * 0.34;
        p.vx *= 0.65;
        p.vrot *= 0.5;
      } else {
        p.vy = 0;
        p.x += (targetX - p.x) * Math.min(1, cdt * 16);
        p.vx *= 0.78;
        p.vrot *= 0.7;
        if (Math.abs(targetX - p.x) < 1.8) {
          p.x = targetX;
          p.settled = true;
        }
      }
    }
  }

  if (st.beat === 'night1_maren' && st.handedOver && st.visitorPresence.value < 0.06) {
    enterBeat(st, 'night1_anomaly');
    foley.playAnomalyHush();
  } else if (st.beat === 'night1_anomaly') {
    if (st.lampMode === 'COUNTER') st.anomalyGlancedInCounter = true;
    st.anomalyHoldTimer += cdt;
    if ((st.anomalyGlancedInCounter && st.anomalyHoldTimer > 4.2) || st.anomalyHoldTimer > 7.5) {
      enterBeat(st, 'night1_tomas');
    }
  } else if (st.beat === 'night1_tomas' && st.handedOver && st.visitorPresence.value < 0.06) {
    enterBeat(st, 'night1_dawn_latch');
  } else if (st.beat === 'night1_dawn_latch' && st.shutterClosed.value > 0.95) {
    st.bayerTransition = 1;
    enterBeat(st, 'night2_preview');
  }
}

function present(): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  screenCtx.fillStyle = '#0b0a0e';
  screenCtx.fillRect(0, 0, vw, vh);

  const stageImg = compositor.renderFrame(st);
  screenCtx.drawImage(stageImg, viewTransform.ox, viewTransform.oy, viewTransform.sw, viewTransform.sh);
  lab.render(screenCtx, st, vw, vh);
}

// ----------------------------------------------------------------------
// POINTER & KEYBOARD INPUT
// ----------------------------------------------------------------------
canvas.addEventListener('pointerdown', (e) => {
  foley.unlock();
  if (lab.handlePointerDown(st, e.clientX, e.clientY)) return;

  const pt = screenToStage(e.clientX, e.clientY);
  const zone = hitTestZone(pt.x, pt.y);
  st.hoverZone = zone;

  if (st.beat === 'title') {
    beginFromTitle();
    return;
  }
  if (zone === 'intercom') toggleIntercom(true);
  else if (zone === 'lamp') cycleLampMode();
  else if (zone === 'drawer') toggleDrawer();
  else if (zone === 'bottle') startPourPill();
  else if (zone === 'grace') tuckUnbilledGrace();
  else if (zone === 'paper') {
    if (st.script && st.pills.length >= st.script.pillsNeeded && st.paperFold < 0.99) {
      st.draggingPaper = true;
      st.paperDragStartX = pt.x;
      st.paperDragStartY = pt.y;
    } else if (st.script && st.drawerIn) {
      st.reviewScriptOpen = !st.reviewScriptOpen;
    }
  } else if (zone === 'stamp') slamStamp();
  else if (zone === 'shutter') closeDawnShutter();
});

canvas.addEventListener('pointermove', (e) => {
  if (lab.handlePointerMove(st, e.clientX)) return;
  const pt = screenToStage(e.clientX, e.clientY);
  st.pointerX = clamp(pt.x / STAGE_W, 0, 1);
  st.pointerY = clamp(pt.y / STAGE_H, 0, 1);
  st.hoverZone = hitTestZone(pt.x, pt.y);

  if (st.draggingPaper) {
    const dy = pt.y - st.paperDragStartY;
    const dx = Math.abs(pt.x - st.paperDragStartX);
    const dragAmt = clamp((dy + dx * 0.45) / 62, 0, 1);
    st.paperFold = dragAmt;
    st.paperFoldSpring.target = dragAmt;
    if (dragAmt >= 0.72) {
      st.draggingPaper = false;
      completePaperFold();
    }
  }
});

window.addEventListener('pointerup', () => {
  lab.handlePointerUp(st);
  if (st.intercomHeld) toggleIntercom(false);
  if (st.bottleTilting) stopPourPill();
  if (st.draggingPaper) {
    st.draggingPaper = false;
    if (st.paperFold >= 0.32) completePaperFold();
    else {
      st.paperFold = 0;
      st.paperFoldSpring.target = 0;
    }
  }
});

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  foley.unlock();
  const k = e.key.toLowerCase();

  if (k === 'l') {
    st.labOpen = !st.labOpen;
    st.labMobileOpen = st.labOpen;
    return;
  }
  if (st.beat === 'title' && (k === 'enter' || k === ' ')) {
    e.preventDefault();
    beginFromTitle();
    return;
  }
  if (k === '1') setLampMode('COUNTER');
  else if (k === '2') setLampMode('DIM');
  else if (k === '3') setLampMode('CURB');
  else if (k === ' ') {
    e.preventDefault();
    toggleIntercom(true);
  } else if (k === 'd') toggleDrawer();
  else if (k === 'p') startPourPill();
  else if (k === 'g') tuckUnbilledGrace();
  else if (k === 'f') completePaperFold();
  else if (k === 's') slamStamp();
  else if (k === 'r') st.reviewScriptOpen = !st.reviewScriptOpen;
  else if (k === 'e') closeDawnShutter();
});

window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (k === ' ') toggleIntercom(false);
  if (k === 'p') stopPourPill();
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ----------------------------------------------------------------------
// DETERMINISTIC LOOKDEV & MULTIMODAL QA HOOK (`window.D`)
// ----------------------------------------------------------------------
let manualClock = params.get('manual') === '1';

const D = {
  setManual(v: boolean) {
    manualClock = v;
  },
  adv(dt: number, steps = 1) {
    for (let i = 0; i < steps; i++) stepSim(dt);
    present();
    return { t: st.simTime, beat: st.beat, boil: st.boilTick, pills: st.pills.length, stampFrame: st.stampChoreo.frame };
  },
  snap(): string {
    present();
    return canvas.toDataURL('image/png');
  },
  setBeat(beat: SceneBeat) {
    enterBeat(st, beat);
    present();
  },
  setLamp(mode: LampMode) {
    setLampMode(mode);
    st.lampAngle.snap(mode === 'COUNTER' ? 0 : mode === 'DIM' ? 1 : 2);
    st.lampGlow.snap(mode === 'COUNTER' ? 1 : mode === 'DIM' ? 0.08 : 0.78);
    present();
  },
  setView(viewMode: ViewMode, soloLayer = 0, ground: GroundMode = 'dark') {
    st.viewMode = viewMode;
    st.soloLayer = soloLayer;
    st.groundMode = ground;
    present();
  },
  setLab(open: boolean) {
    st.labOpen = open;
    st.labMobileOpen = open;
    present();
  },
  setReview(open: boolean) {
    st.reviewScriptOpen = open;
    present();
  },
  action(name: string) {
    if (name === 'start') beginFromTitle();
    else if (name === 'intercom_on') toggleIntercom(true);
    else if (name === 'intercom_off') toggleIntercom(false);
    else if (name === 'drawer') toggleDrawer();
    else if (name === 'pour_start') startPourPill();
    else if (name === 'pour_stop') stopPourPill();
    else if (name === 'grace') tuckUnbilledGrace();
    else if (name === 'fold') completePaperFold();
    else if (name === 'stamp') slamStamp();
    else if (name === 'shutter') closeDawnShutter();
    present();
  },
  state() {
    return {
      beat: st.beat,
      clock: st.clockDisplay,
      lampMode: st.lampMode,
      visitor: st.visitor,
      drawerIn: st.drawerIn,
      pills: st.pills.length,
      graceTucked: st.graceTucked,
      paperFold: st.paperFold,
      stamped: st.stamped,
      stampFrame: st.stampChoreo.frame,
      handedOver: st.handedOver,
      marenGraced: st.marenGraced,
      tomasGraced: st.tomasGraced,
      reversedBottleIdx: st.reversedBottleIdx,
      webglActive: compositor.webglActive,
    };
  },
  async exportStemWavBase64(stem: AudioStemId, durationSec = 2.6): Promise<string> {
    const bytes = await foley.renderVacuumStemWav(stem, durationSec);
    let bin = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(bin);
  },
};

(window as unknown as { D: typeof D }).D = D;

let lastTs = performance.now();
function frame(now: number): void {
  const dt = Math.min((now - lastTs) / 1000, 0.05);
  lastTs = now;
  if (!manualClock) {
    stepSim(dt);
    present();
  }
  requestAnimationFrame(frame);
}

present();
requestAnimationFrame(frame);
