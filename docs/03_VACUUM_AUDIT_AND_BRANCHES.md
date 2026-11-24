# 03 — Phase 1 Vacuum, Slow-Mo Motion & 1x Audio Audit + Emergent Branches

## Verified Build & Instrumentation Baseline
- Build: `tsc --noEmit && vite build` clean (`80.32 kB`, `27.86 kB` gzipped), `webglActive: true`, `CONSOLE ERRORS COUNT: 0`.
- Zero-font & zero-diffusion check: ZERO `fillText`/`strokeText`/`@font-face`/CSS fonts, ZERO image/diffusion imports in `src/` and `index.html`.
- Full automated Night I playthrough (`Maren -> 03:14 Anomaly -> Tomas + Grace -> Dawn Shutter -> Night II Steady Streetlamp`): PASSED.

## 1. Visual & Vacuum Layer Audit (Native Inspection of Stills + 4x2 Gray50 Grid + 3-Value Squint)
- **What already sings (PROTECT):**
  - Title shard (`still_01_title.png`): slashed-brush `TAKE BEFORE SLEEP` over vermilion gouache streak & torn ink shard has strong Steam capsule identity.
  - `03:14` Anomaly (`still_07_anomaly_0314.png`): Bottle #2 turned 180 deg inside the `COUNTER` mirrored shelf reflection reads immediately with genuine quiet chill and zero explanatory UI.
  - 4x4 Bayer ordered-dither dissolve (`clip_04_bayer_drawer_slow24x.mp4`) and pure-code zero-font `VISUAL-DNA LAB` (`still_08`, `still_09`) look tactile and cohesive.
- **Concrete pixel defects to repair:**
  1. **WebGL2 film grain too noisy (`grainAmount: 0.14`):** Additive RGB noise creates static snow over `#0B0A0E` velvet corners and neutral 50% gray solo passes. Cut to `~0.042` subtle warm luminance grain and suppress grain in solo/grid Vacuum checks.
  2. **Visitor anatomy (`layer02_visitor.ts`):** Face reads as a stiff beige pentagon, hand reads as a detached polygonal block, and sodium rim strokes float like disconnected tan diagonal sticks (`still_03`, `clip_01`). Re-sculpt organic wrapped hood/cheek/brow shading, curved coat drape, and real curled fingers resting on the outer steel lip.
  3. **Lamp cone hard triangle seam (`layer07_light.ts`):** Volumetric cone has a razor straight edge starting behind the hood rim (`still_06` cell 07). Feather the beam softly strictly out of the circular brass hood aperture.
  4. **Hand-lettering kerning (`calligraphy.ts`):** Narrow glyphs (`i`, `l`, `r`) leave awkward wide gaps (`Valer ian`, `dr ip`, `st iff`). Center narrow glyphs inside tighter advance boxes; darken vermilion script-clock wash so `02:18` reads crisply.
  5. **Exterior reflection staircase (`layer01_street.ts`):** Sodium streetlamp asphalt reflections look like uniform horizontal steps. Break into painterly staggered wet-pavement pools.
  6. **Paper wrap / steel drawer lip overlap (`layer06_counter.ts`):** Shift the dispensing paper wrap slightly left-down (`y + 18`) so it sits cleanly on the walnut counter without clipping the front pull-bar of the pulled-in steel tray.

## 2. Slow-Mo Motion Audit (Native 1fps 24x/60x Video Watch + 1x A/V Sync)
- **CRITICAL CATCH (`clip_03_stamp_hitstop_slow60x.mp4`):** Brass stamp hitstop & crimson `02:18` seal fired at `f=3` BEFORE the brass handle traveled from the left ink pad (handle only arrived at `f=12` AFTER hitstop ended!). Fix: fast 5-frame strike swing-down -> EXACT contact frame prints seal + triggers 3-frame hitstop + localized bone/vermilion/ink flash + `+8ms` lagged thud -> crisp spring recoil back to pad.
- **Pill pour & fold (`clip_02_pills_fold_solo_slow24x.mp4`):** Pill drop and magnetic groove snap feel crisp, paper envelope fold is tactile; add subtle drop shadow beneath folding flap crease.
- **1x Muxed A/V Sync (`beat_realtime_av.mp4`):** Capture script stopped pour early at 1 pill so fold/stamp skipped, and drawer audio led visual motion by ~200ms. Align exact action timings & add smooth slide-in for the paper wrap instead of 1-frame pop-in.

