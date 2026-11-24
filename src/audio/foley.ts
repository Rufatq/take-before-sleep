// Procedural Web Audio Foley + OfflineAudioContext 1x Real-Time Vacuum WAV Stem Exporter
// Upgraded from Phase 1 Forensic inspect_audio Audit:
// 1. stem_rain_hum: restored 1.5-8kHz glass raindrop patters + warm 50/100/150/250Hz ballast harmonics
// 2. stem_pills_pour: bottle-exit rattle + crisp 4-11kHz dry mineral slate snaps (low-Q) + groove micro-scrape + room floor
// 3. stem_stamp_impact: 45Hz HPF + 200Hz mud dip + 90ms hush + +8ms brass metallic snap (3-7kHz) + wet vermilion ink tack
// 4. stem_intercom_voices: 320Hz HPF + 1.2-2.8kHz brass speaker coloration + close-mic metallic toggle click outside bandpass
// 5. stem_anomaly_hush: crisp 2-5kHz relay click -> TRUE -inf dB 95ms digital vacuum -> delicate high-passed 3-8kHz glass clink

export type AudioStemId =
  | 'stem_rain_hum'
  | 'stem_pills_pour'
  | 'stem_stamp_impact'
  | 'stem_intercom_voices'
  | 'stem_anomaly_hush'
  | 'mix_beat';

function createPinkNoiseBuffer(ctx: BaseAudioContext, seconds: number, seedOffset = 1): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const out = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let state = (0x9e3779b9 ^ ((ch + 1) * 0x85ebca6b) ^ (seedOffset * 0xc2b2ae35)) >>> 0;
    for (let i = 0; i < len; i++) {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      const white = ((state >>> 0) / 4294967295) * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
  return buf;
}

function createClickNoiseBuffer(ctx: BaseAudioContext, seconds: number, seed = 41): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.max(16, Math.floor(sr * seconds));
  const buf = ctx.createBuffer(1, len, sr);
  const out = buf.getChannelData(0);
  let state = (seed * 2654435761) >>> 0;
  for (let i = 0; i < len; i++) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    out[i] = ((state >>> 0) / 4294967295) * 2 - 1;
  }
  return buf;
}

// Sparse organic raindrop patters striking laminated glass (2.2-8.5kHz stereo micro-impacts!)
function createGlassDropletsBuffer(ctx: BaseAudioContext, seconds: number, density = 26, seed = 77): AudioBuffer {
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(2, len, sr);
  let state = (seed * 1664525 + 1013904223) >>> 0;
  const rand = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967295;
  };
  const dropCount = Math.floor(seconds * density);
  for (let d = 0; d < dropCount; d++) {
    const start = Math.floor(rand() * (len - 800));
    const pan = rand();
    const amp = 0.08 + rand() * 0.22;
    const freq = 2400 + rand() * 5200;
    const decay = 0.004 + rand() * 0.011;
    const samples = Math.min(len - start, Math.floor(sr * decay * 5));
    const chL = buf.getChannelData(0);
    const chR = buf.getChannelData(1);
    for (let i = 0; i < samples; i++) {
      const t = i / sr;
      const env = Math.exp(-t / decay);
      // Short filtered noise burst + glassy water droplet ping
      const s = (Math.sin(2 * Math.PI * freq * t * (1 + t * 18)) * 0.45 + (rand() * 2 - 1) * 0.55) * env * amp;
      chL[start + i] += s * (1 - pan * 0.7);
      chR[start + i] += s * (0.3 + pan * 0.7);
    }
  }
  return buf;
}

