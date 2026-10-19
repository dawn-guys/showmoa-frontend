# Phase

## Current Phase

Phase 2 — API Integration (wrap-up)

Every screen now renders from the real backend through the route _hooks.
What is left is BLOCKED on the backend or on missing spec copy, or waits on a
manual check. Screen structure, markup, and UI copy do not change in this
phase.

Contract: https://showmoa-dev.duckdns.org/v3/api-docs (Swagger UI:
/swagger-ui/index.html). The dev server now answers 401 to both without
credentials; ask the backend for access, or run the backend locally
(localhost:8080/swagger-ui.html). Base URL comes from env. Never guess a
response shape; if the contract and docs/spec disagree, stop and report.

## Current Scope

In scope:

- Close the remaining items under Todo once the backend or spec unblocks
  them.
- Fix integration bugs found in manual testing. Keep each fix inside the
  existing route _hooks and components.
- Keep docs/spec in sync with shipped behaviour and copy.
- Env: add every new variable to .env.local.example.

## Data Policy

Real data replaces mock data:

- For every integrated item, the API response is the only source of what the
  screen renders. No mock data, mock queryFn, artificial delay, or `// MOCK:`
  marker survives in an integrated path.
- Never fall back to mock data on error, empty, or missing fields. A failed
  request shows the spec's error state; an empty response shows the spec's
  empty state.
- Render values from response fields. Do not hardcode display values (titles,
  addresses, counts, statuses) that the response provides.
- If the UI needs a field the response does not contain, do not fill it from
  a mock or invent it. Leave that element out of the integrated data path,
  report it, and wait for my decision.
- Never mix mock and real fields inside one object. A BLOCKED part keeps its
  own hook with a `// MOCK:` marker and returns only mock data.
- Delete a page's mock files once it has no remaining `// MOCK:` markers.
  Delete src/shared/mocks/ when nothing imports it.

Types:

- Write API types by hand from the contract. Do not add a code generator or
  any new library.
- Each API type maps 1:1 to a contract schema and keeps the schema name.
  Start the file or block with `// Contract: <SchemaName> (v3/api-docs)`.
- Do not re-declare API fields inside UI types. Derive UI types from API
  types with Pick, Omit, or extension.
- Mark a field nullable or optional only when a real response shows it absent
  or null (e.g. `endDate` for open-run performances). `genre` is nullable
  everywhere.
- Type request bodies and query params from the contract too. Form schemas
  use Zod with spec rules; response bodies are not validated with Zod.
- The fetch wrapper is generic; no `any`, no unchecked `as` casts on
  responses.

Contract conventions:

