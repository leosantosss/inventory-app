import dbConnect from '@/lib/mongodb'
import Session from '@/lib/models/Session'
import Log from '@/lib/models/Log'
import { pricePerUnit, type ItemLike } from '@/lib/itemCalc'
import { CATEGORY_COLORS, type SankeyNode, type SankeyData, type MonthlyFlowPoint } from '@/lib/inventoryFlowTypes'
import type { Category } from '@/types'

const categoryLabels: Record<Category, string> = {
  cooler: 'Cooler',
  bar: 'Bar',
  dry: 'Dry Storage',
}

const CATEGORY_ORDER: Category[] = ['cooler', 'bar', 'dry']
const ROOT_COLOR = '#374151'

// Items per category shown individually in the Sankey before the rest are folded
// into a single "Other" node — keeps the diagram legible for large catalogs.
const TOP_ITEMS_PER_CATEGORY = 6

type FlowItem = ItemLike & {
  _id: { toString(): string }
  name: string
  category: Category
}

export type { SankeyData, MonthlyFlowPoint }

export function getValueBreakdown(items: FlowItem[]): SankeyData {
  const nodes: SankeyNode[] = [{ name: 'Total Value', color: ROOT_COLOR, depth: 0 }]
  const links: { source: number; target: number; value: number }[] = []

  for (const category of CATEGORY_ORDER) {
    const color = CATEGORY_COLORS[category]
    const categoryItems = items
      .map((item) => ({ item, value: lineValueOf(item) }))
      .filter((row) => row.item.category === category && row.value > 0)
      .sort((a, b) => b.value - a.value)

    const categoryTotal = categoryItems.reduce((sum, row) => sum + row.value, 0)
    if (categoryTotal <= 0) continue

    const categoryNodeIndex = nodes.length
    nodes.push({ name: categoryLabels[category], color, depth: 1 })
    links.push({ source: 0, target: categoryNodeIndex, value: categoryTotal })

    const top = categoryItems.slice(0, TOP_ITEMS_PER_CATEGORY)
    const rest = categoryItems.slice(TOP_ITEMS_PER_CATEGORY)

    for (const row of top) {
      const itemNodeIndex = nodes.length
      nodes.push({ name: row.item.name, color, depth: 2 })
      links.push({ source: categoryNodeIndex, target: itemNodeIndex, value: row.value })
    }

    const restTotal = rest.reduce((sum, row) => sum + row.value, 0)
    if (restTotal > 0) {
      const otherNodeIndex = nodes.length
      nodes.push({ name: `Other (${rest.length})`, color, depth: 2 })
      links.push({ source: categoryNodeIndex, target: otherNodeIndex, value: restTotal })
    }
  }

  return { nodes, links }
}

function lineValueOf(item: ItemLike): number {
  const q = item.unit === 'count' ? item.currentCount : item.currentLbs
  const p = pricePerUnit(item)
  return p != null ? (q ?? 0) * p : 0
}

type LeanSession = { _id: { toString(): string }; direction: 'in' | 'out'; createdAt?: Date }
type LeanLog = { sessionId: { toString(): string }; itemId: { toString(): string }; delta: number; unitCost: number | null; createdAt?: Date }

export async function getMonthlyFlow(items: FlowItem[], monthsBack = 6): Promise<MonthlyFlowPoint[]> {
  await dbConnect()

  const priceByItemId = new Map(items.map((item) => [item._id.toString(), pricePerUnit(item)]))

  const now = new Date()
  const monthStarts: Date[] = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    monthStarts.push(new Date(now.getFullYear(), now.getMonth() - i, 1))
  }
  const since = monthStarts[0]

  const sessions = (await Session.find({ createdAt: { $gte: since } }).lean()) as LeanSession[]
  const directionBySessionId = new Map(sessions.map((s) => [s._id.toString(), s.direction]))
  const sessionIds = sessions.map((s) => s._id)

  const logs = (await Log.find({ sessionId: { $in: sessionIds } }).lean()) as LeanLog[]

  const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`
  const monthLabel = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' })

  const buckets = new Map(monthStarts.map((d) => [monthKey(d), { month: monthLabel(d), received: 0, depleted: 0 }]))

  for (const log of logs) {
    if (!log.createdAt) continue
    const bucket = buckets.get(monthKey(log.createdAt))
    if (!bucket) continue

    const direction = directionBySessionId.get(log.sessionId.toString())
    const unitCost = log.unitCost ?? priceByItemId.get(log.itemId.toString()) ?? 0
    const value = Math.abs(log.delta) * unitCost

    if (direction === 'in') bucket.received += value
    else if (direction === 'out') bucket.depleted += value
  }

  return monthStarts.map((d) => {
    const bucket = buckets.get(monthKey(d))!
    return { month: bucket.month, received: bucket.received, depleted: bucket.depleted, net: bucket.received - bucket.depleted }
  })
}
