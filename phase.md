# Phase

## Current Phase

Phase 1 — UI / Markup

The API contract is not finalized yet. Prioritize screen structure,
UI states, and user interaction.

## Current Scope

In scope:

- Every screen in docs/spec, in both guest and logged-in variants
- Semantic HTML markup and landmark regions
- Web accessibility
- Mobile-only layout (see blueprint.md)
- Feature-level component boundaries
- UI states from the spec: skeleton loading, empty, error toast, success
- Client-side interactions: filters and overlays via nuqs, bottom sheets,
  drawers, modals, calendar month/week toggle, form validation (RHF + Zod)
- Clipboard copy on the detail page (share URL, venue address)
- Map screen with mock venue coordinates. If no Naver Maps key is
  configured, render a placeholder and tell me.

## Data Policy

- UI types may be defined from the fields listed in docs/spec. Each such
  file starts with:
  `// Provisional: based on screen spec, not the API contract.`
- Mock data lives in src/shared/mocks/.
- Route _hooks use useQuery with a queryFn that returns mock data after a
  short artificial delay, so skeleton states actually render.
- Mark every mock swap point with a `// MOCK:` comment.
- Auth state comes from one mock switch in src/shared/mocks/auth.ts so both
  guest and logged-in UIs can be built and checked.
- Mock data must cover spec edge cases: open-run (no end date), ended
  performances, empty lists, long titles that truncate.
- Mock dates are ISO 8601 strings (e.g. 2026-09-16T19:30:00+09:00).

## Out of Scope

- Real API integration, fetch calls, and API client implementation
- Real authentication, sessions, OAuth, and the proxy.ts guard
- In-app browser detection for social login
- Server state tuning (cache time, retries, prefetching)
- Performance optimization
- PWA setup

## Definition of Done

Phase 1 is complete when every screen in docs/spec renders both guest and
logged-in variants against mock data, all spec UI states can be reached,
every user-opened overlay closes with the back button, typecheck and lint
are clean, and the accessibility and mobile rules pass.

## Phase Transition

When the API contract is finalized, update Current Phase, Current Scope,
Data Policy, Out of Scope, and Definition of Done in THIS FILE ONLY.
Do not modify CLAUDE.md or blueprint.md for a phase change.
