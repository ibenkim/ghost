v3 Core Workflow

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
v3 — Onboarding · workflow
01-welcome
1.1 welcome
First launch only; card centered, mascots idle beneath. The card is the only interactive surface — the desktop behind is inert until setup completes
Continue with Google → system browser auth → back to app → 1.2
Auth cancelled / failed → button returns to rest; quiet rose line beneath it ("Couldn't sign in — try again")
Continue with email → button row swaps to an inline email field; Enter → "Check your inbox" sub-state; magic link opens the app → 1.2
Terms & Privacy → open in browser; card stays put
No Esc, no dismiss — quitting from the menu bar icon is the only exit; relaunch returns to 1.1
1.2 team
Create a team pre-selected; single-select radios; the whole row is the hit target
Continue (Create) → team auto-named from account ("Harry's team" — rename later in Manage) → 02-permissions
Join a team selected → row expands an inline field: paste invite link or code
Valid → joins → 02-permissions (permissions are per-machine — joining never skips them)
Invalid → field stroke rose; sub-line "That link didn't work — ask your team owner to re-send"
Arrived via invite link → 1.1 auth → 1.2 lands pre-filled on Join with a confirm row ("Join [team] · 4 members")
Back → 1.1 (auth kept; the Google button now shows the signed-in account)
02-permissions
2.1 checklist grammar (applies to 2.2–2.4)
One card, three numbered rows — same rail as workflow steps; advances top-to-bottom; counter top-right ticks "1 of 3" → "3 of 3"
Current row expands into the gray block: why-copy + Allow button + "macOS will ask — choose Allow" hint; done rows collapse to a check; pending rows sit inert below
Allow [permission] → fires the real macOS prompt; card dims while the system dialog holds focus
System Allow → block settles into a done row (150ms) → next row auto-expands
System Deny (or dialog dismissed) → 3.1 — same card, recovery state; nothing is lost
macOS demands a relaunch (screen recording sometimes does) → button swaps to "Restart yuh"; relaunch returns to this card, same row
Why does yuh need this? → popover: one line per permission + "nothing leaves this Mac"; click-away closes
No skipping ahead (except 2.4); quitting mid-setup reopens to the same row
2.2 see your screen (row 1)
Copy promise is scoped: watching only while you record or a workflow runs — never in the background
Gates everything downstream — record and run paths both preflight this and route back here if it's missing
2.3 move the cursor (row 2)
Copy: clicks, typing, opening apps — exactly as shown; "you can take over any time"
Deny → 3.1 pattern with row-2 content
2.4 hear your voice (row 3 — Optional)
"Optional" tag sits in the block header
Allow microphone → prompt → done row → 2.5
Skip for now → row resolves with a hollow dash, not a check → 2.5; the narration toggle later in 02-idle-hover reads "mic is off — turn on in Settings" and re-raises this one block as a standalone card
2.5 permissions-complete
Counter swaps to "Done"; three resolved rows (a skipped mic keeps its dash)
Record your first workflow → card dismisses, mascot does one happy hop → 02-idle-hover with the panel open, pre-set (narration on iff mic granted)
I'll explore first → card dismisses → 1.1 idle; Library's first-run state (4.1) waits behind the context menu
Either exit: onboarding never replays; individual permission cards can re-raise (3.x), the full flow doesn't
03-permission-issues
3.1 permission-denied
Same card; title flips ("yuh can't see your screen yet"); current block re-strokes amber with a "Needs your OK" tag — same grammar as the 5.3 fix-step card
Three sub-lines walk the exact path: System Settings → Privacy & Security → Screen Recording → turn on yuh
Open System Settings → deep-links straight to that pane
Check again → re-polls
Now granted → block resolves to a done row → flow continues per 2.1
Still off → gentle shake; sub-line "Still off — the toggle next to yuh should be on"
yuh also polls quietly in the background — flipping the toggle resolves the card by itself; Check again exists for impatience, not correctness
Same state reused for rows 2 and 3; only the copy changes
3.2 permission-revoked (post-setup, any time)
Trigger: a granted permission flips off while idle, or a scheduled run's preflight fails
Status pill → apricot dot + "Paused — needs permission"; the pill never auto-tucks while apricot (same rule as run questions, 6.2)
Toast slides in above the pill: what turned off + the concrete stake ("Monthly client report is scheduled for tomorrow, 9:00 A.M. …")
Shown once at revocation; re-raised 1h before any affected run
Fix in System Settings → deep-link; on re-grant, toast + pill resolve; a held run starts if still inside its window, else History logs "Missed — permission was off"
Dismiss → toast only; pill stays apricot; affected runs stay held
Revoked mid-run → run pauses after the in-flight action (6.1 rule); panel auto-expands with this same amber block inline at the active step; resolves like a question card — re-grant resumes automatically
04-first-run
4.1 first-run-empty (Library, zero workflows)
Where Open Library lands until the first save; sidebar has Workflows selected
Header sub-line is a ready-state, not a metric — no "0 h returned" (zeros read as failure)
Record a workflow → window parks → 02-idle-hover with the panel open (identical to pressing the mascot)
Suggestion hint is static copy; the first real Suggested card replaces it once yuh has seen enough repetition
After the first save this state retires; History's empty state mirrors it ("Runs will show up here")
v3 — Employee Desktop · workflow
Design log
Mascot circle → horizontal glass pill; the pill is the character, no separate ghost
Nub, edge-tuck, and auto-tuck removed entirely
Idle status is "Hello" — placeholder; a logo/mark design will take this slot
Start recording moved fully into the panel's "Start Recording" button — the pill never starts recording itself
Stop recording moved from press-mascot to the "Finish" button in the expanded ledger
Pause lives only as the pill's leading icon, in both recording and running (no footer pause)
Recording copy "Watching..." → "Learning..."; 04 copy "Organizing steps…" → "Thinking..."
Recording ledger: per-step timestamps; voice steps carry an expandable "voice" tag with quoted transcript
Editor: TRIGGER section above STEPS; collapsed "Editing" pill; footer Cancel (confirm) · Run · Save Workflow; resolved fix-step choices re-open via chip-token + chevron
Running: flat single-workflow ledger; Skip on hover for any not-done row; footer Stop · Edit only
Summary: expandable step rows; "View log" · "Done"; stopped variant "Run remaining"
v3 additions:
Status colors are named tokens now: amber = needs an answer · rose = failed/stopped · teal = done/saved (+ amber-soft tint); status language uses them everywhere
Shared micro-UI shipped as components on the v3-components shelf: status-pill (Hello / Learning / Thinking / running / paused / saved) · context-menu (idle / recording) · toast (success / error / info) · run-card (question / error) · tooltip
Context menu designed: Open Library ⌘L · Record a workflow ⌥R · Settings… ⌘, · Hide pill ⌥H; recording variant appends "Recording continues" under Hide pill
Mid-run holds designed: amber question card (6.3) and rose error card (6.4), inline at the held step — same chip grammar as fix-step 5.4
Editor: desktop dims behind the panel (ink-20 scrim); ✕ beside the collapse chevron; row highlight is hover-only (no pre-selected row); fix-step type raised to 9–10px
Saved confirmation designed: teal pill "Workflow saved · Open in Library" — a direct path into the workspace
Summary meta normalized: "Done · 6 of 6 · 1:12" / "Stopped · 3 of 6 · 1:12"
01-idle
1.1 idle
Pill (94×24) bottom-right; status "Hello" (placeholder — logo/mark takes this slot)
Hover → 02-idle-hover; hover also reveals hotkey hint "Press ⌥ to record"
⌥ (Option) → 02-idle-hover
Right-click → context menu: Open Library ⌘L · Record a workflow ⌥R · Settings… ⌘, · Hide pill ⌥H; opens above the pill, flips placement near an edge; click anywhere outside dismisses
Hide pill → visuals hide; ⌥ or the menu-bar icon brings it back
Drag → pill follows cursor 1:1; window layers untouched; release anywhere
02-idle-hover
2.1 record panel
Panel "Record a workflow" opens above the pill, pre-filled with last-used settings; pill remains beneath, still "Hello"
Scope selector, single-select: "One app" / "Full screen"
One app → list of running apps; row = app icon + name + active window ("Chrome · youtube.com"); click row to select (radio); panel height 277
Full screen → app list replaced by live thumbnail of the full screen; panel height 293
"Narrate while recording" toggle → mic on/off; voice captured only if on when recording starts; mic permission skipped in onboarding → toggle reads "mic is off — turn on in Settings"
"Start Recording" → 03-recording; panel closes on press; missing Screen Recording permission → button disabled with inline note, routes to the onboarding recovery card
Cursor off pill + panel (~200ms grace) → dismiss → 1.1; nothing recorded; changed settings persist as new defaults
Cursor can cross the gap between pill and panel without dismissing
Esc → dismiss → 1.1
Right-click pill → context menu as 1.1 (panel dismisses); drag pill → panel dismisses, drag as 1.1
03-recording
3.1 recording-collapsed
Pill (161×24): [pause icon] · "Learning..." · "1:05" · chevron
Pause icon → capture suspends; timer freezes; icon becomes resume (amber bars); actions while suspended are not captured; press again → continues on the same timer
Chevron (or pill body) → 3.2
Drag → reposition; recording continues
Right-click → context menu (recording variant); Hide pill hides visuals only — "Recording continues" is stated in the menu; recoverable via ⌥
3.2 recording-expanded
Header: [pause icon] · "Learning Workflow" · "1:05" · chevron; chevron → collapse to 3.1
Step lines appear live as committed: timestamp + plain-language step ("00:23 · Opened youtube.com")
Bottom line while resolving: "Now · Thinking..." (blinking)
Narration-born steps carry a "voice" tag; click tag → quoted transcript sub-line; click again → collapses
Ledger stays pinned open until collapsed; new steps append without stealing focus
Footer left "Cancel" → discards the entire recording → 1.1 (nothing saved, no summary)
Footer right "Finish" → stops capture → 04-stop-recording; Finish is the only stop control
04-stop-recording
4.1 organizing
Pill (94×24) status: "Thinking..." while the raw recording resolves into the workflow
Auto-advance → 05-editor when ready
Pill not pressable; drag to reposition still works
No cancel here — once Finish is pressed, the recording always reaches the editor; discarding happens there
05-editor
5.1 frame + title
Desktop dims behind the panel (ink-20 scrim) — the editor is the only focused surface
White panel 660×521; header right: ✕ + collapse chevron — ✕ = Cancel path (confirm, as 5.6); chevron = collapse to 5.7
Header: "Here's what I learned" · title + pencil · meta "6 steps · 1:24"
Click title or pencil → inline edit; Enter or click-away commits; Esc reverts
5.2 TRIGGER
Section label "TRIGGER"; one row: schedule + "· Upcoming: …" + chevron; copy always matches the cadence ("Every Friday at 9:00 A.M. · Upcoming: Friday, Jul 10")
Click row/chevron → trigger editor popover (designed — same surface as Workspace 1.6): cadence segmented control, On-the/at chips, live "Next run" preview with time zone
Manual-only workflows show no schedule; Run in footer always works regardless
5.3 STEPS — step row
Row = number + plain-language description + inline app chip ("Figma")
Highlight is hover-only — no row is pre-selected; hover reveals edit (pencil) + delete at right
Click edit (or double-click text) → inline field; Enter commits; Esc cancels
On commit → "Forming new step…" → brief resolved flash → normal step
Click delete → step removed; numbering re-flows
Voice-derived steps show quoted transcript sub-line with mic icon + vertical rule
5.4 fix-step (amber question card, inline at its step number)
Card: step title + question; chips single-select: "Ask each time" (pre-selected) · suggested · literal · "Other..."
"Other..." → chip expands into inline input; Enter commits typed value
Picking a chip resolves the card → collapses into a normal step reflecting the choice
Re-open after selection: resolved choice renders as chip-token + chevron; click → options re-expand (selections never terminal)
Cards never block saving — "Ask each time" is a real answer; untouched card means Echo asks during runs (6.3)
5.5 Add a step
"+ Add a step" → empty inline field at end → plain language → Enter → forming → resolved intent step (same pipeline as 5.3)
5.6 footer
"Cancel" (left, ✕ icon) → discards draft after confirm ("Discard these 6 steps?") → 1.1
"Run" → saves the workflow into history, then runs it → 06-running
"Save Workflow" → saves to Library → panel closes → teal pill "Workflow saved · Open in Library" → clicking the link opens the Library on that workflow; pill reverts to "Hello" after ~6s or on click
Esc → collapse (5.7), not discard; Cancel/✕ is the only destructive exit
5.7 editor-collapsed
Pill (125×24): "Editing" · chevron; click → re-expand 5.1 with all state intact
06-running
6.1 running-collapsed
Pill (209×24): [pause icon] · "Weekly crit prep · 3/6" · "1:05" · chevron; counter + name update live
Pause icon → halts after the in-flight action completes (never mid-action); icon becomes resume
Chevron → expand 6.2
Anything needing the user auto-expands the panel and colors the pill — amber for questions, rose for errors; collapsed state never silently holds
6.2 running-expanded
Header: [pause icon] · "Weekly crit prep · 3/6" · elapsed · chevron
Flat step list mirroring the editor; states: done (gray, past-tense, app chip) · done-voice (quote sub-line) · current (highlighted, present-tense) · upcoming
Hover any not-done row → "Skip" appears (later-than-current included); Skip → abandons that step, run continues, row keeps its skipped mark
Footer: "Stop" (left) → aborts → 7.2 · "Edit" (right) → pauses run → 05-editor; saved changes apply from the next step; completed steps aren't re-run
6.3 running-question (new)
"Ask each time" step reached → run holds; amber card inline under the highlighted row: context line, question, chips (suggested · literal · "Other…"); sub-line "Run is holding — answering resumes automatically"
Header appends "· needs an answer"; pill turns amber; collapsed → auto-expands
Answering → card collapses into the resolved step; run resumes; the Q&A is recorded as a receipt in the run log (Workspace 1.7)
Unattended → the hold also surfaces in Activity as an amber "waiting on your answer" row with an Answer action (Workspace 2.5)
Questions have no timeout — they hold until answered or the run is stopped
6.4 running-error (new)
A step fails → rose card inline at the step: plain-language failure ("Couldn't find a page named "Crit" in this file."); chips: Retry · Skip step · Take over
Retry → re-attempts the step; Skip step → marks skipped, run continues; Take over → run pauses, user acts by hand, resume continues from the next step
Sub-line states the policy: "Held for 10 min — then the run stops and is logged"
No response within the hold → run stops → 7.2 with meta "Stopped — needed help at step n"
Header appends "· needs help"; pill turns rose; collapsed → auto-expands; Activity mirrors the hold (rose)
07-summary
7.1 summary-done
Panel: title · meta "Done · 6 of 6 · 1:12"
One row per step: number + text + app chip; voice quotes preserved as sub-lines; chevron per row → per-step detail
"View log" → that run's detail in the workspace (1.7)
"Done" → dismiss → 1.1; panel persists until explicitly dismissed
7.2 summary-stopped
Same structure; meta leads with outcome: "Stopped · 3 of 6 · 1:12"
Row states: done · done-voice · held (rose, where the run stopped or needed help) · skipped ("Skipped" chip) · not-yet (grayed)
"Run remaining" → 06-running: the held step resumes from where it held; not-yet steps run in full; completed and skipped steps are never re-touched; hover highlights the rows it will act on
"Done" → dismiss; the log records the run as stopped

