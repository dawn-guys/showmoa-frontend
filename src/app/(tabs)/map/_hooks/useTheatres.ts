import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  TheatreBoundsParams,
  TheatreMapResponse,
} from "@/app/(tabs)/map/_types";
import { apiFetch } from "@/shared/lib/api";

/**
 * 현재 지도 범위에 있는 극장 목록을 조회한다(인증 불필요).
 *
 * bounds 네 값은 백엔드에서 필수라 없으면 400이 된다. 그래서 지도가 범위를
 * 알려주기 전에는 호출하지 않고(enabled), 지도 생성 직후 첫 범위가 들어오면
 * 바로 한 번 호출한다. 이후 재호출은 지도 idle 이후에만 일어난다.
 *
 * 범위가 바뀌면 queryKey가 바뀌므로 그대로 두면 마커가 사라졌다 다시 그려진다.
 * 이전 데이터를 유지해 지도를 움직이는 동안 마커가 깜빡이지 않게 하고,
 * 스켈레톤은 이전 데이터가 없는 최초 로드에서만 나오게 한다.
 *
 * @param bounds 지도 뷰포트 범위. 아직 모르면 null.
 */
export function useTheatres(bounds: TheatreBoundsParams | null) {
  return useQuery({
    queryKey: ["map", "theatres", bounds],
    queryFn: ({ signal }) =>
      apiFetch<TheatreMapResponse[]>("/api/theatres", {
        // enabled로 걸러지므로 이 시점의 bounds는 항상 있다.
        searchParams: bounds!,
        signal,
      }),
    enabled: bounds !== null,
    placeholderData: keepPreviousData,
  });
}
