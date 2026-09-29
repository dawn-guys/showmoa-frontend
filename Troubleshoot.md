# Troubleshoot

> 로컬 전용 트러블슈팅 메모 (`.gitignore` 처리, 커밋 대상 아님)

## 2026-09-22 · 네이버 지도 로딩 & `naver` 타입 에러

### 1. 증상

지도 화면(`/map`)에서 두 종류의 문제가 동시에 관찰됨.

**(A) 지도 자체가 안 뜨고 콘솔 401/인증 실패**

```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
maps.js?ncpKeyId=...&submodules=gl
NAVER Maps JavaScript API v3 잠시 후에 다시 요청해 주세요.
 * Error Code / Error Message: 500 / Internal Server Error (내부 서버 오류)
 * Client ID: NWfRgG3TwCjdEwOx27axKtR6GgRwJdVY03uoTTUA
 * URI: http://localhost:3000/map
안드로이드 9 이상에서는 HTTP 평문 통신이 기본적으로 사용되지 않습니다. ...
```

**(B) 에디터에서 `map-view.tsx`가 빨간줄 투성이**

```
'naver' 네임스페이스를 찾을 수 없습니다. (Cannot find namespace 'naver')
'naver' 이름을 찾을 수 없습니다.   (Cannot find name 'naver')
```

두 문제는 원인이 서로 다르다. (A)는 코드가 아니라 네이버 콘솔 설정 문제, (B)는 타입 해석 문제.

---

### 2. (B) `naver` 타입 에러 — 원인 분석과 해결 (이번에 코드로 고친 부분)

#### 원인

- `@types/navermaps`는 이미 `package.json`에 설치돼 있었고, 전역 `declare namespace naver.maps { ... }`로 `naver` 네임스페이스를 제공한다.
- 그런데 `node_modules/@types/navermaps/index.d.ts` 첫 줄이 `/// <reference types="geojson" />`로 **`@types/geojson`을 참조**하는데, 이 패키지가 설치돼 있지 않았다.
- 참조가 풀리지 않으면 에디터 TS 서버가 `navermaps` 선언을 온전히 로드하지 못해 전역 `naver`를 인식하지 못한다 → `Cannot find namespace 'naver'`.
- CLI의 `tsc`는 `skipLibCheck: true` 때문에 `.d.ts` 검사를 건너뛰어 조용히 통과했다. 그래서 `pnpm typecheck`는 성공하는데 **에디터만** 에러를 내는 불일치가 발생.

#### 진단 방법 (재현/확인)

```bash
# 1) geojson 존재 확인 → MISSING 이었음
ls node_modules/@types/geojson

# 2) tsc / eslint 는 통과 (에디터와 불일치 확인)
pnpm typecheck            # 통과
npx eslint <map-view.tsx> # 에러 0

# 3) naver 전역이 실제 타입으로 잡히는지 프로브
#    (일부러 잘못된 대입 → 타입이 살아있으면 TS2322 발생)
echo 'const p: naver.maps.LatLng = 123; export {};' > src/app/(tabs)/map/_probe.ts
npx tsc --noEmit   # => error TS2322: Type 'number' is not assignable to type 'LatLng'
rm src/app/(tabs)/map/_probe.ts
```

#### 해결

1. 누락 의존성 설치

   ```bash
   pnpm add -D @types/geojson
   ```

2. `naver`를 직접 사용하는 파일 최상단에 명시적 타입 참조 추가.
   자동 포함 타이밍/TS 서버 캐시에 의존하지 않고 항상 해석되도록 함.

   - `src/app/(tabs)/map/_components/map-view.tsx` 1행
     `/// <reference types="navermaps" />` (`"use client"` 위 — triple-slash는 주석이라 directive 프롤로그에 영향 없음)
   - `src/app/(tabs)/map/_lib/naver-map.ts` 1행
     `/// <reference types="navermaps" />` (단독으로 열어도 해석되도록)

3. 이미 열려 있던 버퍼는 TS 서버 캐시가 남아있을 수 있으므로 한 번 재시작.
   - VS Code: `Ctrl+Shift+P` → `TypeScript: Restart TS Server`
   - 그래도 남으면 `Developer: Reload Window`

#### 검증

- `pnpm typecheck` 통과
- `eslint` (map-view.tsx, naver-map.ts) 에러 0

---

### 3. (A) 401 / 500 인증 실패 — 원인 분석 (코드로는 해결 불가)

#### 원인

- 이 메시지는 네이버 지도가 **인증 실패** 시 호출하는 표준 안내(`navermap_authFailure` 상황)다. 요청이 네이버 서버까지 도달했고 서버가 인증을 거부한 것이라 **프론트 코드로는 고칠 수 없다.**
- 스크립트 URL·파라미터(`ncpKeyId`) 형식은 정상이고, 실패 지점은 **키/도메인 등록**이다.

가능성 (높은 순):

1. **Web 서비스 URL 미등록 (가장 흔함)** — 네이버 클라우드 플랫폼 콘솔의 Maps 애플리케이션 설정에서 `http://localhost:3000`(및 배포 도메인)을 "Web 서비스 URL"에 등록해야 한다.
2. **키/서비스 종류 불일치** — `ncpKeyId`는 신규 콘솔 Maps 키용. 구버전 애플리케이션 키면 인증이 안 된다. Maps(Dynamic Map) 서비스가 활성화된 신규 키인지 확인.
3. **발급 직후 전파 지연** — 방금 만든 키면 몇 분 뒤 정상화되기도 함("잠시 후에 다시 요청" 문구).

> `안드로이드 9 이상 HTTP 평문 통신...` 문구는 인증 실패 메시지에 항상 붙는 정형 안내라 **웹 환경과 무관**. 무시.

#### 해결 순서 (콘솔 작업)

1. 콘솔 → Maps 애플리케이션 → Web 서비스 URL에 `http://localhost:3000` 등록 → 저장
2. 몇 분 뒤 새로고침
3. 그래도 안 되면 해당 키가 신규 Maps 키(`ncpKeyId` 대상)인지 점검

---

### 참고: 관련 파일

- `src/app/(tabs)/map/_lib/naver-map.ts` — 스크립트 URL·옵션·마커 헬퍼, env 상수
- `src/app/(tabs)/map/_components/map-view.tsx` — 지도 캔버스, `navermap_authFailure` 전역 콜백 등록
- `.env.local` — `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`, `NEXT_PUBLIC_NAVER_MAP_STYLE_ID`

---

## 2026-09-22 · 네이버 지도 타일 요청은 200인데 화면이 흰색/회색으로만 뜸

### 1. 증상

- `maps.js`와 타일 이미지 요청이 모두 **200**으로 정상 응답 (인증 문제 아님).
- 콘솔에 **에러/경고 없음**.
- 그런데 지도 화면은 흰색·회색만 보이고 지도가 안 그려짐.

앞선 (A) 401 인증 실패와는 다른 문제. 요청·인증은 다 통과하는데 **렌더링만** 안 되는 상황.

### 2. 진단 과정

추측을 배제하기 위해 단계적으로 좁힘.

1. **스크립트/키 확인** — `curl`로 `maps.js?ncpKeyId=...` 요청 → 200 + 실제 라이브러리 본문 반환. 스크립트·키 정상.
2. **레이아웃 높이 확인** — `main`=`h-dvh`(relative), 지도 컨테이너=`absolute inset-0`. CSS상 높이는 정상.
3. **CSS 리셋 의심** — Tailwind v4 Preflight의 `img { max-width:100%; height:auto }`가 타일 `<img>`를 깨는 흔한 충돌을 의심해 `[data-naver-map] img` 리셋 무효화 추가. → 그래도 안 뜸.
4. **런타임 상태를 직접 로깅** (결정적). `map-view.tsx`에 임시 `console.log`를 심어 스크립트 콜백·컨테이너 크기·자식 노드를 관찰:

   ```
   [map] effect   { scriptLoaded:true, naverDefined:true, w:480, h:898 }  // 생성 직전: 높이 898 정상
   [map] created  { w:480, h:0, children:1 }                              // 생성 직후: 높이 0 !!!
   [map] +1.5s    { w:480, h:0, children:4, imgs:12, canvas:0 }           // 타일 12개 그려졌으나 높이 0에 갇힘
   ```

   → **지도 생성 순간 컨테이너 높이가 898 → 0으로 붕괴**하는 게 핵심. 타일(img 12개)은 정상적으로 로드됐지만 높이 0이라 전부 잘려 안 보였던 것.

### 3. 원인

- 네이버 지도(`new naver.maps.Map(container, ...)`)는 내부 자식(타일 등)을 `position:absolute`로 깔기 위해, **컨테이너 div에 `position: relative`를 강제로 덮어쓴다.**
- 우리 컨테이너는 `absolute inset-0`으로 높이를 잡고 있었는데, position이 `relative`로 바뀌면 `inset-0`(top/bottom:0)의 높이 stretch가 사라진다.
- 자식이 전부 absolute라 relative 컨테이너의 콘텐츠 높이는 0 → **컨테이너가 0px로 붕괴** → 지도가 안 보임.

