# show moa Blueprint

Structural decisions and the reasons behind them. This file changes rarely.
Behavior rules for Claude live in CLAUDE.md, the current phase in phase.md,
and markup checklists in .claude/rules/.

## Project Goal

show moa is a performance discovery platform for Korea. Performance and venue
information is scattered across venues, ticketing sites, portals, and social
media, so exploratory questions ("what's on near me this weekend?") are hard
to answer.

show moa turns this into one flow:
discover → compare → save (wishlist) → manage schedule (calendar) → go to the
official ticketing site.

Genre categories, region filters, map-based venue discovery, a personal
calendar, and a wishlist support that flow.

## Tech Stack

| Layer         | Choice                    | Package                                                              |
| ------------- | ------------------------- | -------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router)   | next                                                                 |
| UI library    | React 19                  | react, react-dom                                                     |
| Language      | TypeScript                | typescript                                                           |
| Styling       | Tailwind CSS v4           | tailwindcss, @tailwindcss/postcss                                    |
| UI primitives | shadcn/ui on Base UI      | shadcn (CLI), @base-ui/react                                         |
| shadcn support| Installed by shadcn CLI   | class-variance-authority, cn, clsx, tailwind-merge, tw-animate-css   |
| Icons         | Solar Icons, Lucide       | @solar-icons/react, lucide-react                                     |
| Animation     | Motion                    | motion                                                               |
| Server state  | TanStack Query            | @tanstack/react-query                                                |
| URL state     | nuqs                      | nuqs                                                                 |
| Client state  | Zustand                   | zustand                                                              |
| Forms         | React Hook Form + Zod     | react-hook-form, zod, @hookform/resolvers                            |
| Dates         | date-fns                  | date-fns                                                             |
| Map           | Naver Maps JS API v3      | loaded via next/script, @types/navermaps                             |
| Lint/format   | ESLint, Prettier          | eslint, eslint-config-next, eslint-config-prettier, @tanstack/eslint-plugin-query, prettier, prettier-plugin-tailwindcss |
| Package mgr   | pnpm                      |                                                                      |
| Deploy        | Vercel                    |                                                                      |

Do not add libraries outside this list without asking.

## Development Phases

Phase 1 — UI / Markup
  Screen structure, semantic markup, accessibility, mobile layout,
  component boundaries, and UI states driven by mock data.

Phase 2 — API Integration
  Connect real data once the API contract is finalized.

Phase 3 — Optimization
  Rendering, network, caching, bundle, and image optimization.

Do not record which phase is currently active here. phase.md owns that.

## Architecture — Colocation

Keep a component and the files it uses as close together as possible.

- Route-only components and hooks live inside that route:
  app/<route>/_components, app/<route>/_hooks.
  Underscore folders are excluded from routing.
- Promote to src/shared/ only when two or more routes actually use it.
  Keep src/shared/ small; a bloated shared folder defeats colocation.
- src/shared/components/ui/ holds shadcn/ui primitives. Build domain
  components (PerformanceCard, HeartButton, RegionFilterDrawer, GenreTabs)
  on top of them in src/shared/components/ instead of heavily editing primitives.
- App-wide layout pieces (BottomNav, Header, AppBar) live in app/_components.
- Route groups split screens by shell, not by access control.
  Route groups do not change URLs.
  - (tabs): screens that show the bottom nav (/, /map, /search, /calendar,
    /wishlist, /detail/[id]). Its layout renders BottomNav.
  - (auth): auth form screens without the bottom nav (/login, /signup,
    /password/find, /password/update). Shares form parts such as email
    verification and password inputs.
  - /notification and /setting sit outside both groups (AppBar, no bottom nav).
- Headers differ per screen (none on /map, guest/logged-in variants
  elsewhere), so each page renders its own Header or AppBar. Layouts do not.

Why: when working on one route, only that route's folder needs to be read,
and the bottom nav is mounted once instead of per page.

```
src/
  app/
    layout.tsx, providers.tsx, not-found.tsx, globals.css
    _components/
    (tabs)/
      layout.tsx
      page.tsx
      map/ search/ calendar/ wishlist/ detail/[id]/
    (auth)/
      layout.tsx
      login/ signup/ password/find/ password/update/
    notification/ setting/
  shared/
    components/ui/   components/
    hooks/  stores/  lib/  types/  constants/  mocks/
  proxy.ts          (Phase 2 auth guard; Next.js 16 name for middleware)
```