## 3. Native 1x Real-Time Audio Audit (`inspect_audio` across all 5 Vacuum WAV Stems)
- **`stem_rain_hum.wav` (WEAK):** Clean of clicks, but centroid `113.5 Hz` (`0%` > 3.5kHz) reads as dark bunker rumble instead of winter rain on laminated glass + European 50Hz ballast. Fix: layer delicate `2.5–7.5 kHz` glass raindrop patters, restore `800–2800 Hz` muted storm air, and add `100/150/250 Hz` iron-core ballast harmonics.
- **`stem_pills_pour.wav` (WEAK):** Quiet (`-47 dBFS`), midrange-choked (`91.8%` in 600–3500Hz), pitched ceramic "tocks" + abrupt start + digital silence tail. Fix: bottle-exit rattle lead-in, crisp dry `4–11 kHz` mineral tablet-on-slate snap (lower modal Q), grooved-slate micro-scrape/roll friction, gentle booth room floor, `+9 dB` gain.
- **`stem_stamp_impact.wav` (PASS-MINUS):** **90ms pre-impact micro-duck reads cleanly!** Zero clipping/clicks. Needs `45 Hz` HPF to trim `53.9%` sub-mud, crisp `3–7 kHz` brass spring snap at `+8ms`, close-mic viscous ink press/suction (`1.8–4.2 kHz`), and `+8 dB` gain.
- **`stem_intercom_voices.wav` (WEAK):** Unrealistic `20–120 Hz` sub-rumble inside small brass speaker; switch click too dull. Fix: steep `320 Hz` HPF + `1.2–2.8 kHz` brass-grille formant resonance on exterior/voice bus, crisp close-mic metallic spring toggle click (`4–10 kHz`) outside the bandpass, clearer human syllabic contour.
- **`stem_anomaly_hush.wav` (FAIL):** Continuous sub-rumble prevented true 95ms acoustic vacuum (`silence_windows_s: []`), and distant glass bottle click (`0%` > 3.5kHz) was buried. Fix: crisp `2–5 kHz` relay click-off -> hard-cut bus to true `-inf dB` (2ms anti-pop ramp) for **pure 95ms dead hush** -> delicate high-passed (`>400 Hz`, `3–8 kHz` shimmer) glass-on-wood bottle set-down!

## 4. Emergent Magic & Phase 2 Branches Discovered During Phase 1
- **The 4x4 Bayer dissolve (`clip_04`) + Mirror Reflection (`still_07`) pairing is electric:** During Phase 2 microsleep gaps (Night II–IV), a brief 6-frame involuntary **Bayer eyelid-blink / microsleep skip** (`03:11 -> 03:14` jumping forward 3 minutes on the hand-inked clock while the ballast cuts out for 95ms!) will make the player *feel* losing time inside their own booth without a single word of exposition!
- **The `DIM` vs `COUNTER` double-take loop:** Players naturally click between `1` (`COUNTER`) and `2` (`DIM`) to check if something changed — in Phase 2, Nadia's Night III line (*"When did you last sleep? Your labels are turned around."*) hits twice as hard when you realize *you* only ever saw the bottles reflected in `COUNTER` while *she* saw them straight through `DIM`!


---

