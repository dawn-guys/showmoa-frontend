// Provisional: based on screen spec, not the API contract.
import type { PerformanceSummary } from "@/app/(tabs)/_types";

/**
 * 지도 마커 하나에 대응하는 공연장. docs/spec/map.md의 바텀 시트 필드
 * (공연장 이름·공연 개수·공연 목록)와 마커 표시에 필요한 좌표로 구성한다.
 */
export interface MapVenue {
  id: string;
  /** 공연장 이름 */
  name: string;
  /** 위도 */
  lat: number;
  /** 경도 */
  lng: number;
  /** 이 공연장에서 열리는 공연 목록 */
  performances: PerformanceSummary[];
}
