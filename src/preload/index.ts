import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }
export type AiResult = { ok: true; content: string } | { ok: false; error: string }

const ghostBridge = {
  /** Resize the floating window for the current UI state (stays bottom-right). */
  setBounds: (w: number, h: number) => ipcRenderer.invoke('window:setBounds', { w, h }),
  /** Deferred: send a conversation to the AI and get a response. */
  chat: (messages: ChatMessage[]): Promise<AiResult> => ipcRenderer.invoke('ai:chat', messages)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('ghostBridge', ghostBridge)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (non-isolated fallback for dev)
  window.electron = electronAPI
  // @ts-ignore
  window.ghostBridge = ghostBridge
}
