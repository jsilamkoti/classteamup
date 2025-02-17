import { createServerClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import CourseHeader from '@/components/courses/CourseHeader'
import EnrollmentList from '@/components/courses/EnrollmentList'

export default async function CourseDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()
  
  const { data: course } = await supabase
    .from('courses')
    .select(`
      *,
      users!courses_instructor_id_fkey (
        full_name
      ),
      course_enrollments (
        user_id,
        enrolled_at,
        users (
          full_name,
          email
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!course) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <CourseHeader course={course} />
      <EnrollmentList enrollments={course.course_enrollments} />
    </div>
  )
} 