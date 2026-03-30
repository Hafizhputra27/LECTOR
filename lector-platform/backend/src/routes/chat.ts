import { Router, Request, Response } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { authMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabase'
import { retrieveRelevantChunks, buildPrompt } from '../services/ragPipeline'

const router = Router()

router.post('/stream', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { documentId, message, sessionId: existingSessionId } = req.body
  const userId = req.user!.id

  if (!documentId || !message) {
    res.status(400).json({ error: 'documentId and message are required' })
    return
  }

  // Set SSE headers before streaming begins
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    // Step 1: Resolve or create chat session
    let sessionId = existingSessionId
    if (!sessionId) {
      const { data: session, error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .insert({ user_id: userId, document_id: documentId })
        .select('id')
        .single()

      if (sessionError || !session) {
        sendEvent({ error: 'Failed to create chat session' })
        res.end()
        return
      }
      sessionId = session.id
    }

    // Step 2: Insert user message
    await supabaseAdmin.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
    })

    // Step 3: Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(documentId, message)

    // Step 4: Build prompt
    const prompt = buildPrompt(chunks, message)

    // Step 5: Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Step 6: Stream response (with retry on 429)
    let result
    let lastErr: Error | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContentStream(prompt)
        lastErr = null
        break
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err))
        const is429 = lastErr.message.includes('429') || lastErr.message.includes('quota')
        if (!is429 || attempt === 2) break
        // Wait before retry: 2s, 4s
        await new Promise((r) => setTimeout(r, (attempt + 1) * 2000))
      }
    }

    if (!result) {
      const errMsg = lastErr?.message ?? 'Gagal menghubungi AI'
      const is429 = errMsg.includes('429') || errMsg.includes('quota')

      if (is429 && chunks.length > 0) {
        // Fallback: return relevant chunks as plain text response
        const fallbackResponse =
          `⚠️ *AI sedang tidak tersedia (quota habis). Berikut konten relevan dari dokumen:*\n\n` +
          chunks.map((c, i) => `**[${i + 1}]** ${c}`).join('\n\n')

        // Stream fallback as tokens
        const words = fallbackResponse.split(' ')
        for (const word of words) {
          sendEvent({ token: word + ' ', sessionId })
        }
        res.write('data: [DONE]\n\n')

        await supabaseAdmin.from('chat_messages').insert({
          session_id: sessionId,
          role: 'assistant',
          content: fallbackResponse,
        })
        res.end()
        return
      }

      sendEvent({
        error: is429
          ? 'Batas permintaan AI tercapai. Coba lagi dalam beberapa detik.'
          : errMsg,
      })
      res.end()
      return
    }

    let fullResponse = ''

    // Step 7-8: Stream each chunk as SSE
    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        fullResponse += text
        sendEvent({ token: text, sessionId })
      }
    }

    // Step 9: Signal stream completion
    res.write('data: [DONE]\n\n')

    // Step 10: Save assistant message
    await supabaseAdmin.from('chat_messages').insert({
      session_id: sessionId,
      role: 'assistant',
      content: fullResponse,
    })

    res.end()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    sendEvent({ error: message })
    res.end()
  }
})

router.post('/summary', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { documentId, sessionId } = req.body

  if (!documentId) {
    res.status(400).json({ error: 'documentId is required' })
    return
  }

  try {
    // Step 1: Fetch all chunks ordered by chunk_index, limit to first 20
    const { data: chunks, error: chunksError } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true })
      .limit(20)

    if (chunksError) {
      res.status(500).json({ error: 'Failed to fetch document chunks' })
      return
    }

    if (!chunks || chunks.length === 0) {
      res.status(404).json({ error: 'Dokumen belum memiliki konten yang dapat diproses. Coba hapus dan upload ulang dokumen.' })
      return
    }

    // Step 2: Join all chunks into a single context string
    const context = chunks.map((c: { content: string }) => c.content).join('\n\n')

    // Step 3: Build summary prompt in Indonesian
    const prompt = `Kamu adalah asisten belajar AI cerdas untuk mahasiswa Indonesia bernama LECTOR.

Buat ringkasan komprehensif dari dokumen berikut dalam Bahasa Indonesia menggunakan format Markdown yang rapi.

Format ringkasan:
## Ringkasan Dokumen

### Topik Utama
(Sebutkan topik-topik utama yang dibahas)

### Poin-Poin Kunci
(Bullet list poin penting dari setiap bagian)

### Konsep Penting
(Definisi atau penjelasan konsep-konsep kunci dengan **bold** untuk istilah penting)

### Kesimpulan
(Rangkuman singkat keseluruhan dokumen)

Dokumen:
---
${context}
---

Ringkasan:`

    // Step 4: Call Gemini API (non-streaming) with retry on 429
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // Resolve sessionId early so fallback can use it
    let resolvedSessionId: string | null = sessionId ?? null

    let result
    let lastErr: Error | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await model.generateContent(prompt)
        lastErr = null
        break
      } catch (err) {
        lastErr = err instanceof Error ? err : new Error(String(err))
        const is429 = lastErr.message.includes('429') || lastErr.message.includes('quota')
        if (!is429 || attempt === 2) break
        await new Promise((r) => setTimeout(r, (attempt + 1) * 2000))
      }
    }

    if (!result) {
      const errMsg = lastErr?.message ?? 'Gagal menghubungi AI'
      const is429 = errMsg.includes('429') || errMsg.includes('quota')

      if (is429 && chunks && chunks.length > 0) {
        // Fallback: return raw chunks as structured summary
        const fallbackSummary =
          `⚠️ *AI sedang tidak tersedia (quota habis). Berikut isi dokumen secara langsung:*\n\n` +
          chunks.map((c: { content: string }, i: number) => `**Bagian ${i + 1}:**\n${c.content}`).join('\n\n')

        if (resolvedSessionId) {
          await supabaseAdmin.from('chat_messages').insert({
            session_id: resolvedSessionId,
            role: 'assistant',
            content: fallbackSummary,
          })
        }
        res.json({ summary: fallbackSummary, sessionId: resolvedSessionId })
        return
      }

      res.status(503).json({
        error: is429
          ? 'Batas permintaan AI tercapai. Coba lagi dalam beberapa detik.'
          : errMsg,
      })
      return
    }

    // Step 5: Get summary text from response
    const summary = result.response.text()

    // Step 6: If sessionId provided, save summary to chat_messages as assistant message
    if (resolvedSessionId) {
      await supabaseAdmin.from('chat_messages').insert({
        session_id: resolvedSessionId,
        role: 'assistant',
        content: summary,
      })
    }

    // Step 7: Return summary and sessionId
    res.json({ summary, sessionId: resolvedSessionId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ error: message })
  }
})

export default router
