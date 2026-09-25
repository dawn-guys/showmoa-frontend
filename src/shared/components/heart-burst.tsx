"use client";

import { HeartBoldIcon } from "@solar-icons/react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";

// 하트 그라데이션 값(Figma node 488:9744). 대응 디자인 토큰이 없어 하드코딩한다.
const HEART_GRADIENT_TOP = "#FF66CF"; // 상단 핑크
const HEART_GRADIENT_BOTTOM = "#FF5126"; // 하단 오렌지레드
const GRADIENT_ID = "showmoa-heart-burst-gradient";

// Figma 프로토타입(node 488:9620 "애니메이션 버튼-중요"): 클릭 후 SMART_ANIMATE
// 0.3s(EASE_OUT)를 거쳐 하트가 등장한다. 즉 클릭 300ms 뒤에 재생을 시작한다.
const BURST_DELAY = 0.3;

/**
 * 좋아요 "추가" 동작에서 재생할 하트 버스트의 트리거 키를 관리한다.
 * burst()를 호출할 때마다 triggerKey가 올라가고, 이를 <HeartBurst />에 넘기면
 * 새 애니메이션이 1회 재생된다.
 */
export function useHeartBurst() {
  const [triggerKey, setTriggerKey] = useState(0);
  const burst = useCallback(() => setTriggerKey((key) => key + 1), []);
  return { triggerKey, burst };
}

interface HeartBurstProps {
  /** useHeartBurst의 triggerKey. 값이 바뀔 때마다 애니메이션을 1회 재생한다. */
  triggerKey: number;
  /** 하트 아이콘 크기(px). 기본 60(Figma 하트 프레임 기준) */
  size?: number;
}

/**
 * 좋아요를 "추가"할 때 Figma 기준 위치(가로 중앙, 세로 34.1%)에서 떠올랐다 사라지는 그라데이션 하트.
 * triggerKey가 증가하면 300ms 뒤 1회 재생하고 애니메이션이 끝나면 스스로 언마운트한다.
 * 바텀시트 등 transform 조상 안에서도 위치가 깨지지 않도록 body로 포탈한다.
 * 장식 요소라 AT에는 숨긴다(좋아요 상태는 버튼의 aria-pressed로 전달된다).
 * reduced-motion은 전역 MotionConfig가 처리해 scale은 빠지고 페이드만 남는다.
 */
export function HeartBurst({ triggerKey, size = 60 }: HeartBurstProps) {
  // 재생 중인 버스트의 키(null이면 미재생). 완료 시 null로 되돌려 DOM에서 제거한다.
  const [activeKey, setActiveKey] = useState<number | null>(null);
  // triggerKey 변화를 렌더 중에 감지해 activeKey를 조정한다(effect 없이).
  const [lastTrigger, setLastTrigger] = useState(triggerKey);
  if (triggerKey !== lastTrigger) {
    setLastTrigger(triggerKey);
    if (triggerKey > 0) setActiveKey(triggerKey);
  }

  // 초기 상태(triggerKey 0)에서는 서버·클라이언트 모두 null을 렌더하므로 하이드레이션
  // 불일치가 없다. 실제 재생은 클릭 이후(클라이언트)라 이때 document가 항상 존재한다.
  if (activeKey === null) return null;

  return createPortal(
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 inset-y-0 z-[80] mx-auto max-w-app"
    >
      {/* Figma 하트 위치(node 488:9743): 가로 중앙, 세로는 프레임 기준 34.1%(중심 277/812).
          위치는 이 래퍼가 잡고, 안쪽 motion은 scale/opacity만 다뤄 transform 충돌을 피한다. */}
      <div className="absolute top-[34.1%] left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.span
          key={activeKey}
          // 300ms 뒤 팝인 → 잠깐 유지 → 살짝 커지며 사라진다.
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1, 1, 1.3] }}
          transition={{
            delay: BURST_DELAY,
            duration: 0.9,
            times: [0, 0.2, 0.55, 1],
            ease: "easeOut",
          }}
          onAnimationComplete={() => setActiveKey(null)}
          // 하트 path의 fill(currentColor)을 그라데이션으로 덮어써 그라데이션 하트를 만든다.
          className="inline-flex [&_path]:fill-[url(#showmoa-heart-burst-gradient)]"
        >
          <HeartBoldIcon size={size} />
          {/* 하트 path가 참조할 그라데이션 정의(세로 방향, 상단 핑크 → 하단 오렌지). */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={HEART_GRADIENT_TOP} />
                <stop offset="100%" stopColor={HEART_GRADIENT_BOTTOM} />
              </linearGradient>
            </defs>
          </svg>
        </motion.span>
      </div>
    </div>,
    document.body,
  );
}
