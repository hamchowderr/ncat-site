# ncat-site

Marketing website for Takewon. The dashboard itself is the private `ncat-dash` repo; buyers get that repo, never this one.

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
- Never invent a price, credit amount or stat. The product is named Takewon; Chowderr owns takewon.com (2026-11-21). Never mention Otaku Solutions or chowderr.dev on the site (Chowderr, 2026-11-21).
- Never say "no server required"; it runs on a rented server or the buyer's own always-on machine.
- Never mention Make or Zapier.
- Avoid heavy box outlines; group with space and soft tones. Nothing should overlay content.
