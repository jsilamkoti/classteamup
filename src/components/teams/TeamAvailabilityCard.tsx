'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface TeamAvailabilityCardProps {
  initialLookingForTeam: boolean
  isProfileComplete: boolean
}

export default function TeamAvailabilityCard({ initialLookingForTeam, isProfileComplete }: TeamAvailabilityCardProps) {
  const [isLookingForTeam, setIsLookingForTeam] = useState(initialLookingForTeam)

  const handleToggleAvailability = async () => {
    if (!isProfileComplete) return;
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in to continue')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          looking_for_team: !isLookingForTeam,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setIsLookingForTeam(!isLookingForTeam)
      toast.success(isLookingForTeam ? 'No longer looking for team' : 'You are now available for team matching!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability')
    }
  }

  return (
    <div 
      onClick={handleToggleAvailability}
      className={`relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        !isProfileComplete ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLookingForTeam && (
        <span className="absolute top-4 right-4 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      )}
      <div className="flex flex-col space-y-2">
        <Users className="h-8 w-8 text-green-600" />
        <h3 className="font-medium">
          {isLookingForTeam ? 'Looking for Team' : 'Find a Team'}
        </h3>
        <p className="text-sm text-gray-600">
          {isLookingForTeam 
            ? 'You will be matched with a team soon'
            : 'Click to start team matching process'}
        </p>
      </div>
    </div>
  )
} 