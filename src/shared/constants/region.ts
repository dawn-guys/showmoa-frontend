// Provisional: docs/spec/search.md "지역 드로워 값" 을 그대로 옮긴 참조 데이터다.
import regionData from "./regions.json";

/** 지역 트리 노드. 잎(동/읍/면 등)은 children 이 없다. */
export interface RegionNode {
  name: string;
  /** 행정 구역 종류(metro·province·gu·si·dong·eup·myeon 등) */
  type: string;
  children?: RegionNode[];
}

/** 시/도(최상위) 목록. 여기서부터 깊이 우선으로 잎까지 순회한다. */
export const REGIONS = (regionData as { regions: RegionNode[] }).regions;

/** children 이 없으면 더 내려갈 수 없는 잎(최종 선택 지점)이다. */
export function isLeafRegion(node: RegionNode): boolean {
  return !node.children || node.children.length === 0;
}

/** 선택 경로를 화면·칩에 쓸 한 줄 문자열로 잇는다(예: "서울특별시 강남구 역삼동"). */
export function formatRegionPath(path: RegionNode[]): string {
  return path.map((node) => node.name).join(" ");
}
