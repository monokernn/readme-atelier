import { findIcon, iconPath, socialIcon, stackTitle } from '../icons.js';
import { font } from '../fonts/index.js';
import type { Ctx } from '../types.js';
import { compact, esc, fitSize, grouped, mix, rng, truncate, updatedLabel, wrap } from '../util.js';
import { HALF, PIXEL_ICONS, W, bitmap, card, contributionLine, gridDays, statRows, type Theme } from './shared.js';

const P = {
  ink: '#f6ecff', soft: '#cdb8ff', dim: '#8d76c9', panel: '#1b1140', panel2: '#140c31', edge: '#3a2a74',
  sky: ['#0d0620', '#140a30', '#1c0f41', '#271452', '#351b60', '#47246d'], far: '#1b1238', near: '#0b0519',
};
const ICON_PAL = { y: '#ffd27a', w: '#f6ecff', c: '#6ee7ff', r: '#ff6fb1', p: '#b48cff', g: '#7dffb0', b: '#6ee7ff' };
const SK = 0.86; // Silkscreen advance factor
const PX = 0.56; // Pixelify advance factor
const FONTS = ['silkscreen400', 'pixelify400'] as ('silkscreen400' | 'pixelify400')[];

const MOON = ['....mmmm....', '..mmmmmmmm..', '.mmmmmmcmmm.', '.mmcmmmmmmm.', 'mmmmmmmmmmmm', 'mmmmmmmmcmmm', 'mmmmcmmmmmmm', 'mmmmmmmmmmmm', '.mmmmmmcmmm.', '.mmcmmmmmmm.', '..mmmmmmmm..', '....mmmm....'];
const ARROW = ['p...', 'pp..', 'ppp.', 'pppp', 'ppp.', 'pp..', 'p...'];
const STAR = ['..y..', '..y..', 'yyyyy', '.yyy.', 'y...y'];

function css(accent: string) {
  return `
.__h{${font('silkscreen400', 14)};fill:${P.ink}}
.__p{${font('pixelify400', 14)};fill:${P.ink}}
.__tw{animation:__tw 2.6s steps(2) infinite}
@keyframes __tw{50%{opacity:.15}}
.__fl{animation:__fl 3.7s steps(1) infinite}
@keyframes __fl{0%,100%{opacity:1}42%{opacity:.25}46%{opacity:1}71%{opacity:.4}73%{opacity:1}}
.__neon{animation:__neon 4s steps(1) infinite}
@keyframes __neon{0%,100%{opacity:1}12%{opacity:.4}14%{opacity:1}60%{opacity:.85}}
.__car{animation:__car 11s linear infinite}
.__car2{animation:__car2 14s linear infinite}
@keyframes __car{from{transform:translateX(-40px)}to{transform:translateX(880px)}}
@keyframes __car2{from{transform:translateX(880px)}to{transform:translateX(-40px)}}
.__blink{animation:__blink 1s steps(1) infinite}
@keyframes __blink{50%{opacity:0}}
.__acc{fill:${accent}}`;
}

