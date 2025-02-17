import { createServerClient } from '@/lib/supabase-server'
import CourseList from '@/components/courses/CourseList'
import CreateCourseButton from '@/components/courses/CreateCourseButton'

export default async function CoursesPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      course_enrollments (
        count
      )
    `)
    .eq('instructor_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <CreateCourseButton />
      </div>
      <CourseList courses={courses || []} />
    </div>
  )
} 