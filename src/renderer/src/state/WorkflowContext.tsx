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
  ProjectStatus,
  RecordMode,
  RunProject,
  SummaryOutcome,
  SummaryRow,
  Workflow
} from './types'
import { makeRunProjects, MOCK_WATCH_LOG, MOCK_WORKFLOW } from './mockData'

export type WatchEntry = { time: string; text: string; voiceNote?: string }

export type OrganizingPhase = 'organizing' | 'opening'

const RUN_TICK_MS = 1700

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
  /** True briefly whenever a new step resolves while the ledger is collapsed. */
  stepFlash: boolean
  // organizing
  organizingPhase: OrganizingPhase
  // editor
  workflow: Workflow
  setWorkflow: Dispatch<SetStateAction<Workflow>>
  // toast pill (idle)
  toast: string | null
  // running
  runProjects: RunProject[]
  runPaused: boolean
  runCollapsed: boolean
  setRunCollapsed: (v: boolean) => void
  isProjectExpanded: (id: string) => boolean
  toggleProject: (id: string) => void
  projectStatus: (p: RunProject) => ProjectStatus
  projectProgress: (p: RunProject) => number
  doneProjectCount: number
  currentStepLabel: string
  answerQuestion: (projectId: string, stepId: string, optionId: string, custom?: string) => void
  // summary
  summaryOutcome: SummaryOutcome
  summaryRows: SummaryRow[]
  summaryMeta: string
  // transitions
  openHover: () => void
  closeHover: () => void
  startRecording: () => void
  cancelRecording: () => void
  stopRecording: () => void
  recordAgain: () => void
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
  const s = Math.floor(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>('idle')

  const [recordMode, setRecordMode] = useState<RecordMode>('one-app')
  const [selectedAppId, setSelectedAppId] = useState('chrome')
  const [narrate, setNarrate] = useState(true)

  const [elapsed, setElapsed] = useState(0)
  const [recordPaused, setRecordPaused] = useState(false)
  const [watchLog, setWatchLog] = useState<WatchEntry[]>([])
  const [watchExpanded, setWatchExpanded] = useState(false)
  const [stepFlash, setStepFlash] = useState(false)

  const [organizingPhase, setOrganizingPhase] = useState<OrganizingPhase>('organizing')

  const [workflow, setWorkflow] = useState<Workflow>(MOCK_WORKFLOW)
  const [toast, setToast] = useState<string | null>(null)

  const [runProjects, setRunProjects] = useState<RunProject[]>([])
  const [runPaused, setRunPaused] = useState(false)
  const [runCollapsed, setRunCollapsed] = useState(false)
  /** Projects the user manually expanded/collapsed — auto behavior leaves these alone. */
  const [expandOverrides, setExpandOverrides] = useState<Record<string, boolean>>({})
  const [projectDurations, setProjectDurations] = useState<Record<string, number>>({})
  const projectStartRef = useRef<Record<string, number>>({})
  /** True when a paused run is waiting behind the editor (Edit during a run). */
  const runInFlightRef = useRef(false)

  const [summaryOutcome, setSummaryOutcome] = useState<SummaryOutcome>('done')

  // ── Toast auto-clear ──
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  // ── Sync window bounds with state ──
  useEffect(() => {
    const sizes: Record<AppState, { w: number; h: number }> = {
      idle: { w: 220, h: 160 },
      hover: { w: 320, h: 420 },
      recording: watchExpanded ? { w: 320, h: 330 } : { w: 320, h: 170 },
      organizing: { w: 280, h: 170 },
      editor: { w: 380, h: 560 },
      running: runCollapsed ? { w: 340, h: 160 } : { w: 320, h: 460 },
      summary: { w: 380, h: 440 }
    }
    const { w, h } = sizes[state]
    window.ghostBridge?.setBounds?.(w, h)
  }, [state, watchExpanded, runCollapsed])

  // ── Recording timer ──
  useEffect(() => {
    if (state !== 'recording' || recordPaused) return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [state, recordPaused])

  // ── Streaming watch log while recording ──
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
      setStepFlash(true)
    }, 2600)
    return () => clearInterval(t)
  }, [state, recordPaused, narrate])

  useEffect(() => {
    if (!stepFlash) return
    const t = setTimeout(() => setStepFlash(false), 2200)
    return () => clearTimeout(t)
  }, [stepFlash])

  // ── Organizing: two-phase status, then auto-advance to editor ──
  useEffect(() => {
    if (state !== 'organizing') return
    setOrganizingPhase('organizing')
    const t1 = setTimeout(() => setOrganizingPhase('opening'), 1300)
    const t2 = setTimeout(() => {
      setWorkflow(MOCK_WORKFLOW)
      setState('editor')
    }, 2100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [state])

  // ── Run engine ──
  const hasQuestionHold = runProjects.some((p) =>
    p.steps.some((s) => s.status === 'question' && s.question && s.question.answerId === null)
  )

  useEffect(() => {
    if (state !== 'running' || runPaused || hasQuestionHold) return
    const t = setInterval(() => {
      setRunProjects((projects) => advanceRun(projects))
    }, RUN_TICK_MS)
    return () => clearInterval(t)
  }, [state, runPaused, hasQuestionHold])

  /** Completes the in-flight step and activates the next one. */
  const advanceRun = useCallback((projects: RunProject[]): RunProject[] => {
    const next = projects.map((p) => ({ ...p, steps: p.steps.map((s) => ({ ...s })) }))

    for (const project of next) {
      const active = project.steps.find((s) => s.status === 'active' || s.status === 'question')
      if (!active) continue
      if (active.status === 'question' && active.question?.answerId === null) return projects
      active.status = 'done'
      break
    }

    // Activate the next pending step anywhere in the queue.
    for (const project of next) {
      const pending = project.steps.find((s) => s.status === 'pending')
      const unfinished = project.steps.some(
        (s) => s.status === 'pending' || s.status === 'active' || s.status === 'question'
      )
      if (!unfinished) {
        // Record the project's duration exactly once, when it finishes.
        if (projectStartRef.current[project.id]) {
          const secs = (Date.now() - projectStartRef.current[project.id]) / 1000
          delete projectStartRef.current[project.id]
          setProjectDurations((d) => ({ ...d, [project.id]: secs }))
        }
        continue
      }
      if (pending) {
        if (!projectStartRef.current[project.id]) {
          projectStartRef.current[project.id] = Date.now()
        }
        pending.status = pending.question ? 'question' : 'active'
        if (pending.question) setRunCollapsed(false)
        return next
      }
    }

    // Nothing left to activate → run complete.
    setSummaryOutcome('done')
    setTimeout(() => setState('summary'), 600)
    return next
  }, [])

  const projectStatus = useCallback((p: RunProject): ProjectStatus => {
    if (p.steps.some((s) => s.status === 'active' || s.status === 'question')) return 'active'
    if (p.steps.every((s) => s.status === 'done' || s.status === 'skipped')) return 'done'
    return 'queued'
  }, [])

  const projectProgress = useCallback((p: RunProject): number => {
    const finished = p.steps.filter((s) => s.status === 'done' || s.status === 'skipped').length
    return finished / p.steps.length
  }, [])

  const isProjectExpanded = useCallback(
    (id: string): boolean => {
      if (id in expandOverrides) return expandOverrides[id]
      const project = runProjects.find((p) => p.id === id)
      if (!project) return false
      return projectStatus(project) === 'active'
    },
    [expandOverrides, runProjects, projectStatus]
  )

  const toggleProject = useCallback(
    (id: string) => {
      setExpandOverrides((o) => ({ ...o, [id]: !isProjectExpanded(id) }))
    },
    [isProjectExpanded]
  )

  const answerQuestion = useCallback(
    (projectId: string, stepId: string, optionId: string, custom?: string) => {
      setRunProjects((projects) =>
        projects.map((p) =>
          p.id !== projectId
            ? p
            : {
                ...p,
                steps: p.steps.map((s) =>
                  s.id === stepId && s.question
                    ? {
                        ...s,
                        status: 'active',
                        question: { ...s.question, answerId: optionId, customValue: custom }
                      }
                    : s
                )
              }
        )
      )
    },
    []
  )

  const doneProjectCount = runProjects.filter((p) => projectStatus(p) === 'done').length

  const currentStep = runProjects
    .flatMap((p) => p.steps)
    .find((s) => s.status === 'active' || s.status === 'question')
  const currentStepLabel = currentStep?.label ?? ''

  // ── Summary derivation ──
  const summaryRows: SummaryRow[] = useMemo(() => {
    return runProjects.map((p) => {
      const time = projectDurations[p.id]
        ? formatElapsed(projectDurations[p.id])
        : projectStartRef.current[p.id]
          ? formatElapsed((Date.now() - projectStartRef.current[p.id]) / 1000)
          : '—'
      const held = p.steps.find((s) => s.status === 'active' || s.status === 'question')
      if (held) {
        return {
          projectId: p.id,
          name: p.name,
          time,
          note: `Stopped at step ${held.index} of ${p.steps.length} · ${held.label}`,
          kind: 'stopped' as const
        }
      }
      if (p.steps.every((s) => s.status === 'pending')) {
        return { projectId: p.id, name: p.name, time: '—', kind: 'not-yet' as const }
      }
      const skipped = p.steps.filter((s) => s.status === 'skipped')
      if (skipped.length > 0) {
        return {
          projectId: p.id,
          name: p.name,
          time,
          note: `Skipped Step ${skipped.map((s) => s.index).join(', ')}`,
          kind: 'skipped' as const
        }
      }
      return { projectId: p.id, name: p.name, time, kind: 'done' as const }
    })
  }, [runProjects, projectDurations])

  const summaryMeta = useMemo(() => {
    const total = runProjects.length
    const finished = summaryRows.filter(
      (r) => r.kind === 'done' || r.kind === 'skipped'
    ).length
    const totalSecs = Object.values(projectDurations).reduce((a, b) => a + b, 0)
    const timeLabel = formatElapsed(totalSecs)
    return summaryOutcome === 'stopped'
      ? `Stopped · ${finished} of ${total} items · ${timeLabel}`
      : `Done · ${finished} of ${total} items · ${timeLabel}`
  }, [runProjects, summaryRows, projectDurations, summaryOutcome])

  // ── Transitions ──

  const resetRecording = useCallback(() => {
    setElapsed(0)
    setRecordPaused(false)
    setWatchLog([])
    setWatchExpanded(false)
    watchIndexRef.current = 0
  }, [])

  const openHover = useCallback(() => {
    setState((s) => (s === 'idle' ? 'hover' : s))
  }, [])

  const closeHover = useCallback(() => {
    setState((s) => (s === 'hover' ? 'idle' : s))
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

  const stopRecording = useCallback(() => {
    setState('organizing')
  }, [])

  const recordAgain = useCallback(() => {
    runInFlightRef.current = false
    resetRecording()
    setState('hover')
  }, [resetRecording])

  const runWorkflow = useCallback(() => {
    if (runInFlightRef.current) {
      // Resuming a run that was paused for editing — changes apply from the
      // next step onward; completed steps are not re-run.
      runInFlightRef.current = false
      setRunPaused(false)
      setState('running')
      return
    }
    const projects = makeRunProjects()
    projects[0].steps[0].status = 'active'
    projectStartRef.current = { [projects[0].id]: Date.now() }
    setProjectDurations({})
    setExpandOverrides({})
    setRunProjects(projects)
    setRunPaused(false)
    setRunCollapsed(false)
    setState('running')
  }, [])

  const saveWorkflow = useCallback(() => {
    runInFlightRef.current = false
    setToast('Workflow saved!')
    setState('idle')
  }, [])

  const editFromRunning = useCallback(() => {
    runInFlightRef.current = true
    setRunPaused(true)
    setState('editor')
  }, [])

  const togglePause = useCallback(() => {
    setRunPaused((p) => !p)
  }, [])

  const skipActive = useCallback(() => {
    setRunProjects((projects) => {
      const next = projects.map((p) => ({ ...p, steps: p.steps.map((s) => ({ ...s })) }))
      for (const project of next) {
        const active = project.steps.find(
          (s) => s.status === 'active' || s.status === 'question'
        )
        if (!active) continue
        active.status = 'skipped'
        const pending = next
          .flatMap((p) => p.steps)
          .find((s) => s.status === 'pending')
        if (pending) pending.status = pending.question ? 'question' : 'active'
        break
      }
      return next
    })
    setRunPaused(false)
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

  const finishRemaining = useCallback(() => {
    // The stopped item resumes from its held step; not-yet items run in full.
    setRunPaused(false)
    setRunCollapsed(false)
    setState('running')
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
    stepFlash,
    organizingPhase,
    workflow,
    setWorkflow,
    toast,
    runProjects,
    runPaused,
    runCollapsed,
    setRunCollapsed,
    isProjectExpanded,
    toggleProject,
    projectStatus,
    projectProgress,
    doneProjectCount,
    currentStepLabel,
    answerQuestion,
    summaryOutcome,
    summaryRows,
    summaryMeta,
    openHover,
    closeHover,
    startRecording,
    cancelRecording,
    stopRecording,
    recordAgain,
    runWorkflow,
    saveWorkflow,
    editFromRunning,
    togglePause,
    skipActive,
    stopRunning,
    finishSummary,
    finishRemaining
  }

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext)
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider')
  return ctx
}
