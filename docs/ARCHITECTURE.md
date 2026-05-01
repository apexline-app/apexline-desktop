# Architecture — `apexline-desktop`

> Single source of truth for codebase layout, module boundaries, and conventions.
> All AI agents and contributors **must read this** before modifying or adding files.

## Stack

- **Electron** (main + preload + renderer)
- **React 19** + **TanStack Router** (file-based, memory history)
- **TypeScript** strict, `@/*` path alias → `src/*`
- **Vite** via `@electron-forge/plugin-vite` (3 configs: `main`, `preload`, `renderer`)
- **Zustand** for renderer **client state** (per-feature, never global) — auth status, UI prefs, local-only data
- **TanStack Query** for renderer **server state** — `/me`, `/series`, anything fetched from `apexline-api`. `QueryClientProvider` wraps the app in `src/app.tsx`; defaults in `src/shared/api/query-client.ts`.
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
├── contracts/              # types + Zod schemas + IPC channel maps (cross-process)
│   ├── index.ts            # barrel re-exporting all schemas/types
│   ├── <entity>.ts         # domain entity (e.g. user.ts, auth-state.ts)
│   ├── <endpoint>.ts       # one file per endpoint (e.g. sign-in.ts, sign-up.ts)
│   └── commands.ts         # <X>Commands + <X>Events maps (aggregates types)
├── main/                   # main-process only (ipcMain handlers, services)
│   ├── handler.ts          # IPC registration + state orchestration
│   └── api.ts              # HTTP wrappers — domain-named functions over getApiClient()
├── model/                  # renderer client state (Zustand stores)
│   ├── use-<x>-store.ts
│   └── use-<x>-store.test.ts
├── api/                    # renderer server-state hooks (TanStack Query / Mutation)
│   ├── use-<endpoint>.ts   # one file per endpoint
│   └── index.ts            # barrel
├── ui/                     # renderer React components
│   └── *.tsx
└── mocks/                  # (optional) MSW handlers for this feature's endpoints
    ├── index.ts            # exports `<feature>MockHandlers`
    └── *.ts
```

Real example: see `src/features/auth/`.

> Small features (≤4 schemas / 1-2 endpoints) MAY collapse `contracts/` into a flat `contracts.ts`. Example: `features/telemetry/` has 3 tightly-coupled types (`LapSample`, `TelemetryMessage`, channel constant) — kept flat for proximity. **Default for new features**: `contracts/` folder. Promote to flat only when staying small forever is obvious.

### `shared/` — cross-cutting utilities

```text
shared/
├── api/                    # http-client (toolkit singleton: initApiClient/getApiClient), auth-fetch (OAuth raw), api-paths, api-mode, envelope re-exports
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
4. **Main-side and renderer-side of a feature communicate ONLY via feature contracts (`contracts/` by default, `contracts.ts` only for tiny features) + IPC channels.** Direct imports across the process boundary will explode at runtime.
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

Every feature with IPC defines its contracts in `features/<x>/contracts/` — one file per endpoint, plus `commands.ts` aggregator.

**Per-endpoint file** — schema + type co-located:

```ts
// features/auth/contracts/sign-in.ts
import { z } from '@/shared/ipc/validation';

export const SignInInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type SignInInput = z.infer<typeof SignInInputSchema>;

export const SignInResponseSchema = z.object({
  ok: z.literal(true),
  requires2fa: z.boolean(),
});
export type SignInResponse = z.infer<typeof SignInResponseSchema>;
```

**Domain entities** stay in their own files (e.g. `user.ts`, `auth-state.ts`):

```ts
// features/auth/contracts/auth-state.ts
import { z } from '@/shared/ipc/validation';

import { UserSchema } from './user';

export const AuthStateSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('unauthenticated') }),
  z.object({ status: z.literal('awaiting-2fa') }),
  z.object({ status: z.literal('authenticated'), user: UserSchema }),
]);
export type AuthState = z.infer<typeof AuthStateSchema>;
```

**`commands.ts` aggregates named types** — never inline `z.infer<typeof X>`:

```ts
// features/auth/contracts/commands.ts
import type { AuthState } from './auth-state';
import type { OkResponse } from './ok-response';
import type { SignInInput, SignInResponse } from './sign-in';
import type { SignUpInput } from './sign-up';
import type { Verify2faInput } from './verify-2fa';

export type AuthCommands = {
  'auth:sign-in': { request: SignInInput; response: SignInResponse };
  'auth:sign-up': { request: SignUpInput; response: OkResponse };
  'auth:verify-2fa': { request: Verify2faInput; response: OkResponse };
  'auth:start-google-login': { request: void; response: OkResponse };
  'auth:logout': { request: void; response: OkResponse };
  'auth:get-state': { request: void; response: AuthState };
  'auth:get-access-token': { request: void; response: string };
};

export type AuthEvents = {
  'auth:state-changed': AuthState;
};
```

**`index.ts` is a plain barrel** — consumers import from `@/features/<x>/contracts`, never from internal files:

