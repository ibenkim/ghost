import { formatSchedule } from '../../../shared/schedule'
import type { Suggestion, Workflow } from '../state/types'
import AppChip from '../components/shared/AppChip'

/** 1.2–1.4 — Workflows home: metric header, rows with On/Off, Suggested card.
 *  Shared page reuses the same row grammar with a "shared by …" chip. */
export default function WorkflowsHome({
  workflows,
  hoursLine,
  suggestion,
  ownerTeamSize,
  variant = 'personal',
  onOpen,
  onToggleStatus,
  onDiscardSuggestion
}: {
  workflows: Workflow[]
  hoursLine: string
  suggestion: Suggestion | null
  /** When set, home header uses the owner team metric. */
  ownerTeamSize?: number
  /** `shared` lists team-scoped workflows with a "shared by …" chip. */
  variant?: 'personal' | 'shared'
  onOpen: (id: string) => void
  onToggleStatus: (id: string) => void
  onDiscardSuggestion: () => void
}) {
  const isShared = variant === 'shared'

  // 4.1 first-run — empty Library: ready-state sub-line (no zero metric),
  // centered record CTA that parks the window and opens the record panel.
  // Shared empty state is a quieter mirror (no record CTA).
  if (workflows.length === 0 && !suggestion) {
    return (
      <div className="ws-view">
        <div className="ws-header">
          <div>
            <div className="ws-header-title">{isShared ? 'Shared' : 'Workflows'}</div>
            <div className="ws-header-sub">
              {isShared
                ? 'Nothing shared with the team yet'
                : 'Nothing here yet — yuh is ready when you are'}
            </div>
          </div>
        </div>
        {!isShared && (
          <div className="ws-empty">
            <div className="ws-empty-title">Record your first workflow</div>
            <div className="ws-empty-desc">
              Do the task once, the way you always do.
              <br />
              yuh learns the steps — then does it for you, on schedule.
            </div>
            <button
              className="ws-empty-cta"
              onClick={() => {
                window.ghostBridge?.minimizeWindow?.()
                window.ghostBridge?.openRecordPanel?.()
              }}
            >
              +  Record a workflow
            </button>
            <div className="ws-empty-hint">
              yuh will also suggest workflows when it notices you repeating things
            </div>
          </div>
        )}
      </div>
    )
  }

  // Owner: "6 workflows · Team of 4 · ≈ 21 h returned this month"
  // Employee: title count + hours sub-line (unchanged).
  // Shared: "N shared" count header.
  const hoursMetric = hoursLine.startsWith('≈') ? hoursLine : `≈ ${hoursLine}`
  const isOwnerHeader = !isShared && ownerTeamSize != null

  return (
    <div className="ws-view">
      <div className="ws-header">
        <div>
          {isShared ? (
            <div className="ws-header-title">
              {workflows.length} shared
            </div>
          ) : isOwnerHeader ? (
            <div className="ws-header-title">
              {workflows.length} workflows · Team of {ownerTeamSize} · {hoursMetric}
            </div>
          ) : (
            <>
              <div className="ws-header-title">{workflows.length} workflows</div>
              <div className="ws-header-sub">{hoursLine}</div>
            </>
          )}
        </div>
        {!isShared && (
          <button
            className="btn-small-outline"
            onClick={() => window.ghostBridge?.openRecordPanel?.()}
          >
            + Record a workflow
          </button>
        )}
      </div>

      <div className="ws-rows">
        {workflows.map((w) => {
          const schedule = w.trigger.cadence ? formatSchedule(w.trigger.cadence) : null
          const sharedByLabel = w.sharedByName ? `shared by ${w.sharedByName}` : null
          return (
            <div className="ws-row" key={w.id} onClick={() => onOpen(w.id)}>
              <span className={`ws-row-name ${w.status === 'off' ? 'ws-row-name-off' : ''}`}>
                {w.name}
                {schedule && <span className="ws-row-schedule">  ·  {schedule}</span>}
              </span>
              <span className="ws-row-right">
                {isShared && sharedByLabel && (
                  <span className="manage-role-chip">{sharedByLabel}</span>
                )}
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

      {!isShared && suggestion && (
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
