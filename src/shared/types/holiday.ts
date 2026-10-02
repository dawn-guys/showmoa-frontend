// Contract: HolidayResponse (v3/api-docs)

/** GET /api/holidays?year=yyyy 응답 배열의 원소. 대체·임시공휴일 포함, 날짜순. */
export interface HolidayResponse {
  /** 공휴일 yyyy-MM-dd */
  date: string;
  /** 공휴일 이름(예: "개천절", "대체공휴일(개천절)") */
  name: string;
}
