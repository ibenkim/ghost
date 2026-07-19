# To-Do — v3 migration plan

Source of truth: `.planning/reference3.md` (v3). Baseline: shipped v2 build per
`DONE.md` / `.planning/reference2.md`. Figma references arrive per-feature at
implementation time — tasks below define scope + wiring only, not visual detail.

Strategy: Employee Desktop + Employee Workspace are **evolutions** of the v2
code (extend in place). Onboarding + Owner Workspace are **new**. Phases 0–1
are prerequisites; after that, phases 2–5 are independently implementable.

---

## Delta from v2 (summary)

**Kept (reuse as-is or near-as-is)**
- Pill state machine `AppState` (`state/types.ts`) + all transitions in
  `WorkflowContext.tsx` — v3 adds no new top-level states, only sub-states
  (run question/error, revoked-permission hold).
- All panels: `RecordPanel`, `LearningPanel`, `EditorPanel`, `RunningPanel`,
  `SummaryPanel`; shared `StepList`, `TriggerSection`, `AppChip`, `Toggle`.
- Pill window mechanics: bounds/morph, backdrops, drag, hover/Esc dismissal,
  ⌥ hotkey, `ghostBridge` IPC surface.
- Workspace shell: `WorkspaceApp`, `Sidebar` (team-menu), `WorkflowsHome`
  (rows, On/Off toggle, Suggested card), `WorkflowDetail` Overview,
  `ActivityView` groups (COMING UP / TODAY / YESTERDAY, skip occurrence).

**Changed (modify existing)**
- Tokens: add `--teal` (+ amber-soft tint); normalize amber = needs answer,
  rose = failed/stopped, teal = done/saved across all surfaces.
- Context menu: new items/shortcuts (Open Library ⌘L · Record a workflow ⌥R ·
  Settings… ⌘, · Hide pill ⌥H) + recording variant ("Recording continues").
- Editor: ink-20 scrim behind panel, ✕ beside collapse chevron, hover-only row
  highlight, fix-step type 9–10px, teal saved pill "Workflow saved · Open in
  Library".
- Trigger: preset strings → real schedule model + trigger-editor popover
  (shared by editor 5.2 and workspace 1.6).
- Running: ask-each-time card formalized as question card (6.3) + new error
  card (6.4) with Retry / Skip / Take over + 10-min hold policy.
- Summary: meta "Done · 6 of 6 · 1:12" / "Stopped · 3 of 6 · 1:12"; row
  states add `held` (rose) and `skipped` chip.
- Workflow detail: ⋯ overflow menu + delete confirm; Log tab gets real
  per-run content (1.7).
- Activity: new needs-you row (2.5), amber/rose holds.
- `pill:runWorkflow` must honor `workflowId` (currently ignored).

**Added (net-new)**
- Onboarding: welcome/auth → team create/join → permissions checklist →
  denied recovery → complete; permission-revoked handling post-setup;
  first-run empty Library.
- Owner Workspace: 03-Manage (members, invite, INVITED, remove confirm) +
  owner home header team metric.
- Infra: shared pill↔workspace data store, persistence, tray (menu-bar icon),
  permissions service, mocked auth/team service.
- Micro-UI shipped as real components: status-pill, context-menu, toast,
  run-card (question/error), tooltip.

---

## Phase 0 — Foundational refactors (before any feature work)

Everything downstream depends on these; do first, keep each change minimal.

- [x] **Unify the workflow model.** Merge `Workflow` (pill draft) and
      `WorkflowRecord` (workspace list) in `state/types.ts` into one `Workflow`
      entity with `id`; add a persisted `Run` entity (id, workflowId,
      started/ended, outcome, per-step results + timestamps, question receipts,
      artifact links, returned-time figure). Migration note: `makeRunSteps`
      currently derives ephemeral run state — keep it, but have runs write a
      `Run` record on completion/stop.
- [x] **Shared data store across windows.** Main-process store for workflows /
      runs / activity / suggestion, synced over IPC (single source; renderers
      subscribe); wire the pill (`WorkflowContext`) to it in this task —
      workspace migration is Phase 3's first task. Required by: saved→"Open in
      Library", Activity run outcomes ("runs record outcome even when the
      workspace was never opened"), needs-you rows, Log tab, Suggested
      discard-forever.
