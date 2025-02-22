'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Layout, 
  Users, 
  BookOpen, 
  Users2,
  Calendar,
  MessageSquare,
  Settings,
  PieChart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole: 'student' | 'instructor'
}

interface NavItem {
  name: string
  href: string
  icon: typeof Layout
  roles: Array<'student' | 'instructor'>
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const navigation: NavItem[] = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: PieChart,
      roles: ['student', 'instructor']
    },
    {
      name: 'Courses',
      href: '/dashboard/courses',
      icon: BookOpen,
      roles: ['student', 'instructor']
    },
    {
      name: 'Teams',
      href: '/dashboard/teams',
      icon: Users2,
      roles: ['student', 'instructor']
    },
    {
      name: 'Schedule',
      href: '/dashboard/schedule',
      icon: Calendar,
      roles: ['student', 'instructor']
    },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      icon: MessageSquare,
      roles: ['student', 'instructor']
    },
    {
      name: 'Students',
      href: '/dashboard/students',
      icon: Users,
      roles: ['instructor']
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['student', 'instructor']
    },
  ]

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-3 py-2 text-sm font-medium border-l-4'
                  )}
                >
                  <Icon
                    className={cn(
                      isActive
                        ? 'text-indigo-600'
                        : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
} 