export const GENRE_CATEGORIES = [
  "연극",
  "뮤지컬",
  "콘서트",
  "클래식",
  "기타",
] as const;
export type GenreCategory = (typeof GENRE_CATEGORIES)[number];

export const GENRE_FILTER_OPTIONS = ["전체", ...GENRE_CATEGORIES] as const;
export type GenreFilterOption = (typeof GENRE_FILTER_OPTIONS)[number];
