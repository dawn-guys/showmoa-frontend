import { MOCK_BLOCKED_DETAIL_FIELDS } from "@/shared/mocks/detail";
import type { BlockedDetailFields } from "@/app/(tabs)/detail/[id]/_types";

/**
 * 계약(PerformanceResponse/TheatreInfo)에 없어 아직 채울 수 없는 디테일 필드를
 * 돌려준다. 지번 주소·건물명·지도 딥링크용 공연장 id가 여기 해당한다.
 * 실제 응답 필드와 섞지 않도록 분리해 두며, 오너 결정/백엔드 반영이 나오면 제거한다.
 */
// MOCK: 블록된 디테일 필드를 목업으로 돌려준다(위 항목 결정 전까지 유지).
export function useBlockedDetailFields(): BlockedDetailFields {
  return MOCK_BLOCKED_DETAIL_FIELDS;
}
