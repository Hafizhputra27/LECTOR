import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabase'
import { retrieveRelevantChunks, buildPrompt } from '../services/ragPipeline'
import { streamText, generateText } from '../services/openrouter'

const router = Router()

router.post('/stream', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const { documentId, message, sessionId: existingSessionId } = req.body
  const userId = req.user!.id

  if (!documentId || !message) {
    res.status(400).json({ error: 'documentId and message are required' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const sendEvent = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    // Resolve or create chat session
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

    // Insert user message
    await supabaseAdmin.from('chat_messages').insert({
      session_id: sessionId,
      role: 'user',
      content: message,
    })

    // RAG: retrieve relevant chunks and build prompt
    const chunks = await retrieveRelevantChunks(documentId, message)
    const prompt = buildPrompt(chunks, message)

    // Stream via OpenRouter
    const fullResponse = await streamText(
      prompt,
      (token) => sendEvent({ token, sessionId }),
      () => res.write('data: [DONE]\n\n'),
      (err) => sendEvent({ error: err })
    )

    // Save assistant message
    if (fullResponse) {
      await supabaseAdmin.from('chat_messages').insert({
        session_id: sessionId,
        role: 'assistant',
        content: fullResponse,
      })
    }

    res.end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    sendEvent({ error: msg })
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
    const { data: chunks, error: chunksError } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .eq('document_id', documentId)
      .order('chunk_index', { ascending: true })
      .limit(20)

    if (chunksError || !chunks || chunks.length === 0) {
      res.status(404).json({ error: 'Dokumen belum memiliki konten yang dapat diproses.' })
      return
    }

    const context = chunks.map((c: { content: string }) => c.content).join('\n\n')

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

    const summary = await generateText(prompt)

    const resolvedSessionId: string | null = sessionId ?? null
    if (resolvedSessionId) {
      await supabaseAdmin.from('chat_messages').insert({
        session_id: resolvedSessionId,
        role: 'assistant',
        content: summary,
      })
    }

    res.json({ summary, sessionId: resolvedSessionId })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    res.status(503).json({ error: msg })
  }
})

export default router
