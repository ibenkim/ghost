import { useState } from 'react'
import type { WorkflowRecord } from '../state/types'
import TriggerSection from '../components/shared/TriggerSection'
import StepList from '../components/shared/StepList'

/**
 * 1.5 — workflow detail. Reuses the editor's TRIGGER and STEPS components
 * verbatim — one ledger, every surface. Edits apply from the next run.
 */
export default function WorkflowDetail({
  workflow,
  onBack,
  onUpdate
}: {
  workflow: WorkflowRecord
  onBack: () => void
  onUpdate: (updater: (w: WorkflowRecord) => WorkflowRecord) => void
}) {
  const [tab, setTab] = useState<'overview' | 'log'>('overview')

  return (
    <div className="ws-view">
      <div className="ws-header">
        <div className="ws-detail-head">
          <button className="back-btn" onClick={onBack} title="Back">
            <BackChevron />
          </button>
          <div>
            <div className="ws-header-title">{workflow.name}</div>
            <div className="ws-header-sub">
              {workflow.status === 'on' ? 'On' : 'Off'} · {workflow.runs} runs ·{' '}
              {workflow.hoursReturned}
            </div>
          </div>
        </div>
        <button
          className="btn-small-outline"
          onClick={() => window.ghostBridge?.runWorkflow?.(workflow.id)}
        >
          Run
        </button>
      </div>

      <div className="ws-tabs">
        <button
          className={`ws-tab ${tab === 'overview' ? 'ws-tab-active' : ''}`}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          className={`ws-tab ${tab === 'log' ? 'ws-tab-active' : ''}`}
          onClick={() => setTab('log')}
        >
          Log
        </button>
      </div>

      {tab === 'overview' ? (
        <div className="ws-detail-body scroll">
          <TriggerSection
            trigger={{ schedule: workflow.schedule, upcoming: workflow.upcoming }}
            onChange={(t) =>
              onUpdate((w) => ({ ...w, schedule: t.schedule, upcoming: t.upcoming }))
            }
          />
          <div className="ledger-section">
            <div className="section-label">STEPS</div>
            <StepList
              steps={workflow.steps}
              onChange={(updater) => onUpdate((w) => ({ ...w, steps: updater(w.steps) }))}
            />
          </div>
        </div>
      ) : (
        <LogTab />
      )}
    </div>
  )
}

/** Static mock of the drawn Log tab — richer log views are future work. */
function LogTab() {
  return (
    <div className="ws-detail-body scroll">
      <div className="ledger-section">
        <div className="section-label">JULY</div>
        <div className="log-row">
          <span className="log-when">Jul 1 · 9:00 A.M.</span>
          <span className="log-outcome">Done · 6/6 · 1:12</span>
          <span className="log-returned">≈ 38 min returned</span>
        </div>
      </div>
      <div className="ledger-section">
        <div className="section-label">JUNE</div>
        <div className="log-row">
          <span className="log-when">Jun 24 · 9:00 A.M.</span>
          <span className="log-outcome">Done · 6/6 · 1:20 · 1 question</span>
          <span className="log-returned">≈ 36 min returned</span>
        </div>
        <div className="log-row">
          <span className="log-when">Jun 17 · 9:00 A.M.</span>
          <span className="log-outcome">Stopped · 3/6 · 0:44</span>
          <span className="log-returned" />
        </div>
        <div className="log-row">
          <span className="log-when">Jun 10 · 9:00 A.M.</span>
          <span className="log-outcome">Done · 6/6 · 1:09</span>
          <span className="log-returned">≈ 38 min returned</span>
        </div>
      </div>
      <div className="log-footnote">View full history in Activity</div>
    </div>
  )
}

function BackChevron() {
  return (
    <svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M5 1 1 5 5 9" />
    </svg>
  )
}
