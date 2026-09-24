// Provisional: based on screen spec, not the API contract.
import type { PerformanceSummary } from "@/app/(tabs)/_types";

/** 예매처 링크(버튼으로 노출, 클릭 시 외부 예매처로 이동). */
export interface TicketVendor {
  /** 예매처 이름(예: 멜론 티켓) */
  name: string;
  /** 예매처 URL */
  url: string;
}

/** 공연 회차 스케줄 한 줄(요일 범위 + 시간 범위). */
export interface PerformanceSchedule {
  /** 요일 범위(예: 월요일 - 목요일) */
  days: string;
  /** 시간 범위(예: 10:30 - 20:00) */
  time: string;
}

/** 공연장 상세 정보(주소·연락처·좌표). */
export interface VenueDetail {
  /** 공연장 식별자. 지도(/map?venueId=)와 공유하는 공연장 엔티티 키. */
  id: string;
  /** 건물명(예: 세종문화회관) */
  name: string;
  /** 도로명 주소 */
  roadAddress: string;
  /** 지번 주소 */
  jibunAddress: string;
  /** 전화번호 */
  phone: string;
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
}

/**
 * 디테일 페이지가 사용하는 공연 상세 정보. 홈 요약(PerformanceSummary)에
 * docs/spec/detail.md의 상세 필드(상세 이미지·스케줄·나이·예매처·출연진·
 * 공연장 상세)와 좋아요 상태를 더한 것이다.
 */
export interface PerformanceDetail extends PerformanceSummary {
  /** 상세 정보 이미지 URL 목록. 비어 있으면 "상세 보기" 버튼을 노출하지 않는다. */
  detailImageUrls: string[];
  /** 공연 스케줄(요일·시간) */
  schedules: PerformanceSchedule[];
  /** 나이 제한(예: 전체 연령가) */
  ageRating: string;
  /** 예매처 목록 */
  ticketVendors: TicketVendor[];
  /** 출연진 이름 목록 */
  cast: string[];
  /** 공연장 상세 정보 */
  venueDetail: VenueDetail;
  /** 로그인 사용자의 좋아요(찜) 여부 */
  isLiked: boolean;
}
