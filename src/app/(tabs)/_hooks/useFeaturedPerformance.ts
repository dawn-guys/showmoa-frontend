import { useQuery } from "@tanstack/react-query";
import type {
  PagePerformanceListResponse,
  PerformanceListResponse,
} from "@/app/(tabs)/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 무작위로 뽑을 후보를 받아올 개수.
 * 노출은 1개지만 후보가 몇 개뿐이면 새로고침해도 같은 공연만 반복해서
 * 걸려 무작위로 느껴지지 않는다. 20이면 응답이 4KB대로 가볍고 후보도
 * 충분하다. 서버가 size를 100으로 상한 처리하므로 그 아래 값이다.
 */
const CANDIDATE_SIZE = 20;

/**
 * 후보 중 종료되지 않은 공연 하나를 무작위로 고른다. 후보가 없으면 null.
 *
 * 모듈 스코프 함수라 참조가 고정되고, React Query가 (데이터, select) 쌍으로
 * 결과를 메모이즈하므로 매 렌더마다 다시 뽑히지 않는다. 재조회로 받은 응답이
 * 이전과 같으면 structural sharing이 참조를 유지해 선택도 그대로 남는다.
 */
function pickFeatured(
  page: PagePerformanceListResponse,
): PerformanceListResponse | null {
  const candidates = page.content.filter(
    (performance) => performance.state !== "ENDED",
  );
  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * 주목받는 공연 1개를 조회한다(GET /api/performances).
 * 전용 엔드포인트가 없어 필터 없이 받은 목록에서 종료된 공연을 뺀 뒤
 * 클라이언트에서 무작위로 고른다.
 */
export function useFeaturedPerformance() {
  return useQuery({
    queryKey: ["home", "featured"],
    queryFn: ({ signal }) =>
      apiFetch<PagePerformanceListResponse>("/api/performances", {
        searchParams: { page: 0, size: CANDIDATE_SIZE },
        signal,
      }),
    select: pickFeatured,
  });
}