// Dry mineral tablet striking grooved slate (crisp 4-11kHz snap + low-Q damped stone body + optional micro-scrape)
function schedulePillClack(
  ctx: BaseAudioContext,
  dest: AudioNode,
  when: number,
  pitchMult = 1,
  gain = 0.62,
  seed = 1,
  withScrape = true
): void {
  // 1. Crisp broadband mineral click (4.5-11kHz)
  const snap = ctx.createBufferSource();
  snap.buffer = createClickNoiseBuffer(ctx, 0.016, seed);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(3600 * pitchMult, when);
  const snapG = ctx.createGain();
  snapG.gain.setValueAtTime(0.0001, when);
  snapG.gain.exponentialRampToValueAtTime(gain * 0.95, when + 0.0008);
  snapG.gain.exponentialRampToValueAtTime(0.0001, when + 0.014);
  snap.connect(hp);
  hp.connect(snapG);
  snapG.connect(dest);
  snap.start(when);
  snap.stop(when + 0.018);

  // 2. Damped slate stone tap body (low Q = 5.5 so it reads dry mineral, NEVER pitched ceramic!)
  const body = ctx.createBufferSource();
  body.buffer = createClickNoiseBuffer(ctx, 0.024, seed + 17);
  const bp1 = ctx.createBiquadFilter();
  bp1.type = 'bandpass';
  bp1.frequency.setValueAtTime(1650 * pitchMult, when);
  bp1.Q.setValueAtTime(5.2, when);
  const bp2 = ctx.createBiquadFilter();
  bp2.type = 'bandpass';
  bp2.frequency.setValueAtTime(5400 * pitchMult, when);
  bp2.Q.setValueAtTime(4.8, when);

  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.0001, when);
  bg.gain.exponentialRampToValueAtTime(gain * 0.62, when + 0.0012);
  bg.gain.exponentialRampToValueAtTime(0.0001, when + 0.022);

  body.connect(bp1);
  bp1.connect(bg);
  body.connect(bp2);
  bp2.connect(bg);
  bg.connect(dest);
  body.start(when);
  body.stop(when + 0.028);

  // 3. Subtle grooved-slate micro-scrape / tablet settle friction
  if (withScrape) {
    const scr = ctx.createBufferSource();
    scr.buffer = createClickNoiseBuffer(ctx, 0.055, seed + 33);
    const sbp = ctx.createBiquadFilter();
    sbp.type = 'bandpass';
    sbp.frequency.setValueAtTime(4200, when + 0.014);
    sbp.frequency.linearRampToValueAtTime(2600, when + 0.06);
    sbp.Q.setValueAtTime(2.6, when + 0.014);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.0001, when + 0.012);
    sg.gain.linearRampToValueAtTime(gain * 0.18, when + 0.024);
    sg.gain.exponentialRampToValueAtTime(0.0001, when + 0.062);
    scr.connect(sbp);
    sbp.connect(sg);
    sg.connect(dest);
    scr.start(when + 0.012);
    scr.stop(when + 0.068);
  }
}

// Amber bottle exit rattle lead-in before first tablet hits slate
function scheduleBottleRattle(ctx: BaseAudioContext, dest: AudioNode, when: number): void {
  const hits = [0.0, 0.045, 0.088];
  hits.forEach((off, i) => {
    const src = ctx.createBufferSource();
    src.buffer = createClickNoiseBuffer(ctx, 0.018, 210 + i * 9);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3400 + i * 650, when + off);
    bp.Q.setValueAtTime(9, when + off);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when + off);
    g.gain.exponentialRampToValueAtTime(0.24, when + off + 0.0015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + off + 0.016);
    src.connect(bp);
    bp.connect(g);
    g.connect(dest);
    src.start(when + off);
    src.stop(when + off + 0.02);
  });
}

