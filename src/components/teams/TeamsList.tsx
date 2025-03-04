'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import { Users, Book, Star, ChevronDown, ChevronUp } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Skill {
  skill_id: string
  proficiency_level: number
}

interface TeamMember {
  id: string
  full_name: string
  email: string
  role: string
  academic_level: string
  team_role: string
  skills: Skill[]
}

interface Team {
  id: string
  name: string
  description: string
  course_id: string
  created_at: string
  visibility: string
  status: string
  members: TeamMember[]
}

interface TeamsListProps {
  userRole: 'student' | 'instructor'
  courseId?: string
}

export default function TeamsList({ userRole, courseId }: TeamsListProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadTeams()
  }, [courseId])

  const loadTeams = async () => {
    try {
      console.log('Starting to load teams...');
      setLoading(true)
      setError(null)

      // First check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication failed')
      }
      if (!session) {
        console.error('No session found');
        throw new Error('Not authenticated')
      }

      console.log('Making API request to /api/teams...');
      const response = await fetch('/api/teams', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('API response status:', response.status);
      const data = await response.json()
      console.log('API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch teams')
      }

      let filteredTeams = data.teams || []
      console.log('Filtered teams:', filteredTeams);

      // If courseId is provided, filter teams for that course
      if (courseId) {
        filteredTeams = filteredTeams.filter((team: Team) => team.course_id === courseId)
        console.log('Teams filtered by course:', filteredTeams);
      }

      setTeams(filteredTeams)
    } catch (err: any) {
      console.error('Full error details:', err)
      setError(err.message || 'Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const toggleTeamExpansion = (teamId: string) => {
    const newExpandedTeams = new Set(expandedTeams)
    if (expandedTeams.has(teamId)) {
      newExpandedTeams.delete(teamId)
    } else {
      newExpandedTeams.add(teamId)
    }
    setExpandedTeams(newExpandedTeams)
  }

  const renderSkillBadge = (skill: Skill) => (
    <span 
      key={skill.skill_id}
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1"
    >
      {skill.skill_id} ({skill.proficiency_level})
    </span>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p className="font-medium">Error loading teams:</p>
        <p className="mt-1">{error}</p>
        <Button
          onClick={loadTeams}
          className="mt-4"
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No teams found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {teams.map((team) => (
        <Card key={team.id} className="overflow-hidden">
          <div 
            className="p-6 cursor-pointer"
            onClick={() => toggleTeamExpansion(team.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {team.name}
                </h3>
                <p className="text-gray-600">{team.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleTeamExpansion(team.id)
                }}
              >
                {expandedTeams.has(team.id) ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </div>

            <div className="flex items-center mt-4 text-sm text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>{team.members.length} members</span>
              <span className="mx-2">•</span>
              <span className="capitalize">{team.status}</span>
            </div>
          </div>

          {expandedTeams.has(team.id) && (
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Team Members</h4>
              <div className="space-y-4">
                {team.members.map((member) => (
                  <div 
                    key={member.id}
                    className="bg-white p-4 rounded-lg shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900">
                          {member.full_name}
                        </h5>
                        {userRole === 'instructor' && (
                          <p className="text-sm text-gray-500">{member.email}</p>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {member.team_role}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <Book className="h-4 w-4 mr-2" />
                        {member.academic_level}
                      </div>
                      {member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {member.skills.map(renderSkillBadge)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
} 