import type { Invite } from './types'

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())
}

export function isInviteExpired(invite: Invite, now: Date = new Date()): boolean {
  return now.getTime() - Date.parse(invite.invitedAt) >= INVITE_TTL_MS
}

/** "invited just now" / "invited 2 days ago" / "expired". */
export function formatInviteAge(invite: Invite, now: Date = new Date()): string {
  if (isInviteExpired(invite, now)) return 'expired'
  const ms = Math.max(0, now.getTime() - Date.parse(invite.invitedAt))
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return 'invited just now'
  if (minutes < 60) return `invited ${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return hours === 1 ? 'invited 1 hour ago' : `invited ${hours} hours ago`
  const days = Math.floor(hours / 24)
  return days === 1 ? 'invited 1 day ago' : `invited ${days} days ago`
}

/** First token for remove-confirm copy ("Remove Harry from the team?"). */
export function memberShortName(name: string): string {
  const first = name.trim().split(/\s+/)[0]
  return first || name
}
