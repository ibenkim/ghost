import { app, shell, BrowserWindow, ipcMain, screen, Menu, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {
  getSnapshot,
  getWorkflow,
  loadStore,
  registerStoreIpc,
  setPillPosition
} from './store'
import { createTray, destroyTray } from './tray'

let pillWindow: BrowserWindow | null = null
let workspaceWindow: BrowserWindow | null = null
// Native-blur backdrops. Vibrancy always fills a whole window, so one window
// behind the pill and one behind the panel give real background blur on each
// glass shape while the gap between them stays fully transparent.
let pillBackdrop: BrowserWindow | null = null
let panelBackdrop: BrowserWindow | null = null
/** Fullscreen ink-20 dim behind the expanded editor. */
let editorScrim: BrowserWindow | null = null
/** Pending Library deep-link until the workspace window finishes loading. */
let pendingWorkspaceFocus: { workflowId?: string; runId?: string } | null = null
/** Last AppState reported by the pill (for context-menu recording variant). */
let pillAppState: string = 'idle'

const PILL_W = 94
const PILL_H = 24
const MARGIN = 24
/** CSS gap between the panel slot and the pill in glass mode. */
const GLASS_GAP = 8
/** Backdrops sit 1px inside the CSS tint so corner radii never poke out. */
const BACKDROP_INSET = 1

const WORKSPACE_W = 807
const WORKSPACE_H = 549

function getBottomRightBounds(width: number, height: number) {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  return {
    x: sw - width - MARGIN,
    y: sh - height - MARGIN,
    width,
    height
  }
}

function initialPillBounds() {
  const saved = getSnapshot().pillPosition
  if (saved) {
    return {
      x: Math.round(saved.x - PILL_W),
      y: Math.round(saved.y - PILL_H),
      width: PILL_W,
      height: PILL_H
    }
  }
  return getBottomRightBounds(PILL_W, PILL_H)
}

function createPillWindow() {
  const bounds = initialPillBounds()
  pillAnchor = { x: bounds.x + bounds.width, y: bounds.y + bounds.height }

  pillWindow = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    roundedCorners: true,
    acceptFirstMouse: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // Frameless + no traffic lights (titleBarStyle: 'hidden' would show close/min).
  pillWindow.setWindowButtonVisibility(false)
  pillWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false })
  pillWindow.setAlwaysOnTop(true, 'floating')

  pillWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    pillWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    pillWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  pillWindow.on('closed', () => {
    pillWindow = null
  })

  // Backdrops shadow the pill window's visibility exactly.
  pillWindow.on('hide', () => {
    hideBackdrops()
    setEditorScrimVisible(false)
  })
  pillWindow.on('show', () => {
    if (pillWindow) layoutBackdrops(pillWindow.getBounds())
  })
}

/**
 * A vibrancy-only window that paints frosted blur behind one glass shape.
 * It never takes focus or mouse events; z-order is fixed once at startup
 * (below the pill window) and visibility is driven via opacity so showing
 * and hiding never re-stacks windows mid-animation.
 */
function createBackdrop(): BrowserWindow {
  const win = new BrowserWindow({
    width: PILL_W,
    height: PILL_H,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    focusable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    roundedCorners: true,
    backgroundColor: '#00000000',
    vibrancy: 'hud',
    // Keep the frost when unfocused — 'followWindow' goes opaque on blur.
    visualEffectState: 'active'
  })
  win.setIgnoreMouseEvents(true)
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false })
  win.setAlwaysOnTop(true, 'floating')
  win.setOpacity(0)
  win.loadURL('about:blank')
  return win
}

function createBackdrops() {
  pillBackdrop = createBackdrop()
  panelBackdrop = createBackdrop()
  pillBackdrop.showInactive()
  panelBackdrop.showInactive()
  // Fix stacking once: material windows sit just below the content window.
  pillWindow?.moveTop()
}

function hideBackdrops() {
  pillBackdrop?.setOpacity(0)
  panelBackdrop?.setOpacity(0)
}

