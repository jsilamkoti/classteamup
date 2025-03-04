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
  bio: string | null
  avatar_url: string | null
  team_role: string
  joined_at: string
}

interface Team {
  id: string
  name: string
  description: string
  course_id: string
  created_at: string
  updated_at: string
  status: string
  team_lead_id: string
  max_members: number
  created_by: string
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
      setLoading(true);
      setError(null);

      // First check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication failed: ' + authError.message);
      }
      if (!session) {
        console.error('No session found');
        throw new Error('Please log in to view teams');
      }

      console.log('Making API request to /api/teams...');
      const response = await fetch('/api/teams', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'include',
        cache: 'no-store'
      });

      console.log('API response status:', response.status);
      
      let data;
      try {
        const text = await response.text(); // Get response as text first
        console.log('Raw response:', text);
        data = JSON.parse(text); // Then parse it
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        console.error('API error response:', data);
        throw new Error(data?.error || data?.details || `HTTP error ${response.status}`);
      }

      if (!data || !Array.isArray(data.teams)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from API');
      }

      let filteredTeams = data.teams;
      console.log('Teams received:', filteredTeams.length);

      // If courseId is provided, filter teams for that course
      if (courseId) {
        filteredTeams = filteredTeams.filter((team: Team) => team.course_id === courseId);
        console.log('Teams filtered by course:', filteredTeams.length);
      }

      setTeams(filteredTeams);
    } catch (err: any) {
      console.error('Full error details:', err);
      setError(err.message || 'Failed to load teams');
      // If it's an authentication error, redirect to login
      if (err.message.includes('Please log in') || err.message.includes('Authentication failed')) {
        // You might want to redirect to login page here
        console.log('User needs to log in');
      }
    } finally {
      setLoading(false);
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
              <span>{team.members.length}/{team.max_members} members</span>
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
                      <div className="flex items-center">
                        {member.avatar_url && (
                          <img 
                            src={member.avatar_url} 
                            alt={member.full_name}
                            className="h-8 w-8 rounded-full mr-3"
                          />
                        )}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900">
                            {member.full_name}
                            {team.team_lead_id === member.id && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Team Lead
                              </span>
                            )}
                          </h5>
                          {userRole === 'instructor' && (
                            <p className="text-sm text-gray-500">{member.email}</p>
                          )}
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {member.team_role}
                      </span>
                    </div>

                    {member.bio && (
                      <p className="mt-2 text-sm text-gray-600">{member.bio}</p>
                    )}
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