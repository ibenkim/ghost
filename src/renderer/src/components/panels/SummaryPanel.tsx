import { useWorkflow } from '../../state/WorkflowContext'
import {
  MOCK_SUMMARY_DONE,
  MOCK_SUMMARY_STOPPED,
  SUMMARY_STATUS_LINE
} from '../../state/mockData'
import type { SummaryStep } from '../../state/types'

export default function SummaryPanel() {
  const { workflow, summaryOutcome, finishSummary, finishRemaining } = useWorkflow()
  const isStopped = summaryOutcome === 'stopped'
  const steps = isStopped ? MOCK_SUMMARY_STOPPED : MOCK_SUMMARY_DONE

  return (
    <div className="card summary-panel">
      <div>
        <div className="eyebrow">Here's what I've done</div>
        <div className="title-lg">{workflow.title}</div>
        <div className="meta">{SUMMARY_STATUS_LINE}</div>
      </div>

      <div className="summary-steps">
        {steps.map((step) => (
          <SummaryStepRow key={step.id} step={step} />
        ))}
      </div>

      <div className="panel-divider" />
      <div className="panel-footer">
        <button className="btn-text">View Log</button>
        <div className="footer-actions">
          {isStopped && (
            <button className="btn btn-outline" onClick={finishRemaining}>
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

function SummaryStepRow({ step }: { step: SummaryStep }) {
  return (
    <div className="summary-step">
      {step.kind === 'paused-step' ? (
        <span className="summary-indicator-paused" />
      ) : (
        <span
          className={`summary-indicator ${
            step.kind === 'not-yet' ? 'summary-indicator-empty' : ''
          }`}
        >
          {step.kind !== 'not-yet' && <CheckIcon />}
        </span>
      )}
      <div className="summary-step-body">
        <span
          className={`summary-step-name ${
            step.kind === 'not-yet' ? 'summary-step-name-faint' : ''
          }`}
        >
          {step.name}
        </span>
        {step.note && (
          <span
            className={`summary-step-note ${
              step.kind === 'paused-step' ? 'summary-step-note-paused' : ''
            }`}
          >
            {step.note}
          </span>
        )}
      </div>
      <span className="summary-step-time">{step.time}</span>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
