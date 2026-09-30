/**
 * 지역 필터 값 표기.
 *
 * 지역 목록은 GET /api/performances/areas 가 내려주는 값을 그대로 쓴다. 드로워가
 * 고른 시/도 하나와 구/군 여러 개를 URL의 areas/districts 배열에 싣고, 검색
 * 요청에도 같은 이름의 파라미터로 그대로 보낸다.
 *
 * 저장·전송에는 늘 API 값을 쓰고, 화면에 보여줄 때만 스펙 표기로 바꾼다.
 */

/** 구/군은 한 시/도 안에서 이 개수까지 고를 수 있다. */
export const MAX_DISTRICTS = 3;

/** 드로워에서 고른 지역. 구/군은 아직 고르지 않았을 수 있다(탐색 중간 상태). */
export interface RegionFilter {
  sido: string;
  districts: string[];
}

/**
 * API sido 값 → docs/spec/search.md 지역 드로워 값의 표기.
 *
 * API는 `서울`·`경기`처럼 짧게 내려주는데 화면에는 스펙 표기로 보여준다.
 * 키(API 값)가 전송값이고 값(스펙 표기)은 표시 전용이다. `해외`는 스펙에
 * 대응하는 이름이 없어 아예 목록에서 뺀다(아래 isSelectableSido 참고).
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
 * 시/도를 화면에 보여줄 표기로 바꾼다. 매핑에 없는 값(백엔드가 나중에
 * 추가하는 지역)은 API 값을 그대로 보여준다.
 */
export function sidoLabel(sido: string): string {
  return SIDO_LABELS[sido] ?? sido;
}

/** 지역 필터 드로워에서 제외할 시/도. 스펙에 대응 표기가 없는 값이다. */
const EXCLUDED_SIDOS = new Set(["해외"]);

/** 드로워에 노출할 시/도인지. 스펙에 없는 지역(해외 등)은 목록에서 뺀다. */
export function isSelectableSido(sido: string): boolean {
  return !EXCLUDED_SIDOS.has(sido);
}
