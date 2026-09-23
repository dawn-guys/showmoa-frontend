// Provisional: based on screen spec, not the API contract.
import type { CalendarPerformance } from "@/app/(tabs)/calendar/_types";

// MOCK: 실제 포스터 에셋 연동 전까지 사용하는 자리표시 이미지(picsum, 세로형).
const poster = (seed: string) => `https://picsum.photos/seed/${seed}/600/800`;

// MOCK: 캘린더 공연 목록. 색상은 공연별로 임의 지정했으며, Phase 2에서 실제
// 캘린더 공연 요청으로 교체한다. 날짜는 현재 기준월(2026-09)에 맞춰 분포시켰고
// 스펙 엣지 케이스(오픈런·공연 종료·단일일·긴 제목)를 포함한다.
//  - 여러 공연이 여러 날에 걸치도록 기간을 겹쳐 월간 셀이 채워지게 했다.
//  - calendar-openrun: 오픈런(endDate null)
//  - calendar-ended: 공연 종료(지난달)
//  - calendar-single: 단일일 공연(기간 하루)
//  - calendar-long: 긴 제목(달력 칩/리스트 말줄임)
export const MOCK_CALENDAR_EMPTY = false;
export const MOCK_CALENDAR_PERFORMANCES: CalendarPerformance[] = [
  {
    id: "calendar-bonjour",
    title: "봉주르 파리 미디어 전시",
    posterUrl: poster("calendar-bonjour"),
    genre: "기타",
    venue: "서울 타워 펠리스 지하",
    startDate: "2026-09-01T10:00:00+09:00",
    endDate: "2026-09-30T20:00:00+09:00",
    status: "ongoing",
    likeCount: 812,
    color: "#ff6f6f",
  },
  {
    id: "calendar-lightroom",
    title: "빛의 씨어터: 클림트",
    posterUrl: poster("calendar-lightroom"),
    genre: "기타",
    venue: "서울 타워 펠리스 지하",
    startDate: "2026-09-05T11:00:00+09:00",
    endDate: "2026-09-25T21:00:00+09:00",
    status: "ongoing",
    likeCount: 640,
    color: "#43ffc0",
  },
  {
    id: "calendar-arte",
    title: "아르떼 뮤지엄 인 서울",
    posterUrl: poster("calendar-arte"),
    genre: "기타",
    venue: "서울 강남구 코엑스 전시홀",
    startDate: "2026-09-08T10:00:00+09:00",
    endDate: "2026-10-15T20:00:00+09:00",
    status: "ongoing",
    likeCount: 733,
    color: "#9abdff",
  },
  {
    id: "calendar-kpop",
    title: "K-POP 세상을 열다 (멜론)",
    posterUrl: poster("calendar-kpop"),
    genre: "콘서트",
    venue: "서울 올림픽공원 KSPO돔",
    startDate: "2026-09-12T18:00:00+09:00",
    endDate: "2026-09-30T22:00:00+09:00",
    status: "ongoing",
    likeCount: 1580,
    color: "#4dd0e1",
  },
  {
    id: "calendar-art-performance",
    title: "행위 예술가의 예술",
    posterUrl: poster("calendar-art-performance"),
    genre: "기타",
    venue: "서울 대학로 소극장",
    startDate: "2026-09-19T19:30:00+09:00",
    endDate: "2026-09-29T21:30:00+09:00",
    status: "ongoing",
    likeCount: 288,
    color: "#c792ea",
  },
  {
    id: "calendar-single",
    title: "무무뇽의 쿠킹 데이즈",
    posterUrl: poster("calendar-single"),
    genre: "기타",
    venue: "서울 마포구 쿠킹스튜디오",
    startDate: "2026-09-21T14:00:00+09:00",
    endDate: "2026-09-21T17:00:00+09:00",
    status: "ongoing",
    likeCount: 142,
    color: "#ffd166",
  },
  {
    id: "calendar-openrun",
    title: "오픈런 코미디 매직쇼",
    posterUrl: poster("calendar-openrun"),
    genre: "연극",
    venue: "서울 홍대 아트센터",
    startDate: "2026-09-15T20:00:00+09:00",
    endDate: null,
    status: "ongoing",
    likeCount: 305,
    color: "#06d6a0",
  },
  {
    id: "calendar-long",
    title:
      "지킬 앤 하이드 라이브 오케스트라와 함께하는 프리미엄 뮤지컬 갈라 콘서트 앙코르 공연",
    posterUrl: poster("calendar-long"),
    genre: "뮤지컬",
    venue: "서울 예술의전당 오페라극장",
    startDate: "2026-09-10T19:30:00+09:00",
    endDate: "2026-09-28T22:00:00+09:00",
    status: "ongoing",
    likeCount: 733,
    color: "#b388ff",
  },
  {
    id: "calendar-ended",
    title: "레드벨벳 Hot Summer 콘서트",
    posterUrl: poster("calendar-ended"),
    genre: "콘서트",
    venue: "서울 상암 월드컵경기장",
    startDate: "2026-08-01T18:00:00+09:00",
    endDate: "2026-08-31T21:00:00+09:00",
    status: "ended",
    likeCount: 512,
    color: "#ef476f",
  },
];
