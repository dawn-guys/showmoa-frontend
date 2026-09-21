// Provisional: based on screen spec, not the API contract.

/** 알림함에 노출되는 알림 한 건. */
export interface AppNotification {
  id: string;
  /** 클릭 시 이동할 공연 상세 id (url: /detail/:id) */
  performanceId: string;
  /** 안 읽은 알림에서 주조색으로 강조되는 공연명 부분 */
  highlight: string;
  /** highlight 뒤에 이어지는 문구 */
  body: string;
  /** 읽음 여부. 읽어도 비활성화되지 않고 색상만 달라진다. */
  read: boolean;
  /** 알림 수신 시각 (ISO 8601). 요일별 그룹핑 기준이 된다. */
  createdAt: string;
}
