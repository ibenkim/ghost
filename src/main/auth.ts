import { shell } from 'electron'
import type { Session } from '../shared/types'

/**
 * Mocked auth service behind a swappable interface. Real Google OAuth and
 * magic-link delivery land later (see reference3 / TODO "Real auth backend");
 * these stubs exercise the same flow — system-browser round-trip for Google
 * and a deep-link return for the email magic link.
 */

const MOCK_ACCOUNT = { email: 'harry@yuh.app', displayName: 'Harry' }

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function titleCase(local: string): string {
  return local.charAt(0).toUpperCase() + local.slice(1)
}

/** Derive a display name from an email local-part. */
export function sessionForEmail(email: string): Session {
  const local = (email.split('@')[0] || 'there').replace(/[._-]+/g, ' ').trim()
  return { email, displayName: titleCase(local || 'there') }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** Continue with Google → system browser round-trip → signed-in session. */
export async function googleAuth(): Promise<Session> {
  try {
    await shell.openExternal(
      'https://accounts.google.com/o/oauth2/v2/auth?client_id=yuh-stub&scope=email'
    )
  } catch {
    // Browser failing to open shouldn't block the mocked round-trip.
  }
  await delay(600)
  return { ...MOCK_ACCOUNT }
}
