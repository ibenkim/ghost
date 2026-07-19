import type { ScheduleCadence, TimeOfDay, Trigger, Weekday } from './types'

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5]

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Format a local TimeOfDay as "9:00 A.M." / "4:30 P.M.". */
export function formatTime(time: TimeOfDay): string {
  const h24 = time.hour
  const suffix = h24 >= 12 ? 'P.M.' : 'A.M.'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${pad2(time.minute)} ${suffix}`
}

function ordinal(n: number): string {
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}

/** Human schedule line matching v2/v3 copy, e.g. "Every week on Thursday at 4:30 P.M." */
export function formatSchedule(cadence: ScheduleCadence): string {
  const at = formatTime(cadence.time)
  switch (cadence.kind) {
    case 'daily':
      return `Every day at ${at}`
    case 'weekly': {
      const days = [...cadence.days].sort((a, b) => a - b)
      if (days.length === 5 && WEEKDAYS.every((d) => days.includes(d))) {
        return `Every weekday at ${at}`
      }
      if (days.length === 1) {
        return `Every week on ${WEEKDAY_NAMES[days[0]]} at ${at}`
      }
      const names = days.map((d) => WEEKDAY_NAMES[d]).join(', ')
      return `Every week on ${names} at ${at}`
    }
    case 'monthly':
      return `${ordinal(cadence.day)} of each month at ${at}`
    case 'custom':
      return cadence.label
  }
}

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

/** "Friday, Jul 10" — Upcoming / Next-run preview. */
export function formatUpcoming(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`
}

/** Short TZ label for this Mac, e.g. "PT". */
export function localTimezoneAbbrev(from: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(from)
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? 'local'
}

/** Live preview line for the trigger editor. */
export function nextRunPreview(trigger: Trigger, from: Date = new Date()): string | null {
  const n = nextRun(trigger, from)
  if (!n) return null
  return `Next run: ${formatUpcoming(n)} · uses this Mac's time zone (${localTimezoneAbbrev(from)})`
}

function atTimeOn(day: Date, time: TimeOfDay): Date {
  const d = new Date(day)
  d.setHours(time.hour, time.minute, 0, 0)
  return d
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Next fire time for a trigger in this Mac's local time zone.
 * Returns null for manual-only triggers (no cadence).
 */
export function nextRun(trigger: Trigger, from: Date = new Date()): Date | null {
  const cadence = trigger.cadence
  if (!cadence) return null

  switch (cadence.kind) {
    case 'daily':
      return nextDaily(cadence.time, from)
    case 'weekly':
      return nextWeekly(cadence.days, cadence.time, from)
    case 'monthly':
      return nextMonthly(cadence.day, cadence.time, from)
    case 'custom':
      return nextCustom(cadence.intervalDays, cadence.time, from)
  }
}

function nextDaily(time: TimeOfDay, from: Date): Date {
  const candidate = atTimeOn(from, time)
  if (candidate.getTime() > from.getTime()) return candidate
  const next = new Date(from)
  next.setDate(next.getDate() + 1)
  return atTimeOn(next, time)
}

function nextWeekly(days: Weekday[], time: TimeOfDay, from: Date): Date {
  const set = new Set(days)
  for (let i = 0; i < 8; i++) {
    const day = new Date(from)
    day.setDate(from.getDate() + i)
    if (!set.has(day.getDay() as Weekday)) continue
    const candidate = atTimeOn(day, time)
    if (candidate.getTime() > from.getTime()) return candidate
  }
  // Fallback — should be unreachable
  return nextDaily(time, from)
}

function nextMonthly(dayOfMonth: number, time: TimeOfDay, from: Date): Date {
  for (let m = 0; m < 24; m++) {
    const base = new Date(from.getFullYear(), from.getMonth() + m, 1)
    const dim = daysInMonth(base.getFullYear(), base.getMonth())
    const day = Math.min(dayOfMonth, dim)
    const candidate = atTimeOn(
      new Date(base.getFullYear(), base.getMonth(), day),
      time
    )
    if (candidate.getTime() > from.getTime()) return candidate
  }
  return nextDaily(time, from)
}

function nextCustom(intervalDays: number, time: TimeOfDay, from: Date): Date {
  const step = Math.max(1, intervalDays)
  // Anchor to local midnight of `from`, then walk forward by interval.
  const start = atTimeOn(from, time)
  if (start.getTime() > from.getTime()) return start
  const next = new Date(from)
  next.setDate(next.getDate() + step)
  return atTimeOn(next, time)
}

/** Upcoming preview line, or undefined when manual. */
export function upcomingLabel(trigger: Trigger, from: Date = new Date()): string | undefined {
  const n = nextRun(trigger, from)
  return n ? formatUpcoming(n) : undefined
}

const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const

/**
 * Activity COMING UP time label: "Tomorrow 9:00 A.M." / "August 1, 4:30 P.M."
 * Same-day occurrences use just the clock time.
 */
export function formatOccurrenceLabel(when: Date, from: Date = new Date()): string {
  const time = formatTime({ hour: when.getHours(), minute: when.getMinutes() })
  const startOfToday = new Date(from)
  startOfToday.setHours(0, 0, 0, 0)
  const startOfWhen = new Date(when)
  startOfWhen.setHours(0, 0, 0, 0)
  const dayDiff = Math.round(
    (startOfWhen.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000)
  )
  if (dayDiff === 0) return time
  if (dayDiff === 1) return `Tomorrow ${time}`
  return `${MONTH_LONG[when.getMonth()]} ${when.getDate()}, ${time}`
}

/** Stable id for a scheduled occurrence row. */
export function comingUpId(workflowId: string, occurrenceAt: Date): string {
  return `act_up_${workflowId}_${occurrenceAt.toISOString()}`
}

/** Preset cadences for the Phase 0 trigger picker (Phase 2 replaces with full editor). */
export const SCHEDULE_PRESETS: ScheduleCadence[] = [
  { kind: 'monthly', day: 1, time: { hour: 9, minute: 0 } },
  { kind: 'weekly', days: [4], time: { hour: 16, minute: 30 } },
  { kind: 'weekly', days: WEEKDAYS, time: { hour: 9, minute: 0 } }
]

export function cadenceKey(c: ScheduleCadence): string {
  return formatSchedule(c)
}
