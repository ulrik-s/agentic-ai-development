const { defineConfig } = require('@playwright/test');

// Use a dedicated port so the suite never collides with the live demo on 3000.
const PORT = 3105;
const baseURL = `http://localhost:${PORT}`;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL },
  webServer: {
    command: `PORT=${PORT} node server.js`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 15000,
  },
});
