/// <reference types="vite/client" />

declare global {
  interface Window {
    ghostBridge: {
      setBounds: (w: number, h: number, mode: 'pill' | 'panel') => Promise<'above' | 'below'>
      openWorkspace: () => Promise<void>
      closeWindow: () => Promise<void>
      minimizeWindow: () => Promise<void>
      showContextMenu: () => Promise<void>
      dragStart: (x: number, y: number) => Promise<void>
      dragEnd: () => Promise<void>
      runWorkflow: (workflowId: string) => Promise<void>
      openRecordPanel: () => Promise<void>
      openEditor: () => Promise<void>
      onRunWorkflow: (cb: (workflowId: string) => void) => () => void
      onOpenRecordPanel: (cb: () => void) => () => void
      onOpenEditor: (cb: () => void) => () => void
    }
  }
}

export {}
