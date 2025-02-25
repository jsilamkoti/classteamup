import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UserProfile from '@/components/profile/UserProfile'

export const dynamic = 'force-dynamic'

export default async function UserProfilePage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    redirect('/auth/signin')
  }

  // Don't let users view their own profile here
  if (session.user.id === params.id) {
    redirect('/dashboard/profile')
  }

  return (
    <div className="py-8 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <UserProfile userId={params.id} />
      </div>
    </div>
  )
} 