"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * 앱 진입 스플래시. 새 창/탭에서 처음 열 때만 조명 연출을 1회 재생하고 끝나면
 * 페이드아웃하며 홈을 노출한다. 같은 탭에서는 홈 재진입·새로고침 모두 재생하지
 * 않는다(sessionStorage 'seen' 플래그 기준. 탭을 닫으면 초기화). 재생 여부는 두
 * 층위로 판단한다:
 *  - 같은 런타임 재진입(클라이언트 내비게이션): 모듈 플래그로 초기 렌더부터 스킵.
 *  - 새로고침 등 전체 로드: sessionStorage + layout.tsx의 pre-paint 스크립트가
 *    페인트 전에 오버레이를 숨겨 깜빡임 없이 스킵.
 * 홈 데이터 로딩은 오버레이 아래에서 독립적으로 진행되므로, 애니메이션이 끝났을
 * 때 로딩 중이면 홈의 스켈레톤이 그대로 보인다.
 *
 * 프레임/타이밍 출처: Figma 스플래시 프로토타입(node 488:9080 외).
 * - 진입(로고만) → 800ms → 하이라이트(조명 페이드인 300ms EASE_OUT)
 * - → 100ms → 페이드아웃(조명 깜빡임, 즉시) → 100ms → 하이라이트(즉시)
 * - → 1000ms → 홈 노출
 */

// 타임라인(ms). 전환 시간은 Figma 프로토타입 값을 따른다.
const ENTRY_MS = 800; // 로고만 보이는 초기 상태 유지
const HIGHLIGHT_IN_MS = 300; // 조명 페이드인(Figma EASE_OUT)
const BLINK_MS = 350; // 조명 깜빡임 간격(하이라이트↔페이드아웃 전환 딜레이)
const HOLD_END_MS = 1000; // 조명이 다시 켜진 뒤 홈 노출까지 유지
const EXIT_MS = 400; // 오버레이 페이드아웃(홈 노출)
const REDUCED_HOLD_MS = 1200; // 모션 최소화 시 정적 노출 시간

// 조명 원 색상: Figma 스플래시 전용 값이라 대응하는 디자인 토큰이 없다.
const LIGHT_COLOR = "#FEF8F1";

// 이 탭 세션에서 스플래시를 봤는지 저장하는 키. sessionStorage는 탭 단위이고
// 새로고침에도 유지되며 새 탭이면 초기화된다. layout.tsx의 pre-paint 스크립트가
// 같은 키를 읽어 새로고침 시 오버레이를 페인트 전에 숨긴다.
const SEEN_KEY = "showmoa:splash:seen";

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // 무시(프라이빗 모드 등 저장 불가)
  }
}

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) !== null;
  } catch {
    return false;
  }
}

type Phase = "entry" | "highlight-start" | "fadeout" | "highlight-end";

// 이 탭(자바스크립트 런타임)에서 스플래시를 이미 재생했는지 기억한다. 같은 탭
// 안에서 클라이언트 내비게이션으로 홈에 다시 들어와도 재생하지 않기 위한 플래그.
// 전체 새로고침 시 모듈이 다시 로드되며 false로 초기화된다.
let playedInRuntime = false;