/**
 * Position the blur shapes under the pill strip and the panel slot for the
 * given pill-window bounds. Called on every window move/resize tick so the
 * material tracks the CSS silhouettes through morphs and drags.
 */
function layoutBackdrops(b: Rect) {
  if (!pillBackdrop || !panelBackdrop) return
  if (!pillWindow || !pillWindow.isVisible() || currentMode === 'panel') {
    hideBackdrops()
    return
  }
  const inset = BACKDROP_INSET
  const below = currentMode === 'glass' && currentPlacement === 'below'
  const pillTop = currentMode === 'pill' || below ? b.y : b.y + b.height - PILL_HEIGHT
  pillBackdrop.setBounds(
    {
      x: b.x + inset,
      y: pillTop + inset,
      width: Math.max(1, b.width - inset * 2),
      height: Math.max(1, Math.min(PILL_HEIGHT, b.height) - inset * 2)
    },
    false
  )
  pillBackdrop.setOpacity(1)

  const panelH = currentMode === 'glass' ? b.height - PILL_HEIGHT - GLASS_GAP : 0
  if (panelH < 6) {
    panelBackdrop.setOpacity(0)
    return
  }
  panelBackdrop.setBounds(
    {
      x: b.x + inset,
      y: (below ? b.y + PILL_HEIGHT + GLASS_GAP : b.y) + inset,
      width: Math.max(1, b.width - inset * 2),
      height: Math.max(1, panelH - inset * 2)
    },
    false
  )
  panelBackdrop.setOpacity(1)
}

function sendWorkspaceFocus(focus: { workflowId?: string; runId?: string } | null) {
  if (!workspaceWindow || !focus) return
  workspaceWindow.webContents.send('workspace:focus', focus)
  // Back-compat for older listeners.
  if (focus.workflowId) {
    workspaceWindow.webContents.send('workspace:focusWorkflow', focus.workflowId)
  }
}

function normalizeWorkspaceFocus(
  focus?: string | { workflowId?: string; runId?: string }
): { workflowId?: string; runId?: string } | null {
  if (!focus) return null
  if (typeof focus === 'string') return { workflowId: focus }
  if (focus.workflowId || focus.runId) return focus
  return null
}

function openWorkspaceWindow(focus?: string | { workflowId?: string; runId?: string }) {
  const normalized = normalizeWorkspaceFocus(focus)
  if (normalized) pendingWorkspaceFocus = normalized

  if (workspaceWindow) {
    workspaceWindow.show()
    workspaceWindow.focus()
    if (pendingWorkspaceFocus) {
      sendWorkspaceFocus(pendingWorkspaceFocus)
      pendingWorkspaceFocus = null
    }
    return
  }

  workspaceWindow = new BrowserWindow({
    width: WORKSPACE_W,
    height: WORKSPACE_H,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    roundedCorners: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  workspaceWindow.webContents.on('did-finish-load', () => {
    if (pendingWorkspaceFocus) {
      sendWorkspaceFocus(pendingWorkspaceFocus)
      pendingWorkspaceFocus = null
    }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    workspaceWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#workspace`)
  } else {
    workspaceWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'workspace' })
  }

  workspaceWindow.on('closed', () => {
    workspaceWindow = null
  })
}

function showPill() {
  if (!pillWindow) createPillWindow()
  pillWindow?.show()
  pillWindow?.focus()
}

function hidePill() {
  pillWindow?.hide()
}

function setEditorScrimVisible(visible: boolean) {
  if (!visible) {
    editorScrim?.setOpacity(0)
    return
  }
  if (!editorScrim) {
    const { x, y, width, height } = screen.getPrimaryDisplay().bounds
    editorScrim = new BrowserWindow({
      x,
      y,
      width,
      height,
      show: false,
      frame: false,
      transparent: true,
      resizable: false,
      movable: false,
      focusable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      hasShadow: false,
      backgroundColor: '#00000000'
    })
    editorScrim.setIgnoreMouseEvents(true)
    editorScrim.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false })
    editorScrim.setAlwaysOnTop(true, 'floating')
    // ink-20 = rgba(22, 20, 39, 0.20)
    editorScrim.loadURL(
      'data:text/html,' +
        encodeURIComponent(
          '<html><body style="margin:0;background:rgba(22,20,39,0.20);width:100vw;height:100vh;"></body></html>'
        )
    )
    editorScrim.showInactive()
    editorScrim.setOpacity(0)
  }
  const { x, y, width, height } = screen.getPrimaryDisplay().bounds
  editorScrim.setBounds({ x, y, width, height }, false)
  editorScrim.setOpacity(1)
  // Keep the pill above the scrim.
  pillWindow?.moveTop()
}

