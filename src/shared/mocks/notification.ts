// Provisional: based on screen spec, not the API contract.
import type { AppNotification } from "@/app/notification/_types";

// MOCK: 실제 알림 API 연동 시 읽지 않은 알림 개수로 교체한다.
// 0으로 바꾸면 헤더 종 아이콘의 주조색 점이 사라진다.
export const MOCK_UNREAD_NOTIFICATION_COUNT = 3;

// MOCK: 오늘/1일 전/2일 전 그룹이 항상 나오도록 수신 시각을 현재 기준 상대값으로 만든다.
// 실제 API 연동 시 서버가 내려주는 createdAt(ISO 8601)으로 교체한다.
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const agoISO = (ms: number) => new Date(Date.now() - ms).toISOString();

// MOCK: 알림 목록. 안 읽음/읽음, 짧은 문구/말줄임되는 긴 문구 엣지 케이스를 섞었다.
export const MOCK_NOTIFICATIONS: AppNotification[] = [
  // 오늘
  {
    id: "noti-1",
    performanceId: "popular-1",
    highlight: "K-POP 세상을 열다",
    body: "예매 오픈이 하루 남았습니다.",
    read: false,
    createdAt: agoISO(2 * HOUR),
  },
  {
    id: "noti-2",
    performanceId: "category-openrun",
    highlight: "대전 스카이 로드 길거리 플래시 몹 매직",
    body: "공연이 얼마 남지 않았습니다",
    read: true,
    createdAt: agoISO(6 * HOUR),
  },
  // 1일 전
  {
    id: "noti-3",
    performanceId: "popular-1",
    highlight: "K-POP 세상을 열다",
    body: "공연이 얼마 남지 않았습니다",
    read: true,
    createdAt: agoISO(DAY + 3 * HOUR),
  },
  {
    id: "noti-4",
    performanceId: "category-openrun",
    highlight: "대전 스카이 로드 길거리 플래시 몹 매직",
    body: "공연이 얼마 남지 않았습니다",
    read: true,
    createdAt: agoISO(DAY + 8 * HOUR),
  },
  // 2일 전
  {
    id: "noti-5",
    performanceId: "category-long",
    highlight: "지킬 앤 하이드 라이브 오케스트라",
    body: "예매 오픈이 하루 남았습니다.",
    read: false,
    createdAt: agoISO(2 * DAY + 4 * HOUR),
  },
];
