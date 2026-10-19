---
name: readme-atelier
description: Build or restyle the user's GitHub profile README with Readme Atelier — six animated styles (terminal, y2k, pixel, minimal, garden, minecraft), live stats, daily auto-refresh. Use when the user asks to make, design, update or restyle their GitHub profile / profile README.
---

# Readme Atelier — GitHub profile builder

You produce the **words and config**; the generator renders the visuals. Never draw SVGs by hand.

## 1. Gather
- GitHub username (try `gh api user --jq .login` if they are signed in to `gh`).
- Style. If unsure, list them: `npx -y github:monokernn/readme-atelier themes`.
  `minimal` (editorial, light+dark) · `y2k` (deep-blue dreamcore) · `minecraft` (blocky sandbox) · `terminal` (CRT/neofetch) · `pixel` (lofi pixel city) · `garden` (floating island).
- Links to show (X, website, LinkedIn, Telegram, Bluesky, email…).

## 2. Research their work
`gh repo list <user> --limit 30 --json name,description,stargazerCount,primaryLanguage,updatedAt`
Read descriptions and a couple of READMEs of the most relevant repos.

## 3. Draft `atelier.yml` in a fresh folder
```yaml
username: <user>
theme: <style>
tagline: <one specific line, ≤ 60 chars>
about:
  - <what they build now>
  - <previous / background>
  - <what to ask them about>
stack: [<6–12 simpleicons slugs from their real stack>]
socials: { x: <handle>, github: <user>, website: <domain> }
repos: [<up to 4 repos worth featuring>]
```
Voice: concrete, lowercase-friendly, no buzzwords. **Show it and wait for approval.**

## 4. Preview
```bash
GITHUB_TOKEN=$(gh auth token) npx -y github:monokernn/readme-atelier build --preview
```
Tell the user to open `preview.html` (or summarise what was generated). Iterate on request.

## 5. Publish (only after an explicit yes)
```bash
npx -y github:monokernn/readme-atelier init --user <user>
gh repo view <user>/<user> >/dev/null 2>&1 || gh repo create <user>/<user> --public --description "My profile"
```
- New repo: `git init`, add `README.md atelier atelier.yml .github`, commit, set remote `https://github.com/<user>/<user>.git`, push to `main`.
- Existing repo: clone it, copy the files in (the README block is merged between markers; an old README is backed up to `atelier/README.backup.md`), commit, push.

## 6. Finish
Share `https://github.com/<user>`. Mention: stats refresh daily via the workflow; edit `atelier.yml` on GitHub to change anything; if the workflow reports a permission error, enable *Settings → Actions → General → Workflow permissions → Read and write*.
