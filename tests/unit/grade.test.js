import { describe, it, expect } from 'vitest';
import { grade, correctText, studentSafe } from '../../app/question-paper-generator/grade.js';

describe('grade()', () => {
  it('mcq/code/assertion/tf compare by index/boolean', () => {
    expect(grade({ type: 'mcq', answer: 1 }, 1)).toBe(true);
    expect(grade({ type: 'mcq', answer: 1 }, 0)).toBe(false);
    expect(grade({ type: 'tf', answer: true }, true)).toBe(true);
    expect(grade({ type: 'tf', answer: true }, false)).toBe(false);
  });
  it('multi is order-independent and rejects empty', () => {
    expect(grade({ type: 'multi', answers: [0, 2] }, [2, 0])).toBe(true);
    expect(grade({ type: 'multi', answers: [0, 2] }, [0])).toBe(false);
    expect(grade({ type: 'multi', answers: [0, 2] }, [])).toBe(false);
  });
  it('fill: case- and article-insensitive, accepts | alternatives', () => {
    expect(grade({ type: 'fill', answer: 'Paris' }, 'paris')).toBe(true);
    expect(grade({ type: 'fill', answer: 'the Sun|Sun' }, 'sun')).toBe(true);
    expect(grade({ type: 'fill', answer: 'Paris' }, '')).toBe(false);
  });
  it('numeric: relative tolerance + non-numeric fallback', () => {
    expect(grade({ type: 'numeric', answer: '10' }, '10.01')).toBe(true);
    expect(grade({ type: 'numeric', answer: '10' }, '11')).toBe(false);
    expect(grade({ type: 'numeric', answer: 'NaNvalue' }, 'nanvalue')).toBe(true);
  });
  it('match: only the correct alignment to sorted choices passes', () => {
    const q = { type: 'match', pairs: [{ l: 'A', r: 'apple' }, { l: 'B', r: 'ball' }] };
    expect(grade(q, [0, 1])).toBe(true);
    expect(grade(q, [1, 0])).toBe(false);
  });
  it('case is not auto-graded', () => {
    expect(grade({ type: 'case', sub: [] }, {})).toBe(null);
  });
});

describe('correctText()', () => {
  it('formats each type for the answer key', () => {
    expect(correctText({ type: 'mcq', answer: 1, options: ['x', 'Yen'] })).toBe('(b) Yen');
    expect(correctText({ type: 'tf', answer: false })).toBe('False');
    expect(correctText({ type: 'numeric', answer: '9.8', unit: 'm/s' })).toBe('9.8 m/s');
  });
});

describe('studentSafe()', () => {
  it('strips answers/explanations and never leaks match alignment', () => {
    const paper = { title: 't', sections: [{ title: 'A', marks: 1, questions: [
      { type: 'mcq', q: 'q', options: ['a', 'b'], answer: 1, explanation: 'e' },
      { type: 'match', q: 'm', pairs: [{ l: 'L1', r: 'R1' }, { l: 'L2', r: 'R2' }] },
    ] }] };
    const safe = studentSafe(paper);
    const q0 = safe.sections[0].questions[0];
    expect(q0.answer).toBeUndefined();
    expect(q0.explanation).toBeUndefined();
    expect(q0.options).toEqual(['a', 'b']);
    const q1 = safe.sections[0].questions[1];
    expect(q1.lefts).toEqual(['L1', 'L2']);
    expect(q1.pairs).toBeUndefined();
  });
});
