// MOCK: 계약(PerformanceResponse/TheatreInfo)에 없는 디테일 필드의 임시 값.
// 지번 주소·건물명·공연장 id(지도 딥링크). 오너 결정 또는 백엔드 반영이 나오면
// 이 파일과 useBlockedDetailFields를 함께 제거한다.
import type { BlockedDetailFields } from "@/app/(tabs)/detail/[id]/_types";

export const MOCK_BLOCKED_DETAIL_FIELDS: BlockedDetailFields = {
  jibunAddress: "서울특별시 종로구 세종로 81-3",
  buildingName: "세종문화회관",
  // 지도는 실제 극장 id(숫자)를 쓰므로 이 목업 값으로는 딥링크가 매칭되지 않는다.
  venueId: "venue-sejong",
};
