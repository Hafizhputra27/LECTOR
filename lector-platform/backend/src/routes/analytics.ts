import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabase'

const router = Router()

// ─── GET /api/analytics ───────────────────────────────────────────────────────

router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id

  try {
    // 1. Fetch gamification profile
    const { data: gamProfile, error: gamError } = await supabaseAdmin
      .from('gamification_profiles')
      .select('xp, level, streak')
      .eq('user_id', userId)
      .single()

    if (gamError || !gamProfile) {
      res.status(500).json({ error: 'Gagal mengambil profil gamifikasi' })
      return
    }

    // 2. Fetch completed quiz sessions for count and average score
    const { data: quizSessions, error: quizError } = await supabaseAdmin
      .from('quiz_sessions')
      .select('score, document_id')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)

    if (quizError) {
      res.status(500).json({ error: 'Gagal mengambil data quiz' })
      return
    }

    const quizzesCompleted = quizSessions?.length ?? 0
    const averageScore =
      quizzesCompleted > 0
        ? Math.round(
            (quizSessions!.reduce((sum, s) => sum + (s.score ?? 0), 0) / quizzesCompleted) * 10
          ) / 10
        : 0

    // 3. Fetch activity records for last 14 days (activityByDay)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setUTCDate(fourteenDaysAgo.getUTCDate() - 13)
    fourteenDaysAgo.setUTCHours(0, 0, 0, 0)

    const { data: activityRecords, error: activityError } = await supabaseAdmin
      .from('activity_records')
      .select('created_at, document_id')
      .eq('user_id', userId)
      .gte('created_at', fourteenDaysAgo.toISOString())

    if (activityError) {
      res.status(500).json({ error: 'Gagal mengambil data aktivitas' })
      return
    }

    // Aggregate activity by day (last 14 days)
    const dayCountMap: Record<string, number> = {}
    // Pre-fill all 14 days with 0
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      dayCountMap[dateStr] = 0
    }
    for (const record of activityRecords ?? []) {
      const dateStr = record.created_at.split('T')[0]
      if (dateStr in dayCountMap) {
        dayCountMap[dateStr] = (dayCountMap[dateStr] ?? 0) + 1
      }
    }
    const activityByDay = Object.entries(dayCountMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

    // 4. Topic performance: quiz sessions grouped by document, joined with documents table
    const documentIds = [
      ...new Set((quizSessions ?? []).map((s) => s.document_id).filter(Boolean)),
    ]

    let topicPerformance: { documentName: string; averageScore: number }[] = []

    if (documentIds.length > 0) {
      const { data: documents, error: docsError } = await supabaseAdmin
        .from('documents')
        .select('id, file_name')
        .in('id', documentIds)

      if (!docsError && documents) {
        const docMap: Record<string, string> = {}
        for (const doc of documents) {
          docMap[doc.id] = doc.file_name
        }

        // Group quiz sessions by document_id
        const docScores: Record<string, number[]> = {}
        for (const session of quizSessions ?? []) {
          if (!session.document_id) continue
          if (!docScores[session.document_id]) docScores[session.document_id] = []
          docScores[session.document_id].push(session.score ?? 0)
        }

        topicPerformance = Object.entries(docScores).map(([docId, scores]) => ({
          documentName: docMap[docId] ?? 'Dokumen Tidak Dikenal',
          averageScore:
            Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
        }))
      }
    }

    res.json({
      totalXP: gamProfile.xp,
      currentLevel: gamProfile.level,
      currentStreak: gamProfile.streak,
      quizzesCompleted,
      averageScore,
      activityByDay,
      topicPerformance,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
    res.status(500).json({ error: message })
  }
})

export default router
