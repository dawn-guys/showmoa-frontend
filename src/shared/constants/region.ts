/**
 * 지역 필터 값 표기.
 *
 * 지역 목록은 GET /api/performances/areas 가 내려주는 값을 그대로 쓴다. 드로워가
 * 고른 시/도·구/시를 한 줄 문자열로 만들어 URL·칩에 싣고, 검색 요청에서 다시
 * areas/districts 파라미터로 되돌린다. 응답의 sido·districts 값에는 공백이 없어
 * (실제 응답으로 확인) 공백 하나로 잇고 다시 나눌 수 있다.
 *
 * 저장·전송에는 늘 API 값을 쓰고, 화면에 보여줄 때만 스펙 표기로 바꾼다.
 */

/** 드로워에서 고른 지역. 구/시는 아직 고르지 않았을 수 있다(탐색 중간 상태). */
export interface RegionFilter {
  sido: string;
  district?: string;
}

/**
 * API sido 값 → docs/spec/search.md 지역 드로워 값의 표기.
 *
 * API는 `서울`·`경기`처럼 짧게 내려주는데 화면에는 스펙 표기로 보여준다.
 * 키(API 값)가 전송값이고 값(스펙 표기)은 표시 전용이다. `해외`는 스펙에
 * 대응하는 이름이 없어 넣지 않고, 아래 sidoLabel이 API 값을 그대로 쓴다.
 */
const SIDO_LABELS: Record<string, string> = {
  서울: "서울특별시",
  부산: "부산광역시",
  대구: "대구광역시",
  인천: "인천광역시",
  대전: "대전광역시",
  울산: "울산광역시",
  세종: "세종특별자치시",
  경기: "경기도",
  강원: "강원특별자치도",
  충북: "충청북도",
  충남: "충청남도",
  경북: "경상북도",
  경남: "경상남도",
  전북: "전북특별자치도",
  제주: "제주특별자치도",
  전남광주: "전남광주통합특별시",
};

/**
 * 시/도를 화면에 보여줄 표기로 바꾼다. 매핑에 없는 값(스펙에 없는 `해외`,
 * 백엔드가 나중에 추가하는 지역)은 API 값을 그대로 보여준다.
 */
export function sidoLabel(sido: string): string {
  return SIDO_LABELS[sido] ?? sido;
}

/**
 * 지역 필터를 URL·검색 요청에 쓸 한 줄 문자열로 잇는다(예: "서울 종로구").
 * 표시용이 아니라 전송용이므로 API 값을 그대로 쓴다.
 */
export function formatRegionFilter({ sido, district }: RegionFilter): string {
  return district ? `${sido} ${district}` : sido;
}

/** 한 줄 문자열을 다시 시/도·구/시로 나눈다. 값이 비어 있으면 null(필터 없음). */
export function parseRegionFilter(value: string): RegionFilter | null {
  const [sido, district] = value.trim().split(" ");
  if (!sido) return null;

  return district ? { sido, district } : { sido };
}

/**
 * 저장된 지역 필터 값을 화면(칩·드로워)에 보여줄 문구로 바꾼다.
 * 시/도만 스펙 표기로 바꾸고, 구/시는 API 값과 스펙 표기가 같아 그대로 쓴다.
 */
export function formatRegionLabel(value: string): string {
  const filter = parseRegionFilter(value);
  if (!filter) return "";

  return [sidoLabel(filter.sido), filter.district].filter(Boolean).join(" ");
}
