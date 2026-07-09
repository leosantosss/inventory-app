'use client'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'
import { UpdateSessionProvider } from '@/context/UpdateSessionContext'
import Sidebar from '@/components/Sidebar'
import UpdateSessionBanner from '@/components/UpdateSessionBanner'
import ProfileMenu from '@/components/ProfileMenu'
import IdleTimeout from '@/components/IdleTimeout'

function HamburgerButton() {
  const { toggleMobile } = useSidebar()
  return (
    <button
      onClick={toggleMobile}
      className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-white hover:bg-white/15 transition-colors"
      aria-label="Open menu"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  )
}

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <UpdateSessionProvider>
        <IdleTimeout />
        <div className="min-h-screen flex bg-forest-50">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <UpdateSessionBanner />
            <header className="bg-forest px-4 py-3 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <HamburgerButton />
                <span className="font-display text-white text-lg font-bold tracking-widest uppercase">
                  Inventory
                </span>
              </div>
              <ProfileMenu />
            </header>
            <main className="px-4 pt-4 pb-8">{children}</main>
          </div>
        </div>
      </UpdateSessionProvider>
    </SidebarProvider>
  )
}
