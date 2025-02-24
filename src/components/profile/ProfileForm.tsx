'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

interface Skill {
  id: string
  name: string
  category: string
}

interface SkillWithProficiency {
  skillId: string
  proficiency: number
}

export default function ProfileForm() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    skills: [] as SkillWithProficiency[]
  })
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('category')

      if (error) throw error
      setAvailableSkills(data || [])
    } catch (error) {
      console.error('Error loading skills:', error)
    }
  }

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      // Load user skills with proficiency
      const { data: userSkills } = await supabase
        .from('student_skills')
        .select('skill_id, proficiency_level')
        .eq('user_id', user.id)

      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          skills: userSkills?.map(s => ({
            skillId: s.skill_id,
            proficiency: s.proficiency_level
          })) || []
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      // Update profile
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Delete existing skills
      const { error: deleteError } = await supabase
        .from('student_skills')
        .delete()
        .eq('user_id', user.id)

      if (deleteError) throw deleteError

      // Insert new skills with proficiency
      if (formData.skills.length > 0) {
        const { error: skillsError } = await supabase
          .from('student_skills')
          .insert(
            formData.skills.map(skill => ({
              user_id: user.id,
              skill_id: skill.skillId,
              proficiency_level: skill.proficiency
            }))
          )

        if (skillsError) throw skillsError
      }

      toast.success('Profile updated successfully!')
      window.location.href = '/student-dashboard'
    } catch (error: any) {
      console.error('Error saving profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSkillToggle = (skillId: string, checked: boolean) => {
    const newSkills = checked
      ? [...formData.skills, { skillId, proficiency: 1 }]
      : formData.skills.filter(s => s.skillId !== skillId)
    setFormData({ ...formData, skills: newSkills })
  }

  const handleProficiencyChange = (skillId: string, level: number) => {
    const newSkills = formData.skills.map(s => 
      s.skillId === skillId ? { ...s, proficiency: level } : s
    )
    setFormData({ ...formData, skills: newSkills })
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Tell us about yourself, your interests, and what you're looking for in a team..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills and Proficiency
          </label>
          <div className="space-y-4">
            {availableSkills.map((skill) => {
              const userSkill = formData.skills.find(s => s.skillId === skill.id)
              return (
                <div key={skill.id} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 w-48">
                    <input
                      type="checkbox"
                      id={skill.id}
                      checked={!!userSkill}
                      onChange={(e) => handleSkillToggle(skill.id, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={skill.id} className="text-sm text-gray-700">
                      {skill.name}
                    </label>
                  </div>
                  
                  {userSkill && (
                    <select
                      value={userSkill.proficiency}
                      onChange={(e) => handleProficiencyChange(skill.id, parseInt(e.target.value))}
                      className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value={1}>Beginner</option>
                      <option value={2}>Elementary</option>
                      <option value={3}>Intermediate</option>
                      <option value={4}>Advanced</option>
                      <option value={5}>Expert</option>
                    </select>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </Card>
  )
} 