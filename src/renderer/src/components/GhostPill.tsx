import { useEffect, useRef, useState } from 'react'
import { useWorkflow } from '../state/WorkflowContext'

/**
 * The pill IS the character — a horizontal glass pill whose content changes
 * with state. Rendered only in collapsed states; expanded panels replace it.
 */
export default function GhostPill() {
  const {
    state,
    toast,
    openHover,
    closeHover,
    beginDrag,
    endDrag,
    elapsedLabel,
    recordPaused,
    toggleRecordPause,
    setWatchExpanded,
    workflow,
    setEditorCollapsed,
    runSteps,
    runDoneCount,
    runPaused,
    toggleRunPause,
    runElapsedLabel,
    setRunCollapsed,
    hasQuestionHold
  } = useWorkflow()
  const [hovered, setHovered] = useState(false)
  const dragging = useRef(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Hovering the idle pill opens the record panel after a short dwell —
  // never while a drag is in progress (hover and drag are exclusive).
  useEffect(() => {
    if (hovered && state === 'idle' && !dragging.current) {
      hoverTimer.current = setTimeout(() => openHover(), 250)
      return () => {
        if (hoverTimer.current) clearTimeout(hoverTimer.current)
        hoverTimer.current = null
      }
    }
    return undefined
  }, [hovered, state, openHover])

  // A press only becomes a drag after the cursor moves past a small
  // threshold — a plain click on the pill is not a drag (and must not
  // dismiss the hover panel; it counts as interacting with it).
  const pressStart = useRef<{ x: number; y: number } | null>(null)

  function handleMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return
    // Cancel any pending hover-open; the press decides what happens next.
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
    pressStart.current = { x: e.clientX, y: e.clientY }
  }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!pressStart.current || dragging.current) return
      const dx = e.clientX - pressStart.current.x
      const dy = e.clientY - pressStart.current.y
      if (dx * dx + dy * dy < 16) return
      dragging.current = true
      beginDrag()
      window.ghostBridge?.dragStart?.(e.clientX, e.clientY)
    }
    function onUp() {
      pressStart.current = null
      if (!dragging.current) return
      dragging.current = false
      endDrag()
      window.ghostBridge?.dragEnd?.()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [beginDrag, endDrag])

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    // The context menu dismisses the hover panel first.
    if (state === 'hover') closeHover()
    window.ghostBridge?.showContextMenu?.()
  }

  const sharedProps = {
    onMouseDown: handleMouseDown,
    onContextMenu: handleContextMenu,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }

  // ── Recording collapsed: [pause] · "Learning..." · 1:05 · chevron ──
  if (state === 'recording') {
    return (
      <div className="pill pill-active" {...sharedProps}>
        <PauseButton paused={recordPaused} onToggle={toggleRecordPause} />
        <button className="pill-body" onClick={() => setWatchExpanded(true)}>
          <span className="pill-text">{recordPaused ? 'Paused' : 'Learning...'}</span>
          <span className="pill-time">{elapsedLabel}</span>
          <ChevronUp />
        </button>
      </div>
    )
  }

  // ── Organizing: "Thinking..." ──
  if (state === 'organizing') {
    return (
      <div className="pill pill-glass" {...sharedProps}>
        <span className="pill-text pill-text-light pill-blink">Thinking...</span>
      </div>
    )
  }

  // ── Editor collapsed: "Editing" · chevron ──
  if (state === 'editor') {
    return (
      <div className="pill pill-active" {...sharedProps}>
        <button className="pill-body" onClick={() => setEditorCollapsed(false)}>
          <span className="pill-text">Editing</span>
          <ChevronUp />
        </button>
      </div>
    )
  }

  // ── Running collapsed: [pause] · "name · 3/6" · 1:05 · chevron ──
  if (state === 'running') {
    return (
      <div className={`pill pill-active ${hasQuestionHold ? 'pill-apricot' : ''}`} {...sharedProps}>
        <PauseButton paused={runPaused} onToggle={toggleRunPause} />
        <button className="pill-body" onClick={() => setRunCollapsed(false)}>
          <span className="pill-text">
            {workflow.title} <span className="pill-dim">· {runDoneCount}/{runSteps.length}</span>
          </span>
          <span className="pill-time">{runElapsedLabel}</span>
          <ChevronUp />
        </button>
      </div>
    )
  }

  // ── Idle / hover: "Hello" (logo/mark placeholder) or saved toast ──
  return (
    <div className={`pill pill-glass ${state === 'hover' ? 'pill-ready' : ''}`} {...sharedProps}>
      <span className="pill-text pill-text-light">{toast ?? 'Hello'}</span>
    </div>
  )
}

/** Purple circle with pause bars; toggles to play when paused. */
export function PauseButton({
  paused,
  onToggle
}: {
  paused: boolean
  onToggle: () => void
}) {
  return (
    <button
      className="pause-btn"
      title={paused ? 'Resume' : 'Pause'}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {paused ? (
        <svg width="7" height="8" viewBox="0 0 7 8" fill="currentColor">
          <path d="M0.5 0.7c0-.55.6-.9 1.07-.62l5.1 3.3a.72.72 0 0 1 0 1.24l-5.1 3.3A.72.72 0 0 1 .5 7.3Z" />
        </svg>
      ) : (
        <svg width="7" height="8" viewBox="0 0 7 8" fill="currentColor">
          <rect x="0.5" width="2" height="8" rx="1" />
          <rect x="4.5" width="2" height="8" rx="1" />
        </svg>
      )}
    </button>
  )
}

export function ChevronUp() {
  return (
    <svg width="9" height="5" viewBox="0 0 9 5" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0.5 4.5 4.5 0.5 8.5 4.5" />
    </svg>
  )
}

export function ChevronDown() {
  return (
    <svg width="9" height="5" viewBox="0 0 9 5" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0.5 0.5 4.5 4.5 8.5 0.5" />
    </svg>
  )
}
