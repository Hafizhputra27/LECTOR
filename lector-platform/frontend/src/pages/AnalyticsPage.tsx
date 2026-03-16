import React, { useEffect, useState } from 'react'
import { getAnalytics, type AnalyticsSummary } from '../services/api'
import ActivityChart from '../components/analytics/ActivityChart'
import TopicPerformance from '../components/analytics/TopicPerformance'
import XPBar from '../components/gamification/XPBar'
import BadgeGrid from '../components/gamification/BadgeGrid'
import StreakDisplay from '../components/gamification/StreakDisplay'
import { useGamificationStore } from '../store/gamificationStore'

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const gamProfile = useGamificationStore((s) => s.profile)

  useEffect(() => {
    setLoading(true)
    getAnalytics()
      .then(setAnalytics)
      .catch((err) => setError(err.message ?? 'Gagal memuat data analitik'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#7c6af7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>Memuat data analitik...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error ?? 'Gagal memuat data'}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              getAnalytics()
                .then(setAnalytics)
                .catch((e) => setError(e.message))
                .finally(() => setLoading(false))
            }}
            className="px-4 py-2 bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white rounded-lg text-sm transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-heading font-bold" style={{ color: 'var(--text)' }}>Analitik Pribadi</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="Total XP" value={analytics.totalXP.toLocaleString('id-ID')} icon="⚡" />
        <MetricCard label="Level" value={String(analytics.currentLevel)} icon="🎯" />
        <MetricCard label="Streak" value={`${analytics.currentStreak} hari`} icon="🔥" />
        <MetricCard label="Quiz Selesai" value={String(analytics.quizzesCompleted)} icon="📚" />
        <MetricCard label="Rata-rata Skor" value={`${analytics.averageScore.toFixed(1)}%`} icon="�" />
      </div>

      {/* XP Progress */}
      <SectionCard title="Progres Level">
        <XPBar xp={analytics.totalXP} level={analytics.currentLevel} />
      </SectionCard>

      {/* Streak */}
      <SectionCard title="Streak Harian">
        <StreakDisplay streak={analytics.currentStreak} />
      </SectionCard>

      {/* Activity Chart */}
      <SectionCard title="Aktivitas Belajar">
        <ActivityChart activityByDay={analytics.activityByDay} />
      </SectionCard>

      {/* Topic Performance */}
      <SectionCard title="Performa per Topik">
        <TopicPerformance topics={analytics.topicPerformance} />
      </SectionCard>

      {/* Badge Grid */}
      <SectionCard title="Badge & Pencapaian">
        <BadgeGrid badges={gamProfile?.badges ?? []} />
      </SectionCard>
    </div>
  )
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div
    className="rounded-xl p-4"
    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
  >
    <h2 className="text-sm font-semibold mb-3 font-heading" style={{ color: 'var(--text-muted)' }}>{title}</h2>
    {children}
  </div>
)

interface MetricCardProps {
  label: string
  value: string
  icon: string
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon }) => (
  <div
    className="rounded-xl p-3 flex flex-col items-center text-center"
    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
  >
    <span className="text-2xl mb-1">{icon}</span>
    <p className="text-lg font-bold leading-tight font-heading" style={{ color: 'var(--text)' }}>{value}</p>
    <p className="text-xs mt-0.5 font-body" style={{ color: 'var(--text-muted)' }}>{label}</p>
  </div>
)

export default AnalyticsPage
