import type { Card } from '../card.js';
import type { Ctx, Day, Repo, Scheme, Social, ThemeId } from '../types.js';
import { grouped } from '../util.js';

export const W = 840;
export const HALF = 410;

export interface Theme {
  id: ThemeId;
  name: string;
  /** One-line pitch shown in the gallery */
  blurb: string;
  accent: string;
  /** Color schemes this theme renders. More than one → <picture> with light/dark sources. */
  schemes: Scheme[];
  header(c: Ctx): Card;
  stats(c: Ctx): Card;
  languages(c: Ctx): Card;
  activity(c: Ctx): Card;
  repo(c: Ctx, r: Repo): Card;
  stack(c: Ctx): Card;
  social(c: Ctx, s: Social): Card;
  footer(c: Ctx): Card;
}

/** Always 53 full weeks (371 cells), oldest first, padded with empty days. */
export function gridDays(c: Ctx): Day[] {
  const days = c.p.calendar.slice(-371);
  const pad: Day[] = [];
  while (pad.length + days.length < 371) pad.push({ date: '', count: 0, level: 0 });
  return [...pad, ...days];
}

export interface StatRow {
  key: 'stars' | 'commits' | 'prs' | 'issues' | 'reviews' | 'contributed' | 'repos' | 'followers';
  label: string;
  short: string;
  value: number;
}

export function statRows(c: Ctx): StatRow[] {
  const s = c.p.stats;
  return [
    { key: 'stars', label: 'Stars earned', short: 'stars', value: s.stars },
    { key: 'commits', label: 'Commits · 12 mo', short: 'commits', value: s.commits },
    { key: 'prs', label: 'Pull requests', short: 'pull requests', value: s.prs },
    { key: 'issues', label: 'Issues opened', short: 'issues', value: s.issues },
    { key: 'reviews', label: 'Code reviews', short: 'reviews', value: s.reviews },
    { key: 'contributed', label: 'Contributed to', short: 'contributed to', value: s.contributedTo },
  ];
}

/** Month labels with the column index of the first week that starts in that month. */
export function monthLabels(days: Day[]): { col: number; label: string }[] {
  const out: { col: number; label: string }[] = [];
  let last = -1;
  for (let col = 0; col < Math.ceil(days.length / 7); col++) {
    const d = days[col * 7]?.date || days.slice(col * 7, col * 7 + 7).find((x) => x.date)?.date;
    if (!d) continue;
    const m = new Date(d + 'T00:00:00Z').getUTCMonth();
    if (m !== last) {
      if (col < 52 || out.length === 0) out.push({ col, label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m] });
      last = m;
    }
  }
  // drop a label that would collide with the next one
  return out.filter((m, i) => !out[i + 1] || out[i + 1].col - m.col >= 3);
}

export function contributionLine(c: Ctx): string {
  const p = c.p;
  if (!p.calendar.length) return 'contribution graph needs a GitHub token';
  return `${grouped(p.stats.contributions)} contributions · current streak ${p.streak.current}d · longest ${p.streak.longest}d`;
}

/**
 * Render a pixel bitmap. `rows` are strings of palette keys, `.` is transparent.
 * Horizontal runs of the same color are merged into one rect.
 */
export function bitmap(rows: string[], palette: Record<string, string>, x: number, y: number, s: number): string {
  let out = '';
  rows.forEach((row, j) => {
    let i = 0;
    while (i < row.length) {
      const ch = row[i];
      let k = i;
      while (k < row.length && row[k] === ch) k++;
      if (ch !== '.' && palette[ch]) out += `<rect x="${x + i * s}" y="${y + j * s}" width="${(k - i) * s}" height="${s}" fill="${palette[ch]}"/>`;
      i = k;
    }
  });
  return out;
}

/** 5-point star polygon centered in a `size` box at (x, y). */
export function star(x: number, y: number, size: number, attrs = ''): string {
  const cx = x + size / 2;
  const cy = y + size / 2 + size * 0.04;
  const R = size / 2;
  const r = R * 0.45;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" ${attrs}/>`;
}

/** Git fork glyph (stroke) in a `size` box. */
export function fork(x: number, y: number, size: number, color: string, sw = 1.6): string {
  const s = size / 16;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${sw / s}" stroke-linecap="round"><circle cx="4" cy="3" r="1.8"/><circle cx="12" cy="3" r="1.8"/><circle cx="8" cy="13" r="1.8"/><path d="M4 4.8v1.7c0 1.3 1 2.2 2.2 2.2h3.6c1.2 0 2.2-.9 2.2-2.2V4.8M8 8.7v2.5"/></g>`;
}

/** 8×8 pixel icons for stat rows (pixel + minecraft themes). */
export const PIXEL_ICONS: Record<StatRow['key'], string[]> = {
  stars: ['...y....', '...y....', '..yyy...', 'yyyyyyy.', '.yyyyy..', '..yyy...', '.yy.yy..', '.y...y..'],
  commits: ['...ww...', '..wwww..', '.ww..ww.', 'wwwwwwww', 'wwwwwwww', '.ww..ww.', '..wwww..', '...ww...'],
  prs: ['.c....c.', 'ccc..cc.', '.c..c.c.', '.c....c.', '.c....c.', '.c....c.', 'ccc..ccc', '.c....c.'],
  issues: ['..rrrr..', '.r....r.', 'r..rr..r', 'r..rr..r', 'r..rr..r', 'r......r', '.r.rr.r.', '..rrrr..'],
  reviews: ['........', '..pppp..', '.p....p.', 'p..pp..p', 'p..pp..p', '.p....p.', '..pppp..', '........'],
  contributed: ['..gggg..', '.g....g.', 'g..g...g', 'g...g..g', 'g..g...g', 'g....g.g', '.g....g.', '..gggg..'],
  repos: ['bbbbbbb.', 'b.....b.', 'b.bbb.b.', 'b.....b.', 'b.bbb.b.', 'b.....b.', 'bbbbbbb.', '........'],
  followers: ['.rr..rr.', 'rrrrrrrr', 'rrrrrrrr', 'rrrrrrrr', '.rrrrrr.', '..rrrr..', '...rr...', '........'],
};

export function card(w: number, h: number, title: string, parts: Partial<Card> & { body: string }): Card {
  return { w, h, title, fonts: [], ...parts };
}
