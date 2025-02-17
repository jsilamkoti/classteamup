import { Database } from '@/types/supabase'
import CourseCard from './CourseCard'

type Course = Database['public']['Tables']['courses']['Row'] & {
  course_enrollments: { count: number }[]
}

export default function CourseList({ courses }: { courses: Course[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course}
          enrollmentCount={course.course_enrollments[0]?.count || 0}
        />
      ))}
    </div>
  )
} 