```ts
// features/auth/contracts/index.ts
export { AuthStateSchema, type AuthState } from './auth-state';
export type { AuthCommands, AuthEvents } from './commands';
export { OkResponseSchema, type OkResponse } from './ok-response';
export {
  SignInInputSchema,
  SignInResponseSchema,
  type SignInInput,
  type SignInResponse,
} from './sign-in';
// ...
```

**Aggregate at the platform level** — `shared/ipc/types.ts` unions all feature command maps:

```ts
import type { AuthCommands, AuthEvents } from '@/features/auth/contracts';
import type {
  SettingsCommands,
  SettingsEvents,
} from '@/features/settings/contracts';

export type Commands = SettingsCommands & AuthCommands;
export type Events = SettingsEvents & AuthEvents;
```

`preload.ts` exposes a single `window.api.invoke(channel, payload)` typed by `Commands`.

### Naming rules

- File name: `kebab-case`, matches endpoint or entity (`sign-in.ts`, `verify-2fa.ts`, `auth-state.ts`, `user.ts`)
- Schema: `PascalCase` + `Schema` suffix (`SignInInputSchema`, `UserSchema`)
- Type: `PascalCase` **without** `Schema` suffix (`SignInInput`, `User`)
- Commands map: `<Feature>Commands` (`AuthCommands`, `SettingsCommands`)
- Events map: `<Feature>Events`

### When to keep contracts flat

Single-file `contracts.ts` is acceptable when the feature has **≤4 schemas/types** and they're tightly coupled (e.g. `features/telemetry/contracts.ts` with `LapSample` + `TelemetryMessage` + channel constant). Split to `contracts/` folder when:

- Feature has 5+ schemas/types
- Endpoints are independent (different request/response shapes)
- New endpoints are likely (planned in `mvp_status.md` / `auth.md`)

Default for new features: **folder**. Promote to flat only when staying small forever is obvious.

## Renderer query / mutation pattern

Hooks live in `features/<x>/api/`, **one file per endpoint**.

### Mutations

```ts
// features/auth/api/use-sign-in.ts
import { useMutation } from '@tanstack/react-query';

import type { SignInInput } from '@/features/auth/contracts';

const signIn = async (input: SignInInput) => {
  const result = await window.api.invoke('auth:sign-in', input);
  return { requires2fa: result.requires2fa };
};

export const useSignIn = () => useMutation({ mutationFn: signIn });
```

### Queries

```ts
// features/settings/api/use-settings-query.ts
import { useQuery } from '@tanstack/react-query';

export const settingsQueryKey = ['settings'] as const;

const fetchSettings = () => window.api.invoke('settings:get-all', undefined);

export const useSettingsQuery = () =>
  useQuery({
    queryKey: settingsQueryKey,
    queryFn: fetchSettings,
    staleTime: Infinity,
  });
```

### Rules

- **`mutationFn` / `queryFn` is a named module-level function** — never inline arrow. Self-documenting in stack traces; reusable in `prefetchQuery` and tests without spinning up the hook.
- **Query keys are exported constants** (`settingsQueryKey`, `seriesListQueryKey(filters)`) — never inline literals scattered across UI. Hierarchical for invalidation.
- **Consumers destructure with rename**, extract only used fields:

```tsx
// ✅
const { mutate: signIn, isPending, error } = useSignIn();
const { data: settings } = useSettingsQuery();

// ❌
const signIn = useSignIn();
signIn.mutate(...);
```

Multi-mutation in one component: rename every field to avoid collisions:

```tsx
const {
  mutate: signIn,
  isPending: signInPending,
  error: signInError,
} = useSignIn();
const {
  mutate: startGoogleLogin,
  isPending: googlePending,
  error: googleError,
} = useStartGoogleLogin();
```

## Data fetching — IPC-first pattern + TanStack Query

### Strategy: IPC-first (all network in main, renderer wraps via IPC)

```text
main process    = trust boundary + network surface
                  → owns OAuth token lifecycle (sign-in, refresh rotation, safeStorage)
                  → owns ALL HTTP calls to apexline-api (via toolkit-js httpClient)
                  → owns iRacing SDK (irsdk-node — native module, main-only)
                  → owns background workers (sync, cron, telemetry prefetch)
                  → exposes per-feature IPC handlers (`series:list`, `me:get`, ...)

renderer        = presentation + cache layer
                  → calls window.api.invoke('feature:operation', payload)
                  → TanStack Query owns cache, dedup, retry, refetch, invalidation
                  → NEVER directly fetches from apexline-api or iRacing
                  → NEVER holds tokens (not even ephemeral — main proxies everything)
```

This mirrors **Next.js Server Actions** pattern: client components call typed RPC functions; the actual network/auth/data work happens server-side. In Electron, "server" = main process.

**Why IPC-first**:

