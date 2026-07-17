import { useState } from 'react'
import type { Trigger } from '../../state/types'

const SCHEDULE_PRESETS: { schedule: string; upcoming: string }[] = [
  { schedule: '1st of each month at 9:00 A.M.', upcoming: 'August 1, 2026' },
  { schedule: 'Every week on Thursday at 4:30 P.M.', upcoming: 'July 23, 2026' },
  { schedule: 'Every weekday at 9:00 A.M.', upcoming: 'July 17, 2026' }
]

/**
 * TRIGGER section — schedule row + "Upcoming" preview; click opens a schedule
 * picker and the preview recomputes on change. Manual-only workflows show a
 * quiet "No schedule" row; Run always works regardless.
 */
export default function TriggerSection({
  trigger,
  onChange
}: {
  trigger: Trigger
  onChange: (t: Trigger) => void
}) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div className="ledger-section">
      <div className="section-label">TRIGGER</div>
      <button className="trigger-row" onClick={() => setPickerOpen((o) => !o)}>
        {trigger.schedule ? (
          <span className="trigger-text">
            {trigger.schedule}
            <span className="trigger-upcoming">   ·   Upcoming: {trigger.upcoming}</span>
          </span>
        ) : (
          <span className="trigger-text trigger-none">No schedule — runs manually</span>
        )}
        <PencilIcon />
      </button>
      {pickerOpen && (
        <div className="trigger-picker">
          {SCHEDULE_PRESETS.map((p) => (
            <button
              key={p.schedule}
              className={`trigger-option ${trigger.schedule === p.schedule ? 'trigger-option-active' : ''}`}
              onClick={() => {
                onChange({ schedule: p.schedule, upcoming: p.upcoming })
                setPickerOpen(false)
              }}
            >
              {p.schedule}
            </button>
          ))}
          <button
            className={`trigger-option ${!trigger.schedule ? 'trigger-option-active' : ''}`}
            onClick={() => {
              onChange({})
              setPickerOpen(false)
            }}
          >
            Manual only
          </button>
        </div>
      )}
    </div>
  )
}

export function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  )
}
