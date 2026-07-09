'use client'
import { useEffect, useState } from 'react'
import HistoryFeed from '@/components/HistoryFeed'
import { TableSkeleton } from '@/components/Skeleton'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { HistoryEntry } from '@/types'

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useDocumentTitle('History')

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false) })
  }, [])

  if (loading) return <TableSkeleton rows={5} />

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print-hide">
        <h1 className="font-display text-2xl font-bold text-forest">History</h1>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-forest hover:bg-forest-600 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print / PDF
        </button>
      </div>
      <HistoryFeed entries={entries} hideTitle />
    </div>
  )
}
