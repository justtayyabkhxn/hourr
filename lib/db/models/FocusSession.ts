import mongoose, { Document, Schema } from 'mongoose'

export interface IFocusSession extends Document {
  userId: mongoose.Types.ObjectId
  startTime: Date
  endTime: Date | null
  duration: number // minutes
  interruptions: number
  qualityScore: number // 0–100
  notes: string
}

const FocusSessionSchema = new Schema<IFocusSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 0 },
    interruptions: { type: Number, default: 0 },
    qualityScore: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

export const FocusSession =
  mongoose.models.FocusSession ??
  mongoose.model<IFocusSession>('FocusSession', FocusSessionSchema)
