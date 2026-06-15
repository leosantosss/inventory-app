import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Session from '@/lib/models/Session'
import Log from '@/lib/models/Log'
import Item from '@/lib/models/Item'
import type { Direction, ChangeEntry } from '@/types'

export async function createUpdateSession(data: {
  userId: string
  displayName: string
  direction: Direction
  note: string
  changes: ChangeEntry[]
  newItemIds?: string[]
}) {
  await dbConnect()

  const session = await Session.create({
    userId: new mongoose.Types.ObjectId(data.userId),
    displayName: data.displayName,
    direction: data.direction,
    note: data.note,
  })

  const newItemIdSet = new Set(data.newItemIds ?? [])
  const processedIds = new Set<string>()
  const logs: object[] = []

  for (const change of data.changes) {
    const item = await Item.findById(change.itemId)
    if (!item) continue

    const oldValue = item.unit === 'count' ? (item.currentCount ?? 0) : (item.currentLbs ?? 0)
    const delta = change.newValue - oldValue

    logs.push({
      sessionId: session._id,
      itemId: item._id,
      itemName: item.name,
      oldValue,
      newValue: change.newValue,
      delta,
      unit: item.unit,
      isNewItem: newItemIdSet.has(String(item._id)),
    })

    processedIds.add(String(item._id))

    if (item.unit === 'count') {
      item.currentCount = change.newValue
    } else {
      item.currentLbs = change.newValue
    }
    await item.save()
  }

  // Log newly added items that had no quantity change
  for (const itemId of newItemIdSet) {
    if (processedIds.has(itemId)) continue
    const item = await Item.findById(itemId)
    if (!item) continue

    const value = item.unit === 'count' ? (item.currentCount ?? 0) : (item.currentLbs ?? 0)
    logs.push({
      sessionId: session._id,
      itemId: item._id,
      itemName: item.name,
      oldValue: 0,
      newValue: value,
      delta: value,
      unit: item.unit,
      isNewItem: true,
    })
  }

  await Log.insertMany(logs)
  return session
}
