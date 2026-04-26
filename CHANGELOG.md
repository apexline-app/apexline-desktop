# Changelog

All notable changes to `apexline-desktop` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Telemetry IPC API** — `window.api.openTelemetryStream(): MessagePort` replaced with `window.api.subscribeTelemetry(callback): () => void`. `MessagePort` cannot cross `contextBridge` (its methods are stripped), so the port now lives entirely in the preload script and the renderer subscribes via a callback. Renderer never holds the port, gets back an unsubscribe function instead.
- Bumped `@apexline-app/apr` 0.1.1 → 0.1.2 (apr distribution fix: externalized `react/*` and `react-dom/*` subpath imports so the library bundle no longer ships a Rolldown CJS-interop `require()` shim that throws in pure-ESM consumers).

### Added

- **Routing + layout shell** — TanStack Router (file-based, memory history) wired up in the renderer:
  - `src/routes/__root.tsx` — `AppShell` with sidebar nav (Live / Replays / Stats / Settings) and `<Outlet />` for the active page; active link highlighted via `activeProps`.
  - `src/routes/index.tsx` — Live page (was the smoke screen); consumes `useLapTelemetry` and renders stream status + last sample.
  - `src/routes/replays.tsx`, `src/routes/stats.tsx` — placeholders for upcoming sections.
  - `src/routes/settings.tsx` — first real "page" backed by `useSettings`; theme + telemetry-rate buttons reflect current persisted state and call IPC `settings:set` on click.
  - `createMemoryHistory` chosen over browser/hash history because Electron windows have no URL bar and `file://` builds don't support `pushState`.
  - `@tanstack/router-plugin/vite` regenerates `src/route-tree.gen.ts` on dev; `tsr generate` runs as `prelint:types` so `tsc` works in CI without Vite.
  - `.prettierignore` excludes the generated route tree.
  - `src/app.tsx` reduced to a `RouterProvider` wrapper; `lapMs` smoke prop removed.
- **Window state persistence** — main window remembers `x`, `y`, `width`, `height`, `isMaximized`, and `isFullScreen` between launches via [`electron-window-state`](https://github.com/mawie81/electron-window-state). State stored at `userData/window-state.json`. Disconnected-display edge cases (saved coords on a monitor that's no longer attached) are handled by the library — falls back to default size on the primary display. New default size: 1280×800.
- **Settings persistence** — settings now survive app restart. New `src/main/file-storage.ts` exposes generic `readJson<T>(filename, schema)` / `writeJson<T>(filename, data)` backed by `app.getPath('userData')` with atomic write (temp file + rename) and Zod-driven validation on read. Settings handler reads on registration and persists after every `settings:set`. Missing or corrupt file falls back to schema defaults.
- **Typed IPC foundation** (`src/ipc/`):
  - Shared `Commands` / `Events` type maps (`src/ipc/types.ts`); each domain owns its own `types.ts` and `handler.ts`.
  - `withValidation(schema, handler)` helper wraps `ipcMain.handle` with Zod parsing at the boundary.
  - `settings` domain: in-memory store with `settings:get-all`, `settings:get`, `settings:set` RPC + `settings:changed` broadcast event. Discriminated-union schema for type-safe `set`.
  - `telemetry` domain: `MessagePort`-based stream (`telemetry:open` channel) for high-frequency data (default 60 Hz). Source is pluggable via `setTelemetrySource(...)`; defaults to a no-op until iRacing SDK is wired up.
  - `preload.ts` exposes a single `window.api` surface with `invoke` (typed by `Commands`), `on` (typed by `Events`, returns unsubscribe), and `subscribeTelemetry(callback)` (port lives in preload, returns unsubscribe). Ambient declaration in `src/global.d.ts`.
  - `BrowserWindow` hardened: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` made explicit.
  - `vite.main.config.ts` and `vite.preload.config.ts` carry the `@` → `./src` alias so main / preload bundles can import `@/ipc/*`.
- Renderer hooks: `useSettings()` (RPC + live update via `settings:changed`) and `useLapTelemetry()` (subscribes via `window.api.subscribeTelemetry`, cleanup on unmount).
- React 19 + Tailwind v4 renderer stack (`@vitejs/plugin-react`, `@tailwindcss/vite`).
- `@apexline-app/apr` wired up; `src/styles.css` imports `theme/base.css` + `theme/apexline-theme.css` from the library; `formatLapTime` used on the Live page.
- Vite renderer alias `@` → `./src` mirroring the TS path alias.
- `.npmrc` configured for the `@apexline-app` scope on GitHub Packages (token via `${NODE_AUTH_TOKEN}`).
- Electron Forge `vite-typescript` template bootstrap.
- TypeScript 5.9 strict + path alias `@/*` → `./src/*`.
- ESLint 10 flat config (Electron-aware: per-process globals) + `no-restricted-imports` for `../*`.
- Prettier 3 + `@trivago/prettier-plugin-sort-imports`.
- Husky 9 pre-commit chain `lint:types && lint:format && lint` + commitlint (Conventional Commits).
- GitHub Actions workflow `javascript-checks.yml`.
- Dependabot grouped by tool family.
