import { app, Menu, Tray, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'

/** Fallback when the file isn't found (embedded 32×32 template circle). */
const TRAY_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA8ElEQVR4nO1XwQ3DIAxkhIzgX+ZBmSCD8GEWVmAM3uyRBVojGQmh1liUyq2Uk+5D7NxhEyDG3PgzbEiL9MiAjMRAY5ZilgNIICMfA2aKhVXip1D4lZHzU3E/IdzTa4pPmzgXileK2wFmrueSNQESA9LSX8hEvIQ5w1ZsgtkXMYfcm7ydxkZGshnsE1YgfjD5h8CE5QyMyu+a2P5ZhRu8g21DYBLLzGrZ38UYiuGqEDgDkUlMzOz7KiQmJv60AfUWqC9C9c9QfSMqUN2KC0BQhRmKD6MC1eO4QvVCstLEtHiF6qW0AozitbyF2o/Jja/hCRf6yfg76AeiAAAAAElFTkSuQmCC'

let tray: Tray | null = null

function resolveTrayIcon() {
  const candidates = [
    join(process.cwd(), 'resources', 'trayTemplate.png'),
    join(__dirname, '../../resources/trayTemplate.png'),
    join(process.resourcesPath ?? '', 'trayTemplate.png')
  ]
  for (const p of candidates) {
    if (p && existsSync(p)) {
      const img = nativeImage.createFromPath(p)
      if (!img.isEmpty()) {
        img.setTemplateImage(true)
        return img
      }
    }
  }
  const img = nativeImage.createFromBuffer(Buffer.from(TRAY_PNG_BASE64, 'base64'))
  img.setTemplateImage(true)
  return img
}

export type TrayHandlers = {
  showPill: () => void
  openLibrary: () => void
}

/**
 * Menu-bar icon — recovers a hidden pill and is the quit path once
 * onboarding gates Esc/dismiss (Phase 4).
 */
export function createTray(handlers: TrayHandlers): Tray {
  if (tray) return tray

  tray = new Tray(resolveTrayIcon())
  tray.setToolTip('Ghost')
  tray.setIgnoreDoubleClickEvents(true)

  const rebuildMenu = () => {
    tray?.setContextMenu(
      Menu.buildFromTemplate([
        {
          label: 'Show pill',
          click: () => handlers.showPill()
        },
        {
          label: 'Open Library',
          click: () => handlers.openLibrary()
        },
        { type: 'separator' },
        {
          label: 'Quit Ghost',
          click: () => app.quit()
        }
      ])
    )
  }
  rebuildMenu()

  // Left-click shows the pill (macOS also opens the context menu on right-click).
  tray.on('click', () => handlers.showPill())

  return tray
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}
