import { newId } from '../shared/id'
import type { Session, Team } from '../shared/types'

/**
 * Mocked team service behind a swappable interface. Introduces the minimal
 * `Team` model onboarding needs; Phase 5 extends it with members / invites.
 */

/** Auto-name a fresh team from the signed-in account ("Harry's team"). */
export function createTeam(session: Session): Team {
  const owner = session?.displayName?.trim() || 'Your'
  const possessive = owner.endsWith('s') ? `${owner}'` : `${owner}'s`
  return {
    id: newId('team'),
    name: `${possessive} team`,
    memberCount: 1,
    role: 'owner'
  }
}

/** Pull an invite code out of a raw link or bare code. */
export function normalizeInviteCode(raw: string): string {
  const match = raw.trim().match(/invite\/([A-Za-z0-9-]+)/i)
  return (match ? match[1] : raw.trim()).replace(/\s+/g, '')
}

export function isValidInviteCode(raw: string): boolean {
  const code = normalizeInviteCode(raw)
  return /^[A-Za-z0-9-]{6,}$/.test(code) && !code.toLowerCase().includes('invalid')
}

/** The team an invite code resolves to (stub — a fixed 4-member team). */
export function teamFromInvite(raw: string): Team {
  const code = normalizeInviteCode(raw)
  return {
    id: `team_${code.slice(0, 8).toLowerCase()}`,
    name: "Harry's team",
    memberCount: 4,
    role: 'member'
  }
}
