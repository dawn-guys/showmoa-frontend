// Contract: TheatreMapResponse (v3/api-docs)

/**
 * 지도 마커 하나에 대응하는 극장. GET /api/theatres 응답 배열의 원소다.
 *
 * 실제 응답(전국 범위 716건) 확인 결과 모든 필드가 항상 채워져 있어
 * nullable·optional로 두지 않는다. 마커 좌표(latitude·longitude)도 빠진
 * 항목이 없었다.
 */
export interface TheatreMapResponse {
  id: number;
  /** 극장 이름 */
  name: string;
  /** 위도 */
  latitude: number;
  /** 경도 */
  longitude: number;
  /**
   * 오늘 기준으로 공연 기간에 걸쳐 있는 공연 수.
   * GET /api/theatres/{id}/performances 가 돌려주는 전체 목록의 길이와는
   * 다르다(예: 세종문화회관 performanceCount 2, 목록 38건). 바텀 시트의
   * "공연 N개"는 목록과 어긋나지 않게 목록 길이로 표시한다.
   */
  performanceCount: number;
  /** lat·lng를 함께 보냈을 때 그 지점에서 가장 가까운 극장 하나만 true다. */
  nearest: boolean;
}

/**
 * GET /api/theatres 쿼리 파라미터.
 *
 * bounds 네 값은 컨트랙트에 optional로 적혀 있지만 실제로는 필수다. 하나라도
 * 빠지면 400 "잘못된 지도 범위입니다"(Invalid Bounds)가 돌아오므로 타입에서
 * 필수로 둔다.
 *
 * lat·lng는 컨트랙트상 선택 값이지만 항상 지도 중심을 보낸다. 결과 집합을
 * 바꾸지는 않고(같은 범위에서 건수 동일) 거리순 정렬과 nearest 플래그만
 * 정하는데, 빼고 보내면 nearest가 사실상 가장 낮은 id에 붙어 무의미해진다.
 *
 * interface가 아니라 type으로 둔다. apiFetch의 QueryParams는 인덱스 시그니처를
 * 요구하고, 그 암시적 인덱스 시그니처는 type 별칭에만 붙는다.
 */
export type TheatreBoundsParams = {
  /** 남서쪽 위도 */
  swLat: number;
  /** 남서쪽 경도 */
  swLng: number;
  /** 북동쪽 위도 */
  neLat: number;
  /** 북동쪽 경도 */
  neLng: number;
  /** 지도 중심 위도(거리순 정렬·nearest 기준) */
  lat: number;
  /** 지도 중심 경도(거리순 정렬·nearest 기준) */
  lng: number;
};

// Contract: TheatreSearchResponse (v3/api-docs)

/**
 * 검색어가 극장 이름·공연 이름에 맞은 경우. theatres는 요청의 lat·lng에서
 * 가까운 순으로 정렬되며(nearest가 첫 항목에 붙는다), 맞는 극장이 없으면
 * 빈 배열이다. 이 형태에서는 lat·lng가 내려오지 않는다.
 */
interface TheatreSearchTheatresResponse {
  type: "THEATRES";
  theatres: TheatreMapResponse[];
  lat: null;
  lng: null;
}

/**
 * 검색어가 광역 지역명(예: "서울특별시", "부산광역시")에 맞은 경우.
 * 극장 목록 대신 그 지역의 좌표만 내려오므로 지도를 그 좌표로 옮기고,
 * 극장은 평소처럼 뷰포트 조회로 채운다.
 */
interface TheatreSearchLocationResponse {
  type: "LOCATION";
  theatres: null;
  lat: number;
  lng: number;
}

/**
 * GET /api/theatres/search 응답. type으로 갈리는 판별 유니온이라
 * 캐스트 없이 좁혀진다. 관측된 type은 THEATRES·LOCATION 두 가지다.
 */
export type TheatreSearchResponse =
  TheatreSearchTheatresResponse | TheatreSearchLocationResponse;

/**
 * GET /api/theatres/search 쿼리 파라미터. 세 값 모두 필수이며 하나라도
 * 빠지면 500이 돌아온다(빈 keyword는 400 "검색어를 입력해주세요").
 * lat·lng는 지도의 현재 중심을 보내 가까운 결과가 먼저 오게 한다.
 */
export type TheatreSearchParams = {
  keyword: string;
  lat: number;
  lng: number;
};
