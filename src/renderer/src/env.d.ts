/// <reference types="vite/client" />

type GhostChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }
type GhostAiResult = { ok: true; content: string } | { ok: false; error: string }

declare global {
  interface Window {
    ghostBridge: {
      setBounds: (w: number, h: number) => Promise<void>
      chat: (messages: GhostChatMessage[]) => Promise<GhostAiResult>
    }
  }
}

export {}
