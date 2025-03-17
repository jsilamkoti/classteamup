'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { UserPlus } from 'lucide-react'
import Button from '@/components/ui/Button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'

interface TeamAvailabilityCardProps {
  initialLookingForTeam: boolean
  isProfileComplete: boolean
}

export default function TeamAvailabilityCard({ 
  initialLookingForTeam = false,
  isProfileComplete = false
}: TeamAvailabilityCardProps) {
  const [lookingForTeam, setLookingForTeam] = useState(initialLookingForTeam)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClientComponentClient()
  
  // Update local state when props change (e.g. when returning to the page)
  useEffect(() => {
    setLookingForTeam(initialLookingForTeam)
  }, [initialLookingForTeam])

  const handleToggleAvailability = async () => {
    if (!isProfileComplete) {
      toast.error('Please complete your profile first')
      return
    }

    try {
      setIsUpdating(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in')
        return
      }

      // Update user's availability status
      const { error } = await supabase
        .from('users')
        .update({
          looking_for_team: !lookingForTeam,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setLookingForTeam(!lookingForTeam)
      toast.success(lookingForTeam 
        ? 'You are no longer looking for a team' 
        : 'You are now available for team matching!'
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className={`p-6 h-full flex flex-col justify-between hover:shadow-md transition-shadow ${
      lookingForTeam ? 'border-green-200 bg-green-50' : ''
    }`}>
      <div className="flex items-center space-x-3 mb-4">
        <UserPlus className={`h-8 w-8 ${lookingForTeam ? 'text-green-600' : 'text-gray-600'}`} />
        <h3 className="text-xl font-medium">Find a Team</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          {lookingForTeam 
            ? "You're currently looking for a team" 
            : "You're not currently looking for a team"}
        </p>
        
        <Button
          variant={lookingForTeam ? "secondary" : "primary"}
          className="w-full"
          onClick={handleToggleAvailability}
          disabled={isUpdating || !isProfileComplete}
          loading={isUpdating}
        >
          {lookingForTeam 
            ? "Stop Looking for Team" 
            : "Find a Team"}
        </Button>
        
        {!isProfileComplete && (
          <p className="text-xs text-amber-600">
            Complete your profile to find a team
          </p>
        )}
      </div>
    </Card>
  )
} 