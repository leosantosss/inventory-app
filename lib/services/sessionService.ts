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
}) {
  await dbConnect()

  const session = await Session.create({
    userId: new mongoose.Types.ObjectId(data.userId),
    displayName: data.displayName,
    direction: data.direction,
    note: data.note,
  })

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
    })

    if (item.unit === 'count') {
      item.currentCount = change.newValue
    } else {
      item.currentLbs = change.newValue
    }
    await item.save()
  }

  await Log.insertMany(logs)
  return session
}
