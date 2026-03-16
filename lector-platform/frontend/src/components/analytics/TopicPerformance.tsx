import React from 'react'

interface TopicPerformanceProps {
  topics: { documentName: string; averageScore: number }[]
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

const TopicPerformance: React.FC<TopicPerformanceProps> = ({ topics }) => {
  if (topics.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">Belum ada data performa topik</p>
        <p className="text-xs mt-1">Selesaikan quiz untuk melihat performa per dokumen</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {topics.map(({ documentName, averageScore }) => (
        <div key={documentName}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-300 truncate max-w-[70%]" title={documentName}>
              {documentName}
            </span>
            <span className={`text-sm font-bold ${getScoreTextColor(averageScore)}`}>
              {averageScore.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(averageScore)}`}
              style={{ width: `${Math.min(averageScore, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default TopicPerformance
