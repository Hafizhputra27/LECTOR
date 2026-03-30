import React from 'react'

interface StreakDisplayProps {
  streak: number
}

function getStreakColor(streak: number): string {
  if (streak >= 30) return 'text-yellow-400'
  if (streak >= 14) return 'text-orange-400'
  if (streak >= 7) return 'text-red-400'
  if (streak >= 3) return 'text-orange-300'
  return 'text-[#9d8ff9]'
}

function getStreakLabel(streak: number): string {
  if (streak >= 30) return 'Luar Biasa!'
  if (streak >= 14) return 'Konsisten!'
  if (streak >= 7) return 'Semangat!'
  if (streak >= 3) return 'Bagus!'
  if (streak >= 1) return 'Mulai!'
  return 'Belum aktif'
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ streak }) => {
  const color = getStreakColor(streak)
  const label = getStreakLabel(streak)

  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`} style={{ background: 'rgba(246,173,85,0.1)' }}>
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
        </svg>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-heading ${color}`}>{streak}</span>
          <span className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>hari</span>
        </div>
        <p className={`text-xs font-body ${color}`}>{label}</p>
      </div>
    </div>
  )
}

export default StreakDisplay
