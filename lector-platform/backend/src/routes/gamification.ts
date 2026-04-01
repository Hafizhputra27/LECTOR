import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabase'
import { updateStreak, checkAndAwardBadges } from '../services/gamificationEngine'

const router = Router()

// GET /api/gamification/profile
router.get('/profile', authMiddleware, async (req, res) => {
  const userId = req.user!.id

  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('gamification_profiles')
      .select('streak, last_active_date')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      res.status(500).json({ error: 'Gagal mengambil profil gamifikasi' })
      return
    }

    // Get all badges with earned status
    const { data: allBadges } = await supabaseAdmin
      .from('badges')
      .select('id, name, description, icon_url')

    const { data: userBadges } = await supabaseAdmin
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', userId)

    const earnedMap = new Map(
      (userBadges ?? []).map((ub: { badge_id: string; earned_at: string }) => [ub.badge_id, ub.earned_at])
    )

    const badges = (allBadges ?? []).map((b: { id: string; name: string; description: string; icon_url?: string }) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      iconUrl: b.icon_url ?? undefined,
      earnedAt: earnedMap.get(b.id) ?? null,
    }))

    // Get quiz stats
    const { data: quizSessions } = await supabaseAdmin
      .from('quiz_sessions')
      .select('score')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)

    const quizzesCompleted = quizSessions?.length ?? 0
    const averageScore = quizzesCompleted > 0
      ? Math.round((quizSessions ?? []).reduce((sum: number, s: { score: number }) => sum + s.score, 0) / quizzesCompleted)
      : 0

    res.json({
      userId,
      streak: profile.streak,
      lastActiveDate: profile.last_active_date,
      badges,
      quizzesCompleted,
      averageScore,
    })
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server' })
  }
})

// POST /api/gamification/activity — record activity, update streak, check badges
router.post('/activity', authMiddleware, async (req, res) => {
  const userId = req.user!.id

  try {
    const newStreak = await updateStreak(userId)
    const newTitles = await checkAndAwardBadges(userId)

    res.json({ streak: newStreak, newTitles })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server'
    res.status(500).json({ error: message })
  }
})

export default router
