'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/Card'
import { Users, BookOpen, UserCheck } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function InstructorDashboardPage() {
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
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const loadStats = async () => {
    try {
      setLoading(true)
      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError || !session) {
        console.error('Auth error:', authError)
        return
      }

      // Get total students with detailed error logging
      const studentsQuery = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'student')
      
      // Get unassigned students with detailed error logging
      const unassignedQuery = await supabase
        .from('users')
        .select('id, email, role, looking_for_team')
        .eq('role', 'student')
        .eq('looking_for_team', true)
      
      // Get teams with detailed error logging
      const teamsQuery = await supabase
        .from('teams')
        .select('id, name')
      
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
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="p-6 bg-white shadow-sm hover:shadow transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-full p-3 mr-4`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stat.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      
      {/* Quick Actions */}
      <Card className="p-6 bg-white shadow-sm mt-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/instructor-dashboard/team-formation">
            <Button variant="primary" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Form New Teams
            </Button>
          </Link>
          <Link href="/instructor-dashboard/view-teams">
            <Button variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              View Teams
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
} 