# Changelog

All notable changes to `apexline-desktop` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Electron Forge `vite-typescript` template bootstrap.
- TypeScript 5.9 strict + path alias `@/*` → `./src/*`.
- ESLint 10 flat config (Electron-aware: per-process globals) + `no-restricted-imports` for `../*`.
- Prettier 3 + `@trivago/prettier-plugin-sort-imports`.
- Husky 9 pre-commit chain `lint:types && lint:format && lint` + commitlint (Conventional Commits).
- GitHub Actions workflow `javascript-checks.yml`.
- Dependabot grouped by tool family.
