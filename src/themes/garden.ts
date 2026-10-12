import { findIcon, iconPath, socialIcon, stackTitle } from '../icons.js';
import { font } from '../fonts/index.js';
import type { Ctx } from '../types.js';
import { compact, esc, fitSize, grouped, mix, rng, truncate, updatedLabel, wrap } from '../util.js';
import { HALF, W, card, fork, gridDays, star, statRows, type Theme } from './shared.js';

const G = {
  ink: '#2c3a28', soft: '#66755e', paper: '#fffaf0', edge: '#e8dcc2', grass: '#7cc56b', grassD: '#4f9a4f', grassL: '#a9de82',
  dirt: '#a8714a', dirtD: '#7a4c31', trunk: '#8a5a3b', sky1: '#cde8ff', sky2: '#fff1dc',
};
const FONTS = ['fraunces700i', 'fraunces400', 'sans400'] as ('fraunces700i' | 'fraunces400' | 'sans400')[];
const FR = 0.52;
const PETALS = ['#ff8fb3', '#ffd75e', '#ffffff', '#b69cff', '#ff9f6b'];

function css(accent: string) {
  return `
.__h{${font('fraunces700i', 22)};fill:${G.ink}}
.__n{${font('fraunces400', 30)};fill:${G.ink}}
.__s{${font('sans400', 12)};fill:${G.ink}}
.__soft{fill:${G.soft}}
.__acc{fill:${accent}}
.__sway{transform-box:fill-box;transform-origin:50% 100%;animation:__sway 4.5s ease-in-out infinite alternate}
@keyframes __sway{from{transform:rotate(-2.2deg)}to{transform:rotate(2.2deg)}}
.__bob{animation:__bob 5s ease-in-out infinite alternate}
@keyframes __bob{to{transform:translateY(-7px)}}
.__drift{animation:__drift 40s linear infinite alternate}
@keyframes __drift{to{transform:translateX(-60px)}}
.__smoke{animation:__smoke 4s ease-out infinite;opacity:0}
@keyframes __smoke{0%{transform:translate(0,0) scale(.6);opacity:0}20%{opacity:.7}100%{transform:translate(14px,-46px) scale(1.6);opacity:0}}
.__flap{transform-box:fill-box;transform-origin:center;animation:__flap .35s ease-in-out infinite alternate}
@keyframes __flap{to{transform:scaleX(.25)}}
.__fall{animation:__fall .9s linear infinite}
@keyframes __fall{to{stroke-dashoffset:-24}}
.__grow{transform-box:fill-box;transform-origin:50% 100%;animation:__grow 1s cubic-bezier(.2,.9,.3,1.3) both}
@keyframes __grow{from{transform:scale(0)}}`;
}

/** Five-petal flower centered at (x, y). */
function flower(x: number, y: number, r: number, color: string) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    s += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${(r * 0.8).toFixed(1)}" fill="${color}"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="${(r * 0.6).toFixed(1)}" fill="#ffc93c"/>`;
}

function tree(x: number, y: number, s: number, r: ReturnType<typeof rng>, delay: number) {
  const th = 16 + s * 22;
  const cr = 12 + s * 16;
  const greens = [G.grassD, G.grass, G.grassL];
  let canopy = '';
  const blobs: [number, number, number][] = [[0, 0, 1], [-0.7, 0.35, 0.75], [0.7, 0.3, 0.8], [0, -0.55, 0.7]];
  blobs.forEach(([dx, dy, k], i) => {
    canopy += `<circle cx="${(x + dx * cr).toFixed(1)}" cy="${(y - th - cr * 0.6 + dy * cr).toFixed(1)}" r="${(cr * k).toFixed(1)}" fill="${greens[(i + r.int(0, 2)) % 3]}"/>`;
  });
  if (s > 0.55) canopy += flower(x + cr * 0.4, y - th - cr * 0.9, 2.2, '#ff8fb3') + flower(x - cr * 0.5, y - th - cr * 0.4, 2.2, '#fff');
  return `<g class="__sway" style="animation-delay:-${delay.toFixed(2)}s"><rect x="${x - 3 - s * 2}" y="${y - th}" width="${6 + s * 4}" height="${th + 4}" rx="2" fill="${G.trunk}"/>${canopy}</g>`;
}