// ── IPC: pill window sizing ──
// The pill's bottom-right corner is tracked as a persistent screen anchor:
// resizes never derive it from live bounds (which drift mid-drag), resizes
// are instant (animation moved the window under a stationary cursor, causing
// the hover flicker loop), and resizes are deferred while a drag is active.
// Modes: 'pill' and 'glass' windows hug their content; all modes are plain
// transparent windows — the pill and panel each paint their own CSS glass,
// so the gap between them stays fully see-through.
type BoundsRequest = {
  w: number
  h: number
  mode: 'pill' | 'glass' | 'panel'
  /** Ease window bounds over this many ms. */
  durationMs?: number
  /**
   * Pill-driven morph: the pill BR is the only anchor. Open eases width
   * first (horizontal pill stretch), then height (panel reveal). Close
   * reverses — height first, then width.
   */
  pillDrive?: boolean
}
type Placement = 'above' | 'below'
type Rect = { x: number; y: number; width: number; height: number }

const PANEL_PADDING = 10
const PILL_HEIGHT = 24
/** Screen position of the pill's bottom-right corner. */
let pillAnchor: { x: number; y: number } | null = null
/** Content inset of the current window mode (0 = pill fills the window). */
let currentInsets = 0
let pendingBounds: BoundsRequest | null = null
/** Last applied panel placement — needed so drag syncs the pill BR correctly. */
let currentPlacement: Placement = 'above'
let currentMode: BoundsRequest['mode'] = 'pill'
let boundsAnimTimer: ReturnType<typeof setInterval> | null = null
/** True for the whole pill-drive open/close (both phases). */
let pillDriveLock = false

function cancelBoundsAnim() {
  if (boundsAnimTimer) {
    clearInterval(boundsAnimTimer)
    boundsAnimTimer = null
  }
}

