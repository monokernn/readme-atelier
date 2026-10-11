import { findIcon, iconPath, socialIcon, stackTitle } from '../icons.js';
import { font } from '../fonts/index.js';
import type { Ctx } from '../types.js';
import { compact, esc, fitSize, grouped, luminance, mix, rng, truncate, updatedLabel, wrap } from '../util.js';
import { HALF, PIXEL_ICONS, W, bitmap, card, contributionLine, gridDays, star, statRows, type Theme } from './shared.js';

// Original blocky textures drawn for this project (8×8, palette keyed).
const TEX: Record<string, { rows: string[]; pal: Record<string, string> }> = {
  grassSide: {
    rows: ['gGgggGgg', 'ggGgGggG', 'gdgGdgdg', 'dddDdddd', 'dDddddDd', 'ddddDddd', 'dDdddddD', 'dddDdddd'],
    pal: { g: '#5d9c3a', G: '#7cbd4a', d: '#866043', D: '#6b4a30' },
  },
  dirt: {
    rows: ['dddDdddd', 'dDddddDd', 'ddddDddd', 'dDdddddD', 'dddDdddd', 'ddDdddDd', 'Dddddddd', 'dddDdDdd'],
    pal: { d: '#866043', D: '#6b4a30' },
  },
  stone: {
    rows: ['sssSssts', 'stssssSs', 'sssSssss', 'Ssssstss', 'sssssSss', 'ssSsssss', 'stsssSst', 'ssssSsss'],
    pal: { s: '#7d7d7d', S: '#666666', t: '#959595' },
  },
  gold: {
    rows: ['sssSssts', 'syYssSss', 'sYyssyss', 'Ssssyyss', 'ssyssYss', 'sYyssssy', 'stssyYst', 'ssssSsss'],
    pal: { s: '#7d7d7d', S: '#666666', t: '#959595', y: '#fcee4b', Y: '#c9a52a' },
  },
  diamond: {
    rows: ['sssSssts', 'scCssSss', 'sCcsscss', 'Ssssccss', 'sscssCss', 'sCcsssscc', 'stsscCst', 'ssssSsss'].map((r) => r.slice(0, 8)),
    pal: { s: '#7d7d7d', S: '#666666', t: '#959595', c: '#62f0f5', C: '#1fa8b4' },
  },
  log: {
    rows: ['bBbbbBbb', 'bBbbBbbb', 'bbbbBbBb', 'bBbbbbBb', 'bBbBbbbb', 'bbbBbbBb', 'bBbbbbBb', 'bBbbBbbb'],
    pal: { b: '#6b5232', B: '#4f3b22' },
  },
  leaves: {
    rows: ['lLlmlllL', 'lmlLlmll', 'Llllllml', 'lmLlLlll', 'llllmlLl', 'mlLllllm', 'lllmlLll', 'Llmllllm'],
    pal: { l: '#3f8f2a', L: '#2f6e1f', m: '#59a83a' },
  },
};
const POPPY = ['..rr....', '.rRrr...', '.rrRr...', '..rr....', '...g....', '..gg.g..', '...ggg..', '...g....'];
const DANDELION = ['........', '..yy....', '.yYyy...', '..yy....', '...g....', '...g.g..', '..ggg...', '...g....'];
const FLOWER_PAL = { r: '#e0322d', R: '#a51e1b', y: '#ffe23d', Y: '#d8a613', g: '#4c8f2a' };
const ICON_PAL = { y: '#ffe23d', w: '#ffffff', c: '#62f0f5', r: '#ff5555', p: '#d27dff', g: '#55ff55', b: '#5ec8ff' };

const UI = { face: '#c6c6c6', hi: '#ffffff', sh: '#555555', text: '#3f3f3f', slot: '#8b8b8b', slotSh: '#373737' };
const FONTS = ['pixelify400', 'pixelify700'] as ('pixelify400' | 'pixelify700')[];
const PF = 0.56;

function tex(id: string, name: keyof typeof TEX) {
  const t = TEX[name];
  return `<symbol id="${id}" viewBox="0 0 8 8" shape-rendering="crispEdges">${bitmap(t.rows, t.pal, 0, 0, 1)}</symbol>`;
}

function css(accent: string) {
  return `
.__t{${font('pixelify400', 14)}}
.__tb{${font('pixelify700', 14)}}
.__splash{transform-box:fill-box;transform-origin:center;animation:__splash .55s ease-in-out infinite alternate}
@keyframes __splash{to{transform:scale(1.09)}}
.__drift{animation:__drift 60s linear infinite alternate}
@keyframes __drift{to{transform:translateX(-120px)}}
.__glint{animation:__glint 3.5s linear infinite}
@keyframes __glint{from{transform:translateX(-420px)}to{transform:translateX(520px)}}
.__acc{fill:${accent}}`;
}

