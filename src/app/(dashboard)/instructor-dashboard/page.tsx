'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import { Users, BookOpen, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function InstructorDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState([
    {
      name: 'Total Students',
      value: 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Unassigned Students',
      value: 0,
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Active Teams',
      value: 0,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ])

  const supabase = createClientComponentClient()

  const loadStats = async () => {
    try {
      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError || !session) {
        console.error('Auth error:', authError)
        return
      }

      console.log('Authenticated as:', session.user.email)

      // First, let's check if we can access the users table at all
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
      
      console.log('All users in database:', allUsers)

      // Then check specific queries
      const { data: students } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')
      
      console.log('Students only:', students)

      const { data: instructors } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'instructor')
      
      console.log('Instructors only:', instructors)

      // Get total students with detailed error logging
      const studentsQuery = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'student')
      
      console.log('Students query result:', {
        data: studentsQuery.data,
        error: studentsQuery.error,
        status: studentsQuery.status
      })

      // Get unassigned students with detailed error logging
      const unassignedQuery = await supabase
        .from('users')
        .select('id, email, role, looking_for_team')
        .eq('role', 'student')
        .eq('looking_for_team', true)
      
      console.log('Unassigned query result:', {
        data: unassignedQuery.data,
        error: unassignedQuery.error,
        status: unassignedQuery.status
      })

      // Get teams with detailed error logging
      const teamsQuery = await supabase
        .from('teams')
        .select('id, name')
      
      console.log('Teams query result:', {
        data: teamsQuery.data,
        error: teamsQuery.error,
        status: teamsQuery.status
      })

      // Update stats only if we have valid data
      if (!studentsQuery.error && !unassignedQuery.error && !teamsQuery.error) {
        setStats([
          {
            name: 'Total Students',
            value: studentsQuery.data?.length || 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
          },
          {
            name: 'Unassigned Students',
            value: unassignedQuery.data?.length || 0,
            icon: UserCheck,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
          },
          {
            name: 'Active Teams',
            value: teamsQuery.data?.length || 0,
            icon: BookOpen,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
          }
        ])
      }
    } catch (error) {
      console.error('Error in loadStats:', error)
    }
  }

  useEffect(() => {
    loadStats()
    
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'users'
      }, () => {
        console.log('Database change detected')
        loadStats()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleFormTeams = () => {
    router.push('/instructor-dashboard/team-formation')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link href="/instructor-dashboard/team-formation">
              <Button className="w-full">
                Form New Teams
              </Button>
            </Link>

          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display</p>
        </Card>
      </div>
    </div>
  )
} 