interface CastSectionProps {
  cast: string[];
}

/** 출연진 섹션. 이름을 칩(pill) 목록으로 보여준다. */
export function CastSection({ cast }: CastSectionProps) {
  if (cast.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-h1 font-semibold text-foreground">출연진</h2>
      <ul className="flex flex-wrap gap-2.5">
        {cast.map((name, index) => (
          <li
            key={`${name}-${index}`}
            // 칩 배경 #313131은 대응 토큰이 없어 임시 하드코딩(디자인 시스템에 토큰 추가 후보).
            className="rounded-[20px] bg-[#313131] px-2 py-1 text-body2 font-medium text-foreground"
          >
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}
