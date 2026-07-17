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
    hoverDismissMode,
    hoverPinned,
    pinHover,
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
   * 1. A click outside the panel + pill dismisses it (window blur).
   * 2. Cursor-leave dismisses only if the user has NOT clicked the panel or
   *    dragged the UI this open. Pin resets every time hover opens again.
   */
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Drag/click pin cancels a pending cursor-leave close.
  useEffect(() => {
    if (!hoverPinned || !graceTimer.current) return
    clearTimeout(graceTimer.current)
    graceTimer.current = null
  }, [hoverPinned])

  // Rule 1: click outside the UI → dismiss.
  useEffect(() => {
    if (state !== 'hover') return
    function onBlur() {
      closeHover()
    }
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [state, closeHover])

  function handleRootMouseDown(e: React.MouseEvent) {
    if (state !== 'hover') return
    // Pill click toggles close — only panel clicks pin via click.
    if ((e.target as HTMLElement).closest('.pill')) return
    pinHover()
  }

  // Rule 2: cursor leaves without pin (click/drag) → dismiss after grace.
  function handleMouseLeave() {
    if (state !== 'hover' || hoverFading || hoverPinned) return
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
    state === 'hover' && hoverFading ? 'ghost-root-closing' : '',
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
          <div
            ref={hoverPanelRef}
            className={[
              'morph-panel',
              hoverFading
                ? hoverDismissMode === 'drag'
                  ? 'morph-panel-drag'
                  : 'morph-panel-out'
                : 'morph-panel-in'
            ].join(' ')}
          >
            <RecordPanel />
          </div>
        )}
        {state === 'recording' && watchExpanded && (
          <div className="morph-panel morph-panel-in">
            <LearningPanel />
          </div>
        )}
        {state === 'editor' && !editorCollapsed && (
          <div className="morph-panel morph-panel-in">
            <EditorPanel />
          </div>
        )}
        {state === 'running' && !runCollapsed && (
          <div className="morph-panel morph-panel-in">
            <RunningPanel />
          </div>
        )}
        {state === 'summary' && (
          <div className="morph-panel morph-panel-in">
            <SummaryPanel />
          </div>
        )}
      </div>
      {!expandedPanel && <GhostPill />}
    </div>
  )
}
