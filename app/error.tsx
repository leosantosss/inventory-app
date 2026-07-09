'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-forest px-6 py-12 text-center"
      style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
    >
      <h1 className="font-display text-white text-2xl font-bold tracking-wide mb-2">Something went wrong</h1>
      <p className="text-forest-100 text-sm mb-8 max-w-xs">
        An unexpected error occurred. Try again, or reload the page if it keeps happening.
      </p>
      <button
        onClick={reset}
        className="bg-white text-forest rounded-xl px-6 py-3 text-sm font-semibold shadow-lg hover:bg-forest-50 transition-colors"
      >
        Try Again
      </button>
    </main>
  )
}