## 5. Phase 2 Full-Arc Build, Slow-Mo Microsleep & 4-Trap Audit (Verified Post-Repair)
- **Capture & Toolchain Honesty:** All Phase 2/3 GPU WebGL2 stills, 1fps 60x slow-mo `.mp4` motion clips, mobile `390x844` checks, and `OfflineAudioContext` 1x WAV stems were rendered locally via headless Playwright Chromium + SwiftShader WebGL2 + `ffmpeg` (clean fallback off queued Kaggle GPU kernels, zero console/page errors, `webglActive: true`).
- **Build & Anti-Cheat Proof:** `tsc --noEmit && vite build` clean (`119.21 kB` JS, `38.13 kB` gzipped). Raw scan confirms ZERO canvas text APIs, ZERO external/system fonts, ZERO raster/diffusion imports, and ZERO literal emotional-anchor echoes (`03:14`, turned-backward/size-ordered items, warm latches, headlights/curb-clearing, buses/tea/spoons) anywhere in `src/` or `index.html`.
- **Automated 4-Night End-to-End Playthrough (Both Dawn Branches):** Verified `title -> n1_maren -> n1_anomaly (02:47, 1 uncorked bottle + 1 shelf tally) -> n1_tomas (graced) -> n1_dawn -> n2_intro (clean empty street + steady lamp) -> n2_nadia -> n2_halvorsen -> n2_microsleep (02:47->02:53, 2 uncorked bottles + 3 tallies + fresh wet-sheen 02:51 blotter stamp) -> n2_dawn -> n3_maren (Camphor + silent extra coin) -> n3_nadia (ledger filled through Tuesday) -> n3_rearrangement (02:47->03:04, drawer open 2in from inside holding pre-stamped 03:01 waxed packet + vermilion thumbprint on pull bar + 4 uncorked bottles + 5 tallies + wet 03:01 blotter stamp) -> n3_dawn -> n4_tomas (40c coins only, zero counter card) -> n4_halvorsen (knuckle knock reverses blink at f7, clock stays 02:47) -> n4_dawn_packet -> ending_dawn` across BOTH Branch A (take packet + sill lamp lit behind steel slats) and Branch B (leave packet + quiet street).
- **Defects Caught & Repaired via Native Video/Audio Inspection:**
  1. **Offscreen Layer02 Ghost Silhouette (`clip_microsleep_blink_slow60x.mp4`, `verify_n2_intro_clean.png`):** Skia deferred Canvas2D caching left stale visitor silhouettes when `renderLayer02Visitor` returned early. Fixed deterministically in `compositor.ts` by skipping `layerCanvases[1]` compositing whenever `visitor === 'none' || visitorPresence <= 0.02`; re-verified 100% clean across `verify_n2_intro_clean.png` and `clip_microsleep_blink_slow60x.mp4`.
  2. **Visitor Neck Gaps & Intercom Height (`02_hatch_nadia_dim.png`, `04_inspect_halvorsen.png`, `06_dawn_packet.png`):** Added shadowed necks & collar overlaps for Tomas, Nadia, and Dr. Halvorsen; lowered intercom voice strip to `y=402` (`h=62`) and raised Nadia's glass fingertips + fog ovals to `y=300` so they stay clearly visible above dialogue.
  3. **Physical Light & Material Connection (`06_dawn_packet.png`, `02_hatch_nadia_dim.png`, `03_counter_camphor.png`):** Replaced flat straight-edged `SILL` trapezoid with a feathered + 8% Bayer-dithered volumetric beam (`renderFeatheredCurbBeam` cached cleanly with `globalAlpha` for zero-recompute 60fps sweeps), added subtle 60fps floating dust motes inside the `COUNTER` beam, coupled the 4 apothecary vessels' brightness & warm left rim physically to `lampGlow`/`lampAngle`, and faded the interior sill beam cleanly into a thin golden under-shutter glow strip once the steel shutter closes.
  4. **Weighted Interaction Springs, Pure Pharmacy Microsleep Proof & In-World Copy Hygiene:** Wired spring-arc slide animation for grace-tin tucking (`graceAnim`), weighted coat-pocket glide for taking Halvorsen's dawn packet (`dawnPacketAnim`), detent impulse on brass lamp mode clicks, removed fake counter prescription card on Tomas's Night IV 40-cent repayment, replaced all literal Anchor echoes with pure pharmacy-native evidence (uncorked stoppers + loose tablets, chalk tallies, wet vermilion blotter stamps, smudged pull-bar thumbprint), and tightened all 4 character voices + in-world slips to authentic grounded human phrasing.
  5. **New Phase 2 1x Real-Time Foley Stems (Natively Auditioned):**
     - `stem_night4_knock.wav`: `peak -15.98 dBFS`, crest `15.26 dB`, centroid `933.7 Hz`; crisp laminated-glass knuckle tap interrupting the 95ms acoustic hush.
     - `stem_shutter_dawn.wav`: `peak -15.77 dBFS`, crest `16.08 dB`, centroid `967.5 Hz`; rhythmic metallic corrugated slats over 1.4s -> low stone-sill floor thud -> quiet decay to silence.
     - `stem_anomaly_hush.wav`: `peak -4.06 dBFS`, crest `27.38 dB`, centroid `1798.5 Hz`; true dead hush followed by crisp back-shelf glass clink.


---

## 6. Phase 3 Opus Gate 4 Final Micro-Fixes & Standalone Release Verification
- **Opus Gate 4 (Call 4 of 4 — `docs/opus_gate4_ruling.md`) Applied & Re-Verified Visually:**
  1. `01_title.png`: Muted Maren's title-screen hand to `#3A3029` so no bright disembodied fist peeks beneath the title shard.
  2. `02_hatch_nadia_dim.png`: Moved Nadia's two fingertips outside her slicker silhouette over open cold glass (`nx + 132, y + 296`) paired with two soft `#9FB0BF` fog ovals behind them.
  3. `03_counter_camphor.png`: Set Maren's single silent odd brass coin (`#906936`, 76% scale) 40px apart on the steel tray floor and re-sculpted Camphor balm doses as organic pale-ochre wax dabs on small parchment squares.
  4. `04_inspect_halvorsen.png` & `06_dawn_packet.png`: Re-sculpted Dr. Halvorsen's silhouette with a 6px-flatter crown cropped at ear line (distinct from Nadia's bob), crisp horizontal `#9CA3A8` silver brow line, elevated gleaming brass umbrella ferrule visible in both DIM and SILL views, and matched Night II script stamp to `02:41`.
  5. `05_anomaly_rearrangement.png`: Lifted the 5 chalk shelf tallies (`||||` crossed diagonally) to legible `#9EA6AE` against mirrored dark glass.
  6. `06_dawn_packet.png` & `02/04/06`: Capped the feathered Bayer sill beam softly (`0.17` peak / `0.22` max) + added cool `#4A5868` back-shoulder rim separation on Halvorsen, and trimmed intercom strip width (`x 280..930`) leaving `>52px` depth gap before the Valerian cork.
- **Standalone Release Packaging (`play/index.html`, `117.36 kB`):** Single-file zero-network playable build compiled from `dist/` (`119.45 kB` JS / `38.26 kB` gz), verified clean against raw anti-cheat scan (zero fonts, zero images/rasters, zero literal anchor leaks) and passed full end-to-end 4-night automated Playwright playthrough with `CONSOLE ERRORS COUNT: 0` and `webglActive: true`.
