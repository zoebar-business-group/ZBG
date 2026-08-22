# Verification harness

This used to live in a session scratchpad and was lost on every restart, so
`BUILD-STATUS.md` carried instructions to rebuild it from scratch each time.
It now lives in the repository. Nothing here ships — `qa/` is outside `src/`
and is never imported by the app.

The dependencies are deliberately **not** in `package.json`. Playwright pulls a
browser binary, and that does not belong in the install path of a static
marketing site that deploys to Vercel. Install them once, on demand:

```bash
npm i --no-save playwright @axe-core/playwright axe-core pngjs
npx playwright install chromium
```

Then build, serve, and point the scripts at that origin:

```bash
npm run build
npx next start -p 3215      # in one terminal
node qa/qa.mjs    http://localhost:3215
node qa/a11y.mjs  http://localhost:3215
node qa/motion.mjs http://localhost:3215
node qa/weight.mjs http://localhost:3215
```

Run against a **production build**, never `next dev` — dev ships extra
scripts, skips minification and reports different timings.

## What each script owns

| Script | Covers |
|---|---|
| `qa.mjs` | Status, one `<h1>`, `lang`, title, description, canonical, JSON-LD parses, no `null`/`undefined`/`NaN` leaking into text, structural a11y, console errors, LCP/CLS, horizontal overflow at 8 widths, skip-link is the first tab stop, reduced-motion, no-JS |
| `a11y.mjs` | axe-core across WCAG 2.0/2.1/2.2 A+AA plus best-practice |
| `motion.mjs` | Orphaned/stuck `[data-reveal-line]`, unrevealed `[data-animate]`, `will-change` count |
| `weight.mjs` | Page weight split by type, per-font payload, which font faces actually paint |
| `gradient.mjs` | Renders `.story-atmosphere` in isolation to find the lightest pixel it can paint |
| `palette.mjs` | Contrast matrix for the palette, and finds AA-passing replacements at the same hue |

## Two things worth knowing before trusting a result

**Contrast belongs to axe, not to `qa.mjs`.** Three hand-rolled attempts were
written and all three produced their own class of false positive: walking
ancestors for a background mis-resolved the fixed navigation over the hero and
reported alabaster-on-alabaster at 1:1; compositing `elementsFromPoint` still
could not see through `backdrop-filter` or ancestor opacity; and sampling
rendered pixels picked up Chrome's subpixel-antialiasing fringes, reporting
orange and blue foregrounds for grey text. `qa.mjs` no longer checks contrast.
axe resolves stacking properly and returns `incomplete` instead of guessing.

**Kill the old server before starting a new one.** Stopping the shell that ran
`next start` does not always stop the node process holding the port. A run
against a half-dead server produced 385 phantom `target-size` violations —
pages were being served without CSS, so every link measured 17px tall. If a
result looks structurally impossible, check the port first:

```bash
# PowerShell
Get-NetTCPConnection -LocalPort 3215 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## axe "incomplete" is not a pass

The story surfaces return ~192 `incomplete` contrast nodes because axe will not
guess a background behind a gradient. Those were verified by hand instead:
`gradient.mjs` shows `.story-atmosphere` tops out at `#143833` at every viewport
from 360 to 2560 — the two radials never peak together — and every light text
token clears 4.5:1 against that. Re-run `gradient.mjs` if the wash is ever
edited, because the deep-surface tokens are calibrated against that number and
not against flat emerald.
