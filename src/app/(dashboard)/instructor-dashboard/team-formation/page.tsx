'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { TeamMatchingService } from '@/services/teamMatching'
import { toast } from 'react-hot-toast'
import { Users, AlertCircle } from 'lucide-react'
import { Student } from '@/services/teamMatching'

type Team = Student[]

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
  const [formedTeams, setFormedTeams] = useState<Team[]>([])

  useEffect(() => {
    // Initial load
    loadAvailableStudents()

    // Real-time subscription for user changes
    const channel = supabase
      .channel('available-students')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          loadAvailableStudents() // Reload count on any user changes
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadAvailableStudents = async () => {
    try {
      // Count students who are:
      // 1. Students (role)
      // 2. Looking for team (flag)
      // 3. Not already in a team
      const { data, count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('role', 'student')
        .eq('looking_for_team', true)

      if (error) {
        throw error
      }

      // Log for debugging
      console.log('Available students query result:', { data, count })
      
      setAvailableStudents(count || 0)
    } catch (error) {
      console.error('Error loading available students:', error)
      toast.error('Failed to load student count')
    }
  }

  const handleFormTeams = async () => {
    setLoading(true);
    try {
      const matchingService = new TeamMatchingService();
      const teams = await matchingService.matchTeams({
        minTeamSize: rules.minTeamSize,
        maxTeamSize: rules.maxTeamSize,
        considerSkills: rules.considerSkills,
        balanceTeamSize: true,
        considerProjectPreferences: true,
        considerAvailability: true,
        skillWeighting: 0.4
      });

      setFormedTeams(teams);

      // Save teams to database
      for (const team of teams) {
        const { error } = await supabase
          .from('teams')
          .insert({
            name: `Team ${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            members: team.map(s => s.id)
          });

        if (error) throw error;
      }

      toast.success(`
        Teams Formed: ${teams.length}
        Students Placed: ${teams.reduce((acc, team) => acc + team.length, 0)}
      `);
    } catch (error) {
      console.error('Error forming teams:', error);
      toast.error('Failed to form teams');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team Formation</h1>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Available Students</h2>
              <p className="text-sm text-gray-500">
                {availableStudents === 1 
                  ? '1 student looking for a team'
                  : `${availableStudents} students looking for teams`}
              </p>
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

      {formedTeams.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Formed Teams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formedTeams.map((team, index) => (
              <Card key={index} className="p-4">
                <h4>Team {index + 1}</h4>
                <p>Members: {team.length}</p>
                <ul>
                  {team.map(student => (
                    <li key={student.id}>{student.full_name}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 