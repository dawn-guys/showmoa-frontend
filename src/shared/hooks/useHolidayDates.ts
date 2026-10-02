import { useQueries, type UseQueryResult } from "@tanstack/react-query";
import { apiFetch } from "@/shared/lib/api";
import { isApiError } from "@/shared/lib/api-error";
import type { HolidayResponse } from "@/shared/types/holiday";

/** 공휴일 API가 받는 연도 범위. 밖의 연도는 요청하지 않는다(서버가 400). */
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

/** 임시공휴일이 생길 수 있어 하루보다 길게 캐시하지 않는다. */
const HOLIDAY_STALE_TIME_MS = 24 * 60 * 60 * 1000;

/**
 * GET /api/holidays 로 한 해 공휴일을 조회한다. 한 해 전체가 한 번에 오므로
 * 연도 단위로 부른다.
 *
 * 공휴일 정보 API 장애(503)는 에러로 올리지 않고 공휴일 없음으로 진행한다.
 * 공휴일 표시만 빠지고 요일 기준 표시는 그대로 동작해야 하기 때문이다.
 */
async function fetchHolidays(
  year: number,
  signal: AbortSignal,
): Promise<HolidayResponse[]> {
  try {
    return await apiFetch<HolidayResponse[]>("/api/holidays", {
      searchParams: { year },
      signal,
    });
  } catch (error) {
    if (isApiError(error) && error.status === 503) return [];
    throw error;
  }
}

/**
 * 연도별 결과를 날짜 Set 하나로 합친다. 실패한 연도는 비어 있는 것으로 본다.
 * 모듈 스코프 함수라 참조가 고정되어 결과가 같으면 다시 계산되지 않는다.
 */
function combineHolidays(results: UseQueryResult<HolidayResponse[]>[]) {
  return {
    holidayDates: new Set(
      results.flatMap((result) => result.data ?? []).map((h) => h.date),
    ),
    isLoading: results.some((result) => result.isLoading),
  };
}

/**
 * 주어진 연도들의 공휴일 날짜(yyyy-MM-dd) Set을 돌려준다. 찜 캘린더와 홈
 * "오늘 나의 공연"이 함께 쓴다. 로그인 없이 조회할 수 있다.
 *
 * 화면에 보이는 날짜의 연도를 모두 넘긴다(12월 화면에 다음 해 1월이 보이면 두 해).
 * 키가 연도라 같은 해는 한 번만 요청한다. 실패해도 재시도하지 않고 빈 Set으로
 * 진행해 캘린더를 막지 않는다.
 */
export function useHolidayDates(years: number[]) {
  const uniqueYears = [...new Set(years)].filter(
    (year) => year >= MIN_YEAR && year <= MAX_YEAR,
  );

  return useQueries({
    queries: uniqueYears.map((year) => ({
      queryKey: ["holidays", year],
      queryFn: ({ signal }) => fetchHolidays(year, signal),
      staleTime: HOLIDAY_STALE_TIME_MS,
      refetchOnWindowFocus: false,
      retry: false,
    })),
    combine: combineHolidays,
  });
}
