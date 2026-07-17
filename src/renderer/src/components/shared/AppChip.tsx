import type { StepApp } from '../../state/types'

/** Inline app chip: icon + name, e.g. [logo] Figma. */
export default function AppChip({ app, muted = false }: { app: StepApp; muted?: boolean }) {
  return (
    <span className={`app-chip ${muted ? 'app-chip-muted' : ''}`}>
      <AppGlyph id={app.id} />
      {app.name}
    </span>
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
