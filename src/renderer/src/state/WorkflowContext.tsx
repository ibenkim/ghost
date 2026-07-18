import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  ReactNode
} from 'react'
import type {
  AppState,
  RecordMode,
  RunStep,
  SummaryOutcome,
  Workflow
} from './types'
import { makeRunSteps, MOCK_WATCH_LOG, MOCK_WORKFLOW } from './mockData'

export type WatchEntry = { time: string; text: string; voiceNote?: string }

const RUN_TICK_MS = 1800
/** Stable record-panel height (Figma ~277–293). Never open glass shorter than this. */
const HOVER_PANEL_H = 289
/** Reject clipped measures from close/morph — 81px poisoned the next open to h=113. */
const HOVER_PANEL_MEASURE_MIN = 200

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
  elapsedLabel: string
  recordPaused: boolean
  toggleRecordPause: () => void
  watchLog: WatchEntry[]
  watchExpanded: boolean
  setWatchExpanded: (v: boolean) => void
  // editor
  workflow: Workflow
  setWorkflow: Dispatch<SetStateAction<Workflow>>
  editorCollapsed: boolean
  setEditorCollapsed: (v: boolean) => void
  // pill status slot (idle toast)
  toast: string | null
  // window layout
  panelPlacement: 'above' | 'below'
  /** True while the hover panel is morphing/fading out. */
  hoverFading: boolean
  /** How the hover panel is dismissing — morph back into the pill, or quick drag. */
  hoverDismissMode: 'morph' | 'drag' | null
  /** Measured hover-panel height so the glass window hugs its content. */
  reportHoverPanelHeight: (h: number) => void
  // drag ↔ hover mutual exclusion
  /** Returns whether the drag should collapse glass → pill. */
  beginDrag: () => { collapseToPill: boolean }
  endDrag: () => void
  // running
  runSteps: RunStep[]
  runPaused: boolean
  runCollapsed: boolean
  setRunCollapsed: (v: boolean) => void
  runElapsedLabel: string
  runDoneCount: number
  hasQuestionHold: boolean
  answerQuestion: (stepId: string, optionId: string, custom?: string) => void
  skipStep: (stepId: string) => void
  // summary
  summaryOutcome: SummaryOutcome
  summaryMeta: string
  // transitions
  openHover: () => void
  closeHover: () => void
  startRecording: () => void
  cancelRecording: () => void
  finishRecording: () => void
  cancelEditor: () => void
  runWorkflow: () => void
  saveWorkflow: () => void
  editFromRunning: () => void
  toggleRunPause: () => void
  stopRunning: () => void
  finishSummary: () => void
  runRemaining: () => void
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null)

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>('idle')
  const stateRef = useRef(state)
  stateRef.current = state

  const [recordMode, setRecordMode] = useState<RecordMode>('one-app')
  const [selectedAppId, setSelectedAppId] = useState('chrome')
  const [narrate, setNarrate] = useState(true)

  const [elapsed, setElapsed] = useState(0)
  const [recordPaused, setRecordPaused] = useState(false)
  const [watchLog, setWatchLog] = useState<WatchEntry[]>([])
  const [watchExpanded, setWatchExpanded] = useState(false)

  const [workflow, setWorkflow] = useState<Workflow>(MOCK_WORKFLOW)
  const [editorCollapsed, setEditorCollapsed] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const [panelPlacement, setPanelPlacement] = useState<'above' | 'below'>('above')
  const [hoverFading, setHoverFading] = useState(false)
  const [hoverDismissMode, setHoverDismissMode] = useState<'morph' | 'drag' | null>(null)
  /** Last known full record-panel height (never a clipped close-frame measure). */
  const [hoverPanelH, setHoverPanelH] = useState(HOVER_PANEL_H)
  const hoverPanelHRef = useRef(HOVER_PANEL_H)
  hoverPanelHRef.current = hoverPanelH
  /** While true, hover must not open — dragging and hovering are exclusive. */
  const draggingRef = useRef(false)
  /** Prevents double-triggering morph-out / drag dismiss. */
  const hoverClosingRef = useRef(false)
  const prevStateRef = useRef<AppState>(state)
  /** True while the glass open ease is running — ignore height churn mid-anim. */
  const hoverOpenAnimRef = useRef(false)
  const pendingHoverHRef = useRef<number | null>(null)
  const openAnimTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [runSteps, setRunSteps] = useState<RunStep[]>([])
  const [runPaused, setRunPaused] = useState(false)
  const [runCollapsed, setRunCollapsed] = useState(false)
  const [runElapsed, setRunElapsed] = useState(0)
  /** True when a paused run is waiting behind the editor (Edit during a run). */
  const runInFlightRef = useRef(false)

  const [summaryOutcome, setSummaryOutcome] = useState<SummaryOutcome>('done')

  // ── Toast auto-clear ──
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2200)
    return () => clearTimeout(t)
  }, [toast])

  // ── Sync window bounds with state ──
  // Collapsed states size the window to the pill exactly ('pill' mode);
  // expanded states use 'panel' mode with padding.
  useEffect(() => {
    type Size = { w: number; h: number; mode: 'pill' | 'glass' | 'panel' }
    // Hover ('glass') hugs its content: panel + 8px gap + 24px pill.
    // Clamp so a bad measure from a previous close can't shrink the open target.
    const glassPanelH = Math.max(hoverPanelH, HOVER_PANEL_H)
    const sizes: Record<AppState, Size> = {
      idle: { w: toast ? 140 : 94, h: 24, mode: 'pill' },
      hover: { w: 266, h: glassPanelH + 8 + 24, mode: 'glass' },
      recording: watchExpanded
        ? { w: 300, h: 330, mode: 'panel' }
        : { w: 161, h: 24, mode: 'pill' },
      organizing: { w: 94, h: 24, mode: 'pill' },
      editor: editorCollapsed
        ? { w: 125, h: 24, mode: 'pill' }
        : { w: 700, h: 590, mode: 'panel' },
      running: runCollapsed
        ? { w: 230, h: 24, mode: 'pill' }
        : { w: 490, h: 380, mode: 'panel' },
      summary: { w: 380, h: 380, mode: 'panel' }
    }
    const { w, h, mode } = sizes[state]
    const prev = prevStateRef.current
    prevStateRef.current = state
    // closeHover owns the glass→pill ease; don't let panel height churn reopen it.
    if (hoverClosingRef.current && state === 'hover') return
    const isOpenTransition = prev === 'idle' && state === 'hover'
    // Height corrections mid-open cancel the ease and reflow text — defer them.
    if (state === 'hover' && !isOpenTransition && hoverOpenAnimRef.current) {
      return
    }
    // Idle → hover: pill-driven morph (width stretch, then height reveal).
    const durationMs = isOpenTransition ? 420 : 0
    const pillDrive = isOpenTransition
    if (isOpenTransition) {
      hoverOpenAnimRef.current = true
      if (openAnimTimerRef.current) clearTimeout(openAnimTimerRef.current)
      openAnimTimerRef.current = setTimeout(() => {
        hoverOpenAnimRef.current = false
        openAnimTimerRef.current = null
        const pending = pendingHoverHRef.current
        pendingHoverHRef.current = null
        if (pending != null) {
          setHoverPanelH((prev) => (prev === pending ? prev : pending))
        }
      }, 440)
    }
    window.ghostBridge?.setBounds?.(w, h, mode, { durationMs, pillDrive })?.then((placement) => {
      if (placement) setPanelPlacement(placement)
    })
  }, [state, watchExpanded, editorCollapsed, runCollapsed, toast, hoverPanelH])

  // ── Recording timer ──
  useEffect(() => {
    if (state !== 'recording' || recordPaused) return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [state, recordPaused])

  // ── Streaming ledger while recording ──
  const watchIndexRef = useRef(0)
  useEffect(() => {
    if (state !== 'recording' || recordPaused) return
    const t = setInterval(() => {
      const i = watchIndexRef.current
      if (i >= MOCK_WATCH_LOG.length) return
      const entry = MOCK_WATCH_LOG[i]
      watchIndexRef.current = i + 1
      setWatchLog((log) => [
        ...log,
        narrate ? entry : { time: entry.time, text: entry.text }
      ])
    }, 2600)
    return () => clearInterval(t)
  }, [state, recordPaused, narrate])

  // ── Organizing ("Thinking...") → auto-advance to editor ──
  useEffect(() => {
    if (state !== 'organizing') return
    const t = setTimeout(() => {
      setWorkflow(MOCK_WORKFLOW)
      setEditorCollapsed(false)
      setState('editor')
    }, 2000)
    return () => clearTimeout(t)
  }, [state])

  // ── Run engine (flat ledger) ──
  const hasQuestionHold = runSteps.some(
    (s) => s.status === 'question' && s.question?.answerId === null
  )

  useEffect(() => {
    if (state !== 'running' || runPaused) return
    const t = setInterval(() => setRunElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [state, runPaused])

  useEffect(() => {
    if (state !== 'running' || runPaused || hasQuestionHold) return
    const t = setInterval(() => {
      setRunSteps((steps) => {
        const next = steps.map((s) => ({ ...s }))
        const active = next.find((s) => s.status === 'active' || s.status === 'question')
        if (active) {
          if (active.status === 'question' && active.question?.answerId === null) return steps
          active.status = 'done'
        }
        const pending = next.find((s) => s.status === 'pending')
        if (pending) {
          pending.status = pending.question && pending.question.answerId === null ? 'question' : 'active'
          if (pending.status === 'question') setRunCollapsed(false)
        } else {
          setSummaryOutcome('done')
          setTimeout(() => setState('summary'), 600)
        }
        return next
      })
    }, RUN_TICK_MS)
    return () => clearInterval(t)
  }, [state, runPaused, hasQuestionHold])

  const answerQuestion = useCallback((stepId: string, optionId: string, custom?: string) => {
    setRunSteps((steps) =>
      steps.map((s) =>
        s.id === stepId && s.question
          ? {
              ...s,
              status: 'active',
              question: { ...s.question, answerId: optionId, customValue: custom }
            }
          : s
      )
    )
  }, [])

  /** Skip any not-done step — including steps later than the current one. */
  const skipStep = useCallback((stepId: string) => {
    setRunSteps((steps) => {
      const next = steps.map((s) => ({ ...s }))
      const target = next.find((s) => s.id === stepId)
      if (!target || target.status === 'done' || target.status === 'skipped') return steps
      const wasCurrent = target.status === 'active' || target.status === 'question'
      target.status = 'skipped'
      if (wasCurrent) {
        const pending = next.find((s) => s.status === 'pending')
        if (pending) {
          pending.status =
            pending.question && pending.question.answerId === null ? 'question' : 'active'
        } else {
          setSummaryOutcome('done')
          setTimeout(() => setState('summary'), 600)
        }
      }
      return next
    })
  }, [])

  const runDoneCount = runSteps.filter(
    (s) => s.status === 'done' || s.status === 'skipped'
  ).length

  // ── Summary meta ──
  const summaryMeta = useMemo(() => {
    const time = formatElapsed(runElapsed)
    if (summaryOutcome === 'done') return `Completed · ${time}`
    return `Stopped · ${runDoneCount}/${runSteps.length} · ${time}`
  }, [summaryOutcome, runElapsed, runDoneCount, runSteps.length])

  // ── Transitions ──

  const resetRecording = useCallback(() => {
    setElapsed(0)
    setRecordPaused(false)
    setWatchLog([])
    setWatchExpanded(false)
    watchIndexRef.current = 0
  }, [])

  const openHover = useCallback(() => {
    // Opening and dragging are mutually exclusive — never open mid-drag.
    if (draggingRef.current || hoverClosingRef.current) return
    setHoverFading(false)
    setHoverDismissMode(null)
    pendingHoverHRef.current = null
    // Repair if a previous close stored a clipped height (e.g. 81 → open to 113).
    if (hoverPanelHRef.current < HOVER_PANEL_MEASURE_MIN) {
      setHoverPanelH(HOVER_PANEL_H)
    }
    setState((s) => (s === 'idle' ? 'hover' : s))
  }, [])

  const reportHoverPanelHeight = useCallback((h: number) => {
    const next = Math.round(h)
    // Closing frames measure a clipped panel (~81) — that poisoned the next open.
    if (hoverClosingRef.current || stateRef.current !== 'hover') return
    if (next < HOVER_PANEL_MEASURE_MIN) return
    if (hoverOpenAnimRef.current) {
      pendingHoverHRef.current = next
      return
    }
    setHoverPanelH((prev) => (Math.abs(prev - next) <= 2 ? prev : next))
  }, [])

  /**
   * Dismiss the hover panel by morphing it back into the pill, then idle.
   * Re-entrant while a close is already animating.
   */
  const closeHover = useCallback(() => {
    if (stateRef.current !== 'hover' || hoverClosingRef.current) return
    hoverClosingRef.current = true
    pendingHoverHRef.current = null
    setHoverDismissMode('morph')
    setHoverFading(true)
    // Pill-driven close: collapse height onto the pill, then shrink width.
    window.ghostBridge?.setBounds?.(94, 24, 'pill', {
      durationMs: 400,
      pillDrive: true
    })
    setTimeout(() => {
      setHoverFading(false)
      setHoverDismissMode(null)
      hoverClosingRef.current = false
      setState((s) => (s === 'hover' ? 'idle' : s))
    }, 400)
  }, [])

  /**
   * Drag start. While the record panel is open, keep the glass UI and drag
   * it — closing is a click (no drag), same press/move threshold as opening.
   */
  const beginDrag = useCallback((): { collapseToPill: boolean } => {
    draggingRef.current = true
    return { collapseToPill: stateRef.current !== 'hover' }
  }, [])

  const endDrag = useCallback(() => {
    draggingRef.current = false
  }, [])

  const startRecording = useCallback(() => {
    runInFlightRef.current = false
    resetRecording()
    setState('recording')
  }, [resetRecording])

  const cancelRecording = useCallback(() => {
    resetRecording()
    setState('idle')
  }, [resetRecording])

  /** "Finish" in the ledger — the only stop control. */
  const finishRecording = useCallback(() => {
    setState('organizing')
  }, [])

  /** Editor "Cancel" (after confirm) — discards the draft entirely. */
  const cancelEditor = useCallback(() => {
    runInFlightRef.current = false
    setState('idle')
  }, [])

  const runWorkflow = useCallback(() => {
    if (runInFlightRef.current) {
      // Resuming a run paused for editing — changes apply from the next
      // step onward; completed steps are not re-run.
      runInFlightRef.current = false
      setRunPaused(false)
      setEditorCollapsed(false)
      setState('running')
      return
    }
    const steps = makeRunSteps(workflow)
    if (steps.length > 0) steps[0].status = 'active'
    setRunSteps(steps)
    setRunPaused(false)
    setRunCollapsed(false)
    setRunElapsed(0)
    setState('running')
  }, [workflow])

  const saveWorkflow = useCallback(() => {
    runInFlightRef.current = false
    setToast('Workflow saved!')
    setState('idle')
  }, [])

  const editFromRunning = useCallback(() => {
    runInFlightRef.current = true
    setRunPaused(true)
    setEditorCollapsed(false)
    setState('editor')
  }, [])

  const toggleRunPause = useCallback(() => {
    setRunPaused((p) => !p)
  }, [])

  const stopRunning = useCallback(() => {
    runInFlightRef.current = false
    setSummaryOutcome('stopped')
    setState('summary')
  }, [])

  const finishSummary = useCallback(() => {
    runInFlightRef.current = false
    setState('idle')
  }, [])

  /** "Run remaining": the stopped step resumes from where it held. */
  const runRemaining = useCallback(() => {
    setRunPaused(false)
    setRunCollapsed(false)
    setState('running')
  }, [])

  // ── Commands from the workspace window / global hotkey ──
  useEffect(() => {
    const offRecord = window.ghostBridge?.onOpenRecordPanel?.(() => {
      setState((s) => (s === 'idle' ? 'hover' : s))
    })
    const offRun = window.ghostBridge?.onRunWorkflow?.(() => {
      runInFlightRef.current = false
      const steps = makeRunSteps(MOCK_WORKFLOW)
      if (steps.length > 0) steps[0].status = 'active'
      setRunSteps(steps)
      setRunPaused(false)
      setRunCollapsed(false)
      setRunElapsed(0)
      setState('running')
    })
    const offEditor = window.ghostBridge?.onOpenEditor?.(() => {
      setWorkflow(MOCK_WORKFLOW)
      setEditorCollapsed(false)
      setState('editor')
    })
    return () => {
      offRecord?.()
      offRun?.()
      offEditor?.()
    }
  }, [])

  const value: WorkflowContextValue = {
    state,
    recordMode,
    setRecordMode,
    selectedAppId,
    setSelectedAppId,
    narrate,
    setNarrate,
    elapsedLabel: formatElapsed(elapsed),
    recordPaused,
    toggleRecordPause: () => setRecordPaused((p) => !p),
    watchLog,
    watchExpanded,
    setWatchExpanded,
    workflow,
    setWorkflow,
    editorCollapsed,
    setEditorCollapsed,
    toast,
    panelPlacement,
    hoverFading,
    hoverDismissMode,
    reportHoverPanelHeight,
    beginDrag,
    endDrag,
    runSteps,
    runPaused,
    runCollapsed,
    setRunCollapsed,
    runElapsedLabel: formatElapsed(runElapsed),
    runDoneCount,
    hasQuestionHold,
    answerQuestion,
    skipStep,
    summaryOutcome,
    summaryMeta,
    openHover,
    closeHover,
    startRecording,
    cancelRecording,
    finishRecording,
    cancelEditor,
    runWorkflow,
    saveWorkflow,
    editFromRunning,
    toggleRunPause,
    stopRunning,
    finishSummary,
    runRemaining
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider')
  return ctx
}
