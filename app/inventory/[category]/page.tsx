'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, notFound } from 'next/navigation'
import ItemTable from '@/components/ItemTable'
import { TableSkeleton } from '@/components/Skeleton'
import { useUpdateSession } from '@/context/UpdateSessionContext'
import { useDocumentTitle } from '@/lib/useDocumentTitle'
import type { ItemDoc, Category } from '@/types'

const validCategories: Category[] = ['cooler', 'dry', 'bar']

const categoryTitles: Record<Category, string> = {
  cooler: 'Cooler',
  dry: 'Dry Storage',
  bar: 'Bar',
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const { session } = useUpdateSession()
  const [items, setItems] = useState<ItemDoc[]>([])
  const [loading, setLoading] = useState(true)

  useDocumentTitle(categoryTitles[category as Category] ?? 'Inventory')

  if (!validCategories.includes(category as Category)) notFound()

  const loadItems = useCallback(async () => {
    const res = await fetch(`/api/items?category=${category}`)
    const data = await res.json()
    setItems(data)
    setLoading(false)
  }, [category])

  useEffect(() => {
    setLoading(true)
    loadItems()
  }, [loadItems])

  // Refresh after session is submitted
  useEffect(() => {
    if (!session) loadItems()
  }, [session])

  if (loading) {
    return <TableSkeleton />
  }

  return (
    <div className="animate-fade-in">
      <ItemTable
        items={items}
        category={category as Category}
        onRefresh={loadItems}
      />
    </div>
  )
}
