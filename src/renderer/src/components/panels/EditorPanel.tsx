import { useEffect, useState } from 'react'
import { useWorkflow } from '../../state/WorkflowContext'
import TriggerSection, { PencilIcon } from '../shared/TriggerSection'
import StepList from '../shared/StepList'
import { ChevronDown } from '../GhostPill'

/**
 * 05 — editor, 660×521 white panel. Header · TRIGGER · STEPS · footer
 * (Cancel with confirm · Run · Save Workflow). Esc collapses to the
 * "Editing" pill — Cancel is the only destructive exit.
 */
export default function EditorPanel() {
  const {
    workflow,
    setWorkflow,
    saveWorkflow,
    runWorkflow,
    cancelEditor,
    setEditorCollapsed
  } = useWorkflow()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  // Esc → collapse (not discard).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      setEditorCollapsed(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setEditorCollapsed])

  function commitTitle() {
    if (titleDraft.trim()) setWorkflow((w) => ({ ...w, title: titleDraft.trim() }))
    setEditingTitle(false)
  }

  function beginTitleEdit() {
    setTitleDraft(workflow.title)
    setEditingTitle(true)
  }

  return (
    <div className="editor-panel">
      <button
        className="chevron-btn editor-collapse"
        onClick={() => setEditorCollapsed(true)}
        title="Collapse"
      >
        <ChevronDown />
      </button>

      <div className="editor-head">
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
            <button className="editor-title" onClick={beginTitleEdit}>
              {workflow.title}
            </button>
          )}
          <span className="editor-edit-icon" onClick={beginTitleEdit}>
            <PencilIcon />
          </span>
        </div>
        <div className="meta">{workflow.metaLabel}</div>
      </div>

      <div className="editor-body scroll">
        <TriggerSection
          trigger={workflow.trigger}
          onChange={(t) => setWorkflow((w) => ({ ...w, trigger: t }))}
        />

        <div className="ledger-section">
          <div className="section-label">STEPS</div>
          <StepList
            steps={workflow.steps}
            onChange={(updater) => setWorkflow((w) => ({ ...w, steps: updater(w.steps) }))}
          />
        </div>
      </div>

      <div className="panel-divider" />
      <div className="panel-footer">
        {confirmDiscard ? (
          <div className="discard-confirm">
            <span>Discard these {workflow.steps.length} steps?</span>
            <button className="cancel-link discard-yes" onClick={cancelEditor}>
              Discard
            </button>
            <button className="btn-text" onClick={() => setConfirmDiscard(false)}>
              Keep
            </button>
          </div>
        ) : (
          <>
            <button className="cancel-link" onClick={() => setConfirmDiscard(true)}>
              <XGlyph />
              Cancel
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

function XGlyph() {
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" stroke="currentColor" strokeWidth="1.2">
      <path d="M0.8 0.8 6.2 6.2 M6.2 0.8 0.8 6.2" />
    </svg>
  )
}
