import type { Day, Language, Profile, Repo } from './types.js';

const API = 'https://api.github.com';

const QUERY = `query($login:String!){
  user(login:$login){
    login name bio avatarUrl location company websiteUrl twitterUsername createdAt
    followers{totalCount} following{totalCount}
    repositories(ownerAffiliations:OWNER,isFork:false,privacy:PUBLIC,first:100,orderBy:{field:STARGAZERS,direction:DESC}){
      totalCount
      nodes{name description stargazerCount forkCount url isArchived owner{login}
        primaryLanguage{name color}
        languages(first:8,orderBy:{field:SIZE,direction:DESC}){edges{size node{name color}}}}
    }
    pinnedItems(first:6,types:REPOSITORY){nodes{... on Repository{name description stargazerCount forkCount url owner{login} primaryLanguage{name color}}}}
    contributionsCollection{
      totalCommitContributions totalPullRequestContributions totalIssueContributions
      totalPullRequestReviewContributions restrictedContributionsCount
      contributionCalendar{totalContributions weeks{contributionDays{date contributionCount contributionLevel}}}
    }
    repositoriesContributedTo(first:1,contributionTypes:[COMMIT,PULL_REQUEST,ISSUE,REPOSITORY]){totalCount}
  }
}`;

const LEVEL: Record<string, Day['level']> = {
  NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4,
};

export class GitHubError extends Error {
  constructor(message: string, public status = 500) {
    super(message);
  }
}

