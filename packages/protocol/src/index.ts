import { z } from "zod";

/** Mensaje de input del cliente */
export const ClientInputSchema = z.object({
  playerId: z.string(),
  inputSeq: z.number().int().nonnegative(),
  moveX: z.number(),
  moveY: z.number(),
  jump: z.boolean(),
  dt: z.number().positive(),
});
export type ClientInput = z.infer<typeof ClientInputSchema>;

/** Snapshot autoritativo del servidor */
export const ServerSnapshotSchema = z.object({
  serverTick: z.number().int().nonnegative(),
  players: z.record(
    z.object({
      x: z.number(),
      y: z.number(),
      vx: z.number(),
      vy: z.number(),
    }),
  ),
});
export type ServerSnapshot = z.infer<typeof ServerSnapshotSchema>;

/** Config de latencia/red para simular fallas (placeholder para fases siguientes) */
export const LatencyConfigSchema = z.object({
  baseLatencyMs: z.number().nonnegative().default(0),
  jitterMs: z.number().nonnegative().default(0),
  lossPercent: z.number().min(0).max(100).default(0),
  duplicatePercent: z.number().min(0).max(100).default(0),
  reorderPercent: z.number().min(0).max(100).default(0),
});
export type LatencyConfig = z.infer<typeof LatencyConfigSchema>;

export const ProtocolVersion = "0.1.0";
