import mongoose, { Document, Schema } from 'mongoose'

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId
  title: string
  targetHours: number
  category: string
  period: 'daily' | 'weekly' | 'monthly'
  isActive: boolean
  createdAt: Date
}

const GoalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    targetHours: { type: Number, required: true, min: 0.25 },
    category: { type: String, required: true },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const Goal = mongoose.models.Goal ?? mongoose.model<IGoal>('Goal', GoalSchema)
