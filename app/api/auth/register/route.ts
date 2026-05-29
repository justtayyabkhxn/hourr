import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/User'
import { createSession, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed })

    const token = await createSession({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })
    await setSessionCookie(token)

    return NextResponse.json({
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (err) {
    console.error('[register]', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
