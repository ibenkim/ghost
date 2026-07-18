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

---

> Items land here once work is complete and confirmed working.
