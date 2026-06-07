export type Category = 'cooler' | 'dry' | 'bar'
export type Unit = 'count' | 'lbs'
export type Direction = 'in' | 'out'

export interface ItemDoc {
  _id: string
  name: string
  category: Category
  unit: Unit
  currentCount: number | null
  currentLbs: number | null
  createdAt: string
}

export interface LogDoc {
  _id: string
  sessionId: string
  itemId: string
  itemName: string
  oldValue: number
  newValue: number
  delta: number
  unit: Unit
  createdAt: string
}

export interface HistoryEntry {
  _id: string
  userId: string
  displayName: string
  direction: Direction
  note: string
  createdAt: string
  logs: LogDoc[]
}

export interface ChangeEntry {
  itemId: string
  newValue: number
}
