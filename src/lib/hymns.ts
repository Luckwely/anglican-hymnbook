
import type { Hymn } from '../types/hymn';

// Import all hymn JSON files automatically
const modules = import.meta.glob(
  '../data/hymns/karoly/*.json',
  {
    eager: true,
    import: 'default',
  }
) as Record<string, Hymn>;

// Sort hymns by number
export const hymns: Hymn[] = Object.values(modules).sort(
  (a, b) => a.hymnNumber - b.hymnNumber
);

// Get a hymn by its number
export function getHymnByNumber(n: number): Hymn | undefined {
  return hymns.find(h => h.hymnNumber === n);
}

// Normalize text for searching
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Search hymns by title or number
export function searchHymns(query: string): Hymn[] {
  const q = normalize(query).replace(/^#/, '');

  if (!q) return hymns;

  const isNumeric = /^\d+$/.test(q);

  return hymns.filter(h => {
    if (normalize(h.title).includes(q)) return true;

    if (isNumeric) {
      const num = String(h.hymnNumber);

      return (
        num === String(Number(q)) ||
        num.startsWith(q.replace(/^0+/, '') || '0') ||
        num.padStart(3, '0').includes(q)
      );
    }

    return false;
  });
}
