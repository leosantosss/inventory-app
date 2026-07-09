'use client'
import { useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'

const IDLE_LIMIT_MS = 15 * 60 * 1000
const CHECK_INTERVAL_MS = 30 * 1000
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'] as const

export default function IdleTimeout() {
  const { status } = useSession()
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    if (status !== 'authenticated') return

    function markActive() {
      lastActivityRef.current = Date.now()
    }
    markActive()

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, markActive, { passive: true }))

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current >= IDLE_LIMIT_MS) {
        signOut({ callbackUrl: '/login?reason=idle' })
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, markActive))
      clearInterval(interval)
    }
  }, [status])

  return null
}
