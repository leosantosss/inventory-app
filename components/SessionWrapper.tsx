'use client'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { ToastProvider } from '@/context/ToastContext'

export default function SessionWrapper({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <ToastProvider>{children}</ToastProvider>
    </SessionProvider>
  )
}
