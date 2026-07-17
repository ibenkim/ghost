Mascot states
Idle
Hover
Ready-to-record
Recording
Loading
Working
Stopped
Ended

Desktop Agent
Design log
Mascot circle → horizontal glass pill; the pill is the character, no separate ghost
Nub, edge-tuck, and auto-tuck removed entirely
Idle status is "Hello" — placeholder; a logo/mark design will take this slot
Start recording moved fully into the panel's "Start Recording" button — the pill never starts recording itself
Stop recording moved from press-mascot to the "Finish" button in the expanded ledger
Pause lives only as the pill's leading icon, in both recording and running (no footer pause) — confirmed design
Recording copy "Watching..." → "Learning..." (legacy "Watching" instances purged from file)
Recording ledger: per-step timestamps; voice steps carry an expandable "voice" tag with quoted transcript
04 organizing copy "Organizing steps…" → "Thinking..."
Editor: new TRIGGER section (schedule + "Upcoming" preview) above STEPS
Editor: new collapsed state — "Editing" pill with chevron to re-expand
Editor footer: "Record again" → "Cancel" (with confirm); Run and Save Workflow retained
Editor: resolved fix-step choices re-open via chip-token + chevron (selections never terminal)
Running: project rows and per-project progress rings removed → flat single-workflow ledger
Running: "Skip" appears on hover for any not-done row, including steps later than current
Running footer: Stop · Edit only
Summary: step rows expandable via chevrons; app chips and voice quotes preserved
Summary buttons: "View log" · "Done"; stopped variant "Finish remaining" → "Run remaining"
Summary meta format: "Completed · 1:12" / "Stopped · 3/5 · 1:12"
Cleanup applied in file: legacy Watching purged, summary frames renamed, unnamed running variant removed, sample data fixed
01-idle
1.1 idle - Pill (94×24), bottom-right; status: "Hello" (placeholder — logo/mark design to come) - Hover → 02-idle-hover; hover also reveals hotkey hint "Press ⌥ to record" - ⌥ (Option) → 02-idle-hover - Right-click → context menu: Open Library, Settings, Hide pill; click anywhere outside dismisses - Drag → pill follows cursor 1:1; window layers untouched; release anywhere - No nub, no edge-tuck, no auto-tuck in v2
02-idle-hover
2.1 record panel - Panel "Record a workflow" opens above the pill, pre-filled with last-used settings; pill remains beneath, still "Hello" - Scope selector, single-select: "One app" / "Full screen" - One app → list of running apps; row = app icon + name + active window ("Chrome · youtube.com"); click row to select (radio); panel height 277 - Full screen → app list replaced by live thumbnail of the full screen; panel height 293 - "Narrate while recording" toggle → mic on/off; voice captured only if on when recording starts - "Start Recording" → 03-recording; panel closes on press - Cursor off pill + panel (~200ms grace) → dismiss → 1.1; nothing recorded; changed settings persist as new defaults - Cursor can cross the gap between pill and panel without dismissing - Esc → dismiss → 1.1 - Right-click pill → context menu as 1.1 (panel dismisses) - Drag pill → panel dismisses; drag as 1.1
03-recording
3.1 recording-collapsed - Pill (161×24): [pause icon] · "Learning..." · "1:05" · chevron - Pause icon → capture suspends; timer freezes; icon becomes resume; actions while suspended are not captured; press again → continues on same timer - Chevron (or pill body) → 3.2 - Drag → reposition; recording continues - Right-click → context menu; Hide pill hides visuals only — recording continues, recoverable via ⌥
3.2 recording-expanded - Header: [pause icon] · "Learning Workflow" · "1:05" · chevron; chevron → collapse to 3.1 - Step lines appear live as committed: timestamp + plain-language step ("00:23 · Opened youtube.com", "00:51 · Shared link to Minhyeok") - Bottom line while resolving: "Now · Thinking..." (blinking) - Narration-born steps carry a "voice" tag ("00:41 · Make exception for Youtube [voice]"); click tag → quoted transcript sub-line ("...always skip the ads on this"); click again → collapses - Ledger stays pinned open until collapsed; new steps append without stealing focus - Footer left, "Cancel" → discards the entire recording → 1.1 (nothing saved, no summary) - Footer right, "Finish" → stops capture → 04-stop-recording; Finish is the only stop control — collapsed state expands (or hotkey) to finish
04-stop-recording
4.1 organizing - Pill (94×24) status: "Thinking..." while the raw recording resolves into the workflow - Auto-advance → 05-editor when ready - Pill not pressable in this state; drag to reposition still works - No cancel here — once Finish is pressed, the recording always reaches the editor; discarding happens there
05-editor
5.1 frame + title - White panel 660×521; collapse chevron top-right → 5.7 - Header: description "Here's what I learned" · title "Weekly crit prep" + pencil icon · meta "6 steps · 1:24" - Click title or pencil → inline edit; Enter or click-away commits; Esc reverts
5.2 TRIGGER (new in v2) - Section label "TRIGGER"; one row: "1st of each month at 9:00 A.M. · Upcoming: August 1, 2026" + chevron - Click row/chevron → trigger editor (schedule picker); "Upcoming" preview recomputes on change - Manual-only workflows show no schedule; Run in footer always works regardless
5.3 STEPS — step row - Row = number + plain-language description + inline app chip (icon + name, e.g. "Figma") - Hover → row highlights; edit (pencil) + delete icons appear at right - Click edit (or double-click text) → inline text field; Enter commits; Esc cancels - On commit → "Forming new step…" while wording re-resolves into an intent step → brief resolved flash → normal step - Click delete → step removed; numbering re-flows - Voice-derived steps show quoted transcript as a sub-line with mic icon + vertical rule ("...Only frames that were edited")
5.4 fix-step (amber question card, inline at its step number) - Card: title "Title the new section" + question "I saw "Crit – Jul 6." Which title should I use?" - Chips, single-select: "Ask each time" (pre-selected) · suggested "Today's date" · literal "Keep "Jul 6"" · "Other..." - "Other..." → chip expands into inline input; Enter commits the typed value as the choice - Picking a chip resolves the card → collapses into a normal step reflecting the choice - Re-open after selection: resolved choice renders as a compact chip-token with chevron; click → options re-expand (selections are never terminal) - Cards never block saving — "Ask each time" is a real answer; an untouched card means Echo asks during runs
5.5 Add a step - "+ Add a step" → empty inline field at end of list → plain language → Enter → forming → resolved intent step (same pipeline as 5.3)
5.6 footer - "Cancel" (left, × icon) → discards draft after confirm ("Discard these 6 steps?") → 1.1 - "Run" → saves workflow into history, then runs it → 06-running - "Save Workflow" → saves to Library → panel closes → "Workflow saved!" in pill status → 1.1 - Esc → collapse (5.7), not discard; Cancel is the only destructive exit
5.7 editor-collapsed (new in v2) - Pill (125×24): "Editing" · chevron - Click chevron/pill → re-expand 5.1 with all state intact
06-running
6.1 running-collapsed - Pill (209×24): [pause icon] · "Weekly crit prep · 3/6" · "1:05" · chevron - Counter + name update live per step - Pause icon → halts after in-flight action completes (never mid-action); icon becomes resume - Chevron → expand 6.2 - Anything needing the user (questions, errors) auto-expands the panel — collapsed state never silently holds an amber
6.2 running-expanded - Header: [pause icon] · "Weekly crit prep · 3/6" · elapsed · chevron (collapse) - Flat step list — one workflow's ledger, mirroring the editor; no project rows, no progress rings - Step states: done (gray, past-tense, keeps app chip) · done-voice (quote sub-line) · current (highlighted, present-tense) · upcoming (number + text) - Hover any not-done row → "Skip" button appears (later-than-current steps included) - Skip → abandons that step; run continues; row keeps its skipped mark - "Ask each time" step reached → run holds; amber question card inline at the step, same chip grammar as 5.4 including "Other..."; answering resumes automatically; if collapsed, panel auto-expands and pill turns apricot - Footer left, "Stop" → aborts the run → 7.2 - Footer right, "Edit" → pauses the run → 05-editor; saved changes apply from the next step onward; completed steps aren't re-run
07-summary
7.1 summary-done - Panel: title "Weekly crit prep" · meta "Completed · 1:12" - One row per step: number + text + app chip where present; voice quotes preserved as sub-lines - Each row has a chevron → expands per-step detail - "View log" → full run log (History in workspace) - "Done" → dismiss → 1.1 - Panel persists until explicitly dismissed
7.2 summary-stopped - Same structure; meta leads with outcome: "Stopped · 3/5 · 1:12" - Row states: done · done-voice · paused (rose, where the run held) · not-yet (grayed) - "Run remaining" → 06-running: the stopped step resumes from where it held, not-yet steps run in full; completed and skipped steps are never re-touched - Hovering "Run remaining" highlights the rows it will act on - "Done" → dismiss; log records the run as stopped


