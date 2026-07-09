import { useState } from 'react'
import { useWorkflow } from '../../state/WorkflowContext'
import type { RunProject, RunStep } from '../../state/types'

export default function RunningPanel() {
  const {
    workflow,
    runProjects,
    runPaused,
    setRunCollapsed,
    isProjectExpanded,
    toggleProject,
    projectStatus,
    projectProgress,
    doneProjectCount,
    togglePause,
    skipActive,
    stopRunning,
    editFromRunning,
    answerQuestion
  } = useWorkflow()

  return (
    <div className="card running-panel">
      <button className="running-header" onClick={() => setRunCollapsed(true)}>
        <span className="running-title">{workflow.title}</span>
        <span className="running-header-right">
          <span className="running-progress">
            {doneProjectCount} of {runProjects.length}
          </span>
          <ChevronDown />
        </span>
      </button>

      <div className="run-projects scroll">
        {runProjects.map((project) => (
          <ProjectSection
            key={project.id}
            project={project}
            status={projectStatus(project)}
            progress={projectProgress(project)}
            expanded={isProjectExpanded(project.id)}
            onToggle={() => toggleProject(project.id)}
            runPaused={runPaused}
            onSkip={skipActive}
            onAnswer={(stepId, optionId, custom) =>
              answerQuestion(project.id, stepId, optionId, custom)
            }
          />
        ))}
      </div>

      <div className="running-footer">
        <button className="btn-text btn-text-sm" onClick={editFromRunning}>
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

function ProjectSection({
  project,
  status,
  progress,
  expanded,
  onToggle,
  runPaused,
  onSkip,
  onAnswer
}: {
  project: RunProject
  status: 'queued' | 'active' | 'done'
  progress: number
  expanded: boolean
  onToggle: () => void
  runPaused: boolean
  onSkip: () => void
  onAnswer: (stepId: string, optionId: string, custom?: string) => void
}) {
  return (
    <div className="run-project">
      <button className="project-row" onClick={onToggle}>
        <ProgressRing progress={progress} done={status === 'done'} />
        <span className={`project-name ${status === 'queued' ? 'project-name-queued' : ''}`}>
          {project.name}
        </span>
        <span className={`project-chevron ${expanded ? 'project-chevron-open' : ''}`}>
          <ChevronDown />
        </span>
      </button>
      {expanded && (
        <div className="run-steps">
          {project.steps.map((step) => (
            <RunStepRow
              key={step.id}
              step={step}
              runPaused={runPaused}
              onSkip={onSkip}
              onAnswer={(optionId, custom) => onAnswer(step.id, optionId, custom)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Ring fills by exact fraction as steps complete; full + teal when done.
 * Rings live only at project level — steps keep their glyph rail.
 */
function ProgressRing({ progress, done }: { progress: number; done: boolean }) {
  const r = 4
  const c = 2 * Math.PI * r
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="progress-ring">
      <circle
        cx="6"
        cy="6"
        r={r}
        fill="none"
        stroke={done ? 'rgba(13,148,136,0.9)' : 'rgba(161,161,171,0.45)'}
        strokeWidth="1.5"
      />
      {!done && progress > 0 && (
        <circle
          cx="6"
          cy="6"
          r={r}
          fill="none"
          stroke="rgba(51,25,217,0.75)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${c * progress} ${c}`}
          transform="rotate(-90 6 6)"
        />
      )}
      {done && (
        <path
          d="M4 6.2 5.4 7.6 8.2 4.6"
          fill="none"
          stroke="rgba(13,148,136,0.9)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

function RunStepRow({
  step,
  runPaused,
  onSkip,
  onAnswer
}: {
  step: RunStep
  runPaused: boolean
  onSkip: () => void
  onAnswer: (optionId: string, custom?: string) => void
}) {
  const [otherOpen, setOtherOpen] = useState(false)
  const [otherText, setOtherText] = useState('')

  if (step.status === 'question' && step.question && step.question.answerId === null) {
    return (
      <div className="run-question">
        <div className="run-question-title">{step.label}</div>
        <div className="run-question-prompt">{step.question.prompt}</div>
        <div className="fix-options">
          {step.question.options.map((opt) => {
            if (opt.kind === 'other' && otherOpen) {
              return (
                <input
                  key={opt.id}
                  className="fix-custom-input"
                  autoFocus
                  placeholder="Type a title…"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && otherText.trim())
                      onAnswer(opt.id, otherText.trim())
                  }}
                />
              )
            }
            return (
              <button
                key={opt.id}
                className={`fix-option ${opt.kind === 'suggested' ? 'fix-option-suggested' : ''}`}
                onClick={() => (opt.kind === 'other' ? setOtherOpen(true) : onAnswer(opt.id))}
              >
                {opt.kind === 'suggested' && <SparkIcon />}
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const isActive = step.status === 'active' || step.status === 'question'
  const isPausedRow = isActive && runPaused

  if (isActive) {
    return (
      <div className={`run-step run-step-active ${isPausedRow ? 'run-step-paused' : ''}`}>
        {isPausedRow ? <PauseRail /> : <span className="run-indicator run-indicator-active" />}
        <div className="run-step-body">
          <span className="run-step-label">{step.label}</span>
          {isPausedRow ? (
            <span className="run-step-sub-paused">Paused</span>
          ) : (
            step.activeDetail && <span className="run-step-sub">{step.activeDetail}</span>
          )}
        </div>
        {!isPausedRow && (
          <button className="run-skip" onClick={onSkip}>
            Skip
          </button>
        )}
      </div>
    )
  }

  if (step.status === 'done') {
    return (
      <div className="run-step run-step-done">
        <span className="run-indicator run-indicator-done">
          <CheckGlyph />
        </span>
        <span className="run-step-label">{step.doneLabel}</span>
      </div>
    )
  }

  if (step.status === 'skipped') {
    return (
      <div className="run-step run-step-skipped">
        <span className="run-indicator run-indicator-skipped">
          <SkipGlyph />
        </span>
        <span className="run-step-label run-step-label-faint">{step.label}</span>
        <span className="run-badge">Skipped</span>
      </div>
    )
  }

  return (
    <div className="run-step run-step-pending">
      <span className="run-step-num">{step.index}</span>
      <span className="run-step-label">{step.label}</span>
    </div>
  )
}

function PauseRail() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" className="run-pause-rail">
      <rect x="1" width="2" height="8" rx="1" fill="rgba(179,95,72,0.8)" />
      <rect x="5" width="2" height="8" rx="1" fill="rgba(179,95,72,0.8)" />
    </svg>
  )
}

function CheckGlyph() {
  return (
    <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function SkipGlyph() {
  return (
    <svg width="6" height="6" viewBox="0 0 8 8" fill="currentColor">
      <path d="M0.5 0.8v6.4l4-3.2zM5.8 0.8h1.4v6.4H5.8z" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg width="10" height="9" viewBox="0 0 10 9" fill="currentColor">
      <path d="M5 0l1.1 2.9L9 4 6.1 5.1 5 8 3.9 5.1 1 4l2.9-1.1z" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg width="7" height="4" viewBox="0 0 7 4" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0.5 0.5 3.5 3.5 6.5 0.5" />
    </svg>
  )
}
