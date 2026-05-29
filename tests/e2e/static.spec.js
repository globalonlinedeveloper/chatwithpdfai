const { test, expect } = require('@playwright/test');

// Smoke tests for the existing static marketing pages (no DB / no API).

test('landing page loads', async ({ page }) => {
  await page.goto('/landing.html');
  await expect(page).toHaveTitle(/CHATWITHPDFAI/i);
});

test('pricing page shows credit packs', async ({ page }) => {
  await page.goto('/pricing.html');
  await expect(page.locator('body')).toContainText(/credit/i);
});

test('upload harness renders controls', async ({ page }) => {
  await page.goto('/upload.html');
  await expect(page.getByTestId('file-input')).toBeVisible();
  await expect(page.getByTestId('upload-btn')).toBeVisible();
  await expect(page.getByTestId('status')).toContainText(/choose a pdf/i);
});
