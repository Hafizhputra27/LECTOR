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
        <span className="text-4xl">📄</span>
        <p className="text-white font-heading text-lg">Pilih dokumen terlebih dahulu</p>
        <p className="text-gray-400 font-body text-sm">
          Pilih atau unggah dokumen dari sidebar untuk memulai quiz.
        </p>
      </div>
    )
  }

  // Setup screen
  if (questions.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-6">
        <div className="bg-gray-900/60 border border-gray-700 rounded-2xl p-8 w-full max-w-md space-y-6">
          <div className="text-center space-y-1">
            <span className="text-4xl">🧠</span>
            <h2 className="text-xl font-heading text-white">Quiz & Latihan</h2>
            <p className="text-gray-400 font-body text-sm">
              Dokumen: <span className="text-purple-400">{activeDocument.fileName}</span>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-gray-300 font-body text-sm">Jumlah soal</label>
            <div className="flex gap-3">
              {QUESTION_COUNT_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSelectedCount(n)}
                  className={`flex-1 py-2 rounded-xl border font-semibold transition-colors ${
                    selectedCount === n
                      ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-purple-400'
                  }`}
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
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold font-heading transition-colors"
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
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 font-body">Membuat soal...</p>
        </div>
      </div>
    )
  }

  // Result screen
  if (isSubmitted && result) {
    return (
      <div className="max-w-2xl mx-auto p-4 overflow-y-auto">
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
      <div className="flex items-center justify-between text-sm text-gray-400 font-body">
        <span>{activeDocument.fileName}</span>
        <span>
          {answeredCount}/{questions.length} dijawab
        </span>
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
          onClick={() => {
            prevQuestion()
            setShowFeedback(false)
          }}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-40 transition-colors font-body text-sm"
        >
          ← Sebelumnya
        </button>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={() => {
              nextQuestion()
              setShowFeedback(false)
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-colors font-body text-sm"
          >
            Berikutnya →
          </button>
        ) : (
          <button
            onClick={submitQuizSession}
            disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white font-semibold transition-colors font-body text-sm"
          >
            Selesai & Kirim
          </button>
        )}
      </div>

      {/* Question nav */}
      <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-4 space-y-2">
        <p className="text-gray-400 text-xs font-body">Navigasi Soal</p>
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
