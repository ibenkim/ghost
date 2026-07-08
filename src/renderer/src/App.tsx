import { WorkflowProvider } from './state/WorkflowContext'
import GhostShell from './components/GhostShell'

export default function App() {
  return (
    <WorkflowProvider>
      <GhostShell />
    </WorkflowProvider>
  )
}
