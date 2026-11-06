/** "#1a73e8" for a #rgb or #rrggbb value (any case, spaces trimmed), else null. */
export function normalizeHex(value: string | null | undefined): string | null {
  const v = (value ?? '').trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(v)) return v;
  if (/^#[0-9a-f]{3}$/.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`;
  return null;
}
