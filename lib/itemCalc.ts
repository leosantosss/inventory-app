import type { Unit } from '@/types'

export interface ItemLike {
  unit: Unit
  currentCount: number | null
  currentLbs: number | null
  unitsPerBox?: number | null
  boxPrice?: number | null
  minStock?: number | null
}

export function itemQuantity(item: ItemLike): number | null {
  return item.unit === 'count' ? item.currentCount : item.currentLbs
}

export function pricePerUnit(item: ItemLike): number | null {
  if (item.boxPrice != null && item.unitsPerBox) return item.boxPrice / item.unitsPerBox
  return null
}

export function lineValue(item: ItemLike): number {
  const q = itemQuantity(item) ?? 0
  const p = pricePerUnit(item)
  return p != null ? q * p : 0
}

export function isLowStock(item: ItemLike): boolean {
  const q = itemQuantity(item)
  return item.minStock != null && q != null && q <= item.minStock
}
