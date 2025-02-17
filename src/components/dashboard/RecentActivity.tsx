import { createServerClient } from '@/lib/supabase-server'
import { formatDistanceToNow } from 'date-fns'

export default async function RecentActivity() {
  const supabase = createServerClient()
  const { data: activities } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      courses (
        name
      ),
      users (
        full_name
      )
    `)
    .order('enrolled_at', { ascending: false })
    .limit(5)

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Recent Activity
        </h3>
      </div>
      <ul className="divide-y divide-gray-200">
        {activities?.map((activity) => (
          <li key={`${activity.course_id}-${activity.user_id}`}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate">
                  {activity.courses?.name}
                </p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    New Enrollment
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="text-sm text-gray-500">
                    {activity.users?.full_name}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    {formatDistanceToNow(new Date(activity.enrolled_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
} 