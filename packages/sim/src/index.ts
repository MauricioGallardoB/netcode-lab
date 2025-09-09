import type { ClientInput } from "@netcode/protocol";

export type PlayerState = { x: number; y: number; vx: number; vy: number };
export type WorldState = { players: Record<string, PlayerState> };

/** Física simple y determinista */
export function step(world: WorldState, inputs: ClientInput[]): WorldState {
  const next: WorldState = { players: { ...world.players } };
  for (const input of inputs) {
    const p = next.players[input.playerId] ?? { x: 0, y: 0, vx: 0, vy: 0 };
    const accel = 20;
    p.vx += input.moveX * accel * input.dt;
    p.vy += input.moveY * accel * input.dt;
    if (input.jump) p.vy += 50 * input.dt;
    p.vx *= 0.92;
    p.vy *= 0.92;
    p.x += p.vx * input.dt;
    p.y += p.vy * input.dt;
    next.players[input.playerId] = p;
  }
  return next;
}

export function emptyWorld(): WorldState {
  return { players: {} };
}
