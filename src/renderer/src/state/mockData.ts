import type { RecordableApp, RunProject, Workflow } from './types'

export const MOCK_APPS: RecordableApp[] = [
  { id: 'chrome', name: 'Chrome', detail: 'youtube.com' },
  { id: 'figma', name: 'Figma', detail: 'Q3 Onboarding' },
  { id: 'slack', name: 'Slack', detail: '#design-crit' }
]

/** Steps that stream into the "Watching" ledger while recording. */
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
          { id: 'ask-each-time', label: 'Ask each time', kind: 'default' },
          { id: 'todays-date', label: "Today's date", kind: 'suggested' },
          { id: 'keep-jul-6', label: 'Keep “Jul 6”', kind: 'default' },
          { id: 'something-else', label: 'Something else', kind: 'other' }
        ]
      }
    },
    { id: 's5', index: 5, title: 'Collect open comments' },
    { id: 's6', index: 6, title: 'Post the link in #design-crit', phase: 'resolved' }
  ]
}

/**
 * Projects the workflow runs against. Each named item is processed with the
 * same learned steps; the "Ask each time" step holds the run for an answer.
 */
export function makeRunProjects(): RunProject[] {
  const makeSteps = (projectId: string, askEachTime: boolean) => [
    {
      id: `${projectId}-1`,
      index: 1,
      label: 'Open Q3 Onboarding in Figma',
      doneLabel: 'Opened Q3 Onboarding in Figma',
      status: 'pending' as const
    },
    {
      id: `${projectId}-2`,
      index: 2,
      label: 'Duplicate updated frames',
      doneLabel: 'Duplicated 4 updated frames',
      status: 'pending' as const
    },
    {
      id: `${projectId}-3`,
      index: 3,
      label: 'Paste into the Crit page',
      doneLabel: 'Pasted into the Crit page',
      activeDetail: 'Placing 3 frames...',
      status: 'pending' as const
    },
    {
      id: `${projectId}-4`,
      index: 4,
      label: 'Title the new section',
      doneLabel: 'Titled the new section',
      status: 'pending' as const,
      question: askEachTime
        ? {
            prompt: 'Which title should I use here?',
            answerId: null,
            options: [
              { id: 'todays-date', label: "Today's date", kind: 'suggested' as const },
              { id: 'keep-name', label: 'Keep “Jul 6”', kind: 'default' as const },
              { id: 'other', label: 'Other...', kind: 'other' as const }
            ]
          }
        : undefined
    },
    {
      id: `${projectId}-5`,
      index: 5,
      label: 'Post link in #design-crit',
      doneLabel: 'Posted link in #design-crit',
      status: 'pending' as const
    }
  ]

  return [
    { id: 'cubit', name: 'Cubit', steps: makeSteps('cubit', false) },
    { id: 'ghost', name: 'Ghost', steps: makeSteps('ghost', true) },
    { id: 'decor', name: 'Decor', steps: makeSteps('decor', false) },
    { id: 'sunset', name: 'Sunset Studio', steps: makeSteps('sunset', false) }
  ]
}
