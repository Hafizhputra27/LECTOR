import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuthStore } from '../store/authStore'

type Tab = 'login' | 'register'

function mapErrorMessage(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Email atau password salah. Silakan coba lagi.'
  }
  if (
    message.includes('User already registered') ||
    message.includes('already been registered')
  ) {
    return 'Email ini sudah terdaftar. Silakan masuk.'
  }
  return 'Terjadi kesalahan. Silakan coba lagi.'
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { setSession } = useAuthStore()

  const [activeTab, setActiveTab] = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [fullName, setFullName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
        navigate('/dashboard', { replace: true })
      }
    })
  }, [navigate, setSession])

  function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    setError(null)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })
      if (error) {
        setError(mapErrorMessage(error.message))
        return
      }
      if (data.session) {
        setSession(data.session)
        navigate('/dashboard', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    })
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: { full_name: fullName },
        },
      })
      if (error) {
        setError(mapErrorMessage(error.message))
        return
      }
      const user = data.user
      if (user) {
        // Insert into profiles table
        await supabase
          .from('profiles')
          .insert({ id: user.id, full_name: fullName })
      }
      if (data.session) {
        setSession(data.session)
        navigate('/dashboard', { replace: true })
      } else {
        // Email confirmation required — still navigate to dashboard
        // (Supabase may return null session if email confirmation is enabled)
        navigate('/dashboard', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 font-body" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#7c6af7]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#9d8ff9]/6 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <img src="/logo_lector.png" alt="LECTOR" className="h-12 w-auto object-contain" />
          </div>
          <p className="text-gray-500 text-sm font-body">Platform Belajar Cerdas Berbasis AI</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors font-body ${
                activeTab === 'login'
                  ? 'text-[#9d8ff9] border-b-2 border-[#7c6af7]'
                  : 'hover:text-[var(--text)]'
              }`}
              style={activeTab !== 'login' ? { color: 'var(--text-muted)' } : undefined}
            >
              Masuk
            </button>
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-4 text-sm font-semibold transition-colors font-body ${
                activeTab === 'register'
                  ? 'text-[#9d8ff9] border-b-2 border-[#7c6af7]'
                  : 'hover:text-[var(--text)]'
              }`}
              style={activeTab !== 'register' ? { color: 'var(--text-muted)' } : undefined}
            >
              Daftar
            </button>
          </div>

          <div className="p-6">
            {/* Error message */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5 font-medium font-body" style={{ color: 'var(--text-muted)' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7c6af7]/50 transition-all font-body"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5 font-medium font-body" style={{ color: 'var(--text-muted)' }}>Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7c6af7]/50 transition-all font-body"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 font-body"
                >
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>atau</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-body hover:opacity-80"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Masuk dengan Google
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5 font-medium font-body" style={{ color: 'var(--text-muted)' }}>Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap kamu"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7c6af7]/50 transition-all font-body"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5 font-medium font-body" style={{ color: 'var(--text-muted)' }}>Email</label>
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7c6af7]/50 transition-all font-body"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5 font-medium font-body" style={{ color: 'var(--text-muted)' }}>Password</label>
                  <input
                    type="password"
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#7c6af7]/50 transition-all font-body"
                    style={{ background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2 font-body"
                >
                  {loading ? 'Memproses...' : 'Daftar'}
                </button>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>atau</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-body hover:opacity-80"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Masuk dengan Google
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6 font-body">
          © 2025 LECTOR — PKM-KC 2025
        </p>
      </div>
    </div>
  )
}
