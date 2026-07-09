import { useEffect, useRef } from 'react'
import { useWorkflow } from '../state/WorkflowContext'
import GhostBubble from './GhostBubble'
import RecordPanel from './panels/RecordPanel'
import WatchingPanel from './panels/WatchingPanel'
import EditorPanel from './panels/EditorPanel'
import RunningPanel from './panels/RunningPanel'
import SummaryPanel from './panels/SummaryPanel'

export default function GhostShell() {
  const {
    state,
    watchExpanded,
    runCollapsed,
    closeHover,
    organizingPhase,
    toast
  } = useWorkflow()

  // Moving the cursor off the mascot + panel dismisses the hover panel
  // after a short grace period (the gap between them can be crossed).
  const graceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMouseLeave() {
    if (state !== 'hover') return
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

  return (
    <div className="ghost-root" onMouseLeave={handleMouseLeave} onMouseEnter={handleMouseEnter}>
      <div className="panel-slot">
        {state === 'hover' && <RecordPanel />}
        {state === 'recording' && watchExpanded && <WatchingPanel />}
        {state === 'organizing' && (
          <div className="status-pill">
            <span className="spinner" />
            {organizingPhase === 'organizing' ? 'Organizing steps…' : 'Opening editor'}
          </div>
        )}
        {state === 'editor' && <EditorPanel />}
        {state === 'running' && !runCollapsed && <RunningPanel />}
        {state === 'summary' && <SummaryPanel />}
        {state === 'idle' && toast && <div className="status-pill toast-pill">{toast}</div>}
      </div>
      <GhostBubble />
    </div>
  )
}
