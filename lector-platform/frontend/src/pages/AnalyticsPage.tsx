import React, { useEffect, useState } from 'react'
import { getAnalytics, type AnalyticsSummary } from '../services/api'
import ActivityChart from '../components/analytics/ActivityChart'
import TopicPerformance from '../components/analytics/TopicPerformance'
import BadgeGrid from '../components/gamification/BadgeGrid'
import StreakDisplay from '../components/gamification/StreakDisplay'
import { useGamificationStore } from '../store/gamificationStore'

function IconStreak() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" />
    </svg>
  )
}
function IconQuiz() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}
function IconScore() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function IconBadge() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  )
}

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

  const earnedTitles = gamProfile?.badges?.filter((b) => !!b.earnedAt).length ?? 0

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-heading font-bold" style={{ color: 'var(--text)' }}>Analitik Pribadi</h1>

      {/* Metric cards — no XP/Level */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Streak" value={`${analytics.currentStreak} hari`} icon={<IconStreak />} color="text-[#f6ad55]" />
        <MetricCard label="Quiz Selesai" value={String(analytics.quizzesCompleted)} icon={<IconQuiz />} color="text-green-400" />
        <MetricCard label="Rata-rata Skor" value={`${analytics.averageScore.toFixed(1)}%`} icon={<IconScore />} color="text-[#9d8ff9]" />
        <MetricCard label="Gelar Diraih" value={String(earnedTitles)} icon={<IconBadge />} color="text-[#7c6af7]" />
      </div>

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

      {/* Title/Badge Grid */}
      <SectionCard title="Pencapaian & Gelar">
        <BadgeGrid badges={gamProfile?.badges ?? []} />
      </SectionCard>
    </div>
  )
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
    <h2 className="text-sm font-semibold mb-3 font-heading" style={{ color: 'var(--text-muted)' }}>{title}</h2>
    {children}
  </div>
)

interface MetricCardProps {
  label: string
  value: string
  icon: React.ReactNode
  color: string
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color }) => (
  <div
    className="rounded-xl p-3 flex flex-col items-center text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
  >
    <span className={`mb-1 ${color}`}>{icon}</span>
    <p className="text-lg font-bold leading-tight font-heading" style={{ color: 'var(--text)' }}>{value}</p>
    <p className="text-xs mt-0.5 font-body" style={{ color: 'var(--text-muted)' }}>{label}</p>
  </div>
)

export default AnalyticsPage
