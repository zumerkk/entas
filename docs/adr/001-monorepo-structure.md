# ADR-001: Monorepo Structure

## Status
Accepted

## Context
ENTAŞ B2B e-commerce platform requires multiple applications (API, web store, admin panel, mobile app) sharing common types, utilities, and UI components. The team needs a consistent development experience across all apps with shared tooling.

## Decision
Use a **pnpm workspace monorepo** managed by **Turborepo** with the following structure:

```
apps/
  api/        → NestJS REST API
  web/        → Next.js customer-facing store
  admin/      → Next.js admin panel
  mobile/     → React Native Expo mobile app
packages/
  shared/     → Shared types, utils, env validation
  ui/         → React component library
infra/
  docker/     → Docker Compose for local infra
```

### Why pnpm + Turborepo?
- **pnpm**: Strict dependency isolation, efficient disk usage via content-addressable store, native workspace support
- **Turborepo**: Task orchestration with caching, dependency-aware build pipeline, parallel execution

### Why not Nx?
- Turborepo is simpler and sufficient for our scale
- Lower learning curve for the team
- Nx's advanced features (module boundary enforcement) are not needed initially

## Consequences
- All apps share a single `pnpm-lock.yaml` — dependency updates are atomic
- Shared packages are linked via `workspace:*` protocol — no publishing needed
- CI runs `turbo lint && turbo test && turbo build` in topological order
- Adding a new app/package requires updating `pnpm-workspace.yaml`
