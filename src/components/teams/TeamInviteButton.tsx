'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface TeamInviteButtonProps {
  studentId: string
  studentName: string
}

export default function TeamInviteButton({ studentId, studentName }: TeamInviteButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleInvite = async () => {
    try {
      setLoading(true)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to send invitations')
        return
      }

      // Check if invitation already exists
      const { data: existingInvite } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('user_id', studentId)
        .eq('status', 'pending')
        .single()

      if (existingInvite) {
        toast.error('An invitation is already pending for this student')
        return
      }

      // Create invitation
      const { error } = await supabase
        .from('team_invitations')
        .insert({
          user_id: studentId,
          team_id: null, // We'll implement team selection later
          status: 'pending',
          created_by: user.id
        })

      if (error) throw error

      toast.success(`Invitation sent to ${studentName}`)
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleInvite}
      disabled={loading}
      className={`px-3 py-1 text-sm text-white bg-indigo-600 rounded-md 
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
    >
      {loading ? 'Sending...' : 'Invite'}
    </button>
  )
} 