/** Approximate CSS cubic-bezier(0.32, 0.72, 0, 1) — open ease-out. */
function easeOpen(t: number) {
  return 1 - Math.pow(1 - t, 3)
}
/** Approximate CSS cubic-bezier(0.4, 0, 1, 1) — close ease-in. */
function easeClose(t: number) {
  return t * t * t
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpRect(from: Rect, to: Rect, t: number): Rect {
  return {
    x: Math.round(lerp(from.x, to.x, t)),
    y: Math.round(lerp(from.y, to.y, t)),
    width: Math.round(lerp(from.width, to.width, t)),
    height: Math.round(lerp(from.height, to.height, t))
  }
}

/** Window rect whose bottom-right (or pill strip) stays on the pill anchor. */
function rectFromPillAnchor(
  anchor: { x: number; y: number },
  width: number,
  height: number,
  placement: Placement,
  insets: number
): Rect {
  const x = anchor.x + insets - width
  if (placement === 'below' && height > PILL_HEIGHT) {
    return {
      x,
      y: anchor.y - PILL_HEIGHT - insets,
      width,
      height
    }
  }
  return {
    x,
    y: anchor.y + insets - height,
    width,
    height
  }
}

/** All pill-window bounds go through here so the blur backdrops track them. */
function setPillBounds(win: BrowserWindow, rect: Rect) {
  win.setBounds(rect, false)
  layoutBackdrops(rect)
}

function runBoundsEase(
  win: BrowserWindow,
  from: Rect,
  to: Rect,
  durationMs: number,
  ease: (t: number) => number,
  onDone?: () => void
) {
  if (durationMs <= 0) {
    setPillBounds(win, to)
    onDone?.()
    return
  }
  const t0 = Date.now()
  boundsAnimTimer = setInterval(() => {
    const u = Math.min(1, (Date.now() - t0) / durationMs)
    const e = ease(u)
    setPillBounds(win, lerpRect(from, to, e))
    if (u >= 1) {
      cancelBoundsAnim()
      setPillBounds(win, to)
      onDone?.()
    }
  }, 16)
}

function ensurePillAnchor(win: BrowserWindow): { x: number; y: number } {
  if (!pillAnchor) {
    const b = win.getBounds()
    pillAnchor = { x: b.x + b.width - currentInsets, y: b.y + b.height - currentInsets }
  }
  return pillAnchor
}

/** Pill bottom-right derived from live window bounds + placement. */
function pillAnchorFromBounds(b: {
  x: number
  y: number
  width: number
  height: number
}): { x: number; y: number } {
  const right = b.x + b.width - currentInsets
  if (currentPlacement === 'below' && currentMode !== 'pill') {
    // Panel sits under the pill — pill BR is at the top strip of the window.
    return { x: right, y: b.y + currentInsets + PILL_HEIGHT }
  }
  return { x: right, y: b.y + b.height - currentInsets }
}

function pillAnchorFromWindow(win: BrowserWindow): { x: number; y: number } {
  return pillAnchorFromBounds(win.getBounds())
}

function applyBounds(win: BrowserWindow, req: BoundsRequest): Placement {
  const width = Math.round(req.w)
  const height = Math.round(req.h)
  const durationMs = Math.max(0, req.durationMs ?? 0)

  // Never let a trivial glass height "correction" cancel an in-flight
  // pill-drive morph — that was killing the vertical expansion mid-way.
  if (pillDriveLock && durationMs <= 0 && req.mode === 'glass' && !req.pillDrive) {
    pendingBounds = req
    return currentPlacement
  }

  cancelBoundsAnim()
  if (req.pillDrive && durationMs > 0) pillDriveLock = true
  else pillDriveLock = false
  const anchorBefore = { ...ensurePillAnchor(win) }
  const prevBounds = win.getBounds()
  const wa = screen.getDisplayNearestPoint(anchorBefore).workArea
  const insets = req.mode === 'panel' ? PANEL_PADDING : 0
  const pillDrive = !!req.pillDrive && durationMs > 0

  // Prefer the panel directly above the pill; if that would leave the work
  // area (obstructed), open below the pill instead.
  let placement: Placement = 'above'
  let trial = rectFromPillAnchor(anchorBefore, width, height, 'above', insets)
  if (req.mode !== 'pill' && trial.y < wa.y) {
    placement = 'below'
    trial = rectFromPillAnchor(anchorBefore, width, height, 'below', insets)
    if (trial.y + height > wa.y + wa.height) {
      placement = 'above'
      trial = rectFromPillAnchor(anchorBefore, width, height, 'above', insets)
      trial.y = Math.max(wa.y, trial.y)
    }
  }
  trial.x = Math.min(Math.max(trial.x, wa.x), wa.x + wa.width - width)

  const glassPlacement = currentPlacement
  currentInsets = insets
  currentPlacement = req.mode === 'pill' ? 'above' : placement
  currentMode = req.mode

  const target: Rect = trial
  const from: Rect = {
    x: prevBounds.x,
    y: prevBounds.y,
    width: prevBounds.width,
    height: prevBounds.height
  }

  const alreadyThere =
    from.x === target.x &&
    from.y === target.y &&
    from.width === target.width &&
    from.height === target.height

  if (durationMs <= 0 || alreadyThere) {
    setPillBounds(win, target)
  } else if (pillDrive) {
    // Pill BR fixed. Horizontal stretch is phase 1 on open / phase 2 on close.
    const opening = target.height > from.height + 4
    const widthMs = Math.round(durationMs * (opening ? 0.48 : 0.42))
    const heightMs = Math.max(1, durationMs - widthMs)
    const openPlacement = placement
    const closePlacement = glassPlacement === 'below' ? 'below' : 'above'

    if (opening) {
      const widePill = rectFromPillAnchor(
        anchorBefore,
        target.width,
        PILL_HEIGHT,
        openPlacement,
        insets
      )
      widePill.x = Math.min(
        Math.max(widePill.x, wa.x),
        wa.x + wa.width - widePill.width
      )
      runBoundsEase(win, from, widePill, widthMs, easeOpen, () => {
        runBoundsEase(win, widePill, target, heightMs, easeOpen, () => {
          pillDriveLock = false
          // Apply any deferred glass size correction now that morph finished.
          if (pendingBounds && pillWindow) {
            const pending = pendingBounds
            pendingBounds = null
            if (pending.h >= PILL_HEIGHT + 40) {
              applyBounds(pillWindow, { ...pending, durationMs: 0, pillDrive: false })
            }
          }
        })
      })
    } else {
      const widePill = rectFromPillAnchor(
        anchorBefore,
        from.width,
        PILL_HEIGHT,
        closePlacement,
        0
      )
      widePill.x = Math.min(
        Math.max(widePill.x, wa.x),
        wa.x + wa.width - widePill.width
      )
      runBoundsEase(win, from, widePill, heightMs, easeClose, () => {
        runBoundsEase(win, widePill, target, widthMs, easeClose, () => {
          pillDriveLock = false
        })
      })
    }
  } else {
    const ease = req.mode === 'pill' ? easeClose : easeOpen
    runBoundsEase(win, from, target, durationMs, ease)
  }


  return placement
}

ipcMain.handle('window:setBounds', (event, req: BoundsRequest): Placement => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win !== pillWindow) return 'above'
  if (dragTimer) {
    // Collapse-to-pill during drag is applied immediately so we never drag
    // a glass shell with the Hello pill still painted under the panel.
    if (req.mode === 'pill') {
      pendingBounds = null
      return applyBounds(win, req)
    }
    pendingBounds = req
    return currentPlacement
  }
  return applyBounds(win, req)
})

