# Netcode Lab (Monorepo)

Sandbox para experimentar **client prediction**, **server reconciliation** y **lag compensation**.

## KPIs / SLO

- p95 tick server < **5 ms** @ 100 jugadores
- p95 error reconciliación < **0.5** unidades
- p95 E2E (input→snapshot) < **120 ms** @60 Hz con 80 ms de RTT simulado

## Estructura

- `apps/server`: servidor autoritativo (WS)
- `apps/client`: (WIP) cliente web (Next.js)
- `apps/dashboard`: (WIP) panel de métricas/knobs
- `packages/protocol`: Zod schemas, tipos y helpers
- `packages/sim`: física determinista y utilidades
- `load-tests/k6`: escenarios de carga
- `infra`: docker/compose
- `docs`: ADRs/resultados

## Cómo correr (local)

```bash
pnpm install
pnpm build
# En Git Bash / WSL:
PORT=8080 pnpm --filter @netcode/server dev
# En CMD:
set PORT=8080 && pnpm --filter @netcode/server dev
```

Si 8080 está ocupado, el server probará 8081, 8082, ... (auto-retry).
