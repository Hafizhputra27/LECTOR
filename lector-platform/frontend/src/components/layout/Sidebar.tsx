import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useGamificationStore } from '../../store/gamificationStore'
import { supabase } from '../../services/supabase'

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]

function getXPProgress(xp: number, level: number) {
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextLevelXP = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  if (level >= LEVEL_THRESHOLDS.length) return { current: xp, next: nextLevelXP, percent: 100 }
  const progress = xp - currentLevelXP
  const range = nextLevelXP - currentLevelXP
  return {
    current: xp,
    next: nextLevelXP,
    percent: Math.min(100, Math.floor((progress / range) * 100)),
  }
}

const navItems = [
  { to: '/chat', icon: '💬', label: 'Chat AI' },
  { to: '/quiz', icon: '🎯', label: 'Quiz & Latihan' },
  { to: '/exam', icon: '📝', label: 'Ujian Simulasi' },
  { to: '/analytics', icon: '📊', label: 'Analitik Pribadi' },
  { to: '/history', icon: '📚', label: 'Riwayat Belajar' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const signOutStore = useAuthStore((s) => s.signOut)
  const profile = useGamificationStore((s) => s.profile)

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Pengguna'
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const xpInfo = profile ? getXPProgress(profile.xp, profile.level) : null

  async function handleSignOut() {
    await supabase.auth.signOut()
    signOutStore()
    navigate('/auth')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 flex flex-col
          bg-[var(--surface)]/95 backdrop-blur-xl border-r border-[var(--border)]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo + teks LECTOR */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <img src="/logo_lector.png" alt="LECTOR" className="h-8 w-auto object-contain" />
            <span className="font-heading text-lg font-bold bg-gradient-to-r from-[#7c6af7] to-[#9d8ff9] bg-clip-text text-transparent tracking-wide">
              LECTOR
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-white transition-colors p-1 rounded-md hover:bg-white/5"
            aria-label="Tutup sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body transition-all duration-150 ${
                  isActive
                    ? 'bg-[#7c6af7]/15 text-[#7c6af7] font-semibold'
                    : 'text-[var(--text-muted)] hover:bg-[#7c6af7]/8 hover:text-[var(--text)]'
                }`
              }
            >
              <span className="text-base w-5 text-center">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-3 pb-4 border-t border-[var(--border)] pt-4 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c6af7] to-[#9d8ff9] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ring-2 ring-white/10">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold font-body truncate" style={{ color: 'var(--text)' }}>{displayName}</p>
              {profile && (
                <span className="inline-block text-xs px-1.5 py-0.5 rounded-md bg-[#f6ad55]/15 text-[#f6ad55] font-mono font-medium">
                  Lv.{profile.level}
                </span>
              )}
            </div>
          </div>

          {/* XP bar */}
          {xpInfo && (
            <div className="space-y-1 px-1">
              <div className="flex justify-between text-xs text-gray-500 font-body">
                <span>{xpInfo.current} XP</span>
                <span>{xpInfo.next} XP</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${xpInfo.percent}%`,
                    background: 'linear-gradient(90deg, #7c6af7, #9d8ff9)',
                  }}
                />
              </div>
            </div>
          )}

          {profile && (
            <p className="text-xs text-gray-500 font-body px-1">
              🔥 <span className="text-[#f6ad55] font-semibold">{profile.streak}</span> hari streak
            </p>
          )}

          <button
            onClick={handleSignOut}
            className="w-full text-left text-xs text-gray-500 hover:text-red-400 transition-colors font-body py-1.5 px-1 flex items-center gap-2 rounded-lg hover:bg-red-500/5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>
    </>
  )
}
