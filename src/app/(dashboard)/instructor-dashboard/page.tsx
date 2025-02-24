import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card } from '@/components/ui/Card'
import { Users, BookOpen, UserCheck } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InstructorDashboard() {
  const supabase = createServerComponentClient({ cookies })

  // Fetch statistics
  const { count: totalStudents } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'student')

  const { count: totalTeams } = await supabase
    .from('teams')
    .select('id', { count: 'exact', head: true })

  const { count: unassignedStudents } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'student')
    .eq('looking_for_team', true)

  const stats = [
    {
      name: 'Total Students',
      value: totalStudents || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Active Teams',
      value: totalTeams || 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Unassigned Students',
      value: unassignedStudents || 0,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-full p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link 
              href="/instructor-dashboard/team-formation"
              className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Form New Teams
            </Link>
            <Link 
              href="/instructor-dashboard/courses"
              className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Manage Courses
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-sm text-gray-500">
            No recent activity to display
          </p>
        </Card>
      </div>
    </div>
  )
} 