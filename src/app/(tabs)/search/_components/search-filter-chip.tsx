import { Fragment } from "react";
import { cn } from "cn";

interface SearchFilterChipProps {
  /** 칩 안에 점(·) 구분자로 이어 보여줄 필터 라벨들(장르 한 줄·지역 한 줄). */
  labels: string[];
  className?: string;
}

/**
 * 적용된 검색 필터를 나타내는 칩. 필터 종류(장르·지역) 사이를 점(·)으로 이어
 * 하나의 칩으로 표시한다. 폭이 모자라면 줄바꿈된다.
 * 라벨이 없으면 아무것도 렌더하지 않는다.
 */
export function SearchFilterChip({ labels, className }: SearchFilterChipProps) {
  if (labels.length === 0) return null;

  return (
    <span
      className={cn(
        // flex가 아닌 일반 텍스트 흐름으로 둬야 라벨이 통째로 다음 줄로 밀리지 않고
        // 첫 줄을 채운 뒤 공백에서 줄바꿈된다. 단어(예: 서울특별시)는 끊지 않는다.
        "inline-block max-w-full rounded-[5px] border border-[#48484A] px-4 py-2 text-[12px] break-keep text-foreground",
        className,
      )}
    >
      {labels.map((label, index) => (
        <Fragment key={label}>
          {/* 두 번째 라벨부터 앞에 점(·) 구분자를 붙이고, 점 뒤에서도 줄바꿈될 수 있게 한다. */}
          {index > 0 && (
            <>
              <span
                className="mx-2 inline-block size-0.5 rounded-full bg-[#D9D9D9] align-middle"
                aria-hidden
              />
              {/* 점은 보조기기에 읽히지 않으므로 라벨이 붙어 읽히지 않게 쉼표로 구분한다. */}
              <span className="sr-only">, </span>
              <wbr />
            </>
          )}
          {label}
        </Fragment>
      ))}
    </span>
  );
}
