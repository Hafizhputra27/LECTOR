import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabase'
import { awardXP, updateStreak, checkAndAwardBadges } from '../services/gamificationEngine'

const router = Router()

// GET /api/gamification/profile
router.get('/profile', authMiddleware, async (req, res) => {
  const userId = req.user!.id

  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('gamification_profiles')
      .select('xp, level, streak, last_active_date')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      res.status(500).json({ error: 'Gagal mengambil profil gamifikasi' })
      return
    }

    const { data: userBadges, error: badgesError } = await supabaseAdmin
      .from('user_badges')
      .select('earned_at, badges(id, name, description, icon_url)')
      .eq('user_id', userId)

    if (badgesError) {
      res.status(500).json({ error: 'Gagal mengambil badge pengguna' })
      return
    }

    const badges = (userBadges ?? []).map((ub: any) => ({
      id: ub.badges?.id ?? '',
      name: ub.badges?.name ?? '',
      description: ub.badges?.description ?? '',
      iconUrl: ub.badges?.icon_url ?? undefined,
      earnedAt: ub.earned_at,
    }))

    res.json({
      userId,
      xp: profile.xp,
      level: profile.level,
      streak: profile.streak,
      lastActiveDate: profile.last_active_date,
      badges,
    })
  } catch {
    res.status(500).json({ error: 'Terjadi kesalahan server' })
  }
})

// POST /api/gamification/award-xp
router.post('/award-xp', authMiddleware, async (req, res) => {
  const userId = req.user!.id
  const { activityType, score } = req.body as { activityType: string; score?: number }

  if (!activityType) {
    res.status(400).json({ error: 'activityType diperlukan' })
    return
  }

  try {
    const { xp, level, levelUp } = await awardXP(userId, activityType, score)
    await updateStreak(userId)
    const newBadges = await checkAndAwardBadges(userId)

    res.json({ xp, level, levelUp, newBadges })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan server'
    res.status(500).json({ error: message })
  }
})

export default router
