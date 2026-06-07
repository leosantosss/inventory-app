'use client'
import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      router.push('/inventory/cooler')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <input
        name="username"
        type="text"
        placeholder="Username"
        autoCapitalize="none"
        className="border border-gray-300 rounded-xl px-4 py-3 text-lg"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        className="border border-gray-300 rounded-xl px-4 py-3 text-lg"
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded-xl py-3 text-lg font-semibold disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
