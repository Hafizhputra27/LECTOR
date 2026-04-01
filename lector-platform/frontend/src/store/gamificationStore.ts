import { create } from 'zustand'

export interface Badge {
  id: string
  name: string        // title, e.g. "Pelajar Tekun"
  description: string // cara mendapatkan
  iconUrl?: string
  earnedAt?: Date | string
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface GamificationProfile {
  userId: string
  streak: number
  lastActiveDate?: string
  badges: Badge[]
  quizzesCompleted: number
  averageScore: number
}

interface GamificationState {
  profile: GamificationProfile | null
  isLoading: boolean
  newTitleNotification: string | null
  setProfile: (profile: GamificationProfile) => void
  updateStreak: (streak: number) => void
  addBadge: (badge: Badge) => void
  setNewTitleNotification: (title: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useGamificationStore = create<GamificationState>((set) => ({
  profile: null,
  isLoading: false,
  newTitleNotification: null,
  setProfile: (profile) => set({ profile }),
  updateStreak: (streak) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, streak } : null,
    })),
  addBadge: (badge) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, badges: [...state.profile.badges, badge] }
        : null,
    })),
  setNewTitleNotification: (newTitleNotification) => set({ newTitleNotification }),
  setLoading: (isLoading) => set({ isLoading }),
}))
