import type { Run } from './types'

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
] as const

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function formatClock(d: Date): string {
  const h24 = d.getHours()
  const suffix = h24 >= 12 ? 'P.M.' : 'A.M.'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${pad2(d.getMinutes())} ${suffix}`
}

/** "Jul 1 · 9:00 A.M." */
export function formatRunWhen(iso: string): string {
  const d = new Date(iso)
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}  ·  ${formatClock(d)}`
}

/** "9:00:02" step timestamp. */
export function formatStepClock(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getHours() % 12 === 0 ? 12 : d.getHours() % 12}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

function durationLabel(run: Run): string {
  if (!run.endedAt) return '0:00'
  const sec = Math.max(0, Math.round((Date.parse(run.endedAt) - Date.parse(run.startedAt)) / 1000))
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${pad2(s)}`
}

function doneCount(run: Run): number {
  return run.steps.filter((s) => s.status === 'done' || s.status === 'skipped').length
}

/** Log row outcome: "Done · 6/6 · 1:20 · 1 question" */
export function formatLogOutcome(run: Run): string {
  const total = run.steps.length
  const done = doneCount(run)
  const base =
    run.outcome === 'done'
      ? `Done · ${done}/${total} · ${durationLabel(run)}`
      : `Stopped · ${done}/${total} · ${durationLabel(run)}`
  const q = run.questions.length
  if (q > 0 && run.outcome === 'done') {
    return `${base} · ${q} question${q === 1 ? '' : 's'}`
  }
  return base
}

/** Run detail meta: "Done · 6 of 6 · 1:20 · 1 question answered · ran unattended" */
export function formatRunDetailMeta(run: Run): string {
  const total = run.steps.length
  const done = doneCount(run)
  const parts: string[] = []
  if (run.outcome === 'done') parts.push('Done')
  else if (run.stopReason) parts.push(run.stopReason)
  else parts.push('Stopped')
  parts.push(`${done} of ${total}`)
  parts.push(durationLabel(run))
  const q = run.questions.length
  if (q > 0) parts.push(`${q} question${q === 1 ? '' : 's'} answered`)
  if (run.outcome === 'done') parts.push('ran unattended')
  return parts.join(' · ')
}

export function formatReturned(minutes?: number): string {
  if (minutes == null) return ''
  return `≈ ${minutes} min returned`
}

/** Home header metric from runs this calendar month. */
export function hoursReturnedThisMonth(runs: Run[], from: Date = new Date()): string {
  const mins = runs
    .filter((r) => {
      if (r.returnedMinutes == null) return false
      const d = new Date(r.endedAt ?? r.startedAt)
      return d.getMonth() === from.getMonth() && d.getFullYear() === from.getFullYear()
    })
    .reduce((sum, r) => sum + (r.returnedMinutes ?? 0), 0)
  const hours = mins / 60
  if (hours <= 0) return '0 h returned this month'
  const rounded = hours >= 10 ? hours.toFixed(0) : hours.toFixed(1)
  return `${rounded} h returned this month`
}

export function formatWaitingSince(iso?: string): string {
  if (!iso) return ''
  return formatClock(new Date(iso))
}
