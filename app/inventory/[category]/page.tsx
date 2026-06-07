'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, notFound } from 'next/navigation'
import ItemTable from '@/components/ItemTable'
import { useUpdateSession } from '@/context/UpdateSessionContext'
import type { ItemDoc, Category } from '@/types'

const validCategories: Category[] = ['cooler', 'dry', 'bar']

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const { session } = useUpdateSession()
  const [items, setItems] = useState<ItemDoc[]>([])
  const [loading, setLoading] = useState(true)

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
    return <div className="text-center text-gray-400 py-20">Loading…</div>
  }

  return (
    <ItemTable
      items={items}
      category={category as Category}
      onRefresh={loadItems}
    />
  )
}
