'use client'
import { UpdateSessionProvider } from '@/context/UpdateSessionContext'
import TabBar from '@/components/TabBar'
import UpdateSessionBanner from '@/components/UpdateSessionBanner'
import ProfileMenu from '@/components/ProfileMenu'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <UpdateSessionProvider>
      <div className="min-h-screen bg-forest-50 pb-24">
        <UpdateSessionBanner />
        <header className="bg-forest px-4 py-3 flex items-center justify-between shadow-sm">
          <span className="font-display text-white text-lg font-bold tracking-widest uppercase">
            Inventory
          </span>
          <ProfileMenu />
        </header>
        <main className="px-4 pt-4">{children}</main>
      </div>
      <TabBar />
    </UpdateSessionProvider>
  )
}
