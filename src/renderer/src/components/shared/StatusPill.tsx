import type { ReactNode } from 'react'

export type StatusPillTone = 'default' | 'amber' | 'rose' | 'teal' | 'apricot'

type StatusPillProps = {
  /** Leading status copy (e.g. "Hello", "Learning...", "Workflow saved ·"). */
  label: ReactNode
  tone?: StatusPillTone
  /** Optional trailing action (saved → "Open in Library"). */
  actionLabel?: string
  onAction?: () => void
  /** Show the leading status dot (saved / hold tones). */
  showDot?: boolean
  className?: string
  children?: ReactNode
  onClick?: () => void
  onMouseDown?: (e: React.MouseEvent) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

/**
 * Formalized pill status surface — Hello / Learning / Thinking / running /
 * paused / saved. Tone props carry amber/rose/teal/apricot coloring.
 */
export default function StatusPill({
  label,
  tone = 'default',
  actionLabel,
  onAction,
  showDot,
  className = '',
  children,
  onClick,
  onMouseDown,
  onContextMenu
}: StatusPillProps) {
  const toneClass =
    tone === 'amber'
      ? 'pill-amber'
      : tone === 'rose'
        ? 'pill-rose'
        : tone === 'teal'
          ? 'pill-teal'
          : tone === 'apricot'
            ? 'pill-apricot'
            : ''

  return (
    <div
      className={`pill ${tone === 'teal' || tone === 'default' ? 'pill-glass glass-stroke glass-stroke-pill' : 'pill-active'} ${toneClass} ${className}`}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
    >
      {showDot && <span className={`status-dot status-dot-${tone}`} />}
      <span className={`pill-text ${tone === 'default' || tone === 'teal' ? 'pill-text-light' : ''}`}>
        {label}
      </span>
      {actionLabel && (
        <button
          className="pill-action"
          onClick={(e) => {
            e.stopPropagation()
            onAction?.()
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  )
}
