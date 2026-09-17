@AGENTS.md

# CLAUDE.md

## Reference Documents

- Architecture, stack, routing, state, layout decisions: blueprint.md
- Current phase and scope: phase.md ← read Current Scope before any task
- Screen behavior and UI copy: docs/spec/*.md
  Read only docs/spec/common-ui.md and the spec for the screen you are working on.
- Markup rules load automatically from .claude/rules/ (accessibility, mobile).
- Design tokens and mobile base styles: src/app/globals.css.
  Use existing tokens; do not hardcode values a token already covers.

## Commands

- Use pnpm only. Never use npm or yarn.
- Add shadcn/ui components with `pnpm shadcn add <name>` (shadcn is a local
  dependency). Do not hand-write primitives that shadcn provides.
  shadcn here is built on Base UI; do not install Radix packages.
- Typecheck: `pnpm typecheck`. Lint: `pnpm lint`. Format: `pnpm format`.

## Working Rules

- Follow Current Scope in phase.md. Do not exceed it on your own.
- Do not add features I did not ask for.
- Do not perform large refactors I did not ask for.
- No unnecessary abstraction.
- Import cn from the cn package, not from @/shared/lib/utils.
- Check the existing code style and match it. Do not invent a new structure.
- Before creating a component, check src/shared/components and nearby
  _components for one you can reuse.
- UI copy comes from docs/spec verbatim. Never translate, reword, or fix it.
  If a string looks like a typo, report it. If the spec has no copy for
  something, ask instead of inventing it.
- Never leave type errors or lint errors unresolved.
- Fix clear bugs and accessibility problems in files you are already
  changing. Report problems elsewhere instead of fixing them.

## Workflow

Before starting:

1. Read Current Scope in phase.md
2. Read the relevant docs/spec file(s)
3. Review related files and existing patterns
4. Determine the scope of the change
5. Implement in the simplest appropriate way

After finishing:

1. Review changed files
2. Run typecheck, lint, and format
3. Check changed markup against the accessibility and mobile rules
4. Remove TODOs you added (keep `MOCK:` markers)
5. Summarize what changed, in Korean

## Communication

Write code comments in Korean.
Keep documentation (blueprint.md, phase.md, .claude/rules/*) in English.
Respond to the user in Korean.

## Design Source

- Figma is the source for layout, spacing, color, and typography. docs/spec is the source for behavior and copy. If they conflict, stop and ask.
- Map Figma values to tokens in globals.css. Never hardcode hex or px that a token covers; report missing tokens.
- Do not copy Figma frame widths; follow the app container.
- Icons come from @solar-icons/react or lucide-react. Do not inline SVGs exported from Figma.
- Work on one Figma frame (node link) at a time.