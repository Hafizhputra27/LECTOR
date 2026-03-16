import * as fc from 'fast-check'

// Mock supabase to avoid env var requirement when importing gamificationEngine
jest.mock('../supabase', () => ({
  supabaseAdmin: {},
}))

import { calculateQuizScore, calculateQuizXP } from '../quizScoring'

/**
 * Validates: Requirements 6.7, 8.1
 * Property 5: Skor quiz selalu dalam rentang [0, 100]
 */
describe('calculateQuizScore - Property 5', () => {
  it('always returns a score in [0, 100] for any pattern of correct/wrong answers', () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 1 }), (answers) => {
        const score = calculateQuizScore(answers)
        return score >= 0 && score <= 100
      })
    )
  })
})

/**
 * Validates: Requirements 6.7, 8.1
 * Property 6: XP yang diperoleh dari quiz selalu >= quiz_completed_base (20 XP)
 */
describe('calculateQuizXP - Property 6', () => {
  it('always returns XP >= 20 for any answer pattern', () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 1 }), (answers) => {
        const score = calculateQuizScore(answers)
        const xp = calculateQuizXP(score)
        return xp >= 20
      })
    )
  })
})
