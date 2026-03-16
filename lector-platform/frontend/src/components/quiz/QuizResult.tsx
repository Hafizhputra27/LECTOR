import type { QuizQuestion } from '../../hooks/useQuiz'

interface QuizResultProps {
  score: number
  xpEarned: number
  correctCount: number
  totalCount: number
  questions: QuizQuestion[]
  answers: Record<number, string>
  onRetry: () => void
}

const OPTIONS = ['A', 'B', 'C', 'D'] as const

export default function QuizResult({ score, xpEarned, correctCount, totalCount, questions, answers, onRetry }: QuizResultProps) {
  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-6 text-center space-y-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-heading" style={{ color: 'var(--text)' }}>Hasil Quiz</h2>
        <p className={`text-5xl font-heading font-bold ${scoreColor}`}>{score}%</p>
        <p className="font-body" style={{ color: 'var(--text-muted)' }}>
          {correctCount} dari {totalCount} jawaban benar
        </p>
        <div className="flex items-center justify-center gap-2 text-[#f6ad55] font-semibold">
          <span>⭐</span>
          <span>+{xpEarned} XP diperoleh</span>
        </div>
        <button onClick={onRetry}
          className="mt-2 px-6 py-2 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold transition-colors">
          Quiz Lagi
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="font-heading text-base" style={{ color: 'var(--text)' }}>Pembahasan Soal</h3>
        {questions.map((q, i) => {
          const userAnswer = answers[i] as 'A' | 'B' | 'C' | 'D' | undefined
          const isCorrect = userAnswer === q.correctAnswer
          return (
            <div key={i} className="rounded-xl p-4 space-y-2"
              style={{
                background: isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
              <div className="flex items-start gap-2">
                <span className="text-lg">{isCorrect ? '✅' : '❌'}</span>
                <p className="text-sm font-body leading-snug" style={{ color: 'var(--text)' }}>{q.question}</p>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs font-body">
                {OPTIONS.map((opt) => (
                  <span key={opt} className="px-2 py-1 rounded-lg"
                    style={
                      opt === q.correctAnswer
                        ? { background: 'rgba(34,197,94,0.2)', color: '#4ade80' }
                        : opt === userAnswer
                        ? { background: 'rgba(239,68,68,0.2)', color: '#f87171' }
                        : { color: 'var(--text-muted)' }
                    }>
                    {opt}. {q.options[opt]}
                  </span>
                ))}
              </div>
              {userAnswer && userAnswer !== q.correctAnswer && (
                <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                  Jawabanmu: <span className="text-red-400">{userAnswer}</span> · Benar:{' '}
                  <span className="text-green-400">{q.correctAnswer}</span>
                </p>
              )}
              <p className="text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                <span className="font-semibold" style={{ color: '#9d8ff9' }}>Penjelasan:</span> {q.explanation}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
