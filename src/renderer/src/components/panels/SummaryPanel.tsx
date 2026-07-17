import { useState } from 'react'
import { useWorkflow } from '../../state/WorkflowContext'
import type { RunStep } from '../../state/types'
import AppChip from '../shared/AppChip'

/**
 * 07 — summary recap. Per-step rows with chevrons that expand detail;
 * app chips and voice quotes preserved. Meta leads with the outcome.
 */
export default function SummaryPanel() {
  const {
    workflow,
    runSteps,
    summaryOutcome,
    summaryMeta,
    finishSummary,
    runRemaining
  } = useWorkflow()
  const isStopped = summaryOutcome === 'stopped'
  // Hovering "Run remaining" highlights the rows it will act on.
  const [previewRemaining, setPreviewRemaining] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="summary-panel">
      <div className="summary-head">
        <div className="summary-title">{workflow.title}</div>
        <div className="meta">{summaryMeta}</div>
      </div>

      <div className="run-steps scroll">
        {runSteps.map((step) => (
          <SummaryStepRow
            key={step.id}
            step={step}
            expanded={expandedId === step.id}
            onToggle={() => setExpandedId(expandedId === step.id ? null : step.id)}
            highlighted={
              previewRemaining &&
              (step.status === 'active' || step.status === 'question' || step.status === 'pending')
            }
          />
        ))}
      </div>

      <div className="ledger-footer">
        <button className="btn-text" onClick={() => window.ghostBridge?.openWorkspace?.()}>
          View log
        </button>
        <div className="footer-actions">
          {isStopped && (
            <button
              className="btn btn-outline"
              onClick={runRemaining}
              onMouseEnter={() => setPreviewRemaining(true)}
              onMouseLeave={() => setPreviewRemaining(false)}
            >
              Run remaining
            </button>
          )}
          <button className="btn btn-outline btn-done" onClick={finishSummary}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function SummaryStepRow({
  step,
  expanded,
  onToggle,
  highlighted
}: {
  step: RunStep
  expanded: boolean
  onToggle: () => void
  highlighted: boolean
}) {
  const isDone = step.status === 'done'
  const isSkipped = step.status === 'skipped'
  const isPausedHere = step.status === 'active' || step.status === 'question'
  const isNotYet = step.status === 'pending'

  return (
    <div>
      <button
        className={`run-step summary-row ${isPausedHere ? 'summary-row-paused' : ''} ${
          highlighted ? 'summary-row-highlight' : ''
        } ${isDone || isSkipped ? 'run-step-past' : ''} ${isNotYet ? 'summary-row-notyet' : ''}`}
        onClick={onToggle}
      >
        <span className="step-num">{step.index}</span>
        <div className="run-step-body">
          <span className={`run-step-label ${isPausedHere ? 'run-step-label-current' : ''}`}>
            {isDone ? step.doneLabel : step.label}
            {step.app && <AppChip app={step.app} muted={isDone || isSkipped || isNotYet} />}
          </span>
          {step.voiceNote && (
            <span className="run-voice-quote">{step.voiceNote.text.replace(/[“”"…]/g, '').replace(/^\.{3}/, '')}</span>
          )}
        </div>
        {isPausedHere ? (
          <PauseBars />
        ) : isSkipped ? (
          <span className="run-skipped-mark">Skipped</span>
        ) : (
          <ChevronExpand open={expanded} muted={isNotYet} />
        )}
      </button>
      {expanded && (
        <div className="summary-detail">
          {isDone && `Completed in 12s — ${step.doneLabel}.`}
          {isSkipped && 'Skipped by you during the run.'}
          {isPausedHere && 'The run stopped while this step was in progress.'}
          {isNotYet && 'Not reached — will run in full with "Run remaining".'}
        </div>
      )}
    </div>
  )
}

function PauseBars() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" className="summary-pausebars">
      <rect x="1" width="2" height="8" rx="1" fill="rgba(217,107,80,0.85)" />
      <rect x="5" width="2" height="8" rx="1" fill="rgba(217,107,80,0.85)" />
    </svg>
  )
}

function ChevronExpand({ open, muted }: { open: boolean; muted: boolean }) {
  return (
    <svg
      width="9"
      height="6"
      viewBox="0 0 9 6"
      fill="none"
      stroke={muted ? 'rgba(161,161,171,0.5)' : 'rgba(161,161,171,0.9)'}
      strokeWidth="1"
      style={{ transform: open ? 'rotate(180deg)' : undefined, flexShrink: 0 }}
    >
      <path d="M0.5 1 4.5 5 8.5 1" />
    </svg>
  )
}
