"use client";

import * as React from "react";

interface VerificationTimerProps {
  /**
   * 카운트다운 시작 시각(ms). 인증 메일 발송에 성공한 시점이다. 재발송에
   * 성공해 이 값이 바뀌면 타이머가 처음부터 다시 흐른다.
   */
  startedAt: number;
  /** 유효 시간(초). POST /api/email/send 응답의 expirationSeconds. */
  durationSeconds: number;
  /**
   * 재발송이 다시 가능해질 때까지의 시간(초). 이 시간 동안 재발송 버튼은
   * 비활성이다. 발송 직후 다시 누르면 백엔드가 거절하는데, 그 실패에 해당하는
   * 문구가 docs/spec에 없어 요청 자체를 막는 쪽을 택했다.
   */
  resendCooldownSeconds: number;
  /** 남은 시간이 0이 되면 호출된다(스펙: 404 페이지로 이동). */
  onExpire: () => void;
  /** 재발송 클릭 시 호출된다. 타이머는 startedAt이 갱신되면 초기화된다. */
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
 *
 * 남은 시간은 상태로 들고 있지 않고 startedAt·durationSeconds에서 매 초 계산한다.
 * 재발송으로 유효 시간이 바뀌어도 초기화 로직이 따로 필요 없고, 탭이 백그라운드로
 * 가 인터벌이 밀려도 실제 경과 시간과 어긋나지 않는다.
 */
export function VerificationTimer({
  startedAt,
  durationSeconds,
  resendCooldownSeconds,
  onExpire,
  onResend,
}: VerificationTimerProps) {
  const [now, setNow] = React.useState(() => Date.now());

  // onExpire가 매 렌더 새 함수여도 최신 값을 참조한다.
  const onExpireRef = React.useRef(onExpire);
  React.useEffect(() => {
    onExpireRef.current = onExpire;
  });

  // 인터벌은 한 번만 건다. 매 초 현재 시각만 갱신하고 남은 시간은 렌더에서 계산한다.
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = Math.max(
    0,
    Math.ceil((startedAt + durationSeconds * 1000 - now) / 1000),
  );

  const resendDisabled = now < startedAt + resendCooldownSeconds * 1000;

  // 0에 도달한 순간에만 만료를 알린다.
  React.useEffect(() => {
    if (secondsLeft === 0) onExpireRef.current();
  }, [secondsLeft]);

  return (
    <div className="flex items-center gap-2.5">
      {/* tabular-nums로 숫자 폭을 고정해 시간이 줄어도 옆 재발송 버튼이 밀리지 않게 한다. */}
      <span className="text-sm font-medium text-primary tabular-nums">
        <span className="sr-only">남은 시간 </span>
        {formatTime(secondsLeft)}
      </span>
      <button
        type="button"
        onClick={onResend}
        disabled={resendDisabled}
        className="rounded-xs text-sm font-medium text-hint underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:text-foreground disabled:cursor-not-allowed disabled:text-disabled disabled:hover:text-disabled"
      >
        인증 번호 재발송
      </button>
    </div>
  );
}
