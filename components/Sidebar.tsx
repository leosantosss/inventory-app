'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import type { Category } from '@/types'

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

function NavContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname()
  const [inventoryOpen, setInventoryOpen] = useState(pathname.startsWith('/inventory/cooler') || pathname.startsWith('/inventory/bar') || pathname.startsWith('/inventory/dry'))

  const dashboardActive = pathname.startsWith('/inventory/dashboard')
  const pricesActive = pathname.startsWith('/inventory/prices')
  const historyActive = pathname.startsWith('/inventory/history')

  return (
    <nav className="flex-1 px-2 py-3 flex flex-col gap-1 overflow-y-auto">
      <Link
        href="/inventory/dashboard"
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          dashboardActive ? 'bg-white/15 text-white border-l-2 border-crimson' : 'text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent'
        }`}
      >
        <DashboardIcon />
        {!collapsed && <span>Dashboard</span>}
      </Link>

      <button
        onClick={() => setInventoryOpen((v) => !v)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
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
        <div className="ml-6 flex flex-col gap-0.5 border-l border-white/10 pl-3">
          {inventoryLinks.map((link) => {
            const href = `/inventory/${link.category}`
            const active = pathname.startsWith(href)
            return (
              <Link
                key={link.category}
                href={href}
                onClick={onNavigate}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? 'bg-white/15 text-white font-semibold' : 'text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      )}

      <Link
        href="/inventory/prices"
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          pricesActive ? 'bg-white/15 text-white border-l-2 border-crimson' : 'text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent'
        }`}
      >
        <PricesIcon />
        {!collapsed && <span>Prices</span>}
      </Link>

      <Link
        href="/inventory/history"
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          historyActive ? 'bg-white/15 text-white border-l-2 border-crimson' : 'text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent'
        }`}
      >
        <HistoryIcon />
        {!collapsed && <span>History</span>}
      </Link>
    </nav>
  )
}

export default function Sidebar() {
  const { mobileOpen, closeMobile } = useSidebar()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`hidden md:flex flex-col bg-forest sticky top-0 h-screen shrink-0 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <div className={`flex items-center h-14 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <span className="font-display text-white text-base font-bold tracking-widest uppercase">Chychos</span>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <CollapseIcon collapsed={collapsed} />
          </button>
        </div>
        <NavContent collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" onClick={closeMobile}>
          <div className="bg-black/50 absolute inset-0 animate-backdrop-in" />
          <div
            className="relative bg-forest w-64 h-full flex flex-col shadow-xl animate-drawer-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between h-14 px-4">
              <span className="font-display text-white text-base font-bold tracking-widest uppercase">Chychos</span>
              <button
                onClick={closeMobile}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <NavContent collapsed={false} onNavigate={closeMobile} />
          </div>
        </div>
      )}
    </>
  )
}