/** Text with the classic hard drop shadow (shadow = color at 25%). */
function mc(x: number, y: number, text: string, size: number, color: string, opts: { anchor?: string; bold?: boolean; shadow?: boolean } = {}) {
  const a = opts.anchor ? ` text-anchor="${opts.anchor}"` : '';
  const cls = opts.bold ? '__tb' : '__t';
  const sh = mix(color, '#000000', 0.75);
  const d = Math.max(1, Math.round(size / 8));
  return (
    (opts.shadow === false ? '' : `<text x="${x + d}" y="${y + d}"${a} class="${cls}" style="font-size:${size}px" fill="${sh}">${esc(text)}</text>`) +
    `<text x="${x}" y="${y}"${a} class="${cls}" style="font-size:${size}px" fill="${color}">${esc(text)}</text>`
  );
}

/** Beveled inventory panel. */
function panelBox(w: number, h: number) {
  return (
    `<g shape-rendering="crispEdges">` +
    `<rect x="2" y="0" width="${w - 4}" height="${h}" fill="#000"/><rect x="0" y="2" width="${w}" height="${h - 4}" fill="#000"/>` +
    `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" fill="${UI.face}"/>` +
    `<rect x="2" y="2" width="${w - 6}" height="4" fill="${UI.hi}"/><rect x="2" y="2" width="4" height="${h - 6}" fill="${UI.hi}"/>` +
    `<rect x="4" y="${h - 6}" width="${w - 6}" height="4" fill="${UI.sh}"/><rect x="${w - 6}" y="4" width="4" height="${h - 6}" fill="${UI.sh}"/>` +
    `</g>`
  );
}

function slot(x: number, y: number, s: number) {
  return (
    `<g shape-rendering="crispEdges"><rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${UI.slot}"/>` +
    `<rect x="${x}" y="${y}" width="${s - 2}" height="2" fill="${UI.slotSh}"/><rect x="${x}" y="${y}" width="2" height="${s - 2}" fill="${UI.slotSh}"/>` +
    `<rect x="${x + 2}" y="${y + s - 2}" width="${s - 2}" height="2" fill="${UI.hi}"/><rect x="${x + s - 2}" y="${y + 2}" width="2" height="${s - 2}" fill="${UI.hi}"/></g>`
  );
}

function ui(c: Ctx, w: number, h: number, title: string, inner: string) {
  return {
    fonts: FONTS,
    css: css(c.accent),
    body: panelBox(w, h) + (title ? `<text x="18" y="30" class="__t" style="font-size:15px" fill="${UI.text}">${esc(title)}</text>` : '') + inner,
  };
}

function dirtBg(w: number, h: number) {
  return `<rect width="${w}" height="${h}" fill="url(#__dirt)"/><rect width="${w}" height="${h}" fill="#000" opacity=".55"/>`;
}

const DIRT_PATTERN = `<pattern id="__dirt" width="32" height="32" patternUnits="userSpaceOnUse"><use href="#__tdirt" width="32" height="32"/></pattern>`;

