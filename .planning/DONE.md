# Done

Completed and shipped items.

---

## 2026-07-08 — Initial project setup

- [x] Created `.planning/` folder with TODO, IN_PROGRESS, and DONE tracking files
- [x] Established Electron + React + TypeScript + electron-vite project skeleton
- [x] Configured transparent, always-on-top, frameless BrowserWindow pinned to bottom-right
- [x] Added IPC preload bridge (`window.ghostBridge`) for renderer ↔ main communication
- [x] Fixed build entry path (`out/` instead of `dist/`) and inlined tsconfig options

## 2026-07-08 — Ghost Workflow UI (Figma state machine)

- [x] Rewrote `.planning` docs around the state workflow; parked chat/AI items
- [x] Built state machine: `state/types.ts`, `state/mockData.ts`, `state/WorkflowContext.tsx`
- [x] `GhostShell` routes each `AppState` to its panel; `App` mounts the provider
- [x] Light glass design tokens (`globals.css`) + panel styles (`components.css`)
- [x] `GhostBubble` (idle + recording timer) and `window:setBounds` IPC by state
- [x] `RecordPanel` — One app / Full screen, mock apps, narrate toggle, start
- [x] `WatchingPanel` (streaming log + voice notes + Thinking) and `OrganizingChip`
- [x] `EditorPanel` — step variants, voice notes, fix-step options, add/edit/delete, save/run
- [x] `RunningPanel` (mock step advance, pause/resume/skip/stop) + `SummaryPanel` (stopped/done)
- [x] Verified: `electron-vite build`, `tsc` typecheck, and Electron boots (env -u ELECTRON_RUN_AS_NODE)

## 2026-07-08 — Reference1.md alignment (states 01–07 vs Figma)

- [x] Hover (02): press mascot starts recording (no start button, per spec);
      cursor-off with 220ms grace dismisses; Esc dismisses; settings persist as defaults
- [x] Recording (03): pause/resume chip + timer pill on the bubble; "Stop recording"
      label on hover; "Watching {app}.." pill on hover + slide-in when a step resolves,
      click → expanded ledger; voice steps carry a clickable "voice" tag that
      expands the quoted transcript; blinking "Thinking…"; Cancel discards
- [x] Stop-recording (04): status pill sequences "Organizing steps…" → "Opening editor";
      mascot not pressable; auto-advance to editor
- [x] Editor (05): click-to-edit title (Enter commits, Esc reverts); step edit/delete on
      hover; commit → "Forming new step…" → resolved flash; fix-step chips single-select
      with suggested icon + "Something else" inline input; resolved cards collapse with a
      note; add-a-step inline field; Record again asks "Discard these N steps?" and
      returns to the hover panel; Save shows "Workflow saved!" pill
- [x] Running (06): project rows (Cubit, Ghost, Decor, Sunset Studio) with per-project
      progress rings (arc fills per step, teal check when done); active project
      auto-expands, manual toggles respected; step glyph rail (done/active/skipped/
      pending); apricot "Ask each time" question card holds the run and auto-uncollapses
      the panel; Skip on active row; footer Edit (pauses, resumes from editor Run) ·
      Pause/Resume · Stop; collapsed pill "n of m · current step", mascot press =
      pause/resume
- [x] Summary (07): rows derived from the actual run (done / skipped / stopped /
      not-yet) with real durations; meta leads with outcome; hovering "Finish remaining"
      highlights the rows it will act on; Finish remaining resumes the held step
- [x] Verified: tsc clean, electron-vite build, Electron boots

## 2026-07-17 — Ghost v2: pill agent + employee workspace (reference2.md)

- [x] Pill shell: mascot circle → horizontal glass pill (`GhostPill`); sizes
      94×24 "Hello" idle · 161×24 recording · 125×24 "Editing" · 209×24
      running; apricot border while a question holds; ghost bubble deleted
- [x] Shell interactions: right-click native context menu (Open Library /
      Settings / Hide pill), drag-follows-cursor (main-process cursor poll),
      ⌥G global hotkey recovers the pill + opens the record panel
- [x] Record panel v2: dark-glass card, Start Recording button inside the
      panel (pill never starts recording), radio app rows, hover-grace + Esc
      dismissal, hotkey hint on idle hover
- [x] Recording v2: pill [pause]·"Learning..."·timer·chevron; expanded ledger
      "Learning Workflow" with live steps, clickable voice tags, blinking
      Thinking…, footer Cancel · Finish (the only stop control); pause lives
      only as the pill's leading icon; all "Watching" copy purged
