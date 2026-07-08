'use client'
import { useEffect, useState, useCallback } from 'react'
import PricesTable from '@/components/PricesTable'
import type { ItemDoc } from '@/types'

export default function PricesPage() {
  const [items, setItems] = useState<ItemDoc[]>([])
  const [loading, setLoading] = useState(true)

  const loadItems = useCallback(async () => {
    const res = await fetch('/api/items')
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  if (loading) {
    return <div className="text-center text-gray-400 py-20">Loading…</div>
  }

  return <PricesTable items={items} onRefresh={loadItems} />
}
