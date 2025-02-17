import { Database } from '@/types/supabase'
import EnrollButton from './EnrollButton'

type CourseWithInstructor = Database['public']['Tables']['courses']['Row'] & {
  users: {
    full_name: string
  }
  course_enrollments: {
    user_id: string
    enrolled_at: string
    users: {
      full_name: string
      email: string
    }
  }[]
}

export default function CourseHeader({ course }: { course: CourseWithInstructor }) {
  const isEnrolled = course.course_enrollments.length > 0

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {course.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Instructor: {course.users.full_name}
          </p>
        </div>
        <EnrollButton courseId={course.id} isEnrolled={isEnrolled} />
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <p className="text-gray-700">
          {course.description}
        </p>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <span>{course.course_enrollments.length} students enrolled</span>
        </div>
      </div>
    </div>
  )
} 