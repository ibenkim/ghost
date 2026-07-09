import { useState } from 'react'
import { useWorkflow } from '../state/WorkflowContext'
import { MOCK_APPS } from '../state/mockData'

/**
 * The mascot. Its press action changes with state:
 *  idle → open the record panel · hover → start recording ·
 *  recording → stop recording · running-collapsed → pause/resume.
 */
export default function GhostBubble() {
  const {
    state,
    openHover,
    startRecording,
    stopRecording,
    elapsedLabel,
    recordPaused,
    toggleRecordPause,
    recordMode,
    selectedAppId,
    watchExpanded,
    setWatchExpanded,
    stepFlash,
    runCollapsed,
    setRunCollapsed,
    runPaused,
    togglePause,
    doneProjectCount,
    runProjects,
    currentStepLabel
  } = useWorkflow()
  const [hovered, setHovered] = useState(false)

  const watchTarget =
    recordMode === 'full-screen'
      ? 'screen'
      : MOCK_APPS.find((a) => a.id === selectedAppId)?.name ?? 'screen'

  function handlePress() {
    if (state === 'idle') openHover()
    else if (state === 'hover') startRecording()
    else if (state === 'recording') stopRecording()
    else if (state === 'running' && runCollapsed) togglePause()
  }

  const pressable =
    state === 'idle' ||
    state === 'hover' ||
    state === 'recording' ||
    (state === 'running' && runCollapsed)

  const showStopLabel = state === 'recording' && hovered
  const showWatchPill =
    state === 'recording' && !watchExpanded && (hovered || stepFlash)
  const showRunPill = state === 'running' && runCollapsed

  return (
    <div
      className="bubble-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bubble-chips">
        {showWatchPill && (
          <button className="side-pill slide-in" onClick={() => setWatchExpanded(true)}>
            Watching {watchTarget}..
            <ChevronIcon />
          </button>
        )}
        {showRunPill && (
          <button
            className="side-pill slide-in"
            onClick={() => setRunCollapsed(false)}
            title="Expand"
          >
            {runPaused ? 'Paused · ' : ''}
            {doneProjectCount} of {runProjects.length} · {currentStepLabel || 'Finishing up'}
          </button>
        )}
        {showStopLabel && <span className="side-label slide-in">Stop recording</span>}
      </div>

      <div className="bubble-stack">
        <button
          className={`bubble ${state === 'recording' ? 'recording' : ''} ${
            state === 'idle' ? 'idle' : ''
          } ${state === 'hover' ? 'ready' : ''} ${!pressable ? 'bubble-inert' : ''}`}
          onClick={handlePress}
          title="Ghost"
        >
          <GhostFace />
        </button>

        {state === 'recording' && (
          <>
            <button
              className="pause-chip"
              onClick={(e) => {
                e.stopPropagation()
                toggleRecordPause()
              }}
              title={recordPaused ? 'Resume recording' : 'Pause recording'}
            >
              {recordPaused ? <PlayGlyph /> : <PauseGlyph />}
            </button>
            <span className={`timer-pill ${recordPaused ? 'timer-paused' : ''}`}>
              {elapsedLabel}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function GhostFace() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 10a7 7 0 0 1 14 0v9.2c0 .82-.97 1.25-1.58.7l-1.16-1.03a1 1 0 0 0-1.36.03l-1.13 1.1a1 1 0 0 1-1.4 0l-1.09-1.07a1 1 0 0 0-1.4 0l-1.09 1.07a1 1 0 0 1-1.4 0l-1.13-1.1a1 1 0 0 0-1.36-.03L6.58 19.9C5.97 20.45 5 20.02 5 19.2Z" />
      <circle cx="9.6" cy="10.4" r="1.25" fill="rgba(255,255,255,0.92)" />
      <circle cx="14.4" cy="10.4" r="1.25" fill="rgba(255,255,255,0.92)" />
    </svg>
  )
}

function PauseGlyph() {
  return (
    <svg width="7" height="8" viewBox="0 0 7 8" fill="currentColor">
      <rect x="0.5" width="2" height="8" rx="1" />
      <rect x="4.5" width="2" height="8" rx="1" />
    </svg>
  )
}

function PlayGlyph() {
  return (
    <svg width="7" height="8" viewBox="0 0 7 8" fill="currentColor">
      <path d="M0.5 0.7c0-.55.6-.9 1.07-.62l5.1 3.3a.72.72 0 0 1 0 1.24l-5.1 3.3A.72.72 0 0 1 .5 7.3Z" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="7" height="4" viewBox="0 0 7 4" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0.5 0.5 3.5 3.5 6.5 0.5" />
    </svg>
  )
}
