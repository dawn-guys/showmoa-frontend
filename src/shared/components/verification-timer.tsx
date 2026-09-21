"use client";

import * as React from "react";

interface VerificationTimerProps {
  /** 카운트다운 시작 시간(초). 기본 300초(5분). */
  durationSeconds?: number;
  /** 남은 시간이 0이 되면 호출된다(스펙: 404 페이지로 이동). */
  onExpire: () => void;
  /** 재발송 클릭 시 호출된다. 타이머는 내부에서 초기화된다. */
  onResend?: () => void;
}

/** 초를 mm:ss로 변환한다. */
function formatTime(totalSeconds: number) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * 인증 번호 입력의 남은 시간 타이머(공통 UI). 남은 시간을 mm:ss로 보여주고,
 * [인증 번호 재발송]을 눌러 시간을 초기화할 수 있다. 시간이 0이 되면 onExpire를
 * 호출한다. 매 초 갱신되는 숫자는 스크린리더가 매번 읽지 않도록 live 영역으로
 * 두지 않는다.
 */
export function VerificationTimer({
  durationSeconds = 300,
  onExpire,
  onResend,
}: VerificationTimerProps) {
  const [secondsLeft, setSecondsLeft] = React.useState(durationSeconds);

  // onExpire가 매 렌더 새 함수여도 최신 값을 참조한다.
  const onExpireRef = React.useRef(onExpire);
  React.useEffect(() => {
    onExpireRef.current = onExpire;
  });

  // 인터벌은 한 번만 건다. 매 초 1씩 줄이고 0에서 멈춘다. 재발송 시에는
  // secondsLeft만 초기값으로 되돌리면 같은 인터벌이 이어서 카운트한다.
  React.useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // 0에 도달한 순간에만 만료를 알린다.
  React.useEffect(() => {
    if (secondsLeft === 0) onExpireRef.current();
  }, [secondsLeft]);

  const handleResend = () => {
    setSecondsLeft(durationSeconds);
    onResend?.();
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* tabular-nums로 숫자 폭을 고정해 시간이 줄어도 옆 재발송 버튼이 밀리지 않게 한다. */}
      <span className="text-sm font-medium text-primary tabular-nums">
        <span className="sr-only">남은 시간 </span>
        {formatTime(secondsLeft)}
      </span>
      <button
        type="button"
        onClick={handleResend}
        className="rounded-xs text-sm font-medium text-hint underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:text-foreground"
      >
        인증 번호 재발송
      </button>
    </div>
  );
}
