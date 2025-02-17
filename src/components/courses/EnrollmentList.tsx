import { formatDistanceToNow } from 'date-fns'

type Enrollment = {
  user_id: string
  enrolled_at: string
  users: {
    full_name: string
    email: string
  }
}

export default function EnrollmentList({ 
  enrollments 
}: { 
  enrollments: Enrollment[] 
}) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Enrolled Students ({enrollments.length})
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {enrollments.map((enrollment) => (
            <li key={enrollment.user_id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {enrollment.users.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {enrollment.users.email}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Joined {formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 