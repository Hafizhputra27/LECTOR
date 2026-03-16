import React from 'react'

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500]

interface XPBarProps {
  xp: number
  level: number
}

const XPBar: React.FC<XPBarProps> = ({ xp, level }) => {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const isMaxLevel = level >= LEVEL_THRESHOLDS.length

  const xpInLevel = xp - currentThreshold
  const xpNeeded = nextThreshold - currentThreshold
  const progress = isMaxLevel ? 100 : Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-purple-300">Level {level}</span>
        {isMaxLevel ? (
          <span className="text-xs text-yellow-400 font-semibold">Level Maks!</span>
        ) : (
          <span className="text-xs text-gray-400">
            {xp} / {nextThreshold} XP
          </span>
        )}
      </div>
      <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #7c6af7, #9d8ff9)',
          }}
        />
      </div>
      {!isMaxLevel && (
        <p className="text-xs text-gray-500 mt-1">
          {nextThreshold - xp} XP menuju Level {level + 1}
        </p>
      )}
    </div>
  )
}

export default XPBar
