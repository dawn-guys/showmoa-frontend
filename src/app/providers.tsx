"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        {/* nuqs의 useQueryState는 내부에서 useSearchParams를 호출한다. 정적
            프리렌더 단계에서 이 훅은 가장 가까운 Suspense 경계를 요구하므로
            (없으면 프로덕션 빌드가 실패한다) 경계를 여기 한 번만 둔다.
            오버레이 상태를 URL로 관리해 거의 모든 화면이 nuqs를 쓰기 때문에
            화면마다 경계를 두는 대신 셸에서 감싼다. */}
        <Suspense>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </Suspense>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}