function paper(c: Ctx, w: number, h: number, title: string, inner: string) {
  return {
    fonts: FONTS,
    css: css(c.accent),
    radius: 20,
    body:
      `<rect width="${w}" height="${h}" fill="${G.paper}"/>` +
      `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="19" stroke="${G.edge}" stroke-width="2"/>` +
      `<g transform="translate(${w - 46} 14)"><path d="M0 22C2 8 14 0 30 2 28 16 16 24 0 22Z" fill="${G.grass}"/><path d="M2 21C10 14 18 9 27 5" stroke="${G.grassD}" stroke-width="1.4" fill="none"/></g>` +
      (title ? `<text x="24" y="42" class="__h" style="font-size:21px">${esc(title)}</text>` : '') +
      inner,
  };
}

export const garden: Theme = {
  id: 'garden',
  name: 'Garden',
  blurb: 'A floating island that grows with you. Repos become trees, contributions become flowers.',
  accent: '#ff8fb3',
  schemes: ['light'],

  header(c) {
    const p = c.p;
    const H = 340;
    const r = rng(p.login + 'garden');
    const CX = 610;
    const CY = 214;
    const RX = 200;
    const RY = 32;
    const topY = (x: number) => CY - RY * Math.sqrt(Math.max(0, 1 - ((x - CX) / RX) ** 2));

    let cloudsSvg = '';
    for (let i = 0; i < 5; i++) {
      const x = r.range(0, W);
      const y = r.range(30, 150);
      const s = r.range(0.6, 1.2);
      cloudsSvg += `<g class="__drift" style="animation-delay:-${r.range(0, 30).toFixed(1)}s" fill="#fff" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="${34 * s}" ry="${12 * s}"/><circle cx="${x - 10 * s}" cy="${y - 8 * s}" r="${13 * s}"/><circle cx="${x + 12 * s}" cy="${y - 10 * s}" r="${16 * s}"/></g>`;
    }

    // underside of the island
    let under = `M${CX - RX} ${CY}`;
    const n = 14;
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = CX - RX + t * 2 * RX;
      const depth = Math.sin(t * Math.PI) * 110 * (0.75 + r.range(0, 0.35));
      under += ` L${x.toFixed(1)} ${(CY + 8 + depth).toFixed(1)}`;
    }
    under += ` L${CX + RX} ${CY} Z`;
    let strata = '';
    for (let i = 0; i < 4; i++) strata += `<path d="M${CX - RX + 30 + i * 18} ${CY + 22 + i * 16} Q${CX} ${CY + 40 + i * 22} ${CX + RX - 30 - i * 18} ${CY + 22 + i * 16}" stroke="${G.dirtD}" stroke-width="2" fill="none" opacity=".5"/>`;
    let roots = '';
    for (let i = 0; i < 6; i++) {
      const x = r.range(CX - 150, CX + 150);
      roots += `<path d="M${x.toFixed(0)} ${CY + 60} q${r.range(-12, 12).toFixed(0)} ${r.range(30, 60).toFixed(0)} ${r.range(-6, 6).toFixed(0)} ${r.range(50, 90).toFixed(0)}" stroke="${G.grassD}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`;
    }

    // trees from featured repos
    const repos = p.repos.slice(0, 6);
    const maxStars = Math.max(...repos.map((x) => x.stars), 1);
    const treeCount = Math.max(3, repos.length + 1);
    let trees = '';
    for (let i = 0; i < treeCount; i++) {
      const x = CX - RX + 70 + (i / Math.max(1, treeCount - 1)) * (2 * RX - 140) + r.range(-10, 10);
      if (Math.abs(x - (CX - 80)) < 34) continue; // leave room for the house
      const s = repos[i] ? 0.3 + 0.7 * Math.sqrt(repos[i].stars / maxStars) : r.range(0.2, 0.45);
      trees += tree(x, topY(x) + 10, s, r, r.range(0, 4));
    }

    // flowers from contributions
    const fcount = Math.min(46, 8 + Math.round(p.stats.contributions / 35));
    let flowers = '';
    for (let i = 0; i < fcount; i++) {
      const x = r.range(CX - RX + 26, CX + RX - 26);
      const yTop = topY(x) + 6;
      const y = r.range(yTop, CY + RY - 8);
      flowers += `<g class="__grow" style="animation-delay:${(0.3 + i * 0.03).toFixed(2)}s"><line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="${(y + 6).toFixed(1)}" stroke="${G.grassD}" stroke-width="1.2"/>${flower(+x.toFixed(1), +y.toFixed(1), r.range(1.8, 2.8), i % 4 === 0 ? c.accent : r.pick(PETALS))}</g>`;
    }

    const hx = CX - 80;
    const hy = topY(hx) + 12;
    const house =
      `<g><rect x="${hx - 22}" y="${hy - 30}" width="44" height="30" rx="2" fill="#fff4dd" stroke="${G.dirtD}" stroke-width="1.5"/>` +
      `<path d="M${hx - 29} ${hy - 28}L${hx} ${hy - 52}L${hx + 29} ${hy - 28}Z" fill="#d8644a" stroke="${G.dirtD}" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<rect x="${hx + 10}" y="${hy - 56}" width="7" height="14" fill="#a94c38"/>` +
      `<rect x="${hx - 15}" y="${hy - 22}" width="11" height="10" rx="1" fill="#ffd75e"/><rect x="${hx + 4}" y="${hy - 18}" width="10" height="18" rx="1" fill="${G.trunk}"/>` +
      [0, 1.3, 2.6].map((d) => `<circle class="__smoke" style="animation-delay:${d}s" cx="${hx + 13.5}" cy="${hy - 60}" r="5" fill="#fff"/>`).join('') +
      `</g>`;

    const fx = CX + RX - 36;
    const fall =
      `<rect x="${fx}" y="${topY(fx) + 4}" width="10" height="${H - topY(fx)}" fill="#bfe6ff" opacity=".85"/>` +
      `<line x1="${fx + 3}" x2="${fx + 3}" y1="${topY(fx) + 4}" y2="${H}" stroke="#fff" stroke-width="2" stroke-dasharray="8 16" class="__fall"/>` +
      `<line x1="${fx + 7}" x2="${fx + 7}" y1="${topY(fx) + 10}" y2="${H}" stroke="#fff" stroke-width="1.5" stroke-dasharray="5 19" class="__fall" style="animation-duration:1.3s"/>`;

    // butterflies fly along CSS keyframe waypoints (no SMIL, so they never get stuck at the origin)
    const bfly = (id: string, pts: [number, number][], col: string, dur: number) => {
      const frames = pts.map(([x, y], i) => `${Math.round((i / (pts.length - 1)) * 100)}%{transform:translate(${x}px,${y}px)}`).join('');
      return `<style>.__${id}{transform:translate(${pts[0][0]}px,${pts[0][1]}px);animation:__${id} ${dur}s ease-in-out infinite}@keyframes __${id}{${frames}}</style>` +
        `<g class="__${id}"><g class="__flap"><path d="M0 0C-7-8-11 2-2 3ZM0 0C7-8 11 2 2 3Z" fill="${col}"/></g></g>`;
    };
    const butterflies =
      bfly('bf1', [[CX - 150, CY - 70], [CX - 60, CY - 130], [CX + 60, CY - 60], [CX + 170, CY - 100], [CX + 20, CY - 150], [CX - 150, CY - 70]], c.accent, 16) +
      bfly('bf2', [[CX + 130, CY - 120], [CX + 20, CY - 70], [CX - 110, CY - 140], [CX - 30, CY - 90], [CX + 200, CY - 70], [CX + 130, CY - 120]], '#ffd75e', 21);

    const island =
      `<g class="__bob">` +
      fall +
      `<path d="${under}" fill="${G.dirt}"/>` + strata + roots +
      `<ellipse cx="${CX}" cy="${CY}" rx="${RX}" ry="${RY}" fill="${G.grass}"/>` +
      `<path d="M${CX - RX} ${CY} A${RX} ${RY} 0 0 0 ${CX + RX} ${CY} L${CX + RX - 4} ${CY + 10} A${RX - 4} ${RY} 0 0 1 ${CX - RX + 4} ${CY + 10}Z" fill="${G.grassD}"/>` +
      house + trees + flowers +
      `</g>`;

    const size = fitSize(c.name, 56, 400, FR, 24);
    let text = `<text x="36" y="58" class="__s __soft" style="font-size:11.5px;letter-spacing:.06em">+ THE GARDEN OF @${esc(p.login.toUpperCase())}</text>`;
    text += `<text x="34" y="118" class="__h" style="font-size:${size}px">${esc(c.name)}</text>`;
    let ty = 152;
    for (const l of wrap(c.tagline, 38, 2)) {
      text += `<text x="36" y="${ty}" class="__n" style="font-size:18px;fill:${G.soft}">${esc(l)}</text>`;
      ty += 24;
    }
    ty += 6;
    c.about.slice(0, 3).forEach((l) => {
      text += `<text x="36" y="${ty}" class="__s" style="font-size:12.5px">${flowerDot()} ${esc(truncate(l, 50))}</text>`;
      ty += 19;
    });
    const chip = `${treeCount} trees · ${grouped(fcount)} flowers · ${p.streak.longest}-day streak`;
    const cw = chip.length * 6.4 + 28;
    text += `<rect x="34" y="${H - 52}" width="${cw}" height="28" rx="14" fill="#fffaf0" opacity=".85" stroke="${G.edge}"/><text x="48" y="${H - 34}" class="__s" style="font-size:11.5px">${esc(chip)}</text>`;

    const body =
      `<rect width="${W}" height="${H}" fill="url(#__sky)"/>` +
      `<circle cx="${W - 70}" cy="64" r="90" fill="#fff6c9" opacity=".5"/><circle cx="${W - 70}" cy="64" r="34" fill="#fff6c9"/>` +
      cloudsSvg + island + butterflies + text;
    return card(W, H, `${c.name} · GitHub profile`, {
      fonts: FONTS,
      css: css(c.accent),
      radius: 22,
      defs: `<linearGradient id="__sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.sky1}"/><stop offset="1" stop-color="${G.sky2}"/></linearGradient>`,
      body,
    });
  },

  stats(c) {
    const cols = ['#ff8fb3', '#ffd75e', '#b69cff', '#7cc56b', '#ff9f6b', '#8fd3ff'];
    let inner = '';
    statRows(c).forEach((s, i) => {
      const x = 28 + (i % 2) * 188;
      const y = 98 + Math.floor(i / 2) * 50;
      inner += `<g class="__grow" style="animation-delay:${i * 0.08}s">${flower(x + 8, y - 10, 3.6, cols[i])}</g>`;
      inner += `<text x="${x + 24}" y="${y}" class="__n" style="font-size:26px">${grouped(s.value)}</text>`;
      inner += `<text x="${x + 25}" y="${y + 16}" class="__s __soft" style="font-size:10.5px">${esc(s.label)}</text>`;
    });
    return card(HALF, 236, 'GitHub stats', paper(c, HALF, 236, 'The harvest', inner));
  },

  languages(c) {
    const langs = c.p.languages.slice(0, 6);
    const max = Math.max(...langs.map((l) => l.pct), 1);
    let defs = `<g id="__fl">${[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(Math.cos(a) * 3.4).toFixed(2)}" cy="${(Math.sin(a) * 3.4).toFixed(2)}" r="2.8"/>`; }).join('')}<circle r="2" fill="#ffc93c"/></g>`;
    let inner = langs.length ? '' : `<text x="24" y="90" class="__s __soft">Nothing planted yet</text>`;
    langs.forEach((l, i) => {
      const y = 80 + i * 25;
      const k = Math.max(1, Math.round((l.pct / max) * 12));
      inner += `<text x="24" y="${y + 4}" class="__s" style="font-size:12.5px">${esc(truncate(l.name, 14))}</text>`;
      inner += `<line x1="134" x2="${134 + 12 * 16}" y1="${y + 6}" y2="${y + 6}" stroke="${G.edge}" stroke-width="2" stroke-linecap="round"/>`;
      for (let j = 0; j < k; j++) inner += `<use href="#__fl" x="${140 + j * 16}" y="${y}" fill="${l.color}" class="__grow" style="animation-delay:${(i * 0.1 + j * 0.03).toFixed(2)}s"/>`;
      inner += `<text x="${HALF - 24}" y="${y + 4}" text-anchor="end" class="__s __soft" style="font-size:10.5px">${l.pct.toFixed(1)}%</text>`;
    });
    const pp = paper(c, HALF, 236, 'Flower beds', inner);
    return card(HALF, 236, 'Top languages', { ...pp, defs });
  },

  activity(c) {
    const cal = gridDays(c);
    const defs =
      `<g id="__g0"><circle cx="6" cy="6" r="1.8" fill="#e3d3b5"/></g>` +
      `<g id="__g1"><path d="M6 10V6.5M6 7C4 7 3 5.5 3 4.5 5 4.5 6 5.5 6 7ZM6 7C8 7 9 5.5 9 4.5 7 4.5 6 5.5 6 7Z" stroke="${G.grass}" fill="${G.grassL}" stroke-width=".8"/></g>` +
      `<g id="__g2"><path d="M6 11V3.5" stroke="${G.grassD}" stroke-width="1.1"/><path d="M6 7C3 7 2 5 2 3.5 5 3.5 6 5 6 7ZM6 5.5C9 5.5 10 3.5 10 2 7 2 6 3.5 6 5.5Z" fill="${G.grass}"/></g>` +
      `<g id="__g3"><path d="M6 11V5" stroke="${G.grassD}" stroke-width="1.1"/><path d="M6 8.5C3.5 8.5 2.5 7 2.5 6 5 6 6 7 6 8.5Z" fill="${G.grass}"/>${flower(6, 4, 1.6, mix(c.accent, '#ffffff', 0.35))}</g>` +
      `<g id="__g4">${flower(6, 6, 2.5, c.accent)}</g>`;
    let inner = '';
    cal.forEach((d, i) => {
      inner += `<use href="#__g${d.level}" x="${26 + Math.floor(i / 7) * 15}" y="${62 + (i % 7) * 15}"/>`;
    });
    const line = c.p.calendar.length
      ? `${grouped(c.p.stats.contributions)} contributions this year · in bloom for ${days(c.p.streak.current)} · longest bloom ${days(c.p.streak.longest)}`
      : 'the contribution garden needs a GitHub token to grow';
    inner += `<text x="28" y="196" class="__s" style="font-size:12.5px;fill:${G.soft}">${esc(line)}</text>`;
    const pp = paper(c, W, 222, 'Seasons, last twelve months', inner);
    return card(W, 222, 'Contribution activity', { ...pp, defs });
  },

  repo(c, r) {
    const maxS = Math.max(...c.p.repos.map((x) => x.stars), 1);
    const s = 0.25 + 0.75 * Math.sqrt(r.stars / maxS);
    let inner = `<g transform="translate(36 ${78}) scale(.62)">${tree(0, 0, s, rng(r.name), 0)}</g>`;
    inner += `<text x="64" y="44" class="__h" style="font-size:${fitSize(r.name, 19, 290, FR, 12)}px">${esc(truncate(r.name, 30))}</text>`;
    wrap(r.description || 'No description yet.', 44, 2).forEach((l, i) => {
      inner += `<text x="64" y="${68 + i * 16}" class="__s __soft" style="font-size:11.5px">${esc(l)}</text>`;
    });
    let x = 64;
    inner += star(x, 112, 13, `fill="#ffc93c"`) + `<text x="${x + 18}" y="123" class="__s" style="font-size:11.5px">${compact(r.stars)}</text>`;
    x += 30 + compact(r.stars).length * 7;
    inner += fork(x, 111, 13, G.soft) + `<text x="${x + 18}" y="123" class="__s" style="font-size:11.5px">${compact(r.forks)}</text>`;
    x += 32 + compact(r.forks).length * 7;
    if (r.language) inner += `<path transform="translate(${x} 111)" d="M0 12C1 4 7 0 13 1 12 8 7 12 0 12Z" fill="${r.language.color}"/><text x="${x + 18}" y="123" class="__s" style="font-size:11.5px">${esc(r.language.name)}</text>`;
    return card(HALF, 146, r.name, paper(c, HALF, 146, '', inner));
  },

  stack(c) {
    const items = c.c.stack ?? [];
    const per = 8;
    const rows = Math.max(1, Math.ceil(items.length / per));
    const h = 66 + rows * 82;
    const r = rng(c.p.login + 'stones');
    let inner = '';
    items.forEach((s, i) => {
      const cx = 24 + 48 + (i % per) * 99;
      const cy = 92 + Math.floor(i / per) * 82;
      const icon = findIcon(s);
      inner += `<ellipse cx="${cx}" cy="${cy}" rx="${(30 + r.range(-3, 3)).toFixed(1)}" ry="${(22 + r.range(-2, 3)).toFixed(1)}" fill="#efe7d4" stroke="#d9cdb2" stroke-width="1.5" transform="rotate(${r.range(-8, 8).toFixed(1)} ${cx} ${cy})"/>`;
      inner += `<ellipse cx="${cx - 8}" cy="${cy - 9}" rx="10" ry="4" fill="#fff" opacity=".6"/>`;
      inner += icon ? iconPath(icon, cx - 10, cy - 10, 20, `fill="#3f6b3a"`) : `<text x="${cx}" y="${cy + 6}" text-anchor="middle" class="__h" style="font-size:18px">${esc(s.slice(0, 1).toUpperCase())}</text>`;
      inner += `<text x="${cx}" y="${cy + 40}" text-anchor="middle" class="__s" style="font-size:11px;fill:${G.soft}">${esc(truncate(stackTitle(s), 14))}</text>`;
    });
    return card(W, h, 'Tech stack', paper(c, W, h, 'Tools in the shed', inner));
  },

  social(c, s) {
    const icon = socialIcon(s.kind);
    const text = truncate(s.label, 28);
    const w = Math.round(44 + text.length * 12.5 * 0.53 + 20);
    return card(w, 36, s.kind, {
      fonts: ['sans400'],
      css: `.__t{${font('sans400', 12.5)};fill:#fffaf0}`,
      body:
        `<rect x="1" y="1" width="${w - 2}" height="34" rx="17" fill="${G.grassD}" stroke="#3a7a3e" stroke-width="2"/>` +
        `<path d="M10 9C16 5 ${w / 2} 4 ${w - 16} 8" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round" fill="none"/>` +
        iconPath(icon, 15, 10, 16, 'fill="#fffaf0"') +
        `<text x="41" y="22.5" class="__t">${esc(text)}</text>`,
    });
  },

  footer(c) {
    const r = rng(c.p.login + 'meadow');
    let fl = '';
    for (let i = 0; i < 34; i++) {
      const x = r.range(10, W - 10);
      const y = r.range(52, 62);
      fl += `<g class="__sway" style="animation-delay:-${r.range(0, 4).toFixed(1)}s"><line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${y.toFixed(1)}" y2="${(y + 12).toFixed(1)}" stroke="${G.grassD}" stroke-width="1.2"/>${flower(+x.toFixed(1), +y.toFixed(1), 2.4, r.pick(PETALS))}</g>`;
    }
    const body =
      `<rect width="${W}" height="84" fill="url(#__sky)"/>` +
      `<path d="M0 58Q120 44 260 56T540 54T840 52V84H0Z" fill="${G.grass}"/><path d="M0 66Q160 58 320 66T640 64T840 66V84H0Z" fill="${G.grassD}"/>` +
      fl +
      `<text x="${W / 2}" y="32" text-anchor="middle" class="__h" style="font-size:15px">tended daily by Readme Atelier · ${updatedLabel(c.p.fetchedAt)}</text>`;
    return card(W, 84, 'Footer', {
      fonts: ['fraunces700i'],
      css: css(c.accent),
      radius: 20,
      defs: `<linearGradient id="__sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${G.sky1}"/><stop offset="1" stop-color="${G.sky2}"/></linearGradient>`,
      body,
    });
  },
};

function days(n: number) {
  return `${n} ${n === 1 ? 'day' : 'days'}`;
}

function flowerDot() {
  return '·';
}
