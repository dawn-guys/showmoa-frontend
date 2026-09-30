# Phase

## Current Phase

Phase 2 — API Integration

Replace mock data with the real backend through the existing route _hooks.
Screen structure, markup, and UI copy do not change in this phase.

Contract: https://showmoa-dev.duckdns.org/v3/api-docs (Swagger UI: /swagger-ui/index.html).
Base URL comes from env. Never guess a response shape; if the contract and
docs/spec disagree, stop and report.

## Current Scope

In scope:

- API client: one fetch wrapper in src/shared/lib (base URL from env, JSON,
  Bearer token, error normalization, one-time refresh on 401). No new HTTP
  library.
- Types: replace every `// Provisional:` type with contract types (see
  Types in Data Policy).
- Swap every `// MOCK:` point of a todo item below. Change only the queryFn
  in route _hooks; add useMutation with query invalidation for writes.
- Render every swapped screen from the real response data (see Data Policy).
- Map loading, empty, and error results to the existing docs/spec UI states.
  Use spec copy only.
- Real auth: token handling, login/logout, signup, email verification,
  password reset/change, Google OAuth code exchange, proxy.ts guard for
  /notification and /password/update, in-app browser hand-off.
- Env: add every new variable to .env.example.

## Data Policy

Real data replaces mock data:

- For every todo item being integrated, the API response is the only source
  of what the screen renders. Remove the mock data, the mock queryFn, the
  artificial delay, and the `// MOCK:` marker in the same change.
- Never fall back to mock data on error, empty, or missing fields. A failed
  request shows the spec's error state; an empty response shows the spec's
  empty state.
- Render values from response fields. Do not hardcode display values (titles,
  addresses, counts, statuses) that the response provides.
- If the UI needs a field the response does not contain, do not fill it from
  a mock or invent it. Leave that element out of the integrated data path,
  list it in your report, and wait for my decision.
- Never mix mock and real fields inside one object. A BLOCKED part keeps its
  own hook with a `// MOCK:` marker and returns only mock data.
- Delete a page's mock files once it has no remaining `// MOCK:` markers.
  Delete src/shared/mocks/auth.ts once auth is swapped. Delete
  src/shared/mocks/ when nothing imports it.
- Mock edge cases (open-run, ended, empty list, long titles) are verified
  against real responses instead; if the backend data does not contain a
  case, note it in the report.

Types:

- Write API types by hand from the contract. Do not add a code generator or
  any new library.
- Replace existing `// Provisional:` types in place, in the files where they
  already live. Do not move or reorganize type files. Create a new type file
  only when no existing one fits, following the existing folder pattern.
- Each API type maps 1:1 to a contract schema and keeps the schema name
  (e.g. PerformanceResponse, WishlistItemResponse, TokenResponse). Start the file
  or block with `// Contract: <SchemaName> (v3/api-docs)`. Remove the
  `// Provisional:` header once a file contains only contract types.
- Do not re-declare API fields inside UI types. Derive UI types from API
  types with Pick, Omit, or extension. Delete Provisional fields the
  contract does not have and report them.
- The contract marks no response field as required. Do not type fields as
  optional by default. Check a real response and mark a field nullable or
  optional only when it is actually absent or null (e.g. `endDate` for
  open-run performances).
- `status` in WishlistItemResponse is a union literal
  ('UPCOMING' | 'ONGOING' | 'ENDED'). `state` and `genre` are plain strings
  in the contract; type them as string until real values are confirmed, then
  narrow only with my approval. Confirmed `genre` values are 연극, 뮤지컬,
  콘서트, 클래식·국악, 기타, and null — so `genre` is nullable everywhere.
- Type request bodies and query params from the contract too (search params,
  wishlist month/date, theatre bounds). Form schemas use Zod with spec
  rules; response bodies are not validated with Zod.
- Type the fetch wrapper generically so each hook declares its response type
  once; no `any`, no unchecked `as` casts on responses.

Contract conventions:

- Components never fetch. Data flows through route _hooks only.
- API dates are `yyyy-MM-dd` (no time, no offset). Showtimes come as the
  free-text `showTimeGuidance`. Update UI types to match; the Phase 1
  ISO 8601 datetime rule no longer applies to real data.
- Paging: send `page`, `size`, `sort` as separate query params (not a
  `pageable` object). Responses are Spring Page objects.
