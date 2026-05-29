const { test, expect } = require('@playwright/test');
const path = require('path');

// End-to-end of the real ingest pipeline: upload -> extract -> embed -> persist.
// Requires the dev server to have DB_* + OPENAI_API_KEY configured (real run).

test('upload a real PDF is processed end to end', async ({ page }) => {
  await page.goto('/upload.html');
  await page
    .getByTestId('file-input')
    .setInputFiles(path.join(__dirname, '..', 'fixtures', 'sample-3page.pdf'));
  await page.getByTestId('upload-btn').click();
  await expect(page.getByTestId('status')).toContainText(/ready.*3 page/i, { timeout: 28000 });
  await expect(page.getByTestId('doc-status').first()).toContainText(/ready/i);
  await expect(page.getByTestId('doc-pages').first()).toHaveText('3');
});

test('a non-PDF upload is rejected', async ({ page }) => {
  await page.goto('/upload.html');
  await page.getByTestId('file-input').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('this is not a pdf'),
  });
  await page.getByTestId('upload-btn').click();
  await expect(page.getByTestId('status')).toContainText(/only pdf/i, { timeout: 15000 });
});
