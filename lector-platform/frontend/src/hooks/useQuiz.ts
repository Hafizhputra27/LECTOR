import { useState, useEffect, useRef, useCallback } from 'react'
import { generateQuiz, submitQuiz } from '../services/api'

export interface QuizQuestion {
  question: string
  options: { A: string; B: string; C: string; D: string }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export interface QuizResult {
  score: number
  xpEarned: number
  correctCount: number
  totalCount: number
  questions: QuizQuestion[]
}

const SECONDS_PER_QUESTION = 30

interface UseQuizReturn {
  questions: QuizQuestion[]
  currentIndex: number
  answers: Record<number, 'A' | 'B' | 'C' | 'D'>
  timeLeft: number
  isSubmitted: boolean
  result: QuizResult | null
  isLoading: boolean
  error: string | null
  sessionId: string | null
  startQuiz: (documentId: string, count?: number) => Promise<void>
  answerQuestion: (questionIndex: number, answer: 'A' | 'B' | 'C' | 'D') => void
  submitQuizSession: () => Promise<void>
  nextQuestion: () => void
  prevQuestion: () => void
  goToQuestion: (index: number) => void
  reset: () => void
}

export function useQuiz(): UseQuizReturn {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({})
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    setTimeLeft(SECONDS_PER_QUESTION)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-advance on timeout
          setCurrentIndex((ci) => {
            const nextIndex = ci + 1
            if (nextIndex < questions.length) {
              return nextIndex
            }
            return ci
          })
          return SECONDS_PER_QUESTION
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer, questions.length])

  // Restart timer when question changes (and quiz is active)
  useEffect(() => {
    if (questions.length > 0 && !isSubmitted) {
      startTimer()
    }
    return clearTimer
  }, [currentIndex, questions.length, isSubmitted, startTimer, clearTimer])

  const startQuiz = useCallback(async (documentId: string, count = 5) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await generateQuiz(documentId, count)
      setQuestions(data.questions as QuizQuestion[])
      setSessionId(data.sessionId)
      setCurrentIndex(0)
      setAnswers({})
      setIsSubmitted(false)
      setResult(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memulai quiz')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const answerQuestion = useCallback(
    (questionIndex: number, answer: 'A' | 'B' | 'C' | 'D') => {
      setAnswers((prev) => ({ ...prev, [questionIndex]: answer }))
    },
    []
  )

  const submitQuizSession = useCallback(async () => {
    if (!sessionId) return
    clearTimer()
    setIsLoading(true)
    setError(null)
    try {
      // Convert numeric keys to string keys for the API
      const stringAnswers: Record<string, string> = {}
      Object.entries(answersRef.current).forEach(([k, v]) => {
        stringAnswers[k] = v
      })
      const data = await submitQuiz(sessionId, stringAnswers)
      setResult(data as QuizResult)
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim jawaban')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, clearTimer])

  const nextQuestion = useCallback(() => {
    setCurrentIndex((ci) => Math.min(ci + 1, questions.length - 1))
  }, [questions.length])

  const prevQuestion = useCallback(() => {
    setCurrentIndex((ci) => Math.max(ci - 1, 0))
  }, [])

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setQuestions([])
    setCurrentIndex(0)
    setAnswers({})
    setTimeLeft(SECONDS_PER_QUESTION)
    setIsSubmitted(false)
    setResult(null)
    setError(null)
    setSessionId(null)
  }, [clearTimer])

  return {
    questions,
    currentIndex,
    answers,
    timeLeft,
    isSubmitted,
    result,
    isLoading,
    error,
    sessionId,
    startQuiz,
    answerQuestion,
    submitQuizSession,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    reset,
  }
}
