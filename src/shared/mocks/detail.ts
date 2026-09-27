// Provisional: based on screen spec, not the API contract.
import type {
  PerformanceDetail,
  PerformanceSchedule,
  TicketVendor,
  VenueDetail,
} from "@/app/(tabs)/detail/[id]/_types";
import type { PerformanceSummary } from "@/app/(tabs)/_types";
import {
  MOCK_ALL_PERFORMANCES,
  MOCK_FEATURED_PERFORMANCE,
  MOCK_LIKED_PERFORMANCES,
} from "@/shared/mocks/home";

// MOCK: 상세 이미지 자리표시(picsum, 세로 긴 비율). Phase 2에서 실제 에셋으로 교체.
const detailImage = (seed: string) =>
  `https://picsum.photos/seed/${seed}/690/1200`;

// MOCK: false로 바꾸면 상세 이미지가 없는 케이스(→ "상세 보기" 버튼 숨김)를 확인할 수 있다.
export const MOCK_DETAIL_HAS_DETAIL_IMAGES = true;

const MOCK_DETAIL_IMAGES = [detailImage("detail-1"), detailImage("detail-2")];

const MOCK_SCHEDULES: PerformanceSchedule[] = [
  { days: "월요일 - 목요일", time: "10:30 - 20:00" },
  { days: "금요일 - 일요일", time: "10:30 - 20:00" },
];

const MOCK_TICKET_VENDORS: TicketVendor[] = [
  { name: "멜론 티켓", url: "https://ticket.melon.com" },
  { name: "yes24 티켓", url: "http://ticket.yes24.com" },
];

const MOCK_CAST = [
  "김서연",
  "이도현",
  "박지훈",
  "최유진",
  "정민재",
  "한소희",
  "오세훈",
  "강나윤",
  "윤태오",
  "임하늘",
  "서준우",
  "문가영",
  "배현우",
];

// MOCK: 상세 화면(Todo F)은 아직 목업이라 공연장 id도 목업 값이다. 지도는 실제
// 극장 id(숫자)를 쓰므로 /map?venueId=venue-sejong 딥링크는 매칭되지 않고,
// 지도는 기본 극장을 선택한다. Todo F에서 실제 극장 id로 교체하면 다시 연결된다.
const MOCK_VENUE_DETAIL: VenueDetail = {
  id: "venue-sejong",
  name: "세종문화회관",
  roadAddress: "서울특별시 종로구 세종대로 175",
  jibunAddress: "서울특별시 종로구 세종로 81-3",
  phone: "02-399-1000",
  lat: 37.5726,
  lng: 126.9762,
};

/** 요약 정보(홈 목업)에 상세 필드를 얹어 목업 상세 정보를 만든다. */
function buildDetail(summary: PerformanceSummary): PerformanceDetail {
  return {
    ...summary,
    detailImageUrls: MOCK_DETAIL_HAS_DETAIL_IMAGES ? MOCK_DETAIL_IMAGES : [],
    schedules: MOCK_SCHEDULES,
    ageRating: "전체 연령가",
    ticketVendors: MOCK_TICKET_VENDORS,
    cast: MOCK_CAST,
    venueDetail: MOCK_VENUE_DETAIL,
    // 좋아요 목록에 포함된 공연이면 좋아요 상태로 시작한다.
    isLiked: MOCK_LIKED_PERFORMANCES.some((p) => p.id === summary.id),
  };
}

/**
 * id로 목업 상세 정보를 찾는다. 홈 카드에서 넘어온 공연이면 해당 요약을 쓰고,
 * 없으면 주목받는 공연을 대신 보여준다(Phase 1 목업 단계이므로 항상 값이 있다).
 */
export function getMockPerformanceDetail(id: string): PerformanceDetail {
  const summary =
    MOCK_ALL_PERFORMANCES.find((p) => p.id === id) ?? MOCK_FEATURED_PERFORMANCE;
  return buildDetail(summary);
}
