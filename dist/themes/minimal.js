import { findIcon, iconPath, socialIcon, stackTitle } from '../icons.js';
import { font } from '../fonts/index.js';
import { compact, esc, fitSize, grouped, sinceYear, truncate, updatedLabel, wrap } from '../util.js';
import { HALF, W, card, fork, gridDays, monthLabels, star, statRows } from './shared.js';
const PAL = {
    light: { bg: '#f2f2f0', ink: '#262626', mid: '#6a6a6a', rule: '#262626', faint: '#e2e2de' },
    dark: { bg: '#0f0f0f', ink: '#ececea', mid: '#9a9a96', rule: '#ececea', faint: '#202020' },
};
const SANS6 = 0.56;
const SERIF = 0.44;
const FONTS = ['serif400', 'serif400i', 'sans400', 'sans600'];
function pal(c) {
    return PAL[c.scheme];
}
function css(c) {
    const k = pal(c);
    return `
.__ink{fill:${k.ink}}.__mid{fill:${k.mid}}.__acc{fill:${c.accent}}
.__s{${font('sans400', 12)};fill:${k.ink}}
.__lab{${font('sans400', 10.5)};fill:${k.mid}}
.__big{${font('sans600', 80)};fill:${k.ink};letter-spacing:-.045em}
.__it{${font('serif400i', 28)};fill:${k.ink}}
.__num{${font('serif400', 36)};fill:${k.ink}}
.__rise{animation:__rise 1.1s cubic-bezier(.16,.84,.24,1) both}
@keyframes __rise{from{transform:translateY(26px);opacity:0}to{transform:none;opacity:1}}
.__fade{animation:__fade .9s ease both}
@keyframes __fade{from{opacity:0}}
.__mq{transform-box:fill-box;animation:__mq 40s linear infinite}
@keyframes __mq{to{transform:translateX(-50%)}}`;
}
function rule(c, x1, x2, y, o = 0.14) {
    return `<line x1="${x1}" x2="${x2}" y1="${y}" y2="${y}" stroke="${pal(c).rule}" stroke-opacity="${o}"/>`;
}
/** The ruled-lines headline: big text cut by two hairlines like a music staff. */
function ruled(c, text, x, base, size, x2, cls = '__big') {
    return (rule(c, x, x2, base - size * 0.645, 0.16) +
        rule(c, x, x2, base + size * 0.105, 0.16) +
        `<g class="__rise"><text x="${x}" y="${base}" class="${cls}" style="font-size:${size}px">${esc(text)}</text></g>`);
}
function label(c, x, y, n, title) {
    return `<text x="${x}" y="${y}" class="__lab">+ (${esc(n)})</text><text x="${x + 54}" y="${y + 1}" class="__it" style="font-size:21px">${esc(title)}</text>`;
}
function base(c, w, h, body) {
    return {
        fonts: FONTS,
        css: css(c),
        radius: 6,
        body: `<rect width="${w}" height="${h}" fill="${pal(c).bg}"/>` + body + `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="5.5" stroke="${pal(c).rule}" stroke-opacity=".1"/>`,
    };
}
function arrow(x, y, color) {
    return `<path d="M${x} ${y + 9}L${x + 9} ${y}M${x + 2} ${y}H${x + 9}V${y + 7}" stroke="${color}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`;
}
export const minimal = {
    id: 'minimal',
    name: 'Editorial',
    blurb: 'Swiss-editorial typography: ruled headlines, serif italics, quiet hairlines. Light and dark.',
    accent: '#ff4d00',
    schemes: ['light', 'dark'],
    header(c) {
        const p = c.p;
        const H = 330;
        const k = pal(c);
        const size = fitSize(c.name, 104, 784, SANS6, 34);
        let b = `<text x="28" y="34" class="__lab">+ (Profile)</text>` +
            `<text x="${W / 2}" y="34" text-anchor="middle" class="__lab">@${esc(p.login)}</text>` +
            `<text x="${W - 28}" y="34" text-anchor="end" class="__lab">(01)</text>` +
            rule(c, 28, W - 28, 48) +
            ruled(c, c.name, 26, 148, size, W - 28);
        const tag = wrap(c.tagline, 56, 2);
        tag.forEach((l, i) => {
            b += `<text x="28" y="${196 + i * 30}" class="__it __fade" style="font-size:26px;animation-delay:${0.35 + i * 0.1}s">${esc(l)}</text>`;
        });
        const y0 = 250;
        b += rule(c, 28, W - 28, y0 - 14);
        b += `<text x="28" y="${y0 + 4}" class="__lab">(About)</text>`;
        const about = c.about.length ? c.about : [p.location ? `Based in ${p.location}` : 'Building on GitHub', `On GitHub since ${sinceYear(p.createdAt)}`];
        about.slice(0, 3).forEach((l, i) => {
            b += `<text x="28" y="${y0 + 26 + i * 18}" class="__s" style="font-size:12.5px">${esc(truncate(l, 46))}</text>`;
        });
        b += `<text x="360" y="${y0 + 4}" class="__lab">(Index)</text>`;
        const idx = [['Stars', compact(p.stats.stars)], ['Repositories', compact(p.publicRepos)], ['Followers', compact(p.followers)]];
        idx.forEach(([kname, v], i) => {
            const y = y0 + 26 + i * 18;
            b += `<text x="360" y="${y}" class="__s" style="font-size:12.5px">${kname}</text><text x="560" y="${y}" text-anchor="end" class="__s" style="font-size:12.5px">${v}</text>`;
        });
        b += `<text x="616" y="${y0 + 4}" class="__lab">(Portrait)</text>`;
        if (p.avatar) {
            b += `<clipPath id="__av"><rect x="${W - 28 - 62}" y="${y0 - 6}" width="62" height="62" rx="2"/></clipPath>`;
            b += `<image href="${p.avatar}" x="${W - 28 - 62}" y="${y0 - 6}" width="62" height="62" clip-path="url(#__av)" filter="url(#__gray)" preserveAspectRatio="xMidYMid slice"/>`;
        }
        b += `<text x="616" y="${y0 + 26}" class="__s" style="font-size:12.5px">${esc(truncate(p.location || p.company || 'Earth', 18))}</text>`;
        b += `<text x="616" y="${y0 + 44}" class="__s __mid" style="font-size:12.5px">Since ${sinceYear(p.createdAt)}</text>`;
        void k;
        const out = base(c, W, H, b);
        return card(W, H, `${c.name} — GitHub profile`, {
            ...out,
            defs: `<filter id="__gray"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.08"/><feFuncG type="linear" slope="1.08"/><feFuncB type="linear" slope="1.08"/></feComponentTransfer></filter>`,
        });
    },
    stats(c) {
        let b = label(c, 24, 36, '02', 'Numbers') + rule(c, 24, HALF - 24, 52);
        statRows(c).forEach((s, i) => {
            const x = 24 + (i % 2) * 192;
            const y = 106 + Math.floor(i / 2) * 64;
            const v = grouped(s.value);
            b += `<g class="__fade" style="animation-delay:${i * 0.08}s"><text x="${x}" y="${y}" class="__num" style="font-size:${fitSize(v, 38, 170, SERIF)}px">${v}</text>`;
            b += `<text x="${x + 1}" y="${y + 17}" class="__lab" style="font-size:9.5px;letter-spacing:.08em">${esc(s.label.toUpperCase())}</text></g>`;
            if (i % 2 === 1 && i < 5)
                b += rule(c, 24, HALF - 24, y + 32, 0.1);
        });
        return card(HALF, 268, 'GitHub stats', base(c, HALF, 268, b));
    },
    languages(c) {
        let b = label(c, 24, 36, '03', 'Languages') + rule(c, 24, HALF - 24, 52);
        const langs = c.p.languages.slice(0, 6);
        if (!langs.length)
            b += `<text x="24" y="90" class="__s __mid">No public code yet</text>`;
        langs.forEach((l, i) => {
            const y = 88 + i * 31;
            b += `<g class="__fade" style="animation-delay:${i * 0.08}s"><text x="24" y="${y}" class="__num" style="font-size:20px">${esc(truncate(l.name, 22))}</text>`;
            b += `<text x="${HALF - 24}" y="${y}" text-anchor="end" class="__s __mid" style="font-size:11px">${l.pct.toFixed(1)}%</text>`;
            b += rule(c, 24, HALF - 24, y + 9, 0.1);
            b += `<line x1="24" x2="${(24 + (l.pct / 100) * (HALF - 48)).toFixed(1)}" y1="${y + 9}" y2="${y + 9}" stroke="${i === 0 ? c.accent : pal(c).ink}" stroke-width="1.6"/></g>`;
        });
        return card(HALF, 268, 'Top languages', base(c, HALF, 268, b));
    },
    activity(c) {
        const k = pal(c);
        const days = gridDays(c);
        const op = [0, 0.22, 0.45, 0.72, 1];
        let defs = `<rect id="__q0" width="12" height="12" fill="${k.faint}"/>`;
        for (let l = 1; l <= 4; l++)
            defs += `<rect id="__q${l}" width="12" height="12" fill="${k.ink}" fill-opacity="${op[l]}"/>`;
        let b = label(c, 24, 36, '04', 'Activity') + `<text x="${W - 24}" y="36" text-anchor="end" class="__lab">(Last 12 months)</text>` + rule(c, 24, W - 24, 52);
        b += monthLabels(days).map((m) => `<text x="${24 + m.col * 15}" y="72" class="__lab" style="font-size:9.5px">${m.label}</text>`).join('');
        days.forEach((d, i) => {
            b += `<use href="#__q${d.level}" x="${24 + Math.floor(i / 7) * 15}" y="${80 + (i % 7) * 15}"/>`;
        });
        const nums = [
            [grouped(c.p.stats.contributions), 'Contributions'],
            [String(c.p.streak.current), 'Current streak, days'],
            [String(c.p.streak.longest), 'Longest streak, days'],
        ];
        nums.forEach(([v, l], i) => {
            const x = 24 + i * 200;
            b += `<text x="${x}" y="226" class="__num" style="font-size:34px">${v}</text><text x="${x + 2}" y="242" class="__lab" style="font-size:9.5px;letter-spacing:.08em">${l.toUpperCase()}</text>`;
        });
        if (!c.p.calendar.length)
            b += `<text x="${W - 24}" y="226" text-anchor="end" class="__lab">contribution graph needs a GitHub token</text>`;
        const out = base(c, W, 258, b);
        return card(W, 258, 'Contribution activity', { ...out, defs });
    },
    repo(c, r) {
        const k = pal(c);
        const size = fitSize(r.name, 30, 350, SANS6, 16);
        let b = `<text x="24" y="30" class="__lab">(Repository)</text>` + arrow(HALF - 34, 21, k.ink);
        b += ruled(c, truncate(r.name, 36), 22, 72, size, HALF - 24);
        wrap(r.description || 'No description yet.', 54, 2).forEach((l, i) => {
            b += `<text x="24" y="${102 + i * 16}" class="__s __mid" style="font-size:12px">${esc(l)}</text>`;
        });
        let x = 24;
        if (r.language) {
            b += `<text x="${x}" y="146" class="__s" style="font-size:11.5px">(${esc(r.language.name)})</text>`;
            x += (r.language.name.length + 3) * 6.6 + 8;
        }
        b += star(x, 136, 12, `fill="${k.ink}"`) + `<text x="${x + 16}" y="146" class="__s" style="font-size:11.5px">${compact(r.stars)}</text>`;
        x += 30 + compact(r.stars).length * 7;
        b += fork(x, 135, 12, k.ink, 1.3) + `<text x="${x + 16}" y="146" class="__s" style="font-size:11.5px">${compact(r.forks)}</text>`;
        return card(HALF, 164, r.name, base(c, HALF, 164, b));
    },
    stack(c) {
        const k = pal(c);
        const items = c.c.stack ?? [];
        const per = 4;
        const rows = Math.max(1, Math.ceil(items.length / per));
        const h = 72 + rows * 38;
        let b = label(c, 24, 36, '05', 'Tools') + rule(c, 24, W - 24, 52);
        items.forEach((s, i) => {
            const x = 24 + (i % per) * 198;
            const y = 62 + Math.floor(i / per) * 38;
            const icon = findIcon(s);
            b += icon ? iconPath(icon, x, y + 6, 16, `fill="${k.ink}"`) : `<circle cx="${x + 8}" cy="${y + 14}" r="4" fill="${k.ink}"/>`;
            b += `<text x="${x + 26}" y="${y + 19}" class="__s" style="font-size:13.5px">${esc(truncate(stackTitle(s), 22))}</text>`;
            if (i % per === per - 1 || i === items.length - 1)
                b += rule(c, 24, W - 24, y + 32, 0.1);
        });
        return card(W, h, 'Tech stack', base(c, W, h, b));
    },
    social(c, s) {
        const k = pal(c);
        const icon = socialIcon(s.kind);
        const text = truncate(s.label, 30);
        const w = Math.round(40 + text.length * 12.5 * 0.56 + 40);
        return card(w, 36, s.kind, {
            fonts: ['sans400'],
            css: `.__t{${font('sans400', 12.5)};fill:${k.ink}}`,
            body: `<rect x=".75" y=".75" width="${w - 1.5}" height="34.5" rx="17.25" fill="${k.bg}" stroke="${k.ink}" stroke-opacity=".55"/>` +
                iconPath(icon, 15, 11, 14, `fill="${k.ink}"`) +
                `<text x="38" y="22.5" class="__t">${esc(text)}</text>` +
                arrow(w - 25, 13.5, k.ink),
        });
    },
    footer(c) {
        const seg = `Readme Atelier — ${c.name} — updated ${updatedLabel(c.p.fetchedAt)} — `;
        const run = (seg + seg + seg + seg).replace(/&/g, '');
        const b = rule(c, 0, W, 0.5, 0.14) +
            `<g class="__mq"><text x="0" y="46" class="__it" style="font-size:28px">${esc(run + run)}</text></g>`;
        return card(W, 68, 'Footer', base(c, W, 68, b));
    },
};
