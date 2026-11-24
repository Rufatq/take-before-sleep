// Core Game State Machine for TAKE BEFORE SLEEP (Phase 2 — Complete 4-Night Living Arc)
// Implements Opus Gate 3 Choreography & Voice Bible:
// - Nights I..IV + Dawn Resolution (Maren, Tomas, Nadia, Dr. Halvorsen, Quiet Rearrangement)
// - Exact 60fps 95ms Hush -> 6-Frame Eyelid-Biased Bayer Microsleep Blink (plus Night IV Halvorsen knock reversal!)
// - 4 distinct tactile apothecary props (valerian, camphor, salts, linen)
// - Subtle 40s-decay warmth cues on stamp handle & drawer latch (zero robot labels)

import { Spring } from './spring';
import { DEFAULT_DNA, VisualDNA, GroundMode, ViewMode, AspectLock, PRESETS } from './palette';

export type LampMode = 'COUNTER' | 'DIM' | 'SILL';
export type PropType = 'valerian' | 'camphor' | 'salts' | 'linen';
export type VisitorId = 'none' | 'maren' | 'tomas' | 'nadia' | 'halvorsen';

export type SceneBeat =
  | 'title'
  | 'n1_maren'
  | 'n1_anomaly'
  | 'n1_tomas'
  | 'n1_dawn'
  | 'n2_intro'
  | 'n2_nadia'
  | 'n2_halvorsen'
  | 'n2_microsleep'
  | 'n2_dawn'
  | 'n3_maren'
  | 'n3_nadia'
  | 'n3_rearrangement'
  | 'n3_dawn'
  | 'n4_tomas'
  | 'n4_halvorsen'
  | 'n4_dawn_packet'
  | 'ending_dawn';

export interface PillBody {
  id: number;
  kind: PropType;
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
  propType: PropType;
  dosesNeeded: number;
  coinPairs: number;
  extraCoin: boolean;      // Maren Night III silent extra coin set apart!
  fortyCentsOnly: boolean; // Tomas Night IV returned 40 cents
  selfWritten: boolean;    // Night III bone-dry own-hand 03:01 script
  noDispense?: boolean;    // Tomas Night IV repayment / Halvorsen dawn packet
}

export interface StampChoreo {
  active: boolean;
  frame: number;
  accum: number;
  hitstopLeft: number;
  invertFlash: boolean;
  cardShakeX: number;
  spatterSeed: number;
}

export interface MicrosleepChoreo {
  active: boolean;
  interruptedByKnock: boolean; // Night IV Halvorsen knuckle reversal at f7!
  frame: number;               // 60fps exact frame 0..29 (f0-5 hush, f6-11 Bayer lid, f12-29 settle)
  accum: number;
  lidAmount: number;           // 0..1 Bayer eyelid closure (4/16 -> 10/16 -> 16/16)
  targetClock: string;
  targetUncorked: number[];
  targetLedgerTallies: number;
  targetBlotterStamp: string;
  targetInkThumbprint: boolean;
  targetOpenDrawerInside: boolean;
  swapped: boolean;
  knockFlash: number;          // Visual knuckle contact ripple on glass at Night IV f7!
}

export interface GameState {
  simTime: number;
  boilTick: number;
  beatTime: number;
  nightNum: number;

  beat: SceneBeat;
  nightCardText: string;
  nightCardTimer: number;
  clockDisplay: string;
  visitor: VisitorId;
  visitorPresence: Spring;
  visitorLines: string[];
  visitorLineIdx: number;
  dialogueReveal: number;
  nadiaFogAlpha: number;       // Two fading fingertip condensation ovals on glass (3s decay)
  weatherIntensity: number;    // Evolves across nights (1.0 -> 1.35 storm -> 0.45 thinning dawn)

  lampMode: LampMode;
  lampAngle: Spring;
  lampGlow: Spring;
  sillHoldTimer: number;
  intercomHeld: boolean;
  intercomSpring: Spring;

