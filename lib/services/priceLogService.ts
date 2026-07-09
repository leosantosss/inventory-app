import dbConnect from '@/lib/mongodb'
import PriceLog, { type IPriceChange, type PriceChangeSource } from '@/lib/models/PriceLog'
import type { Category } from '@/types'

interface RecordPriceChangeParams {
  itemId: string
  itemName: string
  category: Category
  userId: string
  displayName: string
  source: PriceChangeSource
  changes: IPriceChange[]
}

export async function recordPriceChange(params: RecordPriceChangeParams) {
  if (params.changes.length === 0) return null
  await dbConnect()
  return PriceLog.create(params)
}

type LeanPriceLog = {
  _id: { toString(): string }
  itemId: { toString(): string }
  userId: { toString(): string }
  createdAt?: Date
  [key: string]: unknown
}

export async function getRecentPriceChanges() {
  await dbConnect()

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const logs = (await PriceLog.find({ createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .lean()) as LeanPriceLog[]

  return logs.map((log) => ({
    ...log,
    _id: log._id.toString(),
    itemId: log.itemId.toString(),
    userId: log.userId.toString(),
    createdAt: log.createdAt?.toISOString() ?? '',
  }))
}