Employee-side Workspace

Design log

- Workspace window introduced: sidebar navigation Workflows / Activity + workspace switcher (team-menu)
- Personal value metric lives in the home header ("5.2 h returned this month") — the employee sees their own number, always
- Workflow status is a binary: On / Off; Off retains the schedule so flipping back On resumes the same trigger
- Workflow-level "Paused" dropped; Paused survives only as a run-level state (a run the user held mid-flight)
- Sidebar label standardized to "Activity" (not "History"); component rename pending in file
- The Suggested card is the candidate door, with consent grammar: "Set it up for me" · "Record it myself" · "Discard"
- Workflow detail reuses the editor's TRIGGER and STEPS components verbatim — one ledger, every surface
- Overview / Log tabs on workflow detail; Log content deferred (see Future work)
- Activity is a timeline grouped COMING UP / TODAY / YESTERDAY; scheduled occurrences can be skipped one at a time
- Team spaces exist (Personal / named team) via the team-menu; sharing and joining flows deferred (see Future work)
01-Workflows
**1.1 window + sidebar**
- Window 807×549, white, r20; sidebar 172px
- Sidebar nav: Workflows · Activity; active item at full ink, inactive at 40%
- Team-menu (workspace switcher): current space name; click → menu: "Personal" · "Harry's team" · "Join a team" · "Settings" · "Log out"
- Selecting a space filters the whole workspace (workflows + activity) to that space
- Close window → workspace dismisses; desktop pill state unaffected

