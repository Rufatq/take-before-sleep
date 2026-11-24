I read each file once. The proof sheet backs up most of Neon's notes. It shows three extra problems: the title is cropped, layer 04 leaks a backdrop, and the Rx card appears twice.

**Mark-making.** The flat 0.14 grain is what makes this look cheap. It sits like static on the velvet blacks and on the gray isolation checks. Weight it by brightness: `g = base * smoothstep(0.04,0.30,L) * (1 - smoothstep(0.75,0.95,L))`, with base at 0.07, 2px cells, and a hash that steps at 12fps. Turn grain off in the isolation renders. Right now edges are crisp vector over noisy fills, and that mismatch reads as a filter. Give silhouettes 0.6px of vertex wobble, reseeded on the same 12fps step.

**Underpainting.** The counter meets the glass along one hard horizontal line. Lay umber `#3A2A1C` under the counter and let it bleed 8px up into the bottom of the glass at 25%. Put cold `#1A2230` under the glass. Push the sodium bloom out with noise in its falloff so it stops reading as a clean disk. The lamp cone should start at the hood mouth, with its tip as wide as the mouth. Feather its long edges from 18px to 30px, widening with distance (`^1.35`). End it in the existing pool, and add 8% of the 4x4 Bayer dither to the falloff so it shares the dither look.

**Negative space and the 3-value squint.** I count about nine light shapes competing in the squint: the UI card, the drawer paper, the counter card, the stamp, the lamp hood, four bottle labels, the porthole ring and the pentagon face. Keep `#E8D5A8` for one mass only: the counter card plus the pills. Drop the bottle labels to `#8A7A5E` and the porthole ring to the middle value. Keep the lamp hood mid with a 2px rim. The visitor gets lost in the `#2A3038` glass. Lift the glass behind his head and shoulders to `#34404C` with a 120px radial, then cut him out in `#0B0A0E` so he is backlit. The drawer paper and counter card also merge into one blob, so cut a 6px shadow under the tray lip between them.

**Visitor and props.** Delete the pentagon face. Turn the face three-quarters with 9 to 11 vertices and an uneven jaw. Light only one cheek sliver on the sodium side (`#C89048` at 40%) and let the hood shadow cover the eyes. Attach the hand with a cuff polygon that overlaps the wrist. Give it four knuckle notches and one wet highlight dot. Redraw the rim streaks as tapered strokes along the coat outline, `w0(1-s)^1.35`, broken into two or three pieces. Under each light source, make the street reflections vertical smears four to six times taller than wide, broken by noisy horizontal ripples, and remove the stair steps.

**Lettering.** Glyph spacing seems to come from fixed cells. Space each letter from its stroke bounds plus a 0.08em margin: about 0.35em advance for `i`, `l`, `r`, with pair kerning for `ri`, `ia`, `ip`, `if`. The title is cut off at both edges, so fit it to 86% of the frame width. The red line through the middle of the title reads as "cancelled". Either make it a tapered brush underline below the baseline, or cut it. On the `02:18` tag, knock the numerals out in paper color at double stroke weight.

**Z-strata.** Draw the drawer in this order: tray floor, pills, paper, then the front wall of the lip. Slide the paper out from under the lip over 10 frames with ease-out, never in a single frame. Isolation cell 04 draws a black backdrop and a gray slab, so some layer is filling the full frame. Give layers 01 to 08 fixed integer z-values and ban full-frame fills. The UI card at top left repeats the counter card. Keep the counter card and show the UI card only in review mode.

**Stamp timing at 60fps.**
- **f0–f4:** wind-up, rising 6px and tilting 3°.
- **f5–f9:** strike travel, speeding up with no ease into contact.
- **f10:** contact. The seal appears and the thud lands at +8ms.
- **f10–f13:** 4-frame hitstop. Only the card mesh shakes, ±2px horizontally, and fades out.
- **Flash:** one frame at f10, as an inverted patch around the seal only. No full-frame red/black flash.
- **f14–f20:** recoil, overshooting 2px.

The thin, perfect shockwave ellipse in f03 and f04 looks like a UI selection ring. Replace it with seven uneven ink-spatter dots, or delete it. Leave the pill bounce and the Bayer dissolve alone. For Phase 2, put the 95ms hush before the 6-frame clock jump so the silence comes first.
