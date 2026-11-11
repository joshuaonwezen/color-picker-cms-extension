import {describe, expect, it} from 'vitest';

import {contrastLevel, contrastRatio, normalizeHex, parsePalette, readableText} from './color';

describe('normalizeHex', () => {
  it('accepts #rrggbb and expands #rgb', () => {
    expect(normalizeHex(' #1A73E8 ')).toBe('#1a73e8');
    expect(normalizeHex('#abc')).toBe('#aabbcc');
  });

  it('rejects anything else', () => {
    expect(normalizeHex('Easy Access Saver')).toBeNull();
    expect(normalizeHex('1a73e8')).toBeNull();
    expect(normalizeHex('#12345')).toBeNull();
    expect(normalizeHex(null)).toBeNull();
  });
});

describe('parsePalette', () => {
  it('reads named and unnamed entries, comma or newline separated', () => {
    expect(parsePalette('Lime #ABFF44, Forest green #197050\n#fff')).toEqual({
      swatches: [
        {name: 'Lime', hex: '#abff44'},
        {name: 'Forest green', hex: '#197050'},
        {name: '#ffffff', hex: '#ffffff'},
      ],
      invalid: [],
    });
  });

  it('reports entries it cannot read', () => {
    expect(parsePalette('Lime #abff44, Red, Blue #12').invalid).toEqual(['Red', 'Blue #12']);
  });
});

describe('contrast', () => {
  it('matches the WCAG extremes', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  it('picks the text color that reads better', () => {
    expect(readableText('#abff44').color).toBe('#08251a');
    expect(readableText('#0d3a29').color).toBe('#ffffff');
  });

  it('grades normal-size text', () => {
    expect(contrastLevel(21)).toBe('AAA');
    expect(contrastLevel(4.6)).toBe('AA');
    expect(contrastLevel(3.2)).toBe('AA large');
    expect(contrastLevel(2)).toBe('fail');
  });
});
