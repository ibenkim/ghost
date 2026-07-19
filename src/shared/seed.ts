import type {
  ActivityEntry,
  EditorStep,
  RecordSettings,
  StoreSnapshot,
  Suggestion,
  Weekday,
  Workflow
} from './types'

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5]

const CRIT_STEPS: EditorStep[] = [
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

function stripFix(steps: EditorStep[]): EditorStep[] {
  return steps.map((s) => {
    const copy: EditorStep = { ...s }
    delete copy.fix
    return copy
  })
}

/** Template used when organizing a fresh recording into the editor. */
export function makeDraftWorkflow(id: string): Workflow {
  return {
    id,
    name: 'Weekly crit prep',
    metaLabel: '6 steps · 1:24',
    trigger: {
      cadence: { kind: 'monthly', day: 1, time: { hour: 9, minute: 0 } }
    },
    steps: CRIT_STEPS.map((s) => ({ ...s, fix: s.fix ? { ...s.fix, options: [...s.fix.options] } : undefined })),
    status: 'on',
    runCount: 0,
    hoursReturned: '≈ 0 h returned total'
  }
}

export const SEED_WORKFLOWS: Workflow[] = [
  {
    id: 'w1',
    name: 'Monthly client report',
    metaLabel: '6 steps · 1:24',
    trigger: {
      cadence: { kind: 'monthly', day: 1, time: { hour: 9, minute: 0 } }
    },
    status: 'on',
    runCount: 12,
    hoursReturned: '≈ 7.6 h returned total',
    steps: stripFix(CRIT_STEPS)
  },
  {
    id: 'w2',
    name: 'New-client folder setup',
    metaLabel: '4 steps · 0:48',
    trigger: {
      cadence: { kind: 'weekly', days: [4 as Weekday], time: { hour: 16, minute: 30 } }
    },
    status: 'on',
    runCount: 8,
    hoursReturned: '≈ 3.1 h returned total',
    steps: stripFix(CRIT_STEPS.slice(0, 4))
  },
  {
    id: 'w3',
    name: 'Invoice reminders',
    metaLabel: '3 steps · 0:36',
    trigger: {
      cadence: { kind: 'weekly', days: WEEKDAYS, time: { hour: 9, minute: 0 } }
    },
    status: 'on',
    runCount: 31,
    hoursReturned: '≈ 12.4 h returned total',
    steps: stripFix(CRIT_STEPS.slice(0, 3))
  },
  {
    id: 'w4',
    name: 'Expense sorting',
    metaLabel: '3 steps · 0:30',
    trigger: {},
    status: 'off',
    runCount: 4,
    hoursReturned: '≈ 0.9 h returned total',
    steps: stripFix(CRIT_STEPS.slice(0, 3))
  }
]

export const SEED_SUGGESTION: Suggestion = {
  id: 'sg1',
  title: 'Weekly design hand-off',
  schedule: 'Every week on Thursday at 4:30 P.M.',
  descriptionBefore: 'On Fridays, you export frames from',
  app: { id: 'figma', name: 'Figma' },
  descriptionAfter:
    ', then rename them by ticket, and post them to #eng-handoff with a checklist message.',
  noticedLine: 'Noticed — you’ve done this 3 Fridays in a row  ·  ≈ 25 min each'
}

export const SEED_ACTIVITY: ActivityEntry[] = [
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

export const DEFAULT_RECORD_SETTINGS: RecordSettings = {
  recordMode: 'one-app',
  narrate: true,
  selectedAppId: 'chrome'
}

/** First-run seed only — subsequent launches load persisted JSON. */
export function createSeedSnapshot(): StoreSnapshot {
  return {
    version: 1,
    workflows: SEED_WORKFLOWS.map((w) => ({
      ...w,
      steps: w.steps.map((s) => ({ ...s })),
      trigger: { ...w.trigger, cadence: w.trigger.cadence ? { ...w.trigger.cadence } : undefined }
    })),
    runs: [],
    activity: SEED_ACTIVITY.map((a) => ({ ...a })),
    suggestion: { ...SEED_SUGGESTION },
    discardedSuggestionIds: [],
    recordSettings: { ...DEFAULT_RECORD_SETTINGS },
    pillPosition: null,
    onboardingComplete: false,
    session: null
  }
}