### 4. 해결

지도 컨테이너를 **크기를 잡는 래퍼로 감싸고**, 네이버가 건드리는 실제 지도 div는 `size-full`(높이 100%)로 분리한다. 래퍼는 네이버가 손대지 않으므로 높이가 유지되고, 내부 div는 `height:100%`라 position이 바뀌어도 높이가 살아있다.

`src/app/(tabs)/map/_components/map-view.tsx`

```tsx
{/* 래퍼가 크기를 잡고, 네이버가 position을 덮어쓰는 실제 컨테이너는 size-full로 채운다 */}
<div className="absolute inset-0">
  <div ref={containerRef} data-naver-map className="size-full" aria-hidden />
</div>
```

함께 유지한 방어책 — `src/app/globals.css` (Tailwind Preflight img 리셋이 타일을 왜곡하지 않도록):

```css
[data-naver-map] img,
[data-naver-map] canvas {
  max-width: none;
  height: auto;
}
```

### 5. 검증

- 지도 페이지 새로고침 → 지도·타일 정상 렌더링 확인.
- `pnpm typecheck` / `eslint` 통과. 진단용 `console.log`는 전부 제거.

### 6. 교훈

- **네이버 지도 컨테이너에 `absolute inset-0`를 직접 쓰지 말 것.** 네이버가 `position:relative`로 덮어써 높이가 붕괴한다. 항상 `크기 래퍼 + 내부 size-full div` 패턴으로 둔다.
- "요청은 200인데 안 보인다"류 문제는 추측보다 **런타임 로깅(컨테이너 크기·DOM 자식)**이 가장 빠른 진단이었다.

---

## 2026-09-22 · /map에서 400 (Bad Request) — 잘못된 STYLE_ID

### 1. 증상

- 처음엔 "다른 탭 갔다가 /map 재진입 시에만 400"으로 보였으나, 결국 **dev 재시작 후 첫 진입에도 400**이 떴다.
- 콘솔: `Failed to load resource: the server responded with a status of 400 (Bad Request)`.

### 2. 헛다리 (기록용)

- 처음엔 "SDK `<Script>`가 페이지(`MapView`)에 있어 재진입마다 재마운트 → 인증 재요청 400"으로 추정하고, 스크립트를 `(tabs)/layout.tsx`로 옮겼다. **→ 원인 아님.** (첫 진입에도 400이 나는 걸로 오판이 드러남)
- 교훈: URL도 안 보고 원인을 추정하지 말 것. 아래처럼 **실제 요청 URL**을 잡고 나서야 해결됐다.

### 3. 진단 (결정적)

- `oapi.map.naver.com/v3/auth`를 `curl`로 직접 호출 → **200** (인증·키·도메인 등록 정상, quota 확인). 인증 문제 아님.
- 브라우저 Network에서 실제 400 요청 URL 확보:

  ```
  GET https://oapi.map.naver.com/v3/styler/props
      ?ncpKeyId=<키>
      &styleMetadataId=NWfRgG3TwCjdEwOx27axKtR6GgRwJdVY03uoTTUA   ← 이게 범인
      &url=http://localhost:3000/map&time=...
  → 400 {"error":{"errorCode":500,"message":"Dynamic Map API 호출 실패."}}
  ```

- `/v3/styler/props`는 **커스텀 지도 스타일**을 불러오는 엔드포인트. `styleMetadataId` 값이 스타일 ID가 아니라 **예전 Client ID**(`NWfRgG3...`)였다.

### 4. 원인

- `.env.local`의 `NEXT_PUBLIC_NAVER_MAP_STYLE_ID`에 **스타일 ID가 아닌 값(옛 Client ID)**이 들어가 있었다.
- 이 값이 있으면 `buildMapScriptUrl`이 `submodules=gl`을 붙이고 `buildMapOptions`가 `gl:true, customStyleId=<잘못된값>`을 넣어, 지도가 존재하지 않는 커스텀 스타일을 요청 → `/v3/styler/props` 400.

### 5. 해결

- `.env.local`에서 잘못된 `NEXT_PUBLIC_NAVER_MAP_STYLE_ID` 줄을 **제거**(→ `submodules=gl` 미부착, 기본 스타일 지도로 정상 동작). dev 서버 재시작 필요.
- 헛다리로 옮겼던 스크립트 위치는 **원복**: `<Script>`는 다시 `MapView`에서 지연 로딩(모든 탭에 미리 로드하지 않기 위해). 단, 재진입 대비 `scriptLoaded` 초기값만 `window.naver` 감지로 유지, 최초 로드는 `onReady`가 처리.
- 커스텀 스타일을 정말 쓸 거라면 네이버 지도 **스타일 에디터에서 발급한 진짜 스타일 ID**를 그 변수에 넣는다.

### 6. 검증

- dev 재시작 후 /map 첫 진입·탭 왕복 모두 400 미발생, 지도 정상 렌더 확인.
- `pnpm typecheck` / `eslint` / `format` 통과.

### 7. 교훈

- **"요청이 400" 문제는 반드시 실제 요청 URL부터 확보한다.** URL(`/v3/styler/props` + `styleMetadataId`) 한 줄로 원인이 즉시 확정됐다. 그 전 추정(스크립트 위치)은 전부 헛수고였다.
- `NEXT_PUBLIC_NAVER_MAP_STYLE_ID`에는 **Client ID가 아니라 스타일 에디터의 스타일 ID**를 넣어야 한다. 없으면 아예 비워 둔다(기본 스타일).

---

## 2026-09-25 · 앱 진입 스플래시 애니메이션 (단계별 트러블슈팅)

앱 첫 진입 시 조명 연출 스플래시를 구현하며 겪은 문제를 순서대로 해결한 기록.

- 대상: `src/app/(tabs)/_components/home-splash.tsx`, `src/app/(tabs)/page.tsx`,
  `src/app/layout.tsx`, `public/logo.svg`(흰색), `public/splash.svg`(검정+그림자 내장)
- 연출: 진입(로고만) → 800ms → 하이라이트(조명 페이드인 300ms) → 깜빡임(즉시 컷)
  → 하이라이트 → 1000ms → 홈 노출

### 1. 스켈레톤이 스플래시보다 먼저 보인다

- **증상** — 첫 진입 시 홈 스켈레톤이 잠깐 보였다가 스플래시가 덮음.
- **원인** — 스플래시를 `useSyncExternalStore` mounted 게이트로 **클라이언트 전용**
  렌더. 서버(SSR)는 오버레이 없이 홈만 내려보내 브라우저가 먼저 페인트 → 하이드레이션
  후에야 오버레이 등장. (SSR 첫 페인트 vs 클라 마운트 타이밍)
- **해결** — 오버레이를 **SSR 첫 페인트부터 렌더**(mounted 게이트 제거). 초기 `phase`를
  `entry`로 고정해 서버·클라 렌더 일치(하이드레이션 불일치 없음).
- **교훈** — "첫 페인트부터 덮어야 하는" 요소는 SSR HTML에 있어야 한다.

### 2. 깜빡임이 조명이 아니라 섬광처럼 눈이 아프다

- **증상** — 깜빡임이 완전 검정 순간 컷이라 스트로브처럼 눈이 아픔.
- **시도(되돌림)** — 완전히 끄지 않고 35% dim + 이징(90/160ms)으로 부드럽게 →
  "딱 끊기는" 깜빡임 느낌이 사라져 밋밋 → 원복.
- **해결** — 즉시 컷(완전 검정) 유지 + **깜빡임 유지 시간만 늘림**(`BLINK_MS`).
  조명 페이드인만 300ms 이징. 값은 상수로 빼 튜닝 가능.
- **교훈** — 부드럽게 = 항상 좋음이 아니다. 효과 성격에 맞는 곡선·지속시간을 고른다.

### 3. 진입/하이라이트 로고 위치가 미세하게 어긋난다

- **증상** — 진입(흰색) ↔ 하이라이트(검정) 전환 시 로고가 위아래로 살짝 밀림.
- **원인** — `logo.svg`(418×152)는 워드마크만, `splash.svg`(248×95)는 **아래 그림자가
  viewBox에 포함**돼 박스가 더 큼. 각자 박스 중심으로 겹치니 splash 워드마크가
  그림자 절반(~2.5px)만큼 위로 밀림.
- **해결** — 중앙 정렬 → **상단 정렬**. 두 로고 모두 워드마크가 viewBox 상단(y≈0)에서
  시작하므로 상단을 맞추면 워드마크가 포개지고 그림자는 박스 아래로 흘러넘침. 진입
  로고를 `relative`로 두어 박스 높이를 정하고 하이라이트 로고는 `absolute top-0 left-0`,
  조명 원은 워드마크 중심에 배치.
