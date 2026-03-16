import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'
import { useGamificationStore } from '../store/gamificationStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function fetchGamificationProfile(token: string) {
  try {
    const res = await fetch(`${API_BASE}/api/gamification/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function useAuth() {
  const { user, session, isLoading, setSession, setLoading } = useAuthStore()
  const setProfile = useGamificationStore((s) => s.setProfile)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setLoading(false)

      if (session?.access_token) {
        const profile = await fetchGamificationProfile(session.access_token)
        if (profile) setProfile(profile)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)

      if (session?.access_token) {
        const profile = await fetchGamificationProfile(session.access_token)
        if (profile) setProfile(profile)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setSession, setLoading, setProfile])

  return { user, session, isLoading }
}
