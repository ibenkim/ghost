/// <reference types="vite/client" />

declare global {
  interface Window {
    ghostBridge: {
      setBounds: (
        w: number,
        h: number,
        mode: 'pill' | 'glass' | 'panel',
        opts?: { durationMs?: number; pillDrive?: boolean }
      ) => Promise<'above' | 'below'>
      openWorkspace: () => Promise<void>
      closeWindow: () => Promise<void>
      minimizeWindow: () => Promise<void>
      showContextMenu: () => Promise<void>
      dragStart: (
        x: number,
        y: number,
        opts?: { collapseToPill?: boolean }
      ) => Promise<void>
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