export const minecraft: Theme = {
  id: 'minecraft',
  name: 'Blocky',
  blurb: 'A blocky sandbox world: stone title with a bouncing splash, inventory stats and ore-block activity.',
  accent: '#55ff55',
  schemes: ['dark'],

  header(c) {
    const p = c.p;
    const H = 320;
    const r = rng(p.login + 'mc');
    const B = 32;
    const groundY = 256;
    let clouds = '';
    for (let i = 0; i < 6; i++) {
      const x = r.int(0, 26) * 32;
      const y = r.int(1, 4) * 16;
      const w = r.int(3, 7) * 16;
      clouds += `<g class="__drift" style="animation-delay:-${r.int(0, 50)}s" fill="#fff" opacity=".88"><rect x="${x}" y="${y}" width="${w}" height="16"/><rect x="${x + 16}" y="${y - 12}" width="${w - 40 > 0 ? w - 40 : 16}" height="12"/></g>`;
    }
    let ground = '';
    for (let x = 0; x < W; x += B) {
      ground += `<use href="#__tgs" x="${x}" y="${groundY}" width="${B}" height="${B}"/><use href="#__tdirt" x="${x}" y="${groundY + B}" width="${B}" height="${B}"/>`;
    }
    const treeAt = (tx: number, height: number) => {
      let t = '';
      for (let i = 1; i <= height; i++) t += `<use href="#__tlog" x="${tx}" y="${groundY - i * B}" width="${B}" height="${B}"/>`;
      const top = groundY - height * B;
      const leaves: [number, number][] = [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-1, -2], [0, -2], [1, -2], [0, -3], [-1, -3], [1, -3]];
      for (const [dx, dy] of leaves) if (!(dy >= 0 && dx === 0)) t += `<use href="#__tleaf" x="${tx + dx * B}" y="${top + dy * B}" width="${B}" height="${B}"/>`;
      return t;
    };
    let flowers = '';
    for (let i = 0; i < 9; i++) {
      const fx = r.int(0, 25) * 32 + 4;
      flowers += `<g shape-rendering="crispEdges">${bitmap(r.chance(0.5) ? POPPY : DANDELION, FLOWER_PAL, fx, groundY - 24, 3)}</g>`;
    }
    const size = fitSize(c.name, 62, 500, PF + 0.04, 22);
    const tx = 30;
    const ty = 104;
    let title = '';
    for (let d = 7; d >= 1; d--) title += `<text x="${tx + d * 0.6}" y="${ty + d}" class="__tb" style="font-size:${size}px" fill="${d === 7 ? '#111' : '#3a3a3a'}">${esc(c.name)}</text>`;
    title += `<text x="${tx}" y="${ty}" class="__tb" style="font-size:${size}px;paint-order:stroke" fill="url(#__stoneg)" stroke="#161616" stroke-width="2">${esc(c.name)}</text>`;
    const nameW = Math.min(500, c.name.length * size * (PF + 0.04));
    const splashText = truncate(c.tagline ? c.tagline : `${grouped(p.stats.commits)} commits!`, 30);
    const splash = `<g transform="translate(${Math.min(tx + nameW - 10, 640)} ${ty + 16}) rotate(-17)"><g class="__splash">${mc(0, 0, splashText, 17, '#ffff55', { anchor: 'middle' })}</g></g>`;
    let sub = mc(32, ty + 50, '@' + p.login, 16, '#ffffff');
    c.about.slice(0, 3).forEach((l, i) => {
      sub += mc(32, ty + 76 + i * 20, truncate(l, 60), 13.5, '#ffffff');
    });
    const body =
      `<rect width="${W}" height="${H}" fill="url(#__skyg)"/>` +
      `<g shape-rendering="crispEdges"><rect x="${W - 112}" y="30" width="56" height="56" fill="#fff6b0"/><rect x="${W - 100}" y="42" width="32" height="32" fill="#ffffff"/></g>` +
      `<g shape-rendering="crispEdges">${clouds}</g>` +
      `<g shape-rendering="crispEdges">${treeAt(608, 4)}${treeAt(752, 3)}${ground}${flowers}</g>` +
      title + splash + sub;
    return card(W, H, `${c.name} — GitHub profile`, {
      fonts: FONTS,
      css: css(c.accent),
      radius: 4,
      defs:
        tex('__tgs', 'grassSide') + tex('__tdirt', 'dirt') + tex('__tlog', 'log') + tex('__tleaf', 'leaves') +
        `<linearGradient id="__skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9cff"/><stop offset="1" stop-color="#bcd5ff"/></linearGradient>` +
        `<linearGradient id="__stoneg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f0f0"/><stop offset=".55" stop-color="#b3b3b3"/><stop offset="1" stop-color="#8a8a8a"/></linearGradient>`,
      body,
    });
  },

  stats(c) {
    let inner = '';
    statRows(c).forEach((s, i) => {
      const x = 18 + (i % 2) * 192;
      const y = 46 + Math.floor(i / 2) * 60;
      inner += slot(x, y, 40) + `<g shape-rendering="crispEdges">${bitmap(PIXEL_ICONS[s.key], ICON_PAL, x + 8, y + 8, 3)}</g>`;
      inner += mc(x + 38, y + 37, compact(s.value), 12, '#ffffff', { anchor: 'end' });
      inner += `<text x="${x + 50}" y="${y + 16}" class="__t" style="font-size:12.5px" fill="${UI.text}">${esc(s.label)}</text>`;
      inner += `<text x="${x + 50}" y="${y + 36}" class="__tb" style="font-size:17px" fill="${UI.text}">${grouped(s.value)}</text>`;
    });
    return card(HALF, 236, 'GitHub stats', ui(c, HALF, 236, 'Statistics', inner));
  },

  languages(c) {
    const langs = c.p.languages.slice(0, 6);
    const max = Math.max(...langs.map((l) => l.pct), 1);
    let inner = langs.length ? '' : `<text x="18" y="70" class="__t" fill="${UI.text}">Nothing crafted yet</text>`;
    langs.forEach((l, i) => {
      const y = 62 + i * 28;
      const bw = Math.max(10, Math.round((l.pct / max) * 182));
      inner += `<text x="18" y="${y}" class="__t" style="font-size:13.5px" fill="${UI.text}">${esc(truncate(l.name, 13))}</text>`;
      inner += `<g shape-rendering="crispEdges"><rect x="128" y="${y - 11}" width="186" height="12" fill="#000"/><rect x="130" y="${y - 9}" width="182" height="8" fill="#3b3b3b"/>`;
      inner += `<rect x="130" y="${y - 9}" width="${bw}" height="8" fill="${l.color}"/><rect x="130" y="${y - 9}" width="${bw}" height="2" fill="#fff" opacity=".4"/>`;
      for (let k = 1; k < 9; k++) inner += `<rect x="${130 + k * 20}" y="${y - 9}" width="2" height="8" fill="#000" opacity=".55"/>`;
      inner += `</g><text x="${HALF - 18}" y="${y}" text-anchor="end" class="__t" style="font-size:12.5px" fill="${UI.text}">${Math.round(l.pct)}%</text>`;
    });
    return card(HALF, 236, 'Top languages', ui(c, HALF, 236, 'Languages', inner));
  },

  activity(c) {
    const days = gridDays(c);
    const inner =
      days.map((d, i) => {
        const x = 22 + Math.floor(i / 7) * 15;
        const y = 44 + (i % 7) * 15;
        return d.level === 0 ? `<use href="#__e0" x="${x}" y="${y}"/>` : `<use href="#__b${d.level}" x="${x}" y="${y}" width="13" height="13"/>`;
      }).join('') +
      `<text x="22" y="180" class="__t" style="font-size:13.5px" fill="${UI.text}">${esc(contributionLine(c))}</text>` +
      ['dirt', 'grass', 'gold ore', 'diamond ore'].map((n, i) => `<use href="#__b${i + 1}" x="${W - 360 + i * 86}" y="190" width="13" height="13"/><text x="${W - 342 + i * 86}" y="201" class="__t" style="font-size:11px" fill="${UI.text}">${n}</text>`).join('');
    const u = ui(c, W, 218, 'Blocks mined · last 12 months', inner);
    return card(W, 218, 'Contribution activity', {
      ...u,
      defs:
        tex('__b1', 'dirt') + tex('__b2', 'grassSide') + tex('__b3', 'gold') + tex('__b4', 'diamond') +
        `<g id="__e0" shape-rendering="crispEdges"><rect width="13" height="13" fill="${UI.slot}"/><rect width="12" height="1" fill="${UI.slotSh}"/><rect width="1" height="12" fill="${UI.slotSh}"/></g>`,
    });
  },

  repo(c, r) {
    const w = HALF;
    const h = 150;
    let inner =
      `<g shape-rendering="crispEdges"><rect x="2" y="0" width="${w - 4}" height="${h}" fill="#100010" fill-opacity=".96"/><rect x="0" y="2" width="${w}" height="${h - 4}" fill="#100010" fill-opacity=".96"/>` +
      `<rect x="4" y="4" width="${w - 8}" height="${h - 8}" fill="none" stroke="url(#__tip)" stroke-width="2"/></g>` +
      `<clipPath id="__tc"><rect x="6" y="6" width="${w - 12}" height="${h - 12}"/></clipPath>` +
      `<g clip-path="url(#__tc)"><rect class="__glint" x="0" y="-40" width="70" height="240" fill="#a05cff" opacity=".12" transform="skewX(-25)"/></g>` +
      mc(18, 34, truncate(r.name, 30), fitSize(r.name, 18, 360, PF, 11), '#55ffff');
    wrap(r.description || 'No description yet.', 50, 2).forEach((l, i) => {
      inner += mc(18, 60 + i * 18, l, 13, '#aaaaaa');
    });
    let x = 18;
    inner += star(x, 112, 13, `fill="#ffff55"`) + mc(x + 18, 124, `${compact(r.stars)} stars`, 13, '#ffff55');
    x += 30 + (compact(r.stars).length + 6) * 7.4;
    inner += mc(x, 124, `${compact(r.forks)} forks`, 13, '#aaaaaa');
    x += (compact(r.forks).length + 7) * 7.4;
    if (r.language) inner += mc(x, 124, r.language.name, 13, '#55ff55');
    return card(w, h, r.name, {
      fonts: FONTS,
      css: css(c.accent),
      defs: `<linearGradient id="__tip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5000ff"/><stop offset="1" stop-color="#28007f"/></linearGradient>`,
      body: inner,
    });
  },

  stack(c) {
    const items = c.c.stack ?? [];
    const per = 9;
    const S = 52;
    const gap = 30;
    const rows = Math.max(1, Math.ceil(items.length / per));
    const h = 58 + rows * 86;
    const rowW = per * S + (per - 1) * gap;
    const x0 = (W - rowW) / 2;
    let inner = dirtBg(W, h) + mc(W / 2, 34, 'Hotbar', 16, '#ffffff', { anchor: 'middle' });
    for (let i = items.length; i < rows * per; i++) {
      const x = x0 + (i % per) * (S + gap);
      const y = 50 + Math.floor(i / per) * 86;
      inner += `<g shape-rendering="crispEdges"><rect x="${x}" y="${y}" width="${S}" height="${S}" fill="#000" opacity=".55"/><rect x="${x}" y="${y}" width="${S}" height="${S}" fill="none" stroke="#2b2b2b" stroke-width="2"/></g>`;
    }
    items.forEach((s, i) => {
      const x = x0 + (i % per) * (S + gap);
      const y = 50 + Math.floor(i / per) * 86;
      const icon = findIcon(s);
      const col = icon ? (luminance(icon.hex) < 0.05 ? '#e8e8e8' : icon.hex) : '#ffffff';
      inner += `<g shape-rendering="crispEdges"><rect x="${x}" y="${y}" width="${S}" height="${S}" fill="#000" opacity=".55"/><rect x="${x + 2}" y="${y + 2}" width="${S - 4}" height="${S - 4}" fill="#8b8b8b" opacity=".35"/>`;
      inner += i === 0 ? `<rect x="${x - 2}" y="${y - 2}" width="${S + 4}" height="${S + 4}" fill="none" stroke="#fff" stroke-width="4"/>` : `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="none" stroke="#2b2b2b" stroke-width="2"/>`;
      inner += `</g>`;
      inner += icon ? iconPath(icon, x + 13, y + 13, 26, `fill="${col}"`) : mc(x + S / 2, y + 34, s.slice(0, 1).toUpperCase(), 22, '#fff', { anchor: 'middle' });
      inner += mc(x + S / 2, y + S + 20, truncate(stackTitle(s), 11), 12, '#ffffff', { anchor: 'middle' });
    });
    return card(W, h, 'Tech stack', { fonts: FONTS, css: css(c.accent), radius: 4, defs: tex('__tdirt', 'dirt') + DIRT_PATTERN, body: inner });
  },

  social(c, s) {
    const icon = socialIcon(s.kind);
    const text = truncate(s.label, 26);
    const w = Math.round(46 + text.length * 14 * PF + 20);
    return card(w, 36, s.kind, {
      fonts: ['pixelify400'],
      css: css(c.accent),
      body:
        `<g shape-rendering="crispEdges"><rect width="${w}" height="36" fill="#000"/><rect x="2" y="2" width="${w - 4}" height="32" fill="#727272"/>` +
        `<rect x="2" y="2" width="${w - 4}" height="3" fill="#a8a8a8"/><rect x="2" y="2" width="3" height="30" fill="#a8a8a8"/>` +
        `<rect x="2" y="30" width="${w - 4}" height="4" fill="#4a4a4a"/><rect x="${w - 5}" y="5" width="3" height="27" fill="#4a4a4a"/></g>` +
        iconPath(icon, 14, 10, 16, 'fill="#fff"') +
        mc(40, 23, text, 14, '#ffffff'),
    });
  },

  footer(c) {
    const H = 72;
    let ground = '';
    for (let x = 0; x < W; x += 24) ground += `<use href="#__tgs" x="${x}" y="${H - 24}" width="24" height="24"/>`;
    const body = dirtBg(W, H) + `<g shape-rendering="crispEdges">${ground}</g>` + mc(W / 2, 30, `Saving world... ${updatedLabel(c.p.fetchedAt)} · Readme Atelier`, 14, '#ffffff', { anchor: 'middle' });
    return card(W, H, 'Footer', { fonts: ['pixelify400'], css: css(c.accent), radius: 4, defs: tex('__tdirt', 'dirt') + tex('__tgs', 'grassSide') + DIRT_PATTERN, body });
  },
};
