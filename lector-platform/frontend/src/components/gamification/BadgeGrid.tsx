import React from 'react'
import type { Badge } from '../../store/gamificationStore'

interface BadgeGridProps {
  badges: Badge[]
}

function BadgeIcon({ badge }: { badge: Badge }) {
  if (badge.iconUrl) {
    return <img src={badge.iconUrl} alt={badge.name} className="w-7 h-7 object-contain" />
  }
  const name = badge.name.toLowerCase()
  if (name.includes('streak') || name.includes('hari')) {
    return (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
        <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
      </svg>
    )
  }
  if (name.includes('quiz') || name.includes('soal')) {
    return (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  }
  if (name.includes('sempurna') || name.includes('perfect')) {
    return (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )
  }
  // default medal
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
        <div className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <p className="text-sm">Belum ada badge yang diperoleh</p>
        <p className="text-xs mt-1">Selesaikan aktivitas belajar untuk mendapatkan badge!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {badges.map((badge) => {
        const earned = !!badge.earnedAt
        return (
          <div
            key={badge.id}
            className={`rounded-xl p-3 border flex flex-col items-center text-center transition-all duration-200 ${
              earned
                ? 'border-[#7c6af7]/40 hover:border-[#7c6af7]/70 hover:scale-[1.02]'
                : 'opacity-40 grayscale'
            }`}
            style={{ background: earned ? 'rgba(124,106,247,0.08)' : 'var(--surface-2)' }}
          >
            <span className={`mb-2 ${earned ? 'text-[#9d8ff9]' : 'text-gray-500'}`}>
              <BadgeIcon badge={badge} />
            </span>
            <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text)' }}>{badge.name}</p>
            <p className="text-xs mt-1 leading-tight" style={{ color: 'var(--text-muted)' }}>{badge.description}</p>
            {earned && badge.earnedAt && (
              <p className="text-xs text-[#9d8ff9] mt-1">
                {new Date(badge.earnedAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default BadgeGrid
