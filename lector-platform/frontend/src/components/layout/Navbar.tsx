import { useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import ThemeToggle from '../ThemeToggle'

const PAGE_TITLES: Record<string, string> = {
  '/chat': '',
  '/quiz': 'Quiz & Latihan',
  '/exam': 'Ujian Simulasi',
  '/analytics': 'Analitik Pribadi',
  '/history': 'Riwayat Belajar',
  '/dashboard': 'Dashboard',
}

interface NavbarProps {
  onMenuToggle: () => void
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)

  const pageTitle = PAGE_TITLES[pathname] ?? ''

  const displayName =
    user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Pengguna'
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-14 glass flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-10">
        {/* Left: hamburger + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {pageTitle && (
            <h1 className="font-heading text-base font-semibold" style={{ color: 'var(--text)' }}>{pageTitle}</h1>
          )}
        </div>

      {/* Right: theme toggle + user name + avatar */}
      <div className="flex items-center gap-2.5">
        <ThemeToggle />
        <span className="hidden sm:block text-sm text-[var(--text-muted)] font-body">{displayName}</span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6af7] to-[#9d8ff9] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10">
          {initials}
        </div>
      </div>
    </header>
  )
}
