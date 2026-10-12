import { computeStreak } from './github.js';
import { rng } from './util.js';
/** Fictional profiles for previews and the gallery. No real people. */
export const DEMO_USERS = ['nova-kim', 'orbitalfox', 'lumen-ray'];
const LANGS = {
    TypeScript: '#3178c6', Rust: '#dea584', Python: '#3572A5', Go: '#00ADD8', Swift: '#F05138',
    GLSL: '#5686a5', Svelte: '#ff3e00', Kotlin: '#A97BFF', 'C++': '#f34b7d', Zig: '#ec915c', Lua: '#000080',
};
const PRESETS = {
    'nova-kim': {
        name: 'Nova Kim',
        bio: 'Design engineer. I make interfaces that feel alive.',
        langs: ['TypeScript', 'GLSL', 'Svelte', 'Rust', 'Python'],
        repos: [
            ['shader-garden', 'A tiny WebGL playground for growing procedural flowers.'],
            ['quiet-ui', 'Calm, accessible React components with motion that respects you.'],
            ['type-specimen', 'Generate beautiful type specimens from any variable font.'],
            ['dotfiles', 'Zsh, Neovim and a very opinionated terminal.'],
        ],
        location: 'Seoul',
        activity: 0.8,
    },
    orbitalfox: {
        name: 'Orbital Fox',
        bio: 'Systems programmer · compilers, game engines and small fast things.',
        langs: ['Rust', 'C++', 'Zig', 'Lua', 'Python'],
        repos: [
            ['voxel-forge', 'A data-oriented voxel engine written in Rust.'],
            ['tinyvm', 'Register-based bytecode VM in 2k lines of Zig.'],
            ['lua-jit-notes', 'Notes and benchmarks from a year of LuaJIT spelunking.'],
            ['rayfield', 'Signed distance field renderer for the terminal.'],
        ],
        location: 'Berlin',
        activity: 1,
    },
    'lumen-ray': {
        name: 'Lumen Ray',
        bio: 'ML engineer building small models that run anywhere.',
        langs: ['Python', 'Go', 'TypeScript', 'Kotlin', 'Swift'],
        repos: [
            ['pocket-llm', 'Quantised language models that fit on a phone.'],
            ['dataset-zen', 'Clean, dedupe and version datasets without the pain.'],
            ['go-vector', 'A minimal vector index in pure Go.'],
            ['notebook-theme', 'A soft dark theme for Jupyter.'],
        ],
        location: 'Lisbon',
        activity: 0.6,
    },
};
export const DEMO_CONFIG = {
    'nova-kim': {
        tagline: 'Design engineer making interfaces that feel alive',
        about: ['Shipping motion systems at a tiny studio', 'Currently: WebGPU + type design', 'Ask me about shaders and quiet UI'],
        stack: ['typescript', 'react', 'svelte', 'webgpu', 'figma', 'rust', 'blender', 'vercel'],
        socials: { x: 'novakim', website: 'nova.design', github: 'nova-kim' },
    },
    orbitalfox: {
        tagline: 'Compilers, engines and small fast things',
        about: ['Writing a voxel engine in Rust', 'Previously: game tooling at an indie studio', 'Open to weird low-level problems'],
        stack: ['rust', 'cplusplus', 'zig', 'lua', 'vulkan', 'linux', 'neovim', 'git'],
        socials: { x: 'orbitalfox', github: 'orbitalfox', bluesky: 'orbitalfox.bsky.social' },
    },
    'lumen-ray': {
        tagline: 'Small models that run anywhere',
        about: ['ML engineer focused on on-device inference', 'Quantisation, distillation, eval tooling', 'Writing about it on my blog'],
        stack: ['python', 'pytorch', 'go', 'docker', 'kubernetes', 'postgresql', 'huggingface', 'swift'],
        socials: { x: 'lumenray', website: 'lumen.dev', linkedin: 'lumenray', github: 'lumen-ray' },
    },
};
export function demoProfile(login = DEMO_USERS[0]) {
    const preset = PRESETS[login] ?? PRESETS['nova-kim'];
    const r = rng(login);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay());
    const calendar = [];
    let busy = 0.5;
    for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
        busy = Math.min(1, Math.max(0.05, busy + r.range(-0.12, 0.12)));
        const weekend = d.getUTCDay() === 0 || d.getUTCDay() === 6;
        const p = busy * preset.activity * (weekend ? 0.5 : 1);
        const count = r.next() < p ? Math.round(r.range(1, 14) * p * 1.6) : 0;
        calendar.push({ date: d.toISOString().slice(0, 10), count, level: 0 });
    }
    const max = Math.max(...calendar.map((d) => d.count), 1);
    for (const d of calendar)
        d.level = d.count === 0 ? 0 : Math.min(4, Math.ceil((d.count / max) * 4));
    const total = calendar.reduce((s, d) => s + d.count, 0);
    const weights = preset.langs.map((_, i) => 1 / (i + 1.4) + r.range(0, 0.1));
    const wsum = weights.reduce((a, b) => a + b, 0);
    const repos = preset.repos.map(([name, description], i) => ({
        name,
        owner: login,
        description,
        stars: Math.round((900 / (i + 1)) * r.range(0.4, 1.3)),
        forks: Math.round((90 / (i + 1)) * r.range(0.3, 1.2)),
        language: { name: preset.langs[i % preset.langs.length], color: LANGS[preset.langs[i % preset.langs.length]] },
        url: `https://github.com/${login}/${name}`,
    }));
    return {
        login,
        name: preset.name,
        bio: preset.bio,
        avatarUrl: '',
        avatar: demoAvatar(login, 160),
        avatarTiny: demoAvatar(login, 20),
        location: preset.location,
        followers: r.int(300, 4200),
        following: r.int(20, 180),
        publicRepos: r.int(24, 90),
        createdAt: `${r.int(2013, 2019)}-0${r.int(1, 9)}-1${r.int(0, 9)}T00:00:00Z`,
        stats: {
            stars: repos.reduce((s, x) => s + x.stars, 0) + r.int(100, 900),
            forks: repos.reduce((s, x) => s + x.forks, 0),
            commits: Math.round(total * 0.78),
            prs: Math.round(total * 0.09),
            issues: Math.round(total * 0.05),
            reviews: Math.round(total * 0.06),
            contributions: total,
            contributedTo: r.int(12, 60),
        },
        languages: preset.langs.map((name, i) => ({ name, color: LANGS[name], pct: (weights[i] / wsum) * 100 })),
        calendar,
        streak: computeStreak(calendar),
        repos,
        fetchedAt: new Date().toISOString(),
    };
}
/** A generated geometric avatar as an SVG data URI. */
function demoAvatar(login, size) {
    const r = rng(login + 'avatar');
    const hue = r.int(0, 360);
    const cells = [];
    for (let y = 0; y < 5; y++)
        for (let x = 0; x < 3; x++)
            if (r.chance(0.5)) {
                cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
                if (x < 2)
                    cells.push(`<rect x="${4 - x}" y="${y}" width="1" height="1"/>`);
            }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="-1 -1 7 7" shape-rendering="crispEdges"><rect x="-1" y="-1" width="7" height="7" fill="hsl(${hue},40%,92%)"/><g fill="hsl(${hue},60%,45%)">${cells.join('')}</g></svg>`;
    const b64 = typeof Buffer !== 'undefined' ? Buffer.from(svg).toString('base64') : btoa(svg);
    return `data:image/svg+xml;base64,${b64}`;
}
