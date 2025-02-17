import { createServerClient } from '@/lib/supabase-server'

export default async function DashboardStats() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single()

  const { data: stats } = await supabase
    .from(profile?.role === 'instructor' ? 'courses' : 'course_enrollments')
    .select('course_id', { count: 'exact' })
    .eq(profile?.role === 'instructor' ? 'instructor_id' : 'user_id', user?.id)

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">
            {profile?.role === 'instructor' ? 'Courses Created' : 'Enrolled Courses'}
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats?.length || 0}
          </dd>
        </div>
      </div>
      {/* Add more stat cards as needed */}
    </div>
  )
} 