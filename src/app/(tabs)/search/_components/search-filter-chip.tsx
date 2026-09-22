import { cn } from "cn";

interface SearchFilterChipProps {
  /** 칩 안에 점(·) 구분자로 이어 보여줄 필터 라벨들(장르·지역 등). */
  labels: string[];
  className?: string;
}

/**
 * 적용된 검색 필터를 나타내는 칩. 여러 필터(장르·지역)를 점(·)으로 이어
 * 하나의 칩으로 표시한다. 라벨이 없으면 아무것도 렌더하지 않는다.
 */
export function SearchFilterChip({ labels, className }: SearchFilterChipProps) {
  if (labels.length === 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#48484A] px-4 py-2 text-body3 text-foreground",
        className,
      )}
    >
      {labels.map((label, index) => (
        <span key={label} className="inline-flex items-center gap-2">
          {/* 두 번째 라벨부터 앞에 점(·) 구분자를 붙인다. */}
          {index > 0 && (
            <span className="size-0.5 rounded-full bg-[#D9D9D9]" aria-hidden />
          )}
          {label}
        </span>
      ))}
    </span>
  );
}
