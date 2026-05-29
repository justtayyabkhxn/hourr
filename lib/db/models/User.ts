import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  hourlyValue?: number
  preferences: {
    theme: 'dark' | 'light'
    defaultCategory: string
    workdayStart: number
    workdayEnd: number
  }
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    hourlyValue: { type: Number, default: 0 },
    preferences: {
      theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
      defaultCategory: { type: String, default: 'work' },
      workdayStart: { type: Number, default: 9 },
      workdayEnd: { type: Number, default: 18 },
    },
  },
  { timestamps: true }
)

export const User = mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)
