import { useState } from 'react'
import { useWorkflow } from '../../state/WorkflowContext'
import type { SummaryRow } from '../../state/types'

export default function SummaryPanel() {
  const { workflow, summaryOutcome, summaryRows, summaryMeta, finishSummary, finishRemaining } =
    useWorkflow()
  const isStopped = summaryOutcome === 'stopped'
  // Hovering "Finish remaining" highlights the rows it will act on.
  const [previewRemaining, setPreviewRemaining] = useState(false)

  return (
    <div className="card summary-panel">
      <div>
        <div className="eyebrow">Here's what I've done</div>
        <div className="title-lg">{workflow.title}</div>
        <div className="meta">{summaryMeta}</div>
      </div>

      <div className="summary-steps">
        {summaryRows.map((row) => (
          <SummaryStepRow
            key={row.projectId}
            row={row}
            highlighted={
              previewRemaining && (row.kind === 'stopped' || row.kind === 'not-yet')
            }
          />
        ))}
      </div>

      <div className="panel-divider" />
      <div className="panel-footer">
        <button className="btn-text">View Log</button>
        <div className="footer-actions">
          {isStopped && (
            <button
              className="btn btn-outline"
              onClick={finishRemaining}
              onMouseEnter={() => setPreviewRemaining(true)}
              onMouseLeave={() => setPreviewRemaining(false)}
            >
              Finish remaining
            </button>
          )}
          <button className="btn btn-primary" onClick={finishSummary}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryStepRow({ row, highlighted }: { row: SummaryRow; highlighted: boolean }) {
  return (
    <div className={`summary-step ${highlighted ? 'summary-step-highlight' : ''}`}>
      <Indicator kind={row.kind} />
      <div className="summary-step-body">
        <span
          className={`summary-step-name ${row.kind === 'not-yet' ? 'summary-step-name-faint' : ''}`}
        >
          {row.name}
        </span>
        {row.note && (
          <span
            className={`summary-step-note ${row.kind === 'stopped' ? 'summary-step-note-stopped' : ''}`}
          >
            {row.note}
          </span>
        )}
      </div>
      <span className="summary-step-time">{row.time}</span>
    </div>
  )
}

function Indicator({ kind }: { kind: SummaryRow['kind'] }) {
  if (kind === 'stopped') {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" className="summary-glyph">
        <rect x="1.5" width="2.5" height="10" rx="1.25" fill="rgba(179,95,72,0.8)" />
        <rect x="6" width="2.5" height="10" rx="1.25" fill="rgba(179,95,72,0.8)" />
      </svg>
    )
  }
  if (kind === 'not-yet') {
    return <span className="summary-indicator summary-indicator-empty" />
  }
  return (
    <span className="summary-indicator">
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  )
}
