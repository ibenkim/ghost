import { comingUpId, formatOccurrenceLabel, nextRun } from './schedule'
import type { ActivityEntry, Workflow } from './types'

/**
 * Build COMING UP rows from On workflows with a cadence.
 * Preserves prior skip marks whose occurrence key still matches.
 */
export function buildComingUpEntries(
  workflows: Workflow[],
  prior: ActivityEntry[] = [],
  from: Date = new Date()
): ActivityEntry[] {
  const skipped = new Set(
    prior.filter((a) => a.group === 'coming-up' && a.skipped).map((a) => a.id)
  )

  const entries: ActivityEntry[] = []
  for (const wf of workflows) {
    if (wf.status !== 'on' || !wf.trigger.cadence) continue
    const when = nextRun(wf.trigger, from)
    if (!when) continue
    const id = comingUpId(wf.id, when)
    entries.push({
      id,
      workflowId: wf.id,
      name: wf.name,
      timeLabel: formatOccurrenceLabel(when, from),
      group: 'coming-up',
      kind: 'scheduled',
      occurrenceAt: when.toISOString(),
      skipped: skipped.has(id)
    })
  }

  entries.sort((a, b) => {
    const ta = a.occurrenceAt ? Date.parse(a.occurrenceAt) : 0
    const tb = b.occurrenceAt ? Date.parse(b.occurrenceAt) : 0
    return ta - tb
  })
  return entries
}

/** Merge regenerated COMING UP with non-coming-up activity rows. */
export function mergeComingUp(
  activity: ActivityEntry[],
  workflows: Workflow[],
  from: Date = new Date()
): ActivityEntry[] {
  const rest = activity.filter((a) => a.group !== 'coming-up')
  return [...buildComingUpEntries(workflows, activity, from), ...rest]
}
