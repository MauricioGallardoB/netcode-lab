# Netcode Lab — Servidor autoritativo + Client-Side Prediction

Demo minimal de **networking en tiempo real**:
- **Servidor autoritativo** (Node/TypeScript + WebSocket) a **60 Hz**.
- **Cliente** (Vite + TypeScript + Canvas) con **predicción local** (azul) y **reconciliación** contra el servidor (verde).
- Auto-descubre el puerto del servidor (`8080+`), HUD muestra el puerto activo.

https://github.com/MauricioGallardoB/netcode-lab

---

## Ejecutar (modo dev)

### Opción 1 — Un solo comando (recomendado)
```bash
pnpm start

