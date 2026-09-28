"use client";

import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import type { PerformanceResponse } from "@/app/(tabs)/_types";
import type {
  SliceResponseWishlistItemResponse,
  WishlistItemResponse,
} from "@/app/(tabs)/wishlist/_types";
import { apiFetch } from "@/shared/lib/api";
import { hasErrorType, isApiError } from "@/shared/lib/api-error";

/** 찜 요청이 실패했을 때의 토스트 문구(docs/spec/detail.md). */
export const WISHLIST_ERROR_MESSAGE =
  "네트워크 문제가 생겼습니다. 다시 시도해 주세요";

interface ToggleWishlistVariables {
  performanceId: number;
  /** 원하는 결과 상태. true면 찜 추가(POST), false면 찜 취소(DELETE). */
  wished: boolean;
}

/**
 * 호출별 콜백. react-query의 MutateOptions를 그대로 쓰면 타입 전개가 너무 커져
 * tsc가 힙을 다 쓰고 죽는다. 화면이 실제로 쓰는 두 개만 직접 선언한다.
 */
interface ToggleWishlistOptions {
  onSuccess?: () => void;
  onError?: () => void;
}

/** 되돌리기용 스냅샷. getQueriesData의 [key, data][] 모양을 그대로 담는다. */
interface WishlistSnapshot {
  detail: [QueryKey, unknown][];
  theatre: [QueryKey, unknown][];
  wishlist: [QueryKey, unknown][];
}

/**
 * 지도 바텀시트의 "극장별 공연 목록" 쿼리만 고른다.
 * 마커 쿼리(["map","theatres",bounds])와 프리픽스가 겹쳐 키 모양으로 구분한다.
 */
function isTheatrePerformancesKey(queryKey: QueryKey): boolean {
  return (
    queryKey[0] === "map" &&
    queryKey[1] === "theatres" &&
    queryKey[3] === "performances"
  );
}

