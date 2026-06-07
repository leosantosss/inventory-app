'use client'
import { useEffect, useState } from 'react'
import HistoryFeed from '@/components/HistoryFeed'
import type { HistoryEntry } from '@/types'

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history')
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false) })
  }, [])

  if (loading) return <div className="text-center text-gray-400 py-20">Loading…</div>
  return <HistoryFeed entries={entries} />
}
