/**
 * @jest-environment node
 */
jest.mock('@/lib/models/Session')
jest.mock('@/lib/models/Log')
jest.mock('@/lib/models/Item')
jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }))

import Session from '@/lib/models/Session'
import Log from '@/lib/models/Log'
import Item from '@/lib/models/Item'
import { createUpdateSession } from '@/lib/services/sessionService'

const mockSession = { _id: 'sess1' }
const mockItem = {
  _id: 'item1',
  name: 'Tito\'s Vodka',
  unit: 'count',
  currentCount: 7,
  currentLbs: null,
  save: jest.fn().mockResolvedValue(undefined),
}

describe('sessionService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a session, updates item quantities, and inserts logs', async () => {
    ;(Session.create as jest.Mock).mockResolvedValue(mockSession)
    ;(Item.findById as jest.Mock).mockResolvedValue({ ...mockItem, save: jest.fn() })
    ;(Log.insertMany as jest.Mock).mockResolvedValue([])

    await createUpdateSession({
      userId: '507f1f77bcf86cd799439011',
      displayName: 'John',
      direction: 'out',
      note: 'Prep for dinner service',
      changes: [{ itemId: 'item1', newValue: 5 }],
    })

    expect(Session.create).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: 'John', direction: 'out', note: 'Prep for dinner service' })
    )
    expect(Log.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          itemName: 'Tito\'s Vodka',
          oldValue: 7,
          newValue: 5,
          delta: -2,
          unit: 'count',
        }),
      ])
    )
  })

  it('skips changes for items that no longer exist', async () => {
    ;(Session.create as jest.Mock).mockResolvedValue(mockSession)
    ;(Item.findById as jest.Mock).mockResolvedValue(null)
    ;(Log.insertMany as jest.Mock).mockResolvedValue([])

    await createUpdateSession({
      userId: '507f1f77bcf86cd799439011',
      displayName: 'John',
      direction: 'in',
      note: 'Shipment arrived',
      changes: [{ itemId: 'ghost', newValue: 10 }],
    })

    expect(Log.insertMany).toHaveBeenCalledWith([])
  })
})
