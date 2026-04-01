import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

/**
 * Get Gemini model with retry logic for 429/quota errors
 */
export function getGeminiModel(modelName: string = 'gemini-2.0-flash') {
  return genAI.getGenerativeModel({ model: modelName })
}

/**
 * Execute Gemini API call with automatic retry on quota errors
 */
export async function executeGeminiCall<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<{ result: T | null; error: Error | null }> {
  let result: T | null = null
  let lastErr: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      result = await operation()
      return { result, error: null }
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      const is429 = lastErr.message.includes('429') || lastErr.message.includes('quota')

      // If not a 429 error or this is the last attempt, break
      if (!is429 || attempt === maxRetries - 1) break

      // Wait before retry: 2s, 4s, 6s, etc.
      await new Promise((r) => setTimeout(r, (attempt + 1) * 2000))
    }
  }

  return { result, error: lastErr }
}
