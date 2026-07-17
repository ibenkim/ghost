export type AppState =
  | 'idle'
  | 'hover'
  | 'recording'
  | 'organizing'
  | 'editor'
  | 'running'
  | 'summary'

export type RecordMode = 'one-app' | 'full-screen'

export type RecordableApp = {
  id: string
  name: string
  detail: string
}

/** An app referenced by a step, rendered as an inline chip (icon + name). */
export type StepApp = {
  id: 'figma' | 'chrome' | 'slack' | 'finder' | 'mail'
  name: string
}

/** A voice note captured alongside a step while narrating. */
export type VoiceNote = {
  text: string
}

export type FixOption = {
  id: string
  label: string
  kind: 'default' | 'suggested' | 'other'
}

/**
 * A clarifying question the AI asks about a step.
 * Selections are never terminal: a resolved card collapses into a chip-token
 * that re-expands on click.
 */
export type FixStep = {
  prompt: string
  options: FixOption[]
  selectedOptionId: string
  customValue?: string
  /** True once a chip has been picked — renders as chip-token + chevron. */
  collapsed: boolean
}

/** Transient lifecycle of an editor step after an edit commits. */
export type StepPhase = 'normal' | 'forming' | 'resolved'

export type EditorStep = {
  id: string
  index: number
  title: string
  app?: StepApp
  voiceNote?: VoiceNote
  fix?: FixStep
  phase?: StepPhase
}

export type Trigger = {
  /** e.g. "1st of each month at 9:00 A.M." — undefined = manual-only. */
  schedule?: string
  /** e.g. "August 1, 2026" */
  upcoming?: string
}

export type Workflow = {
  title: string
  metaLabel: string
  trigger: Trigger
  steps: EditorStep[]
}

// ── Running (flat single-workflow ledger) ──

export type RunStepStatus = 'pending' | 'active' | 'question' | 'skipped' | 'done'

export type RunQuestion = {
  prompt: string
  options: FixOption[]
  answerId: string | null
  customValue?: string
}

export type RunStep = {
  id: string
  index: number
  /** Present/imperative wording, e.g. "Paste them into Crit page". */
  label: string
  /** Past-tense wording once done, e.g. "Pasted them into Crit page". */
  doneLabel: string
  app?: StepApp
  voiceNote?: VoiceNote
  /** Present when this is an "Ask each time" step: the run holds here. */
  question?: RunQuestion
  status: RunStepStatus
}

export type SummaryOutcome = 'stopped' | 'done'

// ── Workspace ──

export type WorkflowStatus = 'on' | 'off'

export type WorkflowRecord = {
  id: string
  name: string
  schedule?: string
  upcoming?: string
  status: WorkflowStatus
  runs: number
  hoursReturned: string
  steps: EditorStep[]
}

export type Suggestion = {
  id: string
  title: string
  schedule: string
  /** Plain-language description segments; app chip is rendered inline. */
  descriptionBefore: string
  app: StepApp
  descriptionAfter: string
  noticedLine: string
}

export type ActivityEntry = {
  id: string
  workflowId: string
  name: string
  timeLabel: string
  group: 'coming-up' | 'today' | 'yesterday'
  kind: 'scheduled' | 'run'
  /** For runs. */
  outcome?: 'done' | 'paused' | 'stopped'
  /** Coming-up occurrences the user skipped (grayed, one-time). */
  skipped?: boolean
}
