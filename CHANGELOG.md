# Changelog

All notable changes to `apexline-desktop` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Typed IPC foundation** (`src/ipc/`):
  - Shared `Commands` / `Events` type maps (`src/ipc/types.ts`); each domain owns its own `types.ts` and `handler.ts`.
  - `withValidation(schema, handler)` helper wraps `ipcMain.handle` with Zod parsing at the boundary.
  - `settings` domain: in-memory store with `settings:get-all`, `settings:get`, `settings:set` RPC + `settings:changed` broadcast event. Discriminated-union schema for type-safe `set`.
  - `telemetry` domain: `MessagePort`-based stream (`telemetry:open` channel) for high-frequency data (default 60 Hz). Source is pluggable via `setTelemetrySource(...)`; defaults to a no-op until iRacing SDK is wired up.
  - `preload.ts` exposes a single `window.api` surface with `invoke` (typed by `Commands`), `on` (typed by `Events`, returns unsubscribe), and `openTelemetryStream()` (returns a typed `MessagePort`). Ambient declaration in `src/global.d.ts`.
  - `BrowserWindow` hardened: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` made explicit.
  - `vite.main.config.ts` and `vite.preload.config.ts` carry the `@` → `./src` alias so main / preload bundles can import `@/ipc/*`.
- Renderer hooks: `useSettings()` (RPC + live update via `settings:changed`) and `useLapTelemetry()` (MessagePort lifecycle + cleanup on unmount). Smoke screen now demonstrates IPC round-trip and stream status.
- React 19 + Tailwind v4 renderer stack (`@vitejs/plugin-react`, `@tailwindcss/vite`).
- `@apexline-app/apr` 0.1.1 wired up; `src/styles.css` imports `theme/base.css` + `theme/apexline-theme.css` from the library.
- `src/app.tsx` smoke component using `formatLapTime` from apr and apexline-themed Tailwind utilities (`bg-bg-primary`, `text-brand-primary`, `font-display`, `font-mono`, …).
- Vite renderer alias `@` → `./src` mirroring the TS path alias.
- `.npmrc` configured for the `@apexline-app` scope on GitHub Packages (token via `${NODE_AUTH_TOKEN}`).
- Electron Forge `vite-typescript` template bootstrap.
- TypeScript 5.9 strict + path alias `@/*` → `./src/*`.
- ESLint 10 flat config (Electron-aware: per-process globals) + `no-restricted-imports` for `../*`.
- Prettier 3 + `@trivago/prettier-plugin-sort-imports`.
- Husky 9 pre-commit chain `lint:types && lint:format && lint` + commitlint (Conventional Commits).
- GitHub Actions workflow `javascript-checks.yml`.
- Dependabot grouped by tool family.
