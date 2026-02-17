// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Auth pages - redirect to dashboard if already logged in
  if (pathname.startsWith('/auth/') && session) {
    // Allow reset-password even when logged in (user clicked email link)
    if (pathname === '/auth/reset-password') {
      return res
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protected pages - redirect to login if not authenticated
  if (pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
}
