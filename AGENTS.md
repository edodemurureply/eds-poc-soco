# AGENTS.md

AEM Edge Delivery Services site (Universal Editor / xwalk), based on
https://github.com/adobe-rnd/aem-boilerplate-xwalk. Vanilla JS/CSS, no build step.
Follow the boilerplate's existing patterns.

## Repositories
- `C:\Users\091\src\job\reply\eds-poc-soco`: EDS migration target. Make changes here.
- `C:\Users\091\src\job\reply\southern_company`: legacy AEM reference (source under
  `legacy\global` and `legacy\instance`). Read-only unless explicitly asked.
- Complete and verify one migration step before starting the next.

## Hard rules
- This repo is PUBLIC. Never write client data or analysis into it; analysis goes in
  `southern_company\analisi\`.
- Never run `git commit`. Stage only task-related files and describe the commit.
- Never modify `scripts/aem.js`.
- Run `aem` / `npx @adobe/aem-cli` from PowerShell, not Git Bash (it mangles paths).

## Commands
- Dev server: `aem up --no-open --forward-browser-logs` (add `--html-folder drafts` for
  static test content in `drafts/`). Runs at http://localhost:3000.
- After editing partial models (`_*.json`): `npm run build:json`, then `npm run lint`.
- Inspect content cheaply: prefer `curl <url>.md` or `.plain.html` over full `.html`.

## Environments
- Preview: `https://{branch}--eds-poc-soco--edodemurureply.aem.page/`.
  A `/` in the branch name becomes `-` (e.g. `feature/x` -> `feature-x`).

## References
- Docs search: `curl -s https://www.aem.live/docpages-index.json | jq -r '.data[] | select(.content | test("KEYWORD"; "i")) | "\(.path): \(.title)"'`
- EDS/UE lessons and pitfalls: `docs/knowledge/eds-ue-lessons.md`. Read only the section
  relevant to the task. Experiment history (`docs/knowledge/experiments-archive.md`) only
  when explicitly asked.
- UE and preview testing workflow (URLs, `?ref=`): `FLOW.md`, only when testing in UE.