// Brass-handled vermilion stamp slam: 90ms hush -> tight HPF walnut thud + crisp +8ms brass sheen + wet vermilion tack!
function scheduleStampImpact(
  ctx: BaseAudioContext,
  dest: AudioNode,
  when: number,
  bedGain?: GainNode
): void {
  // 90ms micro-duck ahead of stamp strike
  if (bedGain) {
    bedGain.gain.setTargetAtTime(0.22, Math.max(0, when - 0.09), 0.014);
    bedGain.gain.setTargetAtTime(1.0, when + 0.16, 0.07);
  }
  const hitT = when + 0.008; // +8ms ITU-R BT.1359 perceptual contact lag

  // 1. Tight walnut desk body thud (45Hz HPF + 200Hz mud dip per audit!)
  const thudSrc = ctx.createBufferSource();
  thudSrc.buffer = createClickNoiseBuffer(ctx, 0.14, 91);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(48, hitT);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(195, hitT);
  lp.frequency.exponentialRampToValueAtTime(72, hitT + 0.09);
  lp.Q.setValueAtTime(4.2, hitT);
  const mudDip = ctx.createBiquadFilter();
  mudDip.type = 'peaking';
  mudDip.frequency.setValueAtTime(220, hitT);
  mudDip.Q.setValueAtTime(2.0, hitT);
  mudDip.gain.setValueAtTime(-5.5, hitT);

  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0.0001, hitT);
  thudGain.gain.exponentialRampToValueAtTime(1.25, hitT + 0.003);
  thudGain.gain.exponentialRampToValueAtTime(0.0001, hitT + 0.115);
  thudSrc.connect(hp);
  hp.connect(lp);
  lp.connect(mudDip);
  mudDip.connect(thudGain);
  thudGain.connect(dest);
  thudSrc.start(hitT);
  thudSrc.stop(hitT + 0.13);

  // 2. Crisp Brass Handle Sheen & Mechanical Collar Click (3.2-7.2kHz at +8ms!)
  const brassSrc = ctx.createBufferSource();
  brassSrc.buffer = createClickNoiseBuffer(ctx, 0.065, 117);
  const bp1 = ctx.createBiquadFilter();
  bp1.type = 'bandpass';
  bp1.frequency.setValueAtTime(3650, hitT);
  bp1.Q.setValueAtTime(12, hitT);
  const bp2 = ctx.createBiquadFilter();
  bp2.type = 'bandpass';
  bp2.frequency.setValueAtTime(6400, hitT + 0.005);
  bp2.Q.setValueAtTime(9, hitT + 0.005);
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.0001, hitT);
  bg.gain.exponentialRampToValueAtTime(0.72, hitT + 0.002);
  bg.gain.exponentialRampToValueAtTime(0.0001, hitT + 0.052);
  brassSrc.connect(bp1);
  bp1.connect(bg);
  brassSrc.connect(bp2);
  bp2.connect(bg);
  bg.connect(dest);
  brassSrc.start(hitT);
  brassSrc.stop(hitT + 0.062);

  // 3. Close-mic Wet Vermilion Rubber Ink Tack + Release Micro-Suction (1.8-4.4kHz)
  const inkSrc = ctx.createBufferSource();
  inkSrc.buffer = createClickNoiseBuffer(ctx, 0.11, 143);
  const inkBp = ctx.createBiquadFilter();
  inkBp.type = 'bandpass';
  inkBp.frequency.setValueAtTime(1850, hitT + 0.004);
  inkBp.frequency.exponentialRampToValueAtTime(4200, hitT + 0.095);
  inkBp.Q.setValueAtTime(2.6, hitT + 0.004);
  const ig = ctx.createGain();
  ig.gain.setValueAtTime(0.0001, hitT + 0.003);
  ig.gain.linearRampToValueAtTime(0.36, hitT + 0.015);
  ig.gain.exponentialRampToValueAtTime(0.08, hitT + 0.055);
  ig.gain.linearRampToValueAtTime(0.28, hitT + 0.082); // Viscous rubber lift release!
  ig.gain.exponentialRampToValueAtTime(0.0001, hitT + 0.115);
  inkSrc.connect(inkBp);
  inkBp.connect(ig);
  ig.connect(dest);
  inkSrc.start(hitT + 0.003);
  inkSrc.stop(hitT + 0.12);
}

// Brushed-steel Durchreiche airlock drawer slide + metallic detent stop
function scheduleDrawerSlide(ctx: BaseAudioContext, dest: AudioNode, when: number, pullingIn: boolean): void {
  const dur = 0.34;
  const src = ctx.createBufferSource();
  src.buffer = createPinkNoiseBuffer(ctx, dur + 0.08, pullingIn ? 23 : 29);

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(240, when);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(pullingIn ? 980 : 1240, when);
  bp.frequency.linearRampToValueAtTime(pullingIn ? 1680 : 820, when + dur * 0.8);
  bp.Q.setValueAtTime(3.6, when);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(0.46, when + 0.035);
  g.gain.linearRampToValueAtTime(0.36, when + dur * 0.82);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

  src.connect(hp);
  hp.connect(bp);
  bp.connect(g);
  g.connect(dest);
  src.start(when);
  src.stop(when + dur + 0.03);

  // Heavy steel interlock detent stop click
  schedulePillClack(ctx, dest, when + dur * 0.88, 0.58, 0.64, pullingIn ? 71 : 73, false);
}

