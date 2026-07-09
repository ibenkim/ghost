import { useRef, useState } from 'react'
import { useWorkflow } from '../../state/WorkflowContext'
import MicIcon from '../ui/MicIcon'
import type { EditorStep } from '../../state/types'

function renumber(steps: EditorStep[]): EditorStep[] {
  return steps.map((s, i) => ({ ...s, index: i + 1 }))
}

/** Renders a transcript with operator words (Only / Skip / Never) bolded. */
function Transcript({ text }: { text: string }) {
  const parts = text.split(/\b(Only|Skip|Never)\b/)
  return (
    <>
      {parts.map((part, i) =>
        ['Only', 'Skip', 'Never'].includes(part) ? <strong key={i}>{part}</strong> : part
      )}
    </>
  )
}

export default function EditorPanel() {
  const { workflow, setWorkflow, saveWorkflow, runWorkflow, recordAgain } = useWorkflow()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftText, setDraftText] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [addingStep, setAddingStep] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [customFixId, setCustomFixId] = useState<string | null>(null)
  const [customFixText, setCustomFixText] = useState('')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  /** Commit an edit: "Forming new step…" → brief resolved flash → normal. */
  function runFormingPipeline(id: string) {
    setPhase(id, 'forming')
    timers.current.push(
      setTimeout(() => {
        setPhase(id, 'resolved')
        timers.current.push(setTimeout(() => setPhase(id, 'normal'), 900))
      }, 1100)
    )
  }

  function setPhase(id: string, phase: EditorStep['phase']) {
    setWorkflow((w) => ({
      ...w,
      steps: w.steps.map((s) => (s.id === id ? { ...s, phase } : s))
    }))
  }

  // ── Title editing ──
  function commitTitle() {
    if (titleDraft.trim()) setWorkflow((w) => ({ ...w, title: titleDraft.trim() }))
    setEditingTitle(false)
  }

  // ── Step editing ──
  function beginEdit(step: EditorStep) {
    setEditingId(step.id)
    setDraftText(step.title)
  }

  function commitEdit(step: EditorStep) {
    setEditingId(null)
    const text = draftText.trim()
    if (!text) {
      // An empty new step is discarded; an emptied existing step keeps its old text.
      if (addingStepIds.current.has(step.id)) deleteStep(step.id)
      return
    }
    if (text !== step.title) {
      setWorkflow((w) => ({
        ...w,
        steps: w.steps.map((s) => (s.id === step.id ? { ...s, title: text } : s))
      }))
      runFormingPipeline(step.id)
    }
    addingStepIds.current.delete(step.id)
  }

  function cancelEdit(step: EditorStep) {
    setEditingId(null)
    if (addingStepIds.current.has(step.id)) deleteStep(step.id)
  }

  function deleteStep(id: string) {
    addingStepIds.current.delete(id)
    setWorkflow((w) => ({ ...w, steps: renumber(w.steps.filter((s) => s.id !== id)) }))
  }

  // ── Add a step ──
  const addingStepIds = useRef(new Set<string>())
  function addStep() {
    if (addingStep) return
    setAddingStep(true)
    const id = `s${Date.now()}`
    addingStepIds.current.add(id)
    setWorkflow((w) => ({
      ...w,
      steps: renumber([...w.steps, { id, index: w.steps.length + 1, title: '' }])
    }))
    setEditingId(id)
    setDraftText('')
    setAddingStep(false)
  }

  // ── Fix-step chips ──
  function resolveFix(step: EditorStep, optionId: string, customValue?: string) {
    const option = step.fix?.options.find((o) => o.id === optionId)
    if (!option) return
    const note =
      optionId === 'ask-each-time'
        ? 'Will ask during each run'
        : customValue
          ? `Will use “${customValue}”`
          : `Will use ${option.label}`
    setWorkflow((w) => ({
      ...w,
      steps: w.steps.map((s) =>
        s.id === step.id
          ? {
              ...s,
              fix: undefined,
              fixNote: note,
              phase: 'resolved' as const
            }
          : s
      )
    }))
    setCustomFixId(null)
    setCustomFixText('')
    timers.current.push(setTimeout(() => setPhase(step.id, 'normal'), 1200))
  }

  return (
    <div className="card editor-panel">
      <div>
        <div className="eyebrow">Here's what I learned</div>
        <div className="editor-title-row">
          {editingTitle ? (
            <input
              className="editor-title-input"
              autoFocus
              value={titleDraft}
              size={Math.max(titleDraft.length, 4)}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle()
                if (e.key === 'Escape') setEditingTitle(false)
              }}
            />
          ) : (
            <button
              className="editor-title"
              onClick={() => {
                setTitleDraft(workflow.title)
                setEditingTitle(true)
              }}
            >
              {workflow.title}
            </button>
          )}
          <span
            className="editor-edit-icon"
            onClick={() => {
              setTitleDraft(workflow.title)
              setEditingTitle(true)
            }}
          >
            <PencilIcon />
          </span>
        </div>
        <div className="meta">{workflow.metaLabel}</div>
      </div>

      <div className="editor-steps scroll">
        {workflow.steps.map((step) => {
          if (step.fix) {
            return (
              <FixCard
                key={step.id}
                step={step}
                customOpen={customFixId === step.id}
                customText={customFixText}
                onCustomOpen={() => setCustomFixId(step.id)}
                onCustomChange={setCustomFixText}
                onCustomCommit={() => {
                  if (customFixText.trim())
                    resolveFix(step, 'something-else', customFixText.trim())
                }}
                onPick={(optionId) => resolveFix(step, optionId)}
              />
            )
          }

          const isHovered = hoveredId === step.id
          const isEditing = editingId === step.id
          const isForming = step.phase === 'forming'
          const isResolved = step.phase === 'resolved'

          return (
            <div key={step.id}>
              <div
                className={`step ${isHovered && !isForming ? 'step-selected' : ''} ${
                  isResolved ? 'step-flash' : ''
                }`}
                onMouseEnter={() => setHoveredId(step.id)}
                onMouseLeave={() => setHoveredId(null)}
                onDoubleClick={() => !isForming && beginEdit(step)}
              >
                <span className="step-num">{step.index}</span>
                {isEditing ? (
                  <input
                    className="step-edit-input"
                    autoFocus
                    placeholder="Describe the step in plain language"
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    onBlur={() => commitEdit(step)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(step)
                      if (e.key === 'Escape') cancelEdit(step)
                    }}
                  />
                ) : isForming ? (
                  <span className="step-title step-forming">Forming new step…</span>
                ) : (
                  <span className="step-title">{step.title}</span>
                )}
                {isResolved && !isEditing && (
                  <span className="step-check">
                    <CheckIcon />
                  </span>
                )}
                {isHovered && !isEditing && !isForming && (
                  <span className="step-actions">
                    <button title="Edit" onClick={() => beginEdit(step)}>
                      <PencilIcon />
                    </button>
                    <button title="Delete" onClick={() => deleteStep(step.id)}>
                      <TrashIcon />
                    </button>
                  </span>
                )}
              </div>
              {step.voiceNote && !isEditing && (
                <div className="step-voice-note">
                  <MicIcon size={8} />
                  <span className="step-voice-note-text">
                    <Transcript text={step.voiceNote.text} />
                  </span>
                </div>
              )}
              {step.fixNote && !isEditing && (
                <div className="step-voice-note">
                  <span className="step-fix-note">{step.fixNote}</span>
                </div>
              )}
            </div>
          )
        })}
        <button className="add-step" onClick={addStep}>
          + Add a step
        </button>
      </div>

      <div className="panel-divider" />
      <div className="panel-footer">
        {confirmDiscard ? (
          <div className="discard-confirm">
            <span>Discard these {workflow.steps.length} steps?</span>
            <button className="btn-danger-text" onClick={recordAgain}>
              Discard
            </button>
            <button className="btn-text" onClick={() => setConfirmDiscard(false)}>
              Keep
            </button>
          </div>
        ) : (
          <>
            <button className="btn-text" onClick={() => setConfirmDiscard(true)}>
              Record again
            </button>
            <div className="footer-actions">
              <button className="btn btn-outline" onClick={runWorkflow}>
                Run
              </button>
              <button className="btn btn-primary" onClick={saveWorkflow}>
                Save Workflow
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function FixCard({
  step,
  customOpen,
  customText,
  onCustomOpen,
  onCustomChange,
  onCustomCommit,
  onPick
}: {
  step: EditorStep
  customOpen: boolean
  customText: string
  onCustomOpen: () => void
  onCustomChange: (v: string) => void
  onCustomCommit: () => void
  onPick: (optionId: string) => void
}) {
  const fix = step.fix!
  return (
    <div className="fix-step-row">
      <span className="step-num fix-num">{step.index}</span>
      <div className="fix-step">
        <div className="fix-step-title">{step.title}</div>
        <div className="fix-step-prompt">{fix.prompt}</div>
        <div className="fix-options">
          {fix.options.map((opt) => {
            const preselected = fix.selectedOptionId === opt.id
            if (opt.kind === 'other' && customOpen) {
              return (
                <input
                  key={opt.id}
                  className="fix-custom-input"
                  autoFocus
                  placeholder="Type a title…"
                  value={customText}
                  onChange={(e) => onCustomChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onCustomCommit()}
                />
              )
            }
            return (
              <button
                key={opt.id}
                className={`fix-option ${
                  preselected
                    ? 'fix-option-selected'
                    : opt.kind === 'suggested'
                      ? 'fix-option-suggested'
                      : ''
                }`}
                onClick={() => (opt.kind === 'other' ? onCustomOpen() : onPick(opt.id))}
              >
                {opt.kind === 'suggested' && <SparkIcon />}
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SparkIcon() {
  return (
    <svg width="10" height="9" viewBox="0 0 10 9" fill="currentColor">
      <path d="M5 0l1.1 2.9L9 4 6.1 5.1 5 8 3.9 5.1 1 4l2.9-1.1z" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
