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
  (e.g. PerformanceResponse, WishlistResponse, TokenResponse). Start the file
  or block with `// Contract: <SchemaName> (v3/api-docs)`. Remove the
  `// Provisional:` header once a file contains only contract types.
- Do not re-declare API fields inside UI types. Derive UI types from API
  types with Pick, Omit, or extension. Delete Provisional fields the
  contract does not have and report them.
- The contract marks no response field as required. Do not type fields as
  optional by default. Check a real response and mark a field nullable or
  optional only when it is actually absent or null (e.g. `endDate` for
  open-run performances).
- `status` in WishlistResponse is a union literal
  ('UPCOMING' | 'ONGOING' | 'ENDED'). `state` and `genre` are plain strings
  in the contract; type them as string until real values are confirmed, then
  narrow only with my approval.
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
- Wishlist: POST returns 201 (409 if already wished, 404 if no such
  performance); DELETE returns 204 (404 if not wished). Treat 409 on add
  as already wished.
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

- [ ] Find: email send + verify, then POST /api/users/password/reset
- [ ] Update: PATCH /api/users/me/password
      BLOCKED: API needs currentPassword; the spec flow has no such input
- [ ] Password rule: resolved in favour of the contract — letters (either
      case) + digits, min 8, no max. PasswordSetup and the three copy
      entries in docs/spec/auth.md were updated to match.

### D. Home (/)

- [ ] Category performances: GET /api/performances/search?genres=...
      (list response has no theatre name; confirm card fields)
- [ ] Wished performances (logged in): GET /api/wishlists
- [ ] Today's schedule (logged in): GET /api/wishlists?date=<today>
- [ ] Featured performances: BLOCKED (no endpoint)
- [ ] Popular ranking: BLOCKED (no endpoint)

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
- [ ] POST/DELETE /api/wishlists/{performanceId} from the like CTA;
      guest keeps the login prompt modal; failure toast from spec
- [ ] Missing from contract: jibun address, building name, detail images,
      price. Report per Data Policy; do not fill from mocks. BLOCKED

### G. Wishlist (/wishlist)

- [ ] GET /api/wishlists (ordered by start date ascending)
- [ ] DELETE /api/wishlists/{performanceId} from the heart (ended items too)
- [ ] `status` (UPCOMING/ONGOING/ENDED) drives the disabled state
- [ ] Title search: client-side filter on `name`
- [ ] Genre filter: BLOCKED (`WishlistResponse` has no genre)

### H. Calendar (/calendar)

- [ ] GET /api/wishlists?month=yyyy-MM for month/week views; derive
      per-day lists on the client to avoid extra calls
- [ ] GET /api/wishlists?date=yyyy-MM-dd only if a per-day call is truly
      needed (never send `month` and `date` together: 400)
- [ ] Heart in bottom sheet/week list: DELETE wishlist

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