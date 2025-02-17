import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { profile, signOut } = useAuth()

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-800">
              ClassTeamUp
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-8">
              {profile?.role === 'instructor' && (
                <>
                  <Link 
                    href="/dashboard/courses" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Courses
                  </Link>
                  <Link 
                    href="/dashboard/teams" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Teams
                  </Link>
                </>
              )}
              {profile?.role === 'student' && (
                <>
                  <Link 
                    href="/dashboard/my-courses" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    My Courses
                  </Link>
                  <Link 
                    href="/dashboard/my-teams" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    My Teams
                  </Link>
                  <Link 
                    href="/dashboard/profile" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {profile?.full_name}
            </span>
            <Button 
              variant="outline" 
              onClick={signOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
} 