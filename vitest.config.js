import { defineConfig } from 'vitest/config';
// Scope Vitest to unit tests only — the Playwright e2e specs under tests/e2e
// use @playwright/test and must NOT be picked up here.
export default defineConfig({
  test: { include: ['tests/unit/**/*.test.js'], environment: 'node' },
});
