'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Cooler', href: '/inventory/cooler' },
  { label: 'Dry Storage', href: '/inventory/dry' },
  { label: 'Bar', href: '/inventory/bar' },
  { label: 'History', href: '/inventory/history' },
]

export default function TabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-forest flex" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors border-t-2 ${
              active
                ? 'text-white border-crimson'
                : 'text-white/50 border-transparent'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
