# Typeface record

**Status:** Canela Deck is the approved primary display face. Its commercial
web licence is **pending** — Coffee-First Strategy, Open Item #3 ("Canela web
licence or alternative", blocks: Design system, needed by: Kickoff).

**Client decision, 21 August 2026:** proceed using Canela Deck; the licence
will be obtained after the client confirms the design direction.

---

## What is implemented

`--font-display` in `src/app/globals.css` names the real family **first**:

```css
--font-display: "Canela Deck", var(--font-display-fallback), ui-serif, Georgia,
  "Times New Roman", serif;
```

Nothing in the codebase references a substitute family by name. The moment the
licensed files exist, Canela Deck wins the cascade everywhere with no component
changes.

## The documented stand-in

Until the licence lands, `--font-display-fallback` resolves to **Fraunces**
(Google Fonts, SIL Open Font License), loaded via `next/font/google` in
`src/app/layout.tsx` with the `SOFT`, `WONK` and `opsz` axes exposed.

Why Fraunces and not the usual substitute: Canela Deck is a warm,
moderately-contrasted serif with subtly flared, wedge-like stems — it is not a
Didone. Playfair Display, the reflexive choice, has far higher stroke contrast
and reads colder and more fashion-led. Fraunces with `WONK 0` and `SOFT 0`
strips its quirk and sits closer to Canela's register: warm, editorial, high
optical quality at display sizes.

**This is a stand-in, not an approval.** It is recorded here rather than
silently substituted, per the build directive (§5: "If the Canela Deck web
licence is unavailable, do not silently substitute an arbitrary font.
Implement the design with a clearly defined licensed alternative and document
the substitution.").

## Installing the licensed files

1. Place the licensed web files in `public/fonts/` (`.woff2` preferred).
2. Declare them in `src/app/globals.css`:

   ```css
   @font-face {
     font-family: "Canela Deck";
     src: url("/fonts/CanelaDeck-Regular.woff2") format("woff2");
     font-weight: 400;
     font-style: normal;
     font-display: swap;
   }
   ```

3. Remove the `Fraunces` import and the `--font-display-fallback` variable from
   `src/app/layout.tsx`.
4. Re-check the type scale. Canela and Fraunces differ in x-height and optical
   sizing, so `--text-display-1` and `--text-display-2` in `globals.css` will
   need a pass. The scale is expressed in `clamp()` tokens in one place for
   exactly this reason.

## Secondary face

**Poppins** (Brand Guideline) is loaded from Google Fonts at weights 300–600
and is used for all UI, navigation, labels, metadata, tables and supporting
copy. No substitution — it is freely licensed under the SIL OFL.
