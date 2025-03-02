'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Mail, Calendar } from 'lucide-react'
import Link from 'next/link'

interface TeamMember {
  id: string
  full_name?: string
  email?: string
  student_skills?: Array<{
    skill_id: string
    proficiency_level: number
  }>
  availability?: string[]
}

interface Team {
  id: string
  name: string
  course_id: string
  created_at: string
  members: string[]
}

export default function TeamDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    fetchTeamDetails()
  }, [params.id])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getUser()
    if (data.user) {
      setCurrentUser(data.user.id)
    } else {
      router.push('/auth/signin')
    }
  }

  const fetchTeamDetails = async () => {
    try {
      setLoading(true)

      // Get team details
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', params.id)
        .single()

      if (teamError) {
        throw teamError
      }

      setTeam(teamData)

      // Get team members
      if (teamData && teamData.members && teamData.members.length > 0) {
        const { data: memberData, error: memberError } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            email,
            student_skills (skill_id, proficiency_level),
            availability
          `)
          .in('id', teamData.members)

        if (memberError) {
          throw memberError
        }

        setMembers(memberData || [])
      }
    } catch (error) {
      console.error('Error fetching team details:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to find common availability times
  const findCommonAvailability = () => {
    if (!members || members.length === 0) return []

    // Start with the first member's availability
    const firstMemberAvail = members[0].availability || []
    if (firstMemberAvail.length === 0) return []

    // Find intersection with all other members
    return members.reduce((common, member) => {
      if (!member.availability) return common
      return common.filter(time => member.availability?.includes(time))
    }, [...firstMemberAvail])
  }

  const commonAvailability = findCommonAvailability()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/student-dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {loading ? 'Loading...' : team?.name || 'Team Details'}
          </h1>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading team details...</div>
      ) : (
        <div className="space-y-8">
          {/* Team Members Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              Team Members
            </h2>
            <div className="space-y-4">
              {members.map(member => (
                <div 
                  key={member.id} 
                  className={`p-4 rounded-lg ${
                    member.id === currentUser ? 'bg-green-50 border border-green-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900 flex items-center">
                        {member.full_name || 'Unnamed Student'}
                        {member.id === currentUser && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <a 
                      href={`mailto:${member.email}`} 
                      className="text-indigo-600 hover:text-indigo-800"
                      aria-label={`Email ${member.full_name || 'team member'}`}
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>

                  {member.student_skills && member.student_skills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.student_skills.map(skill => (
                          <span 
                            key={`${member.id}-${skill.skill_id}`}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {skill.skill_id} ({skill.proficiency_level})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Common Availability Card */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Team Availability
            </h2>
            
            {commonAvailability.length > 0 ? (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Times when all team members are available:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {commonAvailability.map(time => (
                      <li key={time} className="text-sm font-medium text-gray-700 py-1 px-2 bg-white rounded border border-gray-100">
                        {time}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-700">
                  No common availability times found for all team members.
                  You may need to coordinate individually to find meeting times.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
} 