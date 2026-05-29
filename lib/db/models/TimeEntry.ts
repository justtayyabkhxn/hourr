import mongoose, { Document, Schema } from 'mongoose'

export interface ITimeEntry extends Document {
  userId: mongoose.Types.ObjectId
  startTime: Date
  endTime: Date | null
  duration: number // minutes
  category: string
  tags: string[]
  notes: string
  isRunning: boolean
  createdAt: Date
}

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // minutes
    category: { type: String, required: true, default: 'work' },
    tags: [{ type: String, trim: true }],
    notes: { type: String, default: '', trim: true },
    isRunning: { type: Boolean, default: false },
  },
  { timestamps: true }
)

TimeEntrySchema.index({ userId: 1, startTime: -1 })

export const TimeEntry =
  mongoose.models.TimeEntry ?? mongoose.model<ITimeEntry>('TimeEntry', TimeEntrySchema)
