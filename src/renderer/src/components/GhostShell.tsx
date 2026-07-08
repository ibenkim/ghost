import { useWorkflow } from '../state/WorkflowContext'
import GhostBubble from './GhostBubble'
import RecordPanel from './panels/RecordPanel'
import WatchingPanel from './panels/WatchingPanel'
import OrganizingChip from './panels/OrganizingChip'
import EditorPanel from './panels/EditorPanel'
import RunningPanel from './panels/RunningPanel'
import SummaryPanel from './panels/SummaryPanel'

export default function GhostShell() {
  const { state, watchExpanded } = useWorkflow()

  // Whether the current state shows the bubble in the corner.
  const showBubble =
    state === 'idle' ||
    state === 'hover' ||
    state === 'recording' ||
    state === 'organizing'

  return (
    <div className="ghost-root">
      <div className="panel-slot">
        {state === 'hover' && <RecordPanel />}
        {state === 'recording' && watchExpanded && <WatchingPanel />}
        {state === 'organizing' && <OrganizingChip />}
        {state === 'editor' && <EditorPanel />}
        {state === 'running' && <RunningPanel />}
        {state === 'summary' && <SummaryPanel />}
      </div>
      {showBubble && <GhostBubble />}
    </div>
  )
}
