import dbConnect from '@/lib/mongodb'
import Session from '@/lib/models/Session'
import Log from '@/lib/models/Log'
import type { HistoryEntry } from '@/types'

export async function getRecentHistory(): Promise<HistoryEntry[]> {
  await dbConnect()

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const sessions = await Session.find({ createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .lean()

  const sessionIds = sessions.map((s) => s._id)
  const logs = await Log.find({ sessionId: { $in: sessionIds } }).lean()

  return sessions.map((session) => ({
    ...(session as any),
    _id: session._id.toString(),
    userId: (session as any).userId?.toString() ?? '',
    createdAt: (session as any).createdAt?.toISOString() ?? '',
    logs: logs
      .filter((log) => log.sessionId.toString() === session._id.toString())
      .map((log) => ({
        ...(log as any),
        _id: log._id.toString(),
        sessionId: log.sessionId.toString(),
        itemId: log.itemId.toString(),
        createdAt: (log as any).createdAt?.toISOString() ?? '',
      })),
  }))
}
