const { defineConfig, devices } = require('@playwright/test');

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: {
    baseURL,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'node server.js',
    url: `${baseURL}/api/health`,
    env: { PORT: String(PORT) },
    reuseExistingServer: !process.env.CI,
  },
});
