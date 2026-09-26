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