- **iRacing SDK forces it** — `irsdk-node` (and analogous bindings) are native Node addons. Renderer sandbox + contextIsolation has no access. iRacing telemetry, session data, and race results MUST pipe through main. Splitting "REST through renderer, iRacing through main" would be inconsistent.
- **Background workers without duplication** — iRacing cookie refresh (every 6h), telemetry prefetch, sync jobs all live in main. Each worker reuses the same `httpClient` and endpoint definitions as the IPC handlers — single source of truth for URLs / headers / transforms.
- **Tokens 100% isolated** — never appear in renderer process memory, not even ephemerally per-request.
- **API encapsulation** — renderer knows only channel names (`'series:list'`). Endpoint URLs, query shapes, response transforms live in `features/<x>/main/handler.ts`. API redesign or versioning bumps don't ripple into renderer.
- **Single network surface** — one place for retry policy, Sentry breadcrumbs, structured logs, circuit breaker.
- **Modern React idiom** — analogous to Next.js Server Actions / RSC patterns the codebase user already knows.

### Per-feature `api/` segment (renderer)

Queries and mutations live in `features/<x>/api/`:

```text
features/series/api/
├── use-series-list.ts       # useQuery wrapper around series:list IPC
├── use-track-series.ts      # useMutation wrapper around series:track IPC
└── use-untrack-series.ts
```

Anatomy of a query:

```ts
// features/series/api/use-series-list.ts
import { useQuery } from '@tanstack/react-query';

import type { SeriesFilters } from '@/features/series/contracts';

export const seriesListQueryKey = (filters: SeriesFilters) =>
  ['series', filters] as const;

const fetchSeriesList = (filters: SeriesFilters) =>
  window.api.invoke('series:list', filters);

export const useSeriesList = (filters: SeriesFilters) =>
  useQuery({
    queryKey: seriesListQueryKey(filters),
    queryFn: () => fetchSeriesList(filters),
  });
```

Mutation with invalidation:

```ts
// features/series/api/use-track-series.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

const trackSeries = (pid: string) => window.api.invoke('series:track', { pid });

export const useTrackSeries = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: trackSeries,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['series'] }),
  });
};
```

### Per-feature `main/` segment

Each feature with API endpoints exposes IPC handlers via the generic `createApiHandler` factory (post-toolkit-js install):

```ts
// features/series/main/handler.ts
import {
  type Series,
  SeriesFiltersSchema,
  TrackSeriesInputSchema,
} from '@/features/series/contracts';
import { fromResult, httpClient } from '@/shared/api/http-client';
import { createApiHandler } from '@/shared/ipc/api-handler';

export const registerSeriesHandlers = () => {
  createApiHandler('series:list', SeriesFiltersSchema, filters =>
    fromResult(httpClient.get<Series[]>('/api/v1/series', { query: filters })),
  );

  createApiHandler('series:track', TrackSeriesInputSchema, ({ pid }) =>
    fromResult(httpClient.post(`/api/v1/series/${pid}/track`, {})),
  );
};
```

Register from `src/main.ts` directly (NOT through feature root barrel — Vite bundle pitfall):

```ts
import { registerSeriesHandlers } from '@/features/series/main/handler';

registerSeriesHandlers();
```

### Query key conventions

- **Tuple-first**, descriptive: `['me']`, `['series', { tracked: true }]`, `['series', seriesPid, 'schedule']`
- Per-feature constants exported from `api/` files (`seriesListQueryKey(filters)`) — never inline literals scattered across UI
- Hierarchical for invalidation: `qc.invalidateQueries({ queryKey: ['series'] })` invalidates all series queries

### Server state vs client state

Server state (anything fetched via IPC from `apexline-api` / iRacing SDK) lives in **TanStack Query**. Client state (auth status, UI prefs, ephemeral local flags) stays in **Zustand**. Don't mix — never mirror server state into Zustand stores.

### Don'ts

- ❌ Don't `fetch()` directly from renderer — all network goes through main IPC handlers
- ❌ Don't put endpoint URLs in renderer code — they live in `features/<x>/main/handler.ts`
- ❌ Don't expose `httpClient` to renderer — it's a main-side singleton
- ❌ Don't hold access tokens in renderer state (Zustand or component state) — main proxies everything

## How to add a new feature

1. **Create** `src/features/<name>/{index.ts, contracts/}` minimum (`commands.ts` + endpoint/entity files; flat `contracts.ts` only for tiny features per "When to keep contracts flat" rule)
2. **Add IPC** if needed: `main/handler.ts` + register call in `src/main.ts` (direct import)
3. **Add client state** if needed: `model/use-<name>-store.ts` (Zustand) or `model/use-<name>.ts` (custom hook)
4. **Add server queries** if needed: `api/use-<name>-query.ts` (TanStack Query) — see "Data fetching" section
5. **Add UI** if needed: `ui/<component>.tsx`
6. **Add MSW handlers** if needed: `mocks/index.ts` exports `<name>MockHandlers`, add to `src/mocks/handlers.ts`
7. **Update `shared/ipc/types.ts`** with new Commands/Events
8. **Add route** if user-facing: `routes/<name>.tsx` as thin `<Component />` wrapper
9. **Update e2e spec** (`e2e/app-launch.spec.ts`) if shell layout changes — see "Hard rule" below

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
