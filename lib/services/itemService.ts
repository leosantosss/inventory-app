import dbConnect from '@/lib/mongodb'
import Item from '@/lib/models/Item'
import type { Category, Unit } from '@/types'

export async function getItemsByCategory(category: Category) {
  await dbConnect()
  return Item.find({ category }).sort({ name: 1 }).lean()
}

export async function getAllItems() {
  await dbConnect()
  return Item.find({}).sort({ category: 1, name: 1 }).lean()
}

export async function createItem(data: {
  name: string
  category: Category
  unit: Unit
  startingValue: number
  subcategory?: string
  unitsPerBox?: number | null
  boxPrice?: number | null
  minStock?: number | null
}) {
  await dbConnect()
  const item = new Item({
    name: data.name,
    category: data.category,
    unit: data.unit,
    subcategory: data.subcategory ?? null,
    currentCount: data.unit === 'count' ? data.startingValue : null,
    currentLbs: data.unit === 'lbs' ? data.startingValue : null,
    unitsPerBox: data.unitsPerBox ?? null,
    boxPrice: data.boxPrice ?? null,
    minStock: data.minStock ?? null,
  })
  return item.save()
}

export async function updateItemMetadata(
  id: string,
  data: {
    name?: string
    unit?: Unit
    subcategory?: string | null
    unitsPerBox?: number | null
    boxPrice?: number | null
    minStock?: number | null
  }
) {
  await dbConnect()
  return Item.findByIdAndUpdate(id, data, { new: true })
}

export async function deleteItem(id: string) {
  await dbConnect()
  return Item.findByIdAndDelete(id)
}
