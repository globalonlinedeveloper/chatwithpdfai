import { describe, it, expect } from 'vitest';
import { CATEGORIES } from '../../lib/blueprints.js';

const VALID = ['mcq', 'multi', 'tf', 'fill', 'match', 'assertion', 'numeric', 'short', 'long', 'code', 'case'];

describe('blueprint registry integrity', () => {
  it('exposes categories with presets', () => {
    expect(Array.isArray(CATEGORIES)).toBe(true);
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });
  it('every preset section is well-formed (valid type, count within the per-call cap, positive marks)', () => {
    for (const cat of CATEGORIES) {
      for (const p of (cat.presets || [])) {
        expect(Array.isArray(p.sections)).toBe(true);
        expect(p.sections.length).toBeGreaterThan(0);
        for (const s of p.sections) {
          expect(VALID).toContain(s.type);
          expect(Number.isInteger(s.count)).toBe(true);
          expect(s.count).toBeGreaterThan(0);
          expect(s.count).toBeLessThanOrEqual(40); // single-call cap; bigger sets must use the batched `full` path
          expect(s.marks).toBeGreaterThan(0);
        }
        if (p.full) for (const s of p.full) { expect(VALID).toContain(s.type); expect(s.count).toBeGreaterThan(0); }
      }
    }
  });
});