- Genres: the UI uses the 5 service categories; the API filters by raw
  genre names. Map categories to raw names in
  src/shared/constants/genre.ts (mapping is in docs/spec common-ui.md).
- Wishlist writes live under the performance, not under /api/wishlists:
  POST/DELETE /api/performances/{performanceId}/wishlist. POST returns 201
  (409 if already wished, 404 if no such performance); DELETE returns 204
  (404 if not wished). Ended performances can be wished and unwished.
  Do not use optimistic updates and do not treat 409 on add as success —
  the contract is written on that assumption. Invalidate and re-read instead.
- Never place a user id in a URL; identity comes from the token.
- Anything marked BLOCKED below stays on mocks with its `// MOCK:` marker.
  Do not invent an endpoint or workaround.

## Out of Scope

- Cache time, retries, prefetching, and other server state tuning (Phase 3)
- Performance optimization (Phase 3), PWA setup
- Account deletion (DELETE /api/users/me): no screen exists
- New features, screen changes, or markup changes beyond the data swap
- BLOCKED items until the backend delivers them

## Todo

Order: A → B → C → D → E → F → G → H → I → J. Check off an item only when
its Definition of Done holds.

### A. API client and auth infrastructure

- [x] Propose token storage and guard design, then wait for approval.
      Proposal to evaluate: Next Route Handlers store access/refresh tokens
      in httpOnly cookies and proxy authed calls to the backend (attaching
      Authorization, refreshing on 401), so proxy.ts can guard by cookie
      and CORS is avoided.
- [x] Fetch wrapper + error normalization (src/shared/lib)
- [ ] POST /api/auth/refresh (one-time retry on 401)
      Implemented in app/api/backend/[...path]. Failure branch verified
      (invalid refresh -> cookies cleared, 401). Success branch waits on a
      real account (see "Pending account verification" below).
- [ ] GET /api/users/me as the current-user query; replace the mock switch
      in src/shared/mocks/auth.ts
      Mock deleted, guest variant verified (401 -> user null). Logged-in
      variant waits on a real account (see "Pending account verification"
      below).
- [x] proxy.ts guard: /notification, /password/update

Pending account verification (A)

The two unchecked items above are implemented but their logged-in path has
never run: POST /api/users/signup requires prior email verification, and the
verification code is only delivered by email. /actuator and /h2-console are
locked (401), so there is no dev bypass.

Owner creates the account manually. The signup UI is not wired yet (Todo B),
so use Swagger UI (showmoa-dev.duckdns.org/swagger-ui/index.html) or curl:

1. POST showmoa-dev.duckdns.org/api/email/send { email } -> code arrives by email
2. POST showmoa-dev.duckdns.org/api/email/verify { email, code }
3. POST showmoa-dev.duckdns.org/api/users/signup { email, password }
   password must satisfy the contract: letters + digits, min 8
4. POST localhost:3000/api/auth/login { email, password }
   expect 204 with Set-Cookie sm_at and sm_rt (our route, not the backend)

Then tell me, and I verify and check the boxes:

- GET /api/backend/api/users/me returns { id, email, hasPassword }
- Screens switch to the logged-in variant with no code change: header bell,
  home liked/today sections, /setting account section
- /notification and /password/update pass the proxy.ts guard
- Refresh success branch: delete only the sm_at cookie, then call
  /api/backend/api/users/me. The backend 401s, the proxy refreshes, and the
  retry succeeds without the client noticing.
- Whether the backend rotates refresh tokens (compare sm_rt before/after a
  refresh). If it does, the in-flight coalescing in backend.server.ts is
  required, not just defensive.
- POST /api/auth/logout clears both cookies and screens return to guest

### B. Login / Signup (/login, /signup)

- [x] POST /api/auth/login (TokenResponse). Failure: existing spec error
      toast and email input error border
- [x] POST /api/email/send (returns expirationSeconds → drives the timer)
- [x] POST /api/email/verify
- [x] POST /api/users/signup, then POST /api/auth/login for the
      "auto login" CTA on the completion screen

Social login (Google and Kakao OAuth, and the in-app browser hand-off) is
split out to J and deferred to the end of the phase.

### C. Password find / update (/password/find, /password/update)

- [x] Find: email send + verify, then POST /api/users/password/reset.
      Success goes to /login; the spec has no copy or behaviour for this
      step (owner decided).