- **교훈** — 같은 그림이라도 export(그림자 포함 여부)에 따라 SVG 바운딩 박스가 다르다.
  "무엇을 기준으로 정렬할지"를 정한다.

### 4. 홈에 들어올 때마다 매번 재생된다

- **요구** — 매 진입이 아니라 **새 창/탭에서 처음 열 때만** 재생.
- **해결(1차)** — 모듈 스코프 플래그 `playedInRuntime`로 "이 탭 런타임에서 재생했는지"를
  기억. 초기 `open`을 이 플래그로 결정 → 같은 탭 내 클라 내비게이션 재진입은 초기
  렌더부터 `open=false`(1프레임 깜빡임도 없음). 최초 로드엔 플래그가 false라 SSR과 일치.
- **한계** — 모듈 플래그는 전체 새로고침 시 초기화 → 새로고침엔 다시 재생됨.

### 5. 새로고침에서도 스킵돼야 하는데 방법이 없어 보인다

- **문제의 본질** — 스켈레톤을 막으려면 서버가 오버레이를 그려야 하는데, 새로고침
  판별에 필요한 `sessionStorage`를 **서버는 읽을 수 없다**. 서버가 그리고 클라가 숨기면
  "잠깐 비쳤다 사라지는" 깜빡임 발생.
- **해결** — **pre-paint 인라인 스크립트**(다크모드 FOUC 방지 기법). `layout.tsx`
  `<body>` 최상단 동기 스크립트가 **페인트 전에** sessionStorage를 읽어, 이미 본 세션이면
  `[data-splash-overlay]{display:none}` 스타일을 주입 → 오버레이가 한 번도 안 뜸.
- **2층 판단** — 전체 로드(새로고침): sessionStorage + pre-paint 스크립트 / 같은 런타임
  재진입: 모듈 플래그.

  | 상황 | 동작 |
  |---|---|
  | 새 창/탭 최초 진입 | ✅ 재생 |
  | 같은 탭 새로고침(F5) | ❌ 스킵, 깜빡임 없음 |
  | 같은 탭 홈 재진입(내비게이션) | ❌ 스킵, 플래시 없음 |
  | 탭 닫았다 새로 열기 | ✅ 재생 |

- **교훈** — `localStorage`(영구·전역) / `sessionStorage`(탭·새로고침 유지) / 쿠키(서버
  전송)는 수명·범위·서버 접근성이 다르다. "새 탭 재생 + 새로고침 스킵"은 sessionStorage가
  유일. 서버가 못 읽는 값은 React 생명주기 바깥(브라우저 파싱 시점 스크립트)에서 처리.

### 6. 전체 애니메이션이 끝까지 재생되지 않는다 (핵심)

- **증상** — 개발 모드에서 전체 시퀀스가 중간에 끊김.
- **원인** — React **StrictMode 이펙트 이중 실행**(Next dev 기본 on). 이펙트를
  `setup() → cleanup() → setup()`으로 두 번 돌린다. 당시 이펙트는 재생 **시작** 시점에
  `markSeen()`(sessionStorage 기록)을 하고 바로 그 값을 판단 근거(`alreadySeen()`)로 읽음:
  1. 1회차 setup: `alreadySeen()` false → `markSeen()` 기록 → 타이머 시작
  2. StrictMode cleanup: 타이머 제거
  3. 2회차 setup: 방금 기록해 `alreadySeen()`가 **true** → 스킵 분기 → `setOpen(false)`로
     애니메이션 중단
  = 이펙트 setup이 **자기 부수효과에 의존**해 반복 실행 시 다른 결과를 냄(비순수).
- **해결** — 비가역 부수효과(`markSeen`)를 setup 시작이 아니라 **재생 완료 시점**
  (`finishSplash`)으로 이동. 2회차 setup도 `alreadySeen()` false를 보고 처음부터 온전히
  재생, 끝난 뒤에야 기록. setup 자체가 반복 가능(idempotent)해짐.

  ```
  before: 시작 시 markSeen → StrictMode 2회차가 "이미 봄" 오판 → 중단
  after:  완료 시 markSeen → 2회차도 온전히 재생, 끝난 뒤 기록
  ```

- **참고** — 프로덕션은 setup 1회라 원래도 정상 재생됐지만, 이펙트 비순수성이 드러나지
  않은 것뿐이라 고치는 게 맞다. StrictMode는 바로 이런 버그를 노출하려고 존재한다.

### 7. 정리 — 생명주기 관점

