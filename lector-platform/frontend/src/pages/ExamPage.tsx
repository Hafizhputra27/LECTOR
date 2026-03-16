import { useDocumentStore } from '../store/documentStore'
import { useExam } from '../hooks/useExam'
import ExamSetup from '../components/exam/ExamSetup'
import ExamSession from '../components/exam/ExamSession'
import ExamResult from '../components/exam/ExamResult'

export default function ExamPage() {
  const { activeDocument } = useDocumentStore()
  const {
    questions,
    currentIndex,
    answers,
    timeLeft,
    totalTimeSeconds,
    isSubmitted,
    result,
    isLoading,
    error,
    startExamSession,
    answerQuestion,
    submitExamSession,
    goToQuestion,
    reset,
  } = useExam()

  // No active document
  if (!activeDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3">
        <span className="text-4xl">📄</span>
        <p className="font-heading text-lg" style={{ color: 'var(--text)' }}>Pilih dokumen terlebih dahulu</p>
        <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
          Pilih atau unggah dokumen dari sidebar untuk memulai ujian simulasi.
        </p>
      </div>
    )
  }

  // Loading (generating questions)
  if (isLoading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#7c6af7] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-body" style={{ color: 'var(--text-muted)' }}>Membuat soal ujian...</p>
        </div>
      </div>
    )
  }

  // Setup screen
  if (questions.length === 0) {
    return (
      <ExamSetup
        documentName={activeDocument.fileName}
        onStart={(count, totalTime) => startExamSession(activeDocument.id, count, totalTime)}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  // Result screen
  if (isSubmitted && result) {
    return (
      <div className="overflow-y-auto h-full">
        <ExamResult
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

  // Active exam session
  return (
    <div className="overflow-y-auto h-full">
      <ExamSession
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        timeLeft={timeLeft}
        totalTimeSeconds={totalTimeSeconds}
        isLoading={isLoading}
        onAnswer={answerQuestion}
        onNavigate={goToQuestion}
        onSubmit={submitExamSession}
      />
    </div>
  )
}
