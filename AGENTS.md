# AGENTS.md — building a GitHub profile with Readme Atelier

Instructions for coding agents (Claude Code and others) asked to "make my GitHub profile" with this tool.

## Principles

- **Never hand-draw the SVGs.** The generator renders them deterministically; your job is the words and the plumbing.
- **The user approves before anything is pushed.** Show the config and the preview first.
- Only public data is read. Do not ask for or store the user's tokens; the GitHub CLI's own auth is used for pushing.

## Workflow

1. **Ask** (or infer from the request): GitHub username, preferred style (`minimal`, `y2k`, `minecraft`, `terminal`, `pixel`, `garden` — show `npx -y github:monokernn/readme-atelier themes`), links to include.
2. **Research** the user's public repositories (`gh repo list <user> --limit 30 --json name,description,stargazerCount,primaryLanguage` or the GitHub API). Note what they actually build.
3. **Write `atelier.yml`** in an empty working folder:
   - `tagline`: one specific line, ≤ 60 chars, no buzzwords ("passionate", "rockstar", "ninja").
   - `about`: 2–4 lines ≤ 60 chars each: what they build now, what they did before, what to ask them about.
   - `stack`: 6–12 Simple Icons slugs matching their real languages and tools.
   - `repos`: up to 4 repos worth featuring (default is pinned → most starred).
   - Show the file to the user and wait for approval or edits.
4. **Build and preview:**
   ```bash
   GITHUB_TOKEN=$(gh auth token) npx -y github:monokernn/readme-atelier build --preview
   ```
   Open or describe `preview.html`. Iterate on words/theme if asked.
5. **Publish** once approved:
   ```bash
   npx -y github:monokernn/readme-atelier init --user <user>   # adds the daily-refresh workflow (keeps existing atelier.yml)
   gh repo view <user>/<user> >/dev/null 2>&1 || gh repo create <user>/<user> --public --description "My profile"
   ```
   If the repo already exists, clone it and copy the files in — the generated block goes between the `readme-atelier` markers and an existing README is backed up automatically. Commit `README.md`, `atelier/`, `atelier.yml`, `.github/workflows/readme-atelier.yml`, then push.
6. **Report** the profile URL `https://github.com/<user>` and mention that stats refresh daily and that editing `atelier.yml` on GitHub rebuilds it.

## Reference

- Config schema: see README → Config.
- `--demo` renders fictional profiles with no network.
- `--single` also writes one combined `profile.svg`.
