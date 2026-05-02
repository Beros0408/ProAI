# Script Python pour corriger le middleware auth de ProAI
import os

TARGET = os.path.join(
    "C:", os.sep, "Users", "bkabe", "Desktop", "Porjet - ProAI",
    "ProAI", "apps", "web", "middleware.ts"
)

CODE = """\
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/onboarding', '/pricing']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    const isPublicRoute = PUBLIC_ROUTES.some(route => {
      if (route === '/') return path === '/'
      return path.startsWith(route)
    })

    // Not logged in and trying to access protected route
    if (!user && !isPublicRoute) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      return NextResponse.redirect(redirectUrl)
    }

    // Logged in and trying to access login/signup
    if (user && (path === '/login' || path === '/signup')) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }

    return response
  } catch (e) {
    // If Supabase fails, let the request through to avoid blocking
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
"""

with open(TARGET, "w", encoding="utf-8") as f:
    f.write(CODE)

print(f"[OK] Middleware cree : {TARGET}")
print(f"[OK] Taille : {os.path.getsize(TARGET)} octets")
