import { fontFace, type FontKey } from './fonts/index.js';
import { esc } from './util.js';

/**
 * A rendered card before finalisation. Inside `body`, `css` and `defs`,
 * every `__` is a scope token: ids (`id="__sky"`), references (`url(#__sky)`),
 * classes (`.__title`) and keyframes (`@keyframes __drift`). It is replaced
 * with a unique prefix so several cards can be nested into one SVG.
 * User text must always pass through `esc()`, which encodes `_`.
 */
export interface Card {
  w: number;
  h: number;
  title: string;
  body: string;
  css?: string;
  defs?: string;
  fonts: FontKey[];
  /** Rounded clip radius applied to the whole card (0 = none) */
  radius?: number;
}

function scope(s: string, uid: string): string {
  return s.replace(/__/g, uid + '-');
}

function visibleText(s: string): string {
  return s
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
}

async function fontCss(cards: Card[]): Promise<string> {
  const keys = Array.from(new Set(cards.flatMap((c) => c.fonts)));
  const text = cards.map((c) => visibleText(c.body)).join('');
  const rules = await Promise.all(keys.map((k) => fontFace(k, text)));
  return rules.join('');
}

function inner(card: Card, uid: string): { defs: string; css: string; body: string } {
  const clip = card.radius
    ? `<clipPath id="${uid}-clip"><rect width="${card.w}" height="${card.h}" rx="${card.radius}"/></clipPath>`
    : '';
  const body = card.radius ? `<g clip-path="url(#${uid}-clip)">${card.body}</g>` : card.body;
  return {
    defs: clip + scope(card.defs || '', uid),
    css: scope(card.css || '', uid),
    body: scope(body, uid),
  };
}

const BASE_CSS = 'text{white-space:pre}@media (prefers-reduced-motion:reduce){*{animation:none!important}}';

/** Standalone SVG document for one card. */
export async function renderCard(card: Card, uid = 'ra'): Promise<string> {
  const { defs, css, body } = inner(card, uid);
  const fonts = await fontCss([card]);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${card.w}" height="${card.h}" viewBox="0 0 ${card.w} ${card.h}" fill="none" role="img" aria-label="${esc(card.title)}">` +
    `<title>${esc(card.title)}</title>` +
    `<style>${fonts}${BASE_CSS}${css}</style>` +
    (defs ? `<defs>${defs}</defs>` : '') +
    body +
    `</svg>`
  );
}

/**
 * One SVG containing several cards laid out in rows. Used by the
 * "paste a single file" install path. Each row is centered, with `gap` spacing.
 */
export async function renderCombined(rows: Card[][], title: string, width = 840, gap = 20): Promise<string> {
  let y = 0;
  let defs = '';
  let css = '';
  let body = '';
  let n = 0;
  for (const row of rows) {
    if (!row.length) continue;
    const rowW = row.reduce((s, c) => s + c.w, 0) + gap * (row.length - 1);
    const scale = rowW > width ? width / rowW : 1;
    let x = (width - rowW * scale) / 2;
    const rowH = Math.max(...row.map((c) => c.h)) * scale;
    for (const card of row) {
      const uid = 'c' + n++;
      const part = inner(card, uid);
      defs += part.defs;
      css += part.css;
      body += `<svg x="${x}" y="${y}" width="${card.w * scale}" height="${card.h * scale}" viewBox="0 0 ${card.w} ${card.h}" overflow="hidden">${part.body}</svg>`;
      x += (card.w + gap) * scale;
    }
    y += rowH + gap;
  }
  y -= gap;
  const fonts = await fontCss(rows.flat());
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${y}" viewBox="0 0 ${width} ${y}" fill="none" role="img" aria-label="${esc(title)}">` +
    `<title>${esc(title)}</title><style>${fonts}${BASE_CSS}${css}</style>` +
    (defs ? `<defs>${defs}</defs>` : '') +
    body +
    `</svg>`
  );
}
