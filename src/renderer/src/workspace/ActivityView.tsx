import {
  formatWaitingSince
} from '../../../shared/runFormat'
import type { ActivityEntry } from '../state/types'
import { ChevronRight } from './WorkflowsHome'

const GROUPS: { key: ActivityEntry['group']; label: string }[] = [
  { key: 'coming-up', label: 'COMING UP' },
  { key: 'today', label: 'TODAY' },
  { key: 'yesterday', label: 'YESTERDAY' }
]

/**
 * 02 — Activity: COMING UP from the schedule model, TODAY / YESTERDAY from
 * persisted runs + live needs-you holds mirrored from the pill.
 */
export default function ActivityView({
  entries,
  onOpenWorkflow,
  onOpenRun,
  onSkip,
  onAnswerHold
}: {
  entries: ActivityEntry[]
  onOpenWorkflow: (workflowId: string) => void
  onOpenRun: (workflowId: string, runId: string) => void
  onSkip: (entryId: string) => void
  onAnswerHold: () => void
}) {
  const scheduledCount = new Set(
    entries.filter((e) => e.kind === 'scheduled' && !e.skipped).map((e) => e.workflowId)
  ).size

  return (
    <div className="ws-view">
      <div className="ws-header">
        <div>
          <div className="ws-header-title">Activity</div>
          <div className="ws-header-sub">{scheduledCount} workflows scheduled</div>
        </div>
      </div>

      <div className="ws-detail-body scroll">
        {GROUPS.map((group) => {
          const rows = entries.filter((e) => e.group === group.key)
          if (rows.length === 0) return null
          return (
            <div className="ledger-section" key={group.key}>
              <div className="section-label">{group.label}</div>
              {rows.map((entry) => (
                <ActivityRow
                  key={entry.id}
                  entry={entry}
                  onOpen={() => {
                    if (entry.kind === 'run' && entry.runId && entry.outcome === 'done') {
                      onOpenRun(entry.workflowId, entry.runId)
                    } else if (entry.needsYou || entry.outcome === 'paused') {
                      onAnswerHold()
                    } else {
                      onOpenWorkflow(entry.workflowId)
                    }
                  }}
                  onSkip={() => onSkip(entry.id)}
                  onAnswer={onAnswerHold}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActivityRow({
  entry,
  onOpen,
  onSkip,
  onAnswer
}: {
  entry: ActivityEntry
  onOpen: () => void
  onSkip: () => void
  onAnswer: () => void
}) {
  const isScheduled = entry.kind === 'scheduled'
  const needsAnswer = entry.needsYou === 'answer'
  const needsHelp = entry.needsYou === 'help'
  const stoppedHelp = Boolean(entry.stopReason) && entry.outcome === 'stopped'

  if (needsAnswer || needsHelp) {
    const since = formatWaitingSince(entry.waitingSince)
    const line = needsHelp
      ? `${entry.name} · needs help${entry.heldStepIndex ? ` at step ${entry.heldStepIndex}` : ''}`
      : `${entry.name} · waiting on your answer since ${since}`
    return (
      <div
        className={`ws-row activity-row ${needsHelp ? 'activity-row-help' : 'activity-row-needs'}`}
        onClick={onOpen}
      >
        <span className="ws-row-name activity-needs-text">{line}</span>
        <span className="ws-row-right">
          <button
            className={`status-chip ${needsHelp ? 'status-chip-help' : 'status-chip-answer'}`}
            onClick={(e) => {
              e.stopPropagation()
              onAnswer()
            }}
          >
            {needsHelp ? 'Help' : 'Answer'}
          </button>
          <ChevronRight />
        </span>
      </div>
    )
  }

  if (stoppedHelp) {
    return (
      <div className="ws-row activity-row activity-row-help" onClick={onOpen}>
        <span className="ws-row-name activity-needs-text">
          {entry.name} · {entry.stopReason}
        </span>
        <span className="ws-row-right">
          <ChevronRight />
        </span>
      </div>
    )
  }

  const highlight = isScheduled && !entry.skipped

  return (
    <div
      className={`ws-row activity-row ${highlight ? 'activity-row-scheduled' : ''} ${
        entry.skipped ? 'activity-row-skipped' : ''
      }`}
      onClick={onOpen}
    >
      <span className={`ws-row-name ${entry.skipped || entry.kind === 'run' ? 'ws-row-name-off' : ''}`}>
        {entry.name}
        <span className="ws-row-schedule">  ·  {entry.timeLabel}</span>
      </span>
      <span className="ws-row-right">
        {isScheduled ? (
          entry.skipped ? (
            <span className="status-word status-off">Skipped</span>
          ) : (
            <>
              <span className="status-chip">Scheduled</span>
              <button
                className="skip-link"
                onClick={(e) => {
                  e.stopPropagation()
                  onSkip()
                }}
              >
                Skip
              </button>
            </>
          )
        ) : entry.outcome === 'paused' ? (
          <button
            className="status-chip status-chip-paused"
            onClick={(e) => {
              e.stopPropagation()
              onAnswer()
            }}
          >
            Paused
          </button>
        ) : (
          <span className="status-word status-off">
            {entry.outcome === 'stopped' ? 'Stopped' : 'Done'}
          </span>
        )}
        <ChevronRight />
      </span>
    </div>
  )
}
