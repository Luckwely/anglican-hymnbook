/** Single source of truth for URLs. Change a path here and every link follows. */
export const routes = {
  home: '/',
  hymnPattern: '/karoly/:number',
  hymn: (n: number) => `/karoly/${n}`,
} as const;
