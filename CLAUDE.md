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

## Git

### Commits

- Format: `<type>: <description>`. The type is English, the description is
  always Korean. Never write the description in English.
- Types: feat (기능 추가), fix (버그 수정), ui (동작 없는 마크업·스타일),
  refactor (동작 변화 없는 구조 개선), chore (설정·패키지·빌드), docs (문서).
- Atomic: one commit, one purpose. Do not mix unrelated changes.
  If a change genuinely spans several things, say so honestly in the message
  instead of forcing a split.
- Description: state plainly what was done, in noun or past form
  (추가, 수정). No trailing period.
  Example: `ui: 목록 카드 레이아웃 조정`
- Run typecheck and lint before committing.

### Branches

- Format: `<type>/<작업-내용>`, using the same types as commits.
  The work part is Korean, words joined with hyphens. Keep it short and specific.
  Example: `feat/공연-목록`, `fix/지도-마커`
- main always stays deployable. There is no develop branch.
- Before starting a task, check the current branch. If it is main, or
  unrelated to this task, create a new branch from the latest main and tell
  me the name. If I already made changes on main, carry them over with
  `git switch -c <branch>` — never stash or discard them.

### Pull requests

- Base is main. Title and body in Korean: what changed, why, how to verify,
  and the related docs/spec file.
- After a PR is merged, delete the branch.

### Rules for Claude

- Commit, push, and open PRs only when I ask. Never do it automatically.
- Show me the commit message and PR body before creating them.
- Write all responses in Korean, including intermediate progress messages.
- Keep code, commands, and file names in their original form.
- For error messages, show the original text along with a Korean translation/explanation.