- [x] Update: the same flow and the same POST /api/users/password/reset.
      PATCH /api/users/me/password is not used — it requires currentPassword
      and the spec flow has no such input (owner decided). The email to
      verify is fixed to the `email` from GET /api/users/me; on success the
      screen logs in with the new password and goes to /setting, or to
      /login if that login fails.
- [x] Password rule: resolved in favour of the contract — letters (either
      case) + digits, min 8, no max. PasswordSetup and the three copy
      entries in docs/spec/auth.md were updated to match.
- [x] Reset failure: one toast with the existing spec copy
      "유효하지 않은 이메일 입니다", no status-code branching (owner decided).
      400 also returns to the email step: the verification has expired or
      been consumed, so retrying in place always fails.
      Unconfirmed: the status code for a verified email with no account.
      Reset checks verification first, so it is unreachable without a
      mailbox the tester owns; owner confirms by test.

### D. Home (/)

- [x] Category performances: GET /api/performances/search?genres=...
      The list response now carries `theatre`, so a venue name is available
      here too. The category card does not show one, so nothing changes for
      this item.
      Resolved: `state` used to be stale (347 records came back for
      state=공연중 while 111 of them had an endDate in the past). The backend
      now computes the enum from today's date instead of reading the stored
      KOPIS value, so the card caption is correct without any client-side
      date logic.

Contract change (2026-09-29, affects D/E/F): the backend replaced the KOPIS
`state` string (공연예정·공연중·공연완료) with the enum UPCOMING | ONGOING |
ENDED, computed from today (Asia/Seoul) against the run, and added `openRun`
and `theatre` to PerformanceListResponse. The stale-state problem noted under
Category performances is fixed by this. PerformanceResponse also gained
`openRun` and `introImageUrls`, and WishlistCalendarResponse gained `genre`.

- [ ] Wished performances (logged in): GET /api/wishlists?page=0&size=20.
      The response is a Slice, not an array (see G), so the hook selects
      `content`. Typing it as an array is what made this section show its
      empty state while the account had four wishes — the shape mismatch is
      invisible to typecheck. Home shows the first page only and keeps the
      server order; /wishlist owns the infinite scroll.
      `WishlistItemResponse` carries `genre`, so the card shows the genre
      tag, and `status` drives the badge (진행 중 / D-N / 공연 종료).
      The query key is ["home", "liked"] and deliberately not under the
      ["wishlist"] prefix: useToggleWishlist's optimistic update treats
      everything under that prefix as InfiniteData and would break on a
      plain Slice. Home has no heart of its own and refetches on mount, so
      a wish changed elsewhere still shows up on return.
- [ ] Today's schedule (logged in): there is no `date` param and no per-day
      endpoint. GET /api/wishlists takes page and size only, and a `date`
      query is silently ignored — it returns the whole list, so this cannot
      be filtered server side. Derive the day from
      GET /api/wishlists/calendar?month=<this month> by keeping the
      performances whose startDate..endDate covers today, comparing at local
      midnight (parseISO + startOfDay, never toISOString).
      The query key is ["calendar", <month>], shared with Todo H, so there is
      no duplicate request and useToggleWishlist's ["calendar"] invalidation
      and optimistic removal cover it too.
      `WishlistCalendarResponse` has no `status` and no `genre`, so these
      cards carry neither the badge nor the genre tag — owner decided.
- [ ] Featured performances: GET /api/performances, drop the ones whose
      `state` is ENDED, then pick 1 at random on the client. There is no
      dedicated endpoint, so the client-side random pick stands in for one.
      The size is 20 so a refresh does not keep landing on the same few.
      The spec's "공연장 위치" now comes from the response: the backend added
      `theatre` to PerformanceListResponse, so the hardcoded placeholder is
      gone and Data Policy holds again.
      Still wanted from the backend: view-count ordering (detail-page view
      count, highest first) needs a way to record a view
      (POST /api/performances/{id}/views preferred — see the note below) and
      an endpoint to read the top one.
- [ ] Popular ranking: GET /api/performances/popular 로 연결
      Takes no parameters: the server fixes the count at 5, orders by wish
      count descending (ties broken by the earlier startDate) and drops
      ended performances. The response is a plain PerformanceListResponse[],
      not a Page, and carries no rank field — the array order is the rank,
      so the screen shows index + 1.
      Only performances with at least one wish are candidates
      (HAVING COUNT(w) > 0), so an untouched database returns []. There is
      no empty-state or error copy for this section in docs/spec/home.md,
      so both hide the section rather than invent a message.

