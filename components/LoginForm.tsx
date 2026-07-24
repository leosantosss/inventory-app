'use client'
import { useState, useEffect, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Status = 'idle' | 'loading' | 'success'

function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5L20 7" pathLength="1" strokeDasharray="1" strokeDashoffset="1" className="animate-check-draw" />
    </svg>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [fadeOut, setFadeOut] = useState(false)
  const [idleNotice, setIdleNotice] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('reason') === 'idle') {
      setIdleNotice(true)
    }
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setStatus('loading')
    const form = e.currentTarget
    const res = await signIn('credentials', {
      username: (form.elements.namedItem('username') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      redirect: false,
    })
    if (res?.ok) {
      setStatus('success')
      setTimeout(() => setFadeOut(true), 400)
      setTimeout(() => router.push('/inventory/dashboard'), 650)
    } else {
      setStatus('idle')
      setError('Invalid username or password')
    }
  }

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12 transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Chycho's" className="w-40 h-auto mb-3" />
          <p className="text-gray-400 text-sm tracking-widest uppercase">
            Inventory Management
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-8 py-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {idleNotice && (
              <p className="text-forest text-sm font-medium bg-forest-50 px-3 py-2 rounded-lg">
                You were signed out after 15 minutes of inactivity.
              </p>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                name="username"
                type="text"
                placeholder="Enter username"
                autoCapitalize="none"
                autoComplete="username"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition"
                required
              />
            </div>
            {error && (
              <p className="text-crimson text-sm font-medium bg-crimson-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={status !== 'idle'}
              className={`relative rounded-xl py-3.5 text-base font-semibold text-white transition-colors duration-300 active:scale-[0.98] mt-1 disabled:cursor-not-allowed ${
                status === 'success' ? 'bg-forest' : 'bg-crimson hover:bg-crimson-700'
              }`}
            >
              <span className={`transition-opacity duration-150 ${status !== 'idle' ? 'opacity-0' : 'opacity-100'}`}>
                Sign In
              </span>
              {status === 'loading' && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </span>
              )}
              {status === 'success' && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <CheckIcon />
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
