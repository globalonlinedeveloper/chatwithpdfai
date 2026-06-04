import { describe, it, expect } from 'vitest';
import { stripOptionLabel, cleanTitle } from '../../lib/qpaper.js';

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
