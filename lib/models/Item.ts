import mongoose, { Schema, Document } from 'mongoose'
import type { Category, Unit } from '@/types'

export interface IItem extends Document {
  name: string
  category: Category
  unit: Unit
  currentCount: number | null
  currentLbs: number | null
  createdAt: Date
}

const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  category: { type: String, enum: ['cooler', 'dry', 'bar'], required: true },
  unit: { type: String, enum: ['count', 'lbs'], required: true },
  currentCount: { type: Number, default: null },
  currentLbs: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Item || mongoose.model<IItem>('Item', ItemSchema)
