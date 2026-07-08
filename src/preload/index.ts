import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }
export type AiResult = { ok: true; content: string } | { ok: false; error: string }

const ghostBridge = {
  /** Resize the window to the expanded chat panel */
  expand: () => ipcRenderer.invoke('window:expand'),
  /** Resize the window back to the compact bubble */
  collapse: () => ipcRenderer.invoke('window:collapse'),
  /** Send a conversation to the AI and get a response */
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
