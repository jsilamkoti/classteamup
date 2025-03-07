import { createServerClient } from '@/lib/supabase-server'
import { Card } from '@/components/ui/Card'
import { redirect } from 'next/navigation'
import { Users, BookOpen, Layers } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single()

  if (!userProfile) {
    redirect('/auth/signin')
  }

  // Redirect based on role
  if (userProfile.role === 'instructor') {
    redirect('/instructor-dashboard')
  } else if (userProfile.role === 'student') {
    redirect('/student-dashboard')
  }

  // Fallback dashboard if no specific role
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome to ClassTeamUp!</p>
    </div>
  )
} 