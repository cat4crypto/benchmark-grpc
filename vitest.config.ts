import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**"],
    include: ["**/*.test.ts"],
    environment: "node",
    globals: true,
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
  },
});
