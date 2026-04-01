import { supabaseAdmin } from './supabase'

/**
 * Pure function: calculates the new streak value given current streak,
 * last active date, and today's date (all as YYYY-MM-DD strings).
 */
export function calculateNewStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  today: string
): number {
  if (lastActiveDate === today) {
    return currentStreak
  } else if (lastActiveDate) {
    try {
      const todayDate = new Date(today)
      const yesterday = new Date(todayDate)
      yesterday.setUTCDate(todayDate.getUTCDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastActiveDate === yesterdayStr) {
        return currentStreak + 1
      } else {
        return 1
      }
    } catch {
      return 1
    }
  } else {
    return 1
  }
}

/**
 * Updates the daily streak for a user.
 * Returns the new streak value.
 */
export async function updateStreak(userId: string): Promise<number> {
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from('gamification_profiles')
    .select('streak, last_active_date')
    .eq('user_id', userId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch gamification profile: ${fetchError.message}`)
  }

  const today = new Date().toISOString().split('T')[0]
  const lastActive = profile.last_active_date

  const newStreak = calculateNewStreak(profile.streak, lastActive, today)

  if (lastActive === today) {
    return profile.streak
  }

  const { error: updateError } = await supabaseAdmin
    .from('gamification_profiles')
    .update({ streak: newStreak, last_active_date: today })
    .eq('user_id', userId)

  if (updateError) {
    throw new Error(`Failed to update streak: ${updateError.message}`)
  }

  return newStreak
}

/**
 * Checks and awards any badges the user has newly earned.
 * Returns an array of newly earned badge names (titles).
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('gamification_profiles')
    .select('xp, streak')
    .eq('user_id', userId)
    .single()

  if (profileError) {
    throw new Error(`Failed to fetch gamification profile: ${profileError.message}`)
  }

  const { data: allBadges, error: badgesError } = await supabaseAdmin
    .from('badges')
    .select('*')

  if (badgesError) {
    throw new Error(`Failed to fetch badges: ${badgesError.message}`)
  }

  const { data: userBadges, error: userBadgesError } = await supabaseAdmin
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)

  if (userBadgesError) {
    throw new Error(`Failed to fetch user badges: ${userBadgesError.message}`)
  }

  const earnedBadgeIds = new Set(userBadges.map((ub: { badge_id: string }) => ub.badge_id))

  const { data: quizSessions, error: quizError } = await supabaseAdmin
    .from('quiz_sessions')
    .select('id, score')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)

  if (quizError) {
    throw new Error(`Failed to fetch quiz sessions: ${quizError.message}`)
  }

  const completedQuizCount = quizSessions?.length ?? 0
  const hasPerfectScore = quizSessions?.some((qs: { score: number }) => qs.score === 100) ?? false

  const newlyEarnedBadges: Array<{ badge_id: string }> = []
  const newlyEarnedNames: string[] = []

  for (const badge of allBadges ?? []) {
    if (earnedBadgeIds.has(badge.id)) continue

    let conditionMet = false

    switch (badge.trigger_type) {
      case 'streak':
        conditionMet = profile.streak >= badge.trigger_value
        break
      case 'quiz_count':
        conditionMet = completedQuizCount >= badge.trigger_value
        break
      case 'perfect_score':
        conditionMet = hasPerfectScore
        break
      case 'xp_milestone':
        conditionMet = profile.xp >= badge.trigger_value
        break
    }

    if (conditionMet) {
      newlyEarnedBadges.push({ badge_id: badge.id })
      newlyEarnedNames.push(badge.name)
    }
  }

  if (newlyEarnedBadges.length > 0) {
    const inserts = newlyEarnedBadges.map((b) => ({
      user_id: userId,
      badge_id: b.badge_id,
    }))

    const { error: insertError } = await supabaseAdmin.from('user_badges').insert(inserts)

    if (insertError) {
      throw new Error(`Failed to insert user badges: ${insertError.message}`)
    }
  }

  return newlyEarnedNames
}
