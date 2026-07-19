import { useState } from 'react'
import type { FixOption } from '../../state/types'

export type RunCardChip = {
  id: string
  label: string
  kind?: FixOption['kind']
}

type RunCardProps = {
  variant: 'question' | 'error'
  /** Step context line, e.g. "4 · Title the new section" or "Needs an answer". */
  title: string
  /** Colored prompt / failure copy. */
  message: string
  chips: RunCardChip[]
  footer: string
  onSelect: (chipId: string, custom?: string) => void
  otherPlaceholder?: string
}

/**
 * Shared mid-run hold card — amber question (6.3) and rose error (6.4).
 * Chip grammar matches fix-step 5.4.
 */
export default function RunCard({
  variant,
  title,
  message,
  chips,
  footer,
  onSelect,
  otherPlaceholder = 'Type a title…'
}: RunCardProps) {
  const [otherOpen, setOtherOpen] = useState(false)
  const [otherText, setOtherText] = useState('')

  return (
    <div className={`run-card run-card-${variant}`}>
      <div className="run-card-title">{title}</div>
      <div className="run-card-message">{message}</div>
      <div className="fix-options">
        {chips.map((chip) => {
          if (chip.kind === 'other' && otherOpen) {
            return (
              <input
                key={chip.id}
                className="fix-custom-input"
                autoFocus
                placeholder={otherPlaceholder}
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otherText.trim()) {
                    onSelect(chip.id, otherText.trim())
                  }
                }}
              />
            )
          }
          return (
            <button
              key={chip.id}
              className={`fix-option ${chip.kind === 'suggested' ? 'fix-option-suggested' : ''}`}
              onClick={() =>
                chip.kind === 'other' ? setOtherOpen(true) : onSelect(chip.id)
              }
            >
              {chip.kind === 'suggested' && <SparkIcon />}
              {chip.label}
            </button>
          )
        })}
      </div>
      <div className="run-card-footer">{footer}</div>
    </div>
  )
}

function SparkIcon() {
  return (
    <svg width="10" height="9" viewBox="0 0 10 9" fill="currentColor">
      <path d="M5 0l1.1 2.9L9 4 6.1 5.1 5 8 3.9 5.1 1 4l2.9-1.1z" />
    </svg>
  )
}
