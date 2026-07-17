import type {
  ActivityEntry,
  RecordableApp,
  RunStep,
  Suggestion,
  Workflow,
  WorkflowRecord
} from './types'

export const MOCK_APPS: RecordableApp[] = [
  { id: 'chrome', name: 'Chrome', detail: 'youtube.com' },
  { id: 'figma', name: 'Figma', detail: 'Q3 Onboarding' },
  { id: 'slack', name: 'Slack', detail: '#design-crit' }
]

/** Steps that stream into the "Learning" ledger while recording. */
export const MOCK_WATCH_LOG: { time: string; text: string; voiceNote?: string }[] = [
  { time: '00:04', text: 'Opened youtube.com' },
  {
    time: '00:11',
    text: 'Make exception for Youtube',
    voiceNote: '“...always skip the ads on this”'
  },
  { time: '00:19', text: 'Send link to Minhyeok' },
  { time: '00:26', text: 'Copied the share link' },
  { time: '00:31', text: 'Switched to Slack' }
]

/** The workflow the AI "learns" after organizing a recording. */
export const MOCK_WORKFLOW: Workflow = {
  title: 'Weekly crit prep',
  metaLabel: '6 steps · 1:24',
  trigger: {
    schedule: '1st of each month at 9:00 A.M.',
    upcoming: 'August 1, 2026'
  },
  steps: [
    {
      id: 's1',
      index: 1,
      title: 'Open Q3 Onboarding in',
      app: { id: 'figma', name: 'Figma' }
    },
    {
      id: 's2',
      index: 2,
      title: "Duplicate this week's updated frames",
      voiceNote: { text: '“...Only frames that were edited”' }
    },
    { id: 's3', index: 3, title: 'Paste them into Crit page' },
    {
      id: 's4',
      index: 4,
      title: 'Title the new section',
      fix: {
        prompt: 'I saw “Crit – Jul 6.” Which title should I use?',
        selectedOptionId: 'ask-each-time',
        collapsed: false,
        options: [
          { id: 'ask-each-time', label: 'Ask each time', kind: 'default' },
          { id: 'todays-date', label: "Today's date", kind: 'suggested' },
          { id: 'keep-jul-6', label: 'Keep “Jul 6”', kind: 'default' },
          { id: 'other', label: 'Other...', kind: 'other' }
        ]
      }
    },
    { id: 's5', index: 5, title: 'Open Q3 Onboarding in Figma' },
    { id: 's6', index: 6, title: 'Send to #design-crit', app: { id: 'slack', name: 'Slack' } }
  ]
}

/** Flat run ledger mirroring the editor's steps. */
export function makeRunSteps(workflow: Workflow): RunStep[] {
  const past: Record<string, string> = {
    s1: 'Opened Q3 Onboarding in',
    s2: "Duplicated this week's updated frames",
    s3: 'Pasted them into Crit page',
    s4: 'Titled the new section',
    s5: 'Opened Q3 Onboarding in Figma',
    s6: 'Sent to #design-crit'
  }
  return workflow.steps.map((s) => ({
    id: `run-${s.id}`,
    index: s.index,
    label: s.title,
    doneLabel: past[s.id] ?? s.title,
    app: s.app,
    voiceNote: s.voiceNote,
    status: 'pending' as const,
    question:
      s.fix && s.fix.selectedOptionId === 'ask-each-time'
        ? {
            prompt: 'Which title should I use here?',
            answerId: null,
            options: [
              { id: 'todays-date', label: "Today's date", kind: 'suggested' as const },
              { id: 'keep-jul-6', label: 'Keep “Jul 6”', kind: 'default' as const },
              { id: 'other', label: 'Other...', kind: 'other' as const }
            ]
          }
        : undefined
  }))
}

// ── Workspace mock data ──

export const MOCK_WORKFLOW_RECORDS: WorkflowRecord[] = [
  {
    id: 'w1',
    name: 'Monthly client report',
    schedule: '1st of month at 9:00 A.M.',
    upcoming: 'August 1, 2026',
    status: 'on',
    runs: 12,
    hoursReturned: '≈ 7.6 h returned total',
    steps: MOCK_WORKFLOW.steps.map((s) => ({ ...s, fix: undefined }))
  },
  {
    id: 'w2',
    name: 'New-client folder setup',
    schedule: 'Every week on Thursday at 4:30 P.M.',
    upcoming: 'July 23, 2026',
    status: 'on',
    runs: 8,
    hoursReturned: '≈ 3.1 h returned total',
    steps: MOCK_WORKFLOW.steps.slice(0, 4).map((s) => ({ ...s, fix: undefined }))
  },
  {
    id: 'w3',
    name: 'Invoice reminders',
    schedule: 'Every weekday at 9:00 A.M.',
    upcoming: 'July 17, 2026',
    status: 'on',
    runs: 31,
    hoursReturned: '≈ 12.4 h returned total',
    steps: MOCK_WORKFLOW.steps.slice(0, 3).map((s) => ({ ...s, fix: undefined }))
  },
  {
    id: 'w4',
    name: 'Expense sorting',
    status: 'off',
    runs: 4,
    hoursReturned: '≈ 0.9 h returned total',
    steps: MOCK_WORKFLOW.steps.slice(0, 3).map((s) => ({ ...s, fix: undefined }))
  }
]

export const MOCK_SUGGESTION: Suggestion = {
  id: 'sg1',
  title: 'Weekly design hand-off',
  schedule: 'Every week on Thursday at 4:30 P.M.',
  descriptionBefore: 'On Fridays, you export frames from',
  app: { id: 'figma', name: 'Figma' },
  descriptionAfter:
    ', then rename them by ticket, and post them to #eng-handoff with a checklist message.',
  noticedLine: 'Noticed — you’ve done this 3 Fridays in a row  ·  ≈ 25 min each'
}

export const MOCK_ACTIVITY: ActivityEntry[] = [
  {
    id: 'a1',
    workflowId: 'w3',
    name: 'Invoice reminders',
    timeLabel: 'Tomorrow 9:00 A.M.',
    group: 'coming-up',
    kind: 'scheduled'
  },
  {
    id: 'a2',
    workflowId: 'w1',
    name: 'Monthly client report',
    timeLabel: 'August 1, 4:30 P.M.',
    group: 'coming-up',
    kind: 'scheduled'
  },
  {
    id: 'a3',
    workflowId: 'w1',
    name: 'Monthly client report',
    timeLabel: '9:00 A.M.',
    group: 'today',
    kind: 'run',
    outcome: 'done'
  },
  {
    id: 'a4',
    workflowId: 'w3',
    name: 'Invoice Reminders',
    timeLabel: '4:30 P.M.',
    group: 'today',
    kind: 'run',
    outcome: 'done'
  },
  {
    id: 'a5',
    workflowId: 'w2',
    name: 'Weekly crit prep',
    timeLabel: '2:10 P.M.',
    group: 'today',
    kind: 'run',
    outcome: 'paused'
  },
  {
    id: 'a6',
    workflowId: 'w2',
    name: 'New-client folder setup',
    timeLabel: '4:30 P.M.',
    group: 'yesterday',
    kind: 'run',
    outcome: 'done'
  }
]
