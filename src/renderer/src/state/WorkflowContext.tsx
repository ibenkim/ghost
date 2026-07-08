import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode
} from 'react'
import type {
  AppState,
  RecordMode,
  RunStep,
  SummaryOutcome,
  Workflow
} from './types'
import {
  MOCK_RUN_STEPS,
  MOCK_WATCH_LOG,
  MOCK_WORKFLOW
} from './mockData'

export type WatchEntry = { time: string; text: string; voiceNote?: string }

type WorkflowContextValue = {
  state: AppState
  // hover / recording config
  recordMode: RecordMode
  setRecordMode: (m: RecordMode) => void
  selectedAppId: string
  setSelectedAppId: (id: string) => void
  narrate: boolean
  setNarrate: (v: boolean) => void
  // recording
  elapsed: number
  elapsedLabel: string
  watchLog: WatchEntry[]
  watchExpanded: boolean
  setWatchExpanded: (v: boolean) => void
  // editor
  workflow: Workflow
  setWorkflow: (w: Workflow) => void
  // running
  runSteps: RunStep[]
  runPaused: boolean
  summaryOutcome: SummaryOutcome
  // transitions
  openHover: () => void
  closeHover: () => void
  startRecording: () => void
  cancelRecording: () => void
  stopRecording: () => void
  runWorkflow: () => void
  saveWorkflow: () => void
  editFromRunning: () => void
  togglePause: () => void
  skipActive: () => void
  stopRunning: () => void
  finishSummary: () => void
  finishRemaining: () => void
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>('idle')

  const [recordMode, setRecordMode] = useState<RecordMode>('one-app')
  const [selectedAppId, setSelectedAppId] = useState('chrome')
  const [narrate, setNarrate] = useState(true)

  const [elapsed, setElapsed] = useState(0)
  const [watchLog, setWatchLog] = useState<WatchEntry[]>([])
  const [watchExpanded, setWatchExpanded] = useState(false)

  const [workflow, setWorkflow] = useState<Workflow>(MOCK_WORKFLOW)

  const [runSteps, setRunSteps] = useState<RunStep[]>(MOCK_RUN_STEPS)
  const [runPaused, setRunPaused] = useState(false)
  const [summaryOutcome, setSummaryOutcome] = useState<SummaryOutcome>('stopped')

  // ── Sync window bounds with state ──
  useEffect(() => {
    const sizes: Record<AppState, { w: number; h: number }> = {
      idle: { w: 96, h: 96 },
      hover: { w: 320, h: 360 },
      recording: watchExpanded ? { w: 260, h: 200 } : { w: 200, h: 110 },
      organizing: { w: 200, h: 96 },
      editor: { w: 360, h: 480 },
      running: { w: 280, h: 320 },
      summary: { w: 360, h: 320 }
    }
    const { w, h } = sizes[state]
    window.ghostBridge?.setBounds?.(w, h)
  }, [state, watchExpanded])

  // ── Recording timer + streaming watch log ──
  const recordTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (state !== 'recording') return
    recordTimer.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => {
      if (recordTimer.current) clearInterval(recordTimer.current)
    }
  }, [state])

  const watchStreamer = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (state !== 'recording') return
    let i = 0
    watchStreamer.current = setInterval(() => {
      if (i >= MOCK_WATCH_LOG.length) {
        if (watchStreamer.current) clearInterval(watchStreamer.current)
        return
      }
      const entry = MOCK_WATCH_LOG[i]
      setWatchLog((log) => [
        ...log,
        narrate ? entry : { time: entry.time, text: entry.text }
      ])
      i += 1
    }, 1400)
    return () => {
      if (watchStreamer.current) clearInterval(watchStreamer.current)
    }
  }, [state, narrate])

  // ── Organizing → editor delay ──
  useEffect(() => {
    if (state !== 'organizing') return
    const t = setTimeout(() => {
      setWorkflow(MOCK_WORKFLOW)
      setState('editor')
    }, 1400)
    return () => clearTimeout(t)
  }, [state])

  // ── Running step advance ──
  useEffect(() => {
    if (state !== 'running' || runPaused) return
    const t = setInterval(() => {
      setRunSteps((steps) => {
        const activeIdx = steps.findIndex((s) => s.status === 'active')
        if (activeIdx === -1) return steps
        const next = steps.map((s) => ({ ...s }))
        next[activeIdx].status = 'done'
        next[activeIdx].subLabel = undefined
        const following = next.findIndex((s) => s.status === 'pending')
        if (following !== -1) {
          next[following].status = 'active'
        } else {
          // all done → summary
          setSummaryOutcome('done')
          setTimeout(() => setState('summary'), 400)
        }
        return next
      })
    }, 2200)
    return () => clearInterval(t)
  }, [state, runPaused])

  const resetRecording = useCallback(() => {
    setElapsed(0)
    setWatchLog([])
    setWatchExpanded(false)
  }, [])

  const openHover = useCallback(() => {
    setState((s) => (s === 'idle' ? 'hover' : s))
  }, [])

  const closeHover = useCallback(() => {
    setState((s) => (s === 'hover' ? 'idle' : s))
  }, [])

  const startRecording = useCallback(() => {
    resetRecording()
    setState('recording')
  }, [resetRecording])

  const cancelRecording = useCallback(() => {
    resetRecording()
    setState('idle')
  }, [resetRecording])

  const stopRecording = useCallback(() => {
    setState('organizing')
  }, [])

  const runWorkflow = useCallback(() => {
    setRunSteps(MOCK_RUN_STEPS.map((s) => ({ ...s })))
    setRunPaused(false)
    setState('running')
  }, [])

  const saveWorkflow = useCallback(() => {
    setState('idle')
  }, [])

  const editFromRunning = useCallback(() => {
    setState('editor')
  }, [])

  const togglePause = useCallback(() => {
    setRunPaused((p) => {
      const nextPaused = !p
      setRunSteps((steps) =>
        steps.map((s) =>
          s.status === 'active' || s.status === 'paused'
            ? { ...s, status: nextPaused ? 'paused' : 'active' }
            : s
        )
      )
      return nextPaused
    })
  }, [])

  const skipActive = useCallback(() => {
    setRunSteps((steps) => {
      const activeIdx = steps.findIndex(
        (s) => s.status === 'active' || s.status === 'paused'
      )
      if (activeIdx === -1) return steps
      const next = steps.map((s) => ({ ...s }))
      next[activeIdx].status = 'skipped'
      next[activeIdx].subLabel = undefined
      const following = next.findIndex((s) => s.status === 'pending')
      if (following !== -1) next[following].status = 'active'
      return next
    })
    setRunPaused(false)
  }, [])

  const stopRunning = useCallback(() => {
    setSummaryOutcome('stopped')
    setState('summary')
  }, [])

  const finishSummary = useCallback(() => {
    setState('idle')
  }, [])

  const finishRemaining = useCallback(() => {
    runWorkflow()
  }, [runWorkflow])

  const value = useMemo<WorkflowContextValue>(
    () => ({
      state,
      recordMode,
      setRecordMode,
      selectedAppId,
      setSelectedAppId,
      narrate,
      setNarrate,
      elapsed,
      elapsedLabel: formatElapsed(elapsed),
      watchLog,
      watchExpanded,
      setWatchExpanded,
      workflow,
      setWorkflow,
      runSteps,
      runPaused,
      summaryOutcome,
      openHover,
      closeHover,
      startRecording,
      cancelRecording,
      stopRecording,
      runWorkflow,
      saveWorkflow,
      editFromRunning,
      togglePause,
      skipActive,
      stopRunning,
      finishSummary,
      finishRemaining
    }),
    [
      state,
      recordMode,
      selectedAppId,
      narrate,
      elapsed,
      watchLog,
      watchExpanded,
      workflow,
      runSteps,
      runPaused,
      summaryOutcome,
      openHover,
      closeHover,
      startRecording,
      cancelRecording,
      stopRecording,
      runWorkflow,
      saveWorkflow,
      editFromRunning,
      togglePause,
      skipActive,
      stopRunning,
      finishSummary,
      finishRemaining
    ]
  )

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider')
  return ctx
}
