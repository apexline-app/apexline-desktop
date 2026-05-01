# Architecture — `apexline-desktop`

> Single source of truth for codebase layout, module boundaries, and conventions.
> All AI agents and contributors **must read this** before modifying or adding files.

## Stack

- **Electron** (main + preload + renderer)
- **React 19** + **TanStack Router** (file-based, memory history)
- **TypeScript** strict, `@/*` path alias → `src/*`
- **Vite** via `@electron-forge/plugin-vite` (3 configs: `main`, `preload`, `renderer`)
- **Zustand** for renderer state (per-feature, never global)
- **Zod** for cross-process contract validation
- **MSW** for API mocking (worker in renderer, server in main + Vitest)
- **Vitest** unit/integration, **Playwright + electron** for e2e
- **Tailwind v4** + `@apexline-app/apr` design system
- **Sentry** (`@sentry/electron`) main + renderer with PII scrubber

## Three layers

```text
src/
├── features/        ← domain slices — where business logic lives
├── shared/          ← cross-feature utilities (API helpers, IPC infrastructure)
├── platform/        ← main-process-only infrastructure (storage, observability)
├── routes/          ← thin TanStack Router file-based routes (no logic)
├── mocks/           ← MSW orchestration only (browser/node setup)
├── test/            ← Vitest setup + smoke tests
├── main.ts / preload.ts / renderer.ts / app.tsx
└── *.css, global.d.ts, route-tree.gen.ts
```

### `features/<domain>/` — feature slices

Each feature is a self-contained domain unit. Layout:

```text
features/<domain>/
├── index.ts                # PUBLIC API barrel — only this is imported from outside
├── contracts.ts            # types + Zod schemas + IPC channel maps (cross-process)
├── main/                   # main-process only (ipcMain handlers, services)
│   └── handler.ts
├── model/                  # renderer state (Zustand stores, hooks)
│   ├── use-<x>-store.ts
│   └── use-<x>-store.test.ts
├── ui/                     # renderer React (components, feature-local hooks)
│   └── *.tsx
├── api/                    # (optional) request fns specific to this feature
└── mocks/                  # (optional) MSW handlers for this feature's endpoints
    ├── index.ts            # exports `<feature>MockHandlers`
    └── *.ts
```

Real example: see `src/features/auth/`.

### `shared/` — cross-cutting utilities

```text
shared/
├── api/                    # auth-fetch, api-paths, api-mode, envelope helpers
├── ipc/                    # validation (Zod helper), types (Commands/Events union)
├── lib/                    # universal utils (will fill out as needed)
└── types/                  # cross-feature TS types (will fill out as needed)
```

`shared/` is consumed by `features/`, **never** the other way around.

### `platform/` — main-process infrastructure

```text
platform/
├── storage/                # encrypted-storage (safeStorage), file-storage (atomic writes)
├── observability/          # Sentry init-main, init-renderer, beforeSend scrubber
├── window/                 # (future) window state mgmt
└── updater/                # (future) auto-updater
```

Process-bound infrastructure. **Renderer code never imports from `platform/`** (except `observability/init-renderer.ts` which is renderer-side by design).

## Boundary rules — enforced by code review

1. **Only `features/<x>/index.ts` may be imported from outside the feature.** Internal files (`features/auth/model/use-auth-store.ts`) are private. Use `eslint-plugin-boundaries` if enforcement is needed.
2. **Features do not import from other features.** If `dashboard` needs data from `series`, either (a) `series` exposes a hook/type via `features/series/index.ts` and `dashboard` imports through the public API, or (b) shared state moves to `shared/`. Pick (a) when the dependency is one-directional; pick (b) when both features need it.
3. **`shared/` and `platform/` never import from `features/`.** Dependency graph is one-way: `routes → features → shared + platform`.
4. **Main-side and renderer-side of a feature communicate ONLY via `contracts.ts` + IPC channels.** Direct imports across the process boundary will explode at runtime.
5. **`shared/ipc/types.ts` aggregates `Commands` / `Events` from all feature contracts.** When adding a new feature with IPC, add its `<X>Commands` / `<X>Events` to the union there.
6. **Routes are thin.** No `useState`, no `useEffect`, no business logic in `routes/*.tsx`. Just `import { X } from '@/features/x'` and render. UI lives in `features/<x>/ui/`.

## Critical pitfall — Vite main bundle

**`src/main.ts` must import feature handlers directly**, NOT through the feature root barrel:

```ts
// ✅ correct — main.ts
import { registerAuthHandlers } from '@/features/auth/main/handler';

// ❌ wrong — pulls React UI into main-process bundle
import { registerAuthHandlers } from '@/features/auth';
```

