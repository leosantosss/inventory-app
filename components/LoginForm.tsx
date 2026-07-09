'use client'
import { useState, useEffect, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [idleNotice, setIdleNotice] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('reason') === 'idle') {
      setIdleNotice(true)
    }
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = e.currentTarget
    const res = await signIn('credentials', {
      username: (form.elements.namedItem('username') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      router.push('/inventory/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
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
        disabled={loading}
        className="bg-crimson hover:bg-crimson-700 text-white rounded-xl py-3.5 text-base font-semibold disabled:opacity-50 transition active:scale-[0.98] mt-1"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
