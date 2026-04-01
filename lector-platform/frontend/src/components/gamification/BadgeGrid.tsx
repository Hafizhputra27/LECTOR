import React from 'react'
import type { Badge } from '../../store/gamificationStore'

interface BadgeGridProps {
  badges: Badge[]
}

// Rarity colors for title cards
const RARITY_STYLES: Record<string, { border: string; bg: string; text: string; label: string }> = {
  legendary: {
    border: 'rgba(246,173,85,0.6)',
    bg: 'rgba(246,173,85,0.08)',
    text: '#f6ad55',
    label: 'Legendaris',
  },
  epic: {
    border: 'rgba(124,106,247,0.6)',
    bg: 'rgba(124,106,247,0.08)',
    text: '#9d8ff9',
    label: 'Epik',
  },
  rare: {
    border: 'rgba(96,165,250,0.5)',
    bg: 'rgba(96,165,250,0.06)',
    text: '#60a5fa',
    label: 'Langka',
  },
  common: {
    border: 'rgba(255,255,255,0.12)',
    bg: 'rgba(255,255,255,0.03)',
    text: 'var(--text-muted)',
    label: 'Umum',
  },
}

function getRarity(badge: Badge): string {
  if (badge.rarity) return badge.rarity
  const name = badge.name.toLowerCase()
  if (name.includes('sempurna') || name.includes('master') || name.includes('legenda')) return 'legendary'
  if (name.includes('streak') || name.includes('konsisten') || name.includes('juara')) return 'epic'
  if (name.includes('quiz') || name.includes('aktif') || name.includes('rajin')) return 'rare'
  return 'common'
}

const TitleCard: React.FC<{ badge: Badge; earned: boolean }> = ({ badge, earned }) => {
  const rarity = getRarity(badge)
  const style = RARITY_STYLES[rarity] ?? RARITY_STYLES.common

  return (
    <div
      className={`relative rounded-xl p-4 flex flex-col gap-2 transition-all duration-200 ${
        earned ? 'hover:scale-[1.02] hover:shadow-lg' : 'opacity-40 grayscale'
      }`}
      style={{
        background: earned ? style.bg : 'var(--surface-2)',
        border: `1px solid ${earned ? style.border : 'var(--border)'}`,
        boxShadow: earned ? `0 0 12px ${style.border}40` : 'none',
      }}
    >
      {/* Rarity label */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{
            color: earned ? style.text : 'var(--text-muted)',
            background: earned ? `${style.border}20` : 'transparent',
          }}
        >
          {style.label}
        </span>
        {earned && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: style.text }}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>

      {/* Title name */}
      <p
        className="font-heading font-bold text-base leading-tight"
        style={{ color: earned ? style.text : 'var(--text-muted)' }}
      >
        {badge.name}
      </p>

      {/* Description */}
      <p className="text-xs font-body leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {badge.description}
      </p>

      {/* Earned date */}
      {earned && badge.earnedAt && (
        <p className="text-xs font-mono mt-auto" style={{ color: style.text, opacity: 0.7 }}>
          Diraih {new Date(badge.earnedAt as string).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      )}

      {/* Lock icon for unearned */}
      {!earned && (
        <div className="flex items-center gap-1 mt-auto">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>Belum diraih</span>
        </div>
      )}
    </div>
  )
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
          <svg className="w-7 h-7" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>Belum ada gelar yang diraih</p>
        <p className="text-xs mt-1 font-body" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          Selesaikan quiz, ujian, dan pertahankan streak untuk mendapatkan gelar!
        </p>
      </div>
    )
  }

  const earned = badges.filter((b) => !!b.earnedAt)
  const unearned = badges.filter((b) => !b.earnedAt)

  return (
    <div className="space-y-4">
      {earned.length > 0 && (
        <div>
          <p className="text-xs font-body font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Gelar Diraih ({earned.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {earned.map((badge) => (
              <TitleCard key={badge.id} badge={badge} earned={true} />
            ))}
          </div>
        </div>
      )}
      {unearned.length > 0 && (
        <div>
          <p className="text-xs font-body font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Gelar Tersedia ({unearned.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unearned.map((badge) => (
              <TitleCard key={badge.id} badge={badge} earned={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BadgeGrid
