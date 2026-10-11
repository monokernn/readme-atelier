import * as data from './data.js';
const MONO_FB = "ui-monospace,'SFMono-Regular',Menlo,Consolas,monospace";
const SANS_FB = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF_FB = "Georgia,'Times New Roman',serif";
export const FONTS = {
    mono400: { family: 'RA Mono', weight: 400, style: 'normal', fallback: MONO_FB },
    mono700: { family: 'RA Mono', weight: 700, style: 'normal', fallback: MONO_FB },
    unbounded400: { family: 'RA Unbounded', weight: 400, style: 'normal', fallback: SANS_FB },
    unbounded800: { family: 'RA Unbounded', weight: 800, style: 'normal', fallback: SANS_FB },
    silkscreen400: { family: 'RA Silkscreen', weight: 400, style: 'normal', fallback: MONO_FB },
    pixelify400: { family: 'RA Pixelify', weight: 400, style: 'normal', fallback: MONO_FB },
    pixelify700: { family: 'RA Pixelify', weight: 700, style: 'normal', fallback: MONO_FB },
    serif400: { family: 'RA Serif', weight: 400, style: 'normal', fallback: SERIF_FB },
    serif400i: { family: 'RA Serif', weight: 400, style: 'italic', fallback: SERIF_FB },
    sans400: { family: 'RA Sans', weight: 400, style: 'normal', fallback: SANS_FB },
    sans600: { family: 'RA Sans', weight: 600, style: 'normal', fallback: SANS_FB },
    fraunces400: { family: 'RA Fraunces', weight: 400, style: 'normal', fallback: SERIF_FB },
    fraunces700i: { family: 'RA Fraunces', weight: 700, style: 'italic', fallback: SERIF_FB },
};
/** CSS font-family value (with fallbacks) for a key. */
export function ff(key) {
    const m = FONTS[key];
    return `'${m.family}',${m.fallback}`;
}
/** Inline style fragment: family + weight + style. */
export function font(key, size) {
    const m = FONTS[key];
    return `font-family:${ff(key)};font-weight:${m.weight};font-style:${m.style};font-size:${size}px`;
}
let subsetter;
async function getSubsetter() {
    if (subsetter !== undefined)
        return subsetter;
    try {
        const mod = await import('subset-font');
        subsetter = (mod.default ?? mod);
    }
    catch {
        subsetter = null;
    }
    return subsetter;
}
function b64decode(s) {
    if (typeof Buffer !== 'undefined')
        return Buffer.from(s, 'base64');
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++)
        out[i] = bin.charCodeAt(i);
    return out;
}
function b64encode(u) {
    if (typeof Buffer !== 'undefined')
        return Buffer.from(u).toString('base64');
    let s = '';
    for (let i = 0; i < u.length; i++)
        s += String.fromCharCode(u[i]);
    return btoa(s);
}
const cache = new Map();
/**
 * @font-face rule for `key`, subset to `chars` when the subsetter is available
 * (Node: CLI, Action, server). Falls back to the pre-subset Latin font.
 */
export async function fontFace(key, chars) {
    const m = FONTS[key];
    const uniq = Array.from(new Set(Array.from(chars + ' '))).sort().join('');
    const ck = key + '|' + uniq;
    let b64 = cache.get(ck);
    if (!b64) {
        b64 = data[key];
        const sub = await getSubsetter();
        if (sub) {
            try {
                b64 = b64encode(await sub(b64decode(data[key]), uniq, { targetFormat: 'woff2' }));
            }
            catch {
                b64 = data[key];
            }
        }
        if (cache.size > 500)
            cache.clear();
        cache.set(ck, b64);
    }
    return `@font-face{font-family:'${m.family}';font-weight:${m.weight};font-style:${m.style};src:url(data:font/woff2;base64,${b64}) format('woff2')}`;
}
