import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  PillPosition,
  RecordSettings,
  Run,
  StoreSnapshot,
  Suggestion,
  Workflow
} from '../shared/types'

type ActivityHoldPayload = {
  runId: string
  workflowId: string
  name: string
  needsYou: 'answer' | 'help'
  heldStepIndex: number
  waitingSince: string
  stopReason?: string
}

const ghostBridge = {
  /** Resize the pill window; returns the panel placement ('above' | 'below'). */
  setBounds: (
    w: number,
    h: number,
    mode: 'pill' | 'glass' | 'panel',
    opts?: { durationMs?: number; pillDrive?: boolean }
  ) =>
    ipcRenderer.invoke('window:setBounds', {
      w,
      h,
      mode,
      durationMs: opts?.durationMs,
      pillDrive: opts?.pillDrive
    }),
  /** Open (or focus) the workspace window; optional deep-link to a workflow. */
  openWorkspace: (focusWorkflowId?: string) =>
    ipcRenderer.invoke('workspace:open', focusWorkflowId),
  /** Close the calling window. */
  closeWindow: () => ipcRenderer.invoke('window:close'),
  /** Minimize the calling window. */
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  /** Show the native right-click context menu for the pill. */
  showContextMenu: () => ipcRenderer.invoke('pill:contextMenu'),
  /** Keep main's context-menu variant in sync with AppState. */
  setPillAppState: (state: string) => ipcRenderer.invoke('pill:setAppState', state),
  /** Ink-20 fullscreen dim behind the expanded editor. */
  setEditorScrim: (visible: boolean) => ipcRenderer.invoke('editor:setScrim', visible),
  /** Begin dragging; collapseToPill=false keeps the glass panel open while dragging. */
  dragStart: (x: number, y: number, opts?: { collapseToPill?: boolean }) =>
    ipcRenderer.invoke('pill:dragStart', { x, y, collapseToPill: opts?.collapseToPill }),
  dragEnd: () => ipcRenderer.invoke('pill:dragEnd'),
  /** Workspace → pill: run a workflow now (looked up by id in the shared store). */
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
  },
  /** Workspace: deep-link to a workflow detail (Phase 3 consumes). */
  onFocusWorkflow: (cb: (workflowId: string) => void) => {
    const listener = (_e: unknown, id: string) => cb(id)
    ipcRenderer.on('workspace:focusWorkflow', listener)
    return () => ipcRenderer.removeListener('workspace:focusWorkflow', listener)
  },

  // ── Shared data store ──
  getSnapshot: (): Promise<StoreSnapshot> => ipcRenderer.invoke('store:getSnapshot'),
  getWorkflow: (id: string): Promise<Workflow | null> =>
    ipcRenderer.invoke('store:getWorkflow', id),
  upsertWorkflow: (workflow: Workflow): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:upsertWorkflow', workflow),
  saveRun: (run: Run): Promise<StoreSnapshot> => ipcRenderer.invoke('store:saveRun', run),
  upsertActivityHold: (payload: ActivityHoldPayload): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:upsertActivityHold', payload),
  clearActivityHold: (runId: string): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:clearActivityHold', runId),
  setSuggestion: (suggestion: Suggestion | null): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:setSuggestion', suggestion),
  discardSuggestion: (id: string): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:discardSuggestion', id),
  setRecordSettings: (settings: RecordSettings): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:setRecordSettings', settings),
  setPillPosition: (position: PillPosition | null): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:setPillPosition', position),
  setOnboardingComplete: (complete: boolean): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:setOnboardingComplete', complete),
  skipActivity: (entryId: string): Promise<StoreSnapshot> =>
    ipcRenderer.invoke('store:skipActivity', entryId),
  onStoreChanged: (cb: (snapshot: StoreSnapshot) => void) => {
    const listener = (_e: unknown, snapshot: StoreSnapshot) => cb(snapshot)
    ipcRenderer.on('store:changed', listener)
    return () => ipcRenderer.removeListener('store:changed', listener)
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