- [x] **Persistence** (`electron-store` or JSON file in `userData`): workflows,
      runs, discarded suggestions, last-used record settings, pill position,
      onboarding-complete flag, session. Mock data becomes the seed on first
      run only.
- [x] **Fix `pill:runWorkflow`** to look up and run the workflow by `id` from
      the shared store (currently always runs `MOCK_WORKFLOW`).
- [x] **Schedule model.** Replace `Trigger.schedule/upcoming` display strings
      and `SCHEDULE_PRESETS` with structured cadence (Daily / Weekly / Monthly /
      Custom + params) and a `nextRun(trigger)` computation (Mac time zone).
      Feeds: Upcoming preview, trigger editor live "Next run", Activity
      COMING UP generation. (Absorbs v2 polish item "Live Upcoming
      computation".)
- [x] **Tokens:** add `--teal` + amber-soft tint to `globals.css`; audit
      existing amber/apricot/rose usage against the v3 semantic mapping.
- [x] **Tray (menu-bar icon)** in main: needed for "Hide pill → menu-bar icon
      brings it back" and onboarding's "quit from the menu bar icon".

## Phase 1 — Shared micro-UI components (v3-components shelf)

Extract-then-extend; no visual redesign until Figma refs arrive per component.

- [x] **status-pill:** formalize `GhostPill` status variants (Hello / Learning /
      Thinking / running / paused / saved) incl. amber/rose/apricot pill
      coloring as props, not ad-hoc state checks. *(shipped with Phase 2)*
- [ ] **toast:** real component (success / error / info) replacing the
      `toast: string` text-in-pill hack in `WorkflowContext`; slides in above
      the pill. First consumer: the permission-revoked toast (Phase 4). (The
      saved confirmation is a status-pill state, not a toast — see Phase 2.)
- [x] **run-card:** one inline card component with `question` (amber) and
      `error` (rose) variants, chip grammar shared with fix-step 5.4
      (reuse chips from `StepList`). Consumed by Phase 2 (6.3/6.4) and Phase 4
      (revoked-mid-run). *(shipped with Phase 2)*
- [x] **context-menu:** if the native `Menu` can't match design, move to a
      rendered menu component with idle / recording variants; otherwise update
      the native menu (see Phase 2 first task). *(native Menu updated in Phase 2)*
- [ ] **tooltip:** small shared component (hotkey hint, etc.).

## Phase 2 — Employee Desktop (evolve v2 pill)

- [x] Context menu contents: Open Library ⌘L · Record a workflow ⌥R (wired to
      open the record panel) · Settings… ⌘, · Hide pill ⌥H; recording variant
      appends "Recording continues" under Hide pill (`pill:contextMenu` in
      `src/main/index.ts` needs the state passed through — currently gets none).
- [x] Hide pill recovery via tray icon (Phase 0 tray) in addition to ⌥.
- [x] Editor chrome (`EditorPanel`): ink-20 scrim over desktop behind the
      panel (likely a backdrop-window or fullscreen overlay in main — decide
      during impl); ✕ button beside collapse chevron wired to the Cancel/confirm
      path; hover-only step-row highlight (remove any pre-selected row);
      fix-step type size bump.
- [x] Trigger row (`TriggerSection`): swap preset picker for the trigger-editor
      popover backed by the Phase 0 schedule model (same component ships in
      Workspace 1.6 — build once here, reuse there).
- [x] Save confirmation: teal status-pill "Workflow saved · Open in Library";
      click → `workspace:open` focused on that workflow (new IPC param);
      reverts to "Hello" after ~6s or on click.
- [x] Running 6.3 question card: refactor existing ask-each-time flow in
      `RunningPanel` onto the shared run-card; header appends "· needs an
      answer"; pill turns amber; auto-expand when collapsed; sub-line "Run is
      holding — answering resumes automatically"; record the Q&A as a receipt
      on the `Run` entity (consumed by Log 1.7); no timeout.
- [x] Running 6.4 error card (new): rose run-card at the failed step with
      Retry / Skip step / Take over; Take over pauses, resume continues from
      next step; 10-minute hold → auto-stop → summary "Stopped — needed help
      at step n"; pill turns rose; auto-expand. (Mock the failure trigger —
      real step execution is deferred AI work.)
