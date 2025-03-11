'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import { UserCircle, Users, Search } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import FindTeamButton from '@/components/teams/FindTeamButton'
import TeamAvailabilityCard from '@/components/teams/TeamAvailabilityCard'
import BrowseStudentsCard from '@/components/dashboard/BrowseStudentsCard'

export default function StudentDashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [skills, setSkills] = useState<any[]>([])
  const [teamInfo, setTeamInfo] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        
        // Fetch user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (userProfile) {
          setProfile(userProfile)
          
          // Fetch user skills
          const { data: userSkills } = await supabase
            .from('student_skills')
            .select('skill_id, proficiency_level')
            .eq('user_id', session.user.id)
          
          setSkills(userSkills || [])
          
          // Fetch team if user is in one
          if (userProfile.team_id) {
            const { data: team } = await supabase
              .from('teams')
              .select('*')
              .eq('id', userProfile.team_id)
              .single()
            
            setTeamInfo(team)

            // Fetch team members
            if (team) {
              const { data: members } = await supabase
                .from('users')
                .select(`
                  id,
                  full_name,
                  email,
                  student_skills (skill_id, proficiency_level)
                `)
                .in('id', team.members || [])
              
              setTeamMembers(members || [])
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Define and check profile requirements
  const requirements = [
    {
      met: Boolean(profile?.full_name?.length >= 3),
      label: 'Full name (minimum 3 characters)'
    },
    {
      met: Boolean(profile?.bio?.length >= 50),
      label: 'Bio (minimum 50 characters)'
    },
    {
      met: Boolean(skills && skills.length >= 3),
      label: 'Skills (minimum 3 skills)'
    }
  ]

  const completedRequirements = requirements.filter(req => req.met).length
  const totalRequirements = requirements.length
  const completionPercentage = (completedRequirements / totalRequirements) * 100

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
      
      {/* Show Team Assignment if user is part of a team */}
      {teamInfo && (
        <Card className="p-6 mb-6 border-green-200 bg-green-50 hover:shadow transition-shadow">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              Your Team: {teamInfo.name}
            </h2>
            <p className="text-gray-600 mt-1">
              You've been assigned to a team! Here are your team members:
            </p>
          </div>
          
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div key={member.id} className="flex items-start p-3 bg-white rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {member.full_name || 'Unnamed Student'}
                    {member.id === profile?.id && (
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                  
                  {member.student_skills && member.student_skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {member.student_skills.map(skill => (
                        <span 
                          key={`${member.id}-${skill.skill_id}`}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          {skill.skill_id} ({skill.proficiency_level})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Link href={`/student-dashboard/team/${teamInfo.id}`}>
              <Button variant="primary">
                View Team Details
              </Button>
            </Link>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Completion Card */}
        <Card className="p-6 bg-white shadow-sm hover:shadow transition-shadow">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Profile Completion</h2>
              <span className={`text-xl font-bold ${
                completionPercentage === 100 ? 'text-green-600' : 'text-indigo-600'
              }`}>
                {Math.round(completionPercentage)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  completionPercentage === 100 ? 'bg-green-600' : 'bg-indigo-600'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {completionPercentage === 100 ? (
              <p className="text-sm text-green-600 font-medium">
                ✓ Your profile is complete and ready for team matching!
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-700 font-medium">
                  Complete these items to finish your profile:
                </p>
                <ul className="space-y-1">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-center text-sm">
                      {req.met ? (
                        <span className="text-green-600 mr-2">✓</span>
                      ) : (
                        <span className="text-indigo-600 mr-2">○</span>
                      )}
                      <span className={req.met ? 'text-gray-500' : 'text-gray-700'}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
        
        {/* Action Cards */}
        {/* View/Complete Profile Card */}
        <Link href="/student-dashboard/profile" className="h-full">
          <Card className={`p-6 h-full flex flex-col justify-between hover:shadow-md transition-shadow ${
            completionPercentage < 100 ? 'border-indigo-200 bg-indigo-50' : ''
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <UserCircle className={`h-8 w-8 ${
                completionPercentage === 100 ? 'text-gray-600' : 'text-indigo-600'
              }`} />
              <h3 className="text-xl font-medium">
                {completionPercentage === 100 ? 'View Profile' : 'Complete Profile'}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {completionPercentage === 100 
                ? 'Review and update your profile'
                : 'Add missing information to complete your profile'}
            </p>
          </Card>
        </Link>

        {/* Find Team Card - only show if not already in a team */}
        {!teamInfo ? (
          <TeamAvailabilityCard 
            initialLookingForTeam={profile?.looking_for_team} 
            isProfileComplete={completionPercentage === 100} 
          />
        ) : (
          <Link href="/student-dashboard/my-team" className="h-full">
            <Card className="p-6 h-full flex flex-col justify-between hover:shadow-md transition-shadow border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-8 w-8 text-green-600" />
                <h3 className="text-xl font-medium">View Team</h3>
              </div>
              <p className="text-sm text-gray-600">
                View your team details and connect with your teammates
              </p>
            </Card>
          </Link>
        )}

        {/* Browse Students Card */}
        <BrowseStudentsCard completionPercentage={completionPercentage} />
      </div>
    </div>
  )
} 