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

/**
 * 서비스 카테고리 → GET /api/performances/search 의 `genres` 파라미터 값.
 *
 * common-ui.md 장르 카테고리의 괄호(예: 클래식(서양음악·한국음악))는 그 카테고리에
 * 종속되는 KOPIS 세부 장르를 적어 둔 것이고, 통합은 백엔드가 이미 해서 내려준다.
 * 따라서 필터에도 카테고리 단위 값만 보낸다. 실제 응답·필터로 확인한 값은
 * 연극·뮤지컬·콘서트·클래식·국악·기타 다섯 개이며, 클래식만 API 표기가
 * 달라(클래식 → 클래식·국악) 여기서 바꿔 준다.
 */
export const GENRE_API_VALUES: Record<GenreCategory, string> = {
  연극: "연극",
  뮤지컬: "뮤지컬",
  콘서트: "콘서트",
  클래식: "클래식·국악",
  기타: "기타",
};

/**
 * 장르 필터를 `genres` 파라미터로 바꾼다. "전체"는 장르로 거르지 않는 상태라
 * undefined를 돌려 파라미터 자체를 보내지 않는다.
 */
export function toGenresParam(genre: GenreFilterOption): string[] | undefined {
  return genre === "전체" ? undefined : [GENRE_API_VALUES[genre]];
}
