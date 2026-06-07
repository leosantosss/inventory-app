/**
 * @jest-environment node
 */
jest.mock('@/lib/models/Session')
jest.mock('@/lib/models/Log')
jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }))

import Session from '@/lib/models/Session'
import Log from '@/lib/models/Log'
import { getRecentHistory } from '@/lib/services/historyService'

const mockSession = { _id: { toString: () => 'sess1' }, displayName: 'John', note: 'Test', createdAt: new Date(), userId: { toString: () => 'user1' }, direction: 'out' }
const mockLog = { _id: { toString: () => 'log1' }, sessionId: { toString: () => 'sess1' }, itemId: { toString: () => 'item1' }, itemName: 'Tito\'s', delta: -2, oldValue: 7, newValue: 5, unit: 'count', createdAt: new Date() }

describe('historyService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns sessions with their associated logs', async () => {
    const leanSessions = jest.fn().mockResolvedValue([mockSession])
    const sortSessions = jest.fn().mockReturnValue({ lean: leanSessions })
    ;(Session.find as jest.Mock).mockReturnValue({ sort: sortSessions })

    const leanLogs = jest.fn().mockResolvedValue([mockLog])
    ;(Log.find as jest.Mock).mockReturnValue({ lean: leanLogs })

    const result = await getRecentHistory()

    expect(result).toHaveLength(1)
    expect(result[0].logs).toHaveLength(1)
    expect(result[0].logs[0].itemName).toBe('Tito\'s')
  })

  it('filters sessions to the last 30 days', async () => {
    const leanSessions = jest.fn().mockResolvedValue([])
    const sortSessions = jest.fn().mockReturnValue({ lean: leanSessions })
    ;(Session.find as jest.Mock).mockReturnValue({ sort: sortSessions })
    ;(Log.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) })

    await getRecentHistory()

    const findCall = (Session.find as jest.Mock).mock.calls[0][0]
    expect(findCall.createdAt.$gte).toBeInstanceOf(Date)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    expect(findCall.createdAt.$gte.getTime()).toBeCloseTo(thirtyDaysAgo.getTime(), -3)
  })
})
