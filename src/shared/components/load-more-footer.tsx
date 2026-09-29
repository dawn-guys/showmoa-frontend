"use client";

import { useCallback } from "react";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

/**
 * 바닥에 닿기 전에 미리 불러오는 거리. 스크롤이 목록 끝에서 멈춰 기다리지 않도록
 * 화면 한 장 정도 앞에서 다음 페이지를 요청한다.
 */
const PREFETCH_ROOT_MARGIN = "400px";

interface LoadMoreFooterProps {
  /** 로딩 영역이 화면에 가까워지면 호출된다. */
  onIntersect: () => void;
  /** 다음 페이지 조회 중 여부. 조회 중에는 스피너를 보여주고 감지를 멈춘다. */
  isFetching: boolean;
  /** 스크린리더용 라벨. 목록마다 무엇을 더 불러오는지 다르게 읽어준다. */
  label: string;
}

/**
 * 무한 스크롤 목록 끝의 로딩 영역. 감지 요소와 스피너 자리를 하나로 합쳤다.
 * 스피너는 항상 자리를 차지한 채 조회 중이 아닐 때만 숨겨(invisible) 행 높이가
 * 스피너 높이로 늘 같게 유지된다. 그래서 스피너가 나타나고 사라져도 목록 높이가
 * 변하지 않아 스크롤이 튀지 않는다.
 *
 * 조회 중에는 옵저버를 끊어 같은 페이지를 두 번 요청하지 않는다. 요소 자체는
 * 계속 붙어 있어 언마운트로 인한 높이 변화가 없고, 조회가 끝나면 옵저버가 다시
 * 붙어 아직 화면에 걸쳐 있으면 이어서 다음 페이지를 불러온다.
 *
 * <li>라서 <ul> 안에서, 목록 항목들 뒤에 둔다.
 */
export function LoadMoreFooter({
  onIntersect,
  isFetching,
  label,
}: LoadMoreFooterProps) {
  const attach = useCallback(
    (node: HTMLLIElement | null) => {
      if (!node || isFetching) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) onIntersect();
        },
        { rootMargin: PREFETCH_ROOT_MARGIN },
      );
      observer.observe(node);

      return () => observer.disconnect();
    },
    [onIntersect, isFetching],
  );

  return (
    <li
      ref={attach}
      // 조회 중이 아닐 때는 숨은 자리라 보조기기 목록에서 감춘다.
      aria-hidden={isFetching ? undefined : true}
      className="flex shrink-0 items-center justify-center"
    >
      <LoadingSpinner
        label={label}
        className={isFetching ? undefined : "invisible"}
      />
    </li>
  );
}