  drawerIn: boolean;
  drawerPos: Spring;
  inkThumbprint: boolean;      // Fresh vermilion thumb smudge on inner steel pull bar after lost minutes!
  wetInkSheen: number;         // 0..1 glistening fresh crimson ink drying matte over 40s!
  blotterStampTime: string;    // Unremembered fresh stamp on counter blotter scrap ('02:51' / '03:01')
  preStampedPacketInTray: boolean; // Night III: pre-folded 03:01 packet inside slightly-open tray!

  script: ScriptSpec | null;
  paperSlide: number;
  reviewScriptOpen: boolean;
  activeProp: PropType;
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

  // Night IV Unstamped Dawn Packet from Halvorsen
  halvorsenPacketInDrawer: boolean;
  tookDawnPacket: boolean;
  dawnPacketAnim: Spring;
  leftSillLampOnAtDawn: boolean;

  // Quiet Unremembered Accounting & Microsleep State (100% pharmacy-native!)
  uncorkedBottles: number[];   // Reflected back-shelf bottles uncorked with cork beside base + loose tablet
  ledgerTallies: number;       // Unremembered chalk/ink tally strokes beside mirrored shelf rail
  microsleep: MicrosleepChoreo;
  cameraPitch: Spring;         // Damped spring (zeta ~0.55) for microsleep pitch dip & settle!
  anomalyGlanced: boolean;
  anomalyHoldTimer: number;

  // Persistent Human Consequence Flags (Zero UI Popups!)
  marenGraced: boolean;
  tomasGraced: boolean;
  nadiaGraced: boolean;
  halvorsenGraced: boolean;

