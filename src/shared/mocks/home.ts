// Provisional: based on screen spec, not the API contract.
import type {
  FeaturedPerformance,
  PerformanceSummary,
  RankedPerformance,
} from "@/app/(tabs)/_types";

// 목업 포스터 경로. 실제 에셋 연동 전까지 렌더되지 않는 자리표시자다.
const poster = (seed: string) => `/mock/posters/${seed}.jpg`;

// MOCK: 주목받는 공연 1개. Phase 2에서 실제 추천 공연으로 교체한다.
export const MOCK_FEATURED_PERFORMANCE: FeaturedPerformance = {
  id: "featured-1",
  title: "그림으로 그리는 춤과 예술의 경계",
  posterUrl: poster("featured-1"),
  genre: "기타",
  venue: "서울 타워 펠리스 3층 세미나관",
  startDate: "2026-09-10T19:30:00+09:00",
  endDate: "2026-10-10T21:00:00+09:00",
  status: "ongoing",
};

// MOCK: 인기 공연 순위 5개. rank 2는 긴 제목(말줄임) 엣지 케이스.
export const MOCK_POPULAR_RANKING: RankedPerformance[] = [
  {
    rank: 1,
    id: "popular-1",
    title: "위코딩 4기 취업 기반 스터디 웹 개발 모임",
    posterUrl: poster("popular-1"),
    genre: "기타",
    venue: "서울 강남구 위코딩 캠퍼스",
    startDate: "2026-09-01T10:00:00+09:00",
    endDate: "2026-12-01T18:00:00+09:00",
    status: "ongoing",
  },
  {
    rank: 2,
    id: "popular-2",
    title:
      "주방에서 다 같이 모여서 배우는 해피해피 쿠킹 클래스 시즌2 스페셜 에디션",
    posterUrl: poster("popular-2"),
    genre: "기타",
    venue: "서울 마포구 쿠킹스튜디오",
    startDate: "2026-09-15T14:00:00+09:00",
    endDate: "2026-11-15T17:00:00+09:00",
    status: "ongoing",
  },
  {
    rank: 3,
    id: "popular-3",
    title: "쉽게 배우는 꽃꽂이 플라워링 4기",
    posterUrl: poster("popular-3"),
    genre: "기타",
    venue: "서울 종로구 플로리스트 아틀리에",
    startDate: "2026-10-01T11:00:00+09:00",
    endDate: null,
    status: "upcoming",
  },
  {
    rank: 4,
    id: "popular-4",
    title: "보드잼 4기 21회차 ( 전략 게임 )",
    posterUrl: poster("popular-4"),
    genre: "기타",
    venue: "서울 서초구 보드게임 라운지",
    startDate: "2026-09-20T13:00:00+09:00",
    endDate: "2026-09-20T18:00:00+09:00",
    status: "ongoing",
  },
  {
    rank: 5,
    id: "popular-5",
    title: "밴드 음악 클래스 고밴드에서 가르치는 보컬 트레이닝",
    posterUrl: poster("popular-5"),
    genre: "콘서트",
    venue: "서울 용산구 사운드 스튜디오",
    startDate: "2026-09-25T19:00:00+09:00",
    endDate: "2026-10-25T21:00:00+09:00",
    status: "upcoming",
  },
];

