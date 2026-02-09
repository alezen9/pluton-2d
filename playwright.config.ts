import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 30_000,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    headless: true,
    trace: "retain-on-failure",
  },
});
