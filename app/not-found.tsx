import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-forest px-6 py-12 text-center"
      style={{ background: 'linear-gradient(160deg, #1B4332 0%, #2D6A4F 100%)' }}
    >
      <p className="font-display text-white/40 text-7xl font-bold tracking-wide mb-2">404</p>
      <h1 className="font-display text-white text-2xl font-bold tracking-wide mb-2">Page not found</h1>
      <p className="text-forest-100 text-sm mb-8 max-w-xs">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/inventory/dashboard"
        className="bg-white text-forest rounded-xl px-6 py-3 text-sm font-semibold shadow-lg hover:bg-forest-50 transition-colors"
      >
        Back to Dashboard
      </Link>
    </main>
  )
}
