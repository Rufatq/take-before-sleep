# 02 — Lookdev & Pure-Code Dry-Tool Spec (LOCKED — Opus Gate 1)

## Lookdev Provenance
- Antigravity's Nano Banana (`gemini-3.1-flash-image`) returned `HTTP 503 UNAVAILABLE` across all 3 concept board attempts. Pure-code procedural dry-brush study boards were rendered (`docs/lookdev/gate1_contact_sheet.png`) and critiqued at Opus Gate 1.
- **Zero-Diffusion & Zero-Font Invariant:** ZERO image/texture files, ZERO base64 rasters, ZERO system/web fonts (`ctx.fillText`, `@font-face`, CSS font rendering) anywhere in `src/` or shipping bundles.

## Locked Color Key (Adjusted Per Opus Gate 1 Critique)
| Role | Hex | Rule |
|---|---|---|
| Velvet Dark Anchor (D-max) | `#0B0A0E` | Counter corners & interior frame MUST drop cleanly to true `#0B0A0E` (no muddy mid-brown shadows) |
| Rain Indigo Deep | `#121C29` | Wet street & night storm ground |
| Glass Squint Midtone Cap | `#2A3038` | Glass value capped here in 3-value squint (never bright `#5C646C`) |
| Burnt-Sienna Underpaint | `#5A2E1A` | Warm ground peeking through dry-chalk paper valleys |
| Amber Glass Bottle Body | `#7A3A1C` | Raised off underpaint with warm grazing highlight edge |
| Brushed Steel Drawer | `#586169` | Cold `Durchreiche` airlock tray |
| Muted Verdigris Cross | `#2F6B62` | Pulled down & radius HALVED so sodium amber unmistakably leads |
| Sodium-Amber Brass Lamp | `#EEA646` | Primary warm hero light; desk pool covers **<= 30% of frame** |
| Bone-Cream Paper / Pills / Labels | `#D9CDB4` | Cooled off pure white so highlights never look clipped or hot |
| Glass Edge Rim Highlight | `#EBE0CC` (40% alpha) | Crisp `1px` glass mullion & water-bead rim catch |
| Vermilion Wax / Stamp Face | `#B83B28` | Turned brass stamp handle + vermilion rubber face (never a red UI box) |

## Locked Pure-Code Physical Art Tools (`src/art/`)
1. **Paper Tooth Heightfield (`paperTooth`):** Cold-pressed coarse grain shared across dry strokes; rotated FBM (`36.87 deg`) + ordered halftone applied **STRICTLY to rain and exterior street, NEVER to interior surfaces**.
2. **Dry Oil-Pastel / Chalk Chisel (`dryChalkPoly`):** Skips paper valleys so `#5A2E1A` warm underpainting breathes through dark washes while corners still anchor to `#0B0A0E`.
3. **Opaque Gouache Flat Brush (`gouacheBristle`):** Multi-bristle directional streaks for sodium rim light on wet coat hoods/cuffs, steel sill reflections, rain streaks, and bottle highlights.
4. **True Velocity-Tapered Dip-Pen Ribbon (`dipPenRibbon`):** Filled variable-width Bézier ribbons strictly following **`w(s) = w0 * (1 - s)^1.35`** (velocity taper) or expressive swell-to-needle `w(s) = w0 * sin(s*PI)^0.65 * (1 - 0.55*s)^1.35` with corner ink-pool beads.
5. **True Zero-Font Calligraphic Lettering Engine (`src/art/calligraphy.ts`):** Complete ASCII stroke-path library (A–Z, a–z, 0–9, full punctuation including `Q`, `+`, `?`, `:`, `-`, `.`, `'`, `!`) rendered exclusively as **tapered dip-pen ink ribbons** with genuine calligraphic entry-to-exit taper, slight baseline wave, stroke-build animation, and 6fps boiling-line jitter—never condensed font-like uniform lines.
6. **Unified Non-MSAA WebGL2 Post-Process Compositor (`src/render/compositor.ts`):** Composites all 8 soloable Vacuum Layers (`01..08`) cleanly on Intel HD 4000 / Mesa (`antialias: false`, `samples: 0`), adding lamp-state optical glass reflection/transmission, rain refraction, 4x4 Bayer dither reveal transitions, localized 3-frame stamp hitstop/flash, 3-value squint mode, and 4x2 Vacuum Grid mode.
