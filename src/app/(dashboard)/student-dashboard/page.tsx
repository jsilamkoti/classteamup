import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { UserCircle, Users, Search } from 'lucide-react'

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
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

        {/* Find Team Card */}
        <Link href="/student-dashboard/teams" className="h-full">
          <Card className={`p-6 h-full flex flex-col justify-between hover:shadow-md transition-shadow ${
            completionPercentage < 100 ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-8 w-8 text-green-600" />
              <h3 className="text-xl font-medium">Find a Team</h3>
            </div>
            <p className="text-sm text-gray-600">
              Browse available teams or find teammates
            </p>
          </Card>
        </Link>

        {/* Browse Students Card */}
        <Link href="/student-dashboard/students" className="h-full">
          <Card className={`p-6 h-full flex flex-col justify-between hover:shadow-md transition-shadow ${
            completionPercentage < 100 ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <Search className="h-8 w-8 text-purple-600" />
              <h3 className="text-xl font-medium">Browse Students</h3>
            </div>
            <p className="text-sm text-gray-600">
              Find potential teammates based on skills
            </p>
          </Card>
        </Link>
      </div>
    </div>
  )
} 