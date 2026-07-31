import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Отдельный конфиг, а не ключ `test` в vite.config.ts: vitest тянет свою
// копию типов vite, и в одном файле они конфликтуют с установленной версией.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      include: ["src/**/*.test.{ts,tsx}"],
    },
  }),
);
