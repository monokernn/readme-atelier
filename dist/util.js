/** Escape text for SVG/XML. Underscores are encoded so they never collide with `__` id scoping. */
export function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/_/g, '&#95;');
}
export function compact(n) {
    if (n >= 1e6)
        return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
    if (n >= 1e4)
        return Math.round(n / 1e3) + 'k';
    if (n >= 1e3)
        return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    return String(n);
}
export function grouped(n) {
    return n.toLocaleString('en-US');
}
export function truncate(s, max) {
    s = (s || '').trim();
    return s.length > max ? s.slice(0, Math.max(0, max - 1)).trimEnd() + '…' : s;
}
/** Greedy word wrap by character count. */
export function wrap(s, max, maxLines = 99) {
    const words = (s || '').trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const w of words) {
        if (!line)
            line = w;
        else if ((line + ' ' + w).length <= max)
            line += ' ' + w;
        else {
            lines.push(line);
            line = w;
        }
    }
    if (line)
        lines.push(line);
    if (lines.length > maxLines) {
        const cut = lines.slice(0, maxLines);
        cut[maxLines - 1] = truncate(cut[maxLines - 1] + ' ' + lines[maxLines], max);
        return cut;
    }
    return lines.map((l) => truncate(l, max));
}
export function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}
/** Deterministic PRNG (mulberry32). */
export function rng(seed) {
    let a = typeof seed === 'string' ? hash(seed) : seed >>> 0;
    const next = () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    return {
        next,
        range: (lo, hi) => lo + next() * (hi - lo),
        int: (lo, hi) => Math.floor(lo + next() * (hi - lo + 1)),
        pick: (arr) => arr[Math.floor(next() * arr.length)],
        chance: (p) => next() < p,
    };
}
export function hexToRgb(hex) {
    let h = hex.replace('#', '');
    if (h.length === 3)
        h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h.slice(0, 6), 16) || 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function rgbToHex(r, g, b) {
    const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return '#' + c(r) + c(g) + c(b);
}
export function mix(a, b, t) {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}
export function rgba(hex, a) {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
}
export function luminance(hex) {
    const [r, g, b] = hexToRgb(hex).map((v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function isHex(s) {
    return typeof s === 'string' && /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(s.trim());
}
export function normHex(s) {
    s = s.trim();
    return s.startsWith('#') ? s : '#' + s;
}
export const f = (n) => +n.toFixed(2);
export function sinceYear(iso) {
    const d = new Date(iso);
    return isNaN(+d) ? '' : String(d.getUTCFullYear());
}
export function updatedLabel(iso) {
    const d = new Date(iso);
    if (isNaN(+d))
        return '';
    return d.toISOString().slice(0, 10);
}
/** Group calendar days into weeks (columns of 7). */
export function weeks(days) {
    const out = [];
    for (let i = 0; i < days.length; i += 7)
        out.push(days.slice(i, i + 7));
    return out;
}
/** Rough text width estimate in px for a given font-size and average glyph factor. */
export function textWidth(s, size, factor = 0.56) {
    return s.length * size * factor;
}
/** Shrink a font size so `s` fits into `max` px. */
export function fitSize(s, size, max, factor = 0.56, min = 12) {
    const w = textWidth(s, size, factor);
    return w <= max ? size : Math.max(min, Math.floor((size * max) / w));
}
