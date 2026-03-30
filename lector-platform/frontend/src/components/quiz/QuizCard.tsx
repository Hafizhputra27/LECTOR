import type { QuizQuestion } from '../../hooks/useQuiz'

interface QuizCardProps {
  question: QuizQuestion
  questionIndex: number
  totalQuestions: number
  selectedAnswer: 'A' | 'B' | 'C' | 'D' | null
  onAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void
  showFeedback: boolean
  timeLeft: number
}

const OPTIONS = ['A', 'B', 'C', 'D'] as const

export default function QuizCard({
  question, questionIndex, totalQuestions, selectedAnswer, onAnswer, showFeedback, timeLeft,
}: QuizCardProps) {
  const timerPercent = (timeLeft / 30) * 100

  const getOptionStyle = (opt: 'A' | 'B' | 'C' | 'D'): React.CSSProperties => {
    if (!showFeedback || selectedAnswer === null) {
      if (selectedAnswer === opt) {
        return { background: 'rgba(124,106,247,0.2)', color: 'var(--text)', border: '1px solid #7c6af7' }
      }
      return { background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)' }
    }
    if (opt === question.correctAnswer) {
      return { background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.5)' }
    }
    if (opt === selectedAnswer && opt !== question.correctAnswer) {
      return { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.5)' }
    }
    return { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)', opacity: 0.6 }
  }

  return (
    <div className="rounded-2xl p-6 space-y-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between text-sm font-body" style={{ color: 'var(--text-muted)' }}>
        <span>Soal {questionIndex + 1} / {totalQuestions}</span>
        <span className={`font-semibold flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-400' : 'text-[#9d8ff9]'}`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {timeLeft}s
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-[#7c6af7]'}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      <p className="font-heading text-base leading-relaxed" style={{ color: 'var(--text)' }}>
        {question.question}
      </p>

      <div className="space-y-2">
        {OPTIONS.map((opt) => (
          <button key={opt}
            className="w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-body text-sm hover:opacity-90"
            style={getOptionStyle(opt)}
            onClick={() => !showFeedback && onAnswer(opt)}
            disabled={showFeedback}
          >
            <span className="font-semibold mr-2">{opt}.</span>
            {question.options[opt]}
          </button>
        ))}
      </div>

      {showFeedback && selectedAnswer && (
        <div className="mt-3 p-4 rounded-xl text-sm font-body"
          style={{ background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.3)', color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: '#9d8ff9' }}>Penjelasan: </span>
          {question.explanation}
        </div>
      )}
    </div>
  )
}
