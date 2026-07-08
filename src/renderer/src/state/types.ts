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

/** A clarifying question the AI would ask about a step, with options. */
export type FixStep = {
  prompt: string
  options: FixOption[]
  selectedOptionId: string | null
}

export type FixOption = {
  id: string
  label: string
  kind: 'default' | 'selected' | 'suggested'
}

export type EditorStep = {
  id: string
  index: number
  title: string
  voiceNote?: VoiceNote
  fix?: FixStep
  resolved?: boolean
}

export type Workflow = {
  title: string
  durationLabel: string
  steps: EditorStep[]
}

export type RunStepStatus = 'done' | 'active' | 'paused' | 'skipped' | 'pending'

export type RunStep = {
  id: string
  index: number
  label: string
  subLabel?: string
  status: RunStepStatus
}

export type SummaryOutcome = 'stopped' | 'done'

export type SummaryStepKind = 'default' | 'skipped' | 'paused-step' | 'not-yet'

export type SummaryStep = {
  id: string
  name: string
  time: string
  note?: string
  kind: SummaryStepKind
}
