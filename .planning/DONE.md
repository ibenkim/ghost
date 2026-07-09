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

---

> Items land here once work is complete and confirmed working.
