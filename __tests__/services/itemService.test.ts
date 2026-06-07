/**
 * @jest-environment node
 */

jest.mock('@/lib/models/Item')
jest.mock('@/lib/mongodb', () => ({ __esModule: true, default: jest.fn() }))

import Item from '@/lib/models/Item'
import {
  getItemsByCategory,
  createItem,
  updateItemMetadata,
  deleteItem,
} from '@/lib/services/itemService'

const mockItem = {
  _id: 'abc123',
  name: 'Tito\'s Vodka',
  category: 'bar' as const,
  unit: 'count' as const,
  currentCount: 7,
  currentLbs: null,
}

describe('itemService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getItemsByCategory returns items sorted by name', async () => {
    const lean = jest.fn().mockResolvedValue([mockItem])
    const sort = jest.fn().mockReturnValue({ lean })
    ;(Item.find as jest.Mock).mockReturnValue({ sort })

    const result = await getItemsByCategory('bar')

    expect(Item.find).toHaveBeenCalledWith({ category: 'bar' })
    expect(sort).toHaveBeenCalledWith({ name: 1 })
    expect(result).toEqual([mockItem])
  })

  it('createItem sets currentCount when unit is count', async () => {
    const MockItemConstructor = Item as unknown as jest.Mock
    MockItemConstructor.mockImplementation(() => ({ save: jest.fn().mockResolvedValue(mockItem) }))

    await createItem({ name: 'Tito\'s Vodka', category: 'bar', unit: 'count', startingValue: 7 })

    expect(MockItemConstructor).toHaveBeenCalledWith(
      expect.objectContaining({ currentCount: 7, currentLbs: null })
    )
  })

  it('updateItemMetadata calls findByIdAndUpdate', async () => {
    ;(Item.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockItem, name: 'Tito\'s' })

    const result = await updateItemMetadata('abc123', { name: 'Tito\'s' })

    expect(Item.findByIdAndUpdate).toHaveBeenCalledWith('abc123', { name: 'Tito\'s' }, { new: true })
    expect((result as any).name).toBe('Tito\'s')
  })

  it('deleteItem calls findByIdAndDelete', async () => {
    ;(Item.findByIdAndDelete as jest.Mock).mockResolvedValue(mockItem)

    await deleteItem('abc123')

    expect(Item.findByIdAndDelete).toHaveBeenCalledWith('abc123')
  })
})
