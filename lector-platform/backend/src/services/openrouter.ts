/**
 * OpenRouter AI service — OpenAI-compatible API
 * Supports streaming (SSE) and non-streaming calls.
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

function getHeaders() {
  return {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.FRONTEND_URL ?? 'http://localhost:5173',
    'X-Title': 'LECTOR Platform',
  }
}

function getModel() {
  return process.env.OPENROUTER_MODEL ?? 'qwen/qwen3-235b-a22b:free'
}

/**
 * Non-streaming completion — returns full text response.
 */
export async function generateText(prompt: string): Promise<string> {
  let lastErr: Error | null = null

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: getModel(),
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        const is429 = res.status === 429
        lastErr = new Error(`OpenRouter ${res.status}: ${errText}`)
        if (!is429 || attempt === 2) throw lastErr
        await new Promise((r) => setTimeout(r, (attempt + 1) * 2000))
        continue
      }

      const data = await res.json() as {
        choices: { message: { content: string } }[]
      }
      return data.choices[0]?.message?.content ?? ''
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      const is429 = lastErr.message.includes('429') || lastErr.message.includes('rate')
      if (!is429 || attempt === 2) throw lastErr
      await new Promise((r) => setTimeout(r, (attempt + 1) * 2000))
    }
  }

  throw lastErr ?? new Error('Gagal menghubungi AI')
}

/**
 * Streaming completion — calls onToken for each text chunk, onDone when finished.
 * Returns the full accumulated response text.
 */
export async function streamText(
  prompt: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<string> {
  let lastErr: Error | null = null

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: getModel(),
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        const is429 = res.status === 429
        lastErr = new Error(`OpenRouter ${res.status}: ${errText}`)
        if (!is429 || attempt === 2) {
          onError(is429 ? 'Batas permintaan AI tercapai. Coba lagi dalam beberapa detik.' : lastErr.message)
          return ''
        }
        await new Promise((r) => setTimeout(r, (attempt + 1) * 2000))
        continue
      }

      if (!res.body) {
        onError('Tidak ada response stream dari AI')
        return ''
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue
          if (!trimmed.startsWith('data: ')) continue

          try {
            const json = JSON.parse(trimmed.slice(6)) as {
              choices: { delta: { content?: string } }[]
            }
            const token = json.choices[0]?.delta?.content ?? ''
            if (token) {
              fullText += token
              onToken(token)
            }
          } catch {
            // skip malformed SSE line
          }
        }
      }

      onDone()
      return fullText
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err))
      const is429 = lastErr.message.includes('429') || lastErr.message.includes('rate')
      if (!is429 || attempt === 2) {
        onError(lastErr.message)
        return ''
      }
      await new Promise((r) => setTimeout(r, (attempt + 1) * 2000))
    }
  }

  onError(lastErr?.message ?? 'Gagal menghubungi AI')
  return ''
}
