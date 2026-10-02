# Nomolos 02 · The Cobra Effect: the animation

<p align="center">
  <a href="https://raisulsohan.github.io/Nomolos_02_Cobra_Effect_animation/#01-Desktop"><img src="media/peek-1-reward.webp" width="49%" alt="A cash reward for dead cobras is posted on the sunlit streets of Delhi as hunters fan out"></a>
  <a href="https://raisulsohan.github.io/Nomolos_02_Cobra_Effect_animation/#03-Desktop"><img src="media/peek-2-effect.webp" width="49%" alt="The snake population graph climbs past before and rears into a cobra hood: the cobra effect"></a>
  <a href="https://raisulsohan.github.io/Nomolos_02_Cobra_Effect_animation/#11-Desktop"><img src="media/peek-3-rats.webp" width="49%" alt="Hanoi, 1902: The French official watches as tailless rats scurry around the streets"></a>
  <a href="https://raisulsohan.github.io/Nomolos_02_Cobra_Effect_animation/#23-Desktop"><img src="media/peek-4-emperor.webp" width="49%" alt="A servant kneels before the first emperor of China, offering the glowing elixir of immortality"></a>
</p>

<h3 align="center"><a href="https://raisulsohan.github.io/Nomolos_02_Cobra_Effect_animation/">▶ Watch the whole film (8:49) in your browser</a></h3>

<p align="center">Click a clip to open its scene.</p>

<p align="center">
  <strong>An animated documentary film created, written, directed, and animated by <a href="https://raisulsohan.com">Raisul Sohan</a></strong>
</p>

The animation of *The Cobra Effect: How a Bounty on Snakes Bred More Snakes*, the second Nomolos documentary, conceived, written, and animated by **[Raisul Sohan](https://raisulsohan.com)**. Every frame is mathematically composed and drawn in JavaScript on an HTML5 canvas using his own procedural drawing code, and the film itself uses zero video or image files. The clips above are recordings of the pages. Each frame is a pure function of time, so any moment can be drawn on its own.

The pages play silently.

> **Note:** All 23 scenes of the animated documentary (8:49) are complete and final.

## Watch

**Online: https://raisulsohan.github.io/Nomolos_02_Cobra_Effect_animation/**. Play the whole film or any completed scene, in 16:9 or 4:5.

Offline, open `index.html` or any page in a browser. No build step and no server are needed.

- `preview/` holds the whole film (`Nomolos_02_Cobra_Effect_film_Desktop.html`, `Nomolos_02_Cobra_Effect_film_Mobile.html`, 8:49) and the film scene by scene:
  `Nomolos_02_Cobra_Effect_scene-NN_Desktop.html` (16:9, 1920×1080) and `Nomolos_02_Cobra_Effect_scene-NN_Mobile.html` (4:5, 1080×1350).
- `sequences/seq-NN/` holds the single sequences each scene is made of: `film.html` (16:9) and `film-4x5.html` (4:5).

Player keys: <kbd>Space</kbd> play/pause, <kbd>←</kbd>/<kbd>→</kbd> one frame, <kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd> one second, <kbd>Home</kbd> back to the start, <kbd>F</kbd> fullscreen. Add `?t=12.5` to a page's URL to freeze one frame.

## Completed Scenes

| Scene | Name | Time | Status |
|---|---|---|---|
| Scene 01 | The bounty | 0:00.0–0:29.3 | **FINAL** |
| Scene 02 | The snake farm | 0:29.3–0:45.0 | **FINAL** |
| Scene 03 | The cages open | 0:45.0–1:09.5 | **FINAL** |
| Scene 04 | How do you make them? | 1:09.5–1:36.9 | **FINAL** |
| Scene 05 | Pay them | 1:36.9–1:53.7 | **FINAL** |
| Scene 06 | The crack | 1:53.7–2:19.4 | **FINAL** |
| Scene 07 | What you measure | 2:19.4–2:36.1 | **FINAL** |
| Scene 08 | Part legend | 2:36.1–3:07.8 | **FINAL** |
| Scene 09 | Hanoi, 1902 | 3:07.8–3:36.4 | **FINAL** |
| Scene 10 | Just the tail | 3:36.4–4:00.0 | **FINAL** |
| Scene 11 | Rats with no tails | 4:00.0–4:11.3 | **FINAL** |
| Scene 12 | The real math | 4:11.3–4:47.6 | **FINAL** |
| Scene 13 | A name for it | 4:47.6–5:08.2 | **FINAL** |
| Scene 14 | Broken bones | 5:08.2–5:31.8 | **FINAL** |
| Scene 15 | Fake accounts, closed bugs | 5:31.8–5:47.7 | **FINAL** |
| Scene 16 | Buying a number | 5:47.7–6:07.3 | **FINAL** |
| Scene 17 | The proxy | 6:07.3–6:35.6 | **FINAL** |
| Scene 18 | The reversal | 6:35.6–6:55.5 | **FINAL** |
| Scene 19 | Nobody was stupid | 6:55.5–7:19.6 | **FINAL** |
| Scene 20 | Everywhere | 7:19.6–7:47.8 | **FINAL** |
| Scene 21 | The lesson | 7:47.8–7:59.6 | **FINAL** |
| Scene 22 | One person | 7:59.6–8:23.4 | **FINAL** |
| Scene 23 | The emperor, next | 8:23.4–8:49.5 | **FINAL** |

## Layout

| Path | What it is |
|---|---|
| `lib/engine.min.js` | bundled and minified animation engine and procedural vector runtime |
| `sequences/seq-NN/film.js` | the minified drawing code of one sequence, in both formats |
| `sequences/seq-NN/timing.js` | the sequence's length and shot timing boundaries |
| `preview/` | self-contained scene and full reel review pages |
| `media/` | animated preview recordings of key moments |
| `fonts/` | Noto Sans SemiBold, Noto Sans Condensed Black, and Poppins Black |

## Author & Credits

- **Creator, Animator & Director:** [Raisul Sohan](https://raisulsohan.com) ([@raisulsohan](https://github.com/raisulsohan))
- **Production:** Nomolos Documentaries (Episode 02 · The Cobra Effect)
- **Animation & Engine:** Handcrafted by Raisul Sohan using procedural vector mathematics and HTML5 Canvas 2D drawing code.

## License

The fonts are Noto Sans and Poppins, © The Noto Project Authors and Indian Type Foundry, under the SIL Open Font License 1.1 (`fonts/OFL.txt`).
