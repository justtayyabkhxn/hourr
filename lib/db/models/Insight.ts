import mongoose, { Document, Schema } from 'mongoose'

export interface IInsight extends Document {
  userId: mongoose.Types.ObjectId
  type: 'daily' | 'weekly'
  content: string
  metric?: string
  trend?: 'up' | 'down' | 'neutral'
  date: string // YYYY-MM-DD
  createdAt: Date
}

const InsightSchema = new Schema<IInsight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    content: { type: String, required: true },
    metric: { type: String },
    trend: { type: String, enum: ['up', 'down', 'neutral'] },
    date: { type: String, required: true },
  },
  { timestamps: true }
)

export const Insight =
  mongoose.models.Insight ?? mongoose.model<IInsight>('Insight', InsightSchema)