// ── IPC: workspace window lifecycle ──
ipcMain.handle(
  'workspace:open',
  (_event, focus?: string | { workflowId?: string; runId?: string }) =>
    openWorkspaceWindow(focus)
)
ipcMain.handle('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})
ipcMain.handle('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})
ipcMain.handle('editor:setScrim', (_event, visible: boolean) => {
  setEditorScrimVisible(Boolean(visible))
})
ipcMain.handle('pill:setAppState', (_event, next: string) => {
  pillAppState = typeof next === 'string' ? next : 'idle'
})

// ── IPC: workspace → pill commands ──
ipcMain.handle('pill:runWorkflow', (_event, workflowId: string) => {
  // Resolve from the shared store — never fall back to a hardcoded mock.
  const workflow = getWorkflow(workflowId)
  if (!workflow) {
    console.warn(`[pill:runWorkflow] unknown workflowId: ${workflowId}`)
    return false
  }
  pillWindow?.show()
  pillWindow?.webContents.send('pill:runWorkflow', workflowId)
  return true
})
ipcMain.handle('pill:openRecordPanel', () => {
  pillWindow?.show()
  pillWindow?.webContents.send('pill:openRecordPanel')
})
ipcMain.handle('pill:openEditor', () => {
  pillWindow?.show()
  pillWindow?.webContents.send('pill:openEditor')
})
/** Activity "Answer" / paused — show pill and expand the running hold. */
ipcMain.handle('pill:revealRunning', () => {
  pillWindow?.show()
  pillWindow?.focus()
  pillWindow?.webContents.send('pill:revealRunning')
})

// ── IPC: pill drag (follows cursor 1:1) ──
// A CSS drag-region would swallow the pill's click events, so the renderer
// signals drag start/end and main polls the cursor to move the window.
let dragTimer: ReturnType<typeof setInterval> | null = null
ipcMain.handle(
  'pill:dragStart',
  (event, payload: { x: number; y: number; collapseToPill?: boolean }) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return

  // Collapse only when the renderer asks (unpinned hover). If the user has
  // clicked the panel open, keep glass and drag the whole UI.
  cancelBoundsAnim()
  const collapseToPill = payload?.collapseToPill !== false
  if (collapseToPill && currentMode !== 'pill') {
    pillAnchor = pillAnchorFromWindow(win)
    applyBounds(win, { w: PILL_W, h: PILL_H, mode: 'pill' })
  }

  // Recompute grab offset from the (possibly just-shrunk) window.
  const cursor0 = screen.getCursorScreenPoint()
  const b0 = win.getBounds()
  const grab = { x: cursor0.x - b0.x, y: cursor0.y - b0.y }


  if (dragTimer) clearInterval(dragTimer)
  dragTimer = setInterval(() => {
    const cursor = screen.getCursorScreenPoint()
    const nx = Math.round(cursor.x - grab.x)
    const ny = Math.round(cursor.y - grab.y)
    win.setPosition(nx, ny)
    const bounds = win.getBounds()
    pillAnchor = pillAnchorFromBounds(bounds)
    layoutBackdrops(bounds)
  }, 16)
  }
)
ipcMain.handle('pill:dragEnd', (event) => {
  if (dragTimer) {
    clearInterval(dragTimer)
    dragTimer = null
  }
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win) {
    pillAnchor = pillAnchorFromWindow(win)
    setPillPosition({ x: pillAnchor.x, y: pillAnchor.y })
  }
  if (win && pendingBounds) {
    const req = pendingBounds
    pendingBounds = null
    applyBounds(win, req)
  }
})

