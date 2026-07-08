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

---

> Items land here once work is complete and confirmed working.
