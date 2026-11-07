import { defineConfig, devices } from "@playwright/test";

// E2E runs against the real production build (`astro preview` serves dist/),
// so run `pnpm build` first. Evidence lands in output/ for CI to upload.
const PORT = 4321;

export default defineConfig({
  testDir: "e2e",
  outputDir: "output/test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "output/playwright-report", open: "never" }],
  ],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `pnpm preview --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