// Crisp waxed paper fold / quiet unbilled linen grace tuck
function schedulePaperFold(ctx: BaseAudioContext, dest: AudioNode, when: number, quietGrace = false): void {
  const dur = quietGrace ? 0.21 : 0.30;
  const src = ctx.createBufferSource();
  src.buffer = createClickNoiseBuffer(ctx, dur, quietGrace ? 61 : 67);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(1600, when);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(quietGrace ? 3200 : 4100, when);
  bp.frequency.exponentialRampToValueAtTime(quietGrace ? 5200 : 7200, when + dur * 0.7);
  bp.Q.setValueAtTime(1.8, when);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(quietGrace ? 0.24 : 0.44, when + 0.035);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

  src.connect(hp);
  hp.connect(bp);
  bp.connect(g);
  g.connect(dest);
  src.start(when);
  src.stop(when + dur + 0.02);
}

// Close-mic brass spring toggle switch click (kept OUTSIDE narrow intercom bandpass so 4-10kHz crispness pops!)
function scheduleBrassToggleClick(ctx: BaseAudioContext, dest: AudioNode, when: number, on: boolean): void {
  const src = ctx.createBufferSource();
  src.buffer = createClickNoiseBuffer(ctx, 0.035, on ? 101 : 103);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(2200, when);
  const pk = ctx.createBiquadFilter();
  pk.type = 'peaking';
  pk.frequency.setValueAtTime(on ? 5400 : 4100, when);
  pk.Q.setValueAtTime(7.5, when);
  pk.gain.setValueAtTime(9, when);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(0.75, when + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.024);
  src.connect(hp);
  hp.connect(pk);
  pk.connect(g);
  g.connect(dest);
  src.start(when);
  src.stop(when + 0.03);

  // Tiny spring-return metallic rebound 12ms later
  const reb = ctx.createBufferSource();
  reb.buffer = createClickNoiseBuffer(ctx, 0.018, on ? 109 : 113);
  const rbp = ctx.createBiquadFilter();
  rbp.type = 'bandpass';
  rbp.frequency.setValueAtTime(on ? 6800 : 5200, when + 0.012);
  rbp.Q.setValueAtTime(10, when + 0.012);
  const rg = ctx.createGain();
  rg.gain.setValueAtTime(0.0001, when + 0.012);
  rg.gain.exponentialRampToValueAtTime(0.32, when + 0.0135);
  rg.gain.exponentialRampToValueAtTime(0.0001, when + 0.028);
  reb.connect(rbp);
  rbp.connect(rg);
  rg.connect(dest);
  reb.start(when + 0.012);
  reb.stop(when + 0.03);
}

