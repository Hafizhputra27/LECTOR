import React from 'react'
import type { Badge } from '../../store/gamificationStore'

interface BadgeGridProps {
  badges: Badge[]
}

function getBadgeEmoji(badge: Badge): string {
  // Try to infer from name/description
  const name = badge.name.toLowerCase()
  if (name.includes('streak') || name.includes('hari')) return '🔥'
  if (name.includes('quiz') || name.includes('soal')) return '📚'
  if (name.includes('sempurna') || name.includes('perfect')) return '⭐'
  if (name.includes('xp') || name.includes('level')) return '💎'
  return '🏅'
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-3xl mb-2">🏅</p>
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
            className={`rounded-xl p-3 border flex flex-col items-center text-center transition-all ${
              earned
                ? 'bg-gray-800 border-purple-500/40'
                : 'bg-gray-900 border-gray-700 opacity-40 grayscale'
            }`}
          >
            <span className="text-3xl mb-2">
              {badge.iconUrl ? (
                <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8 object-contain" />
              ) : (
                getBadgeEmoji(badge)
              )}
            </span>
            <p className="text-xs font-semibold text-white leading-tight">{badge.name}</p>
            <p className="text-xs text-gray-400 mt-1 leading-tight">{badge.description}</p>
            {earned && badge.earnedAt && (
              <p className="text-xs text-purple-400 mt-1">
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
