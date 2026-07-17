import type { ActivityEntry } from '../state/types'
import { ChevronRight } from './WorkflowsHome'

const GROUPS: { key: ActivityEntry['group']; label: string }[] = [
  { key: 'coming-up', label: 'COMING UP' },
  { key: 'today', label: 'TODAY' },
  { key: 'yesterday', label: 'YESTERDAY' }
]

/**
 * 02 — Activity: a timeline grouped COMING UP / TODAY / YESTERDAY.
 * Scheduled occurrences can be skipped one at a time; runs record their
 * outcome even when the workspace was never opened.
 */
export default function ActivityView({
  entries,
  onOpenWorkflow,
  onSkip
}: {
  entries: ActivityEntry[]
  onOpenWorkflow: (workflowId: string) => void
  onSkip: (entryId: string) => void
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
                  onOpen={() => onOpenWorkflow(entry.workflowId)}
                  onSkip={() => onSkip(entry.id)}
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
  onSkip
}: {
  entry: ActivityEntry
  onOpen: () => void
  onSkip: () => void
}) {
  const isScheduled = entry.kind === 'scheduled'
  const highlight = isScheduled && !entry.skipped

  return (
    <div
      className={`ws-row activity-row ${highlight ? 'activity-row-scheduled' : ''} ${
        entry.skipped ? 'activity-row-skipped' : ''
      }`}
      onClick={onOpen}
    >
      <span className={`ws-row-name ${entry.skipped || entry.kind === 'run' ? '' : ''} ${
        entry.skipped ? 'ws-row-name-off' : ''
      }`}
      >
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
              // Reopens the running panel at the held step.
              window.ghostBridge?.runWorkflow?.(entry.workflowId)
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
