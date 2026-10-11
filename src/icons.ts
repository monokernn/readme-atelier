import * as si from 'simple-icons';
import type { SocialKind } from './types.js';

export interface Icon {
  slug: string;
  title: string;
  hex: string;
  /** SVG path data in a 24×24 box */
  path: string;
}

let bySlug: Map<string, Icon> | null = null;
let byTitle: Map<string, Icon> | null = null;

function index() {
  if (bySlug) return;
  bySlug = new Map();
  byTitle = new Map();
  for (const v of Object.values(si as Record<string, any>)) {
    if (!v || typeof v !== 'object' || !v.slug || !v.path) continue;
    const icon: Icon = { slug: v.slug, title: v.title, hex: '#' + v.hex, path: v.path };
    bySlug.set(v.slug, icon);
    byTitle.set(String(v.title).toLowerCase().replace(/\s+/g, ''), icon);
  }
}

const ALIASES: Record<string, string> = {
  ts: 'typescript', js: 'javascript', node: 'nodedotjs', nodejs: 'nodedotjs', next: 'nextdotjs',
  nextjs: 'nextdotjs', vue: 'vuedotjs', vuejs: 'vuedotjs', nuxt: 'nuxtdotjs', 'c++': 'cplusplus',
  cpp: 'cplusplus', golang: 'go', postgres: 'postgresql', tailwind: 'tailwindcss', k8s: 'kubernetes',
  three: 'threedotjs', threejs: 'threedotjs', express: 'express', gcp: 'googlecloud', py: 'python',
  sveltekit: 'svelte', tf: 'terraform', mongo: 'mongodb', vscode: 'vscodium', solid: 'solid',
  'c#': 'dotnet', csharp: 'dotnet', '.net': 'dotnet', dotnet: 'dotnet', deno: 'deno', bun: 'bun',
};

export function findIcon(name: string): Icon | undefined {
  index();
  const raw = name.trim().toLowerCase();
  if (!raw) return;
  const tries = [
    ALIASES[raw],
    raw,
    raw.replace(/\s+/g, ''),
    raw.replace(/\s+/g, '').replace(/\./g, 'dot').replace(/\+/g, 'plus').replace(/#/g, 'sharp'),
  ].filter(Boolean) as string[];
  for (const t of tries) {
    const hit = bySlug!.get(t) || byTitle!.get(t);
    if (hit) return hit;
  }
  return;
}

/** Display title for a stack entry even when no icon exists. */
export function stackTitle(name: string): string {
  return findIcon(name)?.title ?? name.trim();
}

const CUSTOM: Record<string, Icon> = {
  email: {
    slug: 'email', title: 'Email', hex: '#EA4335',
    path: 'M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5zm2.2.5L12 11.6 19.8 6zM20 8.1l-8 5.7-8-5.7V18h16z',
  },
  website: {
    slug: 'website', title: 'Website', hex: '#4A90E2',
    path: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4a13.8 13.8 0 0 1 1.9 4h-3.8A13.8 13.8 0 0 1 12 4zM4.3 14a8.1 8.1 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4zm.8 2h3a15.7 15.7 0 0 0 1.4 3.6A8 8 0 0 1 5.1 16zm3-8h-3a8 8 0 0 1 4.4-3.6A15.7 15.7 0 0 0 8.1 8zM12 20a13.8 13.8 0 0 1-1.9-4h3.8A13.8 13.8 0 0 1 12 20zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.2 5.6a15.7 15.7 0 0 0 1.4-3.6h3a8 8 0 0 1-4.4 3.6zm1.8-5.6a16.5 16.5 0 0 0 0-4h3.4a8.1 8.1 0 0 1 0 4z',
  },
  linkedin: {
    slug: 'linkedin', title: 'LinkedIn', hex: '#0A66C2',
    path: 'M3 3h18v18H3zm3.3 7.2V18h2.5v-7.8zm1.2-3.9a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9zM10.6 10.2V18h2.5v-4.1c0-1.1.2-2.1 1.6-2.1s1.4 1.3 1.4 2.2v4h2.5v-4.5c0-2.2-.5-3.9-3-3.9a2.6 2.6 0 0 0-2.4 1.3v-1.1z',
  },
};

const SOCIAL_SLUG: Record<SocialKind, string> = {
  x: 'x', github: 'github', website: 'website', linkedin: 'linkedin', telegram: 'telegram',
  email: 'email', youtube: 'youtube', discord: 'discord', twitch: 'twitch', bluesky: 'bluesky',
  instagram: 'instagram', devto: 'devdotto',
};

export function socialIcon(kind: SocialKind): Icon {
  const slug = SOCIAL_SLUG[kind];
  return CUSTOM[slug] ?? findIcon(slug) ?? CUSTOM.website;
}

/** `<path>` for an icon scaled into a `size` box at (x, y). */
export function iconPath(icon: Icon, x: number, y: number, size: number, attrs = ''): string {
  const s = size / 24;
  return `<path transform="translate(${x} ${y}) scale(${+s.toFixed(4)})" d="${icon.path}" ${attrs}/>`;
}
