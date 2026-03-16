import { useState, useEffect, useRef, useCallback } from 'react'
import { startExam, submitExam } from '../services/api'
import type { QuizQuestion } from './useQuiz'

export type { QuizQuestion }

export interface ExamResult {
  score: number
  xpEarned: number
  correctCount: number
  totalCount: number
  questions: QuizQuestion[]
}

interface UseExamReturn {
  questions: QuizQuestion[]
  currentIndex: number
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>
  timeLeft: number
  totalTimeSeconds: number
  isSubmitted: boolean
  result: ExamResult | null
  isLoading: boolean
  error: string | null
  sessionId: string | null
  startExamSession: (documentId: string, count?: number, totalTime?: number) => Promise<void>
  answerQuestion: (questionIndex: number, answer: 'A' | 'B' | 'C' | 'D') => void
  submitExamSession: () => Promise<void>
  goToQuestion: (index: number) => void
  reset: () => void
}

export function useExam(): UseExamReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answersRef = useRef(answers)
  answersRef.current = answers
  const sessionIdRef = useRef(sessionId)
  sessionIdRef.current = sessionId
  const isSubmittedRef = useRef(isSubmitted)
  isSubmittedRef.current = isSubmitted

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const doSubmit = useCallback(async () => {
    const sid = sessionIdRef.current
    if (!sid || isSubmittedRef.current) return
    clearTimer()
    setIsLoading(true)
    setError(null)
    try {
      const stringAnswers: Record<string, string> = {}
      Object.entries(answersRef.current).forEach(([k, v]) => {
        stringAnswers[k] = v
      })
      const data = await submitExam(sid, stringAnswers)
      setResult(data as ExamResult)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim jawaban')
    } finally {
      setIsLoading(false)
    }
  }, [clearTimer])

  const startExamSession = useCallback(
    async (documentId: string, count = 10, totalTime = 1800) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await startExam(documentId, count, totalTime)
        setQuestions(data.questions as QuizQuestion[])
        setSessionId(data.sessionId)
        setTotalTimeSeconds(data.totalTimeSeconds)
        setTimeLeft(data.totalTimeSeconds)
        setCurrentIndex(0)
        setAnswers({})
        setIsSubmitted(false)
        setResult(null)

        // Start global countdown
        clearTimer()
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearTimer()
              // Auto-submit
              doSubmit()
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memulai ujian')
      } finally {
        setIsLoading(false)
      }
    },
    [clearTimer, doSubmit]
  )

  const answerQuestion = useCallback(
    (questionIndex: number, answer: 'A' | 'B' | 'C' | 'D') => {
      setAnswers((prev) => ({ ...prev, [questionIndex]: answer }))
    },
    []
  )

  const submitExamSession = useCallback(async () => {
    await doSubmit()
  }, [doSubmit])

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setQuestions([])
    setCurrentIndex(0)
    setAnswers({})
    setTimeLeft(0)
    setTotalTimeSeconds(0)
    setIsSubmitted(false)
    setResult(null)
    setError(null)
    setSessionId(null)
  }, [clearTimer])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return {
    questions,
    currentIndex,
    answers,
    timeLeft,
    totalTimeSeconds,
    isSubmitted,
    result,
    isLoading,
    error,
    sessionId,
    startExamSession,
    answerQuestion,
    submitExamSession,
    goToQuestion,
    reset,
  }
}