- Components never fetch. Data flows through route _hooks only.
- The browser only calls the same-origin proxy (/api/backend/*). Tokens live
  in httpOnly cookies; the proxy attaches Authorization and refreshes once
  on 401.
- API dates are `yyyy-MM-dd` (no time, no offset). Compare at local midnight
  (parseISO + startOfDay, never toISOString). Showtimes come as the free-text
  `showTimeGuidance`.
- Paging: send `page`, `size`, `sort` as separate query params. Wishlist
  responses are Slices (`content`, `hasNext`), not arrays.
- Genres: the UI uses the 5 service categories; map them to API values in
  src/shared/constants/genre.ts.
- Wishlist writes live under the performance:
  POST/DELETE /api/performances/{performanceId}/wishlist. No optimistic add,
  and 409 on add is not success. Invalidate and re-read instead.
- Never place a user id in a URL; identity comes from the token.
- Anything marked BLOCKED below stays on mocks with its `// MOCK:` marker.
  Do not invent an endpoint or workaround.

## Out of Scope

- Cache time, retries, prefetching, and other server state tuning (Phase 3)
- Performance optimization (Phase 3), PWA setup
- New features, screen changes, or markup changes beyond the data swap
- BLOCKED items until the backend delivers them

## Done

Implemented against the real API and exercised on the dev or local backend.

- A. API client and auth: fetch wrapper with error normalization; BFF proxy
  (/api/backend/[...path]) with httpOnly cookies and one-time refresh on
  401; GET /api/users/me as the current-user query; proxy.ts guard for
  /notification, /password/update, /setting/withdraw (and /login for
  signed-in users).
- B. Login and signup: login, email send/verify (timer from
  `expirationSeconds`), signup, and auto login on the completion screen.
- C. Password find and update: both use POST /api/users/password/reset after
  email verification (PATCH /api/users/me/password is unused — it needs
  currentPassword, which the spec flow has no input for; owner decided).
  Update fixes the email to the account and auto-sends on entry; success
  logs out and lands on /login with a success toast.
  `same-as-old-password` keeps the password step with its own toast; other
  400s return to the email step. Social accounts are redirected to /setting
  and the menu entry is hidden (`hasPassword` false).
- D. Home: category performances, featured (random non-ended pick from
  GET /api/performances), popular ranking (GET /api/performances/popular,
  top 5, hidden when empty or failed), liked performances (first page of
  GET /api/wishlists), today's schedule (derived from the calendar month
  response with the calendar's show-day rule).
- E. Search: GET /api/performances/search with infinite scroll; genre filter
  is multi select up to 2 (excluding "전체"); region filter is 2 levels from
  GET /api/performances/areas (sido single, districts up to 3). Search
  conditions live in the URL.
- F. Detail: GET /api/performances/{id}; like CTA via the wishlist endpoints
  with the guest login modal; detail images from `introImageUrls`.
- G. Wishlist: infinite scroll on the Slice with dedupe by `performanceId`,
  server order kept; heart removes (ended items too); title and genre filters
  are client side.
- H. Calendar: GET /api/wishlists/calendar?month=yyyy-MM drives the month
  and week views and the day sheet. A performance shows only on its
  `showDays`, plus holidays when `showsOnHolidays` (GET /api/holidays; a
  holiday API failure falls back to weekdays only). Per-performance colour
  is derived from `performanceId`.
- I. Map and setting: GET /api/theatres by map bounds,
  GET /api/theatres/{id}/performances for the sheet, integrated venue /
  performance / region search via GET /api/theatres/search. Setting shows
  the account email, logout, and the withdraw entry.
  Account deletion (DELETE /api/users/me): password confirm for normal
  accounts, email verification (purpose WITHDRAWAL, sent on button press
  only) for social accounts, then a confirm modal.
- J. Social login: Google and Kakao through /api/auth/oauth/start/{provider}
  → /oauth/callback → POST /api/auth/oauth/exchange → cookies. Failure and
  duplicate-email cases come back to /login with a toast. The backend
  redirect target is now per environment (APP_OAUTH2_REDIRECT_URI).

## Todo

### BLOCKED

- [ ] Search list hearts: the list response has no `isWished`.
- [ ] Notification (/notification and the header unread dot): no endpoint.
      Stays on src/shared/mocks/notification.ts with `// MOCK:` markers.
- [ ] Detail jibun address and building name: not in the contract. Stays on
      src/shared/mocks/detail.ts via useBlockedDetailFields.
- [ ] Featured by view count: needs a way to record a view (an explicit
      POST the screen calls once is preferred over counting inside
      GET /api/performances/{id}, which React Query refetches would inflate)
      and an endpoint to read the top one. Until then featured is a random
      pick.
- [ ] In-app browser detection and hand-off for social login: docs/spec has
      no copy for the external-browser notice, so Google's webview block
      (disallowed_useragent) is not handled.

### Unverified

Implemented, but the path has not been run end to end:

- [ ] Refresh success branch: delete only the access cookie, call
      /api/backend/api/users/me, and confirm the retry succeeds silently.
      Also check whether the backend rotates refresh tokens.
- [ ] Account deletion success path (normal and social). Irreversible, so it
      waits on the owner with a throwaway account.
- [ ] Retry after `same-as-old-password`: whether the backend keeps the
      email verification, so a second password in place succeeds.
- [ ] Edge cases with real data: home empty states, a null `genre`, an open
      run in the wishlist and calendar.

### Follow-ups

- [ ] calendar/_types.ts still says `showDays` and `showsOnHolidays` are not
      in the contract yet. The backend has merged them
      (WishlistCalendarResponse); update the comment and confirm whether the
      undefined fallback can go.
- [ ] Withdraw failure toast reads "5회 중 {n}번을 실패 하셨습니다. 인증번호를
      확인해 주세요" for a wrong password, and the backend enforces no
      5-attempt lockout. Confirm the copy with the owner.
- [ ] Withdraw confirm modal title "회원 탈퇴" is a placeholder (not found in
      Figma). Confirm with the owner.
- [ ] .env.local.example lacks NEXT_PUBLIC_NAVER_MAP_STYLE_ID (read by
      map/_lib/naver-map.ts) and the NAVER_API_HUB_* pair listed in the
      README (not read anywhere in this repo yet).

## Definition of Done

An item is done when:

- It runs against the real API for guest and logged-in variants as the
  spec requires, and renders only from response data.
- Its `// MOCK:` markers and `// Provisional:` headers are gone, and
  nothing in its route imports from src/shared/mocks (verify with grep).
- Its types follow the Types rules: contract-named, no duplicated fields,
  no `any`, nullability confirmed against a real response.
- Loading, empty, and error states from docs/spec are reachable with real
  responses, with no mock fallback.
- typecheck and lint are clean.

Phase 2 is complete when every non-BLOCKED item is checked and BLOCKED
items are listed in the final report.

## Phase Transition

When Phase 2 is complete and Phase 3 (Optimization) starts, update Current
Phase, Current Scope, Data Policy, Out of Scope, Todo, and Definition of
Done in THIS FILE ONLY. Do not modify CLAUDE.md or blueprint.md for a phase
change.