// Band-limited brass intercom transducer (strictly high-passed >340Hz, nasal 1.2-2.8kHz resonance, zero sub-mud!)
function scheduleIntercomCadence(
  ctx: BaseAudioContext,
  dest: AudioNode,
  when: number,
  voiceTone: 'maren' | 'tomas' | 'nadia' | 'halvorsen'
): void {
  const f0Base = voiceTone === 'maren' ? 188 : voiceTone === 'tomas' ? 128 : voiceTone === 'nadia' ? 214 : 114;
  const syllables =
    voiceTone === 'tomas'
      ? [
          { t: 0.05, d: 0.12, f1: 520, f2: 1550, p: 1.0 },
          { t: 0.24, d: 0.16, f1: 680, f2: 1320, p: 0.94 },
          { t: 0.48, d: 0.19, f1: 480, f2: 1780, p: 0.88 },
        ]
      : [
          { t: 0.04, d: 0.11, f1: 620, f2: 1680, p: 1.04 },
          { t: 0.19, d: 0.14, f1: 520, f2: 1920, p: 1.0 },
          { t: 0.38, d: 0.13, f1: 710, f2: 1420, p: 0.96 },
          { t: 0.56, d: 0.18, f1: 540, f2: 1640, p: 0.90 },
        ];

  // Shared brass intercom speaker chain (340Hz HPF + 1.8kHz nasal horn peak + 3.2kHz LPF)
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(360, when);
  const horn = ctx.createBiquadFilter();
  horn.type = 'peaking';
  horn.frequency.setValueAtTime(1850, when);
  horn.Q.setValueAtTime(2.8, when);
  horn.gain.setValueAtTime(8.5, when);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(3200, when);

  hp.connect(horn);
  horn.connect(lp);
  lp.connect(dest);

  for (let i = 0; i < syllables.length; i++) {
    const sy = syllables[i];
    const t0 = when + sy.t;

    // Glottal buzz (soft sawtooth) + breathy consonant aspiration routed through twin vocal formants
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f0Base * sy.p, t0);
    osc.frequency.exponentialRampToValueAtTime(f0Base * sy.p * 0.91, t0 + sy.d);

    const breath = ctx.createBufferSource();
    breath.buffer = createClickNoiseBuffer(ctx, sy.d + 0.02, 410 + i * 13);

    const form1 = ctx.createBiquadFilter();
    form1.type = 'bandpass';
    form1.frequency.setValueAtTime(sy.f1, t0);
    form1.Q.setValueAtTime(6.5, t0);

    const form2 = ctx.createBiquadFilter();
    form2.type = 'bandpass';
    form2.frequency.setValueAtTime(sy.f2, t0);
    form2.Q.setValueAtTime(8.0, t0);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(0.32, t0 + 0.022);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + sy.d);

    osc.connect(form1);
    osc.connect(form2);
    breath.connect(form2);
    form1.connect(env);
    form2.connect(env);
    env.connect(hp);

    osc.start(t0);
    osc.stop(t0 + sy.d + 0.01);
    breath.start(t0);
    breath.stop(t0 + sy.d + 0.01);
  }
}

// 03:14 Anomaly Hush: Crisp 2-5kHz relay shutoff -> TRUE -inf dB 95ms digital vacuum -> crisp 3-8kHz glass bottle set-down!
function scheduleAnomalyHush(
  ctx: BaseAudioContext,
  dest: AudioNode,
  when: number,
  bedGain?: GainNode
): void {
  // 1. Crisp overhead ballast relay shutoff click (2-5kHz)
  scheduleBrassToggleClick(ctx, dest, when, false);

  // 2. TRUE 95ms DEAD VACUUM (-inf dB with 2ms anti-pop fade, ZERO sub-rumble bleed!)
  if (bedGain) {
    bedGain.gain.setValueAtTime(1.0, when);
    bedGain.gain.linearRampToValueAtTime(0.00001, when + 0.003);
    bedGain.gain.setValueAtTime(0.00001, when + 0.098); // Full 95ms absolute vacuum!
    bedGain.gain.linearRampToValueAtTime(0.75, when + 0.42);
  }

  // 3. Delicate high-passed glass bottle set gently onto wooden back shelf RIGHT after the 95ms vacuum (when + 0.105s)
  const hit = when + 0.105;
  const clink = ctx.createBufferSource();
  clink.buffer = createClickNoiseBuffer(ctx, 0.06, 307);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(650, hit);

  // Twin narrow glass-wall resonant pings (3120Hz + 5840Hz) + short wooden shelf tap (920Hz)
  const modes = [
    { f: 920, q: 6, g: 0.34, d: 0.032 },
    { f: 3180, q: 22, g: 0.58, d: 0.055 },
    { f: 5860, q: 28, g: 0.48, d: 0.048 },
  ];
  clink.connect(hp);
  for (const m of modes) {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(m.f, hit);
    bp.Q.setValueAtTime(m.q, hit);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, hit);
    g.gain.exponentialRampToValueAtTime(m.g, hit + 0.0015);
    g.gain.exponentialRampToValueAtTime(0.0001, hit + m.d);
    hp.connect(bp);
    bp.connect(g);
    g.connect(dest);
  }
  clink.start(hit);
  clink.stop(hit + 0.065);

  // Subtle back-shelf wooden settle echo 36ms later
  schedulePillClack(ctx, dest, hit + 0.036, 1.35, 0.22, 313, false);
}

