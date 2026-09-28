import { defineConfig, devices } from '@playwright/test';

/** End-to-end tests against the dev server. Run with `npm run e2e`. */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4200',
    // Reduced motion keeps jumps and the intro short and makes runs deterministic.
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm start -- --port 4200',
    url: 'http://localhost:4200/en',
    reuseExistingServer: !process.env['CI'],
    timeout: 120_000,
  },
});
