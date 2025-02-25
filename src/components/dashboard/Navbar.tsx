'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Menu, Bell, Settings, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useProfileStore } from '@/store/useProfileStore'

interface NavbarProps {
  user?: {
    id: string 
    full_name: string
    email: string
    role: string
  }
}

export default function Navbar({ user }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { avatarUrl, updateAvatarUrl, isLoading, setLoading } = useProfileStore()

  // Add this useEffect to load the avatar URL on mount
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        if (!user) return

        setLoading(true)
        const { data, error } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        if (error) throw error
        
        if (data?.avatar_url) {
          updateAvatarUrl(data.avatar_url)
        }
      } catch (error) {
        console.error('Error loading profile image:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfileImage()
  }, [user?.id]) // Depend on user.id to reload if user changes

  // If no user, show loading state or minimal navbar
  if (!user) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Image
                src="/logo.png"
                alt="ClassTeamUp"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Signed out successfully')
      router.replace('/auth/signin')
    } catch (error) {
      toast.error('Error signing out')
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              className="md:hidden px-4 inline-flex items-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <Image
                src="/logo.png"
                alt="ClassTeamUp"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
            </div>
          </div>

          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>

            <div className="ml-3 relative">
              <button
                className="flex items-center rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="h-4 w-4 text-gray-600 animate-spin" />
                    </div>
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover transition-opacity"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-indigo-600 flex items-center justify-center transition-colors">
                      <span className="text-sm font-medium text-white">
                        {user.full_name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  style={{
                    minWidth: '200px',
                    maxWidth: '280px'
                  }}
                >
                  <div className="py-1">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => router.push('/settings/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

const styles = `
.fixed-width-container {
  width: 32px; /* Same as h-8 */
  height: 32px; /* Same as w-8 */
  display: inline-block;
}
` 