import { useState } from 'react'
import { useWorkflow } from '../state/WorkflowContext'

export default function GhostBubble() {
  const {
    state,
    openHover,
    closeHover,
    elapsedLabel,
    watchExpanded,
    setWatchExpanded,
    stopRecording
  } = useWorkflow()
  const [hovered, setHovered] = useState(false)

  const isRecording = state === 'recording' || state === 'organizing'

  function handleClick() {
    if (state === 'idle') {
      openHover()
    } else if (state === 'hover') {
      closeHover()
    } else if (state === 'recording') {
      setWatchExpanded(!watchExpanded)
    }
  }

  return (
    <div
      className="bubble-wrap"
      onMouseEnter={() => {
        setHovered(true)
        if (state === 'idle') openHover()
      }}
      onMouseLeave={() => setHovered(false)}
    >
      {isRecording && hovered && state === 'recording' && (
        <button className="side-chip" onClick={stopRecording}>
          Stop Recording
        </button>
      )}

      <button
        className={`bubble ${state === 'recording' ? 'recording' : state === 'idle' ? 'idle' : ''}`}
        onClick={handleClick}
        title="Ghost"
      >
        {state === 'recording' || state === 'organizing' ? (
          <span className="rec-dot" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        {state === 'recording' && <span className="bubble-timer">{elapsedLabel}</span>}
      </button>
    </div>
  )
}
