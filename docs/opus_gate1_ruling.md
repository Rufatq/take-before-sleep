warning: --mode plan has no effect while slash command expansion is disabled.
**(a) Title: TAKE BEFORE SLEEP.** It reads like a pharmacy label instruction, it is searchable on Steam, and later in the game it starts to read as a threat: whose sleep, and what happens during it? It also matches the "BEFORE SLEEP" packet already on the sheet. HOLD FOR DAWN is the backup.

**(b) Story spine.** You are the night pharmacist, and you haven't slept properly since the person you shared the shift with died. The theme is care that you can't put on the books. You give it away in small unbilled doses. The dread is that you are losing track of your own hours, not that someone has broken in.

- **Maren (61)** sets out exact coins in the dim light every night. On Night III she leaves one extra coin and says nothing. The grace starts flowing back to you.
- **Tomas (24)** is short on Night I. If you covered him, the flickering streetlamp is steady by Night III. Nobody mentions it. You only see it if you dim the lamp.
- **Nadia (34)** is the only one who looks past you. On Night III, through the dimmed glass, she asks gently, in clinical shorthand: "When did you last sleep? Your labels are turned around."
- **Dr. Halvorsen (74)** writes in dip pen. His Night IV script names the exact minute you dimmed the lamp while you were alone. He isn't watching you. He worked night shifts himself in 1979 and knows the pattern.
- **The Quiet Rearrangement:** the latch is warm, the drawer is open from inside, the script is in your own handwriting (*2× valerian, 03:14*), and the bottles are turned to the wall in height order. You did this yourself during microsleeps. The orderliness is what's frightening.
- **Resolution:** on Night IV, Halvorsen slides the drawer back to you holding a folded packet with no stamp. You choose whether to take it, close the hatch before dawn and leave the curb lamp on. No twist, no reveal sting. You end the game being cared for.

**(c) Mechanic lock.** The glass membrane is approved, and it is the whole game. The core rule: **warmth for your work hides the stranger, and seeing the stranger hides your shelves.** Anomalies show up only in the COUNTER-mode reflection. Keep the three hood states as discrete clicks. CURB stays, but only the grace gesture lands there.

The intercom becomes spring-loaded hold-to-talk. You can't talk and pour at the same time, and that cost is the tension.

Cuts for friction:
- Pill counting becomes one tilt that snaps into the slate groove, max 4 seconds.
- Paper folding becomes one drag.
- The stamp keeps its 3-frame hitstop.
- Grace is never confirmed, logged or rewarded on screen. Its only consequences come the next night.
- Remove the entire **"INTERCOM: ON / ALL LABELS FACE WALL / WARM"** card. It is a robot status message that gives away the anomaly. A broken UI made of shattered ink is only allowed to carry the script and the stamp.

**(d) Art critique, from the sheet.**
- **Lettering fails the zero-fonts rule.** Every label reads as a condensed handwriting typeface. The "3-VALUE S UINT" title is missing its Q, which shows the glyph set is incomplete. Rebuild all lettering as tapered dip-pen ribbons.
- **The dip-pen swatch has no taper at all.** The zigzag has uniform weight. Apply w(s)=w0·(1−s)^1.35.
- **The hatch composite doesn't read as glass.** There's no frame mullion, no reflection, no water-bead edge light. Add a 1px bone rim (`#EBE0CC` at 40%) and a faint mirrored shelf ghost in COUNTER mode.
- **The two halos compete.** Pull verdigris down from `#3E8C7C` to `#2F6B62` and halve its radius. Sodium amber leads.
- **The visitor is a dead blob.** Give them a rim of sodium light on the hood edge and cuffs. Kill the unreadable diagonal stick.
- **Counter shadows are muddy brown at mid value.** Corners must drop to `#0B0A0E`. The lamp pool should cover at most 30% of the frame.
- **Bottles merge with the underpaint.** Raise the amber body to `#7A3A1C` with a highlight edge. The labels are pure white and too hot: use `#D9CDB4`. The same goes for the pills.
- **The squint panel's steel-grey ground (`#5C646C`) is too bright for glass.** Cap the glass value at `#2A3038`.
- **The red stamp in a box reads as a UI button.** Show it as a brass handle with a vermilion face.
- **Keep:** the 03:14 stamp on the packet (the strongest frame on the sheet), the slate tray, and the blurred reversed-bottles study.
- **Halftone and FBM:** use them only on rain and street. Never on the interior.

**(e) Scope.**
- **Phase 1 vertical slice:** Night I only. One seated camera, one booth, all 8 layers.
  - Visitors: Maren, then Tomas.
  - Mechanics: the three hood states, hold-to-talk intercom, drawer, one bottle type, stamp and grace tin.
  - One anomaly: a single bottle turned around in the COUNTER reflection at 03:14, which is gone when you look directly.
  - The slice ends at dawn when you close the hatch.
  - Done means every frame holds up as a wallpaper screenshot, there are no fonts anywhere, and grace has one visible consequence: Night II opens with the streetlamp steady.
- **Phase 2 full arc:** Nights II–IV, Nadia, Halvorsen, the full Quiet Rearrangement, Maren's coin reversal, Halvorsen's packet ending, a variety of scripts, and weather variation.
- **Cut outright:** branching endings, more than one booth, any spoken voiceover beyond band-limited intercom fragments, and any score counter.
