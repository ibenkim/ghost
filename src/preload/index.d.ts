import { ElectronAPI } from '@electron-toolkit/preload'
import type { ChatMessage, AiResult } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    ghostBridge: {
      setBounds: (w: number, h: number) => Promise<void>
      chat: (messages: ChatMessage[]) => Promise<AiResult>
    }
  }
}
