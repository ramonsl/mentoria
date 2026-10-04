import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "app/api/**/*.test.ts",
      "app/admin/**/*.test.ts",
      "emails/**/*.test.ts",
      "middleware.test.ts",
    ],
  },
});
