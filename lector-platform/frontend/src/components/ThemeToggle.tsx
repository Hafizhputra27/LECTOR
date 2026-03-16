import { useThemeStore } from '../store/themeStore'

export default function ThemeToggle() {
  const { theme, toggle } = useThemeStore()
  const isLight = theme === 'light'

  return (
    <button
      onClick={toggle}
      aria-label="Toggle tema"
      className="relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#7c6af7]/50 flex-shrink-0"
      style={{
        background: isLight
          ? 'linear-gradient(135deg,#e0e7ff,#c7d2fe)'
          : 'linear-gradient(135deg,#1e1b4b,#312e81)',
      }}
    >
      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[11px] select-none pointer-events-none">🌙</span>
      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px] select-none pointer-events-none">☀️</span>
      <span
        className="absolute top-0.5 w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center text-[13px]"
        style={{
          left: isLight ? 'calc(100% - 1.75rem)' : '0.125rem',
          background: 'linear-gradient(135deg,#7c6af7,#9d8ff9)',
        }}
      >
        {isLight ? '☀️' : '🌙'}
      </span>
    </button>
  )
}
