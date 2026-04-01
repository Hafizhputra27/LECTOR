import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabase'
import { calculateQuizScore, calculateQuizXP } from '../services/quizScoring'
import { updateStreak, checkAndAwardBadges } from '../services/gamificationEngine'
import { generateQuestionsForDocument, QuizQuestion } from './quizHelpers'

const router = Router()

// ─── POST /api/quiz/generate ──────────────────────────────────────────────────

router.post('/generate', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { documentId, questionCount = 5 } = req.body
  const userId = req.user!.id

  if (!documentId) {
    res.status(400).json({ error: 'documentId wajib diisi' })
    return
  }

  try {
    const questions = await generateQuestionsForDocument(documentId, questionCount)

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('quiz_sessions')
      .insert({
        user_id: userId,
        document_id: documentId,
        session_type: 'quiz',
        questions,
      })
      .select('id')
      .single()

    if (sessionError || !session) {
      res.status(500).json({ error: 'Gagal menyimpan sesi quiz' })
      return
    }

    res.json({ sessionId: session.id, questions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
    res.status(500).json({ error: message })
  }
})

// ─── POST /api/quiz/submit ────────────────────────────────────────────────────

router.post('/submit', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { sessionId, answers } = req.body
  const userId = req.user!.id

  if (!sessionId || !answers) {
    res.status(400).json({ error: 'sessionId dan answers wajib diisi' })
    return
  }

  try {
    const { data: quizSession, error: fetchError } = await supabaseAdmin
      .from('quiz_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !quizSession) {
      res.status(404).json({ error: 'Sesi quiz tidak ditemukan' })
      return
    }

    if (quizSession.completed_at) {
      res.status(400).json({ error: 'Sesi quiz sudah selesai' })
      return
    }

    const questions: QuizQuestion[] = quizSession.questions
    const correctnessArray: boolean[] = questions.map(
      (_q: QuizQuestion, i: number) => answers[String(i)] === questions[i].correctAnswer
    )

    const score = calculateQuizScore(correctnessArray)
    const xpEarned = calculateQuizXP(score)
    const correctCount = correctnessArray.filter(Boolean).length
    const completedAt = new Date().toISOString()

    await supabaseAdmin
      .from('quiz_sessions')
      .update({ answers, score, xp_earned: xpEarned, completed_at: completedAt })
      .eq('id', sessionId)

    await supabaseAdmin.from('activity_records').insert({
      user_id: userId,
      type: 'quiz',
      document_id: quizSession.document_id,
      score,
      xp_earned: xpEarned,
    })

    await updateStreak(userId)
    const newTitles = await checkAndAwardBadges(userId)

    res.json({
      score,
      xpEarned,
      correctCount,
      totalCount: questions.length,
      questions,
      newTitles,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
    res.status(500).json({ error: message })
  }
})

// ─── GET /api/quiz/history ────────────────────────────────────────────────────

router.get('/history', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id

  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_type', 'quiz')
      .not('completed_at', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      res.status(500).json({ error: 'Gagal mengambil riwayat quiz' })
      return
    }

    res.json(data ?? [])
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
    res.status(500).json({ error: message })
  }
})

export default router
