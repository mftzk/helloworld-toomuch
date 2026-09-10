# Hello World TOOMUCH

An absurdly over-engineered Hello World. It is a Next.js (App Router, plain
JavaScript) single page that greets you in 63 languages while a canvas
starfield drifts behind a glitchy title, hand-rolled confetti explodes, a
Web Audio synth plays an arpeggio, and a handful of real API routes serve live
data.

It is built to work **both** as a client-side spectacle and as a real JSON API.

## What it is

- A cosmic, animated greeting page with a typewriter subtitle, quadrilingual
  rotator, live HUD, confetti physics, cursor trail, Web Audio synth and a
  Konami-code party mode.
- A small set of dependency-free API routes (`/api/health`, `/api/hello`,
  `/api/languages`, `/api/counter`).
- **No extra npm dependencies.** Only `next`, `react` and `react-dom` are used.
  All visual and audio effects are hand-rolled with canvas, the Web Audio API
  and CSS.

## How to run

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start
```

## Features

1. **Aurora/cosmic background** — animated CSS gradient blobs plus a `<canvas>`
   starfield with drifting, twinkling stars and pulsing nebulae.
2. **Glitch hero title** — `HELLO WORLD` with a chromatic-aberration glitch and a
   typewriter subtitle cycling every greeting.
3. **Quadrilingual auto-rotator** — the big greeting switches language every
   1.5s, showing flag, language name and native script.
4. **Real-time HUD** — local + UTC clock (250ms), session uptime, an FPS meter
   from `requestAnimationFrame`, and a cursor-blink counter.
5. **Confetti button** — hand-rolled particle physics (velocity, gravity,
   rotation, fade). No libraries.
6. **Web Audio synth** — first click unlocks an `AudioContext` and plays a hello
   arpeggio; a sound toggle; blips for HUD events and a party fanfare. Every
   call is guarded so it never throws when audio is unavailable.
7. **Cursor trail** — glowing particles that follow the pointer and fade out.
8. **Particle card grid** — feature cards that tilt toward the pointer using CSS
   transforms.
9. **Live stats strip** — pulls from `/api/counter`, `/api/hello?all=0` and
   `/api/health`, with animated number tickers and a **GENERATE FORTUNE** button.
10. **Konami easter egg** — `↑↑↓↓←→←→BA` toggles PARTY MODE: rainbow flash,
    page-wide hue rotation, a giant spinning marquee and a synthesized fanfare.
11. **TOO MUCH METER** — a progress bar that fills as you trigger features,
    persisted in `localStorage`, with increasingly concerned labels.
12. **Footer** — "Built with opencode · Deployed on nrapken.dev".

The page is SSR-safe: browser APIs are only touched inside `useEffect`, no
top-level `window`/`document` access, and initial state is deterministic to
avoid hydration mismatches. It is responsive down to 360px and respects
`prefers-reduced-motion`.

## API endpoints

All endpoints send `Access-Control-Allow-Origin: *`.

### `GET /api/health`

```json
{
  "status": "ok",
  "service": "helloworld-toomuch",
  "uptimeSeconds": 12.345,
  "version": "1.0.0",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

### `GET /api/hello?name=X&lang=Y&all=1`

- `name` — who to greet. Defaults to `World`.
- `lang` — greeting language code (e.g. `fr`, `ja`). Defaults to `en`.
- `all=1` — also include every greeting (`greetings` array + `greetingCount`).

```json
{
  "greeting": "Hello",
  "message": "Hello, World!",
  "language": "English",
  "code": "en",
  "name": "World",
  "fortune": "A green build is in your near future.",
  "fact": "The first 'Hello, World!' program was popularized by Brian Kernighan in 1972.",
  "luckyNumber": 342,
  "timestamp": "2026-01-01T00:00:00.000Z",
  "uptimeSeconds": 12.345,
  "powered_by": "nrapken.dev"
}
```

### `GET /api/languages`

Returns an array of every greeting: `[{ "code": "en", "language": "English",
"text": "Hello" }, ...]` (63 entries).

### `GET /api/counter` · `POST /api/counter`

- `GET` → `{ "visits": 42 }`
- `POST` → increments and returns the new count.

> **Note:** the counter is a module-level in-memory value, so it resets on every
> redeploy. That is intentional for this demo — it is not a database.

## Deployment

Deployed on **nrapken.dev Quick Apps** — <https://nrapken.dev>.

---

Built with [opencode](https://opencode.ai).