Note on the view counter (Featured): incrementing inside
GET /api/performances/{id} would be inflated by this app's React Query
defaults (staleTime 0, refetchOnWindowFocus) plus StrictMode double
invocation. Prefer an explicit POST the screen calls once, or require
server-side dedupe.

Wishlist verification (D)

Verified against the real API while logged in, on an account with four
wishes: the liked section gets all four, and 오늘 나의 공연 gets the one whose
run covers today (701호 [대학로], 2024-10-09~2026-09-30). The month response
holds three, and the other two ended before today. This matches what
/wishlist and /calendar show for the same account.

Still unreachable with that data, so still unverified:

- Both empty states ("좋아요 한 공연이 없습니다" / "오늘 공연 일정이 없습니다").
  Unwish everything, or use an account with no wishes.
- A null `genre`, which hides the genre tag. All four wishes are 연극.
- An open run (no endDate). The contract types endDate as always present and
  no wished performance had it empty, so this may not be reachable at all.

To add a wish by hand while logged in, from the browser console:
fetch('/api/backend/api/performances/1611/wishlist', { method: 'POST' })
201 on success, 409 if already wished. Note the path is nested under the
performance, not under /api/wishlists. id 1611 ("토요명품",
2026-01-03~2026-12-26) spans today, so it exercises 오늘 나의 공연 as well.
Add a second id that has not started for the D-N badge.

### E. Search (/search)

- [ ] GET /api/performances/search (keyword, genres, areas, districts,
      page, size, sort)
- [ ] GET /api/performances/areas for the region filter drawer.
      Use values from this API verbatim as `areas`/`districts` params.
      Decided: the region filter is built in 2 levels — sido single select +
      districts multi select (max 3). The CTA appears once at least one
      district is selected (owner decided).
- [ ] Genre filter: multi select of up to 2 categories, excluding "전체".
      "전체" stays exclusive. The shared GenreFilterSheet keeps single
      select for /wishlist; search opts in with `multiple` and `max`.
- [ ] List hearts: list response has no `isWished`. BLOCKED

### F. Detail (/detail/[id])

- [ ] GET /api/performances/{id} (auth optional; `isWished` is false for
      guests)
- [ ] POST/DELETE /api/performances/{performanceId}/wishlist from the like
      CTA; guest keeps the login prompt modal; failure toast from spec
- [x] Detail images: connected to PerformanceResponse.introImageUrls
      (array<string>, confirmed in v3/api-docs and against real responses —
      1~5 images per performance). Drives the "상세 보기" viewer; the mock is
      removed. Empty array hides the button per spec.
- [ ] Missing from contract: jibun address, building name, price. Report per
      Data Policy; do not fill from mocks. BLOCKED

### G. Wishlist (/wishlist)

- [ ] GET /api/wishlists with infinite scroll. The response is a Slice
      (`content`, `page`, `size`, `hasNext`), not an array and not a Spring
      Page: there is no total count, so paging keys off `hasNext` only.
      Keep the server order as-is — not-ended first (ONGOING + UPCOMING),
      ended last, most recently wished within each group — and do not
      re-sort on the client. Dedupe by `performanceId`: the contract states
      the front end owns this, because wishing/unwishing mid-scroll can
      shift page boundaries and repeat an item.
- [ ] DELETE /api/performances/{performanceId}/wishlist from the heart
      (ended items too). Note the path is nested under the performance, not
      under /api/wishlists. Do not update optimistically — the contract is
      written on the assumption that the front end does not, so invalidate
      the list and re-read from the server.
- [ ] `status` (UPCOMING/ONGOING/ENDED) drives the disabled state
- [ ] Title search: client-side filter on `name` (no server-side param)
- [ ] Genre filter: client-side filter on `genre`. `WishlistItemResponse`
      carries it, so this is no longer BLOCKED. Compare against
      GENRE_API_VALUES; `genre` is nullable, as it is in the search list.
- [ ] Re-check the home liked/today sections with real wishes, then check
      off the two items in Todo D. The API side is confirmed — see
      "Wishlist verification (D)"; what is left is a look at the screen.

### H. Calendar (/calendar)

