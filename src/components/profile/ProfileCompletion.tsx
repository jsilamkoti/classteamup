'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { calculateProfileCompletion } from '@/utils/profileCompletion'
import Link from 'next/link'

interface ProfileCompletionProps {
  profile: {
    full_name: string;
    bio: string;
    skills: { skillId: string; proficiency: number }[];
  };
}

export default function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const [completion, setCompletion] = useState({ percentage: 0, missingFields: [] as string[] })

  useEffect(() => {
    const result = calculateProfileCompletion(profile)
    setCompletion(result)
  }, [profile])

  return (
    <Card className="p-6 bg-white shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Profile Completion</h3>
          <span className="text-2xl font-bold text-indigo-600">
            {completion.percentage}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>

        {completion.percentage < 100 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Complete your profile by adding:</p>
            <ul className="mt-2 space-y-1">
              {completion.missingFields.map((field, index) => (
                <li key={index} className="text-sm text-gray-500 flex items-center">
                  <span className="mr-2">•</span>
                  {field}
                </li>
              ))}
            </ul>
            <Link
              href="/student-dashboard/profile"
              className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-500"
            >
              Complete Profile →
            </Link>
          </div>
        )}

        {completion.percentage === 100 && (
          <p className="text-sm text-green-600">
            Great job! Your profile is complete.
          </p>
        )}
      </div>
    </Card>
  )
} 