import { XP_REWARDS } from './gamificationEngine'

/**
 * Calculates quiz score as an integer in [0, 100].
 * Returns 0 if the answers array is empty.
 */
export function calculateQuizScore(answers: boolean[]): number {
  if (answers.length === 0) return 0
  const correct = answers.filter(Boolean).length
  return Math.round((correct / answers.length) * 100)
}

/**
 * Calculates XP earned from a quiz based on the score.
 * Returns quiz_completed_base + quiz_score_bonus(score).
 */
export function calculateQuizXP(score: number): number {
  return XP_REWARDS.quiz_completed_base + XP_REWARDS.quiz_score_bonus(score)
}
