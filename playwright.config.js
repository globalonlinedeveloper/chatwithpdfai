const { defineConfig, devices } = require('@playwright/test');

// Base URL of the running app. CI/sandbox can override with E2E_BASE_URL.
const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
  testDir: './tests/e2e',
  // Writes the sample PDF fixture before the suite runs (see tests/global-setup.js).
  globalSetup: require.resolve('./tests/global-setup.js'),
  timeout: 30000,
  expect: { timeout: 12000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: BASE,
    headless: true,
    actionTimeout: 15000,
    launchOptions: {
      // PW_CHROME lets a sandbox point at an already-downloaded Chrome build.
      // Unset on a normal machine -> Playwright uses its managed browser.
      executablePath: process.env.PW_CHROME || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  },
  // Boots the app for the tests. The upload spec exercises the real pipeline,
  // so the dev server needs DB_* + OPENAI_API_KEY in the environment (see
  // .env.example). PRODUCT_MVP_ENABLED=1 turns on the upload routes.
  webServer: {
    command: 'npm run dev',
    url: BASE + '/upload.html',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: { PRODUCT_MVP_ENABLED: '1' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
