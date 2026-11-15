/** Spread `total` items evenly over the fewest lines allowed by `cap` items per line. */
export function balance(total: number, cap: number): number {
  const capped = Math.max(1, Math.min(cap, total));
  const lines = Math.ceil(total / capped);
  return Math.ceil(total / lines);
}

export function measuresPerLine(
  availableWidth: number,
  minMeasureWidth: number,
  total: number,
  extraFirst = 0,
  max = 8,
): number {
  const fit = Math.floor((availableWidth - extraFirst) / minMeasureWidth);
  return balance(total, Math.min(max, fit));
}

/** Breakpoints (px of the sheet's content width): phone portrait, phone landscape / small tablet, desktop. */
export const BP_PORTRAIT = 480;
export const BP_LANDSCAPE = 900;

export function verseLines(verse: unknown): string[] {
  if (typeof verse === 'string') return verse.split('\n');
  if (verse && typeof verse === 'object') {
    const v = verse as { lines?: string[]; text?: string };
    if (v.lines) return v.lines;
    if (v.text) return v.text.split('\n');
  }
  return [];
}
