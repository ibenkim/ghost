import { mergeComingUp } from './activity'
import type {
  ActivityEntry,
  EditorStep,
  RecordSettings,
  Run,
  RunStepResult,
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

function stepResults(
  baseIso: string,
  labels: { label: string; doneLabel: string; status: RunStepResult['status']; offsetSec: number }[]
): RunStepResult[] {
  const base = Date.parse(baseIso)
  return labels.map((s, i) => {
    const at =
      s.status === 'pending' || s.status === 'active'
        ? undefined
        : new Date(base + s.offsetSec * 1000).toISOString()
    return {
      stepId: `s${i + 1}`,
      index: i + 1,
      label: s.label,
      doneLabel: s.doneLabel,
      status: s.status,
      startedAt: at,
      endedAt: at
    }
  })
}

/** Sample Log history for Monthly client report (w1). */
export const SEED_RUNS: Run[] = [
  {
    id: 'run_seed_jul1',
    workflowId: 'w1',
    startedAt: '2026-07-01T09:00:00.000',
    endedAt: '2026-07-01T09:01:12.000',
    outcome: 'done',
    returnedMinutes: 38,
    questions: [],
    steps: stepResults('2026-07-01T09:00:00.000', [
      { label: 'Open Q3 Onboarding in Figma', doneLabel: 'Opened Q3 Onboarding in Figma', status: 'done', offsetSec: 2 },
      { label: 'Duplicate frames', doneLabel: 'Duplicated 4 updated frames', status: 'done', offsetSec: 11 },
      { label: 'Paste into Crit', doneLabel: 'Pasted them into Crit page', status: 'done', offsetSec: 38 },
      { label: 'Title section', doneLabel: 'Titled the new section “Crit – Jul 1”', status: 'done', offsetSec: 51 },
      { label: 'Copy link', doneLabel: 'Copied the Crit page link', status: 'done', offsetSec: 64 },
      { label: 'Send to Slack', doneLabel: 'Sent it to #design-crit', status: 'done', offsetSec: 72 }
    ]),
    artifactLinks: [{ label: 'View message in Slack ↗', url: 'https://slack.com' }]
  },
  {
    id: 'run_seed_jun24',
    workflowId: 'w1',
    startedAt: '2026-06-24T09:00:00.000',
    endedAt: '2026-06-24T09:01:20.000',
    outcome: 'done',
    returnedMinutes: 36,
    questions: [
      {
        stepId: 's4',
        prompt: 'Which title should I use?',
        answerId: 'todays-date',
        answerLabel: "Today's date",
        answeredAt: '2026-06-24T09:00:51.000'
      }
    ],
    steps: stepResults('2026-06-24T09:00:00.000', [
      { label: 'Open Q3 Onboarding in Figma', doneLabel: 'Opened Q3 Onboarding in Figma', status: 'done', offsetSec: 2 },
      { label: 'Duplicate frames', doneLabel: 'Duplicated 4 updated frames', status: 'done', offsetSec: 11 },
      { label: 'Paste into Crit', doneLabel: 'Pasted them into Crit page', status: 'done', offsetSec: 38 },
      { label: 'Title section', doneLabel: 'Titled the new section “Crit – Jul 8”', status: 'done', offsetSec: 51 },
      { label: 'Copy link', doneLabel: 'Copied the Crit page link', status: 'done', offsetSec: 64 },
      { label: 'Send to Slack', doneLabel: 'Sent it to #design-crit', status: 'done', offsetSec: 80 }
    ]),
    artifactLinks: [{ label: 'View message in Slack ↗', url: 'https://slack.com' }]
  },
  {
    id: 'run_seed_jun17',
    workflowId: 'w1',
    startedAt: '2026-06-17T09:00:00.000',
    endedAt: '2026-06-17T09:00:44.000',
    outcome: 'stopped',
    stopReason: 'Stopped — needed help at step 3',
    questions: [],
    steps: stepResults('2026-06-17T09:00:00.000', [
      { label: 'Open Q3 Onboarding in Figma', doneLabel: 'Opened Q3 Onboarding in Figma', status: 'done', offsetSec: 2 },
      { label: 'Duplicate frames', doneLabel: 'Duplicated 4 updated frames', status: 'done', offsetSec: 11 },
      { label: 'Paste into Crit', doneLabel: 'Pasted them into Crit page', status: 'held', offsetSec: 38 },
      { label: 'Title section', doneLabel: 'Title the new section', status: 'pending', offsetSec: 0 },
      { label: 'Copy link', doneLabel: 'Copy the Crit page link', status: 'pending', offsetSec: 0 },
      { label: 'Send to Slack', doneLabel: 'Send to #design-crit', status: 'pending', offsetSec: 0 }
    ])
  },
  {
    id: 'run_seed_jun10',
    workflowId: 'w1',
    startedAt: '2026-06-10T09:00:00.000',
    endedAt: '2026-06-10T09:01:09.000',
    outcome: 'done',
    returnedMinutes: 38,
    questions: [],
    steps: stepResults('2026-06-10T09:00:00.000', [
      { label: 'Open Q3 Onboarding in Figma', doneLabel: 'Opened Q3 Onboarding in Figma', status: 'done', offsetSec: 2 },
      { label: 'Duplicate frames', doneLabel: 'Duplicated 4 updated frames', status: 'done', offsetSec: 11 },
      { label: 'Paste into Crit', doneLabel: 'Pasted them into Crit page', status: 'done', offsetSec: 38 },
      { label: 'Title section', doneLabel: 'Titled the new section', status: 'done', offsetSec: 51 },
      { label: 'Copy link', doneLabel: 'Copied the Crit page link', status: 'done', offsetSec: 64 },
      { label: 'Send to Slack', doneLabel: 'Sent it to #design-crit', status: 'done', offsetSec: 69 }
    ]),
    artifactLinks: [{ label: 'View message in Slack ↗', url: 'https://slack.com' }]
  },
  {
    id: 'run_seed_today_w1',
    workflowId: 'w1',
    startedAt: '2026-07-19T09:00:00.000',
    endedAt: '2026-07-19T09:01:12.000',
    outcome: 'done',
    returnedMinutes: 38,
    questions: [],
    steps: stepResults('2026-07-19T09:00:00.000', [
      { label: 'Open Q3 Onboarding in Figma', doneLabel: 'Opened Q3 Onboarding in Figma', status: 'done', offsetSec: 2 },
      { label: 'Duplicate frames', doneLabel: 'Duplicated 4 updated frames', status: 'done', offsetSec: 11 },
      { label: 'Paste into Crit', doneLabel: 'Pasted them into Crit page', status: 'done', offsetSec: 38 },
      { label: 'Title section', doneLabel: 'Titled the new section', status: 'done', offsetSec: 51 },
      { label: 'Copy link', doneLabel: 'Copied the Crit page link', status: 'done', offsetSec: 64 },
      { label: 'Send to Slack', doneLabel: 'Sent it to #design-crit', status: 'done', offsetSec: 72 }
    ])
  },
  {
    id: 'run_seed_today_w3',
    workflowId: 'w3',
    startedAt: '2026-07-19T16:30:00.000',
    endedAt: '2026-07-19T16:30:40.000',
    outcome: 'done',
    returnedMinutes: 22,
    questions: [],
    steps: stepResults('2026-07-19T16:30:00.000', [
      { label: 'Open invoices', doneLabel: 'Opened invoices', status: 'done', offsetSec: 5 },
      { label: 'Send reminders', doneLabel: 'Sent reminders', status: 'done', offsetSec: 25 },
      { label: 'Log results', doneLabel: 'Logged results', status: 'done', offsetSec: 40 }
    ])
  },
  {
    id: 'run_seed_yesterday_w2',
    workflowId: 'w2',
    startedAt: '2026-07-18T16:30:00.000',
    endedAt: '2026-07-18T16:30:48.000',
    outcome: 'done',
    returnedMinutes: 18,
    questions: [],
    steps: stepResults('2026-07-18T16:30:00.000', [
      { label: 'Create folder', doneLabel: 'Created folder', status: 'done', offsetSec: 10 },
      { label: 'Add templates', doneLabel: 'Added templates', status: 'done', offsetSec: 30 },
      { label: 'Share link', doneLabel: 'Shared link', status: 'done', offsetSec: 48 },
      { label: 'Notify team', doneLabel: 'Notified team', status: 'done', offsetSec: 48 }
    ])
  }
]

/** Historical run rows only — COMING UP is generated from the schedule model. */
export const SEED_ACTIVITY: ActivityEntry[] = [
  {
    id: 'act_run_seed_today_w1',
    workflowId: 'w1',
    runId: 'run_seed_today_w1',
    name: 'Monthly client report',
    timeLabel: '9:00 A.M.',
    group: 'today',
    kind: 'run',
    outcome: 'done'
  },
  {
    id: 'act_run_seed_today_w3',
    workflowId: 'w3',
    runId: 'run_seed_today_w3',
    name: 'Invoice Reminders',
    timeLabel: '4:30 P.M.',
    group: 'today',
    kind: 'run',
    outcome: 'done'
  },
  {
    id: 'act_run_seed_yesterday_w2',
    workflowId: 'w2',
    runId: 'run_seed_yesterday_w2',
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

/**
 * First-run seed only — subsequent launches load persisted JSON.
 *
 * v3 gates the app behind onboarding, and 4.1 first-run lands on an EMPTY
 * Library (zero workflows / runs / suggestion). The rich SEED_* fixtures are
 * retained for tests / demos but no longer populate a fresh install.
 */
export function createSeedSnapshot(): StoreSnapshot {
  return {
    version: 1,
    workflows: [],
    runs: [],
    activity: mergeComingUp([], []),
    suggestion: null,
    discardedSuggestionIds: [],
    recordSettings: { ...DEFAULT_RECORD_SETTINGS },
    pillPosition: null,
    onboardingComplete: false,
    onboardingStep: 'welcome',
    session: null,
    team: null,
    micSkipped: false,
    permissionToastDismissedAt: null,
    lastPermissionRevokeAt: null
  }
}
