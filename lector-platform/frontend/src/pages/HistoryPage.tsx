import React, { useEffect, useState, useCallback } from 'react'import { getHistory, type ActivityRecord, type HistoryParams } from '../services/api'

type ActivityType = 'chat' | 'quiz' | 'exam' | 'summary'

const TYPE_LABELS: Record<ActivityType, string> = {
  chat: 'Chat',
  quiz: 'Kuis',
  exam: 'Ujian',
  summary: 'Ringkasan',
}

const TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  chat: (
    <svg className="w-5 h-5 text-[#9d8ff9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  quiz: (
    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  exam: (
    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  summary: (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
}

const TYPE_BADGE_COLORS: Record<ActivityType, string> = {
  chat: 'bg-[#7c6af7]/15 text-[#9d8ff9] border border-[#7c6af7]/40',
  quiz: 'bg-purple-900/50 text-purple-300 border border-purple-700',
  exam: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
  summary: 'bg-green-900/50 text-green-300 border border-green-700',
}

const FILTER_TABS: { label: string; value: ActivityType | 'all' }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Chat', value: 'chat' },
  { label: 'Kuis', value: 'quiz' },
  { label: 'Ujian', value: 'exam' },
  { label: 'Ringkasan', value: 'summary' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const HistoryPage: React.FC = () => {
  const [records, setRecords] = useState<ActivityRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeType, setActiveType] = useState<ActivityType | 'all'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStartDate, setAppliedStartDate] = useState('')
  const [appliedEndDate, setAppliedEndDate] = useState('')
  const [page, setPage] = useState(1)

  const fetchHistory = useCallback(async (params: HistoryParams) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getHistory(params)
      setRecords(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat riwayat')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const params: HistoryParams = { page }
    if (activeType !== 'all') params.type = activeType
    if (appliedStartDate) params.startDate = appliedStartDate
    if (appliedEndDate) params.endDate = appliedEndDate
    fetchHistory(params)
  }, [activeType, appliedStartDate, appliedEndDate, page, fetchHistory])

  function handleTypeChange(value: ActivityType | 'all') {
    setActiveType(value)
    setPage(1)
  }

  function handleApplyFilter() {
    setAppliedStartDate(startDate)
    setAppliedEndDate(endDate)
    setPage(1)
  }

  function handleResetFilter() {
    setStartDate('')
    setEndDate('')
    setAppliedStartDate('')
    setAppliedEndDate('')
    setActiveType('all')
    setPage(1)
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
      <h1 className="text-xl font-heading font-bold" style={{ color: 'var(--text)' }}>Riwayat Belajar</h1>

      {/* Type filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTypeChange(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeType === tab.value
                ? 'bg-[#7c6af7] text-white'
                : 'hover:text-[#7c6af7]'
            }`}
            style={
              activeType !== tab.value
                ? { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                : undefined
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date range filter */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-end gap-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>Dari Tanggal</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#7c6af7] transition-colors"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>Sampai Tanggal</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#7c6af7] transition-colors"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            }}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleApplyFilter}
            className="px-4 py-1.5 bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white text-sm rounded-lg transition-colors"
          >
            Terapkan
          </button>
          <button
            onClick={handleResetFilter}
            className="px-4 py-1.5 text-sm rounded-lg transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#7c6af7] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>Memuat riwayat...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <p className="text-red-400 mb-3">{error}</p>
            <button
              onClick={() => {
                const params: HistoryParams = { page }
                if (activeType !== 'all') params.type = activeType
                if (appliedStartDate) params.startDate = appliedStartDate
                if (appliedEndDate) params.endDate = appliedEndDate
                fetchHistory(params)
              }}
              className="px-4 py-2 bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white rounded-lg text-sm transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      ) : records.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>{total} aktivitas ditemukan</p>
          <div className="space-y-2">
            {records.map((record) => (
              <RecordRow key={record.id} record={record} />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}

const RecordRow: React.FC<{ record: ActivityRecord }> = ({ record }) => {
  const type = record.type as ActivityType
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <span className="flex-shrink-0">{TYPE_ICONS[type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE_COLORS[type]}`}>
            {TYPE_LABELS[type]}
          </span>
          {record.documentName && (
            <span className="text-sm truncate font-body" style={{ color: 'var(--text)' }}>
              {record.documentName}
            </span>
          )}
        </div>
        <p className="text-xs mt-1 font-body" style={{ color: 'var(--text-muted)' }}>
          {formatDate(record.createdAt)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {record.score !== null && (
          <span className="text-sm font-semibold font-heading" style={{ color: 'var(--text)' }}>
            {record.score}%
          </span>
        )}
        <span className="text-xs text-[#f6ad55] font-medium">+{record.xpEarned} XP</span>
      </div>
    </div>
  )
}

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-48 text-center">
    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
      <svg className="w-7 h-7" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>Belum ada riwayat aktivitas.</p>
    <p className="text-xs mt-1 font-body" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
      Mulai belajar untuk melihat riwayat di sini.
    </p>
  </div>
)

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
      >
        ← Sebelumnya
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm transition-colors ${
            p === page ? 'bg-[#7c6af7] text-white font-semibold' : ''
          }`}
          style={
            p !== page
              ? { background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              : undefined
          }
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
      >
        Berikutnya →
      </button>
    </div>
  )
}

export default HistoryPage
