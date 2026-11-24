// Core Game State Machine for TAKE BEFORE SLEEP (Upgraded Per Opus Gate 2)
// Exact 60fps Stamp Choreography: f0-4 wind-up -> f5-9 accelerating strike ->
// f10 contact (seal + 1-frame inverted patch + 7 ink-spatter dots + +8ms thud) ->
// f10-13 4-frame hitstop (card-only +-2px horizontal shake) -> f14-20 recoil + 2px overshoot.

import { Spring } from './spring';
import { DEFAULT_DNA, VisualDNA, GroundMode, ViewMode, AspectLock, PRESETS } from './palette';

export type LampMode = 'COUNTER' | 'DIM' | 'CURB';

export type SceneBeat =
  | 'title'
  | 'night1_maren'
  | 'night1_anomaly'
  | 'night1_tomas'
  | 'night1_dawn_latch'
  | 'night2_preview';

export type VisitorId = 'none' | 'maren' | 'tomas';

export interface PillBody {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  settled: boolean;
  grooveSlot: number;
  clacked: boolean;
}

export interface ScriptSpec {
  clockText: string;
  hand: 'pharmacist' | 'doctor';
  heading: string;
  doseLine: string;
  noteLine: string;
  pillsNeeded: number;
  coinPairs: number;
  shortCoins: boolean;
}

export interface StampChoreo {
  active: boolean;
  frame: number;         // exact 60fps discrete frame counter 0..20!
  accum: number;         // sub-frame accumulator at 1/60s
  hitstopLeft: number;   // 4 frames (f10..f13)
  invertFlash: boolean;  // strictly 1 frame at f10 around seal!
  cardShakeX: number;    // +-2px horizontal strictly on paper card mesh during hitstop!
  spatterSeed: number;
}

export interface GameState {
  simTime: number;
  boilTick: number;
  beatTime: number;

  beat: SceneBeat;
  clockDisplay: string;
  visitor: VisitorId;
  visitorPresence: Spring;
  visitorLines: string[];
  visitorLineIdx: number;
  dialogueReveal: number;

  lampMode: LampMode;
  lampAngle: Spring;      // 0 = COUNTER, 1 = DIM, 2 = CURB
  lampGlow: Spring;
  curbHoldTimer: number;
  intercomHeld: boolean;
  intercomSpring: Spring;

  drawerIn: boolean;
  drawerPos: Spring;
  drawerWarmth: number;

  script: ScriptSpec | null;
  paperSlide: number;     // 0..1 smooth 10-frame ease-out slide from under steel lip (Gate 2!)
  reviewScriptOpen: boolean; // UI Rx overlay ONLY in explicit review mode (Gate 2!)
  bottleTilting: boolean;
  bottleTilt: Spring;
  pourCooldown: number;
  pills: PillBody[];
  graceTucked: boolean;
  graceAnim: Spring;
  paperFold: number;
  paperFoldSpring: Spring;
  draggingPaper: boolean;
  paperDragStartX: number;
  paperDragStartY: number;
  stamped: boolean;
  stampChoreo: StampChoreo;
  stampTimeText: string;
  packetInDrawer: boolean;
  handedOver: boolean;

  reversedBottleIdx: number;
  anomalyTriggered: boolean;
  anomalyGlancedInCounter: boolean;
  anomalyHoldTimer: number;
  marenGraced: boolean;
  tomasGraced: boolean;
  shutterClosed: Spring;
  bayerTransition: number;

  pointerX: number;
  pointerY: number;
  hoverZone: string;

  // Calibration Lab & Vacuum Inspection State
  labOpen: boolean;
  labMobileOpen: boolean;
  viewMode: ViewMode;
  soloLayer: number;
  groundMode: GroundMode;
  aspectLock: AspectLock;
  dna: VisualDNA;
  slotA: VisualDNA;
  slotB: VisualDNA;
  slotBlend: number;
  activePresetIdx: number;
  copyDiffFlash: number;
  activeScrubber: string | null;
}

export const MAREN_SCRIPT: ScriptSpec = {
  clockText: '02:18',
  hand: 'pharmacist',
  heading: '2x Valerian',
  doseLine: 'take before sleep',
  noteLine: 'for the stiff wrist',
  pillsNeeded: 2,
  coinPairs: 2,
  shortCoins: false,
};

export const TOMAS_SCRIPT: ScriptSpec = {
  clockText: '03:22',
  hand: 'pharmacist',
  heading: '3x Calm Wafers',
  doseLine: 'clean linen + salve',
  noteLine: 'wet junction burn',
  pillsNeeded: 3,
  coinPairs: 1,
  shortCoins: true,
};

export function createIdleStampChoreo(): StampChoreo {
  return {
    active: false,
    frame: -1,
    accum: 0,
    hitstopLeft: 0,
    invertFlash: false,
    cardShakeX: 0,
    spatterSeed: 1,
  };
}

