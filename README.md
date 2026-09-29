# Nomolos 02 · The Cobra Effect: the animation

The animation of *The Cobra Effect: How a Bounty on Snakes Bred More Snakes*, the second Nomolos documentary. Every frame is drawn in JavaScript on a canvas, and the film itself uses no video or image files. Each frame is a pure function of time, so any moment can be drawn on its own.

The pages play silently.

> **Note:** This project is currently in active production. Animation sequences and scenes are being updated and committed as they are completed.

## Watch

Offline, open `index.html` or any page in a browser. No build step and no server are needed.

- `preview/` holds the whole film (`Nomolos_02_Cobra_Effect_film_Desktop.html`, `Nomolos_02_Cobra_Effect_film_Mobile.html`) and the film scene by scene:
  `Nomolos_02_Cobra_Effect_scene-NN_Desktop.html` (16:9, 1920x1080) and `Nomolos_02_Cobra_Effect_scene-NN_Mobile.html` (4:5, 1080x1350).
- `sequences/seq-NN/` holds the single sequences each scene is made of: `film.html` (16:9) and `film-4x5.html` (4:5).

Player keys: <kbd>Space</kbd> play/pause, <kbd>←</kbd>/<kbd>→</kbd> one frame, <kbd>Shift</kbd>+<kbd>←</kbd>/<kbd>→</kbd> one second, <kbd>Home</kbd> back to the start, <kbd>F</kbd> fullscreen. Add `?t=12.5` to a page's URL to freeze one frame.

## Layout

| Path | What it is |
|---|---|
| `lib/` | the engine: the film clock, the player and the shared drawing code |
| `sequences/seq-NN/film.js` | the drawing code of one sequence, in both formats |
| `sequences/seq-NN/timing.js` | the sequence's length and the start and end of each of its shots |
| `fonts/` | Noto Sans SemiBold, Noto Sans Condensed Black, and Poppins Black |

## License

The fonts are Noto Sans, © The Noto Project Authors, under the SIL Open Font License 1.1 (`fonts/OFL.txt`).
