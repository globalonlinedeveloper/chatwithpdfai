import { describe, it, expect } from 'vitest';
import { deriveSets } from '../../app/question-paper-generator/sets.js';

const master = () => ({ title: 'Demo', sections: [{ title: 'A', marks: 1, questions: [
  { type: 'mcq', q: 'Q1', options: ['W', 'X', 'Y', 'Z'], answer: 1 },      // correct text = 'X'
  { type: 'multi', q: 'Q2', options: ['p', 'q', 'r', 's'], answers: [0, 3] }, // correct = p,s
  { type: 'tf', q: 'Q3', answer: true },
  { type: 'fill', q: 'Q4', answer: 'foo' },
] }] });

describe('deriveSets()', () => {
  it('n=1 returns the master with only a set label', () => {
    const sets = deriveSets(master(), 1);
    expect(sets).toHaveLength(1);
    expect(sets[0].setLabel).toBe('A');
    expect(sets[0].sections[0].questions[0].options).toEqual(['W', 'X', 'Y', 'Z']);
  });
  it('shuffled variants keep the CORRECT option text correct (the core invariant)', () => {
    const sets = deriveSets(master(), 3);
    expect(sets.map((s) => s.setLabel)).toEqual(['A', 'B', 'C']);
    for (let i = 1; i < 3; i++) {
      const qs = sets[i].sections[0].questions;
      const mcq = qs.find((q) => q.type === 'mcq');
      expect(mcq.options[mcq.answer]).toBe('X');
      const multi = qs.find((q) => q.type === 'multi');
      expect(multi.answers.map((a) => multi.options[a]).sort()).toEqual(['p', 's']);
      expect(qs).toHaveLength(4);
    }
  });
  it('is deterministic for identical input', () => {
    expect(JSON.stringify(deriveSets(master(), 3))).toBe(JSON.stringify(deriveSets(master(), 3)));
  });
  it('does not mutate the master input', () => {
    const m = master();
    deriveSets(m, 3);
    expect(m.sections[0].questions[0].options).toEqual(['W', 'X', 'Y', 'Z']);
    expect(m.sections[0].questions[0].answer).toBe(1);
  });
});
