# To-Do

Items that have not been started yet.

---

# Ghost Workflow UI — State machine (Figma `FFpTE8apfU6stJN0Bx9Yr1`)

This phase ships the UI + interaction workflow only. AI capture and agent
execution are mocked. States: idle → hover → recording → organizing →
editor → running → summary.

## States

- [ ] Idle: purple floating bubble, bottom-right
- [ ] Hover: "Record a workflow" panel (One app / Full screen + narrate)
- [ ] Recording: bubble timer + expandable "Watching {app}" log
- [ ] Organizing: transient "Organizing…" chip
- [ ] Editor: "Here's what I learned" step list + fix-step + actions
- [ ] Running: live step runner with pause/resume/skip/stop
- [ ] Summary: "Here's what I've done" stopped/done variants

## Polish

- [ ] Motion/transitions between states
- [ ] Hover affordances (stop-recording chip, tooltips)
- [ ] Match spacing/typography against Figma screenshots

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
