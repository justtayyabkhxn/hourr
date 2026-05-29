import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/User'
import { createSession, setSessionCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await connectDB()

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

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
    console.error('[login]', err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
