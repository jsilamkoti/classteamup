import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    
    // Get user role
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      // Redirect based on role
      if (userData?.role === 'instructor') {
        return NextResponse.redirect(new URL('/instructor-dashboard', requestUrl.origin))
      } else {
        return NextResponse.redirect(new URL('/student-dashboard', requestUrl.origin))
      }
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/auth/signin', requestUrl.origin))
} 