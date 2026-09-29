# Phase

## Current Phase

Phase 2 — API Integration

Replace mock data with the real backend through the existing route _hooks.
Screen structure, markup, and UI copy do not change in this phase.

Contract: http://localhost:8080/v3/api-docs (Swagger UI: /swagger-ui/index.html).
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
so use Swagger UI (localhost:8080/swagger-ui/index.html) or curl:

1. POST localhost:8080/api/email/send { email } -> code arrives by email
2. POST localhost:8080/api/email/verify { email, code }
3. POST localhost:8080/api/users/signup { email, password }
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

Social login (Google OAuth and the in-app browser hand-off) is split out to
J and deferred to the end of the phase.

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
      Confirmed: the list response has no theatre name, so the spec's
      "공연장 위치" cannot be filled from this endpoint. The category card
      does not show a venue, so only the featured section is affected.
      Open backend question: `state` is stale. Of 347 records returned for
      state=공연중, 111 have an endDate before today (e.g. id 8, ended
      2026-09-19). The card caption reads `state` per Data Policy, so
      those render "공연 중" although the run is over. Deriving the caption
      from the dates on the client would contradict Data Policy ("render
      values from response fields"), so this is left as is pending a
      backend fix.
- [ ] Wished performances (logged in): GET /api/wishlists (Slice — see G)
- [ ] Today's schedule (logged in): there is no `date` param and no per-day
      endpoint. Derive it from GET /api/wishlists/calendar?month=<this month>
      by keeping the performances whose startDate..endDate covers today
- [ ] Featured performances: BLOCKED (no endpoint)
      Agreed basis: detail-page view count, highest first. Needs a way to
      record a view (POST /api/performances/{id}/views preferred — see the
      note below) and an endpoint to read the top one, with `theatre`
      included so the spec's "공연장 위치" can be rendered.
- [ ] Popular ranking: BLOCKED (no endpoint)
      Agreed basis: wishlist count, top 5. No schema exposes a wish count
      and the sort whitelist rejects wishlistCount/likeCount/viewCount
      (400), so neither a dedicated endpoint nor a sort workaround exists.

Note on the view counter (Featured): incrementing inside
GET /api/performances/{id} would be inflated by this app's React Query
defaults (staleTime 0, refetchOnWindowFocus) plus StrictMode double
invocation. Prefer an explicit POST the screen calls once, or require
server-side dedupe.

Pending wishlist verification (D)

Both sections above are implemented, but no screen can create a wish yet:
the detail-page heart is Todo F and /wishlist is Todo G. With an empty
wishlist the API always returns [], so only the empty state
("좋아요 한 공연이 없습니다" / "오늘 공연 일정이 없습니다") is reachable.
The populated list, the card status badge (D-N / 진행 중 / 공연 종료), the
horizontal sliding, and the date filter are all unverified.

Two ways to close this:

- Wait for F or G, then re-check (tracked as an item under G).
- Or seed a wish by hand now. While logged in, from the browser console:
  fetch('/api/backend/api/wishlists/1611', { method: 'POST' })
  201 on success, 409 if already wished. id 1611 ("토요명품",
  2026-01-03~2026-12-26) spans today, so it exercises the 오늘 나의 공연
  section as well. Add a second id that has not started for the D-N badge.

### E. Search (/search)

- [ ] GET /api/performances/search (keyword, genres, areas, districts,
      page, size, sort)
- [ ] GET /api/performances/areas for the region filter drawer.
      Use values from this API verbatim as `areas`/`districts` params.
      BLOCKED: API has 2 levels (sido, districts); spec drawer has 3
- [ ] List hearts: list response has no `isWished`. BLOCKED

### F. Detail (/detail/[id])

- [ ] GET /api/performances/{id} (auth optional; `isWished` is false for
      guests)
- [ ] POST/DELETE /api/performances/{performanceId}/wishlist from the like
      CTA; guest keeps the login prompt modal; failure toast from spec
- [ ] Missing from contract: jibun address, building name, detail images,
      price. Report per Data Policy; do not fill from mocks. BLOCKED

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
      off the two blocked items in Todo D (see "Pending wishlist
      verification (D)")

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

Split out of B and deferred to the end: the contract only covers the last
step of the flow, so none of it can be built or tested yet. The login screen
keeps the Google button with no onClick until this section starts.

- [ ] Google OAuth: POST /api/auth/oauth/exchange (one-time code → tokens)
      BLOCKED: login start URL / redirect flow is not in the contract
- [ ] In-app browser detection and hand-off for social login
      BLOCKED: nothing to hand off to until the start URL exists, and
      docs/spec has no copy for the external-browser notice

Ask the backend before starting J:

- What is the login start URL (`/oauth2/authorization/google`, or does the
  front end build it)?
- After success, which front-end URL is the browser sent to, and what is the
  query parameter holding the one-time code?
- Does the front end own that callback route, or does the backend redirect
  to an existing screen such as `/login?code=...`?
- What comes back on failure or when the user cancels?
- Is the one-time code's 60-second lifetime correct?

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