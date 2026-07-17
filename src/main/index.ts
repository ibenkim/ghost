import { app, shell, BrowserWindow, ipcMain, screen, Menu, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'


let pillWindow: BrowserWindow | null = null
let workspaceWindow: BrowserWindow | null = null

const PILL_W = 94
const PILL_H = 24
const MARGIN = 24

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

function createPillWindow() {
  const bounds = getBottomRightBounds(PILL_W, PILL_H)

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
    vibrancy: 'hud',
    // Keep frosted glass when the window is unfocused (clicking outside).
    // Default 'followWindow' drops vibrancy on blur and looks opaque.
    visualEffectState: 'active',
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

  // Re-assert vibrancy on blur — some macOS builds drop the material otherwise.
  pillWindow.on('blur', () => {
    if (pillWindow && (currentMode === 'pill' || currentMode === 'glass')) {
      pillWindow.setVibrancy('hud')
    }
  })

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
}

function openWorkspaceWindow() {
  if (workspaceWindow) {
    workspaceWindow.show()
    workspaceWindow.focus()
    return
  }

  workspaceWindow = new BrowserWindow({
    width: WORKSPACE_W,
    height: WORKSPACE_H,
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: false,
    roundedCorners: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
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

// ── IPC: pill window sizing ──
// The pill's bottom-right corner is tracked as a persistent screen anchor:
// resizes never derive it from live bounds (which drift mid-drag), resizes
// are instant (animation moved the window under a stationary cursor, causing
// the hover flicker loop), and resizes are deferred while a drag is active.
// Modes: 'pill' and 'glass' windows hug their content and get native
// vibrancy (real background blur); 'panel' windows are plain transparent
// with CSS glass and content padding.
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

function runBoundsEase(
  win: BrowserWindow,
  from: Rect,
  to: Rect,
  durationMs: number,
  ease: (t: number) => number,
  onDone?: () => void
) {
  if (durationMs <= 0) {
    win.setBounds(to, false)
    onDone?.()
    return
  }
  const t0 = Date.now()
  boundsAnimTimer = setInterval(() => {
    const u = Math.min(1, (Date.now() - t0) / durationMs)
    const e = ease(u)
    win.setBounds(lerpRect(from, to, e), false)
    if (u >= 1) {
      cancelBoundsAnim()
      win.setBounds(to, false)
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

function applyVibrancyForMode(win: BrowserWindow, mode: BoundsRequest['mode']) {
  if (mode === 'pill' || mode === 'glass') {
    win.setVibrancy('hud')
    win.setHasShadow(true)
  } else {
    win.setVibrancy(null)
    win.setHasShadow(false)
  }
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

  applyVibrancyForMode(win, req.mode)

  const alreadyThere =
    from.x === target.x &&
    from.y === target.y &&
    from.width === target.width &&
    from.height === target.height

  if (durationMs <= 0 || alreadyThere) {
    win.setBounds(target, false)
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
          applyVibrancyForMode(win, req.mode)
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
          applyVibrancyForMode(win, req.mode)
        })
      })
    }
  } else {
    const ease = req.mode === 'pill' ? easeClose : easeOpen
    runBoundsEase(win, from, target, durationMs, ease, () => {
      applyVibrancyForMode(win, req.mode)
    })
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
ipcMain.handle('workspace:open', () => openWorkspaceWindow())
ipcMain.handle('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})
ipcMain.handle('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

// ── IPC: workspace → pill commands ──
ipcMain.handle('pill:runWorkflow', (_event, workflowId: string) => {
  pillWindow?.show()
  pillWindow?.webContents.send('pill:runWorkflow', workflowId)
})
ipcMain.handle('pill:openRecordPanel', () => {
  pillWindow?.show()
  pillWindow?.webContents.send('pill:openRecordPanel')
})
ipcMain.handle('pill:openEditor', () => {
  pillWindow?.show()
  pillWindow?.webContents.send('pill:openEditor')
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
  }
  if (win && pendingBounds) {
    const req = pendingBounds
    pendingBounds = null
    applyBounds(win, req)
  }
})

// ── IPC: pill context menu ──
// Right-click → Open Library · Settings · Hide pill. During recording,
// hiding only hides visuals — recording continues; ⌥G recovers the pill.
ipcMain.handle('pill:contextMenu', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return
  const menu = Menu.buildFromTemplate([
    { label: 'Open Library', click: () => openWorkspaceWindow() },
    { label: 'Settings', enabled: false },
    { type: 'separator' },
    { label: 'Hide pill', click: () => win.hide() }
  ])
  menu.popup({ window: win })
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ghost')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createPillWindow()

  // Recovery hotkey: re-show the pill and open the record panel.
  globalShortcut.register('Alt+G', () => {
    if (!pillWindow) return
    pillWindow.show()
    pillWindow.webContents.send('pill:openRecordPanel')
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createPillWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
