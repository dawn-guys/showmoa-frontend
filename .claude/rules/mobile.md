---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Mobile Rules

Pitfalls to check on every component. One-time base settings (viewport,
text-size-adjust, tap highlight, color-scheme, form resets, fonts) live in
src/app/layout.tsx and src/app/globals.css and are not repeated here.

## Layout & Height

- Never use `h-screen` / `100vh`. Use `min-h-dvh` for full-height layouts,
  `svh` only for areas that must not resize.
- Never put `overflow-x: hidden` on a parent of sticky content; it breaks
  `sticky`. Fix the overflowing element, or use `overflow-x-clip`.
- Never branch layout on viewport width in JS (`window.innerWidth`,
  `useMediaQuery`). Use CSS.

## Fixed Elements

- Every `fixed` element is constrained to the app column:
  `fixed inset-x-0 mx-auto max-w-app`.
- Bottom-anchored fixed UI (bottom nav, bottom CTA) includes the safe area:
  `pb-safe`. Page content above the bottom nav uses `pb-safe-nav`.
- Never place fixed elements inside an ancestor with `transform`, `filter`,
  `backdrop-filter`, or `will-change`. Render them via the root layout or a portal.
- If a drawer primitive offers background scaling (e.g. vaul
  `shouldScaleBackground`), keep it disabled.
- On form screens, the bottom submit button uses normal flow or `sticky`,
  not `fixed` (iOS keyboard misplaces fixed elements).

## Overlays & Back Button

- Every user-opened modal, bottom sheet, and drawer stores its open state in the URL via nuqs with history: 'replace', so opening/closing does not push a history entry. Close them via backdrop, Esc, or an explicit close button — not the browser back button.
- Scrollable content inside sheets and modals uses `overscroll-contain`.
- Scroll locking comes from the shadcn (Base UI) primitive. Do not
  hand-roll `overflow: hidden` on body.

## Inputs

- Input, select, and textarea text is at least 16px (`text-base`) to prevent
  iOS auto-zoom.
- Set `type`, `inputMode`, `autoComplete`, and `enterKeyHint` to match the
  field (email, 6-digit code → `inputMode="numeric"`
  `autoComplete="one-time-code"`, new password → `autoComplete="new-password"`).

## Touch

- Touch targets are at least 44×44px. Small icons get padding, not a larger icon.
- Press feedback uses `active:`. Do not rely on `hover:` for feedback.
- Horizontal swipe areas (carousels, calendar month swipe) do not start at
  the left screen edge (conflicts with iOS back swipe).
- Prefer CSS scroll-snap (`snap-x snap-mandatory overflow-x-auto`) for
  horizontal card lists before reaching for a carousel library.

## Text

- Korean body text uses `break-keep`. Long URLs and emails use `break-words`
  or `[overflow-wrap:anywhere]`.
- Font sizes use rem-based Tailwind scale, not px, so system font scaling works.

## Images & Media

- Every `next/image` has `sizes`, e.g. `sizes="(max-width: 480px) 100vw, 480px"`
  for full-width, smaller for thumbnails.
- Autoplay video needs `autoPlay muted playsInline`.

## JavaScript Compatibility

- Never parse date strings with `new Date("YYYY-MM-DD HH:mm")`
  (Invalid Date on iOS). Use date-fns `parseISO` on ISO 8601 strings.
- Call clipboard and `navigator.share` only inside a user gesture handler,
  and provide a fallback when unsupported.
- Do not rely on `window.open`, popups, or file downloads working; in-app
  browsers often block them.

## Rendering Performance

- No `backdrop-blur`, large shadows, or `filter` on items inside scrolling lists.
- Animate only `transform` and `opacity`.
- Keep `'use client'` on leaf components; do not mark whole pages as client
  components when only a part is interactive.
