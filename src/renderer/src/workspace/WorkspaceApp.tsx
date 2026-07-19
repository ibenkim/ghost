import { useEffect, useState } from 'react'
import { MOCK_ACTIVITY, MOCK_SUGGESTION, MOCK_WORKFLOW_RECORDS } from '../state/mockData'
import type { ActivityEntry, Workflow } from '../state/types'
import Sidebar from './Sidebar'
import WorkflowsHome from './WorkflowsHome'
import WorkflowDetail from './WorkflowDetail'
import ActivityView from './ActivityView'

export type WorkspaceNav = 'workflows' | 'activity'

export type Space = 'Personal' | "Harry's team"

/**
 * The employee-side workspace window: sidebar (Workflows / Activity +
 * team-menu) and content views. 807×549, white, r20.
 *
 * Phase 0 keeps local mock state; Phase 3's first task wires this to the
 * shared main-process store.
 */
export default function WorkspaceApp() {
  const [nav, setNav] = useState<WorkspaceNav>('workflows')
  const [space, setSpace] = useState<Space>('Personal')
  const [detailId, setDetailId] = useState<string | null>(null)

  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOW_RECORDS)
  const [suggestion, setSuggestion] = useState(MOCK_SUGGESTION as typeof MOCK_SUGGESTION | null)
  const [activity, setActivity] = useState<ActivityEntry[]>(MOCK_ACTIVITY)

  // Deep-link from the teal "Open in Library" saved pill (Phase 2).
  useEffect(() => {
    return window.ghostBridge?.onFocusWorkflow?.((workflowId) => {
      setNav('workflows')
      setSpace('Personal')
      setDetailId(workflowId)
      // If the workflow was just saved and isn't in the local mock list yet,
      // pull it from the shared store so the detail view can open.
      window.ghostBridge?.getWorkflow?.(workflowId).then((wf) => {
        if (!wf) return
        setWorkflows((ws) => {
          if (ws.some((w) => w.id === wf.id)) {
            return ws.map((w) => (w.id === wf.id ? wf : w))
          }
          return [wf, ...ws]
        })
      })
    })
  }, [])

  // Selecting a space filters the whole workspace; the mock keeps personal
  // data in "Personal" and shows an empty team space.
  const spaceWorkflows = space === 'Personal' ? workflows : []
  const spaceActivity = space === 'Personal' ? activity : []

  const detail = detailId ? workflows.find((w) => w.id === detailId) ?? null : null

  function updateWorkflow(id: string, updater: (w: Workflow) => Workflow) {
    setWorkflows((ws) => ws.map((w) => (w.id === id ? updater(w) : w)))
  }

  function skipOccurrence(entryId: string) {
    setActivity((a) => a.map((e) => (e.id === entryId ? { ...e, skipped: true } : e)))
  }

  return (
    <div className="workspace-window">
      <Sidebar
        nav={nav}
        onNav={(n) => {
          setNav(n)
          setDetailId(null)
        }}
        space={space}
        onSpace={setSpace}
      />
      <div className="workspace-content">
        {detail ? (
          <WorkflowDetail
            workflow={detail}
            onBack={() => setDetailId(null)}
            onUpdate={(updater) => updateWorkflow(detail.id, updater)}
          />
        ) : nav === 'workflows' ? (
          <WorkflowsHome
            workflows={spaceWorkflows}
            suggestion={space === 'Personal' ? suggestion : null}
            onOpen={(id) => setDetailId(id)}
            onToggleStatus={(id) =>
              updateWorkflow(id, (w) => ({ ...w, status: w.status === 'on' ? 'off' : 'on' }))
            }
            onDiscardSuggestion={() => setSuggestion(null)}
          />
        ) : (
          <ActivityView
            entries={spaceActivity}
            onOpenWorkflow={(id) => {
              setNav('workflows')
              setDetailId(id)
            }}
            onSkip={skipOccurrence}
          />
        )}
      </div>
    </div>
  )
}
