'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Menu, Bell, Settings, LogOut, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useProfileStore } from '@/store/useProfileStore'
import logo from '/public/logo.png';

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
  }, [user?.id])

    if (!user) {
    return (
      <nav className="bg-[#18A5A7] shadow-md text-white py-3">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Image
                src="/logo.png"
                alt="ClassTeamUp"
                width={50}
                height={50}
                className="h-14 w-auto"
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
    <nav className="bg-[#18A5A7] shadow-md text-white py-4">
      {/* Increased py-4 for more vertical padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {" "}
          {/* Use justify-between */}
          {/* Left Side: Logo and Title */}
          <div className="flex items-center">
            <button
              className="md:hidden px-4 inline-flex items-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-8 w-8" />
            </button>
            <Image
              src="/logo.png"
              alt="ClassTeamUp"
              width={55}
              height={55}
              className="h-16 w-auto mr-3"
            />
            <span
              className="font-bold text-3xl text-white"
              style={{
                textShadow:
                  "0px 1px 2px rgba(255,255,255,0.8), 0px -1px 2px rgba(0,0,0,0.3)", //Increased Blur
              }}
            >
              ClassTeamUp
            </span>
          </div>
          {/* Right Side: Bell and Profile */}
          <div className="flex items-center">
            <button
              className="p-3 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors text-white"
              onClick={() => {}}
            >
              <Bell className="h-7 w-7" />
            </button>

            <div className="ml-4 relative">
              <button
                className="flex items-center rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white text-white"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="relative h-11 w-11 rounded-full overflow-hidden">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
                    </div>
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover transition-opacity"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-300 flex items-center justify-center transition-colors text-white">
                      <span className="text-lg font-medium text-white">
                        {user.full_name[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 text-gray-700"
                  style={{ minWidth: "200px", maxWidth: "280px" }}
                >
                  <div className="py-1">
                    <div className="px-4 py-3 text-sm text-gray-700 border-b">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => router.push("/settings/profile")}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-200 transition-colors flex items-center"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
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