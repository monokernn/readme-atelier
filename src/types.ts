export type ThemeId = 'terminal' | 'y2k' | 'pixel' | 'minimal' | 'garden' | 'minecraft';
export type Scheme = 'light' | 'dark';

export interface Language {
  name: string;
  color: string;
  /** Share of code across owned public repos, 0..100 */
  pct: number;
}

export interface Day {
  date: string;
  count: number;
  /** GitHub quartile, 0 (none) .. 4 (busiest) */
  level: 0 | 1 | 2 | 3 | 4;
}

export interface Repo {
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language?: { name: string; color: string };
  url: string;
}

export interface Profile {
  login: string;
  name: string;
  bio: string;
  avatarUrl: string;
  /** data: URI of a ~160px avatar, filled in by fetchProfile / demo */
  avatar?: string;
  /** data: URI of a ~20px avatar, used by pixel themes for a chunky look */
  avatarTiny?: string;
  location?: string;
  company?: string;
  website?: string;
  twitter?: string;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  stats: {
    stars: number;
    forks: number;
    commits: number;
    prs: number;
    issues: number;
    reviews: number;
    contributions: number;
    contributedTo: number;
  };
  languages: Language[];
  /** Last ~53 weeks, oldest first, always starting on a Sunday */
  calendar: Day[];
  streak: { current: number; longest: number };
  repos: Repo[];
  /** ISO timestamp of when the data was collected */
  fetchedAt: string;
}

export type SocialKind =
  | 'x' | 'github' | 'website' | 'linkedin' | 'telegram' | 'email'
  | 'youtube' | 'discord' | 'twitch' | 'bluesky' | 'instagram' | 'devto';

export interface Social {
  kind: SocialKind;
  /** handle / address / URL as typed by the user */
  value: string;
  url: string;
  label: string;
}

export type SectionId = 'header' | 'socials' | 'stats' | 'activity' | 'repos' | 'stack' | 'footer';

export interface AtelierConfig {
  username: string;
  theme: ThemeId;
  /** Display name override (defaults to GitHub name) */
  name?: string;
  /** One-liner under the name (defaults to GitHub bio) */
  tagline?: string;
  /** Up to 4 short lines about you */
  about?: string[];
  /** simple-icons slugs, e.g. ["typescript", "react", "rust"] */
  stack?: string[];
  socials?: Partial<Record<SocialKind, string>>;
  /** Featured repo names; defaults to pinned, then most-starred */
  repos?: string[];
  /** Section order; omit a section to hide it */
  sections?: SectionId[];
  /** Hex accent color override */
  accent?: string;
}

export interface Ctx {
  p: Profile;
  c: AtelierConfig;
  accent: string;
  scheme: Scheme;
  name: string;
  tagline: string;
  about: string[];
  socials: Social[];
}
