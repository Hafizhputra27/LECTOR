import React from 'react'

interface StreakDisplayProps {
  streak: number
}

function getStreakColor(streak: number): string {
  if (streak >= 30) return 'text-yellow-400'
  if (streak >= 14) return 'text-orange-400'
  if (streak >= 7) return 'text-red-400'
  if (streak >= 3) return 'text-orange-300'
  return 'text-gray-400'
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
    <div className="flex items-center gap-2">
      <span className="text-2xl">🔥</span>
      <div>
        <span className={`text-xl font-bold ${color}`}>{streak}</span>
        <span className="text-gray-400 text-sm ml-1">hari</span>
        <p className={`text-xs ${color}`}>{label}</p>
      </div>
    </div>
  )
}

export default StreakDisplay
