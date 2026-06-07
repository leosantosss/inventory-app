'use client'
import { UpdateSessionProvider } from '@/context/UpdateSessionContext'
import TabBar from '@/components/TabBar'
import UpdateSessionBanner from '@/components/UpdateSessionBanner'

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <UpdateSessionProvider>
      <div className="min-h-screen bg-gray-50 pb-24">
        <UpdateSessionBanner />
        <main className="max-w-3xl mx-auto px-4 pt-4">{children}</main>
      </div>
      <TabBar />
    </UpdateSessionProvider>
  )
}
