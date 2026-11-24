# ncat-site

Marketing website for Takewon (Otaku Solutions). The dashboard itself is the private `ncat-dash` repo; buyers get that repo, never this one.

## Stack
- Next.js 16 App Router, React 19, TypeScript, pnpm. Plain CSS in `src/app/globals.css` (design tokens on `:root`); no Tailwind.
- Deployed on Vercel. Fonts via `next/font` (Geist, JetBrains Mono, Archivo).
- Early-access form posts to `src/app/api/early-access/route.ts`, which keeps the sign-up in Blob and emails it through toSend. Env vars are in `.env.example`.
- The homepage demo (`TryIt.tsx`, `src/lib/demo/`, `/api/demo/*`, `/clips/[id]`) runs a visitor’s video through the real toolkit after sign-up. Nothing on the site may pretend to process a video in the browser.

## Layout
- `src/app/` pages: `/` (home), `/pricing`, plus icon, share image, sitemap, robots, 404.
- `src/components/sections/` one component per page section. They started as a port of the design prototype (`/mnt/project-files/product-overview/nca-toolkit-dashboard.html`, published as the "NCA Toolkit Dashboard" artifact).
- `src/components/HomeEffects.tsx` motion and behaviour for the home page (respects reduced motion).

## Commands
- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm typecheck`
- `pnpm test` unit and component tests (Vitest)
- `pnpm test:e2e` browser tests on desktop and phone (Playwright)

## Rules
- Every change ships with automated tests (component and browser), without being asked.
- Design work uses the Impeccable skill (`.agents/skills/impeccable`).
- Real logos for every company or platform named; no stand-ins.
- Never invent a price, credit amount or stat. The product is named Takewon; Chowderr owns takewon.com (2026-11-21).
- Never say "no server required"; it runs on a rented server or the buyer's own always-on machine.
- Never mention Make or Zapier.
- Avoid heavy box outlines; group with space and soft tones. Nothing should overlay content.


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:1105d646 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/core-concepts/sync-concepts.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