| 문제 | 관련 생명주기 |
|---|---|
| 스켈레톤 먼저 뜸(#1) | SSR 첫 페인트 vs 클라 마운트 타이밍 |
| 재진입마다 재생(#4) | 마운트/언마운트마다 이펙트 재실행 → 교차-마운트 상태 필요 |
| 새로고침 깜빡임(#5) | 하이드레이션 결정론 + React 바깥 pre-paint |
| 전체 재생 미보장(#6) | StrictMode 이펙트 이중 실행 + setup 비순수성 |

> 핵심 원칙: **부수효과는 이펙트에, 판단 근거가 되는 상태 변경은 생명주기가 끝날 때 —
> 그리고 SSR/하이드레이션 경계에선 항상 결정론적으로.**

---

## 2026-09-25 · 모달·바텀시트·드로워를 열고 닫을 때 브라우저 히스토리가 쌓임

### 1. 증상

- 모달·바텀시트·드로워를 여닫을 때마다 URL 뒤로가기 스택(history)에 항목이 하나씩 쌓임.
- 오버레이 하나를 열었다 닫으면 뒤로가기를 두 번 눌러야 이전 화면으로 나가짐.
  (열림 = push 1개, 닫힘 = push 1개) 여러 번 여닫으면 스택이 계속 불어남.

### 2. 원인

- 오버레이 열림 상태를 nuqs `useQueryState`로 URL 쿼리에 저장하는데, 옵션이
  `history: "push"`로 잡혀 있었다.
- nuqs에서 `history: "push"`는 값이 바뀔 때마다 `history.pushState`를 호출한다.
  → 오버레이를 열 때(예: `?filter=true`) 한 번, 닫을 때(`?filter=` 제거) 또 한 번,
  매 전환이 새 히스토리 엔트리가 됐다.
- 원래 의도는 "모바일 뒤로가기 버튼으로 오버레이를 닫는" 패턴이었지만
  (`.claude/rules/mobile.md`에도 그렇게 규정), 실제 UX에서는 뒤로가기 스택 오염이
  더 거슬리는 문제였다.

### 3. 진단

```bash
# 오버레이 open 상태를 URL로 다루는 지점 전수 조사
rg 'history:\s*"push"' src
```

- 걸린 곳을 오버레이(모달/시트/드로워)와 그 외(퍼널 step, 필터 선택값)로 분류.
- 오버레이만 문제 대상. 퍼널 `step`(회원가입·비밀번호 재설정)은 단계 네비게이션이라
  뒤로가기로 이전 단계 이동이 되어야 하므로 push 유지가 맞고, `genre`/`region` 같은
  필터 선택값은 애초에 기본값(replace)이라 무관.

### 4. 해결

오버레이 열림 상태 파라미터의 옵션을 `history: "push"` → `"replace"`로 변경.
`replace`는 `history.replaceState`라 현재 엔트리를 덮어써 스택이 늘지 않는다.
대신 오버레이는 뒤로가기가 아니라 **백드롭·Esc·닫기 버튼**으로 닫는다.

바꾼 파라미터 (총 8곳):

| 파일 | 파라미터 | 오버레이 |
|---|---|---|
| `src/app/_components/site-footer.tsx` | `policy` | 운영 정책 드로워 |
| `src/app/setting/_components/setting-list.tsx` | `policy` | 운영 정책 드로워 |
| `src/app/(tabs)/detail/[id]/_components/detail-screen.tsx` | `login` | 로그인 유도 모달 |
| `src/app/(tabs)/wishlist/_components/wishlist-liked-view.tsx` | `filter` | 필터 바텀 시트 |
| `src/app/(tabs)/search/_components/search-screen.tsx` | `filter` | 장르 필터 시트 |
| `src/app/(tabs)/search/_components/search-screen.tsx` | `region-filter` | 지역 필터 드로워 |
| `src/app/(tabs)/calendar/_components/calendar-view.tsx` | `picker` | 월 선택 시트 |
| `src/app/(tabs)/calendar/_components/calendar-view.tsx` | `day` | 날짜 바텀 시트 |

> `setting-list.tsx`의 로그아웃 모달(`logout`)은 이미 `replace`였다.

함께 갱신:

- 각 파일의 "뒤로가기로 닫음" 주석 → "히스토리에 쌓지 않음(replace)"으로 수정.
- 프로젝트 규칙 `.claude/rules/mobile.md`의 오버레이 항목을
  `history: 'replace'` 기준으로 갱신(백드롭·Esc·닫기 버튼으로 닫도록 명시).

드로워 안의 "뒤로 가기" 화살표(`DialogPrimitive.Close`)는 `router.back()`이 아니라
닫기 이벤트를 nuqs 세터로 흘려보내는 구조라, 이번 `replace` 설정이 그대로 적용된다.
→ 화살표로 닫아도 히스토리가 안 쌓인다.

### 5. 검증

- `pnpm typecheck` / `eslint` 통과.
- 오버레이 여닫기 후 뒤로가기 스택이 늘지 않는 것 확인.

### 6. 교훈

- **nuqs `history` 옵션은 그 상태가 "네비게이션"인지 "일시적 UI"인지로 정한다.**
  단계 이동(퍼널)처럼 뒤로가기로 되짚어야 하면 `push`, 오버레이 개폐처럼 되짚을 필요가
  없는 일시 상태면 `replace`.
- URL로 상태를 관리하는 것과, 그 전환을 히스토리에 남길지는 별개의 결정이다.

---

## 2026-09-25 · 홈 스크롤바가 중앙 정렬을 왼쪽으로 밀고, 스크롤바 모양도 투박함

### 1. 증상

- 홈처럼 콘텐츠가 길어 스크롤이 생기는 페이지에 진입하면, 데스크톱 브라우저가
  **자리를 차지하는(classic) 스크롤바**를 그려 뷰포트 폭을 ~15px 깎는다.
- `layout.tsx`의 앱 컬럼이 `mx-auto`로 중앙 정렬되는데, 스크롤바가 폭을 먹는 만큼
  중앙이 왼쪽으로 밀린다. 스크롤이 안 생기는 짧은 페이지와 좌우가 어긋나 보임.

### 2. 원인

- 스크롤은 뷰포트(`html`)에서 일어나고, Windows Chrome 등은 오버레이가 아니라
  레이아웃 폭을 차지하는 스크롤바를 쓴다. 스크롤 유무에 따라 뷰포트 콘텐츠 폭이
  달라지니 `mx-auto` 중앙이 페이지마다 다른 위치가 된다.
- 실제 모바일 기기는 오버레이 스크롤바(폭 0)라 이 현상이 없다 → **데스크톱 미리보기
  한정** 문제.

### 3. 해결

`src/app/globals.css`의 `html` 규칙에 두 가지를 적용.

1. **중앙 밀림 방지** — `scrollbar-gutter: stable both-edges`.
   스크롤바 자리(거터)를 콘텐츠 박스 바깥에 **항상** 예약하고, 반대쪽에도 대칭
   거터를 둔다. 스크롤 유무·페이지와 관계없이 앱 컬럼이 같은 위치에 중앙 정렬되고,
   스크롤바가 콘텐츠 영역을 침범하지 않는다.

2. **스크롤바 모양 정리** — `track`·`button` 없이 `thumb`만 노출.

   ```css
   html {
     scrollbar-gutter: stable both-edges;
     /* Firefox */
     scrollbar-width: thin;
     scrollbar-color: var(--input) transparent;
   }
   /* webkit(Chrome/Safari) */
   ::-webkit-scrollbar { width: 8px; height: 8px; }
   ::-webkit-scrollbar-track,
   ::-webkit-scrollbar-button,
   ::-webkit-scrollbar-corner { background: transparent; }
   ::-webkit-scrollbar-thumb {
     background: var(--input);        /* #ffffff26, 하드코딩 대신 토큰 */
     background-clip: padding-box;    /* 투명 테두리 + padding-box로 트랙 안에 */
     border: 2px solid transparent;   /* 떠 있는 얇은 알약처럼 보이게 */
     border-radius: 9999px;
   }
   ```

   `track`/`button`은 접근성 요소가 아니라(키보드 방향키·휠 스크롤과 무관) 없애도
   접근성 저하 없음.

### 4. 트레이드오프 / 미채택

- **자동 숨김(스크롤 중에만 표시)은 하지 않음.** 데스크톱 네이티브로는 제어 불가라
  커스텀 오버레이 스크롤바(JS)가 필요한데, 그 이득은 데스크톱 미리보기에서만 있고
  모바일은 이미 네이티브가 오버레이+자동숨김이라 비용 대비 실익이 낮아 보류.
- `scrollbar-gutter`로 데스크톱엔 양쪽에 얇은 대칭 여백이 생기지만 대칭이라
  어긋나 보이지 않고, 넓은 화면은 어차피 양옆이 검은 거터라 무해.

### 5. 검증

- `eslint` 통과 (CSS만 변경, typecheck 대상 없음).
- 데스크톱에서 홈·짧은 페이지 간 중앙 정렬 어긋남 없음, thumb만 노출되는지 확인 필요.

### 6. 교훈

- **"스크롤바 때문에 중앙이 밀린다"는 `scrollbar-gutter: stable both-edges` 한 줄로 해결.**
  거터를 항상·대칭으로 예약해 스크롤 유무와 무관하게 레이아웃을 고정한다.
- 스크롤바 폭을 줄이면 `scrollbar-gutter`가 예약하는 거터도 같이 얇아진다(연동).
- webkit(`::-webkit-scrollbar-*`)과 Firefox(`scrollbar-width`/`scrollbar-color`)는
  문법이 달라 크로스브라우저로 맞추려면 둘 다 써야 한다.

---

## 2026-09-27 · Phase 2 Todo A — 토큰을 어디에 두고 어떻게 붙일 것인가

### 1. 과제 / 증상

- Phase 1의 인증은 `src/shared/mocks/auth.ts`의 `MOCK_AUTH_STATE` 상수 하나를
  `"guest"` / `"user"`로 바꿔 화면을 분기하는 스위치였다. 이걸 실 API
  (`GET /api/users/me`)로 바꿔야 한다.
- 동시에 phase.md Todo A는 `proxy.ts`로 `/notification`, `/password/update`를
  가드하라고 요구한다.
- 이 두 요구가 **토큰 저장 위치를 결정한다.** 먼저 결정하지 않으면 뒤의 Todo B~I가
  전부 잘못된 토대 위에 올라간다.

### 2. 진단 — 계약서 대신 실서버를 찔러봄

`v3/api-docs`만 읽고 시작하면 틀린 전제를 갖게 된다. `curl`로 직접 확인한 결과:

```bash
# 401 — Spring Security 진입점
curl -i localhost:8080/api/users/me
#   Content-Type: application/json
#   {"message":"인증이 필요합니다."}

# 400 — ControllerAdvice
curl -i -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"","password":""}'
#   Content-Type: text/plain;charset=UTF-8
#   이메일은 필수입니다.

# 로그인 실패
curl -i -X POST localhost:8080/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"nobody@example.com","password":"wrongpass1"}'
#   HTTP/1.1 500   ← 401이 아니다

# CORS preflight
curl -i -X OPTIONS localhost:8080/api/users/me -H 'Origin: http://localhost:3000' \
  -H 'Access-Control-Request-Method: GET' -H 'Access-Control-Request-Headers: authorization'
#   Access-Control-Allow-Origin: http://localhost:3000
#   Access-Control-Allow-Headers: authorization
#   Access-Control-Allow-Credentials: true
```

여기서 나온 사실 세 가지:

1. **에러 포맷이 두 가지로 섞여 있다.** `application/json`의 `{message}`와
   `text/plain` 원문. 정규화 코드가 둘 다 처리해야 한다.
2. **로그인 실패가 401이 아니라 500이다** (백엔드 버그).
3. **CORS는 문제가 아니다.** phase.md의 초안 근거였던 "CORS가 회피된다"는 현재
   백엔드에 해당하지 않는다. `authorization` 헤더도 통과한다.

### 3. 원인 — 왜 localStorage가 불가능한가

`localStorage`에 토큰을 두는 흔한 방식은 이 프로젝트에서 **Todo A를 완성할 수 없다.**

- `proxy.ts`는 **서버에서 실행된다.** `localStorage`를 읽을 수 없다.
  → `/notification` 가드를 구현할 방법이 아예 없다.
- 부수적으로 `localStorage`의 토큰은 XSS로 읽힌다. 리프레시 토큰은 특히 치명적.

즉 CORS가 아니라 **"서버가 읽을 수 있어야 한다"**가 쿠키를 선택하는 진짜 이유다.
가드 요구사항이 저장 위치를 강제한 것이다.

그리고 쿠키를 httpOnly로 두면 새 문제가 생긴다:

- 토큰은 httpOnly 쿠키에 있어 **브라우저 JS가 읽을 수 없다** (그게 목적)
- 백엔드는 `Authorization: Bearer` **헤더**를 요구한다 (쿠키를 안 읽는다)
- → 쿠키에서 꺼내 헤더로 옮겨 담는 주체가 필요하고, 그건 서버 코드만 할 수 있다

### 4. 해결

**(a) 캐치올 프록시 — `src/app/api/backend/[...path]/route.ts`**

`/api/backend/<백엔드 경로>`로 들어온 요청을 백엔드로 전달하며 세 가지를 한다.

1. 쿠키의 `sm_at`을 `Authorization: Bearer`로 옮겨 붙인다
2. 401이면 `sm_rt`로 갱신하고 원 요청을 **1회만** 재시도
3. 갱신도 실패하면 쿠키를 지우고 401 반환

캐치올(`[...path]`)로 만든 이유: 엔드포인트마다 라우트 파일을 만들면 파일 9개 이상에
**"토큰 붙이고 401이면 갱신" 코드가 복붙**된다. 캐치올이면 Todo B~I에서 엔드포인트가
늘어도 **추가 파일 0개**이고 갱신 로직이 한 곳에만 존재한다.

**(b) 쿠키 설계**

| 쿠키 | 값 | maxAge |
| --- | --- | --- |
| `sm_at` | accessToken | 없음(세션 쿠키) |
| `sm_rt` | refreshToken | env `AUTH_REFRESH_MAX_AGE_SECONDS`, 기본 14일 |

- `sm_at`에 `maxAge`를 두지 않은 이유: 만료 판정의 유일한 근거는 백엔드의 401이다.
  쿠키에 수명을 적어 두면 두 개의 진실이 생기고 서로 어긋난다.
- **로그인 판정은 `sm_rt`로 한다.** `sm_at`으로 판정하면 access가 만료됐을 뿐
  갱신으로 살아날 세션까지 로그아웃 처리한다.

**(c) 토큰이 오가는 경로는 프록시에서 차단**

`BLOCKED_PATHS`에 `api/auth/login`, `api/auth/refresh`, `api/auth/oauth/exchange`,
`api/auth/logout`. 이유는 두 가지로 다르다.

- 앞의 셋: 응답 본문에 토큰(`TokenResponse`)이 담긴다. 프록시가 응답을 그대로
  넘기므로, 안 막으면 누가 `fetch("/api/backend/api/auth/login")`을 호출해
  **토큰을 JSON으로 읽을 수 있다.** httpOnly로 숨긴 의미가 사라진다.
- `logout`: 통과시키면 백엔드 세션만 끊기고 **쿠키는 남는다.** 로그인처럼 보이지만
  모든 요청이 401이 되는 상태. (이건 처음 구현에서 빠뜨렸다 — 5번 참조)

추가로 `path[0] !== "api"`를 걸어 `swagger-ui` 등 `/api/*` 밖의 백엔드 경로는
프록시하지 않는다.

**(d) 동시 refresh 합치기 — `backend.server.ts`**

홈처럼 쿼리가 여러 개 동시에 뜨면 각각 401을 받아 refresh가 동시에 여러 번 나간다.
백엔드가 리프레시 토큰을 회전시키면 **서로를 무효화해 로그아웃된다.** 모듈 레벨
`Map<refreshToken, Promise>`로 같은 토큰의 요청을 진행 중인 하나로 합쳤다.

**(e) 500에는 갱신하지 않는다**

2번에서 로그인 실패가 500으로 온다는 걸 알았으므로, 재시도 조건을
`response.status !== 401` 로 명시해 **백엔드가 401을 준 경우에만** 갱신한다.
나중에 백엔드가 로그인 실패를 401로 고쳐도 엉뚱하게 갱신이 돌지 않도록 하는
방어이기도 하다.

### 5. 구현 중 걸린 문제들

**(1) `authorizationHeader`의 유니온 타입 — TS2322**

```ts
// 삼항의 두 갈래가 서로 다른 타입이 되어 HeadersInit에 대입 불가
function authorizationHeader(accessToken: string | undefined) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}
//   Type '{ Authorization?: undefined; }' is not assignable to type 'Record<string, string>'
//   → Authorization 프로퍼티가 index signature와 호환되지 않음
//     ('undefined'는 'string'에 대입할 수 없음)
```

반환 타입을 `Record<string, string>`으로 명시하면 두 갈래가 같은 타입으로 좁혀진다.

**(2) `api/auth/logout`을 차단 목록에서 빠뜨림**

처음엔 "응답 본문에 토큰이 담기는 경로"만 막았다. `logout`은 응답에 토큰이 없으니
기준에서 벗어났는데, 통과시키면 4-(c)의 쿠키/세션 불일치가 생긴다. 차단 기준을
"응답에 토큰이 있는 경로"에서 **"세션 쿠키를 다루는 경로"**로 바꿔 잡았다.

```bash
# 수정 전: 401 (백엔드까지 그대로 전달됨)
# 수정 후: 404
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  localhost:3000/api/backend/api/auth/logout
```

**(3) `.gitignore`의 `.env*`가 예제 파일까지 무시**

phase.md는 "새 환경 변수를 예제 파일에 추가"를 요구하는데, `.gitignore`의 `.env*`가
`.env.local.example`까지 잡아서 **커밋이 불가능한 상태**였다. 즉 예제 파일이 존재해도
아무 역할을 못 한다.

```bash
git check-ignore -v .env.local.example
#   .gitignore:34:.env*   .env.local.example
```

`!.env.local.example` 부정 패턴을 추가해 해결.

**(4) `phase.md` 멀티라인 치환 실패 — CRLF**

`phase.md`는 디스크에서 CRLF인데(`.gitattributes`는 `eol=lf`라 저장소에서만 LF)
스크립트가 `\n`으로 패턴을 만들어 여러 줄 매칭이 전부 실패했다. 한 줄 치환은
성공하고 여러 줄만 실패해서 원인이 늦게 보였다. LF로 정규화 → 치환 → 원래
줄바꿈으로 복원하는 순서로 처리.

### 6. 검증

`curl`로 분기별 확인 (dev 서버 + 실제 백엔드):

| 시나리오 | 기대 | 결과 |
| --- | --- | --- |
| 게스트 `GET /api/backend/api/users/me` | 401 | 401 |
| 가짜 `sm_at` + 가짜 `sm_rt` | 갱신 시도 → 실패 → 쿠키 삭제 + 401 | `Max-Age=0` 2개 + 401 |
| 가짜 `sm_at`만 (`sm_rt` 없음) | 갱신 시도 안 함, Set-Cookie 없음 | 일치 |
| `/api/backend/api/auth/{login,refresh,oauth/exchange,logout}` | 404 | 404 |
| `/api/backend/swagger-ui/index.html` | 404 | 404 |
| 게스트 `/notification`, `/password/update` | `/login` 리다이렉트 | 307 |
| `sm_rt` 있을 때 `/notification` | 통과 | 200 |
| `/wishlist`, `/password/find` (가드 대상 아님) | 200 | 200 |
| 로그인 실패 통과 | 500 통과 + **Set-Cookie 없음** | 일치 |
| 로그아웃 (토큰 없어도) | 204 + 쿠키 삭제 | 일치 |
| `search?page=0&size=3` | Page 객체, 1703건 | 일치 |

- `typecheck`, `lint` 통과. 전체 페이지 200 (`/notification`만 307).
- 페이징은 `page`/`size` **개별 파라미터**로 동작함을 확인 (계약의 `pageable` 객체
  표기보다 phase.md 쪽이 맞다).

### 7. 미검증 / 미해결

- **로그인 성공 경로 전체가 미검증.** `POST /api/users/signup`이 이메일 인증을
  선행 요구하고(`이메일 인증이 필요합니다.`), 인증 메일을 받을 수 없어 테스트 계정을
  만들 수 없다. `/actuator`, `/h2-console`도 전부 401로 막혀 있어 우회 경로가 없다.
  → refresh 성공 분기, `users/me`의 로그인 상태 응답이 확인되지 않았다.
- **리프레시 토큰 회전 여부 불명.** 회전한다면 4-(d)의 합치기가 필수이고,
  안 한다면 있어도 무해하다. 실제 토큰으로 확인 필요.
- **리프레시 토큰 실제 수명이 계약에 없다.** `sm_rt`의 `maxAge`를 env로 빼고 14일을
  기본값으로 두었다.
- **로그인 실패 500은 백엔드 수정 필요** (401이 맞다).
- `GET /api/performances/search?genres=연극`이 **500**이다. 프록시 경유가 아니라
  백엔드 직접 호출도 같으므로 백엔드 문제. 실제 `genre` 값은 `"클래식·국악"`처럼
  나오므로 Todo E의 카테고리 매핑에서 다시 봐야 한다.

### 8. 교훈

- **계약서(`v3/api-docs`)는 에러 응답을 알려주지 않는다.** 에러 포맷, 실패 시
  상태 코드, CORS 허용 범위는 실서버를 찔러봐야 나온다. 이번엔 그 덕에 "로그인
  실패 500"과 "에러 포맷 2종"을 설계 전에 잡았다.
- **저장 위치는 취향이 아니라 요구사항이 결정한다.** "`proxy.ts`로 가드한다"는
  한 줄이 "서버가 읽을 수 있어야 한다"를 강제하고, 그게 곧 쿠키를 지목한다.
- **httpOnly를 도입하면 "토큰을 헤더로 옮겨 담는 서버 지점"이 반드시 하나 생긴다.**
  그 지점을 캐치올 하나로 모으면 갱신 로직도 자연히 한 곳에 모인다.
- **프록시를 만들면 "프록시를 타서는 안 되는 경로"를 같이 정의해야 한다.** 그러지
  않으면 프록시가 우회로가 된다. 기준은 "응답에 토큰이 있는지"가 아니라
  "세션 상태를 바꾸는지"다.

## 2026-09-29 · 하트를 눌러도 채워지는 애니메이션이 따로 논다 → 낙관적 업데이트

### 1. 증상

찜 하트 버튼을 누르면 API 요청은 정상인데, 하트가 채워지는 동작이 클릭과
이어지지 않는다. 눌렀는데 한참 뒤에 채워지거나, 중앙 하트 버스트만 먼저 날아가고
정작 버튼 안은 나중에 채워진다.

### 2. 진단 — 두 동작이 서로 다른 사건이었다

`HeartButton`을 뜯어보니 원인이 셋이었다.

```tsx
// 이전
const handleClick = () => {
  if (!isLiked) burst();   // (a) 클릭 즉시 발사
  onToggle();              // (b) 요청 시작
};
...
{isLiked ? <HeartBoldIcon /> : <HeartLinearIcon />}   // (c) 즉시 스왑
```

- **(a) 버스트는 클릭 시점**에 재생된다. `HeartBurst`는 `BURST_DELAY = 0.3s`
  뒤에 뜬다.
- **(c) 채워짐은 `isLiked` prop**에 달려 있는데, 이 값은
  `POST → invalidate → refetch` **왕복 2번**이 끝나야 바뀐다.
- 두 시점이 서로 무관하니 네트워크 속도에 따라 순서까지 뒤집힌다. 로컬처럼 빠르면
  하트가 먼저 채워지고 0.3초 뒤 버스트가 뜬금없이 뜬다.
- 게다가 (c)는 아이콘 **교체**라 "채워지는 과정"이라는 게 애초에 없었다.
- 부수적으로, 요청이 실패해도 (a)는 이미 재생된 뒤였다.

### 3. 1차 수정 — 버스트를 상태 변화에 묶음

클릭이 아니라 `isLiked`가 `false → true`로 바뀌는 순간에 재생하도록 바꿨다.
두 동작이 **같은 값에서 파생**되므로 어긋날 수가 없다.

```tsx
const [lastLiked, setLastLiked] = useState(isLiked);
if (isLiked !== lastLiked) {
  setLastLiked(isLiked);
  if (isLiked) burst();
}
```

렌더 중 상태 감지는 `HeartBurst`가 이미 쓰던 방식을 따랐다(effect 금지 규칙).
채워짐도 아이콘을 겹쳐 두고 `opacity`/`scale`로 0.25초 애니메이션을 줬다.

다만 이것만으로는 **"누르고 나서 서버 왕복 2번을 기다린다"**는 사실 자체가 안 바뀐다.

### 4. 낙관적 업데이트가 가능한가 — 계약 조사

되돌아보니 진짜 문제는 타이밍이 아니라 **"화면이 서버 확정을 기다린다"**였다.
낙관적 업데이트를 검토했더니 막는 게 셋이었다.

| 막는 것 | 내용 |
|---|---|
| 계약 문구 | `POST` 설명에 "프론트가 낙관적 업데이트를 쓰지 않으므로 409를 성공으로 뭉개지 않는다" |
| `DELETE` 404 모호 | "찜 내역 기준으로 조회하므로 **공연이 없을 때도 같은 응답**" → 되돌려야 할 실패와 안 되돌려도 될 실패를 구분 불가 |
| `POST` 201 본문 없음 | 찜 목록에 끼워 넣을 `WishlistItemResponse`를 만들 수 없음 |

세 번째가 특히 걸렸다. 목록 항목을 만들려면 `status`와 `wishedAt`이 필요한데
디테일/지도가 쥔 `PerformanceResponse`에는 둘 다 없다. 게다가 표기가 다르다.

```
PerformanceResponse.state   = "공연예정"                    ← 한글 문자열
WishlistItemResponse.status = UPCOMING | ONGOING | ENDED    ← enum
```

프론트가 한글 → enum 매핑을 **추측**해야 하는데, 이건 Data Policy의
"응답에 없는 필드를 지어내지 말 것"에 정면으로 걸린다.

### 5. 백엔드에 요청 → 반영 결과

위 3건 + `PerformanceResponse.status` 추가(4번)를 백엔드에 요청했다. 결과:

| 요청 | 결과 |
|---|---|
| 1. "낙관적 업데이트 금지"가 제약인지 | **해제.** 설명이 통째로 바뀌어 "409는 되돌리지 않아도 된다. 되돌려야 하는 건 404와 401뿐"이라고 명시됨 |
| 2. `DELETE` 404 구분 | **반영.** `wishlist-not-found`(되돌리지 않음) / `performance-not-found`(되돌림)로 `type` 분리 |
| 3. `POST` 201 본문 | **반영.** `WishlistItemResponse`를 그대로 내려줌 |
| 4. `PerformanceResponse.status` | **미반영.** 여전히 `state` 한글 문자열 |

4번이 미반영이지만 3번이 해결돼서 막히지 않는다. 목록 항목이 필요하면 서버가
직접 주므로 한글 → enum 추측이 필요 없어졌다.

### 6. 구현에서 걸린 것 — `ApiError`가 `type`을 버리고 있었다

2번을 쓰려는 순간 막혔다. 같은 404를 구분하려면 `type`이 필요한데
`toApiError`가 `detail`만 꺼내고 `type`을 버리고 있었다.

```ts
// 이전
return new ApiError(response.status, parsed.detail);   // type 유실
```

한국어 `detail`로 분기할 수도 있지만 문구가 바뀌면 깨진다. `type`은 기계용
식별자라 이쪽이 맞다. `ApiError`에 `type`을 추가하고 `hasErrorType()` 헬퍼를 뒀다.

**프록시가 `type`을 보존하는지 확인**했다. 앱은 항상 프록시를 타므로 여기서
잘리면 무용지물이다.

```
GET /api/wishlists  백엔드 직접 → 401 type=.../errors/unauthorized
                    프록시 경유 → 401 type=.../errors/unauthorized
                    content-type=application/problem+json;charset=UTF-8 (동일)
```

보존된다. `POST`/`DELETE` 찜 경로도 동일하게 확인했다.

### 7. 최종 구조

`onMutate`에서 즉시 뒤집고, 실패하면 `onError`에서 스냅샷으로 되돌리고,
`onSettled`에서 서버 기준으로 재조회한다.

| 쿼리 | 낙관적 처리 |
|---|---|
| `["detail", id]` | `isWished` 뒤집기 |
| `["map","theatres",id,"performances"]` | 해당 항목 `isWished` 뒤집기 |
| `["wishlist"]` | **취소일 때만** 목록에서 제거 |
| `["calendar"]` | 안 건드림 (무효화만) |

**찜 "추가" 시 목록에 끼워 넣지 않는 이유**: 서버 정렬이
"미종료 먼저 · 종료 나중 · 그룹 내 최근 찜순"이라 올바른 위치를 클라에서 재현해야
하고, `hasNext`만 있는 Slice라 페이지 경계까지 맞춰야 한다. 틀린 위치에 넣는
위험이 재조회 한 번 아끼는 이득보다 크다. 추가하는 화면(디테일·지도)에서는 이
목록이 보이지도 않아 체감 차이가 없다. 3번 덕에 **가능은 하다** — 필요해지면
`POST` 응답 본문을 그대로 쓰면 된다.

되돌리지 않는 실패 2종:

```ts
if (hasErrorType(error, "wishlist-not-found")) return;   // DELETE: 이미 찜 없음
if (isApiError(error) && error.status === 409) return;   // POST: 이미 찜함
```

`onMutate`에서 `cancelQueries`를 먼저 부른다. 안 그러면 진행 중이던 재조회가
돌아와 낙관적 값을 덮어써 하트가 깜빡인다.

### 8. 실계정 검증 결과

오너에게 계정을 받아 프록시(`localhost:3000/api/backend/*`)를 통해 전 구간을
호출했다. 로그인은 전용 라우트로 `204` + `sm_at`/`sm_rt` 쿠키가 정상 발급된다.

| 검증 | 결과 |
|---|---|
| `POST` → 201, 본문에 `WishlistItemResponse` | ✅ 9개 필드 전부 옴 |
| 중복 `POST` → 409 `wishlist-already-exists` | ✅ |
| 없는 공연 `POST` → 404 `performance-not-found` | ✅ |
| `DELETE` → 204 | ✅ |
| 중복 `DELETE` → 404 `wishlist-not-found` | ✅ |
| 없는 공연 `DELETE` → 404 `performance-not-found` | ✅ |
| 추가 후 찜 목록에 반영 | ✅ 3 → 4건 |
| 추가 후 `GET /api/performances/{id}`의 `isWished` | ✅ true |
| 취소 후 목록/상세 반영 | ✅ 3건 / false |
| 정렬: 미종료 먼저 · 종료 나중 | ✅ |
| 정렬: 그룹 내 최근 찜순 | ✅ |
| 추가 후 **지도 극장별 목록**의 `isWished` | ❌ → ✅ (9절, 백엔드 수정 후 재검증) |

되돌리지 않아도 되는 실패 2종(`409`, `wishlist-not-found`)이 계약대로 구분돼
내려오는 것까지 실응답으로 확인했다.

### 9. 발견한 백엔드 버그 — `GET /api/theatres/{id}/performances`의 `isWished`가 항상 false (해결됨)

찜된 공연 3건을 각각 상세와 극장별 목록에서 비교했더니 전부 어긋난다.

```
공연 697: 상세 isWished=true | 지도목록 isWished=false (극장 400)
공연 1632: 상세 isWished=true | 지도목록 isWished=false (극장 682)
공연  659: 상세 isWished=true | 지도목록 isWished=false (극장 383)

극장 408 공연목록 isWished 분포
  로그인 상태: [false]
  비로그인   : [false]      ← 토큰 유무와 무관하게 동일
```

이 엔드포인트는 `PerformanceResponse`(= `isWished` 포함)를 돌려주는데, 로그인
사용자의 찜 내역을 반영하지 않고 항상 `false`를 채운다. 계약에 `security`
선언이 없어 공개 조회인 건 맞지만, `GET /api/performances/{id}`는 같은 공개
조회이면서도 토큰이 있으면 읽어서 `isWished`를 채운다. **두 엔드포인트의 동작이
다르다.**

영향: 지도 시트에서 하트를 누르면 낙관적으로 채워졌다가, `onSettled`의 재조회가
`false`를 물고 와서 **다시 꺼진다.** 실패한 것처럼 보인다. 이미 찜한 공연도 시트를
열면 빈 하트로 보인다.

이건 원래 있던 버그다. Phase 1의 `venue-bottom-sheet`가 `overriddenIds`라는
화면 전용 토글 상태를 들고 있었는데, 그게 이 문제를 가리고 있었다. 실 API로
바꾸면서 드러났다.

프론트에서 막으려면 이 쿼리만 재조회에서 빼야 하는데, 그건 버그를 다시 가리는
것(= `overriddenIds`가 하던 일)이라 하지 않고 백엔드에 넘겼다.

**→ 백엔드 수정 완료. 재검증 결과 프론트 수정은 필요 없었다.**

```
프록시 경유(토큰 있음)  공연 239 isWished=true    ← 수정 전 false
백엔드 직접(토큰 없음)  공연 239 isWished=false   ← 선택적 인증 정상
상세(true) == 지도목록(true) 일치
```

백엔드가 "이 요청에도 `Authorization` 헤더를 실어야 한다"고 알려 왔는데, 우리
프록시(`app/api/backend/[...path]`)는 **캐치올이라 `/api/*` 전 경로에 쿠키의
토큰을 이미 붙이고 있었다.** 경로별로 헤더를 붙이는 구조였다면 여기서 한 번 더
막혔을 것이다. 응답 키가 `isWished`인 것(`wished` 아님)도 실응답으로 확인했다.

찜 추가 → 목록 → 취소 → 반영 전 구간을 다시 돌려 **14개 항목 전부 통과**했다.

### 10. 미해결

- **`state`로 공연 상태를 판단하지 말 것(백엔드 요청).** 로컬 테스트 데이터에
  KOPIS `state`가 없어 `null`로 오는 경우가 있고, `feat/performance-response-openrun`
  이 머지되면 `PerformanceStatus` enum으로 바뀐다. 다만 현재 로컬 데이터 194건
  (극장별 94 + 검색 100)을 훑어보면 전부 `"공연예정"`/`"공연중"`/`"공연완료"`로
  **null이 재현되지 않는다.** 그래도 타입은 `state: string`(non-nullable)이라
  null이 오면 거짓말이 된다.
  영향 지점은 `detail-format.ts`의 `formatPerformanceStateCaption`이다. `"공연완료"`
  /`"공연중"`이 아니면 전부 `"{M}월 {D}일 오픈"`으로 떨어지므로, `state`가 null이면
  공연 중·종료인 공연도 "오픈 예정"으로 잘못 표기된다. 터지진 않고 문구만 틀린다.
  → Todo F 범위라 이번엔 건드리지 않았다. enum 전환 때 같이 정리해야 한다.
- `PerformanceResponse.status`(요청 4번)는 여전히 미반영이다. 지금은 필요 없지만,
  나중에 목록 항목을 클라에서 만들 일이 생기면 다시 필요해진다.
  위 `state` enum 전환이 이걸 대신할 가능성이 있다.
- 낙관적 반영 후 롤백되면 버스트는 이미 재생된 뒤다. 낙관적 UI의 성질이라
  그대로 뒀다.
- 브라우저에서 눈으로 본 검증은 아직 없다. 위 표는 전부 API 레벨 호출 결과다.

### 11. 교훈

- **"애니메이션이 안 이어진다"가 애니메이션 문제가 아니었다.** 두 동작이 서로
  다른 사건(클릭 / 서버 응답)에서 출발한 게 원인이었다. 같은 값에서 파생시키면
  타이밍을 맞출 필요 자체가 없어진다.
- **계약의 제약처럼 보이는 문장이 사실은 설명일 수 있다.** "프론트가 낙관적
  업데이트를 쓰지 않으므로"는 금지가 아니라 전제였고, 물어보니 전제가 바뀌었다.
  혼자 해석하고 포기하지 말고 확인할 것.
- **낙관적 업데이트의 난이도는 "실패를 구분할 수 있는가"가 정한다.** 상태 코드만으로
  부족하면 `problem+json`의 `type`처럼 기계용 식별자가 필요하다. 한국어 메시지로
  분기하지 말 것.
- **에러를 정규화하는 지점에서 필드를 버리면 나중에 분기할 수단이 사라진다.**
  `toApiError`가 `type`을 버린 탓에 계약이 준 구분을 못 쓸 뻔했다.
- **낙관적 업데이트는 "지금 보이는 화면"에만 걸면 충분하다.** 안 보이는 목록까지
  손으로 맞추려 들면 서버 정렬을 재현하게 되고, 그 순간 틀릴 여지가 생긴다.

## 2026-09-29 · 지도 탭을 거치지 않으면 상세 페이지 공연장 지도가 뜨지 않는다

### 1. 증상

상세 페이지(`/detail/:id`)의 공연장 미니 지도가 회색 박스로만 남는다. 다만
`/map`을 먼저 들렀다가 상세로 이동하면 정상적으로 뜬다.

에러 토스트도, 콘솔 에러도, 실패 플레이스홀더도 없다. 그냥 아무 일도 일어나지
않는다. "가끔 된다"처럼 보여서 처음에는 타이밍 문제로 의심했다.

### 2. 진단

`naver` 전역을 만드는 `<Script>`가 어디에 있는지부터 훑었다.

```bash
grep -rn "buildMapScriptUrl\|next/script\|oapi.map" src/
# src/app/(tabs)/map/_components/map-view.tsx:4   import Script from "next/script";
# src/app/(tabs)/map/_components/map-view.tsx:248 src={buildMapScriptUrl(clientId)}
# (그 외 없음)

cat "src/app/(tabs)/layout.tsx"   # BottomNav만 있고 Script 없음
```

**SDK를 로드하는 지점은 `map-view.tsx` 한 곳뿐이었다.** 즉 `/map`이 렌더돼야만
`naver`가 생긴다.

그런데 `venue-mini-map.tsx`의 주석은 이렇게 적혀 있었다.

```
(tabs) 셸에서 로드한 네이버 지도 SDK가 준비되면 단일 마커 지도를 만든다.
```

**주석이 사실과 달랐다.** 예전에 셸에 있던 Script가 `map-view`로 옮겨지면서
주석만 남은 것으로 보인다. 코드를 안 읽고 주석만 믿었으면 한참 헤맬 자리였다.

### 3. 원인

`venue-mini-map`은 자기가 SDK를 로드하지 않고, 남이 로드해 주기를 기다리고
있었다.

```tsx
// 탭 셸에서 로드한 SDK가 준비될 때까지 대기한다(최대 10초).
useEffect(() => {
  if (scriptLoaded || !NAVER_MAP_CLIENT_ID) return;
  let tries = 0;
  const id = setInterval(() => {
    if (typeof naver !== "undefined" && naver.maps) {
      clearInterval(id);
      setScriptLoaded(true);
    } else if (++tries > 100) {
      clearInterval(id);   // ← 10초 뒤 조용히 포기. 아무것도 안 알린다.
    }
  }, 100);
  return () => clearInterval(id);
}, [scriptLoaded]);
```

아무도 로드해 주지 않으니 100번 폴링하고 끝난다. 실패 처리가 없어서 증상이
"조용한 회색 박스"로 나타났다.

### 4. "첫 진입부터 받으면 되지 않나" — 비용 먼저 측정

루트 레이아웃에서 미리 받는 방안을 검토했다. 감이 아니라 숫자를 봤다.

```js
const r = await fetch("https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=" + id);
const t = await r.text();
zlib.gzipSync(t).length          // 91KB
zlib.brotliCompressSync(t).length // 76KB
Buffer.byteLength(t)             // 326KB
```

| | 크기 |
| --- | --- |
| 원본 | 326KB |
| gzip | 91KB |
| brotli | 76KB |

`NEXT_PUBLIC_NAVER_MAP_STYLE_ID`가 비어 있어 `submodules=gl`은 안 붙는다
(붙여도 크기는 같았다).

91KB 자체가 치명적이진 않다. 다만 지도를 쓰는 화면은 `/map`과 `/detail/:id`
둘뿐인데, 루트에 올리면 홈·검색·찜·캘린더·설정이 전부 이 비용을 낸다.
다운로드보다 모바일에서 326KB를 파싱·실행하는 쪽이 더 아프고, 초기화되면
`nelo.navercorp.com`으로 로깅 요청까지 나간다.

**결론: 문제는 "언제 받느냐"가 아니라 "받는 곳이 한 군데뿐"이었다.** 로드 지점을
늘리면 루트에 올릴 이유가 없어진다.

### 5. 해결

로더를 공용 컴포넌트로 빼고, 지도를 그리는 화면이 각자 렌더하게 했다.
`src`가 같으면 `next/script`가 실제 내려받기를 한 번만 한다.

```tsx
// src/app/(tabs)/map/_components/naver-map-script.tsx
export function NaverMapScript({ id, onLoaded, onError }: NaverMapScriptProps) {
  if (!NAVER_MAP_CLIENT_ID) return null;

  const notifyIfReady = () => {
    if (typeof naver !== "undefined" && naver.maps) onLoaded();
  };

  return (
    <Script
      id={id}
      src={buildMapScriptUrl(NAVER_MAP_CLIENT_ID)}
      strategy="afterInteractive"
      onReady={notifyIfReady}
      onLoad={notifyIfReady}
      onError={onError}
    />
  );
}
```

- `map-view.tsx` → `id="naver-maps-sdk-map"`
- `venue-mini-map.tsx` → `id="naver-maps-sdk-detail"` (10초 폴링 제거)

곁들여 정리한 것:

- 상세에도 로드 실패 시 플레이스홀더를 붙였다. 전에는 실패해도 표시가 없었다.
- 로더가 키를 직접 읽게 되면서 쓰이지 않게 된 `MapView.clientId` prop 제거.
- 틀린 주석 수정.

### 6. 구현에서 걸린 것 — `next/script`의 캐시 키 함정

처음엔 두 화면이 같은 `id="naver-maps-sdk"`를 쓰려 했다. 소스를 열어보고
그만뒀다.

```js
// node_modules/next/dist/client/script.js
const cacheKey = id || src;

if (cacheKey && LoadCache.has(cacheKey)) return;

if (ScriptCache.has(src)) {
    LoadCache.add(cacheKey);              // ← 로드가 끝나기 전에 키부터 등록
    ScriptCache.get(src).then(onLoad, onError);
    return;
}
```

그리고 onReady 이펙트는 `LoadCache`만 본다.

```js
if (onReady && cacheKey && LoadCache.has(cacheKey)) {
    onReady();
}
```

`cacheKey`가 `id || src`라, **같은 id를 공유하면** 한쪽이 아직 내려받는 중일 때
다른 쪽이 마운트되면서 `LoadCache`에 키가 먼저 들어간다. 그 뒤 onReady 이펙트가
`LoadCache.has()`만 보고 **로드 완료 전에 `onReady`를 호출**한다. 그러면 `naver`가
없는 상태로 "준비 완료" 처리돼, 고치려던 증상과 똑같이 조용히 실패한다.

대응 세 가지를 겹쳤다.

1. **id를 화면별로 분리**(`-map` / `-detail`). 캐시 키가 갈리면 뒤늦게 마운트된
   쪽은 `ScriptCache.get(src).then(onLoad)` 경로를 타므로, 프로미스가 resolve될
   때(= 실제 로드 완료) 콜백을 받는다.
2. **`onLoad`와 `onReady`를 둘 다 받는다.** 먼저 로드한 인스턴스는 `onReady`,
   나중에 붙은 인스턴스는 `onLoad`가 온다. 어느 쪽이 올지는 마운트 시점이 정한다.
3. **알리기 전에 `naver.maps` 존재를 확인한다.** 콜백이 중복으로 와도 무해하고,
   혹시 이른 호출이 와도 잘못된 상태로 넘어가지 않는다.

### 7. 검증

브라우저 없이는 확인이 안 된다. 상세 화면이 클라이언트 렌더라 SSR HTML에는
지도 컨테이너도, `afterInteractive`로 주입되는 script 태그도 없다.

```bash
curl -s localhost:3000/detail/1643 | grep -c data-naver-map   # 0 (판단 불가)
```

Playwright/Puppeteer는 없고 의존성을 늘리고 싶지 않아, 설치된 Chrome을
헤드리스로 띄우고 CDP로 직접 붙었다. Node 24는 `WebSocket`이 내장이라 추가 설치가
필요 없다.

```bash
chrome.exe --headless=new --remote-debugging-port=9222 --user-data-dir=<temp>
```

```js
const t = await (await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
// Network.enable 로 maps.js 요청을 세고,
// Runtime.evaluate 로 naver.maps 존재와 [data-naver-map] 자식 수를 읽는다
```

탭을 매번 새로 열어 "SPA 세션을 거치지 않은 직접 진입"을 재현했다.

| 경로 | maps.js 요청 | `naver.maps` | 지도 그려짐 |
| --- | --- | --- | --- |
| 상세 직접 진입 (원래 깨지던 경로) | 1 | true | true |
| 지도 탭 | 1 | true | true |
| 홈 | **0** | false | — |
| SPA 이동 지도 → 상세 | **누적 1** | true | true |

`typecheck` / `lint` / `format` 통과.

한 가지 함정: 처음에 대기를 6초로 잡았더니 상세 진입이 전부 실패로 나왔다.
dev 서버의 첫 라우트 컴파일이 그만큼 걸려서였다. 라우트를 미리 한 번씩
`fetch`해 warm-up한 뒤 9초로 늘리니 안정적으로 재현됐다. **측정 실패를 코드
실패로 오해할 뻔했다.**

### 8. 교훈

- **주석을 사실로 믿지 말 것.** "(tabs) 셸에서 로드한 SDK"라는 한 줄이 실제로는
  존재하지 않는 구조를 가리키고 있었다. 코드 이동은 주석을 데려가지 않는다.
- **조용한 실패를 남기지 말 것.** 폴링 10초 뒤 `clearInterval`만 하고 끝내면
  증상이 "아무 일도 안 일어남"이 된다. 실패 상태를 만들어 화면에 드러냈어야 했다.
  실패 표시가 있었으면 진단이 몇 분으로 끝났다.
- **"무거우니 지연 로드" 전에 무게를 재 볼 것.** 91KB라는 숫자가 나오고 나서야
  "루트에 올릴지"가 아니라 "로드 지점이 하나뿐인 게 문제"라는 게 보였다.
- **라이브러리의 중복 제거는 무엇을 키로 쓰는지까지 확인할 것.** `next/script`가
  "한 번만 로드한다"는 건 맞지만, 키가 `id || src`이고 로드 완료 전에 키를
  등록한다는 것까지 봐야 같은 id 공유가 위험하다는 걸 알 수 있다. 문서에는 없고
  소스에만 있었다.
- **브라우저가 있어야만 검증되는 변경이 있다.** 의존성을 안 늘리고도 설치된
  Chrome + CDP로 충분히 확인할 수 있다. HTML만 긁어서 "안 된다"고 결론내지 말 것.
- **검증 실패와 코드 실패를 구분할 것.** dev 첫 컴파일 시간을 빼먹어서 멀쩡한
  코드를 실패로 읽을 뻔했다. 재현 환경부터 warm-up할 것.