The feature barrel (`features/auth/index.ts`) re-exports UI components. Vite tree-shaking is not perfect for Electron multi-bundle setups, and React/Tailwind code in main bundle bloats startup and breaks `process.env`-only code.

## IPC contract pattern

Every feature with IPC defines in its `contracts.ts`:

```ts
import { z } from '@/shared/ipc/validation';

// 1. Zod input schemas (validated in main via withValidation)
export const SignInInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

// 2. Discriminated union for state events
export const AuthStateSchema = z.discriminatedUnion('status', [...]);
export type AuthState = z.infer<typeof AuthStateSchema>;

// 3. Typed Commands / Events maps
export type AuthCommands = {
  'auth:sign-in': {
    request: z.infer<typeof SignInInputSchema>;
    response: { ok: true; requires2fa: boolean };
  };
  // ...
};
export type AuthEvents = {
  'auth:state-changed': AuthState;
};
```

Then in `shared/ipc/types.ts`, add to the union:

```ts
import type { AuthCommands, AuthEvents } from '@/features/auth/contracts';
export type Commands = SettingsCommands & AuthCommands & /* new feature */;
```

`preload.ts` exposes a single `window.api.invoke(channel, payload)` typed by `Commands`.

## How to add a new feature

1. **Create** `src/features/<name>/{index.ts, contracts.ts}` minimum
2. **Add IPC** if needed: `main/handler.ts` + register call in `src/main.ts` (direct import)
3. **Add state** if needed: `model/use-<name>-store.ts` (Zustand) or `model/use-<name>.ts` (custom hook)
4. **Add UI** if needed: `ui/<component>.tsx`
5. **Add MSW handlers** if needed: `mocks/index.ts` exports `<name>MockHandlers`, add to `src/mocks/handlers.ts`
6. **Update `shared/ipc/types.ts`** with new Commands/Events
7. **Add route** if user-facing: `routes/<name>.tsx` as thin `<Component />` wrapper
8. **Update e2e spec** (`e2e/app-launch.spec.ts`) if shell layout changes — see "Hard rule" below

## When to promote feature-local code to `shared/`

Code starts in `features/<x>/` (local utility, helper, type). Promote to `shared/` when **2+ features need it**. Don't promote preemptively — premature shared = wrong abstraction.

## Hard rules — agents must respect

- **Playwright e2e spec (`e2e/app-launch.spec.ts`) is a portrait of current shell, not a regression suite.** Any change to `routes/`, `__root.tsx`, `index.html` title, sidebar nav, auth flow → update spec **before** push. CI will fail otherwise.
- **No `Co-Authored-By: Claude` or "🤖 Generated with Claude Code" footers** in commits or PR descriptions.
- **Commits are conventional** (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`).
- **Never push to remote without explicit user authorization** — except squash-merge after explicit "merge"/"zmerguj" instruction.
- **Update return types only when non-obvious.** No `: void`, `: boolean`, `: string` for functions where TS can infer. Domain types (`User`, `ErrorEvent`, `Result<T>`) can stay.
- **Zod v4 syntax**: `z.email()` not `z.string().email()`, `z.url()` not `z.string().url()`.
- **React event types**: `import { type FormEvent } from 'react'` + `FormEvent<HTMLFormElement>`. Never `React.FormEvent`.

## Reference docs

- **Auth flow**: `~/apexline/docs/plans/auth.md` (hybrid embedded + Google federation)
- **MVP status**: `~/apexline/docs/mvp_status.md` (current phase + decision log)
- **MVP plan**: `~/apexline/docs/mvp_plan.md` (W1-W20 deliverables)
- **HTTP toolkit blueprint** (future): `~/apexline/docs-md/http-toolkit-js.md`
- **Architecture research** that produced this layout: based on real-world patterns from `desktop/desktop` (GitHub Desktop), `laurent22/joplin`, `mattermost/desktop`, and `polubis/gon-stack`.

## Current feature inventory

| Feature      | Status                          | Phase                                                 |
| ------------ | ------------------------------- | ----------------------------------------------------- |
| `auth`       | implemented (MSW-backed)        | Phase 0 — sign-in / sign-up / 2FA / Google federation |
| `settings`   | implemented                     | foundational                                          |
| `telemetry`  | foundation only (no-op source)  | Phase 1+ — iRacing SDK integration in MVP+ (W11+)     |
| `series`     | not started                     | W4                                                    |
| `dashboard`  | not started                     | W5                                                    |
| `replays`    | not started                     | MVP+                                                  |
| `pit-wall`   | not started (locked in sidebar) | MVP+ (W11+)                                           |
| `onboarding` | not started                     | W3                                                    |

## Migration history

- **2026-05-01** — initial feature-based migration from flat `stores/`, `hooks/`, `ipc/`, `lib/`, `main/`, `sentry/` layout. Reference: PR #18 (this commit).
