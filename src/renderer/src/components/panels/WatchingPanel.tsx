import { useWorkflow } from '../../state/WorkflowContext'
import { MOCK_APPS } from '../../state/mockData'
import MicIcon from '../ui/MicIcon'

export default function WatchingPanel() {
  const { selectedAppId, watchLog, setWatchExpanded, cancelRecording } = useWorkflow()
  const app = MOCK_APPS.find((a) => a.id === selectedAppId)

  return (
    <div className="card watching-panel">
      <div className="watching-header">
        <span>Watching {app?.name ?? 'screen'}</span>
        <button className="btn-text" onClick={() => setWatchExpanded(false)}>
          v
        </button>
      </div>

      <div className="watch-log scroll">
        {watchLog.map((entry, i) => (
          <div className="watch-entry" key={`${entry.time}-${i}`}>
            <div className="watch-entry-main">
              <span className="watch-time">{entry.time}</span>
              <span className="watch-text">{entry.text}</span>
            </div>
            {entry.voiceNote && (
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
        <span className="watch-cancel-x">✕</span>
        Cancel
      </button>
    </div>
  )
}
