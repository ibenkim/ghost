# To-Do

Items that have not been started yet.

---

# Ghost Workflow UI — State machine (Figma `FFpTE8apfU6stJN0Bx9Yr1`)

The state-machine phase shipped (see `DONE.md`): idle → hover → recording →
organizing → editor → running → summary, with AI capture and agent execution
mocked.

## High-priority edit specified by the user that overrides the minor suggestions below.

## Remaining polish

- [ ] Right-click context menu on the mascot (Open Library, Settings, Hide ghost)
- [ ] Idle nub: drag-to-edge tuck + re-emerge (reference 1.2)
- [ ] Cross-fade / spring transitions when the window resizes between states
- [ ] Real app icons in the One-app list

---

## Later / AI (deferred — not this phase)

- [ ] Real screen + input capture (desktopCapturer)
- [ ] Summarize workflow with AI provider
- [ ] Create + run an agent that performs the steps
- [ ] Configure OpenAI / Anthropic API key via settings panel
- [ ] Stream token responses from AI provider
- [ ] Support multiple AI providers (OpenAI, Anthropic, local Ollama)
- [ ] Persistent window position memory
- [ ] Keyboard shortcut to toggle widget
- [ ] Drag-to-reposition the floating bubble
- [ ] Dark mode support
- [ ] Auto-updater (electron-updater)
- [ ] Code-sign and notarize for macOS distribution
- [ ] Publish to GitHub Releases via CI
