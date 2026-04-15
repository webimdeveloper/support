# Service Module Architecture

This document explains the service-module system used to keep client dashboards extensible, isolated, and safe when one service fails.

## Goals
- Enable different module sets per client.
- Respect admin-managed vs client-self-service ownership.
- Prevent one failing service from breaking the full dashboard.
- Keep implementation component-based and easy to extend.

## Core idea
Each dashboard module (for example `CRO`, `Site Health`) is represented by a provider that builds a manifest item.  
The dashboard requests one manifest endpoint and renders only enabled modules.

If a provider fails, the module is marked as `error` and hidden, while other modules continue to work.

## Files and responsibilities

### Shared types
- `types/services.ts`
  - `ServiceModuleId`
  - `ServiceModuleStatus`
  - `ServiceModuleManifestItem`
  - `ServiceModuleManifestResponse`

### Service module runtime (server)
- `server/services/modules/types.ts`
  - Provider contract and execution context.
- `server/services/modules/providers/cro.ts`
  - CRO module manifest provider.
- `server/services/modules/providers/site-health.ts`
  - Site Health module provider, uses client service configuration state.
- `server/services/modules/registry.ts`
  - Central list of module providers.
- `server/services/modules/executor.ts`
  - Isolated execution of each provider with failure containment.

### Service manifest API
- `server/api/services/[client]/manifest.get.ts`
  - Auth scope check (`requireClientScope`).
  - Resolves client record.
  - Derives service status (`deriveClientServiceStatuses`).
  - Builds manifest via executor.

### Dashboard integration
- `composables/useServiceManifest.ts`
  - Loads the service manifest and exposes loading/error state.
- `pages/dashboard/[client]/[project]/index.vue`
  - Renders tabs dynamically from enabled modules.
  - Shows disabled-module reasons.
  - Keeps modules isolated in UI (unavailable modules do not crash page).

## Isolation model

### 1) Provider isolation
`buildServiceManifest()` executes all providers via `Promise.all`.

If one provider throws:
- it returns a synthetic module with status `error`,
- only that module is disabled,
- the rest of modules still load.

### 2) UI isolation
Dashboard shows module-specific availability:
- `available`: normal rendering.
- `degraded`: module visible with warning reason.
- `disabled`: not rendered as active tab, reason shown in banner.
- `error`: treated as disabled/unavailable.

### 3) Ownership-aware module gating
`site-health` provider checks per-service ownership/config:
- if `admin_managed` and not configured -> module disabled.
- if configured but not connected -> module degraded.
- otherwise module available.

This lets admin decide who owns setup, while keeping client dashboards stable.

## How to add a new module

1. Create provider:
- `server/services/modules/providers/<new-module>.ts`
- Implement `ServiceModuleProvider`.

2. Register provider:
- Add it to `server/services/modules/registry.ts`.

3. Create UI panel:
- Component under `components/features/...`.
- Load lazily from dashboard page.

4. Add render branch:
- In `pages/dashboard/[client]/[project]/index.vue`, render the component when `activeModuleId` matches.

5. Optional per-service settings:
- Extend `deriveClientServiceStatuses` or separate config derivation helper.

## Security and reliability notes
- Keep all third-party API/token calls server-side.
- Keep rate limits on refresh-heavy endpoints.
- Use strict role + client scope checks for module and service APIs.
- For multi-instance deployments, migrate in-memory limiters to Redis/shared store.

## Future recommended upgrades
- Add schema validation for module manifest items (Zod).
- Add circuit-breaker + retry policy per provider in executor.
- Add module-level telemetry (latency, error rate, disable reason counts).
- Move dashboard rendering to a pure manifest-driven component renderer.
