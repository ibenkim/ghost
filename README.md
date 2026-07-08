# Ghost

A transparent, always-on-top floating AI assistant that lives in the bottom-right corner of your screen. Click the bubble to open a chat panel; press Enter to send a message.

## Stack

| Layer | Technology |
|---|---|
| Desktop shell | [Electron](https://www.electronjs.org/) |
| UI | React 18 + TypeScript |
| Build | [electron-vite](https://electron-vite.org/) |
| AI | OpenAI (`gpt-4o-mini` by default) |

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Add your OpenAI key
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...

# 3. Run in development
npm run dev

# 4. Build for distribution
npm run build
```

## Project structure

```
ghost/
├── .planning/             # Task tracking (todo / in-progress / done)
│   ├── TODO.md
│   ├── IN_PROGRESS.md
│   └── DONE.md
├── src/
│   ├── main/
│   │   └── index.ts       # Electron main process — creates the transparent BrowserWindow
│   ├── preload/
│   │   ├── index.ts       # Secure IPC bridge exposed as window.ghostBridge
│   │   └── index.d.ts     # TypeScript types for the bridge
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── components/
│           │   └── FloatingWidget.tsx   # Bubble + chat panel
│           ├── hooks/
│           │   └── useChat.ts           # Message state & AI calls
│           └── styles/
│               └── globals.css
├── .env.example
├── electron.vite.config.ts
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── tsconfig.web.json
```

## How it works

1. **Main process** (`src/main/index.ts`) opens a `frameless`, `transparent`, `alwaysOnTop` `BrowserWindow` sized to just the bubble (64 × 64 px) and pinned to the bottom-right of the primary display.
2. When the user clicks the bubble, the renderer calls `window.ghostBridge.expand()` via the **preload bridge**, and the main process animates the window to 420 × 600 px.
3. The chat message is sent to the main process via `window.ghostBridge.chat(messages)`, which calls the OpenAI API and returns the response.
4. Closing the panel calls `window.ghostBridge.collapse()` to shrink the window back to the bubble.

## Changing the AI provider

Edit `src/main/index.ts` — the `ai:chat` IPC handler — and swap out the OpenAI call for any provider (Anthropic, Ollama, etc.).

## Task tracking

See the `.planning/` folder:

- **`TODO.md`** — backlog of features not yet started
- **`IN_PROGRESS.md`** — active work items
- **`DONE.md`** — completed / shipped items
