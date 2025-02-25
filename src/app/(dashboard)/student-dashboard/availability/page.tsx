'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

export default function AvailabilityPage() {
  const [isLookingForTeam, setIsLookingForTeam] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadAvailabilityStatus()
  }, [])

  const loadAvailabilityStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('looking_for_team')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setIsLookingForTeam(data.looking_for_team)
    } catch (error) {
      console.error('Error loading availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAvailability = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('users')
        .update({
          looking_for_team: !isLookingForTeam,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setIsLookingForTeam(!isLookingForTeam)
      toast.success('Availability status updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Availability</h1>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Your Current Status
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Let others know if you're available for team formation
            </p>
            
            <div className="flex items-center space-x-2">
              <span className={`inline-block w-3 h-3 rounded-full ${
                isLookingForTeam ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                {isLookingForTeam ? 'Looking for Team' : 'Not Available'}
              </span>
            </div>
          </div>

          <Button
            onClick={updateAvailability}
            disabled={loading}
            className={`w-full ${
              isLookingForTeam ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Updating...' : (
              isLookingForTeam ? 'Stop Looking for Team' : 'Start Looking for Team'
            )}
          </Button>

          <div className="text-sm text-gray-500">
            <h3 className="font-medium text-gray-700 mb-2">Note:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>When available, you may be matched with a team automatically</li>
              <li>You can change your availability status at any time</li>
              <li>You'll be notified when you're assigned to a team</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
} 