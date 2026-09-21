import Link from "next/link";

/**
 * 찜-비로그인 화면. 로그인이 필요한 서비스임을 안내하고 로그인 페이지로
 * 유도한다. 아직 회원이 아닌 사용자를 위해 회원가입 링크도 함께 제공한다.
 */
export function WishlistGuest() {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <h1 className="sr-only">좋아요 한 공연</h1>
      <Link
        href="/login"
        className="rounded bg-primary px-3 py-2.5 text-body1 font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:opacity-90"
      >
        로그인 하러 가기
      </Link>

      <div className="flex flex-col items-center gap-5">
        <p className="text-body1 font-medium text-disabled">
          로그인이 필요한 서비스 입니다
        </p>
        <p className="flex items-center gap-[5px] text-body1 font-medium text-disabled">
          아직 회원이 아니신가요?
          <Link
            href="/signup"
            className="rounded-sm px-0.5 text-primary underline underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
