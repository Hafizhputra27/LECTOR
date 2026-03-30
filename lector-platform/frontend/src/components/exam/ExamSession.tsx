import type { QuizQuestion } from '../../hooks/useExam'
import QuestionNav from '../quiz/QuestionNav'

interface ExamSessionProps {
  questions: QuizQuestion[]
  currentIndex: number
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>
  timeLeft: number
  totalTimeSeconds: number
  isLoading: boolean
  onAnswer: (index: number, answer: 'A' | 'B' | 'C' | 'D') => void
  onNavigate: (index: number) => void
  onSubmit: () => void
}

const OPTIONS = ['A', 'B', 'C', 'D'] as const

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ExamSession({
  questions, currentIndex, answers, timeLeft, totalTimeSeconds, isLoading, onAnswer, onNavigate, onSubmit,
}: ExamSessionProps) {
  const question = questions[currentIndex]
  const selectedAnswer = answers[currentIndex] ?? null
  const answeredCount = Object.keys(answers).length
  const timerPercent = totalTimeSeconds > 0 ? (timeLeft / totalTimeSeconds) * 100 : 0
  const isUrgent = timeLeft <= 300

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Global timer */}
      <div className="flex items-center justify-between px-5 py-3 rounded-xl"
        style={isUrgent
          ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)' }
          : { background: 'var(--surface)', border: '1px solid var(--border)' }
        }>
        <span className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          {answeredCount}/{questions.length} dijawab
        </span>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5" style={{ color: isUrgent ? '#f87171' : '#9d8ff9' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`font-heading text-2xl font-bold tabular-nums ${isUrgent ? 'text-red-400' : 'text-[#9d8ff9]'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${isUrgent ? 'bg-red-500' : 'bg-[#7c6af7]'}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Question */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          Soal {currentIndex + 1} / {questions.length}
        </p>
        <p className="font-heading text-base leading-relaxed" style={{ color: 'var(--text)' }}>
          {question.question}
        </p>
        <div className="space-y-2">
          {OPTIONS.map((opt) => {
            const isSelected = selectedAnswer === opt
            return (
              <button key={opt}
                onClick={() => onAnswer(currentIndex, opt)}
                className="w-full text-left px-4 py-3 rounded-xl transition-all font-body text-sm hover:opacity-90"
                style={isSelected
                  ? { background: 'rgba(124,106,247,0.2)', color: 'var(--text)', border: '1px solid #7c6af7' }
                  : { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }
                }>
                <span className="font-semibold mr-2">{opt}.</span>
                {question.options[opt]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => onNavigate(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl font-body text-sm transition-colors disabled:opacity-40"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
          ← Sebelumnya
        </button>
        {currentIndex < questions.length - 1 ? (
          <button onClick={() => onNavigate(currentIndex + 1)}
            className="px-4 py-2 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold transition-colors font-body text-sm">
            Berikutnya →
          </button>
        ) : (
          <button onClick={onSubmit} disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold transition-colors font-body text-sm disabled:opacity-50">
            Selesai & Kirim
          </button>
        )}
      </div>

      {/* Question nav */}
      <div className="rounded-xl p-4 space-y-2"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>Navigasi Soal</p>
        <QuestionNav total={questions.length} current={currentIndex} answers={answers} onNavigate={onNavigate} />
      </div>

      {/* Manual submit */}
      <button onClick={onSubmit} disabled={isLoading}
        className="w-full py-3 rounded-xl border border-red-700 text-red-400 hover:bg-red-900/20 font-semibold transition-colors font-body text-sm disabled:opacity-50">
        Akhiri Ujian Sekarang
      </button>
    </div>
  )
}
