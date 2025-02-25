'use client'

import { Card } from '@/components/ui/Card'
import { Search } from 'lucide-react'
import Link from 'next/link'
import Tooltip from '@/components/ui/Tooltip'

interface BrowseStudentsCardProps {
  completionPercentage: number
}

export default function BrowseStudentsCard({ completionPercentage }: BrowseStudentsCardProps) {
  return (
    <Tooltip 
      text="Complete your profile to browse and connect with potential teammates"
      disabled={completionPercentage === 100}
    >
      <Link 
        href="/browse" 
        className={`block h-full transform transition-all duration-200 ${
          completionPercentage < 100 
            ? 'cursor-not-allowed opacity-75' 
            : 'hover:scale-[1.02] hover:shadow-lg'
        }`}
        onClick={(e) => {
          if (completionPercentage < 100) {
            e.preventDefault()
          }
        }}
      >
        <Card className={`p-6 h-full flex flex-col justify-between transition-colors duration-200 ${
          completionPercentage < 100 
            ? 'bg-gray-50' 
            : 'hover:bg-purple-50'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <Search className={`h-8 w-8 ${
              completionPercentage < 100 
                ? 'text-gray-400' 
                : 'text-purple-600'
            }`} />
            <h3 className="text-xl font-medium">Browse Students</h3>
          </div>
          <p className="text-sm text-gray-600">
            Find potential teammates based on skills
          </p>
          {completionPercentage < 100 && (
            <div className="mt-4 flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-2 rounded-md">
              <svg 
                className="h-5 w-5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span>Complete profile required</span>
            </div>
          )}
        </Card>
      </Link>
    </Tooltip>
  )
} 