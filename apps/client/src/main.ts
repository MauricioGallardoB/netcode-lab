import { step, type PlayerState } from "@netcode/sim";

const hudPort = document.getElementById("port")!;
const cv = document.getElementById("cv") as HTMLCanvasElement;
const ctx = cv.getContext("2d")!;

// ====== conexión WS con auto-descubrimiento de puerto ======
async function connectWS(start = Number((window as any).SERVER_PORT ?? 8080)) {
  for (let p = start; p < start + 20; p++) {
    try {
      const ws = await new Promise<WebSocket>((resolve, reject) => {
        const w = new WebSocket(`ws://` + location.hostname + `:` + p);
        let opened = false;
        w.addEventListener("open", () => {
          opened = true;
          resolve(w);
        });
        w.addEventListener("error", () => {
          if (!opened) reject(new Error("err"));
        });
        w.addEventListener("close", () => {
          if (!opened) reject(new Error("closed"));
        });
      });
      (ws as any)._port = p;
      return ws;
    } catch {
      /* probar siguiente puerto */
    }
  }
  throw new Error("No encontré server en puertos cercanos.");
}

type World = { players: Record<string, PlayerState> };

const playerId = "mau";
let serverWorld: World = { players: {} };
let predicted: PlayerState = { x: 0, y: 0, vx: 0, vy: 0 };

const Hz = 60;
const dt = 1 / Hz;
let seq = 0;
const inputState = { x: 0, y: 0, jump: false };

// ====== inputs teclado ======
const keys = new Set<string>();
window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
window.addEventListener("keyup", (e) => keys.delete(e.key.toLowerCase()));
function refreshInput() {
  inputState.x =
    (keys.has("d") || keys.has("arrowright") ? 1 : 0) +
    (keys.has("a") || keys.has("arrowleft") ? -1 : 0);
  inputState.y =
    (keys.has("s") || keys.has("arrowdown") ? 1 : 0) +
    (keys.has("w") || keys.has("arrowup") ? -1 : 0);
  inputState.jump = keys.has(" ");
}

// ====== loop de render ======
function draw() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  // grid
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = "#8da2c2";
  for (let x = 0; x < cv.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, cv.height);
    ctx.stroke();
  }
  for (let y = 0; y < cv.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(cv.width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // servidor (verde)
  const s = serverWorld.players[playerId];
  if (s) {
    ctx.fillStyle = "#33dd77";
    ctx.beginPath();
    ctx.arc(450 + s.x * 10, 300 + s.y * 10, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // predicción (azul)
  ctx.fillStyle = "#77aaff";
  ctx.beginPath();
  ctx.arc(450 + predicted.x * 10, 300 + predicted.y * 10, 6, 0, Math.PI * 2);
  ctx.fill();

  requestAnimationFrame(draw);
}

// ====== main ======
(async () => {
  const ws = await connectWS(8080);
  const port = (ws as any)._port;
  hudPort.textContent = String(port);

  // recibir snapshots
  ws.addEventListener("message", (ev) => {
    try {
      const snap = JSON.parse(String(ev.data));
      if (typeof snap?.serverTick === "number" && snap?.players) {
        serverWorld = snap;
        // reconciliar con el estado autoritativo
        const auth = snap.players[playerId];
        if (auth) predicted = { ...auth };
      }
    } catch {}
  });

  // enviar inputs a 60Hz y avanzar predicción local
  setInterval(() => {
    refreshInput();
    const msg = {
      playerId,
      inputSeq: seq++,
      moveX: inputState.x,
      moveY: inputState.y,
      jump: inputState.jump,
      dt,
    };
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
    predicted = step({ players: { [playerId]: predicted } }, [msg]).players[
      playerId
    ];
  }, 1000 / Hz);

  draw();
})();
