'use client'

import { Card } from '@/components/ui/Card'
import { 
  BookOpen, 
  Users, 
  Calendar,
  Clock,
  Users2
} from 'lucide-react'

interface OverviewProps {
  user: {
    full_name: string
    role: 'student' | 'instructor'
  }
  dashboardData: any[] // We'll type this properly based on your database schema
}

export default function DashboardOverview({ user, dashboardData }: OverviewProps) {
  const stats = [
    {
      name: 'Enrolled Courses',
      value: dashboardData?.length || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Teams',
      value: dashboardData?.reduce((acc: number, curr: any) => 
        acc + (curr.teams?.length || 0), 0),
      icon: Users2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Upcoming Sessions',
      value: '3', // You'll need to implement this
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Hours Spent',
      value: '12.5', // You'll need to implement this
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          {/* Add recent activity list here */}
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium">Upcoming Deadlines</h3>
          {/* Add deadlines list here */}
        </Card>
      </div>
    </div>
  )
} 