import { defineConfig, devices } from "@playwright/test";

const port = 3200;
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${port}`, trace: "off" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: { command: `pnpm build && pnpm start -p ${port}`, port, reuseExistingServer: !process.env.CI, timeout: 180_000 },
});
