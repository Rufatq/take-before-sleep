#!/usr/bin/env node
// Packages dist/ into a clean zero-network single-file playable HTML release at play/index.html
// (ZERO external images, ZERO fonts, ZERO CDN calls — opens directly via file:// or any static host).

import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/home/nirufu/code/Projects/take-before-sleep';
const DIST = path.join(ROOT, 'dist');
const PLAY = path.join(ROOT, 'play');

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const match = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
if (!match) {
  throw new Error('Could not find built module script tag in dist/index.html');
}

const jsRel = match[1].replace(/^\.\//, '');
const jsCode = fs.readFileSync(path.join(DIST, jsRel), 'utf8');
// Safe inline script escaping for </script> sequences if any
const safeJs = jsCode.replace(/<\/script>/gi, '<\\/script>');
const bundled = html.replace(match[0], `<script type="module">\n${safeJs}\n</script>`);

fs.mkdirSync(PLAY, { recursive: true });
const dest = path.join(PLAY, 'index.html');
fs.writeFileSync(dest, bundled, 'utf8');
console.log(`Packaged standalone playable build: ${dest} (${(Buffer.byteLength(bundled) / 1024).toFixed(2)} kB)`);
