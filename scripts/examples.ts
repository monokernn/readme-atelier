// Renders the README gallery (examples/<theme>/*.svg) from fictional demo profiles.
import fs from 'node:fs';
import path from 'node:path';
import { buildAssets } from '../src/build.js';
import { normalizeConfig, THEME_IDS } from '../src/config.js';
import { DEMO_CONFIG, demoProfile } from '../src/demo.js';

const users: Record<string, string> = { terminal: 'orbitalfox', y2k: 'nova-kim', pixel: 'orbitalfox', minimal: 'nova-kim', garden: 'lumen-ray', minecraft: 'orbitalfox' };
fs.rmSync('examples', { recursive: true, force: true });
for (const id of THEME_IDS) {
  const user = users[id];
  const cfg = normalizeConfig({ username: user, theme: id, ...DEMO_CONFIG[user] });
  const files = await buildAssets(demoProfile(user), cfg, path.join('examples', id));
  for (const [f, svg] of Object.entries(files)) {
    if (!/(header|stats|languages)(-dark)?\.svg$/.test(f)) continue;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, svg);
  }
}
console.log('examples written');