/**
 * 공연 찜(좋아요) 추가·취소. 디테일·지도·찜 목록이 함께 쓴다.
 *
 *  - 추가: POST /api/performances/{performanceId}/wishlist (201, 본문에 찜 항목)
 *  - 취소: DELETE /api/performances/{performanceId}/wishlist (204)
 *
 * 낙관적 업데이트를 쓴다. 누르는 즉시 isWished를 뒤집어 하트가 바로 채워지고,
 * 요청이 실패하면 되돌린다. 계약이 "되돌리지 않아도 되는 실패"를 명시해 둬서
 * 그 두 가지는 성공으로 처리한다.
 *
 *  - POST 409(wishlist-already-exists): 이미 찜한 상태 = 원하는 결과 달성
 *  - DELETE 404 wishlist-not-found: 이미 찜이 없음 = 원하는 결과 달성
 *  - DELETE 404 performance-not-found: 공연 자체가 없음 → 되돌린다
 *
 * 화면별로 쓰는 범위가 다르다. 디테일·지도는 add/remove를 모두 쓰고,
 * 찜 목록·캘린더는 remove만 쓴다(목록에서 추가하는 동선이 없다).
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ performanceId, wished }: ToggleWishlistVariables) => {
      const path = `/api/performances/${performanceId}/wishlist`;

      if (!wished) {
        try {
          await apiFetch<void>(path, { method: "DELETE" });
        } catch (error) {
          // 이미 찜이 없는 경우는 원하는 결과와 같으므로 실패로 보지 않는다.
          // 같은 404라도 performance-not-found면 그대로 던져 되돌리게 한다.
          if (hasErrorType(error, "wishlist-not-found")) return;
          throw error;
        }
        return;
      }

      try {
        // 201 본문은 WishlistItemResponse지만 목록 삽입에는 쓰지 않는다(아래 주석).
        await apiFetch<WishlistItemResponse>(path, { method: "POST" });
      } catch (error) {
        // 409(이미 찜한 공연)도 원하는 결과와 같다.
        if (isApiError(error) && error.status === 409) return;
        throw error;
      }
    },

    onMutate: async ({ performanceId, wished }) => {
      const detailKey = ["detail", String(performanceId)];

      // 진행 중인 재조회가 돌아와 낙관적 값을 덮어쓰지 않도록 먼저 멈춘다.
      await queryClient.cancelQueries({ queryKey: detailKey });
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      await queryClient.cancelQueries({
        predicate: ({ queryKey }) => isTheatrePerformancesKey(queryKey),
      });

      const snapshot: WishlistSnapshot = {
        detail: queryClient.getQueriesData({ queryKey: detailKey }),
        wishlist: queryClient.getQueriesData({ queryKey: ["wishlist"] }),
        theatre: queryClient.getQueriesData({
          predicate: ({ queryKey }) => isTheatrePerformancesKey(queryKey),
        }),
      };

      // 상세: isWished 하나만 뒤집는다.
      queryClient.setQueriesData<PerformanceResponse>(
        { queryKey: detailKey },
        (old) => (old ? { ...old, isWished: wished } : old),
      );

      // 지도 극장별 공연 목록: 해당 공연 항목의 isWished만 뒤집는다.
      queryClient.setQueriesData<PerformanceResponse[]>(
        { predicate: ({ queryKey }) => isTheatrePerformancesKey(queryKey) },
        (old) =>
          old?.map((item) =>
            item.id === performanceId ? { ...item, isWished: wished } : item,
          ),
      );

      // 찜 목록: 취소일 때만 즉시 빼준다. 추가는 서버 정렬(미종료 먼저 · 종료
      // 나중 · 그룹 내 최근 찜순)과 Slice 페이지 경계를 클라에서 재현해야 해서
      // 끼워 넣지 않고 onSettled의 무효화에 맡긴다. 추가하는 화면(디테일·지도)
      // 에서는 이 목록이 보이지 않아 체감 차이도 없다.
      if (!wished) {
        queryClient.setQueriesData<
          InfiniteData<SliceResponseWishlistItemResponse>
        >({ queryKey: ["wishlist"] }, (old) =>
          old
            ? {
                ...old,
                pages: old.pages.map((page) => ({
                  ...page,
                  content: (page.content ?? []).filter(
                    (item) => item.performanceId !== performanceId,
                  ),
                })),
              }
            : old,
        );
      }

      return snapshot;
    },

    onError: (_error, _variables, snapshot) => {
      // 낙관적으로 바꾼 값을 전부 원래대로 돌린다.
      if (!snapshot) return;
      for (const group of [
        snapshot.detail,
        snapshot.theatre,
        snapshot.wishlist,
      ]) {
        for (const [key, data] of group) queryClient.setQueryData(key, data);
      }
    },

    onSettled: (_data, _error, { performanceId }) => {
      // 성공·실패와 무관하게 서버 기준으로 다시 맞춘다.
      void queryClient.invalidateQueries({
        queryKey: ["detail", String(performanceId)],
      });
      void queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      // 캘린더(GET /api/wishlists/calendar). Todo H에서 실제 요청으로 바뀐다.
      void queryClient.invalidateQueries({ queryKey: ["calendar"] });
      void queryClient.invalidateQueries({
        predicate: ({ queryKey }) => isTheatrePerformancesKey(queryKey),
      });
    },
  });

  const { mutate } = mutation;

  return {
    /** 찜 추가. 이미 찜한 공연(409)이면 성공으로 처리한다. */
    add: (performanceId: number, options?: ToggleWishlistOptions) =>
      mutate({ performanceId, wished: true }, options),
    /** 찜 취소. 종료된 공연도 취소할 수 있다. */
    remove: (performanceId: number, options?: ToggleWishlistOptions) =>
      mutate({ performanceId, wished: false }, options),
    isPending: mutation.isPending,
    isError: mutation.isError,
    reset: mutation.reset,
  };
}
