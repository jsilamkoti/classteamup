import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to signin
  if (!session) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const path = request.nextUrl.pathname

  // Handle role-based redirects
  if (userData?.role === 'instructor') {
    if (path === '/dashboard' || path === '/student-dashboard') {
      return NextResponse.redirect(new URL('/instructor-dashboard', request.url))
    }
  } else {
    if (path === '/dashboard' || path === '/instructor-dashboard') {
      return NextResponse.redirect(new URL('/student-dashboard', request.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/student-dashboard/:path*',
    '/instructor-dashboard/:path*',
  ],
} 