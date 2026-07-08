export type Category = 'cooler' | 'dry' | 'bar'
export type Unit = 'count' | 'lbs'
export type Direction = 'in' | 'out'
export type AlcoholType = 'tequila' | 'vodka' | 'whiskey' | 'rum' | 'mini tequila' | 'gin' | 'cognac' | 'brandy' | 'wine' | 'liqueur' | 'other'

export interface ItemDoc {
  _id: string
  name: string
  category: Category
  unit: Unit
  subcategory?: string
  currentCount: number | null
  currentLbs: number | null
  unitsPerBox: number | null
  boxPrice: number | null
  minStock: number | null
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
  isNewItem?: boolean
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
