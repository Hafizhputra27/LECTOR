import { create } from 'zustand'

export interface Badge {
  id: string
  name: string
  description: string
  iconUrl?: string
  earnedAt?: Date
}

export interface GamificationProfile {
  userId: string
  xp: number
  level: number
  streak: number
  lastActiveDate?: string
  badges: Badge[]
}

interface GamificationState {
  profile: GamificationProfile | null
  isLoading: boolean
  levelUpNotification: number | null
  setProfile: (profile: GamificationProfile) => void
  updateXP: (xp: number, level: number) => void
  updateStreak: (streak: number) => void
  addBadge: (badge: Badge) => void
  setLevelUpNotification: (level: number | null) => void
  setLoading: (loading: boolean) => void
}

export const useGamificationStore = create<GamificationState>((set) => ({
  profile: null,
  isLoading: false,
  levelUpNotification: null,
  setProfile: (profile) => set({ profile }),
  updateXP: (xp, level) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, xp, level } : null,
    })),
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
  setLevelUpNotification: (levelUpNotification) => set({ levelUpNotification }),
  setLoading: (isLoading) => set({ isLoading }),
}))
