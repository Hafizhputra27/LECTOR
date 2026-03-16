import { useState } from 'react'

interface ExamSetupProps {
  documentName: string
  onStart: (questionCount: number, totalTimeSeconds: number) => void
  isLoading: boolean
  error: string | null
}

const QUESTION_OPTIONS = [
  { count: 10, timeSeconds: 900 },
  { count: 20, timeSeconds: 1800 },
  { count: 30, timeSeconds: 2700 },
]

function formatTime(seconds: number): string {
  return `${Math.floor(seconds / 60)} menit`
}

export default function ExamSetup({ documentName, onStart, isLoading, error }: ExamSetupProps) {
  const [selected, setSelected] = useState(QUESTION_OPTIONS[0])

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="rounded-2xl p-8 w-full max-w-md space-y-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-center space-y-1">
          <span className="text-4xl">📝</span>
          <h2 className="text-xl font-heading" style={{ color: 'var(--text)' }}>Ujian Simulasi</h2>
          <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
            Dokumen: <span className="text-[#9d8ff9]">{documentName}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>Konfigurasi ujian</label>
          <div className="space-y-2">
            {QUESTION_OPTIONS.map((opt) => (
              <button key={opt.count} onClick={() => setSelected(opt)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-body text-sm"
                style={selected.count === opt.count
                  ? { background: 'rgba(124,106,247,0.2)', color: 'var(--text)', border: '1px solid #7c6af7' }
                  : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }>
                <span className="font-semibold">{opt.count} soal</span>
                <span style={{ color: 'var(--text-muted)' }}>⏱ {formatTime(opt.timeSeconds)}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm font-body text-center">{error}</p>}

        <button onClick={() => onStart(selected.count, selected.timeSeconds)} disabled={isLoading}
          className="w-full py-3 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 disabled:opacity-50 text-white font-semibold font-heading transition-colors">
          {isLoading ? 'Memuat soal...' : 'Mulai Ujian'}
        </button>
      </div>
    </div>
  )
}
