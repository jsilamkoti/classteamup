'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'
import { Upload, Trash2, Loader2 } from 'lucide-react'
import { useProfileStore } from '@/store/useProfileStore'

interface ProfileFormData {
  full_name: string
  bio: string
  visibility: 'public' | 'team_only' | 'private'
  avatar_url?: string
}

// Add file size constant
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export default function ProfileSettings() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<ProfileFormData>({
    full_name: '',
    bio: '',
    visibility: 'public'
  })
  const supabase = createClient()
  const { updateAvatarUrl, setLoading: globalSetLoading } = useProfileStore()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      setProfile({
        full_name: data.full_name || '',
        bio: data.bio || '',
        visibility: data.visibility || 'public',
        avatar_url: data.avatar_url
      })
      
      // Update global state
      updateAvatarUrl(data.avatar_url || null)
    } catch (error) {
      toast.error('Error loading profile')
      console.error('Error:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      globalSetLoading(true) // Update global loading state
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size must be less than 10MB')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Upload new avatar
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'gif'].includes(fileExt || '')) {
        toast.error('Invalid file type. Please use JPG, PNG or GIF')
        return
      }

      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      updateAvatarUrl(publicUrl)
      toast.success('Profile image updated')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error uploading image')
    } finally {
      globalSetLoading(false) // Reset global loading state
    }
  }

  const handleRemoveImage = async () => {
    try {
      globalSetLoading(true) // Update global loading state
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Remove from storage if exists
      if (profile.avatar_url) {
        const fileName = profile.avatar_url.split('/').pop()
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([fileName])
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile(prev => ({ ...prev, avatar_url: undefined }))
      updateAvatarUrl(null)
      toast.success('Profile image removed')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error removing image')
    } finally {
      globalSetLoading(false) // Reset global loading state
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          visibility: profile.visibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Error updating profile')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  console.log('Current avatar_url:', profile.avatar_url) // Debug log

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex items-center space-x-6">
            {/* Profile Image Container */}
            <div className="relative h-24 w-24 group">
              <div className="relative h-full w-full rounded-full overflow-hidden shadow-md transition-all duration-200 ease-in-out group-hover:shadow-lg">
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
                  </div>
                ) : profile.avatar_url ? (
                  <>
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-90"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
                    <span className="text-3xl text-gray-500 font-medium">
                      {profile.full_name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Upload and Remove Buttons */}
            <div className="space-y-2">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Uploading...' : 'Change Photo'}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleImageUpload}
                  disabled={loading}
                />
              </label>
              
              {profile.avatar_url && (
                <button
                  onClick={handleRemoveImage}
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Photo
                </button>
              )}
              
              <p className="text-sm text-gray-500">
                JPG, PNG or GIF up to 10MB
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
              minLength={3}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              required
              minLength={50}
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={profile.visibility}
              onChange={(e) => setProfile({ 
                ...profile, 
                visibility: e.target.value as 'public' | 'team_only' | 'private' 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="public">Public - Visible to all users</option>
              <option value="team_only">Team Only - Visible to team members</option>
              <option value="private">Private - Visible to instructors only</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>
    </div>
  )
} 