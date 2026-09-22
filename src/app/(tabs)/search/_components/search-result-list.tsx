import type { PerformanceSummary } from "@/app/(tabs)/_types";
import { SearchResultItem } from "./search-result-item";

interface SearchResultListProps {
  /** 검색어와 제목이 겹치는 공연 목록. */
  results: PerformanceSummary[];
}

/**
 * 검색 결과 목록. 인풋 값이 바뀔 때마다(디바운스 후) 갱신된 결과를 받아
 * 세로 리스트로 보여준다. 결과가 없으면 아무것도 렌더하지 않는다.
 */
export function SearchResultList({ results }: SearchResultListProps) {
  if (results.length === 0) return null;

  return (
    <ul className="mt-5 flex flex-col gap-6">
      {results.map((performance) => (
        <SearchResultItem key={performance.id} performance={performance} />
      ))}
    </ul>
  );
}