export function HomeSplash() {
  const reduceMotion = useReducedMotion();

  // 오버레이는 SSR 첫 페인트부터 렌더해 홈(스켈레톤)이 먼저 보이지 않게 한다.
  // 서버·최초 로드에서는 열고, 같은 런타임 재진입에서는 열지 않는다(재생 스킵).
  // 서버에서는 window가 없어 항상 true가 되고, 하이드레이션 시점에도 런타임
  // 플래그가 아직 false라 서버 렌더 결과와 일치한다(불일치 없음).
  const [phase, setPhase] = useState<Phase>("entry");
  const [open, setOpen] = useState(
    () => typeof window === "undefined" || !playedInRuntime,
  );

  useEffect(() => {
    if (!open) return; // 같은 런타임 재진입(클라 내비게이션): 재생하지 않는다.
    playedInRuntime = true; // 이 런타임에서 처리함 → 이후 재진입은 initializer가 스킵.

    // 이 탭 세션에서 이미 봤으면(새로고침 포함) 재생하지 않는다. 전체 로드 시엔
    // layout.tsx의 pre-paint 스크립트가 오버레이를 이미 숨겨 두므로(깜빡임 없음),
    // 남은 오버레이 노드만 정리하고 끝낸다.
    if (alreadySeen()) {
      const cleanup = setTimeout(() => setOpen(false), 0);
      return () => clearTimeout(cleanup);
    }

    // seen 기록은 재생 "완료" 시점에 한다. 시작 시점에 기록하면 개발 모드
    // StrictMode의 이펙트 2회 실행에서 2회차가 alreadySeen()=true로 판단해
    // 애니메이션을 중간에 끊어버린다(전체 시퀀스 미보장). 완료 후 기록하면
    // 2회차도 처음부터 다시 온전히 재생한다.
    const finishSplash = () => {
      markSeen();
      setOpen(false);
    };

    // 모션 최소화: 깜빡임 없이 조명이 켜진 상태로 전환한 뒤 잠시 후 페이드아웃한다.
    if (reduceMotion) {
      const toLit = setTimeout(() => setPhase("highlight-end"), 0);
      const toExit = setTimeout(finishSplash, REDUCED_HOLD_MS);
      return () => {
        clearTimeout(toLit);
        clearTimeout(toExit);
      };
    }

    const toFadeout = ENTRY_MS + HIGHLIGHT_IN_MS + BLINK_MS;
    const toHighlightEnd = toFadeout + BLINK_MS;
    const toExit = toHighlightEnd + HOLD_END_MS;

    const timers = [
      setTimeout(() => setPhase("highlight-start"), ENTRY_MS),
      setTimeout(() => setPhase("fadeout"), toFadeout),
      setTimeout(() => setPhase("highlight-end"), toHighlightEnd),
      setTimeout(finishSplash, toExit),
    ];
    return () => timers.forEach(clearTimeout);
  }, [open, reduceMotion]);

  const lit = phase === "highlight-start" || phase === "highlight-end";
  const dark = phase === "fadeout";
  // 조명 페이드인만 부드럽게(300ms), 나머지 전환은 즉시 처리해 깜빡임을 만든다.
  const innerTransition =
    phase === "highlight-start"
      ? `opacity ${HIGHLIGHT_IN_MS}ms ease-out`
      : "none";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          // 앱 컬럼 폭에 맞춘 전체 화면 오버레이. 브랜드 인트로이므로 AT에서는 숨긴다.
          // data-splash-overlay: layout.tsx의 pre-paint 스크립트가 새로고침 시
          // 이 요소를 페인트 전에 숨기기 위한 선택자.
          className="fixed inset-x-0 inset-y-0 z-[100] mx-auto grid max-w-app min-w-[320px] place-items-center bg-background"
          data-splash-overlay
          aria-hidden
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_MS / 1000, ease: "easeOut" }}
        >
          {/* 워드마크 박스: 진입 로고(흐름 배치)가 높이를 잡고, 나머지는 그 위에
              겹친다. 두 로고는 상단을 맞춰 워드마크가 정확히 포개지고,
              splash.svg의 그림자는 박스 아래로 흘러넘친다(중앙 정렬 시 splash가
              그림자 높이만큼 위로 밀리는 어긋남을 방지). */}
          <div className="relative">
            {/* 조명 원: 워드마크 중심에 맞춰 로고 뒤에서 켜진다. */}
            <span
              className="absolute top-1/2 left-1/2 size-[309px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: LIGHT_COLOR,
                opacity: lit ? 1 : 0,
                transition: innerTransition,
              }}
            />
            {/* 진입 로고(흰색 SHOW): 어두운 배경에서 보이며 박스 높이를 정한다. */}
            <Image
              src="/logo.svg"
              alt=""
              width={418}
              height={152}
              priority
              unoptimized
              className="relative block h-auto w-[244px]"
              style={{
                opacity: !lit && !dark ? 1 : 0,
                transition: innerTransition,
              }}
            />
            {/* 하이라이트 로고(검정 SHOW + 그림자 내장): 상단을 맞춰 겹친다. */}
            <Image
              src="/splash.svg"
              alt=""
              width={248}
              height={95}
              priority
              unoptimized
              className="absolute top-0 left-0 h-auto w-[244px]"
              style={{
                opacity: lit ? 1 : 0,
                transition: innerTransition,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
