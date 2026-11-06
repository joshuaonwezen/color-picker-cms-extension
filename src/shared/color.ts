export interface Swatch {
  name: string;
  /** Lower-case #rrggbb. */
  hex: string;
}

/** Mosey Bank's brand colors (optimizely-nextjs-demo globals.css, light theme). Used until a palette is saved. */
export const DEFAULT_PALETTE: Swatch[] = [
  {name: 'Lime', hex: '#abff44'},
  {name: 'Fresh green', hex: '#7ddd3d'},
  {name: 'Mosey green', hex: '#197050'},
  {name: 'Deep green', hex: '#0d3a29'},
  {name: 'Ink', hex: '#08251a'},
  {name: 'Teal', hex: '#007b79'},
  {name: 'Aqua', hex: '#91dbda'},
  {name: 'Plum', hex: '#8f4764'},
  {name: 'Mint', hex: '#eff6e9'},
  {name: 'White', hex: '#ffffff'},
];

/** The dark text color the site pairs with light backgrounds (its on-surface token). */
export const INK = '#08251a';
export const WHITE = '#ffffff';

/** "#1a73e8" for a #rgb or #rrggbb value (any case, spaces trimmed), else null. */
export function normalizeHex(value: string | null | undefined): string | null {
  const v = (value ?? '').trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return null;
}

/**
 * "Lime #abff44, Plum #8f4764, #ffffff" → swatches. Each entry is an optional name and a
 * hex color. Returns the entries it could not read too, so settings can reject them.
 */
export function parsePalette(raw: string | null | undefined): {swatches: Swatch[]; invalid: string[]} {
  const swatches: Swatch[] = [];
  const invalid: string[] = [];
  for (const entry of (raw ?? '').split(/[,\n]/).map((e) => e.trim()).filter(Boolean)) {
    const match = /^(.*?)\s*(#[0-9a-f]{3}(?:[0-9a-f]{3})?)$/i.exec(entry);
    const hex = match ? normalizeHex(match[2]) : null;
    if (!match || !hex) {
      invalid.push(entry);
      continue;
    }
    swatches.push({name: match[1].trim() || hex, hex});
  }
  return {swatches, invalid};
}

// WCAG 2.x relative luminance of a #rrggbb color.
function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

/** WCAG contrast ratio between two #rrggbb colors, 1 to 21. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** White or ink text, whichever reads better on the background, and how well. */
export function readableText(background: string): {color: string; ratio: number} {
  const onWhite = contrastRatio(background, WHITE);
  const onInk = contrastRatio(background, INK);
  return onWhite >= onInk ? {color: WHITE, ratio: onWhite} : {color: INK, ratio: onInk};
}

/** WCAG level for normal-size text at this ratio. */
export function contrastLevel(ratio: number): 'AAA' | 'AA' | 'AA large' | 'fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA large';
  return 'fail';
}
