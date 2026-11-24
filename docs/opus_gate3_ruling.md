# Take Before Sleep: Phase 2 Choreography & Voice Bible

## 1. Hush, then microsleep blink (60fps, frame 0 = hush onset)

| Frame | Audio | Picture |
|---|---|---|
| f0–f5 | Every bus falls to true digital zero for 4560 samples (95ms @ 48k). The rain stem drops out too. | Nothing moves. The camera holds its last sub-pixel breath. |
| f6 | Still silent | Bayer 4×4 lid closes to 4/16 cells. Threshold is biased by `abs(uv.y-0.5)*0.7`, so the lids meet from top and bottom, not as a flat fade. Camera pitch dips 0.4°. |
| f7 | — | 10/16 cells, pitch −1.1° |
| f8 | — | 16/16 black. **The clock hands snap** to the new minute. The second hand gets no tween. |
| f9 | — | 16/16 black. **The prop swap happens** (bottles reverse, the drawer offsets, warmth flags are written). |
| f10 | Room tone returns at −30dB, 1-pole rise | 10/16 cells, pitch −0.6° |
| f11 | — | 4/16 cells, pitch +0.15° (2-frame overshoot) |
| f12–f29 | Room tone reaches −14dB by f22. Rain re-enters 4 frames *after* room tone. The back-shelf glass click lands at f14. | Pitch settles to 0° on a damped spring (ζ 0.55). The lamp hood keeps its pre-blink state. |

Never shake the camera and never put a sting on the blink. The player should feel the jump only from the clock.

**Night IV variant:** the hush runs and the blink reaches f7 at 10/16. Then Halvorsen's single knuckle on the glass (+8ms after visual contact) reverses the curve: 4/16 at f8, open at f9. The clock does not move. Someone kept you awake.

## 2. Prop feel

- **Valerian tablets.** Amber glass, palm-height. Tablets start sliding at 14° tilt. They come out in clumps of two or three with a dry chalk rattle, then two sharp ticks as they seat in the slate groove. Pour friction is high, so the player has to commit to the angle.
- **Camphor balm jar.** Squat milk glass with a tin lid. It does not pour. Dragging it gives a heavy low-friction glide and a soft glass-on-slate hum. The lid takes a quarter-turn with a dry creak, and its mass lags the hand by 2 frames.
- **Fever salts sachet.** Folded glassine. Tilting it gives a granular hiss that shifts weight 120ms late. It weighs almost nothing, flutters 1px when the drawer closes, and the paper crackles on grip.
- **Linen gauze roll.** Silent. It lands with a dull, damped thud. Tilted past 30°, it unrolls one loose turn that has to be tucked back.

**Warmth cue (latch and stamp handle).** Apply a screen-space refraction band 6px above the brass: 0.5px UV offset with rising noise at 0.8Hz. It only shows against the back-shelf highlight. Shift the brass specular +150K warmer, and leave the latch the one dry patch while the cold glass around it beads condensation. Warmth decays over 40s. On grip, the hand-release animation lengthens by 3 frames, as if the hand lingered. Never show a label.

## 3. Visitor anatomy

**Nadia (34).** Rain slicker hood pushed back, with wet specular streaks on the shoulders. A pale mint-grey scrub collar shows above the zip. She stands with her weight on her left hip and her head tilted 7°. Index and middle fingertips rest on the glass and leave two fog ovals that fade over 3s after she lifts them. She looks at the wall clock *before* she speaks and blinks slowly, 280ms per blink.

**Dr. Halvorsen (74).** Wool coat buttoned to the top, scarf knotted once. His closed umbrella drips from the ferrule every 1.3s, and each drop is a small sodium-lit flash. He is lit 3/4 by sodium light, so one silver sliver of brow catches it and the rest of his face stays in shadow. He stands upright and never touches the glass. He slides each script flat, holding only the corner, and waits until your eyes reach the signature before he speaks.

## 4. Lines (each one is a 2-line strip)

**Night I**
- **Maren:** "Two of each. I counted at home, so you needn't." / "Exact. Good night."
- **Tomas:** "I'm short. Forty cents. I can bring it Thursday." / "Sorry. It's late for everyone."

**Night II**
- **Nadia:** "Migraine powders. Potassium, effervescent. Ward's out of both." / "Sorry. Fourteen hours. I talk in abbreviations now."
- **Halvorsen:** "Good evening. Fever salts, for the boy at number fourteen." / "I've written it out properly. Old habit."
- **His script:** *Pulv. antipyret. — one sachet every six hours. For No. 14. — E. Halvorsen, M.D.*
- **Microsleep:** 03:14 jumps to 03:19. Two reflected bottles are now reversed, and the stamp handle is warm.

**Night III**
- **Maren** lays out her pairs, then one more coin set apart, and slides them through without comment: "Same as last time, please." / "You look tired. No — it's fine. Good night."
- **Nadia:** "Just the potassium tonight." / *(fingers on the glass, eyes past your shoulder)* "When did you last sleep? Your labels are turned around."
- **Microsleep:** 03:14 jumps to 03:29. The drawer is open two inches from the inside and the latch is warm. All four reflected bottles face the plaster, ordered by height.
- **The prescription:** your slant, your crossed sevens, bone-dry ink with no sheen: *2x Valerian, 03:14 — take before sleep.*

**Night IV**
- **Tomas** taps once: "Didn't need anything. Just saw the lamp." / "Thursday. I said Thursday." *(Forty cents in the drawer.)*
- **Halvorsen:** "I kept these nights in 1979. Same chair, I expect." / "One stops counting the minutes. Then the minutes count you."
- **His script:** *For the night clerk. Lamp dimmed 03:14, alone. Rest, prescribed without limit. — E.H.*
- **Dawn packet beat:** he works the drawer from his side, and the steel interlock thunks once. Inside lies one waxed-paper packet folded his way, with the corners tucked opposite to yours and no stamp. "Not for sale. Nothing to stamp." / "Good morning."

After that, he says nothing more. The rain thins. The player can take the packet or leave it on the sill, then pulls the shutter down, which takes 1.4s of steel slats. The CURB lamp can be left burning out over the wet street. The last sound is the shutter's floor contact, then room tone, then nothing.

## 5. Voice rules (Zero-Tag Test)

- **Maren** notices money first, then you. She speaks in complete short sentences and never explains a kindness.
- **Tomas** notices his own failure first. His speech comes in fragments, and he keeps his promises late.
- **Nadia** notices the clock, then the patient, then you. She uses clinical nouns and drops her articles.
- **Halvorsen** notices the hour first. He speaks in formal, whole sentences with period phrasing and calls you only by your role.

None of them say what they feel.
