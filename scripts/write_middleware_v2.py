# Script Python pour corriger le middleware auth de ProAI (version simple)
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "middleware.ts"
)

CODE = """\
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/onboarding', '/pricing']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => {
    if (route === '/') return path === '/'
    return path.startsWith(route)
  })

  // Check for Supabase auth cookies (they start with sb-)
  const cookies = request.cookies.getAll()
  const hasAuthCookie = cookies.some(c => c.name.includes('auth-token') || c.name.startsWith('sb-'))

  // Not logged in and trying to access protected route
  if (!hasAuthCookie && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Logged in and trying to access login/signup
  if (hasAuthCookie && (path === '/login' || path === '/signup')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
"""

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE)

print(f"[OK] Middleware cree : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")
