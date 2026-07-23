import { useEffect, useRef, useState } from 'react'
import type { StepApp } from '../../state/types'
import { PencilIcon } from './TriggerSection'

/** Apps offered when prompting to fill / change a chip. */
export const KNOWN_APPS: StepApp[] = [
  { id: 'figma', name: 'Figma' },
  { id: 'chrome', name: 'Chrome' },
  { id: 'slack', name: 'Slack' }
]

/** True when the step text is an "Open … in ___" style slot (app is separate). */
export function isAppSlotLabel(text: string): boolean {
  return /\bin(\s+___)?\s*$/i.test(text.trim())
}

/** Normalize a slot-style title to end with ` in ___`. */
export function withAppSlotBlank(text: string): string {
  const base = text
    .replace(/\s*___+\s*$/i, '')
    .replace(/\s+in\s*$/i, '')
    .trim()
  return `${base} in ___`
}

type AppChipProps = {
  app: StepApp
  muted?: boolean
  /** Hover edit / delete — used on summary + StepList. */
  editable?: boolean
  onChangeApp?: (app: StepApp) => void
  onRemoveApp?: () => void
}

/** Inline app chip: icon + name, e.g. [logo] Figma. */
export default function AppChip({
  app,
  muted = false,
  editable = false,
  onChangeApp,
  onRemoveApp
}: AppChipProps) {
  const [hovered, setHovered] = useState(false)
  const [picking, setPicking] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!picking) return
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setPicking(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPicking(false)
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [picking])

  return (
    <span
      ref={rootRef}
      className={`app-chip ${muted ? 'app-chip-muted' : ''} ${editable ? 'app-chip-editable' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <AppGlyph id={app.id} />
      {app.name}
      {editable && hovered && !picking && (
        <span className="app-chip-actions">
          <button
            type="button"
            title="Change app"
            onClick={(e) => {
              e.stopPropagation()
              setPicking(true)
            }}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            title="Remove app"
            onClick={(e) => {
              e.stopPropagation()
              onRemoveApp?.()
            }}
          >
            <TrashTiny />
          </button>
        </span>
      )}
      {picking && (
        <AppPicker
          currentId={app.id}
          onPick={(next) => {
            onChangeApp?.(next)
            setPicking(false)
          }}
        />
      )}
    </span>
  )
}

/**
 * Placeholder chip when a slot step has no app yet ("Open … in ___").
 * Click opens the same app picker.
 */
export function AppChipBlank({
  muted = false,
  onPick
}: {
  muted?: boolean
  onPick: (app: StepApp) => void
}) {
  const [picking, setPicking] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!picking) return
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setPicking(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPicking(false)
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [picking])

  return (
    <span
      ref={rootRef}
      className={`app-chip app-chip-blank ${muted ? 'app-chip-muted' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        setPicking(true)
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      ___
      {picking && (
        <AppPicker
          onPick={(next) => {
            onPick(next)
            setPicking(false)
          }}
        />
      )}
    </span>
  )
}

function AppPicker({
  currentId,
  onPick
}: {
  currentId?: StepApp['id']
  onPick: (app: StepApp) => void
}) {
  return (
    <span className="app-chip-picker">
      {KNOWN_APPS.map((a) => (
        <button
          key={a.id}
          type="button"
          className={`app-chip-pick ${currentId === a.id ? 'app-chip-pick-active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onPick(a)
          }}
        >
          <AppGlyph id={a.id} />
          {a.name}
        </button>
      ))}
    </span>
  )
}

function TrashTiny() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  )
}

function AppGlyph({ id }: { id: StepApp['id'] }) {
  if (id === 'figma') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12">
        <rect width="12" height="12" rx="3" fill="#1e1e1e" />
        <path d="M4.9 2.5h1.1v2.2H4.9a1.1 1.1 0 1 1 0-2.2z" fill="#f24e1e" />
        <path d="M6 2.5h1.1a1.1 1.1 0 1 1 0 2.2H6z" fill="#ff7262" />
        <path d="M4.9 4.9h1.1v2.2H4.9a1.1 1.1 0 1 1 0-2.2z" fill="#a259ff" />
        <circle cx="7.1" cy="6" r="1.1" fill="#1abcfe" />
        <path d="M4.9 7.3h1.1v1.1a1.1 1.1 0 1 1-1.1-1.1z" fill="#0acf83" />
      </svg>
    )
  }
  if (id === 'slack') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12">
        <rect width="12" height="12" rx="3" fill="#fff" />
        <rect x="2.4" y="6.6" width="4.4" height="1.6" rx="0.8" fill="#e01e5a" />
        <rect x="6.6" y="5.2" width="1.6" height="4.4" rx="0.8" fill="#2eb67d" />
        <rect x="5.2" y="2.4" width="4.4" height="1.6" rx="0.8" fill="#36c5f0" transform="rotate(90 7.4 3.2)" />
        <rect x="3.2" y="3.8" width="4.4" height="1.6" rx="0.8" fill="#ecb22e" />
      </svg>
    )
  }
  if (id === 'chrome') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12">
        <circle cx="6" cy="6" r="5.5" fill="#fff" />
        <circle cx="6" cy="6" r="5.2" fill="#4285f4" />
        <circle cx="6" cy="6" r="2.2" fill="#fff" />
        <circle cx="6" cy="6" r="1.7" fill="#4285f4" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12">
      <rect width="12" height="12" rx="3" fill="#e4e5e6" />
    </svg>
  )
}
