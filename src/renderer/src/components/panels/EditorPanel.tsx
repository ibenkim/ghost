import { useState } from 'react'
import { useWorkflow } from '../../state/WorkflowContext'
import MicIcon from '../ui/MicIcon'
import type { EditorStep } from '../../state/types'

function renumber(steps: EditorStep[]): EditorStep[] {
  return steps.map((s, i) => ({ ...s, index: i + 1 }))
}

export default function EditorPanel() {
  const { workflow, setWorkflow, saveWorkflow, runWorkflow, startRecording } = useWorkflow()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  function updateTitle(title: string) {
    setWorkflow({ ...workflow, title })
  }

  function updateStepTitle(id: string, title: string) {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map((s) => (s.id === id ? { ...s, title } : s))
    })
  }

  function deleteStep(id: string) {
    setWorkflow({
      ...workflow,
      steps: renumber(workflow.steps.filter((s) => s.id !== id))
    })
    setSelectedId(null)
  }

  function addStep() {
    const id = `s${Date.now()}`
    const next = renumber([
      ...workflow.steps,
      { id, index: workflow.steps.length + 1, title: 'New step' }
    ])
    setWorkflow({ ...workflow, steps: next })
    setSelectedId(id)
    setEditingId(id)
  }

  function selectFixOption(stepId: string, optionId: string) {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map((s) =>
        s.id === stepId && s.fix
          ? { ...s, fix: { ...s.fix, selectedOptionId: optionId } }
          : s
      )
    })
  }

  return (
    <div className="card editor-panel">
      <div>
        <div className="eyebrow">Here's what I learned</div>
        <div className="editor-title-row">
          <input
            className="editor-title-input"
            value={workflow.title}
            size={workflow.title.length || 1}
            onChange={(e) => updateTitle(e.target.value)}
          />
          <span className="editor-edit-icon">
            <PencilIcon />
          </span>
        </div>
        <div className="meta">{workflow.durationLabel}</div>
      </div>

      <div className="editor-steps scroll">
        {workflow.steps.map((step) => {
          if (step.fix) {
            return (
              <div className="fix-step" key={step.id}>
                <div className="fix-step-title">
                  <span className="step-num">{step.index}</span> {step.title}
                </div>
                <div className="fix-step-prompt">{step.fix.prompt}</div>
                <div className="fix-options">
                  {step.fix.options.map((opt) => {
                    const selected = step.fix!.selectedOptionId === opt.id
                    return (
                      <button
                        key={opt.id}
                        className={`fix-option ${
                          selected
                            ? 'fix-option-selected'
                            : opt.kind === 'suggested'
                              ? 'fix-option-suggested'
                              : ''
                        }`}
                        onClick={() => selectFixOption(step.id, opt.id)}
                      >
                        {opt.kind === 'suggested' && <span>✦</span>}
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          }

          const isSelected = selectedId === step.id
          const isEditing = editingId === step.id
          return (
            <div key={step.id}>
              <div
                className={`step ${isSelected ? 'step-selected' : ''}`}
                onMouseEnter={() => setSelectedId(step.id)}
                onMouseLeave={() => !isEditing && setSelectedId(null)}
              >
                <span className="step-num">{step.index}</span>
                {isEditing ? (
                  <input
                    className="editor-title-input step-title"
                    style={{ fontSize: 11, fontWeight: 400 }}
                    autoFocus
                    value={step.title}
                    onChange={(e) => updateStepTitle(step.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                  />
                ) : (
                  <span className="step-title">{step.title}</span>
                )}
                {step.resolved && !isSelected && (
                  <span className="step-check">
                    <CheckIcon />
                  </span>
                )}
                {isSelected && (
                  <span className="step-actions">
                    <button title="Edit" onClick={() => setEditingId(step.id)}>
                      <PencilIcon />
                    </button>
                    <button title="Delete" onClick={() => deleteStep(step.id)}>
                      <TrashIcon />
                    </button>
                  </span>
                )}
              </div>
              {step.voiceNote && (
                <div className="step-voice-note">
                  <MicIcon size={8} />
                  <span className="step-voice-note-text">{step.voiceNote.text}</span>
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
        <button className="btn-text" onClick={startRecording}>
          Record again
        </button>
        <div className="footer-actions">
          <button className="btn btn-outline" onClick={runWorkflow}>
            Run it
          </button>
          <button className="btn btn-primary" onClick={saveWorkflow}>
            Save Workflow
          </button>
        </div>
      </div>
    </div>
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
