import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    headless: false,          // Show Chrome so user can see it
    channel: "chrome",        // Use installed Chrome if available, else fall back to Chromium
    viewport: { width: 1280, height: 800 },
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on",              // Full traces for DevTools-style network inspection
    actionTimeout: 15000,
  },
  projects: [
    {
      name: "chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome",
        headless: false,
        launchOptions: {
          args: ["--auto-open-devtools-for-tabs"],  // Open DevTools automatically
          slowMo: 400,                               // Slow actions for visibility
        },
      },
    },
  ],
});
