Core Workflow
Mascot states
Idle
Hover
Ready-to-record
Recording
Loading
Working
Stopped
Ended

Desktop Agent States

01-idle
1.1 idle
Press mascot→ 02-idle-hover
Right-click → Open context menu (Open Library, Settings, Hide ghost; press anywhere outside to quit menu)
Drag →  mascot follows cursor 1:1; window layers stay untouched; release anywhere
Drag to edge → 1.2
Top and bottom edges do not accept tucks
Auto-tucks to screen-edge during focused work (recoverable via the nub or hotkey)
Hotkey → 02-idle-hover

1.2 idle-nub
Hover → Mascot brightens and widens; After 800ms hover, tooltip appears: "Show ghost · [hotkey]"
Click →  Mascot re-emerges from the nub's position: expands horizontally → 1.1 in previous position
Drag → Nub inflates into the full ghost under the cursor mid-drag and follows 1:1; release anywhere → 1.1 at release point
Vertical Drag → Nub slides along the edge to reposition
Right-click → same context menu, with "Show ghost" prepended as the first item
Hotkey → un-tucks to 1.1 previous position

02-idle-hover
2.1 idle-hover
Panel opens pre-filled with last-used settings (scope, app, narration); flips placement to stay on-screen when the mascot is near an edge
Press mascot → starts recording with the panel's current settings → 03-recording
Scope toggle — One app / Full screen
One app → list of currently running apps (icon, name, active window); click a row to select it (single-select)
Full screen → app list is replaced by a live thumbnail of the full screen
Narrate while recording toggle → mic on/off; voice capture only occurs if on when recording starts
Move cursor off mascot + panel (~200ms grace) → dismiss → 1.1; nothing recorded; any settings changed are kept as the new defaults
Hover over mascot → Ready-to-record
Cursor can cross the gap between mascot and panel without dismissing
Esc → dismiss → 1.1
Right-click mascot → context menu as 1.1.2 (panel dismisses)
Drag mascot → panel dismisses; drag behaves as 1.1.3

03-recording
3.1 recording
Press pause → capture suspends; timer freezes; button becomes resume; actions while suspended are not captured; press resume → capture continues on the same timer
Hover mascot → "Stop recording" label appears beside mascot
Press mascot → stops capture → 04-stop-recording
Drag → reposition as 1.1.3; recording continues
Watching pill ("Watching Chrome.." / "Watching screen..") → appears on hover alongside the stop label, and slides in briefly whenever a new step resolves; click pill → 3.2
Right-click → context menu (Hide ghost hides visuals only — recording continues, recoverable via hotkey)
No auto-tuck while recording (per 1.1.5)

3.2 recording-expanded
Header: "Watching [scope].." + chevron; click chevron → collapse back to 3.1
Step lines appear live as the agent commits them: timestamp + plain-language step; bottom line shows "Thinking…" (blinking) while the current action is still resolving
Steps born from narration carry a "voice" tag; click tag → quoted transcript sub-line expands under the step; click again → collapses
Ledger stays pinned open until collapsed; new steps append without stealing focus
Cancel → discards the entire recording → 1.1 (nothing saved, no summary)
Press mascot → stops capture normally → 04-stop-recording (ledger open or not, stopping works the same)

04-stop-recording
4.1 stop-recording
Pause + time chips disappear; ledger (if open) dismisses
Status pill above mascot: "Organizing steps…", “Opening editor” while the raw recording resolves into the workflow
Auto-advance → 05-editor when ready
Mascot is not pressable during this state; drag to reposition still works
Right-click → context menu still available; no cancel here — once stop is pressed, the recording always reaches the editor, and discarding happens there

