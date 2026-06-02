const { test, expect } = require('@playwright/test');

test('health endpoint returns ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe('ok');
});

test('dashboard renders the heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sensor Dashboard' })).toBeVisible();
});

test('page load produces no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
});

// Pending features (see demo/issues/). Skipped until merged on main:
// - GET /api/readings (issue #1)
// - temperature/humidity charts -> <canvas> (issues #2, #3)
test.skip('readings endpoint returns the requested limit', async ({ request }) => {
  const res = await request.get('/api/readings?limit=5');
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body).toHaveLength(5);
});

test.skip('at least one chart canvas is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas').first()).toBeVisible();
});
