import mongoose, { Schema, Document } from 'mongoose'
import type { Category } from '@/types'

export type PriceField = 'unitsPerBox' | 'boxPrice' | 'minStock'
export type PriceChangeSource = 'manual' | 'csv-import'

export interface IPriceChange {
  field: PriceField
  oldValue: number | null
  newValue: number | null
}

export interface IPriceLog extends Document {
  itemId: mongoose.Types.ObjectId
  itemName: string
  category: Category
  userId: mongoose.Types.ObjectId
  displayName: string
  source: PriceChangeSource
  changes: IPriceChange[]
  createdAt: Date
}

const PriceChangeSchema = new Schema<IPriceChange>(
  {
    field: { type: String, enum: ['unitsPerBox', 'boxPrice', 'minStock'], required: true },
    oldValue: { type: Number, default: null },
    newValue: { type: Number, default: null },
  },
  { _id: false }
)

const PriceLogSchema = new Schema<IPriceLog>({
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true },
  category: { type: String, enum: ['cooler', 'dry', 'bar'], required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: { type: String, required: true },
  source: { type: String, enum: ['manual', 'csv-import'], required: true },
  changes: { type: [PriceChangeSchema], required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.PriceLog || mongoose.model<IPriceLog>('PriceLog', PriceLogSchema)
