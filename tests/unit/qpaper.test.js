import { describe, it, expect } from 'vitest';
import { stripOptionLabel } from '../../lib/qpaper.js';

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
