import { useEffect, useRef } from 'react'
import { useWorkflow } from '../state/WorkflowContext'
import GhostPill from './GhostPill'
import RecordPanel from './panels/RecordPanel'
import LearningPanel from './panels/LearningPanel'
import EditorPanel from './panels/EditorPanel'
import RunningPanel from './panels/RunningPanel'
import SummaryPanel from './panels/SummaryPanel'

export default function GhostShell() {
  const {
    state,
    watchExpanded,
    editorCollapsed,
    runCollapsed,
    closeHover,
    panelPlacement,
    hoverFading,
    reportHoverPanelHeight
  } = useWorkflow()

  // The hover window uses native vibrancy, so it must hug its content
  // exactly — measure the panel and report its height for window sizing.
  const hoverPanelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (state !== 'hover' || !hoverPanelRef.current) return
    const el = hoverPanelRef.current
    reportHoverPanelHeight(el.offsetHeight)
    const observer = new ResizeObserver(() => reportHoverPanelHeight(el.offsetHeight))
    observer.observe(el)
    return () => observer.disconnect()
  }, [state, reportHoverPanelHeight])

  /**
   * Hover-panel dismissal rules:
   * 1. A click outside the panel + pill dismisses it (window blur — clicking
   *    inside focuses us, so a later outside click always blurs).
   * 2. Moving the cursor away dismisses it only while the user has NOT yet
   *    clicked the pill or the panel; once they interact, only rule 1 applies.
   * The interaction flag resets every time the panel disappears.
   */
  const interactedRef = useRef(false)
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (state !== 'hover') interactedRef.current = false
  }, [state])

  // Rule 1: click outside the UI → dismiss.
  useEffect(() => {
    if (state !== 'hover') return
    function onBlur() {
      closeHover()
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [state, closeHover])

  function handleRootMouseDown() {
    if (state === 'hover') interactedRef.current = true
  }

  // Rule 2: cursor leaves without prior interaction → dismiss after grace.
  function handleMouseLeave() {
    if (state !== 'hover' || hoverFading || interactedRef.current) return
    graceTimer.current = setTimeout(closeHover, 220)
  }

  function handleMouseEnter() {
    if (graceTimer.current) {
      clearTimeout(graceTimer.current)
      graceTimer.current = null
    }
  }

  // Esc dismisses the hover panel.
  useEffect(() => {
    if (state !== 'hover') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeHover()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, closeHover])

  const expandedPanel =
    (state === 'recording' && watchExpanded) ||
    (state === 'editor' && !editorCollapsed) ||
    (state === 'running' && !runCollapsed) ||
    state === 'summary'

  // Pill mode: the window is sized exactly to the pill (native blur/shadow).
  const pillMode = !expandedPanel && state !== 'hover'

  const rootClass = [
    'ghost-root',
    pillMode ? 'ghost-root-pill' : '',
    state === 'hover' ? 'ghost-root-glass' : '',
    !pillMode && panelPlacement === 'below' ? 'ghost-root-below' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={rootClass}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseDownCapture={handleRootMouseDown}
    >
      <div className="panel-slot">
        {state === 'hover' && (
          <div ref={hoverPanelRef} className={hoverFading ? 'panel-fading' : undefined}>
            <RecordPanel />
          </div>
        )}
        {state === 'recording' && watchExpanded && <LearningPanel />}
        {state === 'editor' && !editorCollapsed && <EditorPanel />}
        {state === 'running' && !runCollapsed && <RunningPanel />}
        {state === 'summary' && <SummaryPanel />}
      </div>
      {!expandedPanel && <GhostPill />}
    </div>
  )
}
