# Contributing

Thanks for helping! The most valuable contribution is a **new style**.

## Setup

```bash
npm install
npm run dev -- build --demo --user nova-kim --theme y2k --out preview/y2k --preview
python -m http.server -d preview   # open preview/y2k/preview.html
```

`--demo` uses fictional profiles (`nova-kim`, `orbitalfox`, `lumen-ray`) so you can iterate without network access.

## Making a theme

1. Copy `src/themes/terminal.ts` to `src/themes/<id>.ts`.
2. Add the id to `ThemeId` in `src/types.ts`, `THEME_IDS` in `src/config.ts` and the map in `src/themes/index.ts`.
3. Implement the eight renderers. Each returns a `Card`:

```ts
card(width, height, title, {
  fonts: ['mono400'],          // keys from src/fonts — only what you use
  css: `.__t{fill:#fff}`,      // scoped CSS
  defs: `<linearGradient id="__g">…</linearGradient>`,
  body: `<rect fill="url(#__g)" …/><text class="__t">${esc(name)}</text>`,
  radius: 16,                  // optional rounded clip
});
```

### Rules

- **Scope everything with `__`.** Ids, classes and keyframe names written as `__name` are rewritten per card so cards can be combined into one SVG. Never hard-code ids.
- **Escape user text with `esc()`.** It also encodes `_` so user text never collides with scoping.
- **Animate with CSS, not SMIL**, and make sure the resting state is readable — the name must be visible even if animations never run. `prefers-reduced-motion` is handled globally.
- **Widths:** full cards are 840 px wide, half cards (`stats`, `languages`, `repo`) 410 px. `stats` and `languages` should share a height.
- **Fonts:** only OFL fonts. To add one, put it in `scripts/build-fonts.mjs`, run `npm run fonts`, and register it in `src/fonts/index.ts`.
- **No third-party assets** you can't license (game textures, logos other than Simple Icons).
- **Handle empty data:** no calendar (token-less builds), no languages, no repos, empty stack.

Run the demo build for all three demo users before opening a PR, and attach a screenshot of the header.

## Engine changes

`npm run build` must pass (`tsc`). Keep the public API in `src/index.ts` stable — the website depends on it. Remember to rebuild and commit `dist/`, which the GitHub Action runs directly.
