import { create } from 'zustand'

interface ProfileState {
  avatarUrl: string | null
  isLoading: boolean
  updateAvatarUrl: (url: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  avatarUrl: null,
  isLoading: false,
  updateAvatarUrl: (url) => set({ avatarUrl: url }),
  setLoading: (loading) => set({ isLoading: loading })
})) 