v3 — Employee Workspace · workflow
Design log
Workspace window: sidebar Workflows / Activity + team-menu (workspace switcher)
Personal value metric in home header — the employee always sees their own number
Workflow status is binary On / Off; Off retains the schedule
"Paused" survives only as a run-level state
Suggested card is the candidate door with consent grammar: "Set it up for me" · "Record it myself" · "Discard"
Workflow detail reuses the editor's TRIGGER and STEPS components verbatim — one ledger, every surface
v3 additions:
Log tab designed (was deferred): per-run detail with timestamps, teal checks, question receipts, artifact links, feedback footer (1.7)
Trigger editor designed: popover with cadence segmented control, On-the/at chips, live next-run + time-zone preview (1.6)
Workflow overflow menu (⋯) + delete confirm designed; delete copy names what's preserved (1.5)
Activity "Asking state" decision resolved: designed as an amber run-holding row with an Answer action (2.5); fail-stop applies only to errors, after a 10-minute hold
Home header count always matches the visible list
01-Workflows
1.1 window + sidebar
Window 807×549, white, r20; sidebar 172px; nav Workflows · Activity (active full ink, inactive 40%)
Team-menu: current space; click → "Personal" · "Harry's team" · "Join a team" · "Settings" · "Log out"; selecting a space filters the whole workspace
Close window → workspace dismisses; desktop pill unaffected
1.2 home header
Metric line: "4 workflows · 5.2 h returned this month" (count mirrors the list)
"+ Record a workflow" → record panel (desktop 2.1); workspace stays open behind it
1.3 workflow row
Row = name · schedule · status word right: "On" (purple) / "Off" (ink-40)
Click status word → toggles in place; Off keeps the schedule visible but grayed
Click row body → 1.5; hover → row highlight
1.4 Suggested card
"Suggested" label · title + proposed schedule · plain-language pattern description
"Set it up for me" → Echo drafts the workflow → editor opens pre-filled for review
"Record it myself" → record panel with scope pre-filled; "Discard" → dismissed permanently, never re-raised
One suggestion at a time, bottom of the list, never a badge or notification
1.5 workflow detail
Back arrow → home; header: name · meta "On · 12 runs · ≈ 7.6 h returned total" · "Run" · ⋯
"Run" → runs now → desktop 06-running; workspace can close without affecting the run
⋯ menu: Rename ⏎ · Duplicate ⌘D · Move to folder… · Copy share link ⌥⌘C · Turn off · Delete… (rose)
Rename → inline title edit; Duplicate → "Copy of [name]", Off by default, opens its detail; Turn off → same as the row toggle
Delete… → confirm dialog over scrim: "Delete "Monthly client report"? Scheduled runs stop immediately. Its 12 runs stay in History. This can't be undone." · Cancel / Delete workflow (rose); Esc = Cancel
Tabs: Overview (TRIGGER + STEPS, identical to editor 5.2/5.3) · Log (1.7)
Edits apply from the next run; a currently running instance is untouched
1.6 trigger editor (new)
Popover under the TRIGGER row (same surface in editor 5.2)
Cadence segmented control: Daily · Weekly · Monthly · Custom; parameter row adapts ("On the [1st] at [9:00 A.M.]" / "Every [Friday] at […]")
"Next run: Friday, Aug 1 · uses this Mac's time zone (PT)" — recomputes live on any change
"Turn off trigger" (left) → workflow Off, schedule retained · Cancel · "Save trigger" → commits, Upcoming preview updates
Esc or click-away = Cancel
1.7 Log tab + run detail (new)
Log: month-grouped run rows: date/time · outcome ("Done · 6/6 · 1:20 · 1 question") · "≈ 36 min returned"; stopped runs show no return figure
Click a run row → run detail: "‹ All runs" · header date/time + return figure · meta "Done · 6 of 6 · 1:20 · 1 question answered · ran unattended"
One row per step: number · past-tense description · timestamp · teal check; skipped rows keep a "Skipped" chip; a stopped run's held step is rose
Question receipt: amber sub-line under its step — "Asked: "…" · You answered "…""; click → offer "Always use this answer" (converts Ask-each-time to a fixed choice)
Artifact receipts link out: "View message in Slack ↗"
Feedback footer: "Went well? · Looks right · Something's off — fix a step" → deep-links into Overview with that step in edit mode
02-Activity
2.1 header — "Activity" · "3 workflows scheduled"
2.2 timeline groups — COMING UP · TODAY · YESTERDAY; older days append by date; COMING UP soonest-first, others newest-first
2.3 coming-up row
Name · occurrence time · "Skip" · "Scheduled" chip
Skip → skips that occurrence only; row grays with a skipped mark; click row body → 1.5
2.4 run rows (today / yesterday)
Name · time · status word; "Done" → click → that run's detail (1.7); "Paused" → click → reopens the running panel at the held step
Runs record outcome even when the workspace was never opened
2.5 needs-you row (new)
A held run renders amber: "Monthly client report · waiting on your answer since 9:04 A.M." · Answer
Answer → opens the running panel's question card (desktop 6.3); answering resumes the run; the row becomes a normal run row on completion
Error holds render rose ("needs help") with the same grammar; once the 10-minute hold stops the run, the row reads "Stopped — needed help at step n"
Future work
Folders — group headers reusing the caps-label grammar + "+ New folder"
Promote to team — scope chip on detail header + move-to-team confirm; team library view
Join a team — flow undesigned (invite link/code, create team, what joining shares)
Settings — app scope controls, pause defaults, notification/digest preferences
Empty state — designed in v3 Onboarding 4.1 (first-run Library); port when onboarding merges
Search — deferred until lists outgrow a screen