// Upgraded Continuous Ambient Bed: Rain on Laminated Glass (1.2-7.5kHz droplets + airy storm) + Authentic 50Hz European Ballast
function buildAmbientBed(ctx: BaseAudioContext, dest: AudioNode, durationSec: number, intercomOpen: boolean) {
  const bedGain = ctx.createGain();
  bedGain.gain.setValueAtTime(1.0, 0);
  bedGain.connect(dest);

  // 1. Muted exterior winter rain body (band-shaped 260Hz-3400Hz so sub-mud doesn't drown ballast!)
  const rainSrc = ctx.createBufferSource();
  rainSrc.buffer = createPinkNoiseBuffer(ctx, durationSec, 7);
  rainSrc.loop = true;

  const rainHp = ctx.createBiquadFilter();
  rainHp.type = 'highpass';
  rainHp.frequency.setValueAtTime(intercomOpen ? 360 : 220, 0);

  const rainLp = ctx.createBiquadFilter();
  rainLp.type = 'lowpass';
  rainLp.frequency.setValueAtTime(intercomOpen ? 3600 : 2200, 0);
  rainLp.Q.setValueAtTime(0.7, 0);

  const rainGain = ctx.createGain();
  rainGain.gain.setValueAtTime(intercomOpen ? 0.34 : 0.22, 0);

  rainSrc.connect(rainHp);
  rainHp.connect(rainLp);
  rainLp.connect(rainGain);
  rainGain.connect(bedGain);
  rainSrc.start(0);

  // 2. Delicate stereo raindrop patter on laminated security glass (2.4-7.6kHz!)
  const dropsSrc = ctx.createBufferSource();
  dropsSrc.buffer = createGlassDropletsBuffer(ctx, durationSec, intercomOpen ? 42 : 24, 77);
  dropsSrc.loop = true;
  const dropsHp = ctx.createBiquadFilter();
  dropsHp.type = 'highpass';
  dropsHp.frequency.setValueAtTime(1400, 0);
  const dropsGain = ctx.createGain();
  dropsGain.gain.setValueAtTime(intercomOpen ? 0.55 : 0.36, 0);
  dropsSrc.connect(dropsHp);
  dropsHp.connect(dropsGain);
  dropsGain.connect(bedGain);
  dropsSrc.start(0);

  // 3. Authentic 50Hz European Fluorescent Iron-Core Ballast (50Hz + 100Hz + 150Hz + 250Hz harmonics!)
  const ballastBus = ctx.createGain();
  ballastBus.gain.setValueAtTime(0.065, 0);
  const bBp = ctx.createBiquadFilter();
  bBp.type = 'bandpass';
  bBp.frequency.setValueAtTime(165, 0);
  bBp.Q.setValueAtTime(1.1, 0);
  ballastBus.connect(bBp);
  bBp.connect(bedGain);

  const harmonics: [number, number][] = [
    [50, 0.35],
    [100, 0.55],
    [150, 0.42],
    [250, 0.24],
    [350, 0.11],
  ];
  for (const [hz, amp] of harmonics) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(hz, 0);
    const og = ctx.createGain();
    og.gain.setValueAtTime(amp, 0);
    osc.connect(og);
    og.connect(ballastBus);
    osc.start(0);
  }

  return { bedGain, rainLp, rainGain, dropsGain };
}

export function encodeWavPCM16(buffer: AudioBuffer): Uint8Array {
  const numCh = buffer.numberOfChannels;
  const sr = buffer.sampleRate;
  const frames = buffer.length;
  const dataBytes = frames * numCh * 2;
  const out = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(out);

  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * numCh * 2, true);
  view.setUint16(32, numCh * 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataBytes, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));
  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }
  }
  return new Uint8Array(out);
}

