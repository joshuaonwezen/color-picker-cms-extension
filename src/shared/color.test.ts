import {describe, expect, it} from 'vitest';

import {normalizeHex} from './color';

describe('normalizeHex', () => {
  it('accepts #rrggbb and expands #rgb', () => {
    expect(normalizeHex(' #1A73E8 ')).toBe('#1a73e8');
    expect(normalizeHex('#abc')).toBe('#aabbcc');
  });

  it('rejects anything else, so a title never shows as a color', () => {
    expect(normalizeHex('Easy Access Saver')).toBeNull();
    expect(normalizeHex('1a73e8')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
    expect(normalizeHex(null)).toBeNull();
  });
});
