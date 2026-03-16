import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/auth', { replace: true })
      }
    })
  }, [navigate, setSession])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-body">
      <p className="text-gray-400 text-sm">Memproses autentikasi...</p>
    </div>
  )
}
