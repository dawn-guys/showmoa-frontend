// Provisional: based on screen spec, not the API contract.
import type { PerformanceSummary } from "@/app/(tabs)/_types";
import { MOCK_ALL_PERFORMANCES } from "./home";

// MOCK: 실제 포스터 에셋 연동 전까지 사용하는 자리표시 이미지(picsum, 세로형).
const poster = (seed: string) => `https://picsum.photos/seed/${seed}/600/800`;

// MOCK: 검색 데모용 "대학로" 공연들(피그마 검색 리스트 예시와 동일한 제목).
const MOCK_SEARCH_ONLY: PerformanceSummary[] = [
  {
    id: "search-daehakro-1",
    title: "대학로에서 즐기는 베이스의 매력",
    posterUrl: poster("search-daehakro-1"),
    genre: "콘서트",
    venue: "서울 종로구 대학로 소극장",
    startDate: "2026-09-12T19:00:00+09:00",
    endDate: "2026-10-12T21:00:00+09:00",
    status: "ongoing",
    likeCount: 128,
  },
  {
    id: "search-daehakro-2",
    title: "대학로 밴드 우주 정거장 : 초록 빛",
    posterUrl: poster("search-daehakro-2"),
    genre: "콘서트",
    venue: "서울 종로구 대학로 라이브홀",
    startDate: "2026-09-20T18:30:00+09:00",
    endDate: "2026-11-20T21:00:00+09:00",
    status: "ongoing",
    likeCount: 96,
  },
];

// MOCK: 검색이 훑는 전체 공연 풀. 전역 공연 목록 + 검색 데모용 항목.
export const MOCK_SEARCH_PERFORMANCES: PerformanceSummary[] = [
  ...MOCK_SEARCH_ONLY,
  ...MOCK_ALL_PERFORMANCES,
];
