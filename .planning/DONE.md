# Done

Completed and shipped items.

---

## 2026-07-08 — Setup + Ghost Workflow UI

- [x] `.planning/` tracking; Electron + React + TS + electron-vite skeleton
- [x] Transparent always-on-top frameless window (bottom-right); `ghostBridge` IPC
- [x] State machine (`types` / `mockData` / `WorkflowContext`) + `GhostShell` routing
- [x] Light glass tokens + panels: Record, Watching, Organizing, Editor, Running, Summary
- [x] Reference1 alignment (hover → recording → editor → running → summary behaviors)
- [x] Verified: `tsc`, `electron-vite build`, Electron boots (`env -u ELECTRON_RUN_AS_NODE`)

## 2026-07-17 — Ghost v2 (reference2.md)

- [x] Pill shell (`GhostPill`): idle / recording / editing / running sizes; apricot hold border
- [x] Interactions: context menu (Open Library / Settings / Hide), drag-follow, ⌥G hotkey
- [x] Record / recording / organizing / editor / running / summary v2 (dark glass, Finish-only stop, Trigger+Upcoming, flat run ledger, expandable summary)
- [x] Workspace window (`#workspace`): sidebar, Workflows home + detail, Activity timeline
- [x] IPC: workspace open, pill run/record/editor commands, drag, menu, close/minimize
- [x] Verified: `tsc`, build, boots

## 2026-07-17 — Pill polish + morph

- [x] Instant resizes + persistent `pillAnchor`; defer bounds during drag
- [x] Hover/drag mutual exclusion (dwell, 4px threshold); smart above/below placement
- [x] macOS `vibrancy: 'hud'` + glass mode; blur / leave / Esc dismissal rules
- [x] Glass hairline strokes (`.glass-stroke-*`); pill↔panel morph from pill silhouette

## 2026-07-19 — Phase 0 foundational refactors (v3)

- [x] Unified `Workflow` + persisted `Run` in `src/shared/types.ts` (pill draft + Library)
- [x] Main-process JSON store (`userData/ghost-data.json`) + IPC sync; pill wired
- [x] `pill:runWorkflow` resolves by id from the store (no hardcoded mock)
- [x] Structured schedule cadence + `nextRun` / `formatSchedule` (Mac local TZ)
- [x] Tokens: `--teal`, `--amber-soft`; question-hold pill uses amber (not apricot)
- [x] Menu-bar tray (Show pill / Open Library / Quit)
- [x] Verified: `tsc`, `electron-vite build`

## 2026-07-19 — Phase 2 Employee Desktop (v3)

- [x] Context menu: Open Library ⌘L · Record a workflow ⌥R · Settings… ⌘, · Hide pill ⌥H; recording variant + “Recording continues”
- [x] Hide recovery via tray + ⌥H (⌥G/⌥R still open record panel)
- [x] Editor: ink-20 fullscreen scrim, ✕ + collapse chrome, fix-step type 10px, hover-only rows
- [x] Trigger-editor popover (cadence segments, chips, live Next-run TZ preview)
- [x] Teal saved status-pill “Workflow saved · Open in Library” → `workspace:open` + focus
- [x] Shared `RunCard` for 6.3 question + 6.4 error holds; mock fail on Crit paste step
- [x] Holds mirror into Activity store (`needsYou`); 10-min error auto-stop
- [x] Summary meta `Done/Stopped · n of m · t`; rose held / skipped / not-yet rows
- [x] Phase 1 shipped as needed: status-pill, run-card, native context-menu
- [x] Verified: `tsc`, `electron-vite build`

## 2026-07-19 — Phase 3 Employee Workspace (v3)

- [x] `WorkspaceApp` subscribed to shared store; home count + hours metric from list/runs
- [x] Workflow detail ⋯ menu: Rename · Duplicate · Move to folder (stub) · Copy share link (stub) · Turn off · Delete…
- [x] Delete confirm over scrim; deletes workflow, keeps `Run` records
- [x] Trigger editor reused from Phase 2 (`TriggerSection` + `onTurnOff`)
- [x] Log tab + run detail backed by persisted `Run`s (seed history included)
- [x] Activity COMING UP from schedule model; skip persists; needs-you Answer/Help → `pill:revealRunning`
- [x] Summary “View log” + Activity Done → run detail deep-link
- [x] Verified: `tsc`, `electron-vite build`

## 2026-07-19 — Phase 4 Onboarding + permissions (v3)

- [x] Hard gate: fullscreen `#onboarding` overlay (desktop inert, no dismiss); tray Quit-only during setup; pill/workspace blocked until complete
- [x] Persisted `onboardingStep` (welcome/team/permissions/complete) — relaunch resumes the same card; empty first-run Library seed
- [x] Store models: `team`, `session` setter, `micSkipped`, revoke-toast timestamps + IPC/preload/bridge
- [x] 1.1 welcome: Continue with Google (browser round-trip stub) · email magic link → “Check your inbox” · rose failure line · Terms in browser
- [x] `ghost://` deep-link handler (magic + invite) via `setAsDefaultProtocolClient` + single-instance/`open-url`; simulated magic-link return
- [x] 1.2 team: Create (auto-named) / Join (invite link-or-code, invalid → rose) · invite-link pre-fill + confirm row · Back keeps session; mocked team service + `Team` model
- [x] Permissions service (`systemPreferences` + `desktopCapturer`): check/request/2s background poll/Settings pane deep-link/`Restart yuh` + IPC
- [x] 2.x checklist card on the step rail (counter, expand/why/Allow/hint, done check, mic Optional + Skip dash, Why popover) + 3.1 denied recovery (apricot block, Settings path, Check again, shake)
- [x] 2.5 complete: Record your first workflow (narration iff mic) / Done → idle
- [x] Shared `Toast` (Phase 1); 3.2 idle revoke → apricot pill + toast w/ next-run stake; mid-run revoke → amber hold, re-grant resumes; record/run preflight + narrate mic-off gating
- [x] 4.1 first-run empty Library (ready-state sub-line, centered record CTA parks window, static hint); Activity/History empty mirror
- [x] Verified: `tsc -b`, `electron-vite build`, Electron boots

## 2026-07-19 — Phase 5 Owner Workspace (v3)

- [x] Team model: `Member` / `Invite` + session `role`; mocked roster, invite/resend/revoke/remove/rename IPC
- [x] Owner home header: `N workflows · Team of M · ≈ H h returned this month` (employee metric unchanged)
- [x] Sidebar Manage nav (owners only); `ManageView` — members, Invite to Team, Edit rename, INVITED, remove confirm
- [x] Activity / workflows / detail baseline unchanged from employee workspace
- [x] Verified: `tsc`

---

> Items land here once work is complete and confirmed working.
