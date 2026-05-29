import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-secret-change-in-production'
)

const PUBLIC_PATHS = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p)))
  const isApiRoute = pathname.startsWith('/api')
  const token = request.cookies.get('hourr_session')?.value

  if (isPublic) {
    // Don't redirect the root landing page even if logged in — let it show
    if (token && !isApiRoute && pathname !== '/') {
      try {
        await jwtVerify(token, JWT_SECRET)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } catch {
        // invalid token, continue to public page
      }
    }
    return NextResponse.next()
  }

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('hourr_session')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
