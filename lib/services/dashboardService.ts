import { getAllItems } from './itemService'
import { getRecentHistory } from './historyService'
import { itemQuantity, lineValue, isLowStock } from '@/lib/itemCalc'
import type { Category } from '@/types'

const categoryLabels: Record<Category, string> = {
  cooler: 'Cooler',
  bar: 'Bar',
  dry: 'Dry Storage',
}

export async function getDashboardStats() {
  const [items, history] = await Promise.all([getAllItems(), getRecentHistory()])

  let totalValue = 0
  const valueByCategory: Record<Category, number> = { cooler: 0, bar: 0, dry: 0 }
  const lowStock: {
    _id: string
    name: string
    category: Category
    categoryLabel: string
    quantity: number | null
    unit: string
    minStock: number | null
  }[] = []

  for (const item of items) {
    const value = lineValue(item)
    totalValue += value
    valueByCategory[item.category as Category] += value

    if (isLowStock(item)) {
      lowStock.push({
        _id: item._id.toString(),
        name: item.name,
        category: item.category as Category,
        categoryLabel: categoryLabels[item.category as Category],
        quantity: itemQuantity(item),
        unit: item.unit,
        minStock: item.minStock,
      })
    }
  }

  lowStock.sort((a, b) => (a.quantity ?? 0) - (a.minStock ?? 0) - ((b.quantity ?? 0) - (b.minStock ?? 0)))

  return {
    totalItems: items.length,
    totalValue,
    valueByCategory: (Object.keys(valueByCategory) as Category[]).map((category) => ({
      category,
      label: categoryLabels[category],
      value: valueByCategory[category],
    })),
    lowStock,
    recentActivity: history.slice(0, 5),
  }
}
