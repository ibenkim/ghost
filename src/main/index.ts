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
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

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
type BoundsRequest = { w: number; h: number; mode: 'pill' | 'glass' | 'panel' }
type Placement = 'above' | 'below'

const PANEL_PADDING = 10
const PILL_HEIGHT = 24
/** Screen position of the pill's bottom-right corner. */
let pillAnchor: { x: number; y: number } | null = null
/** Content inset of the current window mode (0 = pill fills the window). */
let currentInsets = 0
let pendingBounds: BoundsRequest | null = null

function ensurePillAnchor(win: BrowserWindow): { x: number; y: number } {
  if (!pillAnchor) {
    const b = win.getBounds()
    pillAnchor = { x: b.x + b.width - currentInsets, y: b.y + b.height - currentInsets }
  }
  return pillAnchor
}

function applyBounds(win: BrowserWindow, req: BoundsRequest): Placement {
  const width = Math.round(req.w)
  const height = Math.round(req.h)
  const anchor = ensurePillAnchor(win)
  const wa = screen.getDisplayNearestPoint(anchor).workArea
  const insets = req.mode === 'panel' ? PANEL_PADDING : 0

  // Prefer the panel directly above the pill; if that would leave the work
  // area (obstructed), open below the pill instead.
  let placement: Placement = 'above'
  let x = anchor.x + insets - width
  let y = anchor.y + insets - height
  if (req.mode !== 'pill' && y < wa.y) {
    placement = 'below'
    y = anchor.y - PILL_HEIGHT - insets
    if (y + height > wa.y + wa.height) {
      placement = 'above'
      y = Math.max(wa.y, anchor.y + insets - height)
    }
  }
  x = Math.min(Math.max(x, wa.x), wa.x + wa.width - width)

  currentInsets = insets
  win.setBounds({ x, y, width, height }, false)

  // Content-hugging windows get native vibrancy (real background blur) +
  // shadow; expanded panels are plain transparent windows with CSS glass.
  if (req.mode === 'pill' || req.mode === 'glass') {
    win.setVibrancy('hud')
    win.setHasShadow(true)
  } else {
    win.setVibrancy(null)
    win.setHasShadow(false)
  }
  return placement
}

ipcMain.handle('window:setBounds', (event, req: BoundsRequest): Placement => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win || win !== pillWindow) return 'above'
  if (dragTimer) {
    // A drag owns the window position — defer the resize until drag end.
    pendingBounds = req
    return 'above'
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
ipcMain.handle('pill:dragStart', (event, offset: { x: number; y: number }) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return
  if (dragTimer) clearInterval(dragTimer)
  dragTimer = setInterval(() => {
    const cursor = screen.getCursorScreenPoint()
    const nx = Math.round(cursor.x - offset.x)
    const ny = Math.round(cursor.y - offset.y)
    win.setPosition(nx, ny)
    // Keep the pill anchor in sync so post-drag resizes stay attached.
    const size = win.getBounds()
    pillAnchor = {
      x: nx + size.width - currentInsets,
      y: ny + size.height - currentInsets
    }
  }, 16)
})
ipcMain.handle('pill:dragEnd', (event) => {
  if (dragTimer) {
    clearInterval(dragTimer)
    dragTimer = null
  }
  // Apply any resize that arrived while the drag owned the window.
  const win = BrowserWindow.fromWebContents(event.sender)
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
