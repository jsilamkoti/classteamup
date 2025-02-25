'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="py-8 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Something went wrong!
        </h2>
        <p className="mt-2 text-gray-600">
          There was an error loading your profile. Please try again.
        </p>
        <Button
          onClick={reset}
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    </div>
  )
} 