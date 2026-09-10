# BRIEF — "Hello World TOOMUCH"

Build an absurdly over-engineered Hello World web app. Next.js (App Router, JavaScript,
NOT TypeScript). NO extra npm dependencies — only `next`, `react`, `react-dom` which are
already in package.json. Everything else must be hand-rolled vanilla (canvas, Web Audio API,
CSS animations). Do not touch package.json dependencies. Do not add next.config `output`
(it is patched by the deployment platform at build time).

Must work both as a client-side spectacle AND expose real API routes.

## Required files
- `app/layout.js` — metadata (title "Hello World TOOMUCH", description), global CSS import.
- `app/globals.css` — all styling, dark cosmic theme, CSS keyframes, responsive.
- `app/page.js` — `"use client"` main page: the whole spectacle.
- `app/api/health/route.js` — GET → `{ status: "ok", service: "helloworld-toomuch", uptimeSeconds, version, timestamp }`
- `app/api/hello/route.js` — GET, query `?name=X&lang=Y` → JSON with: greeting (translated), 63-language greeting on request of `all=1`, random fortune, random "hello world fact", lucky number 1-999, ISO timestamp, process uptime, and a `powered_by: "nrapken.dev"` field. If `name` missing default to "World". Support CORS (`Access-Control-Allow-Origin: *`).
- `app/api/languages/route.js` — GET → JSON array of all greetings `{code, language, text}` (at least 60 entries).
- `app/api/counter/route.js` — GET → `{ visits }` and POST → increments an in-memory module-level counter (resets on redeploy, that's fine; document it).
- `README.md` — what it is, how to run, list of features, the API endpoints, and mention it is deployed on nrapken.dev Quick Apps.

## The spectacle (app/page.js) — go overboard
1. **Aurora/cosmic background**: animated CSS gradient blobs + a `<canvas>` starfield with
   drifting stars, nebula pulses and slow parallax. Full screen, behind everything.
2. **Hero title** `HELLO WORLD` with a glitch/chromatic-aberration effect + a typewriter
   subtitle that cycles greetings from every language in an array defined in the page.
3. **Quadrilingual auto-rotator**: every 1.5s the big greeting switches to another language
   (show language name + native script), with a flag emoji.
4. **Real-time HUD**: live clock (updates every 250ms, shows local time + UTC), session
   uptime counter (mm:ss.ms), FPS meter computed from requestAnimationFrame, and a
   "blinks" counter of the cursor.
5. **Confetti button** ("PRESS FOR CONFETTI"): hand-rolled canvas confetti physics
   (particles with velocity, gravity, rotation, fade) — no library.
6. **Web Audio synth**: on first user click unlock `AudioContext`; play a little
   "hello" arpeggio. A sound on/off toggle button. Also play blips for HUD events.
   Must never throw in browsers/build where AudioContext is unavailable — guard everything.
7. **Cursor trail**: floating glowing particles that follow the mouse and fade out.
8. **Particle card grid**: cards explaining features, tilt-on-hover with CSS transforms.
9. **Live stats strip** fetched from the API routes (`/api/counter`, `/api/hello?all=0`,
   `/api/health`) with animated number tickers; a "GENERATE FORTUNE" button that hits
   `/api/hello` and shows a random fortune.
10. **Konami code easter egg**: pressing ↑↑↓↓←→←→BA toggles "PARTY MODE" —
    full-screen rainbow flash, hue-rotate on the whole page, a giant spinning `HELLO WORLD`
    marquee, and a synthesized fanfare. Show a toast when activated.
11. **A "TOO MUCH METER"** progress bar that fills up based on how many features the visitor
    has triggered (localStorage + session state), with funny labels as it fills
    (e.g. "normal", "getting spicy", "absolutely too much").
12. Footer: "Built with opencode · Deployed on nrapken.dev" + link to `https://nrapken.dev`.

## Quality bar
- Clean, readable, well-commented vanilla JS. No `any` framework-level hacks.
- Must be SSR-safe: guard `window`/`document`/`AudioContext` usage in `useEffect`, no
  top-level browser API access, no hydration mismatch errors.
- Responsive down to 360px wide. Respect `prefers-reduced-motion`.
- `npm run build` MUST pass with zero errors. Run it yourself and fix anything it reports.

## Deliverable
Complete app in the current directory. When done, print a short summary of the files you
created and confirm `npm run build` succeeded.
