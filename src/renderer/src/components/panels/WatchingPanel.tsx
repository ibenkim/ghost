import { useEffect, useRef, useState } from 'react'
import { useWorkflow } from '../../state/WorkflowContext'
import { MOCK_APPS } from '../../state/mockData'
import MicIcon from '../ui/MicIcon'

/** Expanded recording ledger: live step lines + voice tags + Thinking…. */
export default function WatchingPanel() {
  const { recordMode, selectedAppId, watchLog, setWatchExpanded, cancelRecording } =
    useWorkflow()
  const [openVoiceIdx, setOpenVoiceIdx] = useState<number | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  const watchTarget =
    recordMode === 'full-screen'
      ? 'screen'
      : MOCK_APPS.find((a) => a.id === selectedAppId)?.name ?? 'screen'

  // New steps append without stealing focus, but keep the latest in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [watchLog.length])

  return (
    <div className="card watching-panel">
      <div className="watching-header">
        <span>Watching {watchTarget}..</span>
        <button
          className="chevron-btn"
          onClick={() => setWatchExpanded(false)}
          title="Collapse"
        >
          <ChevronUp />
        </button>
      </div>

      <div className="watch-log scroll" ref={logRef}>
        {watchLog.map((entry, i) => (
          <div className="watch-entry" key={`${entry.time}-${i}`}>
            <div className="watch-entry-main">
              <span className="watch-time">{entry.time}</span>
              <span className="watch-text">{entry.text}</span>
              {entry.voiceNote && (
                <button
                  className={`voice-tag ${openVoiceIdx === i ? 'voice-tag-open' : ''}`}
                  onClick={() => setOpenVoiceIdx(openVoiceIdx === i ? null : i)}
                >
                  <MicIcon size={7} />
                  voice
                </button>
              )}
            </div>
            {entry.voiceNote && openVoiceIdx === i && (
              <div className="watch-voice">
                <MicIcon size={7} />
                <span className="watch-voice-text">{entry.voiceNote}</span>
              </div>
            )}
          </div>
        ))}
        <div className="watch-entry">
          <div className="watch-entry-main">
            <span className="watch-time">Now</span>
            <span className="watch-text watch-text-thinking">Thinking...</span>
          </div>
        </div>
      </div>

      <button className="watch-cancel btn-danger-text" onClick={cancelRecording}>
        <XGlyph />
        Cancel
      </button>
    </div>
  )
}

function ChevronUp() {
  return (
    <svg width="7" height="4" viewBox="0 0 7 4" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0.5 3.5 3.5 0.5 6.5 3.5" />
    </svg>
  )
}

function XGlyph() {
  return (
    <svg width="6" height="6" viewBox="0 0 6 6" stroke="currentColor" strokeWidth="1.2">
      <path d="M0.7 0.7 5.3 5.3 M5.3 0.7 0.7 5.3" />
    </svg>
  )
}