## Routing & Auth Branching

- Guest and logged-in variants of a screen share one URL. Branch at the
  component level; never create separate routes per auth state.
- Personal pages never put a user id in the URL. Identity comes from the session.
- /notification and /password/update require login (proxy.ts guard).
  Every other route is public; login-only actions (e.g. wishlist) open a
  login prompt modal instead.

| Screen          | Path              | Access                                   |
| --------------- | ----------------- | ---------------------------------------- |
| Home            | /                 | public, UI branches on auth              |
| Map             | /map              | public, ?search={venue address}          |
| Search          | /search           | public, header branches on auth          |
| Calendar        | /calendar         | public, guest sees login prompt UI       |
| Wishlist        | /wishlist         | public, guest sees login prompt UI       |
| Detail          | /detail/[id]      | public, like action requires login       |
| Setting         | /setting          | public, UI branches on auth              |
| Notification    | /notification     | login required                           |
| Login / Signup  | /login, /signup   | guest only                               |
| Find password   | /password/find    | guest only                               |
| Update password | /password/update  | login required                           |
| 404             | not-found.tsx     | -                                        |

## State Management

Each piece of state lives in exactly one place:

- Server state (performances, wishlist, calendar, current user) → TanStack Query
- URL state → nuqs
  - Filters and view toggles (search genre/region, wishlist category,
    calendar month/week): default history mode (replace).
  - Open state of every user-opened overlay (modals, bottom sheets,
    drawers): history "push", so the Android/browser back button closes
    the overlay instead of leaving the page.
- Pure client flags that must not live in the URL (splash shown today,
  location consent seen, auto-opened overlays) → Zustand

Never mirror URL state or server state in Zustand.

Why: filters survive refresh and back navigation, back closes overlays as
users expect on mobile, and each state has a single source of truth.

## Domain Constants

Genre categories are fixed service-wide: 연극, 뮤지컬, 콘서트, 클래식, 기타.
Every genre filter UI prepends "전체". Define them once in
src/shared/constants/genre.ts and import everywhere.

## Component Architecture

Split components by: functional responsibility, UI responsibility,
reuse need, and state ownership.

- No single component should carry too many responsibilities.
- Do not split components merely to reduce file length.
- Forms use React Hook Form + Zod.

## Mobile-Only Layout

show moa is a mobile-only web app. There is no tablet or desktop layout.
On wider screens the app renders as a phone-width column centered on a
neutral background.

- Supported width: 320px to 480px. Designs are based on 375/390px.
- The root layout owns the app container. Its width, the bottom nav height,
  and safe-area spacing are design tokens defined in globals.css.
- Width-dependent styling is CSS only.
  Why: the server has no window, so branching layout in JavaScript causes
  hydration mismatch and flicker.
- Fixed UI (bottom nav, bottom CTAs, toasts) must stay anchored to the
  viewport, so page transitions and drawers never transform its ancestors.
  Why: transform/filter on an ancestor re-anchors position: fixed to that
  ancestor, which breaks the bottom nav.
- The concrete checks for both decisions are in .claude/rules/mobile.md.
- Real-device and KakaoTalk in-app browser checks are manual QA and are
  not part of Claude's rules.

## Accessibility Strategy

Accessibility is applied during markup, not bolted on afterwards.
Semantic HTML and landmarks are the baseline. The document language is
Korean (`<html lang="ko">`). Pinch zoom is never disabled.

The detailed checklist belongs in .claude/rules/accessibility.md.

## API Integration Strategy

Integrate an API only after its contract is finalized. Never invent or
guess a backend response shape.

Components never fetch or import data sources directly. Data flows through
route _hooks backed by TanStack Query, so moving from mock to real data
only changes each hook's queryFn.

Known constraint for integration: most traffic arrives through links shared
in KakaoTalk, whose in-app browser blocks Google OAuth
(disallowed_useragent). Social login must detect in-app browsers and hand
off to an external browser.

Do not record whether the contract currently exists. phase.md owns that.

## Optimization Strategy

Feature and UI implementation come first; optimization is Phase 3.
Exception: fix clear performance defects or structural problems immediately.
