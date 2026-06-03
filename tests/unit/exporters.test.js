import { describe, it, expect } from 'vitest';
import { toGIFT, toMoodleXML, toCSV, toAiken, toQTIZip, slug } from '../../app/question-paper-generator/exporters.js';

const paper = () => ({ title: 'My Paper', sections: [{ title: 'A', marks: 1, questions: [
  { type: 'mcq', q: '2+2?', options: ['3', '4'], answer: 1, explanation: 'math' },
  { type: 'tf', q: 'Sky blue?', answer: true },
  { type: 'case', q: 'Passage', sub: [
    { q: 's1', options: ['a', 'b'], answer: 0 },
    { q: 's2', options: ['c', 'd'], answer: 1 },
  ] },
] }] });

describe('toGIFT()', () => {
  it('marks correct with = and distractors with ~, handles tf', () => {
    const g = toGIFT(paper());
    expect(g).toContain('::Q1::');
    expect(g).toContain('=4');
    expect(g).toContain('~3');
    expect(g).toContain('{TRUE}');
  });
  it('escapes GIFT control characters', () => {
    const g = toGIFT({ sections: [{ questions: [{ type: 'mcq', q: 'a=b?', options: ['x=y', 'z'], answer: 1 }] }] });
    expect(g).toContain('\\=');
  });
});

describe('toMoodleXML()', () => {
  it('emits multichoice with fraction 100 on the correct option and escapes XML', () => {
    const x = toMoodleXML(paper());
    expect(x).toContain('<question type="multichoice">');
    expect(x).toContain('fraction="100"');
    const esc = toMoodleXML({ sections: [{ questions: [{ type: 'mcq', q: 'a<b & c', options: ['x', 'y'], answer: 0 }] }] });
    expect(esc).toContain('a&lt;b &amp; c');
  });
  it('expands a case question into its sub-MCQs', () => {
    const x = toMoodleXML(paper());
    expect((x.match(/type="multichoice"/g) || []).length).toBe(3); // 1 mcq + 2 case subs
  });
});

describe('toCSV()', () => {
  it('has a header + one row per top-level question, with a case-answer summary', () => {
    const csv = toCSV(paper());
    const lines = csv.trim().split('\r\n');
    expect(lines[0]).toContain('"#","section","type"');
    expect(lines).toHaveLength(1 + 3);
    expect(csv).toContain('"case"');
    expect(csv).toContain('1:a 2:b');
  });
});

describe('slug()', () => {
  it('sanitizes a title for filenames', () => {
    expect(slug('My Paper!')).toBe('My_Paper');
    expect(slug('')).toBe('paper');
  });
});

describe('toAiken', () => {
  it('emits only single-answer MCQ blocks each ending in ANSWER:', () => {
    const out = toAiken(paper());
    const blocks = out.trim().split(/\n\n/);
    expect(blocks.length).toBeGreaterThanOrEqual(3); // mcq + tf + 2 case-subs
    blocks.forEach((b) => expect(b).toMatch(/\nANSWER: [A-Z]\s*$/));
  });
});
describe('toQTIZip', () => {
  it('produces a PK zip with content', async () => {
    const blob = await toQTIZip(paper());
    expect(blob.size).toBeGreaterThan(100);
    const buf = new Uint8Array(await blob.arrayBuffer());
    expect(buf[0]).toBe(0x50); expect(buf[1]).toBe(0x4B);
  });
});
