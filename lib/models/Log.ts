import mongoose, { Schema, Document } from 'mongoose'
import type { Unit } from '@/types'

export interface ILog extends Document {
  sessionId: mongoose.Types.ObjectId
  itemId: mongoose.Types.ObjectId
  itemName: string
  oldValue: number
  newValue: number
  delta: number
  unit: Unit
  isNewItem: boolean
  createdAt: Date
}

const LogSchema = new Schema<ILog>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  itemName: { type: String, required: true },
  oldValue: { type: Number, required: true },
  newValue: { type: Number, required: true },
  delta: { type: Number, required: true },
  unit: { type: String, enum: ['count', 'lbs'], required: true },
  isNewItem: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema)
