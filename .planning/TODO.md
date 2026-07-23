# To-Do — v4 polish + Teams/Shared

Source of truth: inline v4 edit list (no reference doc). Baseline: shipped v3
build per `DONE.md` / `.planning/reference3.md`.

Strategy: mostly **in-place visual/behavior edits** on Employee Desktop +
Library; Teams/Shared are the only net-new workspace surfaces (reuse owner
`ManageView` patterns). Phases 0–3 are independently implementable after
tokens; Phase 4 depends on the shared store + team model from v3.

---

## Delta from v3 (summary)

**v3 complete — see `DONE.md`.**

**Changed (modify existing)**
- Global type → Instrument Sans on pill + panels + workspace (load font for
  real; today `globals.css` names it but has no `@font-face` / no font file).
- Transparent window glass → `#161427` at 15% opacity (`globals.css` /
  `main/index.ts` vibrancy).
- Idle pill: “Hello” → **two circles** (`GhostPill.tsx` / `StatusPill.tsx`);
  pill width stays compact (does not stretch to “Record a workflow”).
- Hover UI + recording pill: unify **fill vs stroke border-radius** on glass
  stroke / panel / pill (`globals.css`, `components.css`).
- “Narrate while recording” control color fix (`RecordPanel.tsx` + toggle
  styles).
- Selected-tab re-hover: drop white highlight → darker selected hover
  (`.segment-active` — record-panel segments are the surface with the white
  fill today; workspace `.ws-tab` has no hover rule, so it is out of scope).
- “Start Recording” hover = white fill + black text (transition-to-recording).
- Cancel (+ ✕) hover = very light red bg, radius 6 (`.cancel-link`).
- Expanded desktop panels + summary: **movable**; summary scrim greys desktop
  **only when that window is frontmost**; allow selecting other tabs to send
  it behind.
- Trigger control: default white, grey on hover (button appears on hover) —
  not grey-filled at rest (`.trigger-row` in `TriggerSection.tsx`).
- App chips editable/deletable on summary: edit → rewrite “Open … in ___”;
  unique-to-app events → whole event changes (`AppChip.tsx`, `StepList.tsx`,
  `SummaryPanel.tsx`). Scope is the summary screen; the editor inherits for
  free only because `StepList`/`AppChip` are shared — no separate editor task.
- Library: background blur 30 + `#3E2B49` @ 20% shadow; window
  draggable/movable (`workspace.css`, `main/index.ts`).

**Added (net-new)**
- Employee (+ Owner) sidebar: **Teams** page (roster of members + invited +
  owner; owner not removable) — reuse `ManageView.tsx` / team service;
  employee may be view-oriented but same list grammar as v3 Manage.
- **Shared** page: team-shared workflows; each row/chip shows who shared.
- Workflow Overview: **Share to Team** (Employee + Owner); Workflows =
  personal; Shared = team library.
- Workflow model + store fields for share metadata (`sharedBy`, team scope) —
  currently absent on `Workflow` in `types.ts`.

**Unparked from Later**
- Promote to team / team library view → concrete Share/Shared/Teams tasks in
  Phase 4.

---

## Phase 0 — Global tokens (fonts + glass)

- [x] **Ship Instrument Sans for real** (`@fontsource/instrument-sans` 400/500/600
      imported in `main.tsx`; global stack in `globals.css` inherited by pill,
      panels, and workspace — Inter removed as primary fallback).
- [x] **Transparent windows:** fill `#161427` / 15% opacity — `--glass-bg` and
      `--glass-panel-bg` both `rgba(22, 20, 39, 0.15)` in `globals.css`
      (vibrancy backdrops in `main/index.ts` unchanged). Radius unification is
      Phase 1's border task, not here.

## Phase 1 — Pill + hover / record UI

- [x] Idle pill: two circles instead of “Hello”.
- [x] Pill width: keep the compact pill length — do not stretch to the
      “Record a workflow” text width.
- [x] Fix narrate-while-recording color.
- [x] Unify border radii: hover panel containers, glass stroke, recording
      pill (stroke radius = fill radius).
