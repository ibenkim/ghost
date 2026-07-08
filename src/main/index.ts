import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// The single floating widget window
let floatingWindow: BrowserWindow | null = null

const BUBBLE_W = 64
const BUBBLE_H = 64
const EXPANDED_W = 420
const EXPANDED_H = 600
const MARGIN = 24

function getBottomRightBounds(width: number, height: number) {
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
  return {
    x: sw - width - MARGIN,
    y: sh - height - MARGIN,
    width,
    height
  }
}

function createFloatingWindow() {
  const bounds = getBottomRightBounds(BUBBLE_W, BUBBLE_H)

  floatingWindow = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    roundedCorners: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false })
  floatingWindow.setAlwaysOnTop(true, 'floating')

  floatingWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    floatingWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    floatingWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// IPC: renderer asks to expand or collapse the window
ipcMain.handle('window:expand', () => {
  if (!floatingWindow) return
  const bounds = getBottomRightBounds(EXPANDED_W, EXPANDED_H)
  floatingWindow.setBounds(bounds, true)
})

ipcMain.handle('window:collapse', () => {
  if (!floatingWindow) return
  const bounds = getBottomRightBounds(BUBBLE_W, BUBBLE_H)
  floatingWindow.setBounds(bounds, true)
})

// IPC: relay AI streaming chunks back to renderer (called from main-side fetch)
ipcMain.handle('ai:chat', async (_event, messages: { role: string; content: string }[]) => {
  // Lazily require OpenAI so the app still boots without an API key
  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env['OPENAI_API_KEY'] })
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as Parameters<typeof client.chat.completions.create>[0]['messages'],
      max_tokens: 1024
    })
    return { ok: true, content: response.choices[0].message.content ?? '' }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { ok: false, error: message }
  }
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.ghost')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createFloatingWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createFloatingWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
