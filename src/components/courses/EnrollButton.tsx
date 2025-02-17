'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface EnrollButtonProps {
  courseId: string
  isEnrolled: boolean
}

export default function EnrollButton({ courseId, isEnrolled }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { profile } = useAuth()
  const supabase = createClient()

  const handleEnroll = async () => {
    if (!profile) return
    setLoading(true)
    setError(null)

    try {
      const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: profile.id,
        })

      if (enrollError) throw enrollError

      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (profile?.role !== 'student' || isEnrolled) {
    return null
  }

  return (
    <div>
      <Button
        onClick={handleEnroll}
        isLoading={loading}
        className="w-full sm:w-auto"
      >
        Enroll in Course
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 