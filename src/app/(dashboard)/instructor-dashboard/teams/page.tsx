'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { Loader2, UserPlus, ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

interface Team {
  id: string
  name: string
  course_id: string
  created_at: string
  members: string[]
  memberDetails?: {
    id: string
    full_name: string
    email: string
    skills?: {
      skill_id: string
      proficiency_level: number
    }[]
  }[]
}

export default function TeamsPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [courseId, setCourseId] = useState('27a19b51-dc21-40db-9001-4d63949151c5') // Hardcoded for now

  useEffect(() => {
    fetchTeams()
  }, [courseId])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      
      // Fetch teams for the course
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

      if (teamsError) throw teamsError

      // If no teams, just return
      if (!teamsData || teamsData.length === 0) {
        setTeams([])
        setLoading(false)
        return
      }

      // For each team, fetch details of members
      const teamsWithDetails = await Promise.all(
        teamsData.map(async (team) => {
          // Get member details if team has members
          if (team.members && team.members.length > 0) {
            const { data: members, error: membersError } = await supabase
              .from('users')
              .select(`
                id, 
                full_name, 
                email,
                student_skills (skill_id, proficiency_level)
              `)
              .in('id', team.members)

            if (membersError) {
              console.error('Error fetching team members:', membersError)
              return {
                ...team,
                memberDetails: []
              }
            }

            return {
              ...team,
              memberDetails: members || []
            }
          }

          return {
            ...team,
            memberDetails: []
          }
        })
      )

      setTeams(teamsWithDetails)
    } catch (error) {
      console.error('Error fetching teams:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <div className="flex space-x-4">
          <Link href="/instructor-dashboard">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/instructor-dashboard/team-formation">
            <Button className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Form New Teams
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : teams.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-2xl font-medium text-gray-900 mb-2">No Teams Yet</h2>
            <p className="text-gray-500 mb-6">
              You haven't formed any teams for this course yet.
            </p>
            <Link href="/instructor-dashboard/team-formation">
              <Button>Form Teams</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {teams.map((team) => (
            <Card key={team.id} className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{team.name}</h2>
                  <p className="text-gray-500">
                    Created on {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                  <Users className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-lg font-medium">
                    {team.memberDetails?.length || 0} members
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Skills
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {team.memberDetails?.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {member.full_name || 'Unnamed'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {member.student_skills?.map((skill) => (
                              <span key={`${member.id}-${skill.skill_id}`} 
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {skill.skill_id} ({skill.proficiency_level})
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 