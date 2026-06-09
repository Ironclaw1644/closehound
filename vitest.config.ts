import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Pure-function + server-module unit tests. No React plugin yet — add
// @vitejs/plugin-react + jsdom when component tests arrive.
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: [
      // `server-only` throws outside a react-server context; stub it for tests.
      { find: "server-only", replacement: fileURLToPath(new URL("./src/test/empty.ts", import.meta.url)) },
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
});
