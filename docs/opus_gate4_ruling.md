I looked at the 2376×970 sheet and then at the six native 1280×720 tiles, and sampled pixel colours with PIL. The sheet holds up as a wallpaper. The dark ground stays near `#0b0b0f`, and the only warm areas are the lamp cone and the sodium blob, so the eye settles on the hatch. What's left to fix is legibility: in a few places the story beat is drawn but doesn't read.

**Micro-fixes**

1. **03 COUNTER, the extra coins in the drawer slot.** There are two cream ovals (`#dec493`) on the black slot bar (`#0e0e12`), and they read as a pair of eyes. The brief asks for one coin. Draw a single coin in the tray's brass (`#906936`), make it about 70% of its current size, and put it 40px right of the tray cluster on the tray floor, away from the slot.

2. **02 HATCH, Nadia's fingertips.** The two pale bars (`#8f7a6f`) sit inside her torso at x≈650, y≈335–370, so they read as a badge on her chest. Move them up to about y≈300 and outside the torso, over open glass. Add two fog ovals behind them: `#9fb0bf` at 0.16 alpha, 11×7px, with a 2px feather.

3. **05 ANOMALY, the chalk tallies.** They sample `#20242b` against glass at about `#18202c`, which makes them invisible, and the five-tally count is part of the evidence. Lift them to `#7d838a` at 0.55 alpha and make them 1.5px thick.

4. **04 and 06, Halvorsen's head.** It uses the same bob shape as Nadia, with side flaps down to the jaw at y≈215, so the two characters look the same. Flatten the crown by 6px, cut the side flaps off at the ear line (y≈185), and add the missing silver brow line: `#9ca3a8`, 2px × 22px. In tile 06 the umbrella ferrule shows, but in tile 04 it doesn't; add it to 04 as well.

5. **06 DAWN, the sill beam swallowing Halvorsen.** His coat in the beam (`#41301d`) is almost the same as the lit glass around him (`#645239`), so his outline disappears. Cap the beam over the figure mask at 0.45 of its current strength, and put a cool 1px rim (`#4a5868`) on the shoulder edge facing away from the lamp.

6. **02, 04 and 06, the dialogue box edge.** The right end of the box (x≈985 including the border) sits about 10px from the Valerian cork (x≈995), and the near-touch flattens the depth. Make the box span x 280–945 so there's at least a 50px gap.

One more thing that isn't a fix. In 01, the title band (`#0b0b0f`) hides Maren completely but leaves her lit fist (`#907767`) at 550,445, so it looks like a hand with no body. If that isn't on purpose, darken the fist to about `#3a3029` on the title screen only.

**PROTECT (don't touch)**

- The dry-brush title shard, the slanted cream line across the top of the band, and the red underline (`#742b22`).
- The near-black ground values.
- The single warm sodium blob, the green cross smudge, and the rain streaks.
- The feathered Bayer cone in 03 and 05.
- The lamp silhouette and its angle.
- The prop row and its order on the right.
- Tile 05's red circle on the packet (`#dfd0b1` paper), the blotter stamp, and the thumbprint on the pull bar (`#b4604c`).
- The handwriting script and the paper tone of the boxes (`#baaf98`).
- The `03:08` red tag on Halvorsen's card in 04. If it's a planted future-time anomaly it's the best quiet detail in the set; if it's a bug, check it rather than deleting it.
- The faint clock in the top-right corner.
