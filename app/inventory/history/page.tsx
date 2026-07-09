'use client'
import { useEffect, useState } from 'react'
import HistoryFeed from '@/components/HistoryFeed'
import PriceHistoryFeed from '@/components/PriceHistoryFeed'
import { TableSkeleton } from '@/components/Skeleton'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { HistoryEntry, PriceLogEntry } from '@/types'

type Tab = 'inventory' | 'prices'

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>('inventory')
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [priceEntries, setPriceEntries] = useState<PriceLogEntry[]>([])
  const [priceLoading, setPriceLoading] = useState(true)
  const [priceLoaded, setPriceLoaded] = useState(false)

  useDocumentTitle('History')

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false) })
  }, [])

  useEffect(() => {
    if (tab !== 'prices' || priceLoaded) return
    fetch('/api/price-history')
      .then((r) => r.json())
      .then((data) => { setPriceEntries(data); setPriceLoading(false); setPriceLoaded(true) })
  }, [tab, priceLoaded])

  const showSkeleton = tab === 'inventory' ? loading : priceLoading

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4 print-hide">
        <h1 className="font-display text-2xl font-bold text-forest">History</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-600 text-white rounded-xl text-sm font-semibold shadow-sm transition active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / PDF
        </button>
      </div>

      <div className="flex gap-2 mb-4 print-hide">
        {(['inventory', 'prices'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              tab === t ? 'bg-forest text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {t === 'inventory' ? 'Inventory' : 'Prices'}
          </button>
        ))}
      </div>

      {showSkeleton ? (
        <TableSkeleton rows={5} />
      ) : tab === 'inventory' ? (
        <HistoryFeed entries={entries} hideTitle />
      ) : (
        <PriceHistoryFeed entries={priceEntries} />
      )}
    </div>
  )
}
