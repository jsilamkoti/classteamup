'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { UserCircle, Mail, Clock, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfileProps {
  userId: string
}

interface UserData {
  id: string
  full_name: string
  email: string
  bio: string
  availability_status: string
  looking_for_team: boolean
  role: string
}

interface UserSkill {
  skill: {
    id: string
    name: string
    category: string
  }
  proficiency_level: number
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [skills, setSkills] = useState<UserSkill[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadUserProfile()
  }, [userId])

  const loadUserProfile = async () => {
    try {
      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Fetch user skills with skill details
      const { data: skillsData, error: skillsError } = await supabase
        .from('student_skills')
        .select(`
          proficiency_level,
          skill:skills (
            id,
            name,
            category
          )
        `)
        .eq('user_id', userId)

      if (skillsError) throw skillsError

      // Map the data to match UserSkill interface
      setSkills(skillsData.map((item: any) => ({
        proficiency_level: item.proficiency_level,
        skill: {
          id: item.skill.id,
          name: item.skill.name,
          category: item.skill.category
        }
      })))

      setUser(userData)
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">User not found</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500 capitalize">
              {user.availability_status}
            </span>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h3 className="text-sm font-medium text-gray-500">About</h3>
          <p className="mt-1 text-gray-900">{user.bio || 'No bio provided'}</p>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {skills.map((skill) => (
              <div 
                key={skill.skill.id} 
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{skill.skill.name}</p>
                  <p className="text-xs text-gray-500">{skill.skill.category}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: skill.proficiency_level }).map((_, i) => (
                    <Check key={i} className="h-4 w-4 text-indigo-600" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Status */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {user.looking_for_team ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Looking for team
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Not looking for team
              </span>
            )}
          </div>
          <Button
            onClick={() => {
              window.location.href = `mailto:${user.email}`
            }}
            className="inline-flex items-center space-x-2"
          >
            <Mail className="h-4 w-4" />
            <span>Contact</span>
          </Button>
        </div>
      </div>
    </Card>
  )
} 