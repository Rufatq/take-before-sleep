#!/usr/bin/env node
// Phase 1 Post-Gate-2 Verified Capture Harness (Stills, 60x Stamp Choreo, 1x Synced A/V, 5 Vacuum WAV Stems)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/nirufu/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright-core');

const ROOT = '/home/nirufu/code/Projects/take-before-sleep';
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'qa', 'out', 'phase1');
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
    console.log('BOOT STATE:', JSON.stringify(await page.evaluate(() => window.D.state())));

    // 1. Key Stills (Title, Counter, 3-Value Squint, 4x2 Vacuum Gray50, DIM+Intercom, 03:14 Anomaly)
    await page.evaluate(() => window.D.adv(1 / 24, 30));
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, 'still_01_title.png'));

    await page.evaluate(() => {
      window.D.setBeat('night1_maren');
      window.D.setLamp('COUNTER');
      window.D.adv(1 / 24, 24);
      window.D.action('drawer');
      window.D.adv(1 / 24, 18);
      window.D.action('pour_start');
      window.D.adv(1 / 24, 42);
      window.D.action('pour_stop');
      window.D.adv(1 / 24, 16);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, 'still_02_composite_counter.png'));

    await page.evaluate(() => window.D.setView('squint', 0, 'dark'));
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, 'still_05_3value_squint.png'));

    await page.evaluate(() => window.D.setView('grid', 0, 'gray50'));
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, 'still_06_vacuum_grid_gray50.png'));

    await page.evaluate(() => {
      window.D.setView('composite', 0, 'dark');
      window.D.setLamp('DIM');
      window.D.action('intercom_on');
      window.D.adv(1 / 24, 34);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, 'still_03_composite_dim.png'));
    await page.evaluate(() => window.D.action('intercom_off'));

    await page.evaluate(() => {
      window.D.setBeat('night1_anomaly');
      window.D.setLamp('COUNTER');
      window.D.adv(1 / 24, 18);
    });
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, 'still_07_anomaly_0314.png'));

    // 2. Exact 60fps Stamp Choreography Clip (f0..f22 -> 1fps slow60x)
    const c3Dir = path.join(OUT, 'frames_c3');
    fs.rmSync(c3Dir, { recursive: true, force: true });
    fs.mkdirSync(c3Dir, { recursive: true });
    await page.evaluate(() => {
      window.D.setView('composite', 0, 'dark');
      window.D.setBeat('night1_maren');
      window.D.setLamp('COUNTER');
      window.D.action('drawer');
      window.D.adv(1 / 24, 18);
      window.D.action('pour_start');
      window.D.adv(1 / 24, 42);
      window.D.action('pour_stop');
      window.D.action('grace');
      window.D.action('fold');
      window.D.adv(1 / 24, 14);
      window.D.action('stamp'); // frame 0 wind-up begins!
    });
    for (let f = 0; f <= 21; f++) {
      saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(c3Dir, `f_${String(f).padStart(4, '0')}.png`));
      await page.evaluate(() => window.D.adv(1 / 60, 1));
    }
    encodeSlowMo(c3Dir, path.join(OUT, 'clip_03_stamp_hitstop_slow60x.mp4'), 1);

    // 3. Re-exported Upgraded 1x Real-Time Vacuum WAV Stems + Synced 3.0s 1x A/V Beat
    const stems = [
      ['stem_rain_hum', 2.6],
      ['stem_pills_pour', 2.6],
      ['stem_stamp_impact', 2.6],
      ['stem_intercom_voices', 2.6],
      ['stem_anomaly_hush', 2.6],
      ['mix_beat', 3.0],
    ];
    for (const [s, dur] of stems) {
      const b64 = await page.evaluate(([name, d]) => window.D.exportStemWavBase64(name, d), [s, dur]);
      fs.writeFileSync(path.join(OUT, `${s}.wav`), Buffer.from(b64, 'base64'));
      console.log('WAV EXPORTED:', s);
    }

    // 1x 24fps (72 frames = 3.0s) synced strictly to mix_beat.wav:
    // f3 (0.125s) drawer in -> f12 (0.50s) pour_start -> f35 pour_stop (2 pills landed!)
    // -> f37 (1.54s) fold -> f43 (1.79s) stamp start so f10 contact lands at 1.96s! -> f59 (2.46s) drawer out!
    const avDir = path.join(OUT, 'frames_av');
    fs.rmSync(avDir, { recursive: true, force: true });
    fs.mkdirSync(avDir, { recursive: true });
    await page.evaluate(() => {
      window.D.setView('composite', 0, 'dark');
      window.D.setBeat('night1_maren');
      window.D.setLamp('COUNTER');
      window.D.adv(1 / 24, 20);
    });
    for (let f = 0; f < 72; f++) {
      if (f === 3) await page.evaluate(() => window.D.action('drawer'));
      if (f === 12) await page.evaluate(() => window.D.action('pour_start'));
      if (f === 35) await page.evaluate(() => window.D.action('pour_stop'));
      if (f === 37) await page.evaluate(() => window.D.action('fold'));
      if (f === 43) await page.evaluate(() => window.D.action('stamp'));
      if (f === 59) await page.evaluate(() => window.D.action('drawer'));
      await page.evaluate(() => window.D.adv(1 / 24, 1));
      saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(avDir, `f_${String(f).padStart(4, '0')}.png`));
    }
    execFileSync('ffmpeg', [
      '-nostdin', '-y',
      '-framerate', '24',
      '-i', path.join(avDir, 'f_%04d.png'),
      '-i', path.join(OUT, 'mix_beat.wav'),
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-movflags', '+faststart',
      path.join(OUT, 'beat_realtime_av.mp4'),
    ], { stdio: 'pipe' });

    // 4. Full End-to-End Playthrough Check (Night I Maren -> 03:14 Anomaly -> Tomas Grace -> Dawn -> Night II)
    const playRes = await page.evaluate(() => {
      window.D.setBeat('night1_maren');
      window.D.setLamp('COUNTER');
      window.D.action('drawer');
      window.D.adv(1 / 24, 18);
      window.D.action('pour_start');
      window.D.adv(1 / 24, 42);
      window.D.action('pour_stop');
      window.D.action('grace');
      window.D.action('fold');
      window.D.adv(1 / 24, 8);
      window.D.action('stamp');
      window.D.adv(1 / 60, 24);
      window.D.action('drawer');
      window.D.adv(1 / 24, 72);
      const sAnom = window.D.state();
      window.D.adv(1 / 24, 125);
      const sTomas = window.D.state();
      window.D.action('drawer');
      window.D.adv(1 / 24, 18);
      window.D.action('pour_start');
      window.D.adv(1 / 24, 65);
      window.D.action('pour_stop');
      window.D.action('grace');
      window.D.action('fold');
      window.D.adv(1 / 24, 8);
      window.D.action('stamp');
      window.D.adv(1 / 60, 24);
      window.D.setLamp('CURB');
      window.D.action('drawer');
      window.D.adv(1 / 24, 72);
      const sDawn = window.D.state();
      window.D.action('shutter');
      window.D.adv(1 / 24, 72);
      const sNight2 = window.D.state();
      return { sAnom, sTomas, sDawn, sNight2 };
    });
    console.log('PLAYTHROUGH CHECK:', JSON.stringify(playRes));
    saveDataUrlPng(await page.evaluate(() => window.D.snap()), path.join(OUT, 'still_10_night2_steady_lamp.png'));

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
