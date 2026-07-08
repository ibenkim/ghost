import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useChat } from '../hooks/useChat'

export default function FloatingWidget() {
  const [expanded, setExpanded] = useState(false)
  const [input, setInput] = useState('')
  const { messages, loading, error, send, clear } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Sync window size with expanded state
  useEffect(() => {
    if (expanded) {
      window.ghostBridge.expand()
      setTimeout(() => inputRef.current?.focus(), 120)
    } else {
      window.ghostBridge.collapse()
    }
  }, [expanded])

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function toggle() {
    setExpanded((v) => !v)
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await send(text)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ghost-root">
      {/* ── Expanded chat panel ── */}
      {expanded && (
        <div className="chat-panel">
          <header className="chat-header">
            <span className="chat-title">Ghost</span>
            <div className="chat-header-actions">
              <button className="icon-btn" title="Clear chat" onClick={clear}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
              <button className="icon-btn" title="Close" onClick={toggle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </header>

          <div className="messages">
            {messages.length === 0 && (
              <div className="empty-state">
                <p>Ask me anything…</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`message message-${msg.role}`}>
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message message-assistant">
                <div className="message-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            {error && (
              <div className="message message-error">
                <div className="message-bubble">{error}</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Message Ghost… (Enter to send)"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
              title="Send"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Floating bubble trigger ── */}
      <button className={`bubble ${expanded ? 'bubble-active' : ''}`} onClick={toggle} title="Open Ghost">
        {expanded ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
