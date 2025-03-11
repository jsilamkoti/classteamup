import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navbar from '@/components/dashboard/Navbar'
import { Bell } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('id, full_name, role, email')
    .eq('id', user.id)
    .single()

  if (!userProfile) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile} />
      <main className="w-full mx-auto">
        {children}
      </main>
    </div>
  )
} 