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
        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
          <svg className="w-8 h-8 text-[#7c6af7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
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
