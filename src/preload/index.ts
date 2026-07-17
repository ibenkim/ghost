import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const ghostBridge = {
  /** Resize the pill window; returns the panel placement ('above' | 'below'). */
  setBounds: (w: number, h: number, mode: 'pill' | 'panel') =>
    ipcRenderer.invoke('window:setBounds', { w, h, mode }),
  /** Open (or focus) the workspace window. */
  openWorkspace: () => ipcRenderer.invoke('workspace:open'),
  /** Close the calling window. */
  closeWindow: () => ipcRenderer.invoke('window:close'),
  /** Minimize the calling window. */
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  /** Show the native right-click context menu for the pill. */
  showContextMenu: () => ipcRenderer.invoke('pill:contextMenu'),
  /** Begin dragging the pill window; offset is the cursor position inside it. */
  dragStart: (x: number, y: number) => ipcRenderer.invoke('pill:dragStart', { x, y }),
  dragEnd: () => ipcRenderer.invoke('pill:dragEnd'),
  /** Workspace → pill: run a workflow now. */
  runWorkflow: (workflowId: string) => ipcRenderer.invoke('pill:runWorkflow', workflowId),
  /** Workspace → pill: open the record panel. */
  openRecordPanel: () => ipcRenderer.invoke('pill:openRecordPanel'),
  /** Workspace → pill: open the editor pre-filled (Suggested "Set it up for me"). */
  openEditor: () => ipcRenderer.invoke('pill:openEditor'),
  /** Pill-side subscriptions for commands sent from the workspace / hotkey. */
  onRunWorkflow: (cb: (workflowId: string) => void) => {
    const listener = (_e: unknown, id: string) => cb(id)
    ipcRenderer.on('pill:runWorkflow', listener)
    return () => ipcRenderer.removeListener('pill:runWorkflow', listener)
  },
  onOpenRecordPanel: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('pill:openRecordPanel', listener)
    return () => ipcRenderer.removeListener('pill:openRecordPanel', listener)
  },
  onOpenEditor: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('pill:openEditor', listener)
    return () => ipcRenderer.removeListener('pill:openEditor', listener)
  }
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
