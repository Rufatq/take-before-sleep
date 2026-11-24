#!/usr/bin/env node
// Phase 2 & Phase 3 Full-Arc End-to-End Playthrough, 6-Scene Wallpaper Stills, Mobile Framing,
// 60x Slow-Mo Microsleep & Night IV Knock Reversal Clips, and New 1x WAV Foley Stems.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/nirufu/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright-core');

const ROOT = '/home/nirufu/code/Projects/take-before-sleep';
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'qa', 'out', 'phase3');
const CHROME = '/home/nirufu/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';

fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
};

function startStaticServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = (req.url || '/').split('?')[0];
      const filePath = path.join(DIST, cleanUrl === '/' ? 'index.html' : cleanUrl);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function saveDataUrlPng(dataUrl, outPath) {
  fs.writeFileSync(outPath, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
}

function encodeSlowMo(framesDir, outMp4, fpsOut = 1) {
  execFileSync('ffmpeg', [
    '-nostdin', '-y',
    '-framerate', String(fpsOut),
    '-i', path.join(framesDir, 'f_%04d.png'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-movflags', '+faststart',
    outMp4,
  ], { stdio: 'pipe' });
}

function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`);
}

async function main() {
  const { server, port } = await startStaticServer();
  const errors = [];
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.on('pageerror', (err) => errors.push(`PAGEERROR: ${err.message}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`CONSOLE_ERROR: ${msg.text()}`);
    });

    await page.goto(`http://127.0.0.1:${port}/?manual=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.D), null, { timeout: 15000 });
    const boot = await page.evaluate(() => window.D.state());
    assert(boot.webglActive === true, 'WebGL2 compositor must be active');
    console.log('BOOT:', JSON.stringify(boot));

    // ------------------------------------------------------------------
    // 1. SIX MULTI-SCENE WALLPAPER STILLS FOR OPUS GATE 4 CONTACT SHEET
    // ------------------------------------------------------------------
    // Scene 01: Title Screen
    await page.evaluate(() => {
      window.D.setBeat('title');
      window.D.adv(1 / 24, 24);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '01_title.png'));

    // Scene 02: Hatch — Night III Nadia in DIM mode, 2 fingertips on glass + intercom dialogue
    await page.evaluate(() => {
      window.D.setBeat('n3_nadia');
      window.D.setLamp('DIM');
      window.D.adv(1 / 24, 30);
      window.D.action('intercom_on');
      window.D.adv(1 / 24, 30);
      // Cycle to her uncanny second line ("When did you last sleep? Your labels are turned around.")
      window.D.action('intercom_off');
      window.D.action('intercom_on');
      window.D.adv(1 / 24, 32);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '02_hatch_nadia_dim.png'));
    await page.evaluate(() => window.D.action('intercom_off'));

    // Scene 03: Counter — Night III Maren in COUNTER mode with Camphor jar + extra coin set apart + poured balm
    await page.evaluate(() => {
      window.D.setBeat('n3_maren');
      window.D.setLamp('COUNTER');
      window.D.adv(1 / 24, 72); // let NIGHT III shard fade cleanly
      window.D.action('drawer');
      window.D.adv(1 / 24, 20);
      window.D.action('pour_start');
      window.D.adv(1 / 24, 38);
      window.D.action('pour_stop');
      window.D.adv(1 / 24, 18);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '03_counter_camphor.png'));

    // Scene 04: Inspect — Night II Dr. Halvorsen in COUNTER/DIM review with archaic dip-pen doctor script & umbrella drip
    await page.evaluate(() => {
      window.D.setBeat('n2_halvorsen');
      window.D.setLamp('DIM');
      window.D.adv(1 / 24, 34);
      window.D.action('drawer');
      window.D.adv(1 / 24, 20);
      window.D.setReview(true);
      window.D.action('intercom_on');
      window.D.adv(1 / 24, 30);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '04_inspect_halvorsen.png'));
    await page.evaluate(() => {
      window.D.setReview(false);
      window.D.action('intercom_off');
    });

    // Scene 05: Anomaly — Night III 03:29 Quiet Rearrangement (all 4 bottles reversed & height-ordered, drawer open from inside, self-written 03:14 card, warm latch shimmer)
    await page.evaluate(() => {
      window.D.setBeat('n3_rearrangement');
      window.D.setLamp('COUNTER');
      window.D.adv(1 / 60, 34); // complete microsleep blink -> 03:29 & open drawer inside!
      window.D.adv(1 / 24, 16);
    });
    const anomState = await page.evaluate(() => window.D.state());
    console.log('ANOMALY SCENE STATE:', JSON.stringify(anomState));
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '05_anomaly_rearrangement.png'));

    // Scene 06: Dawn — Night IV Halvorsen Unstamped Opposite-Folded Dawn Packet in Drawer (pale 04:48 rain + quiet intercom)
    await page.evaluate(() => {
      window.D.setBeat('n4_dawn_packet');
      window.D.setLamp('SILL');
      window.D.adv(1 / 24, 34);
      window.D.action('intercom_on');
      window.D.adv(1 / 24, 30);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '06_dawn_packet.png'));
    await page.evaluate(() => window.D.action('intercom_off'));

    // Also capture 07_ending_dawn.png (05:00 quiet epilogue with packet taken + curb lamp left on) + Vacuum Grid & 3-Value Squint
    await page.evaluate(() => {
      window.D.action('take_packet');
      window.D.action('shutter');
      window.D.adv(1 / 24, 48);
      window.D.adv(1 / 24, 72); // let full 05:00 dawn epilogue finish drawing cleanly
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '07_ending_dawn.png'));

    await page.evaluate(() => {
      window.D.setBeat('n3_maren');
      window.D.setLamp('COUNTER');
      window.D.adv(1 / 24, 72);
      window.D.action('drawer');
      window.D.adv(1 / 24, 24);
      window.D.setView('squint', 0, 'dark');
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '08_squint_n3.png'));

    await page.evaluate(() => window.D.setView('grid', 0, 'gray50'));
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, '09_vacuum_grid_gray50.png'));
    await page.evaluate(() => window.D.setView('composite', 0, 'dark'));

    // ------------------------------------------------------------------
    // 2. SLOW-MO 1 FPS (60x SLOWED) MICROSLEEP & NIGHT IV KNOCK CLIPS
    // ------------------------------------------------------------------
    // Clip A: Night II Microsleep Blink (f0..f17 -> 95ms hush -> 4/16 -> 10/16 -> 16/16 clock snap 03:14->03:19 -> prop swap -> damped reopen)
    const msDir = path.join(OUT, 'frames_ms');
    fs.rmSync(msDir, { recursive: true, force: true });
    fs.mkdirSync(msDir, { recursive: true });
    await page.evaluate(() => {
      window.D.setBeat('n2_microsleep');
      window.D.setLamp('COUNTER');
    });
    const msTrace = [];
    for (let f = 0; f <= 17; f++) {
      saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(msDir, `f_${String(f).padStart(4, '0')}.png`));
      const r = await page.evaluate(() => window.D.adv(1 / 60, 1));
      msTrace.push({ f, clock: r.clock, lid: Number(r.lid.toFixed(3)) });
    }
    encodeSlowMo(msDir, path.join(OUT, 'clip_microsleep_blink_slow60x.mp4'), 1);
    console.log('MICROSLEEP TRACE:', JSON.stringify(msTrace));

    // Clip B: Night IV Halvorsen Knuckle Knock Reversal (f0..f13 -> lid hits 10/16 at f7 -> knock ripple -> reverses open, clock STAYS 03:14!)
    const knDir = path.join(OUT, 'frames_kn');
    fs.rmSync(knDir, { recursive: true, force: true });
    fs.mkdirSync(knDir, { recursive: true });
    await page.evaluate(() => {
      window.D.setBeat('n4_halvorsen');
      window.D.setLamp('DIM');
    });
    const knTrace = [];
    for (let f = 0; f <= 13; f++) {
      saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(knDir, `f_${String(f).padStart(4, '0')}.png`));
      const r = await page.evaluate(() => window.D.adv(1 / 60, 1));
      knTrace.push({ f, clock: r.clock, lid: Number(r.lid.toFixed(3)) });
    }
    encodeSlowMo(knDir, path.join(OUT, 'clip_night4_knock_reversal_slow60x.mp4'), 1);
    console.log('KNOCK REVERSAL TRACE:', JSON.stringify(knTrace));

    // ------------------------------------------------------------------
    // 3. EXPORT NEW PHASE 2 1x REAL-TIME WAV FOLEY STEMS
    // ------------------------------------------------------------------
    const newStems = [
      ['stem_night4_knock', 2.6],
      ['stem_shutter_dawn', 2.8],
      ['stem_anomaly_hush', 2.6],
    ];
    for (const [s, dur] of newStems) {
      const b64 = await page.evaluate(([name, d]) => window.D.exportStemWavBase64(name, d), [s, dur]);
      fs.writeFileSync(path.join(OUT, `${s}.wav`), Buffer.from(b64, 'base64'));
      console.log('WAV EXPORTED:', s);
    }

    // ------------------------------------------------------------------
    // 4. COMPLETE END-TO-END 4-NIGHT PLAYTHROUGH ASSERTION (BOTH BRANCHES!)
    // ------------------------------------------------------------------
    const arc = await page.evaluate(() => {
      const log = {};
      function dispenseAndPass(doGrace, endLamp) {
        window.D.setLamp('COUNTER');
        window.D.action('drawer');
        window.D.adv(1 / 24, 18);
        window.D.action('pour_start');
        window.D.adv(1 / 24, 48);
        window.D.action('pour_stop');
        if (doGrace) window.D.action('grace');
        window.D.action('fold');
        window.D.adv(1 / 24, 8);
        window.D.action('stamp');
        window.D.adv(1 / 60, 24);
        if (endLamp) window.D.setLamp(endLamp);
        window.D.action('drawer');
        window.D.adv(1 / 24, 80);
      }

      window.D.setBeat('title');
      window.D.action('start');
      log.n1_maren = window.D.state().beat;
      dispenseAndPass(true, 'COUNTER');
      log.n1_anomaly = window.D.state();
      window.D.adv(1 / 24, 130);
      log.n1_tomas = window.D.state().beat;
      dispenseAndPass(true, 'SILL');
      log.n1_dawn = window.D.state();
      window.D.action('shutter');
      window.D.adv(1 / 24, 48);
      log.n2_intro = window.D.state();
      window.D.adv(1 / 24, 96);
      log.n2_nadia = window.D.state().beat;
      dispenseAndPass(true, 'COUNTER');
      log.n2_halvorsen = window.D.state().beat;
      dispenseAndPass(true, 'COUNTER');
      log.n2_microsleep_start = window.D.state();
      window.D.adv(1 / 60, 36);
      log.n2_microsleep_after = window.D.state();
      window.D.adv(1 / 24, 108);
      log.n2_dawn = window.D.state().beat;
      window.D.action('shutter');
      window.D.adv(1 / 24, 48);
      log.n3_maren = window.D.state().beat;
      dispenseAndPass(false, 'COUNTER');
      log.n3_nadia = window.D.state().beat;
      dispenseAndPass(false, 'COUNTER');
      log.n3_rearrangement_start = window.D.state().beat;
      window.D.adv(1 / 60, 36);
      log.n3_rearrangement_after = window.D.state();
      window.D.action('drawer'); // close the drawer opened from inside!
      window.D.adv(1 / 24, 14);
      log.n3_dawn = window.D.state().beat;
      window.D.action('shutter');
      window.D.adv(1 / 24, 48);
      log.n4_tomas = window.D.state().beat;
      // Tomas returns 40 cents (noDispense)
      window.D.action('drawer');
      window.D.adv(1 / 24, 18);
      window.D.action('drawer');
      window.D.adv(1 / 24, 80);
      log.n4_halvorsen = window.D.state().beat;
      // Halvorsen knocks to interrupt microsleep at f7; clock stays 03:14!
      window.D.adv(1 / 60, 26);
      log.n4_halvorsen_after_knock = window.D.state();
      window.D.action('drawer');
      window.D.adv(1 / 24, 18);
      window.D.action('drawer');
      window.D.adv(1 / 24, 80);
      log.n4_dawn_packet = window.D.state();
      // Ending Branch A: Take Halvorsen packet + Leave Sill Lamp On
      window.D.action('take_packet');
      window.D.setLamp('SILL');
      window.D.action('shutter');
      window.D.adv(1 / 24, 48);
      log.ending_branch_a = window.D.state();

      // Ending Branch B: Leave packet + Counter lamp
      window.D.setBeat('n4_dawn_packet');
      window.D.setLamp('COUNTER');
      window.D.action('shutter');
      window.D.adv(1 / 24, 48);
      log.ending_branch_b = window.D.state();
      return log;
    });
    console.log('FULL 4-NIGHT ARC LOG:', JSON.stringify(arc, null, 2));

    assert(arc.n1_maren === 'n1_maren', 'start -> n1_maren');
    assert(arc.n1_anomaly.beat === 'n1_anomaly' && arc.n1_anomaly.clock === '02:47', 'maren -> n1_anomaly 02:47');
    assert(arc.n1_tomas === 'n1_tomas', 'anomaly -> n1_tomas');
    assert(arc.n1_dawn.beat === 'n1_dawn' && arc.n1_dawn.tomasGraced === true, 'tomas -> n1_dawn graced');
    assert(arc.n2_intro.beat === 'n2_intro' && arc.n2_intro.visitor === 'none', 'n1_dawn -> n2_intro with NO visitor');
    assert(arc.n2_nadia === 'n2_nadia', 'n2_intro -> n2_nadia');
    assert(arc.n2_halvorsen === 'n2_halvorsen', 'n2_nadia -> n2_halvorsen');
    assert(arc.n2_microsleep_after.clock === '02:53' && arc.n2_microsleep_after.uncorkedBottles.length === 2 && arc.n2_microsleep_after.blotterStampTime === '02:51', 'n2_microsleep clock snap 02:53 + 2 uncorked bottles + fresh 02:51 blotter stamp');
    assert(arc.n2_dawn === 'n2_dawn', 'n2_microsleep -> n2_dawn');
    assert(arc.n3_maren === 'n3_maren', 'n2_dawn -> n3_maren');
    assert(arc.n3_nadia === 'n3_nadia', 'n3_maren -> n3_nadia');
    assert(arc.n3_rearrangement_after.clock === '03:04' && arc.n3_rearrangement_after.drawerIn === true && arc.n3_rearrangement_after.preStampedPacketInTray === true && arc.n3_rearrangement_after.inkThumbprint === true, 'n3_rearrangement 03:04 inside drawer open + pre-stamped packet + vermilion thumbprint');
    assert(arc.n3_dawn === 'n3_dawn', 'n3_rearrangement -> n3_dawn');
    assert(arc.n4_tomas === 'n4_tomas', 'n3_dawn -> n4_tomas');
    assert(arc.n4_halvorsen === 'n4_halvorsen', 'n4_tomas -> n4_halvorsen');
    assert(arc.n4_halvorsen_after_knock.clock === '02:47', 'Night IV Halvorsen knock keeps clock at 02:47');
    assert(arc.n4_dawn_packet.beat === 'n4_dawn_packet' && arc.n4_dawn_packet.halvorsenPacketInDrawer === true, 'n4_halvorsen -> n4_dawn_packet');
    assert(arc.ending_branch_a.beat === 'ending_dawn' && arc.ending_branch_a.tookDawnPacket === true && arc.ending_branch_a.leftSillLampOnAtDawn === true, 'Ending Branch A verified');
    assert(arc.ending_branch_b.beat === 'ending_dawn' && arc.ending_branch_b.tookDawnPacket === false && arc.ending_branch_b.leftSillLampOnAtDawn === false, 'Ending Branch B verified');

    // Verify n2_intro visual cleanliness (NO ghost Tomas silhouette!)
    await page.evaluate(() => {
      window.D.setBeat('n2_intro');
      window.D.adv(1 / 24, 18);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, 'verify_n2_intro_clean.png'));

    // ------------------------------------------------------------------
    // 5. MOBILE 390x844 FRAMING & COLLAPSED ?lab=1 PULL-TAB VERIFICATION
    // ------------------------------------------------------------------
    const mCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const mPage = await mCtx.newPage();
    mPage.on('pageerror', (err) => errors.push(`MOBILE_PAGEERROR: ${err.message}`));
    mPage.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`MOBILE_CONSOLE_ERROR: ${msg.text()}`);
    });
    await mPage.goto(`http://127.0.0.1:${port}/?manual=1&lab=1`, { waitUntil: 'domcontentloaded' });
    await mPage.waitForFunction(() => Boolean(window.D), null, { timeout: 15000 });
    await mPage.evaluate(() => {
      window.D.setBeat('n1_maren');
      window.D.adv(1 / 24, 24);
    });
    await mPage.screenshot({ path: path.join(OUT, 'verify_mobile_390x844_lab_collapsed.png') });
    await mCtx.close();

    console.log('CONSOLE ERRORS COUNT:', errors.length);
    if (errors.length > 0) {
      console.error(errors.join('\n'));
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
