import dbConnect from '@/lib/mongodb'
import Session from '@/lib/models/Session'
import Log from '@/lib/models/Log'
import type { HistoryEntry } from '@/types'

type LeanSession = {
  _id: { toString(): string }
  userId?: { toString(): string }
  createdAt?: Date
  [key: string]: unknown
}

type LeanLog = {
  _id: { toString(): string }
  sessionId: { toString(): string }
  itemId: { toString(): string }
  createdAt?: Date
  [key: string]: unknown
}

export async function getRecentHistory(): Promise<HistoryEntry[]> {
  await dbConnect()

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const sessions = (await Session.find({ createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .lean()) as LeanSession[]

  const sessionIds = sessions.map((s) => s._id)
  const logs = (await Log.find({ sessionId: { $in: sessionIds } }).lean()) as LeanLog[]

  return sessions.map((session) => ({
    ...session,
    _id: session._id.toString(),
    userId: session.userId?.toString() ?? '',
    createdAt: session.createdAt?.toISOString() ?? '',
    logs: logs
      .filter((log) => log.sessionId.toString() === session._id.toString())
      .map((log) => ({
        ...log,
        _id: log._id.toString(),
        sessionId: log.sessionId.toString(),
        itemId: log.itemId.toString(),
        createdAt: log.createdAt?.toISOString() ?? '',
      })),
  })) as HistoryEntry[]
}
