import http from "node:http";
import net from "node:net";
import { WebSocketServer, WebSocket } from "ws";
import type { RawData } from "ws";
import { ClientInputSchema, ServerSnapshotSchema } from "@netcode/protocol";
import { emptyWorld, step, type WorldState } from "@netcode/sim";

const START_PORT = Number(process.env.PORT ?? 8080);
const TICK_RATE = 60;

type Client = { ws: WebSocket; id: string; lastSeq: number };
const clients = new Map<WebSocket, Client>();

let world: WorldState = emptyWorld();
let serverTick = 0;

const server = http.createServer((_, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: true, tick: serverTick }));
});

const wss = new WebSocketServer({ server });

// Loguear errores de WS para que no reviente el proceso
wss.on("error", (err) => {
  console.error("[wss error]", err);
});

wss.on("connection", (ws) => {
  const id = Math.random().toString(36).slice(2);
  clients.set(ws, { ws, id, lastSeq: -1 });
  console.log(`[conn] ${id} connected`);

  ws.on("message", (data: RawData) => {
    try {
      const parsed = ClientInputSchema.safeParse(JSON.parse(data.toString()));
      if (!parsed.success) return;
      const input = parsed.data;
      const client = clients.get(ws);
      if (!client) return;
      if (input.inputSeq <= client.lastSeq) return; // idempotencia
      client.lastSeq = input.inputSeq;

      if (!world.players[input.playerId]) {
        world.players[input.playerId] = { x: 0, y: 0, vx: 0, vy: 0 };
      }
      world = step(world, [input]);
    } catch {
      /* ignore */
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[disc] ${id} disconnected`);
  });
});

// Tick loop: emitir snapshots 60Hz
setInterval(() => {
  serverTick++;
  const snapshot = ServerSnapshotSchema.parse({
    serverTick,
    players: world.players,
  });
  const payload = JSON.stringify(snapshot);
  for (const c of clients.values()) {
    if (c.ws.readyState === WebSocket.OPEN) c.ws.send(payload);
  }
}, 1000 / TICK_RATE);

// Encuentra un puerto libre a partir de START_PORT
function findAvailablePort(start: number, steps = 20): Promise<number> {
  return new Promise((resolve, reject) => {
    let port = start;
    const tryOnce = () => {
      const tester = net.createServer();
      tester.once("error", (err: any) => {
        if ((err.code === "EADDRINUSE" || err.code === "EACCES") && steps > 0) {
          tester.close(() => {});
          port++;
          steps--;
          tryOnce();
        } else {
          reject(err);
        }
      });
      tester.once("listening", () => {
        tester.close(() => resolve(port));
      });
      tester.listen(port, "0.0.0.0");
    };
    tryOnce();
  });
}

async function start() {
  try {
    const chosen = await findAvailablePort(START_PORT, 20);
    server.listen(chosen, () => {
      console.log(
        `[server] listening on http://localhost:${chosen} (${TICK_RATE} Hz)`,
      );
    });
    server.on("error", (err) => {
      console.error("[server error]", err);
    });
  } catch (err) {
    console.error("[startup fatal]", err);
    process.exit(1);
  }
}

start();
