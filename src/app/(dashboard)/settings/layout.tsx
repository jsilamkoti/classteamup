'use client'

import BackButton from '@/components/ui/BackButton'
import { Cog } from 'lucide-react'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Improved header design with a card background */}
      <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <BackButton
          label="Back to Dashboard"
          className="mb-4 flex items-center text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-md transition-colors"
        />
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-100 rounded-full p-2">
            <Cog className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        </div>        
        <p className="mt-2 text-gray-500 text-sm">
          Manage your account settings and preferences
        </p>
      </div>
      
      {/* Settings content wrapped in a card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {children}
      </div>
    </div>
  )
} 