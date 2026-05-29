const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const FX = path.join(__dirname, '..', 'fixtures');
// Second fixture (reportlab 2-page: "annual revenue 9.8 million"); written if missing.
const SAMPLE2_B64 = 'JVBERi0xLjMKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0NvbnRlbnRzIDggMCBSIC9NZWRpYUJveCBbIDAgMCA2MTIgNzkyIF0gL1BhcmVudCA3IDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9Db250ZW50cyA5IDAgUiAvTWVkaWFCb3ggWyAwIDAgNjEyIDc5MiBdIC9QYXJlbnQgNyAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNSAwIG9iago8PAovUGFnZU1vZGUgL1VzZU5vbmUgL1BhZ2VzIDcgMCBSIC9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9BdXRob3IgKGFub255bW91cykgL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MDUyOTA3MjQ1NSswMCcwMCcpIC9DcmVhdG9yIChhbm9ueW1vdXMpIC9LZXl3b3JkcyAoKSAvTW9kRGF0ZSAoRDoyMDI2MDUyOTA3MjQ1NSswMCcwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0ICh1bnNwZWNpZmllZCkgL1RpdGxlICh1bnRpdGxlZCkgL1RyYXBwZWQgL0ZhbHNlCj4+CmVuZG9iago3IDAgb2JqCjw8Ci9Db3VudCAyIC9LaWRzIFsgMyAwIFIgNCAwIFIgXSAvVHlwZSAvUGFnZXMKPj4KZW5kb2JqCjggMCBvYmoKPDwKL0ZpbHRlciBbIC9BU0NJSTg1RGVjb2RlIC9GbGF0ZURlY29kZSBdIC9MZW5ndGggMjE0Cj4+CnN0cmVhbQpHYXQlWV1hZldaJjs1RCZAUzQmRF0qZ1dxZTNtZVRBYkg5W1lVXGRhYThscTE/OjlkWGUnLSlRP2gnLC8oYUAibTQoKEVYbG0vQS5TS1FCLCJXYWhEYWRfVVlCOFFKKHEsL2NvRSEjKVM/JGtISU1eKTpIMkdjYSkpPF9FcnMvc2U8KmBbO2pqTT1qOXBGb0JbajtbdV5kP3RuVVpAWFUvL1Y/UCpYPlI3WHJuZVhqZlwzWVxvJEk0O2tLIls0ITBtbnFYKS4hZl5WbE1wIUFeYFBEP34+ZW5kc3RyZWFtCmVuZG9iago5IDAgb2JqCjw8Ci9GaWx0ZXIgWyAvQVNDSUk4NURlY29kZSAvRmxhdGVEZWNvZGUgXSAvTGVuZ3RoIDE5Ngo+PgpzdHJlYW0KR2F0JVliNmwqPyY0UT9sTVJ1aU1nJ1AwYC9kNU4wXHNPUUZCcid1RFAjUy0pRF8tYnVRJ28xQCI4PDNJI3QlWGslYk5POEhORk5DImRJIlVwamFBVERrOVw5THJHLnU5OUcuOiQrUm4+RjtuRCFSbFJ0XzA3TkEmNzVqaExkXlY+QkNHaGQ3Wj48Nz1ANkJSdVc9JCI9NjZtYjlzN186cXFUbUgvZFomNGMyXUxPcD9XbjZlWzt0b3M7RkQjc10xJW5+PmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDEwCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDA2MSAwMDAwMCBuIAowMDAwMDAwMDkyIDAwMDAwIG4gCjAwMDAwMDAxOTkgMDAwMDAgbiAKMDAwMDAwMDM5MiAwMDAwMCBuIAowMDAwMDAwNTg1IDAwMDAwIG4gCjAwMDAwMDA2NTMgMDAwMDAgbiAKMDAwMDAwMDkxNCAwMDAwMCBuIAowMDAwMDAwOTc5IDAwMDAwIG4gCjAwMDAwMDEyODMgMDAwMDAgbiAKdHJhaWxlcgo8PAovSUQgCls8ZDhhNzFlZmU1MWU5OGI2MTljZjA5M2U4OTYyODA5NTM+PGQ4YTcxZWZlNTFlOThiNjE5Y2YwOTNlODk2MjgwOTUzPl0KJSBSZXBvcnRMYWIgZ2VuZXJhdGVkIFBERiBkb2N1bWVudCAtLSBkaWdlc3QgKG9wZW5zb3VyY2UpCgovSW5mbyA2IDAgUgovUm9vdCA1IDAgUgovU2l6ZSAxMAo+PgpzdGFydHhyZWYKMTU2OQolJUVPRgo=';

test.beforeAll(() => {
  const f = path.join(FX, 'sample2.pdf');
  if (!fs.existsSync(f)) { fs.mkdirSync(FX, { recursive: true }); fs.writeFileSync(f, Buffer.from(SAMPLE2_B64, 'base64')); }
});

async function upload(request, file, name) {
  const r = await request.post('/api/documents/upload', {
    multipart: { file: { name, mimeType: 'application/pdf', buffer: fs.readFileSync(file) } },
  });
  expect(r.ok()).toBeTruthy();
  return (await r.json()).document.id;
}

test('library lists docs and multi-PDF chat answers across both', async ({ page, request }) => {
  const a = await upload(request, path.join(FX, 'sample-3page.pdf'), 'invoice.pdf');
  const b = await upload(request, path.join(FX, 'sample2.pdf'), 'annual.pdf');

  await page.goto('/library.html');
  await expect(page.getByTestId('doc-row')).toHaveCount(2);

  await page.goto(`/chat?docs=${a},${b}`);
  await page.getByTestId('question').fill('What is the invoice total and what was the annual revenue?');
  await page.getByTestId('estimate-btn').click();
  await expect(page.getByTestId('estimate')).toContainText(/credit/i, { timeout: 20000 });
  await page.getByTestId('ask-btn').click();
  await expect(page.getByTestId('answer')).toContainText(/4250/, { timeout: 30000 });
  await expect(page.getByTestId('answer')).toContainText(/9\.8/);
});
