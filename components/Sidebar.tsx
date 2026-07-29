'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import type { Category, ItemDoc } from '@/types'

const inventoryLinks: { label: string; category: Category }[] = [
  { label: 'Cooler', category: 'cooler' },
  { label: 'Bar', category: 'bar' },
  { label: 'Dry Storage', category: 'dry' },
]

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function InventoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" />
    </svg>
  )
}

function PricesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 16 14" />
    </svg>
  )
}

function ImportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 21h14" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${open ? 'rotate-90' : ''}`}
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  )
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${collapsed ? 'rotate-180' : ''}`}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function Logo() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.png" alt="Chycho's" className="w-9 h-9 object-contain shrink-0 bg-white" />
}

function NavContent({ collapsed, onNavigate, counts }: { collapsed: boolean; onNavigate?: () => void; counts: Record<Category, number> | null }) {
  const pathname = usePathname()
  const inventoryActive = pathname.startsWith('/inventory/cooler') || pathname.startsWith('/inventory/bar') || pathname.startsWith('/inventory/dry')
  const [inventoryOpen, setInventoryOpen] = useState(inventoryActive)

  const dashboardActive = pathname.startsWith('/inventory/dashboard')
  const pricesActive = pathname.startsWith('/inventory/prices')
  const historyActive = pathname.startsWith('/inventory/history')
  const importActive = pathname.startsWith('/inventory/import')

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors border-l-2 ${
      active
        ? 'bg-crimson-50 text-crimson-800 border-crimson'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 border-transparent'
    }`

  return (
    <nav className="flex-1 flex flex-col overflow-y-auto py-2">
      <Link href="/inventory/dashboard" onClick={onNavigate} className={linkClass(dashboardActive)}>
        <DashboardIcon />
        {!collapsed && <span>Dashboard</span>}
      </Link>

      <button
        onClick={() => setInventoryOpen((v) => !v)}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
          inventoryActive ? 'text-crimson-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
        }`}
      >
        <InventoryIcon />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Inventory</span>
            <ChevronIcon open={inventoryOpen} />
          </>
        )}
      </button>

      {inventoryOpen && !collapsed && (
        <div className="ml-6 flex flex-col border-l border-gray-200 pl-3">
          {inventoryLinks.map((link) => {
            const href = `/inventory/${link.category}`
            const active = pathname.startsWith(href)
            return (
              <Link
                key={link.category}
                href={href}
                onClick={onNavigate}
                className={`flex items-center justify-between px-3 py-1.5 text-sm transition-colors ${
                  active ? 'bg-crimson-50 text-crimson-800 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span>{link.label}</span>
                {counts && <span className="text-xs text-gray-400">{counts[link.category]}</span>}
              </Link>
            )
          })}
        </div>
      )}

      <Link href="/inventory/import" onClick={onNavigate} className={linkClass(importActive)}>
        <ImportIcon />
        {!collapsed && <span>Import Invoice</span>}
      </Link>

      <Link href="/inventory/prices" onClick={onNavigate} className={linkClass(pricesActive)}>
        <PricesIcon />
        {!collapsed && <span>Prices</span>}
      </Link>

      <Link href="/inventory/history" onClick={onNavigate} className={linkClass(historyActive)}>
        <HistoryIcon />
        {!collapsed && <span>History</span>}
      </Link>
    </nav>
  )
}

export default function Sidebar() {
  const { mobileOpen, closeMobile } = useSidebar()
  const [collapsed, setCollapsed] = useState(false)
  const [counts, setCounts] = useState<Record<Category, number> | null>(null)

  useEffect(() => {
    fetch('/api/items')
      .then((res) => res.json())
      .then((items: ItemDoc[]) => {
        setCounts({
          cooler: items.filter((i) => i.category === 'cooler').length,
          bar: items.filter((i) => i.category === 'bar').length,
          dry: items.filter((i) => i.category === 'dry').length,
        })
      })
      .catch(() => {})
  }, [])

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-gray-200 sticky top-0 h-screen shrink-0 transition-all duration-200 relative ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div className={`flex items-center h-[61px] px-4 border-b border-gray-200 gap-2 ${collapsed ? 'justify-center' : ''}`}>
          <Logo />
          {!collapsed && (
            <span className="font-display text-gray-900 text-base font-bold tracking-widest truncate">Chycho&apos;s</span>
          )}
        </div>
        <NavContent collapsed={collapsed} counts={counts} />

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors z-10"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <CollapseIcon collapsed={collapsed} />
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" onClick={closeMobile}>
          <div className="bg-black/50 absolute inset-0 animate-backdrop-in" />
          <div
            className="relative bg-white w-64 h-full flex flex-col shadow-xl animate-drawer-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
              <div className="flex items-center gap-2 min-w-0">
                <Logo />
                <span className="font-display text-gray-900 text-base font-bold tracking-widest truncate">Chycho&apos;s</span>
              </div>
              <button
                onClick={closeMobile}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <NavContent collapsed={false} onNavigate={closeMobile} counts={counts} />
          </div>
        </div>
      )}
    </>
  )
}
