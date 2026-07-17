# To-Do

Items that have not been started yet.

Source of truth: `.planning/reference2.md` (v2 redesign). The v2 build
(Phases A–L) shipped — see `DONE.md`. What remains below is polish that needs
another design pass, plus the parked Future-work and AI lists.

## High-priority edit specified by the user that overrides the minor suggestions below.

---

## Remaining polish (v2)

- [ ] Pill ↔ panel morph animation (pill stretches into the ledger/panel
      instead of cross-fading)
- [ ] Native ⌥ (bare Option) hotkey — currently ⌥G via globalShortcut; a bare
      modifier needs a low-level keyboard hook
- [ ] Live "Upcoming" computation from a real schedule model (currently
      preset schedule → preset upcoming pairs)
- [ ] Real running-app list + live full-screen thumbnail in the record panel
- [ ] Idle "Hello" slot → logo/mark once that design lands
- [ ] Per-step timing/details in summary row expansion (currently mock copy)

---

## Later / Future work (from reference2.md — parked, not active)

- [ ] Folders — group headers on Workflows home reusing Activity's caps-label
      grammar + "+ New folder"
- [ ] Promote to team — "Personal ▾" scope chip on detail header +
      move-to-team confirm; team library view for shared workflows
- [ ] Team library
- [ ] Join a team — menu item exists; flow undesigned (invite link/code,
      create team, what joining shares)
- [ ] Better Log tab (workflow detail Log content beyond the drawn mock)
- [ ] Asking state — pending decision: amber run-holding row in Activity for
      unattended "Ask each time" questions, vs fail-stop ("needed an answer
      at step n")
- [ ] Settings — menu item exists; view undesigned (app scope controls, pause
      defaults, notification/digest preferences)
- [ ] Empty state — Workflows home with zero workflows (first-run packs +
      Suggested fill)
- [ ] Search — deferred until lists outgrow a screen

## Later / AI (deferred)

- [ ] Real screen + input capture (desktopCapturer)
- [ ] Summarize workflow with AI provider
- [ ] Create + run an agent that performs the steps
- [ ] Configure OpenAI / Anthropic API key via settings panel
- [ ] Stream token responses from AI provider
- [ ] Support multiple AI providers (OpenAI, Anthropic, local Ollama)
- [ ] Persistent window position memory
- [ ] Dark mode support
- [ ] Auto-updater (electron-updater)
- [ ] Code-sign and notarize for macOS distribution
- [ ] Publish to GitHub Releases via CI