v3 — Owner Workspace · workflow
Everything matches the Employee Workspace except 03-Manage and the home header.
Design log
Remove-member confirm designed (Future-work item closed)
INVITED section designed: pending invites with Resend / Revoke
Single invite entry point: "Invite to Team" in the header (duplicate action removed)
Owner home header carries the team metric: "6 workflows · Team of 4 · ≈ 21 h returned this month"
03-Manage
3.1 members list
Header: "Manage Team" · "3 members" · "Invite to Team" · Edit
Caps label MEMBERS; row = name · role chip ("Owner" on the owner)
Hover a member row → row grays; ✕ appears at right → 3.4
The owner's own row shows no ✕ (ownership transfer — future work)
Edit → team name inline edit; Enter commits
3.2 invite
"Invite to Team" → inline email field in the header area; type address(es) → Enter sends → row appears under INVITED
Invalid address → field stroke rose, sub-line "That doesn't look like an email"
3.3 INVITED (new)
Caps label INVITED below members; row = email · "invited 2 days ago" · Resend · Revoke (rose)
Resend → re-sends the link; timestamp resets ("invited just now")
Revoke → link invalidated, row removed — no confirm (low stakes; resending is cheap)
Invites expire after 14 days → row grays to "expired", Resend remains
3.4 remove confirm (new)
Dialog over scrim: "Remove Ryland from the team?" — "They keep their personal workflows. Workflows they shared stay with the team. Their scheduled team runs stop today."
Cancel · "Remove member" (rose); Esc = Cancel
On remove → member disappears from the list; Activity keeps their past runs, still attributed
