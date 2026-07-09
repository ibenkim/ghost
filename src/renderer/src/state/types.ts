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

/** A voice note captured alongside a step while narrating. */
export type VoiceNote = {
  text: string
}

/** A clarifying question the AI asks about a step, with chip options. */
export type FixStep = {
  prompt: string
  options: FixOption[]
  selectedOptionId: string | null
  /** Value typed into the "Something else" inline input, once committed. */
  customValue?: string
}

export type FixOption = {
  id: string
  label: string
  kind: 'default' | 'suggested' | 'other'
}

/** Transient lifecycle of an editor step after an edit commits. */
export type StepPhase = 'normal' | 'forming' | 'resolved'

export type EditorStep = {
  id: string
  index: number
  title: string
  voiceNote?: VoiceNote
  fix?: FixStep
  /** Sub-line shown after a fix card is resolved, e.g. "Will ask during runs". */
  fixNote?: string
  phase?: StepPhase
}

export type Workflow = {
  title: string
  metaLabel: string
  steps: EditorStep[]
}

// ── Running ──

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
  /** Shown before/while the step runs, e.g. "Paste into the Crit page". */
  label: string
  /** Shown once done, e.g. "Pasted into the Crit page". */
  doneLabel: string
  /** Live detail sub-line while active, e.g. "Placing 3 frames…". */
  activeDetail?: string
  /** Present when this is an "Ask each time" step: the run holds here. */
  question?: RunQuestion
  status: RunStepStatus
}

export type RunProject = {
  id: string
  name: string
  steps: RunStep[]
}

export type ProjectStatus = 'queued' | 'active' | 'done'

export type SummaryOutcome = 'stopped' | 'done'

export type SummaryRowKind = 'done' | 'skipped' | 'stopped' | 'not-yet'

export type SummaryRow = {
  projectId: string
  name: string
  time: string
  note?: string
  kind: SummaryRowKind
}