const DEFS = `<filter id="__glow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

/** Notched pixel box with a 4px border. */
function box(x: number, y: number, w: number, h: number, border: string, fill: string, b = 4) {
  return (
    `<rect x="${x + b}" y="${y}" width="${w - 2 * b}" height="${h}" fill="${border}"/>` +
    `<rect x="${x}" y="${y + b}" width="${w}" height="${h - 2 * b}" fill="${border}"/>` +
    `<rect x="${x + b}" y="${y + b}" width="${w - 2 * b}" height="${h - 2 * b}" fill="${fill}"/>`
  );
}

/** RPG dialog panel used by the small cards. */
function dialog(c: Ctx, w: number, h: number, title: string, inner: string) {
  return {
    fonts: FONTS,
    css: css(c.accent),
    defs: DEFS,
    body:
      `<g shape-rendering="crispEdges">` +
      box(0, 0, w, h, P.ink, P.edge) +
      box(4, 4, w - 8, h - 8, P.panel2, P.panel) +
      `<rect x="12" y="12" width="${w - 24}" height="4" fill="${mix(P.panel, '#ffffff', 0.06)}"/>` +
      `</g>` +
      (title ? `<text x="24" y="38" class="__h __acc" style="font-size:13px">${esc(title)}</text><rect x="24" y="46" width="${Math.round(title.length * 13 * SK)}" height="2" class="__acc" opacity=".5"/>` : '') +
      inner,
  };
}

export const pixel: Theme = {
  id: 'pixel',
  name: 'Lofi Night',
  blurb: 'A pixel-art city at night — every building is a week of your commits.',
  accent: '#ff6fb1',
  schemes: ['dark'],

  header(c) {
    const p = c.p;
    const H = 300;
    const r = rng(p.login + 'pixel');
    let sky = '';
    let y = 0;
    P.sky.forEach((col, i) => {
      const bh = i === P.sky.length - 1 ? H - y : 40;
      sky += `<rect y="${y}" width="${W}" height="${bh}" fill="${col}"/>`;
      if (i < P.sky.length - 1) for (let x = (i % 2) * 4; x < W; x += 8) sky += `<rect x="${x}" y="${y + bh - 4}" width="4" height="4" fill="${P.sky[i + 1]}"/>`;
      y += bh;
    });
    let stars = '';
    for (let i = 0; i < 60; i++) stars += `<rect class="${r.chance(0.5) ? '__tw' : ''}" style="animation-delay:${r.range(0, 2.6).toFixed(2)}s" x="${r.int(0, 209) * 4}" y="${r.int(0, 30) * 4}" width="${r.chance(0.2) ? 4 : 2}" height="${r.chance(0.2) ? 4 : 2}" fill="${r.chance(0.2) ? '#ffe9a8' : '#ffffff'}"/>`;

    // far skyline
    let far = '';
    for (let x = 0; x < W; ) {
      const bw = r.int(6, 14) * 4;
      const bh = r.int(14, 36) * 4;
      far += `<rect x="${x}" y="${H - 16 - bh}" width="${bw}" height="${bh}" fill="${P.far}"/>`;
      for (let wy = H - 16 - bh + 8; wy < H - 24; wy += 12)
        for (let wx = x + 4; wx < x + bw - 4; wx += 8)
          if (r.chance(0.12)) far += `<rect x="${wx}" y="${wy}" width="4" height="4" fill="#4a3a86"/>`;
      x += bw + r.int(0, 2) * 4;
    }

    // near skyline from weekly contributions
    const days = gridDays(c);
    const weekly: number[] = [];
    for (let i = 0; i < days.length; i += 7) weekly.push(days.slice(i, i + 7).reduce((s, d) => s + d.count, 0));
    const wmax = Math.max(...weekly, 1);
    let near = '';
    let tallest = { x: 0, w: 0, top: H };
    let x = 0;
    let wi = 0;
    while (x < W) {
      const bw = r.int(7, 15) * 4;
      const span = Math.max(1, Math.round((bw / W) * weekly.length));
      const slice = weekly.slice(wi, wi + span);
      wi += span;
      const norm = slice.length ? Math.max(...slice) / wmax : r.range(0, 0.3);
      const bh = Math.round((44 + norm * 136 + r.range(-8, 8)) / 4) * 4;
      const top = H - 16 - bh;
      near += `<rect x="${x}" y="${top}" width="${bw}" height="${bh}" fill="${P.near}"/><rect x="${x}" y="${top}" width="4" height="${bh}" fill="#160c2e"/>`;
      for (let wy = top + 8; wy < H - 24; wy += 12)
        for (let wx = x + 8; wx < x + bw - 4; wx += 8) {
          if (r.chance(0.12 + norm * 0.55)) {
            const col = r.pick(['#ffd27a', '#ffd27a', '#ffb35c', '#fff1b8', '#9ee7ff']);
            near += `<rect class="${r.chance(0.06) ? '__fl' : ''}" style="animation-delay:${r.range(0, 3).toFixed(1)}s" x="${wx}" y="${wy}" width="4" height="${r.chance(0.5) ? 4 : 8}" fill="${col}"/>`;
          } else near += `<rect x="${wx}" y="${wy}" width="4" height="4" fill="#1d1338"/>`;
        }
      if (r.chance(0.3)) near += `<rect x="${x + bw / 2}" y="${top - 16}" width="2" height="16" fill="${P.near}"/><rect class="__blink" x="${x + bw / 2 - 1}" y="${top - 20}" width="4" height="4" fill="#ff4d6d"/>`;
      else if (r.chance(0.25)) near += `<rect x="${x + 8}" y="${top - 12}" width="16" height="12" fill="${P.near}"/><rect x="${x + 12}" y="${top - 16}" width="8" height="4" fill="${P.near}"/>`;
      if (top < tallest.top && x > 360 && x < W - 120) tallest = { x, w: bw, top };
      x += bw;
    }
    const sign = truncate(p.login.toUpperCase(), 14);
    const sw = Math.round(sign.length * 11 * SK) + 16;
    const sx = Math.min(W - sw - 8, Math.max(8, tallest.x + tallest.w / 2 - sw / 2));
    const neon =
      `<rect x="${sx + 8}" y="${tallest.top - 8}" width="2" height="8" fill="#2a1f4d"/><rect x="${sx + sw - 10}" y="${tallest.top - 8}" width="2" height="8" fill="#2a1f4d"/>` +
      `<g class="__neon"><rect x="${sx}" y="${tallest.top - 30}" width="${sw}" height="22" fill="#12051f" stroke="${c.accent}" stroke-width="2"/>` +
      `<text x="${sx + sw / 2}" y="${tallest.top - 14}" text-anchor="middle" class="__h __acc" style="font-size:11px" filter="url(#__glow)">${esc(sign)}</text></g>`;

    const street =
      `<rect y="${H - 16}" width="${W}" height="16" fill="#07030f"/>` +
      Array.from({ length: 21 }, (_, i) => `<rect x="${i * 40 + 8}" y="${H - 9}" width="16" height="2" fill="#3a2a5a"/>`).join('') +
      `<g class="__car"><rect x="0" y="${H - 14}" width="20" height="6" fill="#6ee7ff"/><rect x="4" y="${H - 18}" width="10" height="4" fill="#3aa7c4"/><rect x="20" y="${H - 12}" width="4" height="2" fill="#fff1b8"/><rect x="24" y="${H - 12}" width="40" height="2" fill="#fff1b8" opacity=".15"/></g>` +
      `<g class="__car2"><rect x="0" y="${H - 8}" width="20" height="6" fill="${c.accent}"/><rect x="6" y="${H - 12}" width="10" height="4" fill="${mix(c.accent, '#000', 0.3)}"/><rect x="20" y="${H - 6}" width="2" height="2" fill="#ff4d6d"/></g>`;

    const size = fitSize(c.name.toUpperCase(), 40, 520, SK, 18);
    let text =
      `<text x="28" y="72" class="__h" style="font-size:${size}px">${esc(c.name)}</text>`;
    let ty = 104;
    for (const l of wrap(c.tagline, 52, 2)) {
      text += `<text x="28" y="${ty}" class="__p" style="font-size:16px">${esc(l)}</text>`;
      ty += 22;
    }
    c.about.slice(0, 3).forEach((l, i) => {
      text += `<g>${bitmap(ARROW, { p: c.accent }, 28, ty - 9 + i * 20, 1.4)}<text x="40" y="${ty + i * 20}" class="__p" style="font-size:13.5px;fill:${P.soft}">${esc(truncate(l, 64))}</text></g>`;
    });
    const capText = `CITY BUILT FROM ${grouped(p.stats.contributions)} CONTRIBUTIONS`;
    const caption = `<rect x="${W - 32 - capText.length * 8 * SK}" y="${H - 38}" width="${capText.length * 8 * SK + 16}" height="18" fill="#07030f" opacity=".8"/><text x="${W - 24}" y="${H - 25}" text-anchor="end" class="__h" style="font-size:8px;fill:${P.dim}">CITY BUILT FROM ${grouped(p.stats.contributions)} CONTRIBUTIONS</text>`;

    const body =
      `<g shape-rendering="crispEdges">${sky}${stars}` +
      `<circle cx="728" cy="64" r="64" fill="#ffe9a8" opacity=".06"/>` +
      bitmap(MOON, { m: '#fff3c4', c: '#e3d199' }, 704, 40, 4) +
      far + near + street + `</g>` +
      neon +
      `<rect width="${W}" height="${Math.max(ty + 70, 150)}" fill="url(#__fade)"/>` +
      text +
      caption;
    return card(W, H, `${c.name} — GitHub profile`, {
      fonts: FONTS,
      css: css(c.accent),
      defs: DEFS + `<linearGradient id="__fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d0620" stop-opacity=".75"/><stop offset=".55" stop-color="#0d0620" stop-opacity=".25"/><stop offset=".8" stop-color="#0d0620" stop-opacity="0"/></linearGradient>`,
      radius: 0,
      body,
    });
  },

  stats(c) {
    let inner = '';
    statRows(c).forEach((s, i) => {
      const y = 74 + i * 25;
      inner += bitmap(PIXEL_ICONS[s.key], ICON_PAL, 24, y - 14, 2);
      inner += `<text x="50" y="${y}" class="__p" style="font-size:14px">${esc(s.label)}</text>`;
      inner += `<text x="${HALF - 24}" y="${y}" text-anchor="end" class="__h" style="font-size:13px;fill:#ffd27a">${grouped(s.value)}</text>`;
    });
    inner += `<g class="__blink">${bitmap(['ppppp', '.ppp.', '..p..'], { p: c.accent }, HALF - 34, 214, 2)}</g>`;
    return card(HALF, 232, 'GitHub stats', dialog(c, HALF, 232, 'STATS', inner));
  },

  languages(c) {
    const langs = c.p.languages.slice(0, 6);
    const max = Math.max(...langs.map((l) => l.pct), 1);
    let inner = langs.length ? '' : `<text x="24" y="80" class="__p">No public code yet</text>`;
    langs.forEach((l, i) => {
      const y = 74 + i * 25;
      const filled = Math.max(1, Math.round((l.pct / max) * 15));
      inner += `<text x="24" y="${y}" class="__p" style="font-size:14px">${esc(truncate(l.name, 12))}</text>`;
      let segs = '';
      for (let k = 0; k < 15; k++) segs += `<rect x="${140 + k * 12}" y="${y - 11}" width="10" height="12" fill="${k < filled ? l.color : '#2a1f55'}"/>${k < filled ? `<rect x="${140 + k * 12}" y="${y - 11}" width="10" height="3" fill="#fff" opacity=".35"/>` : ''}`;
      inner += `<g shape-rendering="crispEdges">${segs}</g>`;
      inner += `<text x="${HALF - 24}" y="${y}" text-anchor="end" class="__h" style="font-size:10px;fill:${P.soft}">${Math.round(l.pct)}%</text>`;
    });
    return card(HALF, 232, 'Top languages', dialog(c, HALF, 232, 'LANGUAGES', inner));
  },

  activity(c) {
    const days = gridDays(c);
    const fills = ['#241a45', '#6a4a26', '#b5803a', '#ffc15e', '#fff1b8'];
    const r = rng(c.p.login + 'act');
    let cells = '';
    days.forEach((d, i) => {
      const cls = d.level === 4 && r.chance(0.15) ? ' class="__fl"' : '';
      cells += `<rect${cls} x="${28 + Math.floor(i / 7) * 15}" y="${62 + (i % 7) * 15}" width="12" height="12" fill="${fills[d.level]}"/>`;
    });
    const inner = `<g shape-rendering="crispEdges">${cells}</g><text x="28" y="200" class="__p" style="font-size:14px;fill:${P.soft}">${esc(contributionLine(c))}</text>`;
    return card(W, 224, 'Contribution activity', dialog(c, W, 224, 'NIGHT SHIFT · LAST 12 MONTHS', inner));
  },

  repo(c, r) {
    let inner = bitmap(ARROW, { p: c.accent }, 24, 25, 2) + `<text x="40" y="38" class="__h" style="font-size:${fitSize(r.name.toUpperCase(), 13, 330, SK, 9)}px">${esc(truncate(r.name, 30))}</text>`;
    wrap(r.description || 'No description yet.', 46, 2).forEach((l, i) => {
      inner += `<text x="24" y="${66 + i * 18}" class="__p" style="font-size:13px;fill:${P.soft}">${esc(l)}</text>`;
    });
    inner += `<g shape-rendering="crispEdges">${bitmap(STAR, ICON_PAL, 24, 112, 2)}</g><text x="40" y="122" class="__h" style="font-size:11px;fill:#ffd27a">${compact(r.stars)}</text>`;
    const fx = 56 + compact(r.stars).length * 10;
    inner += `<text x="${fx}" y="122" class="__h" style="font-size:11px;fill:${P.soft}">FORK ${compact(r.forks)}</text>`;
    if (r.language) {
      const lx = fx + 30 + (compact(r.forks).length + 5) * 9;
      inner += `<rect x="${lx}" y="112" width="10" height="10" fill="${r.language.color}"/><text x="${lx + 16}" y="122" class="__p" style="font-size:13px">${esc(r.language.name)}</text>`;
    }
    return card(HALF, 144, r.name, dialog(c, HALF, 144, '', inner));
  },

  stack(c) {
    const items = c.c.stack ?? [];
    const per = 11;
    const rows = Math.max(1, Math.ceil(items.length / per));
    const h = 64 + rows * 78;
    let inner = '';
    items.forEach((s, i) => {
      const x = 26 + (i % per) * 72;
      const y = 60 + Math.floor(i / per) * 78;
      const icon = findIcon(s);
      inner += `<g shape-rendering="crispEdges">${box(x + 10, y, 48, 48, P.edge, '#24185a')}</g>`;
      inner += icon ? iconPath(icon, x + 22, y + 12, 24, `fill="${P.ink}"`) : `<text x="${x + 34}" y="${y + 32}" text-anchor="middle" class="__h">${esc(s.slice(0, 1).toUpperCase())}</text>`;
      inner += `<text x="${x + 34}" y="${y + 66}" text-anchor="middle" class="__p" style="font-size:11.5px;fill:${P.soft}">${esc(truncate(stackTitle(s), 11))}</text>`;
    });
    return card(W, h, 'Tech stack', dialog(c, W, h, 'INVENTORY', inner));
  },

  social(c, s) {
    const icon = socialIcon(s.kind);
    const text = truncate(s.label.toUpperCase(), 24);
    const w = Math.round(44 + text.length * 10 * SK + 18);
    return card(w, 36, s.kind, {
      fonts: ['silkscreen400'],
      css: `.__t{${font('silkscreen400', 10)};fill:#fff}`,
      body:
        `<g shape-rendering="crispEdges">${box(0, 0, w, 36, '#12051f', c.accent)}` +
        `<rect x="4" y="4" width="${w - 8}" height="4" fill="#fff" opacity=".35"/><rect x="4" y="28" width="${w - 8}" height="4" fill="#000" opacity=".25"/></g>` +
        iconPath(icon, 14, 10, 16, 'fill="#fff"') +
        `<text x="40" y="22.5" class="__t">${esc(text)}</text>`,
    });
  },

  footer(c) {
    const H = 56;
    const body =
      `<g shape-rendering="crispEdges"><rect width="${W}" height="${H}" fill="#07030f"/>` +
      Array.from({ length: 21 }, (_, i) => `<rect x="${i * 40 + 8}" y="${H - 14}" width="16" height="2" fill="#3a2a5a"/>`).join('') +
      `<g class="__car"><rect x="0" y="${H - 22}" width="20" height="6" fill="#6ee7ff"/><rect x="4" y="${H - 26}" width="10" height="4" fill="#3aa7c4"/><rect x="20" y="${H - 20}" width="4" height="2" fill="#fff1b8"/></g></g>` +
      `<text x="${W / 2}" y="24" text-anchor="middle" class="__h" style="font-size:9px;fill:${P.dim}">SAVED ${updatedLabel(c.p.fetchedAt)} · README ATELIER</text>`;
    return card(W, H, 'Footer', { fonts: ['silkscreen400'], css: css(c.accent), body });
  },
};

void PX;