// ── IPC: pill context menu ──
// Idle: Open Library ⌘L · Record a workflow ⌥R · Settings… ⌘, · Hide pill ⌥H
// Recording: omits Record; appends "Recording continues" under Hide pill.
ipcMain.handle('pill:contextMenu', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return
  const recording = pillAppState === 'recording'
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Open Library',
      accelerator: 'CommandOrControl+L',
      click: () => openWorkspaceWindow()
    }
  ]
  if (!recording) {
    template.push({
      label: 'Record a workflow',
      accelerator: 'Alt+R',
      click: () => {
        showPill()
        pillWindow?.webContents.send('pill:openRecordPanel')
      }
    })
  }
  template.push(
    { type: 'separator' },
    {
      label: 'Settings…',
      accelerator: 'CommandOrControl+,',
      enabled: false
    },
    {
      label: 'Hide pill',
      accelerator: 'Alt+H',
      click: () => hidePill()
    }
  )
  if (recording) {
    template.push({
      label: 'Recording continues',
      enabled: false
    })
  }
  Menu.buildFromTemplate(template).popup({ window: win })
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ghost')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  loadStore()
  registerStoreIpc()

  createPillWindow()
  createBackdrops()
  if (pillWindow) layoutBackdrops(pillWindow.getBounds())

  createTray({
    showPill: () => showPill(),
    openLibrary: () => openWorkspaceWindow()
  })

  // ⌥G — stand-in for bare Option (polish): show pill + open record panel.
  globalShortcut.register('Alt+G', () => {
    showPill()
    pillWindow?.webContents.send('pill:openRecordPanel')
  })
  // ⌥R — Record a workflow (same as context-menu item).
  globalShortcut.register('Alt+R', () => {
    showPill()
    pillWindow?.webContents.send('pill:openRecordPanel')
  })
  // ⌥H — Hide / show pill (tray also recovers).
  globalShortcut.register('Alt+H', () => {
    if (!pillWindow) return
    if (pillWindow.isVisible()) hidePill()
    else showPill()
  })
  // ⌘L — Open Library
  globalShortcut.register('CommandOrControl+L', () => openWorkspaceWindow())

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createPillWindow()
    else showPill()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  setEditorScrimVisible(false)
  editorScrim?.destroy()
  editorScrim = null
  destroyTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
