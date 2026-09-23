"use client";

interface CalendarTitleBarProps {
  /** 화면에 표시할 기준 날짜 문구(예: "Friday, May 12"). */
  label: string;
  /** 날짜 문구를 눌렀을 때. 월 선택 휠 피커를 연다. */
  onOpenPicker: () => void;
  /** 토글 버튼 문구(월간 뷰에선 "주간", 주간 뷰에선 "월간"). */
  toggleLabel: string;
  /** 월간/주간 토글 콜백 */
  onToggle: () => void;
}

/**
 * 캘린더 상단 제목 바. 기준 날짜 문구(누르면 월 선택 휠 피커)와 월간/주간
 * 토글 텍스트 버튼을 나란히 보여준다.
 */
export function CalendarTitleBar({
  label,
  onOpenPicker,
  toggleLabel,
  onToggle,
}: CalendarTitleBarProps) {
  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={onOpenPicker}
        aria-haspopup="dialog"
        aria-label={`월 선택, 현재 ${label}`}
        className="rounded-sm text-h1 font-semibold text-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:opacity-80"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={onToggle}
        className="rounded-sm text-h1 font-medium text-muted-foreground outline-none hover:cursor-pointer focus-visible:ring-2 focus-visible:ring-ring active:opacity-80"
      >
        {toggleLabel}
      </button>
    </div>
  );
}