**1.2 home header**
- Metric line: "6 workflows   ·   5.2 h returned this month"
- "+ Record a workflow" → opens the record panel (desktop 02-idle-hover) with last-used settings; workspace stays open behind it

**1.3 workflow row**
- Row = name · schedule ("Monthly client report  ·  1st of month at 9:00 A.M.") · status word at right
- Status words: "On" (purple #625b8f) · "Off" (ink 40%)
- Click status word → toggles On/Off in place; Off keeps the schedule visible but grayed
- Click row body → 1.5 workflow detail
- Hover → row highlight

**1.4 Suggested card**
- Card: "Suggested" label · title + proposed schedule ("Weekly design hand-off · Every week on Thursday at 4:30 P.M.") · plain-language description of the noticed pattern · buttons
- "Set it up for me" → Echo drafts the workflow from what it noticed → opens the editor with steps pre-filled for review
- "Record it myself" → record panel with scope pre-filled from the suggestion
- "Discard" → card dismissed permanently; the suggestion is not re-raised
- One suggestion at a time, always at the bottom of the list, never a badge or notification

**1.5 workflow detail**
- Back arrow → home
- Header: workflow name · meta "On · 12 runs · ≈ 7.6 h returned total" · "Run" button
- "Run" → runs now → desktop 06-running; workspace can be closed without affecting the run
- Tabs: Overview (active) · Log (content deferred — see Future work)
- TRIGGER: identical component and behavior as editor 5.2 ("1st of each month at 9:00 A.M.   ·   Upcoming: August 1, 2026"; click → schedule picker; Upcoming recomputes)
- STEPS: identical rows and behavior as editor 5.3 — number + description + app chip; hover → edit/delete; edits re-resolve through "Forming new step…"; voice sub-lines preserved
- "+ Add a step" → same pipeline as editor 5.5
- Edits here apply from the workflow's next run; a currently running instance is untouched

02-Actvity


**2.1 header**
- Title "Activity" · sub-line "3 workflows scheduled"

**2.2 timeline groups**
- Caps labels: "COMING UP" · "TODAY" · "YESTERDAY"; older days append below by date
- Rows sort newest-first within TODAY/YESTERDAY; COMING UP sorts soonest-first

**2.3 coming-up row**
- Row = name · occurrence time ("Invoice reminders  ·  Tomorrow 9:00 A.M.") · "Skip" · "Scheduled" status chip
- Skip → skips that occurrence only; the next occurrence is unaffected; row grays with a skipped mark
- No other controls on the row; Scheduled is a status, not a button
- Click row body → 1.5 workflow detail

**2.4 run rows (today / yesterday)**
- Row = name · time · status word
- "Done" → click row → that run's summary recap (per-step rows, as desktop 07)
- "Paused" (run-level, user-initiated) → click row → reopens the running panel at the held step; resume from there
- Runs record outcome even when the workspace was never opened

## Future work -- just place in todo as later but not active task.

- Folders — group headers on Workflows home reusing Activity's caps-label grammar + "+ New folder" (drawn in 03-claude-explorations)
- Promote to team — "Personal ▾" scope chip on workflow detail header + move-to-team confirm; team library view for shared workflows 
- Team library
- Join a team — menu item exists; flow undesigned (invite link/code, create team, what joining shares)
- Better Log tab
- Asking state — pending decision: amber run-holding row in Activity for "Ask each time" questions during unattended runs (drawn, optional); alternative is fail-stop (run stops and records "needed an answer at step n")
- Settings — menu item exists; view undesigned: app scope controls, pause defaults, notification/digest preferences
- Empty state — Workflows home with zero workflows; the first-run moment packs and Suggested should fill
- Search — deferred until lists outgrow a screen