  shutterClosed: Spring;       // 1.4s corrugated steel shutter descent
  shutterClosing: boolean;
  shutterProgress: number;     // 0..1 linear-damped 1.4s descent
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

// ----------------------------------------------------------------------
// AUTHORED PRESCRIPTIONS (OPUS GATE 3 VOICE BIBLE — EXACT TEXT)
// ----------------------------------------------------------------------
export const SCRIPTS: Record<string, ScriptSpec> = {
  n1_maren: {
    clockText: '02:18',
    hand: 'pharmacist',
    heading: '2x Valerian',
    doseLine: 'take before sleep',
    noteLine: 'for the stiff wrist',
    propType: 'valerian',
    dosesNeeded: 2,
    coinPairs: 2,
    extraCoin: false,
    fortyCentsOnly: false,
    selfWritten: false,
  },
  n1_tomas: {
    clockText: '03:22',
    hand: 'pharmacist',
    heading: 'Linen + Salve',
    doseLine: 'clean wrap, dry gauze',
    noteLine: 'left palm - night line',
    propType: 'linen',
    dosesNeeded: 2,
    coinPairs: 1,
    extraCoin: false,
    fortyCentsOnly: false,
    selfWritten: false,
  },
  n2_nadia: {
    clockText: '02:34',
    hand: 'pharmacist',
    heading: 'K-Salts efferv. x2',
    doseLine: 'migraine - stat',
    noteLine: 'St. Jude Peds, Fl. 3',
    propType: 'salts',
    dosesNeeded: 2,
    coinPairs: 2,
    extraCoin: false,
    fortyCentsOnly: false,
    selfWritten: false,
  },
  n2_halvorsen: {
    clockText: '02:41',
    hand: 'doctor',
    heading: 'Pulv. antipyret.',
    doseLine: 'one sachet every six hours',
    noteLine: 'For No. 14. - E. Halvorsen, M.D.',
    propType: 'salts',
    dosesNeeded: 2,
    coinPairs: 2,
    extraCoin: false,
    fortyCentsOnly: false,
    selfWritten: false,
  },
  n3_maren: {
    clockText: '02:24',
    hand: 'pharmacist',
    heading: '2x Camphor Balm',
    doseLine: 'rub warm before bed',
    noteLine: 'M. Lind - small tin',
    propType: 'camphor',
    dosesNeeded: 2,
    coinPairs: 2,
    extraCoin: true, // Grace returning quietly!
    fortyCentsOnly: false,
    selfWritten: false,
  },
  n3_nadia: {
    clockText: '02:58',
    hand: 'pharmacist',
    heading: 'K-Salts x2',
    doseLine: 'plain, no caffeine',
    noteLine: 'Peds Night - N.K.',
    propType: 'salts',
    dosesNeeded: 2,
    coinPairs: 2,
    extraCoin: false,
    fortyCentsOnly: false,
    selfWritten: false,
  },
  n3_self: {
    clockText: '03:01',
    hand: 'pharmacist',
    heading: '2x Valerian, 03:01',
    doseLine: 'take before sleep',
    noteLine: '- night clerk (repeat)',
    propType: 'valerian',
    dosesNeeded: 2,
    coinPairs: 0,
    extraCoin: false,
    fortyCentsOnly: false,
    selfWritten: true,
  },
  n4_tomas: {
    clockText: '02:38',
    hand: 'pharmacist',
    heading: '40c',
    doseLine: '',
    noteLine: '',
    propType: 'valerian',
    dosesNeeded: 0,
    coinPairs: 1,
    extraCoin: false,
    fortyCentsOnly: true,
    selfWritten: false,
    noDispense: true,
  },
  n4_halvorsen: {
    clockText: '02:47',
    hand: 'doctor',
    heading: 'For the night clerk.',
    doseLine: 'Eight hours, curtains drawn.',
    noteLine: 'No refills needed. - E. Halvorsen, M.D.',
    propType: 'valerian',
    dosesNeeded: 0,
    coinPairs: 0,
    extraCoin: false,
    fortyCentsOnly: false,
    selfWritten: false,
    noDispense: true,
  },
};

export function createIdleStampChoreo(): StampChoreo {
  return { active: false, frame: -1, accum: 0, hitstopLeft: 0, invertFlash: false, cardShakeX: 0, spatterSeed: 1 };
}

export function createIdleMicrosleep(): MicrosleepChoreo {
  return {
    active: false,
    interruptedByKnock: false,
    frame: -1,
    accum: 0,
    lidAmount: 0,
    targetClock: '02:53',
    targetUncorked: [],
    targetLedgerTallies: 0,
    targetBlotterStamp: '',
    targetInkThumbprint: false,
    targetOpenDrawerInside: false,
    swapped: false,
    knockFlash: 0,
  };
}

export function createInitialState(): GameState {
  return {
    simTime: 0,
    boilTick: 0,
    beatTime: 0,
    nightNum: 1,

    beat: 'title',
    nightCardText: '',
    nightCardTimer: 0,
    clockDisplay: '02:10',
    visitor: 'maren',
    visitorPresence: new Spring(0.78, 45, 11),
    visitorLines: [],
    visitorLineIdx: 0,
    dialogueReveal: 0,
    nadiaFogAlpha: 0,
    weatherIntensity: 1.0,

    lampMode: 'COUNTER',
    lampAngle: new Spring(0, 140, 16),
    lampGlow: new Spring(1, 110, 14),
    sillHoldTimer: 0,
    intercomHeld: false,
    intercomSpring: new Spring(0, 260, 20),

    drawerIn: false,
    drawerPos: new Spring(0, 180, 21),
    inkThumbprint: false,
    wetInkSheen: 0,
    blotterStampTime: '',
    preStampedPacketInTray: false,

    script: null,
    paperSlide: 0,
    reviewScriptOpen: false,
    activeProp: 'valerian',
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

    halvorsenPacketInDrawer: false,
    tookDawnPacket: false,
    dawnPacketAnim: new Spring(0, 140, 18),
    leftSillLampOnAtDawn: false,

    uncorkedBottles: [],
    ledgerTallies: 0,
    microsleep: createIdleMicrosleep(),
    cameraPitch: new Spring(0, 120, 12.1), // Damped spring zeta ~0.55 per Gate 3!
    anomalyGlanced: false,
    anomalyHoldTimer: 0,

    marenGraced: false,
    tomasGraced: false,
    nadiaGraced: false,
    halvorsenGraced: false,

    shutterClosed: new Spring(0, 95, 16),
    shutterClosing: false,
    shutterProgress: 0,
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
  st.activeProp = script ? script.propType : 'valerian';
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
  st.sillHoldTimer = 0;
  if (script) st.stampTimeText = script.clockText;
}

export function startMicrosleep(
  st: GameState,
  opts: {
    targetClock: string;
    uncorked: number[];
    ledgerTallies: number;
    blotterStamp?: string;
    inkThumbprint?: boolean;
    openDrawerInside?: boolean;
    interruptedByKnock?: boolean;
  }
): void {
  st.microsleep = {
    active: true,
    interruptedByKnock: Boolean(opts.interruptedByKnock),
    frame: 0,
    accum: 0,
    lidAmount: 0,
    targetClock: opts.targetClock,
    targetUncorked: opts.uncorked,
    targetLedgerTallies: opts.ledgerTallies,
    targetBlotterStamp: opts.blotterStamp ?? '',
    targetInkThumbprint: Boolean(opts.inkThumbprint),
    targetOpenDrawerInside: Boolean(opts.openDrawerInside),
    swapped: false,
    knockFlash: 0,
  };
}

export function enterBeat(st: GameState, beat: SceneBeat): void {
  st.beat = beat;
  st.beatTime = 0;
  st.dialogueReveal = 0;
  st.visitorLineIdx = 0;
  st.anomalyGlanced = false;
  st.anomalyHoldTimer = 0;
  st.shutterClosing = false;
  st.halvorsenPacketInDrawer = false;

  if (beat === 'title') {
    st.nightNum = 1;
    st.clockDisplay = '02:10';
    st.visitor = 'maren';
    st.visitorPresence.snap(0.78);
    st.lampMode = 'COUNTER';
    st.lampAngle.snap(0);
    st.lampGlow.snap(1);
    st.drawerIn = false;
    st.drawerPos.snap(0);
    st.shutterProgress = 0;
    st.shutterClosed.snap(0);
    st.uncorkedBottles = [];
    st.ledgerTallies = 0;
    st.weatherIntensity = 1.0;
    st.inkThumbprint = false;
    st.wetInkSheen = 0;
    st.blotterStampTime = '';
    st.preStampedPacketInTray = false;
    st.nadiaFogAlpha = 0;
    st.marenGraced = false;
    st.tomasGraced = false;
    st.nadiaGraced = false;
    st.halvorsenGraced = false;
    st.tookDawnPacket = false;
    st.dawnPacketAnim.snap(0);
    st.leftSillLampOnAtDawn = false;
    st.microsleep = createIdleMicrosleep();
    resetDispensingTray(st, null);
  } else if (beat === 'n1_maren') {
    st.nightNum = 1;
    st.clockDisplay = '02:18';
    st.visitor = 'maren';
    st.visitorPresence.target = 1;
    st.visitorLines = [
      'Two of each. I counted at home, so you needn\'t.',
      'Exact. Good night.',
    ];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.uncorkedBottles = [];
    st.ledgerTallies = 0;
    st.weatherIntensity = 1.0;
    resetDispensingTray(st, SCRIPTS.n1_maren);
  } else if (beat === 'n1_anomaly') {
    st.clockDisplay = '02:47';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.visitorLines = [];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.uncorkedBottles = [1]; // Hairline fracture: 1 back bottle sits uncorked with loose tablet in COUNTER reflection!
    st.ledgerTallies = 1;
    resetDispensingTray(st, null);
  } else if (beat === 'n1_tomas') {
    st.clockDisplay = '03:22';
    st.visitor = 'tomas';
    st.visitorPresence.target = 1;
    st.visitorLines = [
      'I\'m short. Forty cents. Payday\'s Thursday, I swear.',
      'Sorry. Bad night to be short.',
    ];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.uncorkedBottles = [];
    st.ledgerTallies = 0;
    resetDispensingTray(st, SCRIPTS.n1_tomas);
  } else if (beat === 'n1_dawn') {
    st.clockDisplay = '04:52';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.visitorLines = [];
    st.uncorkedBottles = [];
    st.ledgerTallies = 0;
    st.weatherIntensity = 0.72;
    resetDispensingTray(st, null);
  } else if (beat === 'n2_intro') {
    st.nightNum = 2;
    st.nightCardText = 'NIGHT II';
    st.nightCardTimer = 3.2;
    st.clockDisplay = '02:05';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.visitorLines = [];
    st.inkThumbprint = false;
    st.wetInkSheen = 0;
    st.blotterStampTime = '';
    st.preStampedPacketInTray = false;
    st.lampMode = 'DIM';
    st.lampAngle.snap(1);
    st.lampGlow.snap(0.08);
    st.shutterProgress = 0;
    st.shutterClosed.snap(0);
    st.uncorkedBottles = [];
    st.ledgerTallies = 0;
    st.weatherIntensity = 1.15;
    resetDispensingTray(st, null);
  } else if (beat === 'n2_nadia') {
    st.nightNum = 2;
    st.clockDisplay = '02:34';
    st.visitor = 'nadia';
    st.visitorPresence.target = 1;
    st.visitorLines = [
      'Migraine powders. Potassium, effervescent. Ward\'s out of both.',
      'Sorry. Fourteen hours. I talk in abbreviations now.',
    ];
    st.nadiaFogAlpha = 1.0;
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.uncorkedBottles = [];
    resetDispensingTray(st, SCRIPTS.n2_nadia);
  } else if (beat === 'n2_halvorsen') {
    st.nightNum = 2;
    st.clockDisplay = '02:41';
    st.visitor = 'halvorsen';
    st.visitorPresence.target = 1;
    st.visitorLines = [
      'Good evening. Fever salts, for the boy at number fourteen.',
      'I\'ve written it out properly. Old habit.',
    ];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    resetDispensingTray(st, SCRIPTS.n2_halvorsen);
  } else if (beat === 'n2_microsleep') {
    st.nightNum = 2;
    st.clockDisplay = '02:47';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.visitorLines = [];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    resetDispensingTray(st, null);
    startMicrosleep(st, {
      targetClock: '02:53',
      uncorked: [1, 3],
      ledgerTallies: 3,
      blotterStamp: '02:51',
    });
  } else if (beat === 'n2_dawn') {
    st.clockDisplay = '04:48';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.visitorLines = [];
    st.weatherIntensity = 0.78;
    resetDispensingTray(st, null);
  } else if (beat === 'n3_maren') {
    st.nightNum = 3;
    st.nightCardText = 'NIGHT III';
    st.nightCardTimer = 2.8;
    st.clockDisplay = '02:24';
    st.visitor = 'maren';
    st.visitorPresence.target = 1;
    st.visitorLines = [
      'Same camphor tin as Tuesday, please.',
      'You look worn thin. No, keep the odd coin. Good night.',
    ];
    st.shutterProgress = 0;
    st.shutterClosed.snap(0);
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.uncorkedBottles = [1, 3];
    st.ledgerTallies = 3;
    st.preStampedPacketInTray = false;
    st.weatherIntensity = 1.32;
    resetDispensingTray(st, SCRIPTS.n3_maren);
  } else if (beat === 'n3_nadia') {
    st.nightNum = 3;
    st.clockDisplay = '02:42';
    st.visitor = 'nadia';
    st.visitorPresence.target = 1;
    st.visitorLines = [
      'Just the potassium tonight.',
      'When did you last sleep? Your ledger\'s filled through Tuesday.',
    ];
    st.nadiaFogAlpha = 1.0;
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.uncorkedBottles = [0, 1, 2, 3];
    st.ledgerTallies = 5;
    resetDispensingTray(st, SCRIPTS.n3_nadia);
  } else if (beat === 'n3_rearrangement') {
    st.nightNum = 3;
    st.clockDisplay = '02:47';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.visitorLines = [];
    resetDispensingTray(st, SCRIPTS.n3_self);
    startMicrosleep(st, {
      targetClock: '03:04',
      uncorked: [0, 1, 2, 3],
      ledgerTallies: 5,
      blotterStamp: '03:01',
      inkThumbprint: true,
      openDrawerInside: true, // Steel airlock drawer already open 2 inches holding pre-stamped 03:01 packet!
    });
  } else if (beat === 'n3_dawn') {
    st.clockDisplay = '04:50';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.visitorLines = [];
    st.preStampedPacketInTray = false;
    st.weatherIntensity = 0.85;
    resetDispensingTray(st, null);
  } else if (beat === 'n4_tomas') {
    st.nightNum = 4;
    st.nightCardText = 'NIGHT IV';
    st.nightCardTimer = 2.8;
    st.clockDisplay = '02:38';
    st.visitor = 'tomas';
    st.visitorPresence.target = 1;
    st.inkThumbprint = false;
    st.wetInkSheen = 0;
    st.blotterStampTime = '';
    st.preStampedPacketInTray = false;
    st.visitorLines = [
      'Didn\'t need anything. Just saw the window still lit.',
      'Thursday. Told you I\'d bring it.',
    ];
    st.shutterProgress = 0;
    st.shutterClosed.snap(0);
    st.drawerIn = false;
    st.drawerPos.target = 0;
    st.uncorkedBottles = [0, 1, 2, 3];
    st.ledgerTallies = 5;
    st.weatherIntensity = 0.82;
    resetDispensingTray(st, SCRIPTS.n4_tomas);
  } else if (beat === 'n4_halvorsen') {
    st.nightNum = 4;
    st.clockDisplay = '02:47';
    st.visitor = 'halvorsen';
    st.visitorPresence.snap(1);
    st.inkThumbprint = false;
    st.wetInkSheen = 0;
    st.preStampedPacketInTray = false;
    st.visitorLines = [
      'I kept these nights in 1979. Same brass lamp, same cold stool.',
      'By Thursday you start filling tomorrow\'s page before midnight. I know the look.',
    ];
    st.drawerIn = false;
    st.drawerPos.target = 0;
    resetDispensingTray(st, SCRIPTS.n4_halvorsen);
    // Night IV Variant: Halvorsen's single knuckle on the glass interrupts microsleep at f7!
    startMicrosleep(st, {
      targetClock: '02:47',
      uncorked: [0, 1, 2, 3],
      ledgerTallies: 5,
      interruptedByKnock: true,
    });
  } else if (beat === 'n4_dawn_packet') {
    st.nightNum = 4;
    st.clockDisplay = '04:48';
    st.visitor = 'halvorsen';
    st.visitorPresence.snap(1);
    st.inkThumbprint = false;
    st.wetInkSheen = 0;
    st.blotterStampTime = '';
    st.preStampedPacketInTray = false;
    st.visitorLines = [
      'Not for sale. Nothing to stamp.',
      'Good morning.',
    ];
    st.drawerIn = true;
    st.drawerPos.target = 0.92;
    st.halvorsenPacketInDrawer = true;
    st.tookDawnPacket = false;
    st.dawnPacketAnim.snap(0);
    st.weatherIntensity = 0.42; // Rain thins toward pale dawn!
    resetDispensingTray(st, null);
  } else if (beat === 'ending_dawn') {
    st.nightNum = 4;
    st.clockDisplay = '05:00';
    st.visitor = 'none';
    st.visitorPresence.snap(0);
    st.inkThumbprint = false;
    st.wetInkSheen = 0;
    st.blotterStampTime = '';
    st.preStampedPacketInTray = false;
    st.visitorLines = [];
    st.weatherIntensity = 0.25;
    st.leftSillLampOnAtDawn = st.lampMode === 'SILL';
    resetDispensingTray(st, null);
  }
}