- [ ] GET /api/wishlists/calendar?month=yyyy-MM for month/week views and the
      bottom sheet. Note this is its own endpoint, not a `month` param on
      /api/wishlists. It returns a plain `WishlistCalendarResponse[]` with no
      paging, most recently wished first, holding only the performances whose
      run overlaps that month. Derive per-day lists on the client; there is no
      per-day endpoint, and `date` is not a parameter anywhere.
- [ ] `WishlistCalendarResponse` covers everything the sheet and week list
      show (name, theatreName, posterUrl, startDate, endDate). It has no
      `status` and no `genre`, unlike `WishlistItemResponse`.
- [ ] The per-performance colour in the month cells is not in the contract.
      Derive it deterministically from `performanceId` on the client; confirm
      the palette with me before building it.
- [ ] Heart in bottom sheet/week list: DELETE
      /api/performances/{performanceId}/wishlist, same as G

### I. Map (/map) and Setting (/setting)

- [ ] GET /api/theatres with swLat, swLng, neLat, neLng from map bounds
- [ ] GET /api/theatres/{id}/performances for the bottom sheet
- [ ] Venue search (`?search=`): BLOCKED (no endpoint)
- [ ] Setting: current user email from GET /api/users/me; logout via
      POST /api/auth/logout (clear tokens even if the request fails);
      hide 비밀번호 변경 if `hasPassword` is false (confirm with me)
- [ ] Notification: BLOCKED (no endpoint), stays on mocks

### J. Social login (/login)

The start URLs are still not in the contract (Spring Security filter paths,
which api-docs does not list). They were confirmed against the deployed
backend by their live behaviour:

- `GET {backend}/oauth2/authorization/{google|kakao}` → 302 to the provider
  (PKCE S256). `naver` and `apple` answer 500, so those two are all there is.
- `redirect_uri` is the backend itself (`{backend}/login/oauth2/code/{provider}`),
  so the front end configures nothing with Google or Kakao.
- Failure comes back to `{front}/oauth/callback?error=social_login_failed` —
  the same value for an invalid code and for a cancelled login.

- [ ] Google OAuth: /api/auth/oauth/start/google (302 to the backend) →
      /oauth/callback reads `code` → POST /api/auth/oauth/exchange
      (OAuthExchangeRequest) → tokens into the httpOnly cookies → "/"
- [ ] Kakao OAuth: the same flow through /api/auth/oauth/start/kakao.
      docs/spec/auth.md item 6 names Google only; the button copy and icon
      already in the code stay as they are (owner decided)
- [ ] Failure: back to /login with the existing login-failure toast copy
      (owner decided — docs/spec has no social-failure copy)
- [ ] In-app browser detection and hand-off for social login
      BLOCKED: docs/spec has no copy for the external-browser notice, so
      Google's webview block (disallowed_useragent) is not handled

Unconfirmed until the owner runs a real login:

- The success parameter name. Only the failure redirect is observable and the
  contract does not document the success one, so /oauth/callback reads
  `code` (the exchange body's field name). Any other name lands on the
  failure path instead of logging in with wrong data.
- The one-time code's lifetime (60 seconds?).

Needs the backend before this can ship:

- The redirect target is hardcoded to `http://localhost:3000`, so social
  login from a deployed front end bounces back to localhost. It has to
  become per-environment configuration.

## Definition of Done

An item is done when:

- It runs against the real API for guest and logged-in variants as the
  spec requires, and renders only from response data.
- Its `// MOCK:` markers and `// Provisional:` headers are gone, and
  nothing in its route imports from src/shared/mocks (verify with grep).
- Its types follow the Types rules: contract-named, no duplicated fields,
  no `any`, nullability confirmed against a real response.
- Loading, empty, and error states from docs/spec are reachable with real
  responses, including failed requests and expired tokens, with no mock
  fallback.
- Edge cases render correctly against real data: open-run (no end date),
  ended performances, empty lists, long titles.
- typecheck and lint are clean.

Phase 2 is complete when every non-BLOCKED item is checked and BLOCKED
items are listed in the final report.

## Phase Transition

When Phase 2 is complete and Phase 3 (Optimization) starts, update Current
Phase, Current Scope, Data Policy, Out of Scope, Todo, and Definition of
Done in THIS FILE ONLY. Do not modify CLAUDE.md or blueprint.md for a phase
change.