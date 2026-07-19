import { useEffect, useRef, useState } from 'react'
import type { Space, WorkspaceNav } from './WorkspaceApp'

/** Sidebar: traffic lights, team-menu (workspace switcher), nav items. */
export default function Sidebar({
  nav,
  onNav,
  space,
  onSpace
}: {
  nav: WorkspaceNav
  onNav: (n: WorkspaceNav) => void
  space: Space
  onSpace: (s: Space) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Press anywhere outside to dismiss the team menu.
  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  return (
    <aside className="ws-sidebar">
      <div className="traffic-lights">
        <button
          className="light light-close"
          onClick={() => window.ghostBridge?.closeWindow?.()}
          title="Close"
        />
        <button
          className="light light-min"
          onClick={() => window.ghostBridge?.minimizeWindow?.()}
          title="Minimize"
        />
        <span className="light light-zoom" />
      </div>

      <div className="team-menu-wrap" ref={menuRef}>
        <button className="team-menu-btn" onClick={() => setMenuOpen((o) => !o)}>
          <span className="team-avatar" />
          <span className="team-name">{space}</span>
          <ChevronTiny />
        </button>
        {menuOpen && (
          <div className="team-menu">
            {(['Personal', "Harry's team"] as Space[]).map((s) => (
              <button
                key={s}
                className={`team-menu-item ${space === s ? 'team-menu-item-active' : ''}`}
                onClick={() => {
                  onSpace(s)
                  setMenuOpen(false)
                }}
              >
                {s}
              </button>
            ))}
            <div className="team-menu-divider" />
            <button className="team-menu-item team-menu-item-dim">Join a team</button>
            <button className="team-menu-item team-menu-item-dim">Settings</button>
            <button
              className="team-menu-item"
              onClick={() => {
                setMenuOpen(false)
                void window.ghostBridge?.logout?.()
              }}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      <nav className="ws-nav">
        <button
          className={`ws-nav-item ${nav === 'workflows' ? 'ws-nav-active' : ''}`}
          onClick={() => onNav('workflows')}
        >
          Workflows
        </button>
        <button
          className={`ws-nav-item ${nav === 'activity' ? 'ws-nav-active' : ''}`}
          onClick={() => onNav('activity')}
        >
          Activity
        </button>
      </nav>
    </aside>
  )
}

function ChevronTiny() {
  return (
    <svg width="7" height="4" viewBox="0 0 7 4" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0.5 0.5 3.5 3.5 6.5 0.5" />
    </svg>
  )
}
