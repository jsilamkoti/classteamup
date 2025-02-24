'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { TeamMatchingService } from '@/services/teamMatching'
import { toast } from 'react-hot-toast'
import { Users, AlertCircle } from 'lucide-react'

export default function TeamFormation() {
  const [loading, setLoading] = useState(false)
  const [availableStudents, setAvailableStudents] = useState(0)
  const supabase = createClient()
  const [rules, setRules] = useState({
    minTeamSize: 3,
    maxTeamSize: 5,
    courseId: '', // We'll add course selection later
    considerSkills: true
  })

  useEffect(() => {
    // Initial load
    loadAvailableStudents()

    // Set up real-time subscription for user changes
    const channel = supabase
      .channel('available-students')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: 'looking_for_team=eq.true'
        },
        (payload) => {
          console.log('Change received:', payload)
          loadAvailableStudents() // Reload count when changes occur
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadAvailableStudents = async () => {
    try {
      // Get students who are looking for teams and not in any team
      const { data, error } = await supabase
        .from('users')
        .select('id, looking_for_team')
        .eq('role', 'student')
        .eq('looking_for_team', true)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Available students:', data)
      setAvailableStudents(data?.length || 0)
    } catch (error: any) {
      console.error('Error loading available students:', error.message || error)
      toast.error('Failed to load available students')
    }
  }

  const handleFormTeams = async () => {
    try {
      setLoading(true)
      const matchingService = new TeamMatchingService(supabase)
      await matchingService.createTeams(rules)
      toast.success('Teams formed successfully!')
      loadAvailableStudents() // Refresh the count
    } catch (error: any) {
      toast.error(error.message || 'Failed to form teams')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team Formation</h1>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Available Students</h2>
              <p className="text-sm text-gray-500">Students looking for teams</p>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{availableStudents}</span>
            </div>
          </div>

          {availableStudents < rules.minTeamSize && (
            <div className="bg-yellow-50 p-4 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Not Enough Students
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Wait for at least {rules.minTeamSize} students to be available before forming teams.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Team Size
              </label>
              <input
                type="number"
                value={rules.minTeamSize}
                onChange={(e) => setRules({ ...rules, minTeamSize: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min={2}
                max={rules.maxTeamSize}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Maximum Team Size
              </label>
              <input
                type="number"
                value={rules.maxTeamSize}
                onChange={(e) => setRules({ ...rules, maxTeamSize: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min={rules.minTeamSize}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="considerSkills"
                checked={rules.considerSkills}
                onChange={(e) => setRules({ ...rules, considerSkills: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="considerSkills" className="ml-2 block text-sm text-gray-700">
                Consider skill distribution when forming teams
              </label>
            </div>
          </div>

          <Button
            onClick={handleFormTeams}
            disabled={loading || availableStudents < rules.minTeamSize}
            className="w-full"
          >
            {loading ? 'Forming Teams...' : 'Form Teams Now'}
          </Button>
        </div>
      </Card>
    </div>
  )
} 