// Provisional: based on screen spec, not the API contract.
import type { MapVenue } from "@/app/(tabs)/map/_types";
import { MOCK_CATEGORY_PERFORMANCES } from "@/shared/mocks/home";

// MOCK: 공연장 좌표와 소속 공연. 기본 좌표(서울시청) 인근에 모아 두어
// 진입 시 마커가 한 화면에 보이도록 했다. Phase 2에서 실제 공연장 좌표로 교체한다.
export const MOCK_MAP_VENUES: MapVenue[] = [
  {
    id: "venue-sejong",
    name: "세종문화회관",
    lat: 37.5726,
    lng: 126.9762,
    // 레드벨벳(종료)·콜드플레이(예정)·시카고(진행) → Figma "공연 3개" 케이스
    performances: [
      MOCK_CATEGORY_PERFORMANCES[2], // category-ended (레드벨벳)
      MOCK_CATEGORY_PERFORMANCES[3], // category-4 (콜드플레이)
      MOCK_CATEGORY_PERFORMANCES[5], // category-6 (시카고)
    ],
  },
  {
    id: "venue-jeongdong",
    name: "정동극장",
    lat: 37.5662,
    lng: 126.972,
    performances: [
      MOCK_CATEGORY_PERFORMANCES[0], // category-openrun (오픈런)
      MOCK_CATEGORY_PERFORMANCES[6], // category-7 (연극)
    ],
  },
  {
    id: "venue-myeongdong",
    name: "명동예술극장",
    lat: 37.5636,
    lng: 126.985,
    performances: [
      MOCK_CATEGORY_PERFORMANCES[1], // category-long (긴 제목)
      MOCK_CATEGORY_PERFORMANCES[7], // category-8 (크리스마스 뮤지컬)
    ],
  },
  {
    id: "venue-chungmu",
    name: "충무아트센터",
    lat: 37.5652,
    lng: 126.98,
    performances: [
      MOCK_CATEGORY_PERFORMANCES[4], // category-5 (클래식, 종료)
      MOCK_CATEGORY_PERFORMANCES[8], // category-9 (국악, 오픈런)
    ],
  },
];
