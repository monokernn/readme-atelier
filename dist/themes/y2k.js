import { findIcon, iconPath, socialIcon, stackTitle } from '../icons.js';
import { font } from '../fonts/index.js';
import { compact, esc, fitSize, grouped, luminance, mix, rng, truncate, updatedLabel, wrap } from '../util.js';
import { HALF, W, card, contributionLine, fork, gridDays, star, statRows } from './shared.js';
const FONTS = ['unbounded400', 'unbounded800'];
const U4 = 0.7; // average advance factor, Unbounded 400
const U8 = 0.8; // Unbounded 800
function sparkle(x, y, s, fill, cls = '') {
    return `<path class="${cls}" transform="translate(${x} ${y}) scale(${s / 10})" d="M0-10C1-3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z" fill="${fill}"/>`;
}
function css(accent) {
    return `
.__l{${font('unbounded400', 10)};fill:#fff;letter-spacing:.28em}
.__t{${font('unbounded400', 11)};fill:#fff}
.__b{${font('unbounded800', 26)}}
.__drift{animation:__drift 26s ease-in-out infinite alternate}
.__drift2{animation:__drift 34s ease-in-out infinite alternate-reverse}
@keyframes __drift{from{transform:translateX(0)}to{transform:translateX(-46px)}}
.__spin{transform-box:fill-box;transform-origin:center;animation:__spin 50s linear infinite}
@keyframes __spin{to{transform:rotate(360deg)}}
.__tw{animation:__tw 3.2s ease-in-out infinite}
@keyframes __tw{0%,100%{opacity:.15}50%{opacity:1}}
.__bub{animation:__bub 7s ease-in infinite;opacity:0}
@keyframes __bub{0%{transform:translateY(0);opacity:0}15%{opacity:.9}100%{transform:translateY(-190px);opacity:0}}
.__sh{animation:__sh 6s ease-in-out infinite}
@keyframes __sh{0%{transform:translateX(-300px)}60%,100%{transform:translateX(1100px)}}
.__pulse{animation:__pulse 2.4s ease-in-out infinite}
@keyframes __pulse{50%{opacity:.55}}
.__acc{fill:${accent}}
.__fly{animation:__fly 90s linear infinite}
@keyframes __fly{from{transform:translateX(-220px)}to{transform:translateX(1060px)}}
.__inv text{fill:#0b1f86}`;
}
function defs(accent) {
    return `
<linearGradient id="__sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#01063d"/><stop offset=".42" stop-color="#0a26c4"/><stop offset=".78" stop-color="#3a74ff"/><stop offset="1" stop-color="#b3d1ff"/></linearGradient>
<linearGradient id="__deep" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#01063d"/><stop offset=".6" stop-color="#0a22b0"/><stop offset="1" stop-color="#2f62f5"/></linearGradient>
<linearGradient id="__water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2557e8"/><stop offset=".18" stop-color="#0b2499"/><stop offset="1" stop-color="#010523"/></linearGradient>
<linearGradient id="__chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".42" stop-color="#dfe7ff"/><stop offset=".5" stop-color="#6d8cff"/><stop offset=".56" stop-color="#ffffff"/><stop offset="1" stop-color="#c4d2ff"/></linearGradient>
<linearGradient id="__refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
<linearGradient id="__glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".45" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity=".03"/></linearGradient>
<linearGradient id="__shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="__sun"><stop offset="0" stop-color="#fff"/><stop offset=".18" stop-color="#fff" stop-opacity=".95"/><stop offset=".42" stop-color="#cfe2ff" stop-opacity=".45"/><stop offset="1" stop-color="#5b8cff" stop-opacity="0"/></radialGradient>
<linearGradient id="__scrim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#01063d" stop-opacity=".78"/><stop offset=".42" stop-color="#01063d" stop-opacity=".45"/><stop offset=".68" stop-color="#01063d" stop-opacity="0"/></linearGradient>
<filter id="__ts" x="-5%" y="-20%" width="110%" height="140%"><feDropShadow dx="0" dy="1" stdDeviation="1.6" flood-color="#000628" flood-opacity=".85"/></filter>
<radialGradient id="__fish" cx=".5" cy=".46" r=".72"><stop offset=".62" stop-color="#000418" stop-opacity="0"/><stop offset="1" stop-color="#000418" stop-opacity=".78"/></radialGradient>
<filter id="__soft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="__ripple" x="0" y="-10%" width="100%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.08" numOctaves="2" seed="4"><animate attributeName="baseFrequency" dur="10s" values="0.004 0.08;0.006 0.105;0.004 0.08" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter>`;
}
/** Deep-blue backdrop + frosted glass panel used by the smaller cards. */
function panel(c, w, h, title, inner, seed) {
    const r = rng(seed);
    let bubbles = '';
    for (let i = 0; i < 7; i++) {
        const x = r.range(20, w - 20);
        const rad = r.range(2, 6);
        bubbles += `<circle class="__bub" style="animation-delay:${r.range(0, 7).toFixed(2)}s;animation-duration:${r.range(6, 10).toFixed(1)}s" cx="${x.toFixed(1)}" cy="${h + 6}" r="${rad.toFixed(1)}" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".55"/>`;
    }
    return {
        radius: 18,
        fonts: FONTS,
        css: css(c.accent),
        defs: defs(c.accent),
        body: `<rect width="${w}" height="${h}" fill="url(#__deep)"/>` +
            `<circle cx="${w - 40}" cy="26" r="90" fill="url(#__sun)" opacity=".55"/>` +
            bubbles +
            `<rect x="12" y="12" width="${w - 24}" height="${h - 24}" rx="14" fill="url(#__glass)" stroke="#fff" stroke-opacity=".28"/>` +
            `<path d="M28 12.5H${w - 28}" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>` +
            (title ? sparkle(36, 40, 5, c.accent, '__pulse') + `<text x="48" y="44" class="__l" style="font-size:9.5px">${esc(title)}</text>` : '') +
            inner +
            `<rect width="${w}" height="${h}" fill="url(#__fish)" opacity=".55"/>`,
    };
}
/**
 * Clouds that drift across the whole sky. Returned once for the scene and once for a mask,
 * with identical geometry and timing, so text can switch color exactly where a cloud passes.
 * Without animation (reduced motion) each cloud rests at `rest` — on the right, away from the text.
 */
