import { findIcon, iconPath, socialIcon, stackTitle } from '../icons.js';
import { font } from '../fonts/index.js';
import { compact, esc, fitSize, grouped, sinceYear, truncate, updatedLabel, wrap } from '../util.js';
import { HALF, W, card, contributionLine, fork, gridDays, monthLabels, star, statRows } from './shared.js';
const C = { bg: '#07090a', bar: '#0e1511', fg: '#c8f7d4', dim: '#5f8a6c', faint: '#14211a', line: '#1c2b22' };
const CW13 = 13 * 0.6; // JetBrains Mono advance at 13px
function css(accent) {
    return `
.__fg{fill:${C.fg}}.__dim{fill:${C.dim}}.__acc{fill:${accent}}
.__m{${font('mono400', 13)}}.__mb{${font('mono700', 13)}}
.__in{opacity:0;animation:__in .35s ease forwards}
@keyframes __in{to{opacity:1}}
.__cur{animation:__blink 1.05s steps(1) infinite}
@keyframes __blink{50%{opacity:0}}
.__crt{animation:__flick 5s ease-in-out infinite}
@keyframes __flick{0%,100%{opacity:.5}47%{opacity:.5}50%{opacity:.25}53%{opacity:.5}}
.__sweep{animation:__sweep 7s linear infinite}
@keyframes __sweep{from{transform:translateX(-120px)}to{transform:translateX(860px)}}`;
}
function defs(accent) {
    return `
<pattern id="__scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000"/></pattern>
<radialGradient id="__vig" cx="50%" cy="45%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".6"/></radialGradient>
<linearGradient id="__beam" x1="0" x2="1"><stop offset="0" stop-color="${accent}" stop-opacity="0"/><stop offset=".5" stop-color="${accent}" stop-opacity=".22"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
<filter id="__glow" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="2.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}
/** Window chrome + CRT overlays around `inner`. */
function win(c, w, h, title, inner) {
    return {
        w, h, title, radius: 12,
        fonts: ['mono400', 'mono700'],
        css: css(c.accent),
        defs: defs(c.accent),
        body: `<rect width="${w}" height="${h}" fill="${C.bg}"/>` +
            `<rect width="${w}" height="30" fill="${C.bar}"/>` +
            `<circle cx="18" cy="15" r="5" fill="#ff5f57" opacity=".85"/><circle cx="35" cy="15" r="5" fill="#febc2e" opacity=".85"/><circle cx="52" cy="15" r="5" fill="#28c840" opacity=".85"/>` +
            `<text x="${w / 2}" y="19.5" text-anchor="middle" class="__m __dim" style="font-size:12px">${esc(title)}</text>` +
            inner +
            `<rect width="${w}" height="${h}" fill="url(#__scan)" class="__crt" pointer-events="none"/>` +
            `<rect width="${w}" height="${h}" fill="url(#__vig)"/>` +
            `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="11.5" stroke="${c.accent}" stroke-opacity=".22"/>`,
    };
}
function prompt(x, y, cmd, delay = 0) {
    return `<text x="${x}" y="${y}" class="__m __in" style="animation-delay:${delay}s"><tspan class="__acc">$</tspan><tspan class="__dim"> ${esc(cmd)}</tspan></text>`;
}
export const terminal = {
    id: 'terminal',
    name: 'Phosphor',
    blurb: 'A CRT terminal with scanlines, glow, typed-in name and a neofetch readout.',
    accent: '#7cff9b',
    schemes: ['dark'],
    header(c) {
        const p = c.p;
        const size = fitSize(c.name, 54, 470, 0.6, 24);
        const cw = size * 0.6;
        const n = c.name.length;
        const nameW = n * cw;
        const dur = (0.25 + n * 0.07).toFixed(2);
        // CSS-only typing: the resting state is fully visible, so the name never depends on animation support
        const typing = `.__type{animation:__type ${dur}s steps(${n}) .3s both}` +
            `@keyframes __type{from{clip-path:inset(-30% 100% -30% -2%)}to{clip-path:inset(-30% -2% -30% -2%)}}` +
            `.__cm{animation:__cm ${dur}s steps(${n}) .3s both}` +
            `@keyframes __cm{from{transform:translateX(${(-nameW).toFixed(1)}px)}to{transform:none}}`;
        let left = `<style>${typing}</style>` +
            prompt(28, 66, 'whoami') +
            `<text x="28" y="128" class="__acc __type" filter="url(#__glow)" style="${font('mono700', size)};letter-spacing:0">${esc(c.name)}</text>` +
            `<g class="__cm"><rect x="${(34 + nameW).toFixed(1)}" y="${128 - size * 0.74}" width="${size * 0.5}" height="${size * 0.82}" fill="${c.accent}" class="__cur"/></g>`;
        let y = 166;
        const delay0 = 0.5 + n * 0.07;
        for (const line of wrap(c.tagline, 52, 2)) {
            left += `<text x="28" y="${y}" class="__m __in" style="font-size:14.5px;animation-delay:${delay0}s"><tspan class="__dim"># </tspan><tspan class="__fg">${esc(line)}</tspan></text>`;
            y += 22;
        }
        y += 6;
        c.about.slice(0, 4).forEach((line, i) => {
            left += `<text x="28" y="${y}" class="__m __in" style="animation-delay:${delay0 + 0.25 * (i + 1)}s"><tspan class="__acc">&gt; </tspan><tspan class="__fg" fill-opacity=".85">${esc(truncate(line, 58))}</tspan></text>`;
            y += 21;
        });
        const rows = [
            ['Repos', grouped(p.publicRepos)],
            ['Stars', grouped(p.stats.stars)],
            ['Followers', grouped(p.followers)],
            ['Commits', grouped(p.stats.commits) + ' / 12mo'],
            ['Streak', `${p.streak.current}d (best ${p.streak.longest}d)`],
            ['Since', sinceYear(p.createdAt)],
        ];
        if (p.location)
            rows.push(['Location', truncate(p.location, 22)]);
        const head = `${p.login}@github`;
        let right = `<text x="548" y="66" class="__mb __in" style="font-size:14px;animation-delay:.2s"><tspan class="__acc">${esc(p.login)}</tspan><tspan class="__fg">@</tspan><tspan class="__acc">github</tspan></text>` +
            `<text x="548" y="84" class="__m __dim">${'-'.repeat(Math.min(head.length, 34))}</text>`;
        rows.slice(0, 7).forEach(([k, v], i) => {
            right += `<text x="548" y="${106 + i * 21}" class="__m __in" style="animation-delay:${0.3 + i * 0.08}s"><tspan class="__acc" style="font-weight:700">${k}</tspan><tspan class="__fg">: ${esc(v)}</tspan></text>`;
        });
        const pal = ['#2a2f2c', '#ff5f57', '#febc2e', '#28c840', c.accent, '#4fc1ff', '#c678dd', '#e8efe9'];
        right += pal.map((col, i) => `<rect x="${548 + i * 30}" y="262" width="30" height="14" fill="${col}"/>`).join('');
        const h = Math.max(300, y + 14);
        return card(W, h, `${c.name} · GitHub profile`, {
            ...win(c, W, h, `${p.login}@github: ~`, left + `<line x1="520" y1="48" x2="520" y2="${h - 22}" stroke="${C.line}" stroke-dasharray="2 4"/>` + right),
            fonts: ['mono400', 'mono700'],
        });
    },
    stats(c) {
        const cols = Math.floor((HALF - 48) / CW13);
        let body = prompt(24, 62, 'atelier stats --last 12mo');
        statRows(c).forEach((r, i) => {
            const v = grouped(r.value);
            const dots = Math.max(2, cols - r.short.length - v.length - 2);
            body += `<text x="24" y="${94 + i * 22}" class="__m __in" style="animation-delay:${0.15 + i * 0.1}s"><tspan class="__fg">${r.short}</tspan><tspan class="__dim"> ${'.'.repeat(dots)} </tspan><tspan class="__acc" style="font-weight:700">${v}</tspan></text>`;
        });
        return card(HALF, 230, 'GitHub stats', { ...win(c, HALF, 230, `stats · ${c.p.login}`, body), fonts: ['mono400', 'mono700'] });
    },
    languages(c) {
        let body = prompt(24, 62, 'atelier langs --by-bytes');
        const langs = c.p.languages;
        const max = Math.max(...langs.map((l) => l.pct), 1);
        if (!langs.length)
            body += `<text x="24" y="96" class="__m __dim">no public code yet</text>`;
        langs.slice(0, 6).forEach((l, i) => {
            const y = 94 + i * 22;
            const filled = Math.max(1, Math.round((l.pct / max) * 14));
            body += `<g class="__in" style="animation-delay:${0.15 + i * 0.1}s"><rect x="24" y="${y - 9}" width="8" height="8" fill="${l.color}"/><text x="40" y="${y}" class="__m __fg">${esc(truncate(l.name, 12))}</text>`;
            for (let k = 0; k < 14; k++)
                body += `<rect x="${158 + k * 12}" y="${y - 10}" width="9" height="11" fill="${k < filled ? c.accent : C.faint}" ${k < filled ? `fill-opacity="${0.45 + (0.55 * k) / 14}"` : ''}/>`;
            body += `<text x="386" y="${y}" text-anchor="end" class="__m __dim">${l.pct.toFixed(1)}%</text></g>`;
        });
        return card(HALF, 230, 'Top languages', { ...win(c, HALF, 230, 'langs', body), fonts: ['mono400', 'mono700'] });
    },
    activity(c) {
        const days = gridDays(c);
        const op = [0, 0.3, 0.52, 0.76, 1];
        let cells = '';
        days.forEach((d, i) => {
            const x = 28 + Math.floor(i / 7) * 15;
            const y = 70 + (i % 7) * 15;
            cells += `<use href="#__c${d.level}" x="${x}" y="${y}"/>`;
        });
        const defs2 = `<rect id="__c0" width="12" height="12" rx="2" fill="${C.faint}"/>` +
            [1, 2, 3, 4].map((l) => `<rect id="__c${l}" width="12" height="12" rx="2" fill="${c.accent}" fill-opacity="${op[l]}"/>`).join('');
        const months = monthLabels(days).map((m) => `<text x="${28 + m.col * 15}" y="60" class="__m __dim" style="font-size:10.5px">${m.label}</text>`).join('');
        const legend = [0, 1, 2, 3, 4].map((l) => `<use href="#__c${l}" x="${714 + l * 15}" y="${196}"/>`).join('');
        const body = months +
            `<g>${cells}</g>` +
            `<clipPath id="__gclip"><rect x="28" y="70" width="795" height="105"/></clipPath>` +
            `<g clip-path="url(#__gclip)"><rect class="__sweep" x="0" y="70" width="120" height="105" fill="url(#__beam)"/></g>` +
            `<text x="28" y="206" class="__m"><tspan class="__acc">$</tspan><tspan class="__fg"> ${esc(contributionLine(c))}</tspan></text>` +
            `<text x="706" y="206" text-anchor="end" class="__m __dim" style="font-size:11px">less</text>${legend}<text x="${714 + 5 * 15 + 2}" y="206" class="__m __dim" style="font-size:11px">more</text>`;
        const w = win(c, W, 228, 'activity · last 12 months', body);
        return card(W, 228, 'Contribution activity', { ...w, defs: w.defs + defs2, fonts: ['mono400', 'mono700'] });
    },
    repo(c, r) {
        let body = `<text x="22" y="66" class="__mb __acc" style="font-size:17px" filter="url(#__glow)">${esc(truncate(r.name, 32))}</text>`;
        wrap(r.description || 'No description yet.', 46, 2).forEach((l, i) => {
            body += `<text x="22" y="${92 + i * 18}" class="__m __fg" fill-opacity=".8" style="font-size:12.5px">${esc(l)}</text>`;
        });
        let x = 22;
        body += star(x, 124, 13, `fill="${c.accent}"`) + `<text x="${x + 18}" y="135" class="__m __fg">${compact(r.stars)}</text>`;
        x += 30 + compact(r.stars).length * CW13;
        body += fork(x, 123, 14, c.accent) + `<text x="${x + 19}" y="135" class="__m __fg">${compact(r.forks)}</text>`;
        x += 34 + compact(r.forks).length * CW13;
        if (r.language)
            body += `<circle cx="${x + 5}" cy="130.5" r="5" fill="${r.language.color}"/><text x="${x + 15}" y="135" class="__m __dim">${esc(r.language.name)}</text>`;
        return card(HALF, 152, r.name, { ...win(c, HALF, 152, `~/${truncate(r.owner + '/' + r.name, 40)}`, body), fonts: ['mono400', 'mono700'] });
    },
    stack(c) {
        const items = c.c.stack ?? [];
        const per = 6;
        const rows = Math.max(1, Math.ceil(items.length / per));
        const h = 76 + rows * 36;
        let body = prompt(24, 62, 'ls ~/stack');
        items.forEach((s, i) => {
            const x = 24 + (i % per) * 132;
            const y = 82 + Math.floor(i / per) * 36;
            const icon = findIcon(s);
            body += `<g class="__in" style="animation-delay:${0.1 + i * 0.05}s">`;
            body += icon ? iconPath(icon, x, y, 18, `fill="${c.accent}"`) : `<rect x="${x + 3}" y="${y + 3}" width="12" height="12" fill="${c.accent}"/>`;
            body += `<text x="${x + 26}" y="${y + 14}" class="__m __fg">${esc(truncate(stackTitle(s), 12))}</text></g>`;
        });
        return card(W, h, 'Tech stack', { ...win(c, W, h, 'stack', body), fonts: ['mono400', 'mono700'] });
    },
    social(c, s) {
        const icon = socialIcon(s.kind);
        const text = truncate(s.label, 30);
        const w = Math.round(16 + 16 + 10 + text.length * CW13 + 16);
        return card(w, 36, s.kind, {
            fonts: ['mono400'],
            css: `.__t{${font('mono400', 13)};fill:${C.fg}}`,
            body: `<rect x=".5" y=".5" width="${w - 1}" height="35" rx="8" fill="${C.bg}" stroke="${c.accent}" stroke-opacity=".5"/>` +
                iconPath(icon, 16, 10, 16, `fill="${c.accent}"`) +
                `<text x="42" y="22.5" class="__t">${esc(text)}</text>`,
        });
    },
    footer(c) {
        const body = `<text x="24" y="34" class="__m"><tspan class="__acc">$</tspan><tspan class="__fg"> exit</tspan></text><rect x="82" y="23" width="8" height="14" fill="${c.accent}" class="__cur"/>` +
            `<text x="${W - 24}" y="34" text-anchor="end" class="__m __dim" style="font-size:11.5px">updated ${updatedLabel(c.p.fetchedAt)} · built with Readme Atelier</text>`;
        return card(W, 56, 'Footer', {
            radius: 12,
            fonts: ['mono400'],
            css: css(c.accent),
            body: `<rect width="${W}" height="56" fill="${C.bg}"/>` + body + `<rect x=".5" y=".5" width="${W - 1}" height="55" rx="11.5" stroke="${c.accent}" stroke-opacity=".22"/>`,
        });
    },
};
