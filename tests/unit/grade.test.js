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

import { mathText } from '../../app/question-paper-generator/grade.js';
describe('mathText (notation -> unicode)', () => {
  it('converts exponents, subscripts, fractions and symbols', () => {
    expect(mathText('x^2 + y^{10}')).toBe('x² + y¹⁰');
    expect(mathText('H_2O and CO_2')).toBe('H₂O and CO₂');
    expect(mathText('a \\times b \\leq c')).toBe('a × b ≤ c');
    expect(mathText('\\frac{1}{2} and \\sqrt{9}')).toBe('(1)/(2) and √(9)');
    expect(mathText('\\pi r^2')).toBe('π r²');
    expect(mathText('plain text')).toBe('plain text');
    expect(mathText('a_{ij}')).toBe('a_{ij}'); // unmappable subscript kept intact
  });
});

import { studentAnswerText } from '../../app/question-paper-generator/grade.js';
describe('studentAnswerText()', () => {
  it('renders objective answers with letters', () => {
    expect(studentAnswerText({ type: 'mcq', options: ['a', 'b', 'c'] }, 1)).toBe('(B) b');
    expect(studentAnswerText({ type: 'tf' }, false)).toBe('False');
    expect(studentAnswerText({ type: 'multi', options: ['a', 'b', 'c'] }, [2, 0])).toBe('(C) c; (A) a');
  });
  it('renders open-ended text and blanks', () => {
    expect(studentAnswerText({ type: 'short' }, 'My essay')).toBe('My essay');
    expect(studentAnswerText({ type: 'mcq', options: ['a'] }, undefined)).toMatch(/no answer/);
    expect(studentAnswerText({ type: 'fill' }, '')).toMatch(/no answer/);
  });
  it('renders match mapping and case sub-answers', () => {
    const m = studentAnswerText({ type: 'match', pairs: [{ l: 'Dog', r: 'Bark' }, { l: 'Cat', r: 'Meow' }] }, [0, 1]);
    expect(m).toContain('Dog ->');
    const c = studentAnswerText({ type: 'case', sub: [{ q: 'x', options: ['p', 'q'], answer: 0 }] }, { 0: 1 });
    expect(c).toContain('(B) q');
  });
});

import { grade as gradeH, correctText as ctH, isAuto as isAutoH } from '../../app/question-paper-generator/grade.js';
describe('hotspot grading', () => {
  const q = { type: 'hotspot', hot: { x: 0.5, y: 0.5, r: 0.12 } };
  it('correct when click is within tolerance', () => {
    expect(gradeH(q, [0.5, 0.5])).toBe(true);
    expect(gradeH(q, [0.55, 0.52])).toBe(true);
  });
  it('wrong when click is outside tolerance or missing', () => {
    expect(gradeH(q, [0.8, 0.8])).toBe(false);
    expect(gradeH(q, null)).toBe(false);
    expect(gradeH({ type: 'hotspot' }, [0.5, 0.5])).toBe(false);
  });
  it('is auto-graded and has correctText', () => {
    expect(isAutoH({ type: 'hotspot' })).toBe(true);
    expect(ctH(q)).toMatch(/location/);
  });
});
