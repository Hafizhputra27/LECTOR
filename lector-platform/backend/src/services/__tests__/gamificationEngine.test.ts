import * as fc from 'fast-check'

// Mock supabase to avoid env var requirement when importing gamificationEngine
jest.mock('../supabase', () => ({
  supabaseAdmin: {},
}))

import { calculateLevel, XP_REWARDS, calculateNewStreak } from '../gamificationEngine'

/**
 * Validates: Requirements 8.2
 * Property 1: Level selalu dalam rentang valid [1, 10]
 */
describe('calculateLevel', () => {
  it('always returns a level in the valid range [1, 10] for any XP value', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 10000 }), (xp) => {
        const level = calculateLevel(xp)
        return level >= 1 && level <= 10
      })
    )
  })
})

/**
 * Validates: Requirements 8.1
 * Property 2: XP yang diberikan selalu non-negatif untuk semua jenis aktivitas
 */
describe('XP_REWARDS', () => {
  it('all XP reward values (fixed and score-based) are always >= 0 for any score', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const fixedRewards = [
          XP_REWARDS.chat_session,
          XP_REWARDS.summary_generated,
          XP_REWARDS.quiz_completed_base,
          XP_REWARDS.exam_completed_base,
        ]
        const scoreBonuses = [
          XP_REWARDS.quiz_score_bonus(score),
          XP_REWARDS.exam_score_bonus(score),
        ]
        return (
          fixedRewards.every((xp) => xp >= 0) &&
          scoreBonuses.every((xp) => xp >= 0)
        )
      })
    )
  })
})

/**
 * Validates: Requirements 8.4, 8.5, 8.6
 * Property 3: Streak tidak pernah bernilai negatif
 */
describe('calculateNewStreak - Property 3', () => {
  it('never returns a negative value for any combination of streak, lastActiveDate, and today', () => {
    // Constrain dates to a safe range to avoid JS Date overflow edge cases
    const safeDate = fc.date({
      min: new Date('2000-01-01'),
      max: new Date('2100-12-31'),
    })
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 365 }),
        fc.option(safeDate),
        safeDate,
        (streak, lastActiveDateOrNull, todayDate) => {
          const todayStr = todayDate.toISOString().split('T')[0]
          const lastActiveStr = lastActiveDateOrNull
            ? lastActiveDateOrNull.toISOString().split('T')[0]
            : null
          const result = calculateNewStreak(streak, lastActiveStr, todayStr)
          return result >= 0
        }
      )
    )
  })
})

/**
 * Validates: Requirements 8.4, 8.5, 8.6
 * Property 4: Streak hanya bertambah 1 jika aktivitas pada hari berturut-turut
 */
describe('calculateNewStreak - Property 4', () => {
  it('increments streak by exactly 1 when lastActiveDate is exactly one day before today', () => {
    // Constrain dates to a safe range, starting from 2000-01-02 so yesterday is always valid
    const safeDate = fc.date({
      min: new Date('2000-01-02'),
      max: new Date('2100-12-31'),
    })
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 365 }),
        safeDate,
        (streak, todayDate) => {
          const todayStr = todayDate.toISOString().split('T')[0]
          const yesterdayDate = new Date(todayDate)
          yesterdayDate.setUTCDate(todayDate.getUTCDate() - 1)
          const yesterdayStr = yesterdayDate.toISOString().split('T')[0]
          const result = calculateNewStreak(streak, yesterdayStr, todayStr)
          return result === streak + 1
        }
      )
    )
  })
})
