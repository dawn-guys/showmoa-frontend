/// <reference types="navermaps" />
import type { TheatreBoundsParams } from "@/app/(tabs)/map/_types";

// 네이버 지도 JS API v3 관련 상수·헬퍼. process.env.NEXT_PUBLIC_* 는
// 빌드 시 치환되도록 반드시 직접 접근한다(동적 키 접근 금지).
export const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
export const NAVER_MAP_STYLE_ID = process.env.NEXT_PUBLIC_NAVER_MAP_STYLE_ID;

/**
 * 위치 미동의·실패 시 사용하는 기본 지도 중심(혜화역).
 *
 * 동의 모달에서 취소를 누르거나 브라우저 위치 조회가 실패하면 지도는 이 중심에
 * 머물고, 이 좌표 기준 뷰포트로 극장 목록을 조회한다. 대학로 소극장이 밀집한
 * 지역이라 첫 화면에 마커가 충분히 잡힌다(같은 줌에서 서울시청 27건 → 121건).
 */
export const DEFAULT_CENTER = { lat: 37.5823, lng: 127.0018 } as const;

/** 기본 줌 레벨. */
export const DEFAULT_ZOOM = 15;

/**
 * 지도 스크립트 URL. 커스텀 스타일(STYLE_ID)을 쓸 때만 WebGL 서브모듈(gl)을
 * 붙인다. 파라미터명은 신규 규격인 ncpKeyId를 사용한다.
 */
export function buildMapScriptUrl(clientId: string): string {
  const params = new URLSearchParams({ ncpKeyId: clientId });
  if (NAVER_MAP_STYLE_ID) params.set("submodules", "gl");
  return `https://oapi.map.naver.com/openapi/v3/maps.js?${params.toString()}`;
}

/** 커스텀 스타일이 설정된 경우에만 gl/customStyleId 옵션을 얹은 지도 옵션을 만든다. */
export function buildMapOptions(
  center: naver.maps.LatLng,
): naver.maps.MapOptions {
  const options: naver.maps.MapOptions = {
    center,
    zoom: DEFAULT_ZOOM,
    // 포트폴리오용: 네이버 저작권·로고·스케일바 컨트롤을 숨긴다.
    // (실서비스 배포 시에는 약관상 다시 노출해야 함)
    logoControl: false,
    mapDataControl: false,
    scaleControl: false,
  };
  if (NAVER_MAP_STYLE_ID) {
    // 타입 정의에 gl/customStyleId가 없어 확장 필드로 지정한다.
    Object.assign(options, { gl: true, customStyleId: NAVER_MAP_STYLE_ID });
  }
  return options;
}

/**
 * 공연장 마커 HTML. 색상은 주조색 토큰(var(--primary))을 그대로 사용한다.
 * 선택 시 핀이 커지고, 핀 위에 공연장 이름 말풍선이 뜬다. 말풍선은
 * position:absolute라 마커 앵커(핀 끝) 계산에 영향을 주지 않는다.
 */
export function buildVenueMarkerContent(
  name: string,
  selected: boolean,
): string {
  const size = selected ? 44 : 34;
  const label = selected
    ? `<div style="position:absolute;bottom:calc(100% + 4px);left:50%;transform:translateX(-50%);white-space:nowrap;background:#ffffff;color:#121212;border:1px solid var(--primary);border-radius:6px;padding:4px 10px;font-size:13px;font-weight:600;box-shadow:0 2px 6px rgba(0,0,0,0.2);">${name}</div>`
    : "";
  return `<div style="position:relative;width:${size}px;height:${size}px;">${label}<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3));"><path d="M12 2C7.582 2 4 5.582 4 10c0 5.25 6.94 11.28 7.235 11.534a1.17 1.17 0 0 0 1.53 0C13.06 21.28 20 15.25 20 10c0-4.418-3.582-8-8-8z" fill="var(--primary)"/><circle cx="12" cy="10" r="3.2" fill="#ffffff"/></svg></div>`;
}

/** 마커 앵커(핀 끝, 하단 중앙). */
export function venueMarkerAnchor(selected: boolean): { x: number; y: number } {
  const size = selected ? 44 : 34;
  return { x: size / 2, y: size };
}

/** 사용자 현재 위치 마커 HTML(주조색 점 + 반투명 링). */
export function buildUserMarkerContent(): string {
  return `<div style="position:relative;width:22px;height:22px;"><div style="position:absolute;inset:0;border-radius:9999px;background:var(--primary);opacity:0.25;"></div><div style="position:absolute;top:50%;left:50%;width:12px;height:12px;transform:translate(-50%,-50%);border-radius:9999px;background:var(--primary);border:2px solid #ffffff;box-shadow:0 1px 3px rgba(0,0,0,0.35);"></div></div>`;
}

/**
 * 지도 뷰포트를 GET /api/theatres 의 조회 파라미터로 변환한다.
 *
 * getBounds()·getCenter()는 좌표계에 따라 PointBounds·Point일 수도 있는 유니온
 * 타입이지만, LatLng로 만든 지도이므로 LatLngBounds·LatLng가 돌아온다. 위경도는
 * 반드시 lat()·lng() 접근자로 읽는다(Point의 x·y로 읽으면 순서가 뒤바뀐다).
 *
 * 중심 좌표를 함께 넘겨 결과가 지도 중심에서 가까운 순으로 오고 nearest가
 * 실제 최근접 극장에 붙게 한다.
 */
export function toBoundsParams(map: naver.maps.Map): TheatreBoundsParams {
  const bounds = map.getBounds() as naver.maps.LatLngBounds;
  const sw = bounds.getSW();
  const ne = bounds.getNE();
  const center = map.getCenter() as naver.maps.LatLng;

  return {
    swLat: sw.lat(),
    swLng: sw.lng(),
    neLat: ne.lat(),
    neLng: ne.lng(),
    lat: center.lat(),
    lng: center.lng(),
  };
}