- [x] Selected tab re-hover → darker (no white flash) on `.segment-active`.
- [x] Start Recording hover → white + black text.
- [x] Cancel / cancel symbol hover → light red background, `border-radius: 6`.
- [x] Expanded hover/record chrome movable (extend drag beyond pill-only
      `GhostPill` / `pill:dragStart` path).

## Phase 2 — Summary / desktop window behavior

Fonts here are already covered by Phase 0's global stack (no separate task).

- [x] Summary window movable — reuse the Phase 1 drag path (same
      `pill:dragStart` mechanism extended to expanded panels), not a second
      drag implementation.
- [x] Clicking other app tabs can send summary behind; grey scrim **only while
      summary is frontmost**. Reuse the editor's existing scrim window
      (`setEditorScrim` in `WorkflowContext` / main) — summary has no scrim
      today, so this is wiring the existing one, not building a new overlay.
- [x] Trigger control: white default, grey + visible button on hover. Fix
      lives on `.trigger-row` in `TriggerSection.tsx` (`background:
      var(--white3)` at rest); note `TriggerSection` renders in `EditorPanel`
      / `WorkflowDetail` today, not `SummaryPanel` — confirm the target
      surface against the design at impl time.
- [x] App chip modify/delete on summary (prompt for app when step has `___`;
      whole-event edit when app-unique).

## Phase 3 — Library chrome

- [x] Library backdrop: blur 30 + `#3E2B49` at 20% opacity.
- [x] Library window draggable/movable (strengthen frameless drag beyond
      current `.ws-drag-strip` if needed).

## Phase 4 — Teams + Shared + Share to Team

“Workflows” stays as-is (already the user's own workflows) — constraint, not
a task.

- [x] Extend `Workflow` + store for team share (`scope` / `sharedBy` / sharer
      display name).
- [x] Sidebar: add **Teams** (both roles) — members, invited, owner listed;
      owner not removable (reuse Manage roster; owner keeps invite/remove
      where role allows). **Default:** Teams page is the Manage surface for
      both roles; remove duplicate “Manage-only-if-owner” nav in favor of
      Teams.
- [x] Sidebar: add **Shared**; list team-shared workflows with “shared by …”
      chip. Reuse `WorkflowsHome` row grammar for the list and the existing
      `manage-role-chip` styling for the chip — no new list or chip
      component.
- [x] Overview: **Share to Team** button on the workflow detail header
      (Employee + Owner) — sits with the existing header actions in
      `WorkflowDetail.tsx` (where the ⋯ menu / Copy-share-link stub already
      lives). Semantics: share = workflow appears in Shared with the sharer
      chip and remains in the owner's Workflows list.
- [x] Owner Workspace gets the same Teams / Shared / Share to Team wiring
      (covered by the Teams-as-Manage default above — same surfaces, role-
      gated actions).

---

## Remaining polish (carried from v2/v3 — still open)

- [ ] Native ⌥ (bare Option) hotkey — currently ⌥G; needs low-level keyboard hook
- [ ] Real running-app list + live full-screen thumbnail in the record panel
- [ ] Per-step timing/details in summary row expansion (currently mock copy)

## Later / Future work (parked, not active)

- [ ] Folders — group headers reusing caps-label grammar + "+ New folder"
- [ ] Join a team beyond onboarding (create team post-hoc, what joining shares)
- [ ] Ownership transfer (owner row ✕ disabled for now)
- [ ] Settings — app scope controls, pause defaults, notification/digest prefs
- [ ] Search — deferred until lists outgrow a screen
- [ ] Real auth backend (Google OAuth + magic-link delivery) behind the
      onboarding service interface
- [ ] Real team backend (invites, membership) behind the team service
      interface

## Later / AI (deferred)

- [ ] Real screen + input capture (desktopCapturer)
- [ ] Summarize workflow with AI provider
- [ ] Create + run an agent that performs the steps (incl. real step failures
      for the 6.4 error card)
- [ ] Configure OpenAI / Anthropic API key via settings panel
- [ ] Stream token responses from AI provider
- [ ] Support multiple AI providers (OpenAI, Anthropic, local Ollama)
- [ ] Dark mode support
- [ ] Auto-updater (electron-updater)
- [ ] Code-sign and notarize for macOS distribution
- [ ] Publish to GitHub Releases via CI
