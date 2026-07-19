import { useEffect, useState } from 'react'
import type { OnboardingStep, PermissionsState, Session, Team } from '../state/types'
import WelcomeStep from './WelcomeStep'
import TeamStep from './TeamStep'
import PermissionsStep from './PermissionsStep'

const UNKNOWN_PERMS: PermissionsState = {
  screen: 'unknown',
  accessibility: 'unknown',
  microphone: 'unknown'
}

/**
 * Onboarding overlay root — a hard gate (no dismiss; quit only via tray).
 * Step progress lives in the shared store so relaunch resumes the same card;
 * this component simply mirrors it and routes to the matching step.
 */
export default function OnboardingApp() {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [session, setSession] = useState<Session>(null)
  const [micSkipped, setMicSkipped] = useState(false)
  const [permissions, setPermissions] = useState<PermissionsState>(UNKNOWN_PERMS)
  const [pendingInvite, setPendingInvite] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    window.ghostBridge?.getSnapshot?.().then((snap) => {
      if (cancelled || !snap) return
      setStep(snap.onboardingStep)
      setSession(snap.session)
      setMicSkipped(snap.micSkipped)
    })
    window.ghostBridge?.getPermissions?.().then((p) => {
      if (!cancelled && p) setPermissions(p)
    })

    const offStore = window.ghostBridge?.onStoreChanged?.((snap) => {
      setStep(snap.onboardingStep)
      setSession(snap.session)
      setMicSkipped(snap.micSkipped)
    })
    const offPerms = window.ghostBridge?.onPermissionsChanged?.((p) => setPermissions(p))
    const offLink = window.ghostBridge?.onDeepLink?.((link) => {
      // Arrived via an invite link: pre-fill Join. Magic / Google links advance
      // the step in main, which propagates back through the store subscription.
      if (link.kind === 'invite') setPendingInvite(link.code)
    })

    return () => {
      cancelled = true
      offStore?.()
      offPerms?.()
      offLink?.()
    }
  }, [])

  return (
    <div className="onb-root">
      {step === 'welcome' && <WelcomeStep session={session} />}
      {step === 'team' && (
        <TeamStep
          session={session}
          pendingInvite={pendingInvite}
          onBack={() => window.ghostBridge?.setOnboardingStep?.('welcome')}
        />
      )}
      {(step === 'permissions' || step === 'complete') && (
        <PermissionsStep permissions={permissions} micSkipped={micSkipped} />
      )}
    </div>
  )
}
