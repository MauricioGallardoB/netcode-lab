import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  server: { port: 5173, strictPort: false },
  resolve: {
    alias: {
      "@netcode/sim": fileURLToPath(
        new URL("../../packages/sim/src/index.ts", import.meta.url),
      ),
      "@netcode/protocol": fileURLToPath(
        new URL("../../packages/protocol/src/index.ts", import.meta.url),
      ),
    },
  },
});
