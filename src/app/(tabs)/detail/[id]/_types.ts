// MOCK: 계약(PerformanceResponse/TheatreInfo)에 없어 아직 채울 수 없는 디테일 필드.
// 지번 주소·건물명은 백엔드 계약에 없다. 오너 결정 또는 백엔드 반영 전까지
// 목업으로 채우며, 그 외 필드는 모두 실제 응답(PerformanceResponse)에서 렌더링한다.
export interface BlockedDetailFields {
  /** 지번 주소 */
  jibunAddress: string;
  /** 건물명 */
  buildingName: string;
}
