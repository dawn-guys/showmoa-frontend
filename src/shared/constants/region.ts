/**
 * 지역 필터 값 표기.
 *
 * 지역 목록은 GET /api/performances/areas 가 내려주는 값을 그대로 쓴다(가공 금지).
 * 드로워가 고른 시/도·구/시를 한 줄 문자열로 만들어 URL·칩에 싣고, 검색 요청에서
 * 다시 areas/districts 파라미터로 되돌린다. 응답의 sido·districts 값에는 공백이
 * 없어(실제 응답으로 확인) 공백 하나로 잇고 다시 나눌 수 있다.
 */

/** 드로워에서 고른 지역. 구/시는 아직 고르지 않았을 수 있다(탐색 중간 상태). */
export interface RegionFilter {
  sido: string;
  district?: string;
}

/** 지역 필터를 URL·칩에 쓸 한 줄 문자열로 잇는다(예: "서울 종로구"). */
export function formatRegionFilter({ sido, district }: RegionFilter): string {
  return district ? `${sido} ${district}` : sido;
}

/** 한 줄 문자열을 다시 시/도·구/시로 나눈다. 값이 비어 있으면 null(필터 없음). */
export function parseRegionFilter(value: string): RegionFilter | null {
  const [sido, district] = value.trim().split(" ");
  if (!sido) return null;

  return district ? { sido, district } : { sido };
}
