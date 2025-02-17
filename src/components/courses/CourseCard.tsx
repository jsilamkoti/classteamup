import Link from 'next/link'
import { Database } from '@/types/supabase'

type Course = Database['public']['Tables']['courses']['Row']

interface CourseCardProps {
  course: Course
  enrollmentCount: number
}

export default function CourseCard({ course, enrollmentCount }: CourseCardProps) {
  return (
    <Link 
      href={`/dashboard/courses/${course.id}`}
      className="block hover:shadow-lg transition-shadow duration-200"
    >
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {course.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {course.description}
          </p>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <span>{enrollmentCount} students enrolled</span>
          </div>
        </div>
      </div>
    </Link>
  )
} 