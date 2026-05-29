const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Real end-to-end: upload a PDF, then ask a question and get a cited answer.
// Requires the dev server to have DB_* + an LLM key configured.
test('ask a question and get a cited answer', async ({ page, request }) => {
  const pdf = fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'sample-3page.pdf'));
  const up = await request.post('/api/documents/upload', {
    multipart: { file: { name: 'sample-3page.pdf', mimeType: 'application/pdf', buffer: pdf } },
  });
  expect(up.ok()).toBeTruthy();
  const docId = (await up.json()).document.id;

  await page.goto(`/chat?doc=${docId}`);
  await page.getByTestId('question').fill('What is the invoice total amount due?');
  await page.getByTestId('ask-btn').click();
  await expect(page.getByTestId('answer')).toContainText(/4250/, { timeout: 30000 });
  await expect(page.getByTestId('cite-pages')).toContainText(/2/);
});
