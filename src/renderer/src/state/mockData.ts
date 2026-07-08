import type {
  RecordableApp,
  RunStep,
  SummaryStep,
  Workflow
} from './types'

export const MOCK_APPS: RecordableApp[] = [
  { id: 'chrome', name: 'Chrome', detail: 'youtube.com' },
  { id: 'figma', name: 'Figma', detail: 'Q3 Onboarding' },
  { id: 'slack', name: 'Slack', detail: '#design-crit' }
]

/** Steps that stream into the "Watching" log while recording. */
export const MOCK_WATCH_LOG: { time: string; text: string; voiceNote?: string }[] = [
  { time: '00:23', text: 'Opened youtube.com' },
  {
    time: '00:23',
    text: 'Make exception for Youtube',
    voiceNote: '“...always skip the ads on this”'
  },
  { time: '00:23', text: 'Send link to Minhyeok' }
]

/** The workflow the AI "learns" after organizing a recording. */
export const MOCK_WORKFLOW: Workflow = {
  title: 'Weekly crit prep',
  durationLabel: '6 steps · 1:24',
  steps: [
    { id: 's1', index: 1, title: 'Open Q3 Onboarding in Figma' },
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
        options: [
          { id: 'ask-each-time', label: 'Ask each time', kind: 'selected' },
          { id: 'todays-date', label: "Today's date", kind: 'suggested' },
          { id: 'keep-jul-6', label: 'Keep “Jul 6”', kind: 'default' },
          { id: 'something-else', label: 'Something else', kind: 'default' }
        ]
      }
    },
    { id: 's5', index: 5, title: 'Open Q3 Onboarding in Figma' },
    { id: 's6', index: 6, title: 'Post the link in #design-crit', resolved: true }
  ]
}

/** Steps shown in the running state, advanced on a mock interval. */
export const MOCK_RUN_STEPS: RunStep[] = [
  { id: 'r1', index: 1, label: 'Opened Q3 Onboarding in Figma', status: 'done' },
  { id: 'r2', index: 2, label: 'Duplicated 4 updated frames', status: 'done' },
  {
    id: 'r3',
    index: 3,
    label: 'Pasting into the Crit page',
    subLabel: 'Placing 3 frames...',
    status: 'active'
  },
  { id: 'r4', index: 4, label: 'Post link in #design-crit', status: 'pending' }
]

export const MOCK_SUMMARY_STOPPED: SummaryStep[] = [
  { id: 'p1', name: 'Project 1', time: '00:53', kind: 'default' },
  { id: 'p2', name: 'Project 3', time: '01:03', note: 'Skipped Step 3', kind: 'skipped' },
  {
    id: 'p3',
    name: 'Project 3',
    time: '01:03',
    note: 'Paused at Step 3/5',
    kind: 'paused-step'
  },
  { id: 'p4', name: 'Project 1', time: '00:53', kind: 'not-yet' }
]

export const MOCK_SUMMARY_DONE: SummaryStep[] = [
  { id: 'd1', name: 'Project 1', time: '00:53', kind: 'default' },
  { id: 'd2', name: 'Project 3', time: '01:03', note: 'Skipped Step 3', kind: 'skipped' },
  { id: 'd3', name: 'Project 1', time: '00:53', kind: 'default' },
  { id: 'd4', name: 'Project 1', time: '00:53', kind: 'default' }
]

export const SUMMARY_STATUS_LINE = 'Stopped · 1 of 4 files · 1:12'