- [x] Organizing v2: pill status "Thinking..." → auto-advance to editor
- [x] Editor v2: 660×521 white panel; new TRIGGER section (schedule picker +
      recomputing "Upcoming"); STEPS with inline app chips; fix-step choices
      re-open via chip-token + chevron (never terminal); collapse chevron +
      Esc → "Editing" pill with state intact; footer Cancel (confirm) · Run ·
      Save Workflow ("Workflow saved!" pill status)
- [x] Running v2: flat single-workflow ledger (project rows + rings removed);
      done/done-voice/current/upcoming row states; Skip on hover for ANY
      not-done row; amber question card holds the run and auto-expands;
      footer Stop · Edit only; collapsed pill "name · 3/6 · 1:05"
- [x] Summary v2: per-step rows with chevron-expandable detail, app chips +
      voice quotes preserved; meta "Completed · 1:12" / "Stopped · 3/5 ·
      1:12"; rose pause-bars where the run held; Run remaining (hover
      highlights affected rows) · View log · Done
- [x] Workspace window (807×549, r20): second BrowserWindow with hash route;
      sidebar (traffic lights, team-menu switcher with Personal/Harry's team,
      Workflows/Activity nav)
- [x] Workflows home: metric header, + Record a workflow (opens desktop
      panel via IPC), rows with On/Off status words (Off keeps schedule),
      Suggested card ("Set it up for me" → pre-filled editor · "Record it
      myself" · "Discard")
- [x] Workflow detail: back arrow, meta header, Run (starts the desktop run
      via IPC), Overview/Log tabs; reuses the editor's TriggerSection +
      StepList verbatim — one ledger, every surface
- [x] Activity: COMING UP / TODAY / YESTERDAY timeline; skip an occurrence
      one at a time; run rows Done/Paused (Paused reopens the run)
- [x] IPC bridge: workspace:open, pill run/record/editor commands, drag,
      context menu, window close/minimize
- [x] Verified: tsc clean, electron-vite build, Electron boots

## 2026-07-17 — Pill interaction polish (hover, drag, blur)

- [x] Fixed hover flicker + button wobble: window resizes are instant
      (`animate: false`); persistent `pillAnchor` in main process so resizes
      never derive position from mid-drag / mid-animation bounds
- [x] Fixed drag lag / stuck cursor: resize requests deferred while drag is
      active and applied once at drag end; drag poll keeps anchor in sync
- [x] Hover ↔ drag mutual exclusion: 250ms dwell before opening hover panel;
      drag cancels pending hover; `openHover` blocked while dragging; 4px
      movement threshold before drag starts (plain click does not trigger drag)
- [x] Drag-while-hover: hover panel plays a quick fade-out (`hoverFading`)
      and closes when drag begins on the pill
- [x] Smart panel placement: prefers above the pill; flips below when
      obstructed by screen edge (`panelPlacement` reported from main)
- [x] Native background blur: macOS `vibrancy: 'hud'` on the pill window;
      hover state uses `mode: 'glass'` so the record panel gets real desktop
      blur; window hugs measured content height via `ResizeObserver`
- [x] Idle-hover dismissal rules (reapplied every time the panel closes):
      click outside the UI + pill dismisses (window `blur`); cursor leaving
      dismisses only before the user has clicked the pill or panel
      (`interactedRef` resets on close); Esc still dismisses
- [x] User confirmed: major flicker / wobble / drag issues resolved

## 2026-07-17 — High-priority: glass borders + pill ↔ panel morph

- [x] Smoother glass hairlines for hud pill + hover panel (Figma
      229:1696 / 220:1660): replaced sub-pixel CSS `border` with layered
      inset rim strokes (`.glass-stroke` / `-pill` / `-panel`) that
      anti-alias cleanly on vibrancy; pill blur 15px + fill 0.15, panel
      blur 20px + fill 0.2, radii 10px
- [x] Pill ↔ panel morph: panels grow from the pill silhouette
      (`transform-origin` bottom-right, or top-right when placed below)
      instead of cross-fading; idle→hover morph-in, dismiss morphs back
      into the pill (280ms), drag-dismiss uses a faster morph-out (130ms);
      same morph-in applied to learning / editor / running / summary

---

> Items land here once work is complete and confirmed working.