- [x] Both holds mirror into Activity via the shared store (row rendering is
      Phase 3's 2.5 task).
- [x] Summary (`SummaryPanel`): meta format "Done · 6 of 6 · 1:12" /
      "Stopped · 3 of 6 · 1:12"; row states done / done-voice / held (rose) /
      skipped (chip) / not-yet. ("View log" → run detail routing lands with
      Phase 3's last task, once 1.7 exists.)

## Phase 3 — Employee Workspace (evolve v2 workspace)

- [x] Wire `WorkspaceApp` to the shared store (drop local mock state); home
      header count mirrors the visible list.
- [x] 1.5 ⋯ overflow menu on `WorkflowDetail` header: Rename ⏎ (inline title
      edit) · Duplicate ⌘D ("Copy of [name]", Off, opens its detail) · Move to
      folder… (stub — Folders is future work) · Copy share link ⌥⌘C (stub) ·
      Turn off · Delete… (rose).
- [x] Delete confirm dialog over scrim (copy names what's preserved: runs stay
      in History; scheduled runs stop immediately); Esc = Cancel; deletion
      removes from store, keeps `Run` records.
- [x] 1.6 Trigger editor popover on detail Overview — reuse the component built
      in Phase 2; footer: Turn off trigger · Cancel · Save trigger; live
      "Next run … uses this Mac's time zone" preview; Esc/click-away = Cancel.
- [x] 1.7 Log tab (replace static `LogTab` in `WorkflowDetail`): month-grouped
      run rows (date/time · outcome incl. question count · "≈ 36 min returned";
      stopped runs show no return figure), backed by `Run` records.
- [x] 1.7 Run detail view: "‹ All runs" · header + meta ("… · 1 question
      answered · ran unattended") · per-step rows with timestamp + teal check,
      Skipped chips, rose held step; question receipts (amber sub-line, click →
      "Always use this answer" converts Ask-each-time to fixed choice on the
      workflow); artifact links out; feedback footer "Looks right / Something's
      off — fix a step" deep-linking into Overview with that step in edit mode.
- [x] Activity: generate COMING UP rows from the schedule model (replace static
      mocks); per-occurrence skip persists.
- [x] 2.5 needs-you row in `ActivityView`: amber "waiting on your answer since
      …" + Answer → opens the pill's running question card (`pill:` IPC);
      rose "needs help" variant; after the 10-min error hold stops the run,
      row reads "Stopped — needed help at step n".
- [x] Summary "View log" / Activity "Done" rows route to run detail (1.7).

## Phase 4 — Onboarding + permissions (new)

New surface; gate the whole app behind it via the persisted onboarding flag.

- [ ] **Onboarding window + route** (`#onboarding`): centered card, desktop
      inert behind it; no Esc/dismiss; quit only via tray; relaunch returns to
      the same step (persist step progress). Pill + workspace unavailable until
      complete.
- [ ] **Auth service (mocked behind an interface):** Continue with Google
      (system browser round-trip) and email magic link ("Check your inbox"
      sub-state); failure → quiet rose line; Terms & Privacy open in browser.
      Register a deep-link handler in main (custom URL scheme) for the
      magic-link and invite-link return paths. Real backend is a later item —
      build the flow against a stub so it can be swapped.
- [ ] **1.2 team step:** Create (auto-named from account) / Join (inline
      invite link-or-code field; invalid → rose stroke + sub-line); arrived-via-
      invite variant pre-fills Join with confirm row; Back → 1.1 showing
      signed-in account. Joining never skips permissions. Introduces the mocked
      team service + `Team` model that Phase 5 extends.
- [ ] **Permissions service (main process):** `systemPreferences` checks +
      request for Screen Recording, Accessibility, Microphone; background
      polling; deep-links into the exact System Settings pane; relaunch-required
      handling for screen recording; expose status over IPC to both renderers.
- [ ] **2.x checklist card:** three numbered rows reusing the step-row rail;
      counter "1 of 3" → "Done"; current row expands (why-copy + Allow +
      macOS hint), done rows collapse to check; mic row Optional with "Skip for
      now" (hollow dash); "Why does yuh need this?" popover; no skipping ahead
      except mic.
- [ ] **3.1 denied recovery:** same card, amber "Needs your OK" state (fix-step
      grammar), System Settings deep-link, "Check again" re-poll + background
      auto-resolve, shake on still-off; reused for all three rows. Individual
      permission cards can re-raise standalone post-onboarding; the full flow
      never replays.
- [ ] **2.5 complete:** "Record your first workflow" → record panel open
      (narration on iff mic granted) · "I'll explore first" → idle.
- [ ] **3.2 permission-revoked while idle:** apricot pill dot + "Paused —
      needs permission" (never auto-tucks while apricot); toast (Phase 1
      component) with the concrete stake, shown once at revocation + re-raised
      1h before any affected run; Dismiss → toast only, pill stays apricot,
      runs stay held; Fix in System Settings → deep-link; re-grant resolves
      toast + pill, held run starts if still inside its window, else Activity
      logs "Missed — permission was off".
- [ ] **3.2 permission-revoked mid-run:** pause after the in-flight action
      (6.1 rule); panel auto-expands with the amber run-card inline at the
      active step; resolves like a question card — re-grant resumes
      automatically.
- [ ] **Desktop permission gating:** record panel Start Recording disabled +
      inline note when screen permission missing (routes to recovery card);
      narrate toggle reads "mic is off — turn on in Settings" when mic
      skipped/denied and re-raises the mic block as a standalone card; record +
      run paths preflight screen permission and route back to recovery.
- [ ] **4.1 first-run empty Library:** empty-state Workflows home (ready-state
      sub-line, no zero metric; "Record a workflow" parks window + opens
      panel; static suggestion hint until first real Suggested card); retires
      after first save; History empty state mirrors it.

## Phase 5 — Owner Workspace (new)

Everything matches Employee Workspace except 03-Manage + home header. Extends
Phase 4's team service with `Member` / `Invite` + a role on the session.

- [ ] Owner home header team metric: "6 workflows · Team of 4 · ≈ 21 h
      returned this month" (employee keeps personal metric).
- [ ] 3.1 Manage view inside the workspace (entry point per design ref):
      "Manage Team" header · member count · "Invite to Team" · Edit (inline
      team rename); MEMBERS list with role chips; hover → ✕ (not on owner's
      own row).
- [ ] 3.2 Invite: inline email field in header area; Enter sends → INVITED row;
      invalid → rose stroke + sub-line.
- [ ] 3.3 INVITED section: email · "invited 2 days ago" · Resend (resets
      timestamp) · Revoke (rose, no confirm); 14-day expiry → grayed "expired",
      Resend remains.
- [ ] 3.4 Remove confirm dialog (scrim): copy per spec; on remove, member
      leaves list; Activity keeps their past runs attributed; their scheduled
      team runs stop.

---

## Remaining polish (carried from v2 — still open)

- [ ] Native ⌥ (bare Option) hotkey — currently ⌥G; needs low-level keyboard hook
- [ ] Real running-app list + live full-screen thumbnail in the record panel
- [ ] Idle "Hello" slot → logo/mark once that design lands
- [ ] Per-step timing/details in summary row expansion (currently mock copy)

## Later / Future work (from reference3.md — parked, not active)

- [ ] Folders — group headers reusing caps-label grammar + "+ New folder"
- [ ] Promote to team — scope chip on detail header + move-to-team confirm;
      team library view
- [ ] Join a team beyond onboarding (create team post-hoc, what joining shares)
- [ ] Ownership transfer (owner row ✕ disabled for now)
- [ ] Settings — app scope controls, pause defaults, notification/digest prefs
- [ ] Search — deferred until lists outgrow a screen
- [ ] Real auth backend (Google OAuth + magic-link delivery) behind the Phase 4
      service interface
- [ ] Real team backend (invites, membership) behind the Phase 5 service
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
