import { useState } from 'react'
import { useDocumentStore } from '../store/documentStore'
import { useQuiz } from '../hooks/useQuiz'
import QuizCard from '../components/quiz/QuizCard'
import QuestionNav from '../components/quiz/QuestionNav'
import QuizResult from '../components/quiz/QuizResult'

const QUESTION_COUNT_OPTIONS = [5, 10, 15]

export default function QuizPage() {
  const { activeDocument } = useDocumentStore()
  const {
    questions,
    currentIndex,
    answers,
    timeLeft,
    isSubmitted,
    result,
    isLoading,
    error,
    startQuiz,
    answerQuestion,
    submitQuizSession,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    reset,
  } = useQuiz()

  const [selectedCount, setSelectedCount] = useState(5)
  const [showFeedback, setShowFeedback] = useState(false)

  // No active document
  if (!activeDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
          <svg className="w-8 h-8 text-[#7c6af7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <p className="font-heading text-lg" style={{ color: 'var(--text)' }}>Pilih dokumen terlebih dahulu</p>
        <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          Pilih atau unggah dokumen dari sidebar untuk memulai quiz.
        </p>
      </div>
    )
  }

  // Setup screen
  if (questions.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-6">
        <div className="rounded-2xl p-8 w-full max-w-md space-y-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-center space-y-1">
            <div className="w-14 h-14 mx-auto mb-2 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(124,106,247,0.12)' }}>
              <svg className="w-7 h-7 text-[#7c6af7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-xl font-heading" style={{ color: 'var(--text)' }}>Quiz & Latihan</h2>
            <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
              Dokumen: <span className="text-[#9d8ff9]">{activeDocument.fileName}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>Jumlah soal</label>
            <div className="flex gap-3">
              {QUESTION_COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedCount(n)}
                  className="flex-1 py-2 rounded-xl font-semibold transition-colors font-body text-sm"
                  style={selectedCount === n
                    ? { background: 'rgba(124,106,247,0.2)', color: '#9d8ff9', border: '1px solid #7c6af7' }
                    : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                  }
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm font-body text-center">{error}</p>
          )}

          <button
            onClick={() => startQuiz(activeDocument.id, selectedCount)}
            className="w-full py-3 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold font-heading transition-colors"
          >
            Mulai Quiz
          </button>
        </div>
      </div>
    )
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#7c6af7] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>Membuat soal...</p>
        <QuizResult
          score={result.score}
          correctCount={result.correctCount}
          totalCount={result.totalCount}
          questions={result.questions}
          answers={answers}
          onRetry={reset}
        /> className="max-w-2xl mx-auto p-4 overflow-y-auto">
        <QuizResult
          score={result.score}
          xpEarned={result.xpEarned}
          correctCount={result.correctCount}
          totalCount={result.totalCount}
          questions={result.questions}
          answers={answers}
          onRetry={reset}
        />
      </div>
    )
  }

  // Active quiz
  const currentQuestion = questions[currentIndex]
  const selectedAnswer = answers[currentIndex] ?? null
  const answeredCount = Object.keys(answers).length

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm font-body" style={{ color: 'var(--text-muted)' }}>
        <span className="truncate max-w-[60%]">{activeDocument.fileName}</span>
        <span>{answeredCount}/{questions.length} dijawab</span>
      </div>

      {/* Quiz card */}
      <QuizCard
        question={currentQuestion}
        questionIndex={currentIndex}
        totalQuestions={questions.length}
        selectedAnswer={selectedAnswer}
        onAnswer={(ans) => {
          answerQuestion(currentIndex, ans)
          setShowFeedback(true)
        }}
        showFeedback={showFeedback && selectedAnswer !== null}
        timeLeft={timeLeft}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => { prevQuestion(); setShowFeedback(false) }}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl font-body text-sm transition-colors disabled:opacity-40"
          style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          ← Sebelumnya
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => { nextQuestion(); setShowFeedback(false) }}
            className="px-4 py-2 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold transition-colors font-body text-sm"
          >
            Berikutnya →
          </button>
        ) : (
          <button
            onClick={submitQuizSession}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold transition-colors font-body text-sm disabled:opacity-50"
          >
            Selesai & Kirim
          </button>
        )}
      </div>

      {/* Question nav */}
      <div className="rounded-xl p-4 space-y-2"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>Navigasi Soal</p>
        <QuestionNav
          total={questions.length}
          current={currentIndex}
          answers={answers}
          onNavigate={(i) => {
            goToQuestion(i)
            setShowFeedback(answers[i] !== undefined)
          }}
        />
      </div>

      {error && <p className="text-red-400 text-sm font-body text-center">{error}</p>}
    </div>
  )
}