// MOCK: 카테고리별 공연. 장르 5종을 모두 포함하며 엣지 케이스를 섞었다.
//  - category-ended: 공연 종료(endDate 과거, status ended)
//  - category-openrun: 오픈런(endDate null)
//  - category-long: 긴 제목(말줄임)
export const MOCK_CATEGORY_PERFORMANCES: PerformanceSummary[] = [
  {
    id: "category-openrun",
    title: "오픈런 코미디 연극 웃음 대잔치",
    posterUrl: poster("category-1"),
    genre: "연극",
    venue: "서울 대학로 소극장",
    startDate: "2026-01-05T20:00:00+09:00",
    endDate: null,
    status: "ongoing",
  },
  {
    id: "category-long",
    title:
      "지킬 앤 하이드 라이브 오케스트라와 함께하는 프리미엄 뮤지컬 갈라 콘서트 앙코르 공연",
    posterUrl: poster("category-2"),
    genre: "뮤지컬",
    venue: "서울 예술의전당 오페라극장",
    startDate: "2026-09-18T19:30:00+09:00",
    endDate: "2026-11-30T22:00:00+09:00",
    status: "ongoing",
  },
  {
    id: "category-ended",
    title: "레드벨벳 Hot Summer 콘서트",
    posterUrl: poster("category-3"),
    genre: "콘서트",
    venue: "서울 올림픽공원 KSPO돔",
    startDate: "2026-07-01T18:00:00+09:00",
    endDate: "2026-08-31T21:00:00+09:00",
    status: "ended",
  },
  {
    id: "category-4",
    title: "콜드플레이 내한 공연",
    posterUrl: poster("category-4"),
    genre: "콘서트",
    venue: "서울 상암 월드컵경기장",
    startDate: "2026-11-24T19:00:00+09:00",
    endDate: "2026-11-25T22:00:00+09:00",
    status: "upcoming",
  },
  {
    id: "category-5",
    title: "화려한 클래식의 밤",
    posterUrl: poster("category-5"),
    genre: "클래식",
    venue: "서울 롯데콘서트홀",
    startDate: "2026-09-14T20:00:00+09:00",
    endDate: "2026-09-14T22:00:00+09:00",
    status: "ended",
  },
  {
    id: "category-6",
    title: "시카고 : 화려한 재즈 뮤지컬",
    posterUrl: poster("category-6"),
    genre: "뮤지컬",
    venue: "서울 샤롯데씨어터",
    startDate: "2026-09-05T19:30:00+09:00",
    endDate: "2026-12-20T22:00:00+09:00",
    status: "ongoing",
  },
  {
    id: "category-7",
    title: "오솔라미오 홍대 소극장 연극",
    posterUrl: poster("category-7"),
    genre: "연극",
    venue: "서울 홍대 아트센터",
    startDate: "2026-12-28T20:00:00+09:00",
    endDate: "2027-02-28T22:00:00+09:00",
    status: "upcoming",
  },
  {
    id: "category-8",
    title: "크리스마스 가족 뮤지컬",
    posterUrl: poster("category-8"),
    genre: "뮤지컬",
    venue: "서울 세종문화회관 대극장",
    startDate: "2026-12-18T15:00:00+09:00",
    endDate: "2026-12-25T20:00:00+09:00",
    status: "upcoming",
  },
  {
    id: "category-9",
    title: "신년 국악 한마당",
    posterUrl: poster("category-9"),
    genre: "기타",
    venue: "서울 국립국악원 예악당",
    startDate: "2027-01-01T15:00:00+09:00",
    endDate: null,
    status: "upcoming",
  },
];

// MOCK: 좋아요한 공연. MOCK_LIKED_EMPTY=true로 바꾸면 빈 목록(빈 상태) 확인.
export const MOCK_LIKED_EMPTY = false;
export const MOCK_LIKED_PERFORMANCES: PerformanceSummary[] = [
  MOCK_CATEGORY_PERFORMANCES[1], // 긴 제목(말줄임) + 진행 중
  MOCK_CATEGORY_PERFORMANCES[3], // 예정(D-day 뱃지)
  MOCK_CATEGORY_PERFORMANCES[2], // 공연 종료
  MOCK_CATEGORY_PERFORMANCES[5], // 진행 중
];

// MOCK: 오늘 캘린더 공연. MOCK_TODAY_EMPTY=true로 바꾸면 빈 목록 확인.
export const MOCK_TODAY_EMPTY = false;
export const MOCK_TODAY_PERFORMANCES: PerformanceSummary[] = [
  MOCK_POPULAR_RANKING[3], // 오늘(2026-09-20) 진행
  MOCK_CATEGORY_PERFORMANCES[0], // 오픈런
];
