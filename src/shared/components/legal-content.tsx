/**
 * LegalDrawer에 넣는 약관 본문(개인 정보 처리 방침, 위치 정보 서비스 이용 약관).
 * 문구는 확정본을 그대로 옮긴 것이므로 임의로 고치지 않는다.
 */

// 조항 블록: 제목(h3, 드로워 제목 h2 아래 단계) + 본문
function Article({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 border-t border-border pt-5">
      <h3 className="text-h2 text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p className="text-body2 break-keep text-[#bbbbbb]">{children}</p>;
}

function OrderedList({ items }: { items: React.ReactNode[] }) {
  return (
    <ol className="flex list-decimal flex-col gap-1 pl-5 text-body2 break-keep text-[#bbbbbb]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1 pl-5 text-body2 break-keep text-[#bbbbbb]">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// 표: 열이 많으면 화면 폭을 넘으므로 표 영역만 가로 스크롤한다.
// 키보드로도 스크롤할 수 있도록 영역에 포커스를 허용한다.
function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div
      tabIndex={0}
      className="[scrollbar-width:none] overflow-x-auto overscroll-x-contain rounded-md border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-scrollbar]:hidden"
    >
      <table className="w-full border-collapse text-left text-body3 break-keep text-[#bbbbbb]">
        <thead className="bg-muted">
          <tr>
            {head.map((cell) => (
              <th
                key={cell}
                scope="col"
                className="min-w-20 border-b border-border px-3 py-2 font-semibold"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="min-w-20 px-3 py-2 align-top [overflow-wrap:anywhere]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PrivacyPolicyContent() {
  return (
    <div className="flex flex-col gap-5 pt-2 pb-10">
      <div className="flex flex-col gap-2">
        <Paragraph>
          <strong>Show Moa</strong>(이하 &quot;회사&quot; 또는
          &quot;서비스&quot;)는 이용자의 개인정보를 중요시하며, 「개인정보
          보호법」을 준수합니다. 본 방침은 회사가 어떤 개인정보를 수집하고,
          어떻게 이용·보관·파기하는지 안내합니다.
        </Paragraph>
        <Paragraph>
          본 방침은 <strong>2026년 10월 2일</strong>부터 시행됩니다.
        </Paragraph>
      </div>

      <Article title="제1조 (수집하는 개인정보 항목)">
        <Paragraph>회사는 다음과 같은 개인정보를 수집합니다.</Paragraph>
        <Table
          head={["구분", "수집 항목", "수집 방법"]}
          rows={[
            [
              "필수 (이메일 회원가입)",
              "이메일, 비밀번호",
              "이메일 회원가입 시 이용자가 직접 입력 (이메일 인증번호 확인 포함)",
            ],
            [
              "필수 (소셜 로그인)",
              "이메일, 닉네임 (또는 프로필 식별정보)",
              "구글·카카오 소셜 로그인 시 제공사로부터 수신",
            ],
            [
              "선택",
              "위치정보(위도·경도)",
              "지도 기반 공연장 탐색 기능 이용 시, 이용자가 위치 접근을 허용한 경우에만",
            ],
            [
              "자동 수집",
              "서비스 이용기록(찜한 공연, 캘린더 일정, 접속 로그, 기기정보)",
              "서비스 이용 과정에서 자동 생성",
            ],
          ]}
        />
        <Paragraph>
          회사는 결제·정산을 직접 처리하지 않으며, 카드번호·계좌번호 등
          금융정보를 수집하지 않습니다. 예매는 외부 예매처 화면으로 이동하여
          진행되며, 그 화면에서 입력하는 정보는 각 예매처의 개인정보처리방침을
          따릅니다.
        </Paragraph>
      </Article>

      <Article title="제2조 (개인정보의 수집 및 이용 목적)">
        <OrderedList
          items={[
            "회원 식별 및 로그인 유지",
            "이메일 인증, 비밀번호 재설정 등 계정 관리",
            "찜한 공연·개인 캘린더 등 개인화 기능 제공",
            "지도 기반 공연장 탐색 등 위치 기반 서비스 제공",
            "서비스 개선 및 오류 대응을 위한 통계 분석 (비식별 처리)",
          ]}
        />
      </Article>

      <Article title="제3조 (개인정보의 보유 및 이용 기간)">
        <Paragraph>
          이용자의 개인정보는 <strong>회원 탈퇴 시까지</strong> 보유하며, 탈퇴
          즉시 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 법령이
          정한 기간 동안 보관합니다.
        </Paragraph>
        <Table
          head={["보관 항목", "보관 근거", "보관 기간"]}
          rows={[
            ["접속 로그(IP, 접속 일시 등)", "통신비밀보호법", "3개월"],
            [
              "찜(위시리스트), 캘린더 일정 등 개인화 데이터",
              "-",
              "탈퇴 즉시 파기 (법정 보관 의무 없음)",
            ],
          ]}
        />
      </Article>

      <Article title="제4조 (개인정보의 제3자 제공)">
        <Paragraph>
          회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만
          다음의 경우 예외로 합니다.
        </Paragraph>
        <OrderedList
          items={[
            "이용자가 사전에 동의한 경우",
            "법령의 규정에 의거하거나 수사기관의 적법한 절차에 따른 요청이 있는 경우",
          ]}
        />
        <Paragraph>
          공연 정보는 공연예술통합전산망(KOPIS)에서 수집한 공개 데이터이며
          개인정보와 무관합니다.
        </Paragraph>
      </Article>

      <Article title="제5조 (개인정보 처리의 위탁)">
        <Paragraph>
          회사는 서비스 운영을 위해 다음과 같이 개인정보 처리 업무를 위탁할 수
          있습니다.
        </Paragraph>
        <Table
          head={["수탁업체", "위탁업무 내용"]}
          rows={[
            [
              "Google LLC (Google Cloud Platform)",
              "서버 및 데이터베이스 호스팅",
            ],
            ["Google LLC", "구글 소셜 로그인 인증"],
            ["카카오(Kakao Corp.)", "카카오 소셜 로그인 인증"],
          ]}
        />
      </Article>

      <Article title="제6조 (개인정보의 국외 이전)">
        <Paragraph>
          회사는 서비스 제공을 위해 다음과 같이 개인정보를 국외로 이전하고
          있습니다.
        </Paragraph>
        <Table
          head={[
            "이전받는 자",
            "이전 항목",
            "이전 국가",
            "이전 일시 및 방법",
            "이전받는 자의 이용 목적",
            "보유·이용 기간",
          ]}
          rows={[
            [
              "Google LLC",
              "이메일, 프로필 식별정보, 서비스 이용기록",
              "미국 (서비스 이용 리전에 따라 결정)",
              "서비스 이용 시점에 네트워크를 통해 실시간 전송",
              "서버·데이터베이스 호스팅(Google Cloud Platform), 소셜 로그인 인증",
              "위탁 계약 종료 시 또는 회원 탈퇴 시까지",
            ],
            [
              "Kakao Corp.",
              "이메일, 프로필 식별정보",
              "대한민국 내 처리가 원칙이나 인증 과정에서 국외 경유 가능",
              "로그인 시점에 네트워크를 통해 실시간 전송",
              "카카오 소셜 로그인 인증",
              "인증 처리 완료 시까지",
            ],
          ]}
        />
        <Paragraph>
          이용자는 개인정보의 국외 이전을 거부할 권리가 있습니다. 다만
          구글·카카오 소셜 로그인은 국외 이전에 동의하지 않을 경우 해당 로그인
          방식의 이용이 제한될 수 있으며, 이 경우 이메일 회원가입 등 대체 수단을
          이용할 수 있습니다.
        </Paragraph>
      </Article>

      <Article title="제7조 (개인정보의 안전성 확보조치)">
        <Paragraph>
          회사는 개인정보보호법 제29조에 따라 다음과 같은 기술적·관리적
          보호조치를 취하고 있습니다.
        </Paragraph>
        <OrderedList
          items={[
            <>
              <strong>비밀번호 암호화</strong>: 이용자의 비밀번호는 복호화가
              불가능한 일방향 암호화(BCrypt) 방식으로 저장합니다.
            </>,
            <>
              <strong>접근 통제</strong>: 회원 탈퇴 등 주요 기능에 대해 비밀번호
              확인 실패 횟수를 제한하여 무차별 대입 공격(브루트포스)을
              방지합니다.
            </>,
            <>
              <strong>인증·세션 관리</strong>: JWT 기반 인증을 사용하며,
              비밀번호 변경·재설정 시 기존에 발급된 인증 토큰을 즉시
              무효화합니다.
            </>,
            <>
              <strong>통신 구간 암호화</strong>: 이용자와 서비스 간 통신 구간에
              HTTPS(TLS)를 적용하여 데이터 탈취를 방지합니다.
            </>,
            <>
              <strong>최소 권한 원칙</strong>: 개인정보 처리 업무는 담당자를
              최소한으로 지정해 운영합니다.
            </>,
          ]}
        />
      </Article>

      <Article title="제8조 (이용자의 권리와 행사 방법)">
        <Paragraph>
          이용자는 언제든지 다음의 권리를 행사할 수 있습니다.
        </Paragraph>
        <BulletList
          items={[
            "본인의 개인정보 열람·정정·삭제 요청",
            "회원 탈퇴 및 개인정보 삭제 요청",
            "위치정보 수집 동의 철회 (앱 내 설정에서 언제든 해제 가능)",
            "개인정보의 국외 이전 동의 철회",
          ]}
        />
        <Paragraph>
          권리 행사는 마이페이지 내 설정 화면 또는 아래 문의처를 통해 요청할 수
          있습니다.
        </Paragraph>
      </Article>

      <Article title="제9조 (개인정보의 파기)">
        <Paragraph>
          수집 목적이 달성되거나 보유 기간이 경과한 개인정보는 지체 없이
          파기합니다. 전자적 파일 형태의 정보는 복구 불가능한 방법으로 영구
          삭제합니다.
        </Paragraph>
      </Article>

      <Article title="제10조 (개인정보 보호책임자)">
        <Table
          head={["구분", "내용"]}
          rows={[
            ["성명", "장준영"],
            ["이메일", "jangabc1@gmail.com"],
          ]}
        />
      </Article>

      <Article title="제11조 (개인정보처리방침의 변경)">
        <Paragraph>
          본 방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이
          추가·삭제·수정될 수 있습니다. 내용을 변경하는 경우 시행일자 및 변경
          사항을 최소 7일 전(이용자 권리에 중대한 영향을 미치는 변경의 경우 최소
          30일 전)에 서비스 내 공지사항을 통해 고지합니다.
        </Paragraph>
      </Article>
    </div>
  );
}

export function LocationTermsContent() {
  return (
    <div className="flex flex-col gap-5 pt-2 pb-10">
      <Article title="제1조 (목적)">
        <Paragraph>
          이 약관은 Show Moa(이하 &quot;회사&quot;)가 제공하는
          위치기반서비스(이하 &quot;서비스&quot;)를 이용함에 있어 회사와
          이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </Paragraph>
      </Article>

      <Article title="제2조 (서비스의 내용)">
        <Paragraph>회사가 제공하는 위치기반서비스는 다음과 같습니다.</Paragraph>
        <OrderedList
          items={[
            "이용자의 현재 위치 또는 선택 지역을 기준으로 주변 공연장(극장)을 지도에 표시하는 서비스",
            "공연장별 진행 중인 공연 라인업 제공",
          ]}
        />
      </Article>

      <Article title="제3조 (위치정보의 수집)">
        <OrderedList
          items={[
            "회사는 이용자가 지도 기반 탐색 기능을 사용할 때에만, 이용자 단말기의 위치정보(위도·경도)를 일시적으로 수집합니다.",
            "위치정보 수집은 이용자의 명시적 동의(단말기 위치 접근 권한 허용)를 전제로 하며, 이용자는 언제든지 단말기 설정 또는 앱 내 설정에서 이 동의를 철회할 수 있습니다.",
            "위치정보 접근을 허용하지 않아도 지도 기반 탐색을 제외한 나머지 서비스(공연 검색, 찜, 캘린더 등)는 정상적으로 이용할 수 있습니다.",
          ]}
        />
      </Article>

      <Article title="제4조 (개인위치정보의 이용 및 보유기간)">
        <OrderedList
          items={[
            "수집된 위치정보는 주변 공연장 검색 결과를 표시하는 목적으로만 즉시 이용되며, 서버에 별도로 저장하지 않습니다.",
            "위치정보를 통계·분석 목적으로 활용할 경우, 특정 개인을 식별할 수 없도록 비식별 처리한 후 이용합니다.",
          ]}
        />
      </Article>

      <Article title="제5조 (개인위치정보의 제3자 제공)">
        <Paragraph>
          회사는 이용자의 동의 없이 개인위치정보를 제3자에게 제공하지 않습니다.
          지도 표시를 위해 사용하는 지도 API 제공사(네이버 지도)에는 서비스
          제공에 필요한 최소한의 정보만 전달되며, 이는 위치 조회 목적 외에
          이용되지 않습니다.
        </Paragraph>
      </Article>

      <Article title="제6조 (이용자의 권리)">
        <Paragraph>이용자는 다음의 권리를 가집니다.</Paragraph>
        <OrderedList
          items={[
            "위치정보 수집·이용·제공에 대한 동의를 언제든지 전부 또는 일부 철회할 권리",
            "위치정보의 수집·이용·제공사실 확인자료 열람 또는 고지를 요구할 권리",
            "본인의 위치정보로 인한 피해에 대해 신속한 구제를 요구할 권리",
          ]}
        />
      </Article>

      <Article title="제7조 (위치정보관리책임자)">
        <Table
          head={["구분", "내용"]}
          rows={[
            ["성명", "곽다윗"],
            ["이메일", "hprry@daum.net"],
          ]}
        />
      </Article>

      <Article title="제8조 (손해배상)">
        <Paragraph>
          회사가 위치정보의 수집·이용·제공과 관련한 의무를 위반하여 이용자에게
          손해를 끼친 경우, 이용자는 관계 법령에 따라 손해배상을 청구할 수
          있습니다.
        </Paragraph>
      </Article>

      <Article title="제9조 (면책)">
        <Paragraph>
          회사는 다음 각 호의 경우로 인해 발생한 손해에 대해서는 책임을 지지
          않습니다.
        </Paragraph>
        <OrderedList
          items={[
            "이용자 단말기의 GPS 수신 불량 등 기술적 사유로 위치정보가 정확하지 않은 경우",
            "천재지변, 통신 장애 등 불가항력적 사유로 서비스가 일시 중단된 경우",
          ]}
        />
      </Article>

      <dl className="flex flex-col gap-1 border-t border-border pt-5 text-body2 text-[#bbbbbb]">
        <div className="flex gap-1">
          <dt className="font-semibold">공고일자:</dt>
          <dd>2026-09-23</dd>
        </div>
        <div className="flex gap-1">
          <dt className="font-semibold">시행일자:</dt>
          <dd>2026-09-27</dd>
        </div>
      </dl>
    </div>
  );
}
