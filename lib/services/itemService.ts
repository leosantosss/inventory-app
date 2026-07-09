import dbConnect from '@/lib/mongodb'
import Item from '@/lib/models/Item'
import { recordPriceChange } from '@/lib/services/priceLogService'
import type { PriceField, PriceChangeSource } from '@/lib/models/PriceLog'
import type { Category, Unit } from '@/types'

const PRICE_FIELDS: PriceField[] = ['unitsPerBox', 'boxPrice', 'minStock']

export interface PriceActor {
  userId: string
  displayName: string
  source: PriceChangeSource
}

interface PriceFieldSnapshot {
  unitsPerBox: number | null
  boxPrice: number | null
  minStock: number | null
}

function diffPriceFields(before: PriceFieldSnapshot, after: PriceFieldSnapshot) {
  return PRICE_FIELDS.filter((field) => before[field] !== after[field]).map((field) => ({
    field,
    oldValue: before[field],
    newValue: after[field],
  }))
}

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
  },
  actor?: PriceActor
) {
  await dbConnect()

  if (!actor) {
    return Item.findByIdAndUpdate(id, data, { new: true })
  }

  const existing = await Item.findById(id)
  const updated = await Item.findByIdAndUpdate(id, data, { new: true })

  if (existing && updated) {
    const changes = diffPriceFields(existing, updated)
    await recordPriceChange({
      itemId: String(updated._id),
      itemName: updated.name,
      category: updated.category,
      userId: actor.userId,
      displayName: actor.displayName,
      source: actor.source,
      changes,
    })
  }

  return updated
}

export async function bulkUpdatePrices(
  rows: {
    name: string
    category: Category
    unitsPerBox: number | null
    boxPrice: number | null
    minStock: number | null
  }[],
  actor: PriceActor
): Promise<{ updated: number; skipped: string[] }> {
  await dbConnect()

  let updated = 0
  const skipped: string[] = []

  for (const row of rows) {
    const existing = await Item.findOne({
      category: row.category,
      name: { $regex: `^${row.name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    })

    if (!existing) {
      skipped.push(row.name)
      continue
    }

    const after = {
      unitsPerBox: row.unitsPerBox,
      boxPrice: row.boxPrice,
      minStock: row.minStock,
    }
    const changes = diffPriceFields(existing, after)

    if (changes.length > 0) {
      existing.unitsPerBox = row.unitsPerBox
      existing.boxPrice = row.boxPrice
      existing.minStock = row.minStock
      await existing.save()

      await recordPriceChange({
        itemId: String(existing._id),
        itemName: existing.name,
        category: existing.category,
        userId: actor.userId,
        displayName: actor.displayName,
        source: actor.source,
        changes,
      })
    }

    updated++
  }

  return { updated, skipped }
}

export async function deleteItem(id: string) {
  await dbConnect()
  return Item.findByIdAndDelete(id)
}
