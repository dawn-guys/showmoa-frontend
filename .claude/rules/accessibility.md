---
paths:
  - "src/**/*.tsx"
---

# Markup & Accessibility Rules

## Semantic HTML

Use elements that match meaning: header, nav, main, section, article,
aside, footer, button, form, label, fieldset, legend, ul, ol.
Do not build everything out of `div` for styling.

## Landmarks

- One `main` per page. Header/AppBar, the bottom nav, and the footer sit
  outside `main` as their own landmarks (`header`, `nav`, `footer`).
- Keep landmark roles and hierarchy unambiguous.

## General Rules (WCAG)

- Every primary function works with the keyboard alone.
- `button` for actions, `a`/`Link` for navigation. No click handlers on bare `div`.
- Every form control has a label.
- Meaningful `alt` for posters; empty `alt` for decorative images.
- Logical heading hierarchy.
- Never convey state or meaning by color or visuals alone.
- Clearly visible focus state (`focus-visible`) on every interactive element.
  Hover styles need a matching focus style.
- Every interactive element has an accessible name. Prefer visible text;
  use `aria-label` only when there is no visible text (e.g. icon-only buttons).
- Prefer native HTML semantics over ARIA.
- Never build UI that only responds to mouse or touch gestures.

## Project Patterns

- Icon-only buttons (back arrow, bell, gear, share, copy, heart, password
  eye toggle) need a Korean accessible name.
- Heart buttons and the password visibility toggle expose state with `aria-pressed`.
- Bottom nav and header links mark the current page with `aria-current="page"`.
- Modals, bottom sheets, and drawers use shadcn primitives (Dialog, Sheet,
  Drawer). Keep focus trap, Esc to close, focus return, and a title.
  Never replace them with custom div overlays.
- Input errors: set `aria-invalid` and link the message with
  `aria-describedby`. A toast alone is not enough.
- Swipe/drag interactions (calendar month swipe, bottom sheet handle,
  horizontal card lists) need a button or keyboard alternative.
- Map markers are not the only way to reach a venue; its performances must
  be reachable as a list.
- Calendar per-performance colors are supplementary; titles stay readable text.
- Truncated titles (ellipsis) keep the full title available to assistive tech.
- Ended performances in the wishlist are non-links, with the ended state shown as text.
- Skeleton containers use `aria-busy="true"`; skeleton shapes are hidden from assistive tech.
- Respect `prefers-reduced-motion` for Motion animations (splash, heart,
  sheets), e.g. `MotionConfig reducedMotion="user"`.
- The verification countdown timer must not announce every tick.
- External links opened in a new tab (footer GitHub links) indicate that.
