import { useWorkflow } from '../../state/WorkflowContext'
import { MOCK_APPS } from '../../state/mockData'
import SegmentedControl from '../ui/SegmentedControl'
import Toggle from '../ui/Toggle'
import MicIcon from '../ui/MicIcon'
import type { RecordMode } from '../../state/types'

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

  return (
    <div className="card record-panel">
      <div className="record-header">Record a workflow</div>

      <SegmentedControl<RecordMode>
        value={recordMode}
        onChange={setRecordMode}
        segments={[
          { value: 'one-app', label: 'One app' },
          { value: 'full-screen', label: 'Full screen' }
        ]}
      />

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

      <button className="btn btn-primary record-start" onClick={startRecording}>
        Start recording
      </button>
    </div>
  )
}
