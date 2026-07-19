import { newId } from '../shared/id'
import { isValidEmail } from '../shared/teamFormat'
import type { Invite, Member, Session, Team } from '../shared/types'

/**
 * Mocked team service behind a swappable interface.
 * Onboarding creates/joins; Phase 5 Manage mutates members / invites.
 */

/** Auto-name a fresh team from the signed-in account ("Harry's team"). */
export function createTeam(session: Session): Team {
  const ownerName = session?.displayName?.trim() || 'Your'
  const possessive = ownerName.endsWith('s') ? `${ownerName}'` : `${ownerName}'s`
  const owner: Member = {
    id: newId('member'),
    name: ownerName === 'Your' ? 'You' : ownerName,
    email: session?.email,
    role: 'owner',
    isSelf: true
  }
  // Mock roster so Manage matches the Figma reference until a real backend lands.
  const members: Member[] = [
    owner,
    {
      id: newId('member'),
      name: 'Harry Kang',
      email: 'harry@studio.co',
      role: 'member'
    },
    {
      id: newId('member'),
      name: 'Minhyeok Benjamin Ben Kim',
      email: 'ben@studio.co',
      role: 'member'
    }
  ]
  const invites: Invite[] = [
    {
      id: newId('invite'),
      email: 'kate@studio.co',
      invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      code: 'kate-invite'
    }
  ]
  return {
    id: newId('team'),
    name: `${possessive} team`,
    memberCount: members.length,
    role: 'owner',
    members,
    invites
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

/** The team an invite code resolves to (stub — a fixed multi-member team). */
export function teamFromInvite(raw: string, session?: Session): Team {
  const code = normalizeInviteCode(raw)
  const selfName = session?.displayName?.trim() || 'You'
  const members: Member[] = [
    {
      id: newId('member'),
      name: 'Ryland William Hoskins the Third',
      email: 'ryland@studio.co',
      role: 'owner'
    },
    {
      id: newId('member'),
      name: 'Harry Kang',
      email: 'harry@studio.co',
      role: 'member'
    },
    {
      id: newId('member'),
      name: 'Minhyeok Benjamin Ben Kim',
      email: 'ben@studio.co',
      role: 'member'
    },
    {
      id: newId('member'),
      name: selfName,
      email: session?.email,
      role: 'member',
      isSelf: true
    }
  ]
  return {
    id: `team_${code.slice(0, 8).toLowerCase()}`,
    name: "Harry's team",
    memberCount: members.length,
    role: 'member',
    members,
    invites: []
  }
}

/** Hydrate older persisted teams that predate members / invites. */
export function normalizeTeam(team: Team, session?: Session): Team {
  if (!team) return null
  if (Array.isArray(team.members) && team.members.length > 0) {
    return {
      ...team,
      members: team.members.map((m) => ({ ...m })),
      invites: Array.isArray(team.invites) ? team.invites.map((i) => ({ ...i })) : [],
      memberCount: team.members.length
    }
  }
  // Phase 4 → 5 migration: rebuild a Manage-ready mocked roster.
  if (team.role === 'owner') {
    const rebuilt = createTeam(session)
    return {
      ...rebuilt,
      id: team.id,
      name: team.name,
      role: 'owner'
    }
  }
  const joined = teamFromInvite(team.id, session)
  return {
    ...joined,
    id: team.id,
    name: team.name,
    role: 'member'
  }
}

export function renameTeam(team: Team, name: string): Team {
  if (!team) return null
  const trimmed = name.trim()
  if (!trimmed) return team
  return { ...team, name: trimmed }
}

export function inviteToTeam(team: Team, emailRaw: string): { team: Team; error?: string } {
  if (!team) return { team: null, error: "That doesn't look like an email" }
  const email = emailRaw.trim().toLowerCase()
  if (!isValidEmail(email)) {
    return { team, error: "That doesn't look like an email" }
  }
  // Already a member — treat as a quiet no-op success.
  if (team.members.some((m) => m.email?.toLowerCase() === email)) {
    return { team }
  }
  // Already invited — reset the timestamp (same as resend).
  const existing = team.invites.find((i) => i.email.toLowerCase() === email)
  if (existing) {
    return {
      team: {
        ...team,
        invites: team.invites.map((i) =>
          i.id === existing.id ? { ...i, invitedAt: new Date().toISOString() } : i
        )
      }
    }
  }
  const invite: Invite = {
    id: newId('invite'),
    email,
    invitedAt: new Date().toISOString(),
    code: newId('inv').replace(/^inv_/, '').slice(0, 10)
  }
  return {
    team: {
      ...team,
      invites: [...team.invites, invite]
    }
  }
}

export function resendInvite(team: Team, inviteId: string): Team {
  if (!team) return null
  return {
    ...team,
    invites: team.invites.map((i) =>
      i.id === inviteId ? { ...i, invitedAt: new Date().toISOString() } : i
    )
  }
}

export function revokeInvite(team: Team, inviteId: string): Team {
  if (!team) return null
  return {
    ...team,
    invites: team.invites.filter((i) => i.id !== inviteId)
  }
}

/**
 * Remove a non-owner member. Activity / past runs stay attributed;
 * scheduled team runs for that member would stop (no team-scoped
 * workflows yet — roster update only).
 */
export function removeMember(team: Team, memberId: string): Team {
  if (!team) return null
  const target = team.members.find((m) => m.id === memberId)
  if (!target || target.role === 'owner' || target.isSelf) return team
  const members = team.members.filter((m) => m.id !== memberId)
  return {
    ...team,
    members,
    memberCount: members.length
  }
}
