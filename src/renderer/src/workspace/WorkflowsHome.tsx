import { formatSchedule } from '../../../shared/schedule'
import type { Suggestion, Workflow } from '../state/types'
import AppChip from '../components/shared/AppChip'

/** 1.2–1.4 — Workflows home: metric header, rows with On/Off, Suggested card. */
export default function WorkflowsHome({
  workflows,
  hoursLine,
  suggestion,
  onOpen,
  onToggleStatus,
  onDiscardSuggestion
}: {
  workflows: Workflow[]
  hoursLine: string
  suggestion: Suggestion | null
  onOpen: (id: string) => void
  onToggleStatus: (id: string) => void
  onDiscardSuggestion: () => void
}) {
  return (
    <div className="ws-view">
      <div className="ws-header">
        <div>
          <div className="ws-header-title">{workflows.length} workflows</div>
          <div className="ws-header-sub">{hoursLine}</div>
        </div>
        <button
          className="btn-small-outline"
          onClick={() => window.ghostBridge?.openRecordPanel?.()}
        >
          + Record a workflow
        </button>
      </div>

      <div className="ws-rows">
        {workflows.map((w) => {
          const schedule = w.trigger.cadence ? formatSchedule(w.trigger.cadence) : null
          return (
            <div className="ws-row" key={w.id} onClick={() => onOpen(w.id)}>
              <span className={`ws-row-name ${w.status === 'off' ? 'ws-row-name-off' : ''}`}>
                {w.name}
                {schedule && <span className="ws-row-schedule">  ·  {schedule}</span>}
              </span>
              <span className="ws-row-right">
                <button
                  className={`status-word ${w.status === 'on' ? 'status-on' : 'status-off'}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleStatus(w.id)
                  }}
                >
                  {w.status === 'on' ? 'On' : 'Off'}
                </button>
                <ChevronRight />
              </span>
            </div>
          )
        })}
      </div>

      {suggestion && (
        <div className="suggested-block">
          <div className="suggested-label">Suggested</div>
          <div className="suggested-card">
            <div className="suggested-title">
              {suggestion.title}
              <span className="ws-row-schedule">  ·  {suggestion.schedule}</span>
            </div>
            <div className="suggested-desc">
              {suggestion.descriptionBefore} <AppChip app={suggestion.app} />
              {suggestion.descriptionAfter}
            </div>
            <div className="suggested-noticed">{suggestion.noticedLine}</div>
            <div className="suggested-actions">
              <button
                className="btn-small-outline"
                onClick={() => window.ghostBridge?.openEditor?.()}
              >
                Set it up for me
              </button>
              <button
                className="btn-small-outline"
                onClick={() => window.ghostBridge?.openRecordPanel?.()}
              >
                Record it myself
              </button>
              <button className="btn-text btn-text-sm" onClick={onDiscardSuggestion}>
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ChevronRight() {
  return (
    <svg width="4" height="7" viewBox="0 0 4 7" fill="none" stroke="rgba(161,161,171,0.8)" strokeWidth="1">
      <path d="M0.5 0.5 3.5 3.5 0.5 6.5" />
    </svg>
  )
}
