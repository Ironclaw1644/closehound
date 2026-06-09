import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Pure-function unit tests (underwriting engine, helpers). No React plugin yet —
// add @vitejs/plugin-react + a jsdom environment when component tests arrive.
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
