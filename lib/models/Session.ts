import mongoose, { Schema, Document } from 'mongoose'
import type { Direction } from '@/types'

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId
  displayName: string
  direction: Direction
  note: string
  createdAt: Date
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: { type: String, required: true },
  direction: { type: String, enum: ['in', 'out'], required: true },
  note: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)
