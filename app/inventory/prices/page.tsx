'use client'
import { useEffect, useState, useCallback } from 'react'
import PricesTable from '@/components/PricesTable'
import { TableSkeleton } from '@/components/Skeleton'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { ItemDoc } from '@/types'

export default function PricesPage() {
  const [items, setItems] = useState<ItemDoc[]>([])
  const [loading, setLoading] = useState(true)

  useDocumentTitle('Prices')

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
    return <TableSkeleton />
  }

  return <PricesTable items={items} onRefresh={loadItems} />
}