05-editor
5.1 title
Click title or pencil → inline edit; Enter or click-away commits; Esc reverts
5.2 step
Hover → row highlights; edit + delete icons appear on the right
Click edit (or double-click text) → step becomes an inline text field; Enter commits; Esc cancels
On commit → "Forming new step…" while the agent re-resolves the wording into an intent step → brief resolved flash → normal step
Click delete → step removed; numbering re-flows
Voice-derived steps show the quoted transcript as a sub-line, operator words (Only / Skip / Never) bolded
5.3 fix-step (amber question card, inline at its step number)
Chips: "Ask each time" pre-selected · suggested chip (icon + best guess, e.g. Today's date) · literal option (e.g. Keep "Jul 6") · "Something else"
Single-select; picking a chip resolves the card → collapses into a normal step reflecting the choice
"Something else" → chip expands into an inline input; Enter commits the typed value as the choice
Cards never block saving — "Ask each time" is a real answer, so an untouched card just means the ghost will ask during runs
5.4 Add a step
Click → empty inline text field appears at the end of the list → type plain language → Enter → forming → resolved into an intent step (same pipeline as 5.2.3)
5.5 footer
Record again → discards this draft, returns to 02-idle-hover with the same scope/settings pre-filled; confirms first ("Discard these 6 steps?")
Run → saves the workflow into history, then runs it → 06-running
Save Workflow → saves to Library → panel closes → “Workflow saved!” in status pill → 1.1

06-running
6.1 running-panel
Click chevron or header → collapse panel → 6.2
Project rows (named items — Cubit, Ghost, Decor…): click row → expand/collapse its step list; the active project auto-expands and a just-finished project auto-collapses as the run advances; rows the user toggled manually are left alone
Progress circle per project (not in Figma yet): left of each name — empty ring = queued; arc fills by exact fraction (3 of 6 steps = half ring), ticking per completed step; full ring + teal = done. Rings live only at project level; step level keeps its glyph rail — the two never share symbols
Step rows in an expanded project: done (dot + past-tense, gray) · active (highlighted, present-tense + live detail sub-line, e.g. "Placing 3 frames…") · skipped ("Skipped" chip; rule glyph when a rule caused it) · upcoming (number + text)
Skip (on the active row) → abandons that step, run continues; row keeps its "Skipped" chip
"Ask each time" step reached → run holds; apricot question card appears inline at the step, same chips grammar as 5.3 including "Other…" input; answering resumes automatically; if the panel is collapsed it auto-expands and the mascot turns apricot
Footer — Edit · Pause · Stop
Pause → run halts after the in-flight action completes (never mid-action); active row shows Paused; button becomes Resume
Stop → aborts the run → 7.2
Edit → pauses the run → 05-editor; saved changes apply from the next step onward, already-completed steps aren't re-run
6.2 running collapsed
Pill: counter + current step ("2 of 4 · Pasting into Crit page"); click → expand 6.1
With the panel collapsed the mascot floats alone, so it becomes the button again: press = Pause/Resume, hover = pill peeks.
Anything needing the user (questions, errors) always auto-expands the panel — the collapsed state is never allowed to silently hold an apricot

07-summary
7.1 summary-done
Header: "Here's what I've done" · workflow name · meta line (result · n of n items · total time)
One row per project item: name + duration + result glyph; normal completions are one quiet line — only exceptions grow a sub-line ("Skipped Step 3")
View Log → opens the full run log (History view in the workspace window)
Done → dismiss → 1.1 
Panel persists until explicitly dismissed 
7.2 summary-stopped
Same recap structure; meta leads with the outcome: "Stopped · 1 of 4 · 1:12"
Row states: done · skipped (sub-line: "Skipped: [step text]") · stopped (rose sub-line: "Stopped at step n of m · [step text]") · not-yet (grayed, hollow indicator)
Finish remaining → returns to 06-running: the stopped item resumes from its held step, not-yet items run in full, completed and skipped items are never re-touched
View Log / Done: as 7.1
Hovering Finish remaining highlights the rows it will act on (the stopped and not-yet items) — the button's consequence is visible before it's pressed
Done without finishing - the log records the run as stopped
