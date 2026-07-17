import { useWorkflow } from '../../state/WorkflowContext'
import { MOCK_APPS } from '../../state/mockData'
import MicIcon from '../ui/MicIcon'
import Toggle from '../ui/Toggle'
import type { RecordMode } from '../../state/types'

/** 02 — "Record a workflow" glass panel; Start Recording lives here. */
export default function RecordPanel() {
  const {
    recordMode,
    setRecordMode,
    selectedAppId,
    setSelectedAppId,
    narrate,
    setNarrate,
    startRecording
  } = useWorkflow()

  const modes: { value: RecordMode; label: string }[] = [
    { value: 'one-app', label: 'One app' },
    { value: 'full-screen', label: 'Full screen' }
  ]

  return (
    <div className="glass-card record-panel glass-stroke glass-stroke-panel">
        <div className="record-header">Record a workflow</div>

        <div className="segmented">
          {modes.map((m) => (
            <button
              key={m.value}
              className={`segment ${recordMode === m.value ? 'segment-active' : ''}`}
              onClick={() => setRecordMode(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {recordMode === 'one-app' ? (
          <div className="app-list">
            {MOCK_APPS.map((app) => {
              const selected = app.id === selectedAppId
              return (
                <button
                  key={app.id}
                  className={`app-row ${selected ? 'app-row-selected' : ''}`}
                  onClick={() => setSelectedAppId(app.id)}
                >
                  <span className="app-icon" />
                  <span className="app-name">{app.name}</span>
                  <span className="app-detail">{app.detail}</span>
                  <span className={`radio ${selected ? 'radio-on' : ''}`} />
                </button>
              )
            })}
          </div>
        ) : (
          <div className="desktop-preview">
            <div className="desktop-preview-inner">
              <span className="desktop-taskbar" />
              <span className="desktop-folder" />
              <span className="desktop-folder" />
              <span className="desktop-folder" />
            </div>
          </div>
        )}

        <div className="narrate-row">
          <div className="narrate-label">
            <MicIcon size={11} />
            <span>Narrate while recording</span>
          </div>
          <Toggle checked={narrate} onChange={setNarrate} />
        </div>

      <button className="start-recording-btn" onClick={startRecording}>
        Start Recording
      </button>
      <div className="record-hint">Press ⌥G to record</div>
    </div>
  )
}
