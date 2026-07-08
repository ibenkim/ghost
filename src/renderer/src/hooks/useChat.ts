import { useState, useCallback } from 'react'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are Ghost — a concise, helpful AI assistant embedded in a desktop widget. 
Keep answers focused and brief unless the user asks for detail.`

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const send = useCallback(async (userText: string) => {
    if (!userText.trim()) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userText.trim()
    }

    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    setError(null)

    const history = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userMsg.content }
    ]

    try {
      const result = await window.ghostBridge.chat(history)
      if (result.ok) {
        const assistantMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: result.content
        }
        setMessages((prev) => [...prev, assistantMsg])
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [messages])

  const clear = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, loading, error, send, clear }
}
