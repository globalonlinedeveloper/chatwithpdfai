import { describe, it, expect } from 'vitest';
import { stripOptionLabel, cleanTitle, defaultBloom, vApplyOption, vApplyTf, vApplyValue, vApplyMulti, vApplyMatch } from '../../lib/qpaper.js';

describe('stripOptionLabel (fixes the "(a) a) ..." double-label bug)', () => {
  it('strips baked-in option labels of every common style', () => {
    expect(stripOptionLabel('a) Indira Gandhi')).toBe('Indira Gandhi');
    expect(stripOptionLabel('A. Oxygen')).toBe('Oxygen');
    expect(stripOptionLabel('(b) Pratibha Patil')).toBe('Pratibha Patil');
    expect(stripOptionLabel('(C) Sonia Gandhi')).toBe('Sonia Gandhi');
    expect(stripOptionLabel('1) Bangladesh')).toBe('Bangladesh');
    expect(stripOptionLabel('2. Pakistan')).toBe('Pakistan');
    expect(stripOptionLabel('d : Nepal')).toBe('Nepal');
  });
  it('leaves clean options unchanged', () => {
    expect(stripOptionLabel('Indira Gandhi')).toBe('Indira Gandhi');
    expect(stripOptionLabel('Yen')).toBe('Yen');
  });
  it('never eats legitimate leading content', () => {
    expect(stripOptionLabel('C++ is a language')).toBe('C++ is a language');
    expect(stripOptionLabel('A')).toBe('A');                 // bare letter option
    expect(stripOptionLabel('10 metres per second')).toBe('10 metres per second');
    expect(stripOptionLabel('e=mc^2')).toBe('e=mc^2');       // "=" is not a label delimiter
  });
  it('is null/empty safe', () => {
    expect(stripOptionLabel(null)).toBe('');
    expect(stripOptionLabel(undefined)).toBe('');
    expect(stripOptionLabel('')).toBe('');
  });
});

describe('cleanTitle (rejects junk LLM titles, composes a sensible fallback)', () => {
  it('keeps a good title unchanged', () => {
    expect(cleanTitle('CBSE Class 10 Science Examination', 'CBSE Class 10', 'science', '')).toBe('CBSE Class 10 Science Examination');
    expect(cleanTitle('Python Programming Basics Exam', '', 'python', '')).toBe('Python Programming Basics Exam');
  });
  it('replaces a title that just echoes a section name (the Application/Hard bug)', () => {
    expect(cleanTitle('Application', '', 'Indian freedom struggle', '', ['Easy', 'Application'])).toBe('Indian freedom struggle');
    expect(cleanTitle('hard', '', 'World geography', '', ['Easy', 'Hard'])).toBe('World geography');
  });
  it('does not falsely reject a real title that is not a section name', () => {
    expect(cleanTitle('Photosynthesis Basics Exam', '', 'biology', '', ['Section A', 'Recall'])).toBe('Photosynthesis Basics Exam');
  });
  it('replaces a bare section/part label (the observed bug)', () => {
    expect(cleanTitle('Section B', 'English', 'English grammar — tenses and articles', '')).toBe('English grammar');
    expect(cleanTitle('Part A', '', 'The water cycle', '')).toBe('The water cycle');
  });
  it('replaces empty / too-short / question-number titles', () => {
    expect(cleanTitle('', 'CBSE Class 10', '', '')).toBe('CBSE Class 10 — Question Paper');
    expect(cleanTitle('Q1', '', 'Photosynthesis in plants', '')).toBe('Photosynthesis in plants');
    expect(cleanTitle('  ', '', '', 'syllabus.pdf')).toBe('Questions from syllabus');
  });
  it('falls back to a generic title when nothing usable is given', () => {
    expect(cleanTitle('Section A', '', '', '')).toBe('Question Paper');
  });
  it('title-cases the topic head and trims at a dash/colon', () => {
    expect(cleanTitle('Untitled', '', 'algebra: linear equations', '')).toBe('Algebra');
  });
});

describe('defaultBloom (always tag a cognitive level)', () => {
  it('maps types to sensible Bloom levels', () => {
    expect(defaultBloom('tf')).toBe('Remember');
    expect(defaultBloom('mcq')).toBe('Understand');
    expect(defaultBloom('numeric')).toBe('Apply');
    expect(defaultBloom('case')).toBe('Analyse');
    expect(defaultBloom('weirdtype')).toBe('Understand');
  });
});

describe('verify-pass fix appliers', () => {
  it('vApplyOption matches by exact text and only changes when different', () => {
    const q = { options: ['Chlorophyll', 'Carotene', 'Xanthophyll'], answer: 1 };
    expect(vApplyOption(q, 'Chlorophyll')).toBe(true); expect(q.answer).toBe(0);
    expect(vApplyOption(q, 'Chlorophyll')).toBe(false); // already correct -> no change
    expect(vApplyOption(q, 'Not an option')).toBe(false); // unresolved -> no corruption
  });
  it('vApplyOption falls back to a numeric index', () => {
    const q = { options: ['A', 'B', 'C'], answer: 0 };
    expect(vApplyOption(q, 2)).toBe(true); expect(q.answer).toBe(2);
  });
  it('vApplyTf / vApplyValue', () => {
    const t = { answer: true }; expect(vApplyTf(t, 'false')).toBe(true); expect(t.answer).toBe(false);
    const v = { answer: '5' }; expect(vApplyValue(v, '6')).toBe(true); expect(v.answer).toBe('6');
    expect(vApplyValue(v, '6')).toBe(false);
  });
  it('vApplyMulti maps an array of texts to a sorted index set', () => {
    const q = { options: ['W', 'X', 'Y', 'Z'], answers: [0] };
    expect(vApplyMulti(q, ['X', 'Z', 'W'])).toBe(true); expect(q.answers).toEqual([0, 1, 3]);
    expect(vApplyMulti(q, ['W', 'X', 'Z'])).toBe(false); // same set -> no change
  });
  it('vApplyMatch re-pairs only when the corrected right is in the pool', () => {
    const q = { pairs: [{ l: 'Dog', r: 'Meow' }, { l: 'Cat', r: 'Bark' }] }; // wrong on purpose
    expect(vApplyMatch(q, ['Bark', 'Meow'])).toBe(true);
    expect(q.pairs.map((p) => p.r)).toEqual(['Bark', 'Meow']);
    // a correction that doesn't match the pool is ignored (never corrupts)
    const q2 = { pairs: [{ l: 'A', r: 'one' }, { l: 'B', r: 'two' }] };
    expect(vApplyMatch(q2, ['three', 'four'])).toBe(false);
    expect(q2.pairs.map((p) => p.r)).toEqual(['one', 'two']);
  });
});
