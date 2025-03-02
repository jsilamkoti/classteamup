import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { UserCircle, Users, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import FindTeamButton from '@/components/teams/FindTeamButton'
import TeamAvailabilityCard from '@/components/teams/TeamAvailabilityCard'
import Tooltip from '@/components/ui/Tooltip'
import BrowseStudentsCard from '@/components/dashboard/BrowseStudentsCard'

export const dynamic = 'force-dynamic'

interface ProfileRequirement {
  met: boolean;
  label: string;
}

export default async function StudentDashboard() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Fetch user profile and skills
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const isLookingForTeam = profile?.looking_for_team || false;
  const teamId = profile?.team_id || null;

  // Fetch team information if the user is assigned to a team
  let teamInfo = null;
  let teamMembers: Array<{
    id: string;
    full_name?: string;
    email?: string;
    student_skills?: Array<{
      skill_id: string;
      proficiency_level: number;
    }>;
  }> = [];
  
  if (teamId) {
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (team) {
      teamInfo = team;
      
      // Fetch team members
      if (team.members && team.members.length > 0) {
        const { data: members } = await supabase
          .from('users')
          .select(`
            id,
            full_name,
            email,
            student_skills (skill_id, proficiency_level)
          `)
          .in('id', team.members);
        
        if (members) {
          teamMembers = members;
        }
      }
    }
  }

  const { data: skills } = await supabase
    .from('student_skills')
    .select('skill_id, proficiency_level')
    .eq('user_id', session.user.id)

  // Define and check profile requirements
  const requirements: ProfileRequirement[] = [
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

  const handleFindTeam = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please sign in to continue')
        return
      }

      // Update user's availability status
      const { error } = await supabase
        .from('users')
        .update({
          looking_for_team: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('You are now available for team matching!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Show Team Assignment if user is part of a team */}
      {teamInfo && (
        <Card className="p-6 mb-6 border-green-200 bg-green-50">
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
                    {member.id === session.user.id && (
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
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Profile Completion Card */}
        <Card className="p-6 h-full">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Profile Completion</h2>
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
            initialLookingForTeam={isLookingForTeam} 
            isProfileComplete={completionPercentage === 100} 
          />
        ) : (
          <Link href={`/student-dashboard/team/${teamId}`} className="h-full">
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