import { parse, stringify } from 'yaml';
import type { AtelierConfig, Ctx, Profile, Scheme, SectionId, Social, SocialKind, ThemeId } from './types.js';
import { isHex, normHex } from './util.js';

export const THEME_IDS: ThemeId[] = ['terminal', 'y2k', 'pixel', 'minimal', 'garden', 'minecraft'];
export const SECTION_IDS: SectionId[] = ['header', 'socials', 'stats', 'activity', 'repos', 'stack', 'footer'];
export const SOCIAL_KINDS: SocialKind[] = [
  'x', 'github', 'website', 'linkedin', 'telegram', 'email', 'youtube', 'discord', 'twitch', 'bluesky', 'instagram', 'devto',
];

export function defaultConfig(username: string, theme: ThemeId = 'terminal'): AtelierConfig {
  return {
    username,
    theme,
    stack: [],
    socials: { github: username },
    sections: [...SECTION_IDS],
  };
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

/** Validate and clean an untrusted config object. */
export function normalizeConfig(raw: any, fallbackUser = ''): AtelierConfig {
  raw = raw && typeof raw === 'object' ? raw : {};
  const username = (str(raw.username, 39) || fallbackUser).replace(/^@/, '');
  const theme: ThemeId = THEME_IDS.includes(raw.theme) ? raw.theme : 'terminal';
  const cfg: AtelierConfig = { username, theme };
  const name = str(raw.name, 40);
  if (name) cfg.name = name;
  const tagline = str(raw.tagline, 90);
  if (tagline) cfg.tagline = tagline;
  if (Array.isArray(raw.about)) cfg.about = raw.about.map((l: unknown) => str(l, 72)).filter(Boolean).slice(0, 4);
  else if (typeof raw.about === 'string') cfg.about = raw.about.split('\n').map((l: string) => l.trim().slice(0, 72)).filter(Boolean).slice(0, 4);
  const stack = Array.isArray(raw.stack) ? raw.stack : typeof raw.stack === 'string' ? raw.stack.split(',') : [];
  cfg.stack = stack.map((s: unknown) => str(s, 30)).filter(Boolean).slice(0, 24);
  if (raw.socials && typeof raw.socials === 'object') {
    cfg.socials = {};
    for (const k of SOCIAL_KINDS) {
      const v = raw.socials[k];
      if (v === true && k === 'github') cfg.socials.github = username;
      else if (str(v, 120)) cfg.socials[k] = str(v, 120);
    }
  }
  if (Array.isArray(raw.repos)) cfg.repos = raw.repos.map((r: unknown) => str(r, 100)).filter(Boolean).slice(0, 6);
  if (Array.isArray(raw.sections)) {
    const s = raw.sections.filter((x: any) => SECTION_IDS.includes(x));
    cfg.sections = s.length ? Array.from(new Set(s)) : [...SECTION_IDS];
  } else cfg.sections = [...SECTION_IDS];
  if (isHex(raw.accent)) cfg.accent = normHex(raw.accent);
  return cfg;
}

export function parseConfigYaml(text: string, fallbackUser = ''): AtelierConfig {
  return normalizeConfig(parse(text) ?? {}, fallbackUser);
}

export function configToYaml(cfg: AtelierConfig): string {
  const clean: any = { ...cfg };
  for (const k of Object.keys(clean)) {
    const v = clean[k];
    if (v === undefined || (Array.isArray(v) && !v.length)) delete clean[k];
  }
  return (
    '# Readme Atelier — edit this file, commit, and your profile rebuilds itself.\n' +
    '# Themes: terminal · y2k · pixel · minimal · garden · minecraft\n' +
    '# Docs: https://github.com/monokernn/readme-atelier#config\n\n' +
    stringify(clean, { lineWidth: 0 })
  );
}

function b64urlEncode(s: string): string {
  const b64 = typeof Buffer !== 'undefined'
    ? Buffer.from(s, 'utf8').toString('base64')
    : btoa(String.fromCharCode(...new TextEncoder().encode(s)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64').toString('utf8');
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Compact URL-safe encoding of a config (for hosted image URLs). */
export function encodeConfig(cfg: AtelierConfig): string {
  const c: any = { ...cfg };
  if (c.sections && c.sections.join() === SECTION_IDS.join()) delete c.sections;
  for (const k of Object.keys(c)) if (c[k] === undefined || (Array.isArray(c[k]) && !c[k].length)) delete c[k];
  return b64urlEncode(JSON.stringify(c));
}

export function decodeConfig(s: string): AtelierConfig {
  return normalizeConfig(JSON.parse(b64urlDecode(s)));
}

function handle(v: string, hostRe: RegExp): string {
  v = v.trim();
  const m = v.match(hostRe);
  if (m) return m[1];
  return v.replace(/^@/, '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

export function resolveSocials(cfg: AtelierConfig): Social[] {
  const out: Social[] = [];
  const s = cfg.socials || {};
  for (const kind of Object.keys(s) as SocialKind[]) {
    const v = s[kind];
    if (!v || !SOCIAL_KINDS.includes(kind)) continue;
    let url = '';
    let label = '';
    switch (kind) {
      case 'x': { const h = handle(v, /(?:x|twitter)\.com\/([^/?#]+)/i); url = `https://x.com/${h}`; label = '@' + h; break; }
      case 'github': { const h = handle(v, /github\.com\/([^/?#]+)/i); url = `https://github.com/${h}`; label = h; break; }
      case 'linkedin': { const h = handle(v, /linkedin\.com\/in\/([^/?#]+)/i); url = `https://www.linkedin.com/in/${h}`; label = h; break; }
      case 'telegram': { const h = handle(v, /t\.me\/([^/?#]+)/i); url = `https://t.me/${h}`; label = '@' + h; break; }
      case 'youtube': { const h = handle(v, /youtube\.com\/@?([^/?#]+)/i); url = `https://www.youtube.com/@${h}`; label = '@' + h; break; }
      case 'twitch': { const h = handle(v, /twitch\.tv\/([^/?#]+)/i); url = `https://twitch.tv/${h}`; label = h; break; }
      case 'bluesky': { const h = handle(v, /bsky\.app\/profile\/([^/?#]+)/i); url = `https://bsky.app/profile/${h}`; label = '@' + h; break; }
      case 'instagram': { const h = handle(v, /instagram\.com\/([^/?#]+)/i); url = `https://instagram.com/${h}`; label = '@' + h; break; }
      case 'devto': { const h = handle(v, /dev\.to\/([^/?#]+)/i); url = `https://dev.to/${h}`; label = h; break; }
      case 'email': { const e = v.replace(/^mailto:/i, '').trim(); url = `mailto:${e}`; label = e; break; }
      case 'discord': { url = /^https?:\/\//.test(v) ? v : 'https://discord.com'; label = v.replace(/^https?:\/\/(www\.)?/, ''); break; }
      case 'website': { url = /^https?:\/\//.test(v) ? v : `https://${v}`; label = v.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); break; }
    }
    out.push({ kind, value: v, url, label });
  }
  return out;
}

export function makeCtx(p: Profile, c: AtelierConfig, accent: string, scheme: Scheme): Ctx {
  return {
    p,
    c,
    accent: c.accent || accent,
    scheme,
    name: c.name || p.name || p.login,
    tagline: c.tagline ?? p.bio ?? '',
    about: c.about ?? [],
    socials: resolveSocials(c),
  };
}