export class FoleyEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bedGain: GainNode | null = null;
  private rainLp: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;
  private dropsGain: GainNode | null = null;
  private intercomActive = false;
  muted = false;

  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.setValueAtTime(this.muted ? 0 : 0.9, this.ctx.currentTime);
    this.master.connect(this.ctx.destination);
    const bed = buildAmbientBed(this.ctx, this.master, 6.0, false);
    this.bedGain = bed.bedGain;
    this.rainLp = bed.rainLp;
    this.rainGain = bed.rainGain;
    this.dropsGain = bed.dropsGain;
  }

  setIntercom(open: boolean, voiceTone?: 'maren' | 'tomas' | 'nadia' | 'halvorsen'): void {
    if (this.intercomActive === open) return;
    this.intercomActive = open;
    if (!this.ctx || !this.master || !this.rainLp || !this.rainGain || !this.dropsGain) return;
    const t = this.ctx.currentTime;
    scheduleBrassToggleClick(this.ctx, this.master, t, open);
    this.rainLp.frequency.setTargetAtTime(open ? 3600 : 2200, t, 0.03);
    this.rainGain.gain.setTargetAtTime(open ? 0.34 : 0.22, t, 0.035);
    this.dropsGain.gain.setTargetAtTime(open ? 0.56 : 0.36, t, 0.035);
    if (open && voiceTone) {
      scheduleIntercomCadence(this.ctx, this.master, t + 0.055, voiceTone);
    }
  }

  playLampClick(bright: boolean): void {
    if (!this.ctx || !this.master) return;
    scheduleBrassToggleClick(this.ctx, this.master, this.ctx.currentTime, bright);
  }

  playDrawerSlide(pullingIn: boolean): void {
    if (!this.ctx || !this.master) return;
    scheduleDrawerSlide(this.ctx, this.master, this.ctx.currentTime, pullingIn);
  }

  playBottleRattle(): void {
    if (!this.ctx || !this.master) return;
    scheduleBottleRattle(this.ctx, this.master, this.ctx.currentTime);
  }

  playPillClack(pitchMult = 1, seed = 1): void {
    if (!this.ctx || !this.master) return;
    schedulePillClack(this.ctx, this.master, this.ctx.currentTime, pitchMult, 0.62, seed, true);
  }

  playPaperFold(quietGrace = false): void {
    if (!this.ctx || !this.master) return;
    schedulePaperFold(this.ctx, this.master, this.ctx.currentTime, quietGrace);
  }

  playStampImpact(): void {
    if (!this.ctx || !this.master) return;
    scheduleStampImpact(this.ctx, this.master, this.ctx.currentTime, this.bedGain ?? undefined);
  }

  playAnomalyHush(): void {
    if (!this.ctx || !this.master) return;
    scheduleAnomalyHush(this.ctx, this.master, this.ctx.currentTime, this.bedGain ?? undefined);
  }

  // Offline 1x Real-Time Vacuum Stem Renderer (44.1kHz Stereo 16-bit PCM WAV)
  async renderVacuumStemWav(stem: AudioStemId, durationSec = 2.6): Promise<Uint8Array> {
    const sr = 44100;
    const off = new OfflineAudioContext(2, Math.floor(sr * durationSec), sr);
    const masterGain = off.createGain();
    masterGain.gain.setValueAtTime(0.88, 0);
    const comp = off.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-10, 0);
    comp.ratio.setValueAtTime(4.0, 0);
    masterGain.connect(comp);
    comp.connect(off.destination);

    if (stem === 'stem_rain_hum') {
      buildAmbientBed(off, masterGain, durationSec, false);
    } else if (stem === 'stem_pills_pour') {
      // Quiet booth air floor so tablets never pop out of sterile digital black
      const floor = off.createBufferSource();
      floor.buffer = createPinkNoiseBuffer(off, durationSec, 99);
      const flp = off.createBiquadFilter();
      flp.type = 'lowpass';
      flp.frequency.setValueAtTime(950, 0);
      const fg = off.createGain();
      fg.gain.setValueAtTime(0.035, 0);
      floor.connect(flp);
      flp.connect(fg);
      fg.connect(masterGain);
      floor.start(0);

      // Bottle exit rattle lead-in -> dry crisp mineral slate pours + micro-rebounds
      scheduleBottleRattle(off, masterGain, 0.08);
      const hits = [0.32, 0.44, 0.59, 0.72, 0.94, 1.12];
      hits.forEach((t, i) => {
        schedulePillClack(off, masterGain, t, 0.94 + (i % 3) * 0.06, 0.72, 20 + i * 7, true);
        schedulePillClack(off, masterGain, t + 0.055, 1.08, 0.28, 50 + i * 5, false);
      });
    } else if (stem === 'stem_stamp_impact') {
      const bed = buildAmbientBed(off, masterGain, durationSec, false);
      bed.rainGain.gain.setValueAtTime(0.14, 0);
      bed.dropsGain.gain.setValueAtTime(0.18, 0);
      schedulePaperFold(off, masterGain, 0.22, false);
      scheduleStampImpact(off, masterGain, 1.05, bed.bedGain);
    } else if (stem === 'stem_intercom_voices') {
      // Strictly high-passed exterior storm inside intercom bus + close-mic brass switch outside!
      const stormSrc = off.createBufferSource();
      stormSrc.buffer = createPinkNoiseBuffer(off, durationSec, 15);
      const sDrops = off.createBufferSource();
      sDrops.buffer = createGlassDropletsBuffer(off, durationSec, 48, 88);
      const hp = off.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(360, 0);
      const horn = off.createBiquadFilter();
      horn.type = 'peaking';
      horn.frequency.setValueAtTime(1950, 0);
      horn.Q.setValueAtTime(2.4, 0);
      horn.gain.setValueAtTime(7.5, 0);
      const lp = off.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(3400, 0);
      const gate = off.createGain();
      gate.gain.setValueAtTime(0.04, 0);
      gate.gain.setValueAtTime(0.04, 0.24);
      gate.gain.linearRampToValueAtTime(0.36, 0.27);
      gate.gain.setValueAtTime(0.36, 2.05);
      gate.gain.linearRampToValueAtTime(0.04, 2.08);

      stormSrc.connect(hp);
      sDrops.connect(hp);
      hp.connect(horn);
      horn.connect(lp);
      lp.connect(gate);
      gate.connect(masterGain);
      stormSrc.start(0);
      sDrops.start(0);

      // Close-mic brass spring clicks OUTSIDE bandpass!
      scheduleBrassToggleClick(off, masterGain, 0.24, true);
      scheduleIntercomCadence(off, masterGain, 0.38, 'maren');
      scheduleIntercomCadence(off, masterGain, 1.18, 'tomas');
      scheduleBrassToggleClick(off, masterGain, 2.06, false);
    } else if (stem === 'stem_anomaly_hush') {
      const bed = buildAmbientBed(off, masterGain, durationSec, false);
      // 0.85s relay click -> TRUE 95ms digital vacuum (-inf dB) -> 0.955s crisp distant glass bottle set-down!
      scheduleAnomalyHush(off, masterGain, 0.85, bed.bedGain);
    } else {
      // 1x Real-Time Synced Beat (3.0s): exact match to capture_phase1.mjs frames_av!
      // 0.125s drawer in -> 0.50s bottle rattle -> 0.75s pill 1 -> 1.17s pill 2 -> 1.54s fold -> 1.96s stamp (+8ms lag on f10 contact!) -> 2.46s drawer out
      const bed = buildAmbientBed(off, masterGain, durationSec, false);
      scheduleDrawerSlide(off, masterGain, 0.125, true);
      scheduleBottleRattle(off, masterGain, 0.50);
      schedulePillClack(off, masterGain, 0.75, 0.96, 0.65, 12, true);
      schedulePillClack(off, masterGain, 1.17, 1.05, 0.62, 19, true);
      schedulePaperFold(off, masterGain, 1.54, false);
      scheduleStampImpact(off, masterGain, 1.96, bed.bedGain);
      scheduleDrawerSlide(off, masterGain, 2.46, false);
    }

    const rendered = await off.startRendering();
    return encodeWavPCM16(rendered);
  }
}