export function createInitialState(): GameState {
  return {
    simTime: 0,
    boilTick: 0,
    beatTime: 0,

    beat: 'title',
    clockDisplay: '02:10',
    visitor: 'maren',
    visitorPresence: new Spring(0.78, 45, 11),
    visitorLines: [],
    visitorLineIdx: 0,
    dialogueReveal: 0,

    lampMode: 'COUNTER',
    lampAngle: new Spring(0, 140, 16),
    lampGlow: new Spring(1, 110, 14),
    curbHoldTimer: 0,
    intercomHeld: false,
    intercomSpring: new Spring(0, 260, 20),

    drawerIn: false,
    drawerPos: new Spring(0, 180, 21), // Crisper heavy steel spring detent (Gate 2!)
    drawerWarmth: 0,

    script: null,
    paperSlide: 0,
    reviewScriptOpen: false,
    bottleTilting: false,
    bottleTilt: new Spring(0, 180, 17),
    pourCooldown: 0,
    pills: [],
    graceTucked: false,
    graceAnim: new Spring(0, 180, 16),
    paperFold: 0,
    paperFoldSpring: new Spring(0, 190, 18),
    draggingPaper: false,
    paperDragStartX: 0,
    paperDragStartY: 0,
    stamped: false,
    stampChoreo: createIdleStampChoreo(),
    stampTimeText: '02:18',
    packetInDrawer: false,
    handedOver: false,

    reversedBottleIdx: -1,
    anomalyTriggered: false,
    anomalyGlancedInCounter: false,
    anomalyHoldTimer: 0,
    marenGraced: false,
    tomasGraced: false,
    shutterClosed: new Spring(0, 95, 16),
    bayerTransition: 0,

    pointerX: 0.5,
    pointerY: 0.5,
    hoverZone: '',

    labOpen: false,
    labMobileOpen: false,
    viewMode: 'composite',
    soloLayer: 0,
    groundMode: 'dark',
    aspectLock: 'free',
    dna: { ...DEFAULT_DNA },
    slotA: { ...PRESETS[0].dna },
    slotB: { ...PRESETS[3].dna },
    slotBlend: 0,
    activePresetIdx: 0,
    copyDiffFlash: 0,
    activeScrubber: null,
  };
}

export function resetDispensingTray(st: GameState, script: ScriptSpec | null): void {
  st.script = script;
  st.paperSlide = 0;
  st.reviewScriptOpen = false;
  st.bottleTilting = false;
  st.bottleTilt.target = 0;
  st.pourCooldown = 0;
  st.pills = [];
  st.graceTucked = false;
  st.graceAnim.snap(0);
  st.paperFold = 0;
  st.paperFoldSpring.snap(0);
  st.draggingPaper = false;
  st.stamped = false;
  st.stampChoreo = createIdleStampChoreo();
  st.packetInDrawer = false;
  st.handedOver = false;
  st.curbHoldTimer = 0;
  if (script) st.stampTimeText = script.clockText;
}

export function enterBeat(st: GameState, beat: SceneBeat): void {
  st.beat = beat;
  st.beatTime = 0;
  st.dialogueReveal = 0;
  st.visitorLineIdx = 0;

  if (beat === 'title') {
    st.clockDisplay = '02:10';
    st.visitor = 'maren';
    st.visitorPresence.snap(0.78);
    st.lampMode = 'COUNTER';
    st.lampAngle.snap(0);
    st.lampGlow.snap(1);
    st.drawerIn = false;
    st.drawerPos.snap(0);
    st.reversedBottleIdx = -1;
    resetDispensingTray(st, null);
  } else if (beat === 'night1_maren') {
    st.clockDisplay = '02:18';
    st.visitor = 'maren';
    st.visitorPresence.target = 1;
    st.visitorLines = [
      'Sorry to drip on your steel. Two valerian, if you have them.',
      'Exact coins, paired up so you do not have to strain.',
      'Keep your sleeves dry in there.',
    ];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.reversedBottleIdx = -1;
    resetDispensingTray(st, MAREN_SCRIPT);
  } else if (beat === 'night1_anomaly') {
    st.clockDisplay = '03:14';
    st.visitor = 'none';
    st.visitorPresence.target = 0;
    st.visitorLines = [];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.reversedBottleIdx = 1;
    st.anomalyTriggered = true;
    st.anomalyGlancedInCounter = false;
    st.anomalyHoldTimer = 0;
    resetDispensingTray(st, null);
  } else if (beat === 'night1_tomas') {
    st.clockDisplay = '03:22';
    st.visitor = 'tomas';
    st.visitorPresence.target = 1;
    st.visitorLines = [
      'Junction box bit my palm. Three calm wafers, whatever gauze is cheap.',
      'Wait... I am two coins short. Never mind, leave the salve off.',
      '...Thank you. The corner lamp outside is dying anyway.',
    ];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.reversedBottleIdx = -1;
    resetDispensingTray(st, TOMAS_SCRIPT);
  } else if (beat === 'night1_dawn_latch') {
    st.clockDisplay = '04:52';
    st.visitor = 'none';
    st.visitorPresence.target = 0;
    st.visitorLines = [];
    st.reversedBottleIdx = -1;
    resetDispensingTray(st, null);
  } else if (beat === 'night2_preview') {
    st.clockDisplay = '02:05';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.visitorLines = [];
    st.lampMode = 'DIM';
    st.lampAngle.snap(1);
    st.lampGlow.snap(0.08);
    st.shutterClosed.snap(0);
    st.reversedBottleIdx = -1;
    resetDispensingTray(st, null);
  }
}
