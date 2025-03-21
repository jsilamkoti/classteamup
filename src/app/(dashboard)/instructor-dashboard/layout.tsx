'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, UserPlus, Layers, Home, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function InstructorDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-sm h-full">
        <nav className="p-4 space-y-1">
          <Link 
            href="/dashboard" 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
              isActive('/dashboard') ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
            )}
          >
            <Home className={cn("mr-3 h-5 w-5", isActive('/dashboard') ? "text-indigo-500" : "text-gray-500")} />
            Dashboard Home
          </Link>
          <Link 
            href="/instructor-dashboard/view-teams" 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
              isActive('/instructor-dashboard/view-teams') ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
            )}
          >
            <Users className={cn("mr-3 h-5 w-5", isActive('/instructor-dashboard/view-teams') ? "text-indigo-500" : "text-gray-500")} />
            View Teams
          </Link>
          <Link 
            href="/instructor-dashboard/team-formation" 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
              isActive('/instructor-dashboard/team-formation') ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
            )}
          >
            <UserPlus className={cn("mr-3 h-5 w-5", isActive('/instructor-dashboard/team-formation') ? "text-indigo-500" : "text-gray-500")} />
            Team Formation
          </Link>
          <Link 
            href="/settings/profile" 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
              isActive('/settings/profile') ? "text-indigo-600 bg-indigo-50" : "text-gray-700"
            )}
          >
            <Settings className={cn("mr-3 h-5 w-5", isActive('/settings/profile') ? "text-indigo-500" : "text-gray-500")} />
            Settings
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <main className="py-6 px-6">
          {children}
        </main>
      </div>
    </div>
  )
} 