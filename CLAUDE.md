# `apexline-desktop` — agent context

**Read [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) first.** It is the single source of truth for codebase layout, module boundaries, IPC contracts, and conventions. Do not propose structural changes without consulting it.

## Quick orientation

- **Stack**: Electron + React 19 + TypeScript + Vite + TanStack Router (file-based, memory history) + Zustand + Zod + MSW + Vitest + Playwright + Tailwind v4 + `@apexline-app/apr` + Sentry
- **Layout**: `features/` (domain slices), `shared/` (cross-feature utils), `platform/` (main-process infra), `routes/` (thin TanStack wrappers)
- **Scripts**: `npm start` (dev), `npm test`, `npm run lint:types && npm run lint && npm run lint:format`, `npm run e2e`
- **Specs**: `~/apexline/docs/plans/auth.md`, `~/apexline/docs/mvp_status.md`, `~/apexline/docs/mvp_plan.md`

## Hard rules (excerpt — full list in `ARCHITECTURE.md`)

- Update `e2e/app-launch.spec.ts` **before** push when `routes/`, `__root.tsx`, `index.html` change
- `main.ts` imports feature handlers via direct path (`@/features/auth/main/handler`), NEVER through feature root barrel
- Routes are thin: import + render, no logic
- No `Co-Authored-By: Claude` in commits
- Conventional commits only
- Never push without explicit user authorization

## Working with new features

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) § "How to add a new feature" — 8-step checklist.