function clouds(seed, n, y0, y1) {
    const r = rng(seed);
    let scene = '';
    let mask = '';
    for (let i = 0; i < n; i++) {
        const cy = r.range(y0, y1);
        const s = r.range(0.7, 1.3);
        const dur = r.range(70, 120);
        const delay = (i / n) * dur + r.range(0, 8);
        const rest = r.range(500, 800);
        const op = r.range(0.6, 0.95).toFixed(2);
        let blobs = '';
        for (let k = 0; k < 5; k++)
            blobs += `<ellipse cx="${(r.range(-38, 38) * s).toFixed(1)}" cy="${(cy + r.range(-8, 6) * s).toFixed(1)}" rx="${(r.range(18, 34) * s).toFixed(1)}" ry="${(r.range(10, 18) * s).toFixed(1)}"/>`;
        const g = (fill) => `<g class="__fly" style="transform:translateX(${rest.toFixed(0)}px);animation-duration:${dur.toFixed(1)}s;animation-delay:-${delay.toFixed(1)}s"><g fill="${fill}" opacity="${op}" filter="url(#__soft)">${blobs}</g></g>`;
        scene += g('#fff');
        mask += g('#fff');
    }
    return { scene, mask };
}
export const y2k = {
    id: 'y2k',
    name: 'Deep Blue',
    blurb: 'Y2K dreamcore: ultramarine sky, star-burst sun, chrome type and a rippling waterline.',
    accent: '#ff5fc8',
    schemes: ['dark'],
    header(c) {
        const p = c.p;
        const H = 330;
        const HZ = 222;
        const r = rng(p.login + 'y2k');
        const size = fitSize(c.name, 66, 600, U8, 26);
        // distant skyline on the horizon
        let city = '';
        for (let x = 0; x < W;) {
            const bw = r.range(10, 34);
            const bh = r.chance(0.15) ? r.range(40, 74) : r.range(6, 30);
            city += `<rect x="${x.toFixed(1)}" y="${(HZ - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}"/>`;
            x += bw + r.range(0, 6);
        }
        let lights = '';
        for (let i = 0; i < 40; i++)
            lights += `<rect class="__tw" style="animation-delay:${r.range(0, 3).toFixed(2)}s" x="${r.range(0, W).toFixed(0)}" y="${r.range(HZ - 40, HZ - 3).toFixed(0)}" width="1.6" height="1.6" fill="${r.chance(0.3) ? c.accent : '#fff'}"/>`;
        let glints = '';
        for (let i = 0; i < 26; i++) {
            const gx = r.range(0, W);
            const gy = r.range(HZ + 8, H - 10);
            glints += `<rect class="__tw" style="animation-delay:${r.range(0, 3.2).toFixed(2)}s" x="${gx.toFixed(0)}" y="${gy.toFixed(0)}" width="${r.range(8, 30).toFixed(0)}" height="1.4" rx=".7" fill="#fff"/>`;
        }
        let sunPath = '';
        for (let i = 0; i < 9; i++)
            sunPath += `<rect x="${640 - 26 + i * 2.2}" y="${HZ + 6 + i * 11}" width="${52 - i * 4.4}" height="3" rx="1.5" fill="#fff" opacity="${(0.9 - i * 0.08).toFixed(2)}"/>`;
        const nameText = (fill, extra = '') => `<text x="38" y="${HZ - 20}" style="${font('unbounded800', size)};letter-spacing:-.02em" fill="${fill}" ${extra}>${esc(c.name)}</text>`;
        let top = `<g>${sparkle(42, 46, 6, c.accent, '__pulse')}<text x="56" y="50" class="__l">@${esc(p.login.toUpperCase())}</text></g>`;
        const tl = wrap(c.tagline, 56, 1)[0];
        if (tl)
            top += `<text x="38" y="78" class="__t" style="font-size:13.5px">${esc(tl)}</text>`;
        c.about.slice(0, 3).forEach((l, i) => {
            top += `<text x="38" y="${102 + i * 18}" class="__t" fill-opacity=".72" style="font-size:10.5px">${esc(truncate(l, 64))}</text>`;
        });
        const cl = clouds(p.login, 6, 40, 200);
        const body = `<rect width="${W}" height="${H}" fill="url(#__sky)"/>` +
            `<g><circle cx="640" cy="104" r="120" fill="url(#__sun)"/>` +
            `<g class="__spin">` +
            [0, 45, 90, 135].map((a) => `<ellipse cx="640" cy="104" rx="170" ry="1.6" fill="#fff" opacity=".8" transform="rotate(${a} 640 104)"/>`).join('') +
            [22.5, 67.5, 112.5, 157.5].map((a) => `<ellipse cx="640" cy="104" rx="64" ry="1.1" fill="#fff" opacity=".6" transform="rotate(${a} 640 104)"/>`).join('') +
            `</g><circle cx="640" cy="104" r="17" fill="#fff"/>` +
            `<circle cx="566" cy="160" r="9" fill="${c.accent}" opacity=".28"/><circle cx="488" cy="214" r="24" fill="#9cbcff" opacity=".14"/><circle cx="420" cy="262" r="6" fill="#fff" opacity=".3"/></g>` +
            `<rect width="${W}" height="${HZ}" fill="url(#__scrim)"/>` +
            cl.scene +
            `<g fill="#06135a">${city}</g>${lights}` +
            `<g filter="url(#__ripple)">` +
            `<rect x="-20" y="${HZ}" width="${W + 40}" height="${H - HZ + 30}" fill="url(#__water)"/>` +
            `<g transform="translate(0 ${2 * HZ}) scale(1 -1)" opacity=".5"><g fill="#06135a">${city}</g></g>` +
            sunPath +
            `<g transform="translate(0 ${2 * HZ}) scale(1 -1)">${nameText('url(#__refl)', 'opacity=".75"')}</g>` +
            `</g>` +
            glints +
            `<rect y="${HZ - 0.5}" width="${W}" height="1.2" fill="#fff" opacity=".55"/>` +
            nameText(c.accent, `opacity=".45" transform="translate(0 4)"`) +
            nameText('url(#__chrome)', `stroke="#fff" stroke-opacity=".55" stroke-width=".8"`) +
            `<g filter="url(#__ts)">${top}</g>` +
            `<g mask="url(#__cm)" class="__inv">${nameText('#0b2bb5', `stroke="#fff" stroke-opacity=".5" stroke-width=".8"`)}${top}</g>` +
            `<rect width="${W}" height="${H}" fill="url(#__fish)"/>` +
            `<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="21" stroke="#fff" stroke-opacity=".3" stroke-width="1.5"/>`;
        const mask = `<mask id="__cm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#000"/>${cl.mask}</mask>`;
        return card(W, H, `${c.name} · GitHub profile`, { radius: 22, fonts: FONTS, css: css(c.accent), defs: defs(c.accent) + mask, body });
    },
    stats(c) {
        let inner = '';
        statRows(c).forEach((s, i) => {
            const x = 32 + (i % 3) * 120;
            const y = 104 + Math.floor(i / 3) * 74;
            const v = compact(s.value);
            inner += `<text x="${x}" y="${y}" class="__b" fill="url(#__chrome)" style="font-size:${fitSize(v, 27, 106, U8)}px">${v}</text>`;
            inner += `<text x="${x}" y="${y + 20}" class="__l" fill-opacity=".72" style="font-size:7.5px;letter-spacing:.16em">${esc(s.short.toUpperCase())}</text>`;
        });
        return card(HALF, 230, 'GitHub stats', panel(c, HALF, 230, 'STATS · 12 MO', inner, c.p.login + 's'));
    },
    languages(c) {
        const langs = c.p.languages.slice(0, 6);
        const max = Math.max(...langs.map((l) => l.pct), 1);
        let defsX = '';
        let inner = langs.length ? '' : `<text x="34" y="100" class="__t" fill-opacity=".7">No public code yet</text>`;
        langs.forEach((l, i) => {
            const y = 78 + i * 24;
            const bw = Math.max(14, (l.pct / max) * 168);
            defsX += `<linearGradient id="__lg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(l.color, '#ffffff', 0.55)}"/><stop offset=".5" stop-color="${l.color}"/><stop offset="1" stop-color="${mix(l.color, '#000033', 0.35)}"/></linearGradient>`;
            inner += `<text x="34" y="${y + 9}" class="__t" style="font-size:10px">${esc(truncate(l.name, 13))}</text>`;
            inner += `<rect x="156" y="${y}" width="168" height="12" rx="6" fill="#fff" fill-opacity=".1"/>`;
            inner += `<rect x="156" y="${y}" width="${bw.toFixed(1)}" height="12" rx="6" fill="url(#__lg${i})"/>`;
            inner += `<rect x="160" y="${y + 1.5}" width="${Math.max(4, bw - 8).toFixed(1)}" height="4" rx="2" fill="#fff" fill-opacity=".55"/>`;
            inner += `<text x="378" y="${y + 9}" text-anchor="end" class="__t" fill-opacity=".8" style="font-size:9px">${l.pct.toFixed(1)}%</text>`;
        });
        const pn = panel(c, HALF, 230, 'LANGUAGES', inner, c.p.login + 'l');
        return card(HALF, 230, 'Top languages', { ...pn, defs: pn.defs + defsX });
    },
    activity(c) {
        const days = gridDays(c);
        const fills = ['#ffffff', '#3d78ff', '#7fa6ff', mix('#7fa6ff', c.accent, 0.6), c.accent];
        const symbols = fills
            .map((col, l) => l === 0
            ? `<g id="__d0"><circle cx="6" cy="6" r="5.2" fill="#fff" fill-opacity=".07"/></g>`
            : `<g id="__d${l}"><circle cx="6" cy="6" r="5.6" fill="${col}"/><circle cx="4.4" cy="4.2" r="1.7" fill="#fff" fill-opacity="${0.35 + l * 0.12}"/></g>`)
            .join('');
        let cells = '';
        days.forEach((d, i) => {
            cells += `<use href="#__d${d.level}" x="${30 + Math.floor(i / 7) * 14.9}" y="${62 + (i % 7) * 14.9}"/>`;
        });
        const inner = cells +
            `<g class="__sh"><rect x="0" y="40" width="180" height="140" fill="url(#__shine)" transform="skewX(-20)"/></g>` +
            `<text x="34" y="196" class="__t" fill-opacity=".85" style="font-size:10px">${esc(contributionLine(c))}</text>`;
        const pn = panel(c, W, 222, 'ACTIVITY · LAST 12 MONTHS', inner, c.p.login + 'a');
        return card(W, 222, 'Contribution activity', { ...pn, defs: pn.defs + symbols });
    },
    repo(c, r) {
        let inner = `<text x="30" y="52" class="__b" fill="url(#__chrome)" style="font-size:${fitSize(r.name, 16, 340, U8)}px">${esc(truncate(r.name, 30))}</text>`;
        wrap(r.description || 'No description yet.', 50, 2).forEach((l, i) => {
            inner += `<text x="30" y="${78 + i * 16}" class="__t" fill-opacity=".75" style="font-size:9.5px">${esc(l)}</text>`;
        });
        let x = 30;
        inner += star(x, 113, 13, `class="__acc"`) + `<text x="${x + 18}" y="124" class="__t" style="font-size:10px">${compact(r.stars)}</text>`;
        x += 30 + compact(r.stars).length * 7.5;
        inner += fork(x, 112, 13, '#fff') + `<text x="${x + 18}" y="124" class="__t" style="font-size:10px">${compact(r.forks)}</text>`;
        x += 30 + compact(r.forks).length * 7.5;
        if (r.language)
            inner += `<circle cx="${x + 5}" cy="120" r="5" fill="${r.language.color}" stroke="#fff" stroke-opacity=".6"/><text x="${x + 15}" y="124" class="__t" fill-opacity=".8" style="font-size:9.5px">${esc(r.language.name)}</text>`;
        return card(HALF, 150, r.name, panel(c, HALF, 150, '', inner, r.name));
    },
    stack(c) {
        const items = c.c.stack ?? [];
        const per = 8;
        const rows = Math.max(1, Math.ceil(items.length / per));
        const h = 70 + rows * 94;
        let defsX = '';
        let inner = '';
        items.forEach((s, i) => {
            const icon = findIcon(s);
            const base = icon && luminance(icon.hex) > 0.04 ? icon.hex : '#2a49e0';
            const cx = 32 + 49 + (i % per) * 97;
            const cy = 98 + Math.floor(i / per) * 94;
            defsX += `<radialGradient id="__o${i}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${mix(base, '#ffffff', 0.5)}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${mix(base, '#000022', 0.5)}"/></radialGradient>`;
            inner += `<circle cx="${cx}" cy="${cy}" r="24" fill="url(#__o${i})" stroke="#fff" stroke-opacity=".45"/>`;
            inner += icon ? iconPath(icon, cx - 11, cy - 11, 22, 'fill="#fff"') : `<text x="${cx}" y="${cy + 6}" text-anchor="middle" class="__b" fill="#fff" style="font-size:16px">${esc(s.slice(0, 1).toUpperCase())}</text>`;
            inner += `<ellipse cx="${cx}" cy="${cy - 12}" rx="15" ry="7" fill="#fff" fill-opacity=".38"/>`;
            inner += `<text x="${cx}" y="${cy + 42}" text-anchor="middle" class="__t" fill-opacity=".85" style="font-size:9px">${esc(truncate(stackTitle(s), 13))}</text>`;
        });
        const pn = panel(c, W, h, 'STACK', inner, c.p.login + 'k');
        return card(W, h, 'Tech stack', { ...pn, defs: pn.defs + defsX });
    },
    social(c, s) {
        const icon = socialIcon(s.kind);
        const text = truncate(s.label, 28);
        const w = Math.round(44 + text.length * 11.5 * U4 + 18);
        return card(w, 36, s.kind, {
            fonts: ['unbounded400'],
            css: `.__t{${font('unbounded400', 11.5)};fill:#fff}`,
            defs: `<linearGradient id="__gel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe3ff"/><stop offset=".5" stop-color="#2f7bff"/><stop offset="1" stop-color="#0a32c9"/></linearGradient><linearGradient id="__hi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></linearGradient>`,
            body: `<rect x=".75" y=".75" width="${w - 1.5}" height="34.5" rx="17.25" fill="url(#__gel)" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>` +
                `<rect x="8" y="3" width="${w - 16}" height="14" rx="7" fill="url(#__hi)"/>` +
                iconPath(icon, 16, 10, 16, 'fill="#fff"') +
                `<text x="42" y="22.5" class="__t">${esc(text)}</text>`,
        });
    },
    footer(c) {
        const r = rng(c.p.login + 'f');
        let glints = '';
        for (let i = 0; i < 18; i++)
            glints += `<rect class="__tw" style="animation-delay:${r.range(0, 3).toFixed(2)}s" x="${r.range(0, W).toFixed(0)}" y="${r.range(30, 66).toFixed(0)}" width="${r.range(8, 26).toFixed(0)}" height="1.4" fill="#fff"/>`;
        const body = `<rect width="${W}" height="72" fill="#0b2499"/><g filter="url(#__ripple)"><rect x="-20" y="-20" width="${W + 40}" height="112" fill="url(#__water)"/></g>` +
            glints +
            `<rect width="${W}" height="1" fill="#fff" opacity=".5"/>` +
            `<text x="${W / 2}" y="42" text-anchor="middle" class="__l" style="font-size:9px">UPDATED ${updatedLabel(c.p.fetchedAt)} · README ATELIER</text>`;
        return card(W, 72, 'Footer', { radius: 18, fonts: ['unbounded400'], css: css(c.accent), defs: defs(c.accent), body });
    },
};
void grouped;
