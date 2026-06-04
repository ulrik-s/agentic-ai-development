const { test, expect } = require('@playwright/test');

test('health endpoint returns ok', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.status()).toBe(200);
  expect((await res.json()).status).toBe('ok');
});

test('dashboard renders the heading', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sensor Dashboard' })).toBeVisible();
});

test('page load produces no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Sensor Dashboard' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('readings endpoint returns the requested number of readings', async ({ request }) => {
  const res = await request.get('/api/readings?limit=5');
  expect(res.status()).toBe(200);
  expect((await res.json()).readings).toHaveLength(5);
});

// Lands with issues #2/#3 (temperature and humidity charts).
test.skip('at least one chart canvas is present', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas').first()).toBeVisible();
});
