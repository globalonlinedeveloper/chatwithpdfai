const { test, expect } = require('@playwright/test');

// Real auth loop via the UI: signup -> auto-login -> account shows email -> signout.
test('signup, see account, sign out', async ({ page }) => {
  const email = `e2e_${Date.now()}@example.com`;
  await page.goto('/signup.html');
  await page.getByTestId('signup-name').fill('E2E Tester');
  await page.getByTestId('signup-email').fill(email);
  await page.getByTestId('signup-password').fill('testpass123');
  await page.getByTestId('signup-btn').click();
  await page.waitForURL('**/account.html', { timeout: 20000 });
  await expect(page.getByTestId('account-email')).toContainText(email);
  await page.getByTestId('signout-btn').click();
  await page.waitForURL('**/signin.html', { timeout: 15000 });
});
