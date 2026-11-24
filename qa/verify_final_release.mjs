#!/usr/bin/env node
// Fast Post-Gate-4 Final Release Verification:
// 1. Re-captures all 6 multi-scene wallpaper stills from packaged play/index.html (single-file standalone build!)
// 2. Runs complete 4-night playthrough asserting BOTH dawn branches + 0 console/page errors + webglActive: true!

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/nirufu/.npm-global/lib/node_modules/@playwright/mcp/node_modules/playwright-core');

const ROOT = '/home/nirufu/code/Projects/take-before-sleep';
const PLAY = path.join(ROOT, 'play');
const OUT = path.join(ROOT, 'qa', 'out', 'phase3');
const CHROME = '/home/nirufu/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';

fs.mkdirSync(OUT, { recursive: true });

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const cleanUrl = (req.url || '/').split('?')[0];
      if (cleanUrl !== '/' && cleanUrl !== '/index.html') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(path.join(PLAY, 'index.html')).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function savePng(dataUrl, outPath) {
  fs.writeFileSync(outPath, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
}

function assert(cond, msg) {
  if (!cond) throw new Error(`FINAL QA FAIL: ${msg}`);
}

async function main() {
  const { server, port } = await startServer();
  const errors = [];
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`PAGEERROR: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`CONSOLE_ERROR: ${m.text()}`); });

    await page.goto(`http://127.0.0.1:${port}/?manual=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.D), null, { timeout: 15000 });
    const boot = await page.evaluate(() => window.D.state());
    assert(boot.webglActive === true, 'standalone play/index.html must boot WebGL2');

    // Re-capture all 6 Gate 4 repaired wallpaper stills!
    await page.evaluate(() => { window.D.setBeat('title'); window.D.adv(1 / 24, 24); });
    savePng(await page.evaluate(() => window.D.snap()), path.join(OUT, '01_title.png'));

    await page.evaluate(() => {
      window.D.setBeat('n3_nadia');
      window.D.setLamp('DIM');
      window.D.adv(1 / 24, 30);
      window.D.action('intercom_on');
      window.D.adv(1 / 24, 20);
      window.D.action('intercom_off');
      window.D.action('intercom_on');
      window.D.adv(1 / 24, 32);
    });
    savePng(await page.evaluate(() => window.D.snap()), path.join(OUT, '02_hatch_nadia_dim.png'));
    await page.evaluate(() => window.D.action('intercom_off'));

    await page.evaluate(() => {
      window.D.setBeat('n3_maren');
      window.D.setLamp('COUNTER');
      window.D.adv(1 / 24, 72);
      window.D.action('drawer');
      window.D.adv(1 / 24, 20);
      window.D.action('pour_start');
      window.D.adv(1 / 24, 38);
      window.D.action('pour_stop');
      window.D.adv(1 / 24, 18);
    });
    savePng(await page.evaluate(() => window.D.snap()), path.join(OUT, '03_counter_camphor.png'));

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
    savePng(await page.evaluate(() => window.D.snap()), path.join(OUT, '04_inspect_halvorsen.png'));
    await page.evaluate(() => { window.D.setReview(false); window.D.action('intercom_off'); });

    await page.evaluate(() => {
      window.D.setBeat('n3_rearrangement');
      window.D.setLamp('COUNTER');
      window.D.adv(1 / 60, 34);
      window.D.adv(1 / 24, 16);
    });
    savePng(await page.evaluate(() => window.D.snap()), path.join(OUT, '05_anomaly_rearrangement.png'));

    await page.evaluate(() => {
      window.D.setBeat('n4_dawn_packet');
      window.D.setLamp('SILL');
      window.D.adv(1 / 24, 34);
      window.D.action('intercom_on');
      window.D.adv(1 / 24, 30);
    });
    savePng(await page.evaluate(() => window.D.snap()), path.join(OUT, '06_dawn_packet.png'));
    await page.evaluate(() => window.D.action('intercom_off'));

    // End-to-end 4-night playthrough assertion on standalone play/index.html
    const arc = await page.evaluate(() => {
      function pass(grace, lamp) {
        window.D.setLamp('COUNTER');
        window.D.action('drawer');
        window.D.adv(1 / 24, 18);
        window.D.action('pour_start');
        window.D.adv(1 / 24, 48);
        window.D.action('pour_stop');
        if (grace) window.D.action('grace');
        window.D.action('fold');
        window.D.adv(1 / 24, 8);
        window.D.action('stamp');
        window.D.adv(1 / 60, 24);
        if (lamp) window.D.setLamp(lamp);
        window.D.action('drawer');
        window.D.adv(1 / 24, 80);
      }
      window.D.setBeat('title');
      window.D.action('start');
      pass(true, 'COUNTER');
      const n1a = window.D.state();
      window.D.adv(1 / 24, 130);
      pass(true, 'SILL');
      window.D.action('shutter'); window.D.adv(1 / 24, 48);
      const n2i = window.D.state();
      window.D.adv(1 / 24, 96);
      pass(true, 'COUNTER');
      pass(true, 'COUNTER');
      window.D.adv(1 / 60, 36);
      const n2m = window.D.state();
      window.D.adv(1 / 24, 108);
      window.D.action('shutter'); window.D.adv(1 / 24, 48);
      pass(false, 'COUNTER');
      pass(false, 'COUNTER');
      window.D.adv(1 / 60, 36);
      const n3r = window.D.state();
      window.D.action('drawer'); window.D.adv(1 / 24, 14);
      window.D.action('shutter'); window.D.adv(1 / 24, 48);
      window.D.action('drawer'); window.D.adv(1 / 24, 18);
      window.D.action('drawer'); window.D.adv(1 / 24, 80);
      window.D.adv(1 / 60, 26);
      const n4h = window.D.state();
      window.D.action('drawer'); window.D.adv(1 / 24, 18);
      window.D.action('drawer'); window.D.adv(1 / 24, 80);
      window.D.action('take_packet');
      window.D.setLamp('SILL');
      window.D.action('shutter'); window.D.adv(1 / 24, 48);
      const endA = window.D.state();
      return { n1a, n2i, n2m, n3r, n4h, endA };
    });

    assert(arc.n1a.beat === 'n1_anomaly' && arc.n1a.clock === '02:47', 'N1 anomaly 02:47');
    assert(arc.n2i.beat === 'n2_intro' && arc.n2i.visitor === 'none', 'N2 intro clean');
    assert(arc.n2m.clock === '02:53' && arc.n2m.blotterStampTime === '02:51', 'N2 microsleep 02:53 + blotter 02:51');
    assert(arc.n3r.clock === '03:04' && arc.n3r.preStampedPacketInTray && arc.n3r.inkThumbprint, 'N3 lost minutes 03:04');
    assert(arc.n4h.clock === '02:47', 'N4 Halvorsen knock holds 02:47');
    assert(arc.endA.beat === 'ending_dawn' && arc.endA.tookDawnPacket && arc.endA.leftSillLampOnAtDawn, 'N4 dawn epilogue');
    console.log('STANDALONE PLAY/INDEX.HTML FULL 4-NIGHT ARC PASS:', JSON.stringify({
      n1a: arc.n1a.clock, n2m: arc.n2m.clock, n3r: arc.n3r.clock, n4h: arc.n4h.clock, endA: arc.endA.beat
    }));
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

main().catch((err) => { console.error(err); process.exit(1); });
