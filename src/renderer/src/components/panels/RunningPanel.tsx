import { useState } from 'react'
import { useWorkflow } from '../../state/WorkflowContext'
import type { RunStep } from '../../state/types'
import AppChip from '../shared/AppChip'
import { PauseButton, ChevronDown } from '../GhostPill'

/**
 * 6.2 — running expanded: flat single-workflow ledger mirroring the editor.
 * Pause lives only in the header icon; footer is Stop · Edit.
 */
export default function RunningPanel() {
  const {
    workflow,
    runSteps,
    runDoneCount,
    runPaused,
    toggleRunPause,
    runElapsedLabel,
    setRunCollapsed,
    skipStep,
    answerQuestion,
    stopRunning,
    editFromRunning
  } = useWorkflow()

  return (
    <div className="running-panel">
      <div className="ledger-header">
        <PauseButton paused={runPaused} onToggle={toggleRunPause} />
        <span className="ledger-title">
          {workflow.title} <span className="pill-dim">· {runDoneCount}/{runSteps.length}</span>
        </span>
        <span className="ledger-time">{runElapsedLabel}</span>
        <button className="chevron-btn" onClick={() => setRunCollapsed(true)} title="Collapse">
          <ChevronDown />
        </button>
      </div>

      <div className="run-steps scroll">
        {runSteps.map((step) => (
          <RunStepRow
            key={step.id}
            step={step}
            runPaused={runPaused}
            onSkip={() => skipStep(step.id)}
            onAnswer={(optionId, custom) => answerQuestion(step.id, optionId, custom)}
          />
        ))}
      </div>

      <div className="ledger-footer">
        <button className="cancel-link" onClick={stopRunning}>
          Stop
        </button>
        <button className="btn-small-outline" onClick={editFromRunning}>
          Edit
        </button>
      </div>
    </div>
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
  const [hovered, setHovered] = useState(false)
  const [otherOpen, setOtherOpen] = useState(false)
  const [otherText, setOtherText] = useState('')

  // Amber question card — run holds here until answered.
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
                    if (e.key === 'Enter' && otherText.trim()) onAnswer(opt.id, otherText.trim())
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

  const isCurrent = step.status === 'active'
  const isDone = step.status === 'done'
  const isSkipped = step.status === 'skipped'
  const notDone = !isDone && !isSkipped
  const showSkip = notDone && hovered

  return (
    <div
      className={`run-step ${isCurrent ? 'run-step-current' : ''} ${
        isCurrent && runPaused ? 'run-step-paused' : ''
      } ${isDone || isSkipped ? 'run-step-past' : ''} ${
        showSkip && !isCurrent ? 'run-step-hover' : ''
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="step-num">{step.index}</span>
      <div className="run-step-body">
        <span className={`run-step-label ${isCurrent ? 'run-step-label-current' : ''}`}>
          {isDone ? step.doneLabel : step.label}
          {step.app && <AppChip app={step.app} muted={isDone || isSkipped} />}
        </span>
        {isCurrent && runPaused && <span className="run-step-sub-paused">Paused</span>}
        {isDone && step.voiceNote && (
          <span className="run-voice-quote">{stripQuotes(step.voiceNote.text)}</span>
        )}
      </div>
      {isDone && <CheckMark />}
      {isSkipped && <span className="run-skipped-mark">Skipped</span>}
      {showSkip && (
        <button className="run-skip" onClick={onSkip}>
          Skip
        </button>
      )}
    </div>
  )
}

function stripQuotes(text: string): string {
  return text.replace(/[“”"]/g, '').replace(/^\.{3}|^…/, '')
}

function CheckMark() {
  return (
    <svg
      className="run-check"
      width="11"
      height="8"
      viewBox="0 0 11 8"
      fill="none"
      stroke="rgba(51,25,217,0.7)"
      strokeWidth="1.4"
    >
      <path d="M1 4 4 7 10 1" />
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
