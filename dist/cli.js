#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildAssets, buildSingleFile, mergeReadme, readmeBlock, workflowYaml, ASSET_DIR } from './build.js';
import { configToYaml, defaultConfig, normalizeConfig, parseConfigYaml, THEME_IDS } from './config.js';
import { DEMO_CONFIG, demoProfile } from './demo.js';
import { fetchProfile } from './github.js';
import { THEMES } from './themes/index.js';
const HELP = `readme-atelier — designed, self-updating GitHub profile READMEs

Usage
  readme-atelier init   [--user <login>] [--theme <id>]     write atelier.yml + workflow
  readme-atelier build  [options]                           generate README.md + SVGs
  readme-atelier themes                                     list themes

Build options
  --config <file>   config file (default: atelier.yml)
  --user <login>    GitHub username (overrides config)
  --theme <id>      ${THEME_IDS.join(' | ')}
  --out <dir>       output directory (default: .)
  --demo            use a fictional demo profile (no network)
  --single          also write profile.svg + README.single.md (one-file variant)
  --preview         write preview.html next to the README

Environment
  GITHUB_TOKEN      required for contribution data (the Action provides it)
  ATELIER_USER      fallback username (the Action sets the repo owner)`;
function args(argv) {
    const out = {};
    const pos = [];
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith('--')) {
            const key = a.slice(2);
            const next = argv[i + 1];
            if (next && !next.startsWith('--')) {
                out[key] = next;
                i++;
            }
            else
                out[key] = true;
        }
        else
            pos.push(a);
    }
    return { flags: out, pos };
}
function write(file, content) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
}
function previewHtml(readme, title) {
    const body = readme.replace(/<!--[\s\S]*?-->/g, '');
    return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
body{margin:0;background:#0d1117;color:#e6edf3;font:14px -apple-system,Segoe UI,Helvetica,Arial,sans-serif}
@media (prefers-color-scheme: light){body{background:#fff;color:#1f2328}}
main{max-width:880px;margin:32px auto;padding:24px;border:1px solid #30363d;border-radius:8px}
p{margin:0 0 16px} img{max-width:100%}
</style></head><body><main>${body}</main></body></html>`;
}
async function main() {
    const { flags, pos } = args(process.argv.slice(2));
    const cmd = pos[0] ?? 'build';
    if (flags.help || cmd === 'help')
        return console.log(HELP);
    if (cmd === 'themes') {
        for (const t of Object.values(THEMES))
            console.log(`${t.id.padEnd(10)} ${t.name.padEnd(12)} ${t.blurb}`);
        return;
    }
    const out = String(flags.out ?? '.');
    const user = String(flags.user ?? process.env.ATELIER_USER ?? '');
    if (cmd === 'init') {
        const theme = (THEME_IDS.includes(flags.theme) ? flags.theme : 'terminal');
        const cfg = defaultConfig(user || 'your-username', theme);
        const cfgPath = path.join(out, 'atelier.yml');
        if (fs.existsSync(cfgPath))
            console.log('atelier.yml already exists — left untouched');
        else
            write(cfgPath, configToYaml(cfg));
        write(path.join(out, '.github/workflows/readme-atelier.yml'), workflowYaml());
        console.log('✓ wrote atelier.yml and .github/workflows/readme-atelier.yml');
        return;
    }
    if (cmd !== 'build') {
        console.error(`Unknown command "${cmd}"\n\n${HELP}`);
        process.exit(1);
    }
    const cfgFile = String(flags.config ?? path.join(out, 'atelier.yml'));
    let cfg;
    if (fs.existsSync(cfgFile))
        cfg = parseConfigYaml(fs.readFileSync(cfgFile, 'utf8'), user);
    else if (flags.demo)
        cfg = normalizeConfig({ username: user || 'nova-kim', ...DEMO_CONFIG[user || 'nova-kim'] });
    else
        cfg = defaultConfig(user);
    if (flags.user)
        cfg.username = String(flags.user);
    if (!cfg.username || cfg.username === 'your-username')
        cfg.username = user;
    for (const [k, v] of Object.entries(cfg.socials ?? {}))
        if (v === 'your-username')
            cfg.socials[k] = cfg.username;
    if (flags.theme && THEME_IDS.includes(flags.theme))
        cfg.theme = flags.theme;
    if (!cfg.username && !flags.demo)
        throw new Error('No username — pass --user or set username in atelier.yml');
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.INPUT_TOKEN;
    if (!token && !flags.demo)
        console.warn('! GITHUB_TOKEN not set — contribution graph and commit stats will be empty');
    const profile = flags.demo ? demoProfile(cfg.username || 'nova-kim') : await fetchProfile(cfg.username, { token, featured: cfg.repos });
    const assets = await buildAssets(profile, cfg, ASSET_DIR);
    // clear stale cards (e.g. a removed social) before writing
    const dir = path.join(out, ASSET_DIR);
    if (fs.existsSync(dir))
        for (const f of fs.readdirSync(dir))
            if (f.endsWith('.svg'))
                fs.rmSync(path.join(dir, f));
    for (const [file, svg] of Object.entries(assets))
        write(path.join(out, file), svg);
    const readmePath = path.join(out, 'README.md');
    const existing = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : null;
    if (existing && !existing.includes('<!-- readme-atelier:start -->') && !existing.includes('readme-atelier:placeholder')) {
        write(path.join(out, ASSET_DIR, 'README.backup.md'), existing);
        console.log(`• previous README saved to ${ASSET_DIR}/README.backup.md`);
    }
    const readme = mergeReadme(existing?.includes('readme-atelier:placeholder') ? null : existing, readmeBlock(profile, cfg, { kind: 'files' }));
    write(readmePath, readme);
    if (flags.single) {
        const single = await buildSingleFile(profile, cfg);
        write(path.join(out, 'profile.svg'), single.svg);
        write(path.join(out, 'README.single.md'), single.readme);
    }
    if (flags.preview)
        write(path.join(out, 'preview.html'), previewHtml(readme, `${cfg.username} — preview`));
    const kb = Object.values(assets).reduce((s, v) => s + v.length, 0) / 1024;
    console.log(`✓ ${THEMES[cfg.theme].name} profile for @${profile.login}: ${Object.keys(assets).length} cards (${kb.toFixed(0)} KB)`);
}
main().catch((e) => {
    console.error('✗', e instanceof Error ? e.message : e);
    process.exit(1);
});