async function gh(path: string, token?: string, init: RequestInit = {}) {
  const res = await fetch(path.startsWith('http') ? path : API + path, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'readme-atelier',
      ...(token ? { authorization: `bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (res.status === 404) throw new GitHubError('GitHub user not found', 404);
  if (!res.ok) throw new GitHubError(`GitHub API ${res.status}: ${(await res.text()).slice(0, 200)}`, res.status);
  return res.json();
}

async function toDataUri(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'readme-atelier' } });
    if (!res.ok) return;
    const type = res.headers.get('content-type') || 'image/png';
    const buf = new Uint8Array(await res.arrayBuffer());
    const b64 = typeof Buffer !== 'undefined' ? Buffer.from(buf).toString('base64') : btoa(String.fromCharCode(...buf));
    return `data:${type};base64,${b64}`;
  } catch {
    return;
  }
}

function sized(url: string, s: number) {
  return url + (url.includes('?') ? '&' : '?') + 's=' + s;
}

export function computeStreak(days: Day[]): { current: number; longest: number } {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--; // today may not have activity yet
  for (; i >= 0 && days[i].count > 0; i--) current++;
  return { current, longest };
}

function aggregateLanguages(nodes: any[]): Language[] {
  const map = new Map<string, { color: string; size: number }>();
  for (const r of nodes) {
    for (const e of r.languages?.edges ?? []) {
      const cur = map.get(e.node.name) ?? { color: e.node.color || '#8b8b8b', size: 0 };
      cur.size += e.size;
      map.set(e.node.name, cur);
    }
  }
  const total = Array.from(map.values()).reduce((s, v) => s + v.size, 0) || 1;
  return Array.from(map.entries())
    .map(([name, v]) => ({ name, color: v.color, pct: (v.size / total) * 100 }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);
}

function toRepo(n: any): Repo {
  return {
    name: n.name,
    owner: n.owner?.login ?? '',
    description: n.description ?? '',
    stars: n.stargazerCount ?? 0,
    forks: n.forkCount ?? 0,
    language: n.primaryLanguage ? { name: n.primaryLanguage.name, color: n.primaryLanguage.color || '#8b8b8b' } : undefined,
    url: n.url,
  };
}

export interface FetchOptions {
  token?: string;
  /** Repo names to feature, in order */
  featured?: string[];
  /** Skip downloading avatars (faster previews) */
  noAvatar?: boolean;
}

/** Collect everything the themes need. GraphQL requires a token; without one a reduced REST fallback is used. */
export async function fetchProfile(login: string, opts: FetchOptions = {}): Promise<Profile> {
  login = login.trim().replace(/^@/, '');
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(login)) throw new GitHubError('Invalid GitHub username', 400);
  const p = opts.token ? await viaGraphQL(login, opts.token) : await viaRest(login);
  if (opts.featured?.length) {
    const picked = opts.featured
      .map((n) => p.repos.find((r) => r.name.toLowerCase() === n.toLowerCase()) ?? allRepos.get(login)?.find((r) => r.name.toLowerCase() === n.toLowerCase()))
      .filter(Boolean) as Repo[];
    if (picked.length) p.repos = picked;
  }
  allRepos.delete(login);
  if (!opts.noAvatar) {
    const [big, tiny] = await Promise.all([toDataUri(sized(p.avatarUrl, 160)), toDataUri(sized(p.avatarUrl, 20))]);
    p.avatar = big;
    p.avatarTiny = tiny;
  }
  return p;
}

// all owned repos per login, kept briefly so `featured` can pick beyond the top list
const allRepos = new Map<string, Repo[]>();

async function viaGraphQL(login: string, token: string): Promise<Profile> {
  const json = await gh('/graphql', token, {
    method: 'POST',
    body: JSON.stringify({ query: QUERY, variables: { login } }),
    headers: { 'content-type': 'application/json' },
  });
  if (json.errors?.length) {
    const msg = json.errors[0].message || 'GraphQL error';
    throw new GitHubError(msg, /could not resolve/i.test(msg) ? 404 : 502);
  }
  const u = json.data?.user;
  if (!u) throw new GitHubError('GitHub user not found', 404);
  const owned: any[] = (u.repositories.nodes ?? []).filter((r: any) => !r.isArchived);
  allRepos.set(login, owned.map(toRepo));
  const cc = u.contributionsCollection;
  const calendar: Day[] = cc.contributionCalendar.weeks.flatMap((w: any) =>
    w.contributionDays.map((d: any) => ({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 })),
  );
  // pad the first week so the grid starts on Sunday
  const first = calendar[0] ? new Date(calendar[0].date + 'T00:00:00Z').getUTCDay() : 0;
  for (let i = 0; i < first; i++) calendar.unshift({ date: '', count: 0, level: 0 });
  const pinned = (u.pinnedItems.nodes ?? []).filter((n: any) => n && n.owner?.login?.toLowerCase() === login.toLowerCase());
  const repos = (pinned.length ? pinned : owned).slice(0, 6).map(toRepo);
  return {
    login: u.login,
    name: u.name || u.login,
    bio: u.bio || '',
    avatarUrl: u.avatarUrl,
    location: u.location || undefined,
    company: u.company || undefined,
    website: u.websiteUrl || undefined,
    twitter: u.twitterUsername || undefined,
    followers: u.followers.totalCount,
    following: u.following.totalCount,
    publicRepos: u.repositories.totalCount,
    createdAt: u.createdAt,
    stats: {
      stars: owned.reduce((s, r) => s + r.stargazerCount, 0),
      forks: owned.reduce((s, r) => s + r.forkCount, 0),
      commits: cc.totalCommitContributions + cc.restrictedContributionsCount,
      prs: cc.totalPullRequestContributions,
      issues: cc.totalIssueContributions,
      reviews: cc.totalPullRequestReviewContributions,
      contributions: cc.contributionCalendar.totalContributions,
      contributedTo: u.repositoriesContributedTo.totalCount,
    },
    languages: aggregateLanguages(owned),
    calendar,
    streak: computeStreak(calendar.filter((d) => d.date)),
    repos,
    fetchedAt: new Date().toISOString(),
  };
}

/** Token-less fallback: no contribution calendar, languages by primary language only. */
async function viaRest(login: string): Promise<Profile> {
  const [u, list] = await Promise.all([
    gh(`/users/${login}`),
    gh(`/users/${login}/repos?per_page=100&type=owner&sort=pushed`),
  ]);
  const owned = (list as any[]).filter((r) => !r.fork && !r.archived);
  const counts = new Map<string, number>();
  for (const r of owned) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;
  const repos: Repo[] = owned
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .map((r) => ({
      name: r.name, owner: login, description: r.description ?? '', stars: r.stargazers_count, forks: r.forks_count,
      language: r.language ? { name: r.language, color: '#8b8b8b' } : undefined, url: r.html_url,
    }));
  allRepos.set(login, repos);
  return {
    login: u.login,
    name: u.name || u.login,
    bio: u.bio || '',
    avatarUrl: u.avatar_url,
    location: u.location || undefined,
    company: u.company || undefined,
    website: u.blog || undefined,
    twitter: u.twitter_username || undefined,
    followers: u.followers,
    following: u.following,
    publicRepos: u.public_repos,
    createdAt: u.created_at,
    stats: { stars: repos.reduce((s, r) => s + r.stars, 0), forks: repos.reduce((s, r) => s + r.forks, 0), commits: 0, prs: 0, issues: 0, reviews: 0, contributions: 0, contributedTo: 0 },
    languages: Array.from(counts.entries()).map(([name, n]) => ({ name, color: '#8b8b8b', pct: (n / total) * 100 })).sort((a, b) => b.pct - a.pct).slice(0, 6),
    calendar: [],
    streak: { current: 0, longest: 0 },
    repos: repos.slice(0, 6),
    fetchedAt: new Date().toISOString(),
  };
}
