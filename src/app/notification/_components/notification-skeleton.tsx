import { Skeleton } from "@/shared/components/ui/skeleton";

// 스켈레톤 행 너비를 조금씩 달리해 실제 목록처럼 보이게 한다.
const ROW_WIDTHS = ["w-full", "w-4/5", "w-11/12", "w-3/4", "w-5/6"];

/** 알림 로딩 상태. 헤더는 실제 문구를 유지하고 행 자리에 스켈레톤 바를 노출한다. */
export function NotificationSkeleton() {
  return (
    <div className="flex flex-col px-4 pt-2" aria-busy="true">
      <h2 className="text-body1 font-medium text-foreground">오늘</h2>
      <ul className="mt-1">
        {ROW_WIDTHS.map((width, index) => (
          <li
            key={index}
            className="flex min-h-11 items-start gap-[13px] py-2.5"
            aria-hidden
          >
            <Skeleton className="mt-[7px] size-2 shrink-0 rounded-full" />
            <Skeleton className={`h-[19px] rounded-[5px] ${width}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
