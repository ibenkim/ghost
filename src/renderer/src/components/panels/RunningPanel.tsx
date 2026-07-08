import { useWorkflow } from '../../state/WorkflowContext'
import type { RunStep } from '../../state/types'

export default function RunningPanel() {
  const { workflow, runSteps, runPaused, togglePause, skipActive, stopRunning, editFromRunning } =
    useWorkflow()

  const doneCount = runSteps.filter((s) => s.status === 'done' || s.status === 'skipped').length

  return (
    <div className="card running-panel">
      <div className="running-header">
        <span className="running-title">{workflow.title}</span>
        <span className="running-progress">
          {doneCount} of {runSteps.length}
        </span>
      </div>

      <div className="run-steps">
        {runSteps.map((step) => (
          <RunStepRow key={step.id} step={step} onSkip={skipActive} />
        ))}
      </div>

      <div className="running-footer">
        <button className="btn-text" onClick={editFromRunning}>
          Edit
        </button>
        <div className="running-controls">
          <button className="control-btn" onClick={togglePause}>
            {runPaused ? 'Resume' : 'Pause'}
          </button>
          <button className="btn-danger-text" onClick={stopRunning}>
            Stop
          </button>
        </div>
      </div>
    </div>
  )
}

function RunStepRow({ step, onSkip }: { step: RunStep; onSkip: () => void }) {
  const isActive = step.status === 'active'
  const isPaused = step.status === 'paused'

  return (
    <div
      className={`run-step ${isActive ? 'run-step-active' : ''} ${
        isPaused ? 'run-step-paused' : ''
      } run-step-${step.status}`}
    >
      {step.status === 'pending' ? (
        <span className="run-step-num">{step.index}</span>
      ) : (
        <span className={`run-indicator run-indicator-${step.status}`} />
      )}
      <div className="run-step-body">
        <span className="run-step-label">{step.label}</span>
        {step.subLabel && (
          <span className={isPaused ? 'run-step-sub-paused' : 'run-step-sub'}>
            {isPaused ? 'Paused' : step.subLabel}
          </span>
        )}
      </div>
      {isActive && (
        <button className="run-skip" onClick={onSkip}>
          Skip
        </button>
      )}
      {step.status === 'skipped' && <span className="run-badge">Skipped</span>}
    </div>
  )
}
