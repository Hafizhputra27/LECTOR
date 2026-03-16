import { supabase } from './supabase'
import type { Document } from '../store/documentStore'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('No active session')
  return { Authorization: `Bearer ${token}` }
}

export async function uploadDocument(file: File): Promise<Document> {
  const headers = await getAuthHeaders()
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/api/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload gagal' }))
    throw new Error(err.message ?? err.error ?? 'Upload gagal')
  }

  const body = await res.json()
  // backend returns { document: {...} }
  const d = body.document ?? body
  return {
    id: d.id,
    userId: d.user_id,
    fileName: d.file_name,
    fileType: d.file_type,
    fileSize: d.file_size,
    pageCount: d.page_count,
    uploadedAt: d.uploaded_at,
    status: d.status,
    storagePath: d.storage_path,
  } as Document
}

export async function getDocuments(): Promise<Document[]> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/documents`, { headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal mengambil dokumen' }))
    throw new Error(err.message ?? 'Gagal mengambil dokumen')
  }

  const body = await res.json()
  // backend returns { documents: [...] }
  const raw = Array.isArray(body) ? body : (body.documents ?? [])
  return raw.map((d: Record<string, unknown>) => ({
    id: d.id,
    userId: d.user_id,
    fileName: d.file_name,
    fileType: d.file_type,
    fileSize: d.file_size,
    pageCount: d.page_count,
    uploadedAt: d.uploaded_at,
    status: d.status,
    storagePath: d.storage_path,
  })) as Document[]
}

export async function reprocessDocument(id: string): Promise<{ chunkCount: number; warning?: string }> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/documents/${id}/reprocess`, {
    method: 'POST',
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal memproses ulang dokumen' }))
    throw new Error(err.message ?? err.error ?? 'Gagal memproses ulang dokumen')
  }

  return res.json()
}

export async function deleteDocument(id: string): Promise<void> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/documents/${id}`, {
    method: 'DELETE',
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal menghapus dokumen' }))
    throw new Error(err.message ?? 'Gagal menghapus dokumen')
  }
}

export async function streamChat(
  documentId: string,
  message: string,
  sessionId: string | null,
  onToken: (token: string, sessionId: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  let headers: HeadersInit
  try {
    headers = await getAuthHeaders()
  } catch (e) {
    onError('No active session')
    return
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api/chat/stream`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, message, sessionId }),
    })
  } catch (e) {
    onError('Gagal terhubung ke server')
    return
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal memulai chat' }))
    onError(err.message ?? 'Gagal memulai chat')
    return
  }

  const reader = res.body?.getReader()
  if (!reader) {
    onError('Streaming tidak didukung')
    return
  }

  const decoder = new TextDecoder()
  let currentSessionId = sessionId ?? ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') {
            onDone()
            return
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              onError(parsed.error)
              return
            }
            if (parsed.sessionId) currentSessionId = parsed.sessionId
            if (parsed.token) onToken(parsed.token, currentSessionId)
          } catch {
            // plain text token
            if (data) onToken(data, currentSessionId)
          }
        }
      }
    }
  } catch (e) {
    onError('Koneksi terputus saat streaming')
    return
  }

  onDone()
}

export async function getSummary(
  documentId: string,
  sessionId: string | null
): Promise<{ summary: string; sessionId: string | null }> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/chat/summary`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, sessionId }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal membuat ringkasan' }))
    throw new Error(err.message ?? 'Gagal membuat ringkasan')
  }

  return res.json()
}

export async function awardXP(
  activityType: string,
  score?: number
): Promise<{ xp: number; level: number; levelUp?: boolean }> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/gamification/award-xp`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityType, score }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal memberikan XP' }))
    throw new Error(err.message ?? 'Gagal memberikan XP')
  }

  return res.json()
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export async function generateQuiz(
  documentId: string,
  questionCount?: number
): Promise<{ sessionId: string; questions: unknown[] }> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/quiz/generate`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, questionCount }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal membuat quiz' }))
    throw new Error(err.message ?? 'Gagal membuat quiz')
  }

  return res.json()
}

export async function submitQuiz(
  sessionId: string,
  answers: Record<string, string>
): Promise<{
  score: number
  xpEarned: number
  correctCount: number
  totalCount: number
  questions: unknown[]
}> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/quiz/submit`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, answers }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal mengirim jawaban quiz' }))
    throw new Error(err.message ?? 'Gagal mengirim jawaban quiz')
  }

  return res.json()
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export async function startExam(
  documentId: string,
  questionCount?: number,
  totalTimeSeconds?: number
): Promise<{ sessionId: string; questions: unknown[]; totalTimeSeconds: number }> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/exam/start`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId, questionCount, totalTimeSeconds }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal memulai ujian' }))
    throw new Error(err.message ?? 'Gagal memulai ujian')
  }

  return res.json()
}

export async function submitExam(
  sessionId: string,
  answers: Record<string, string>
): Promise<{
  score: number
  xpEarned: number
  correctCount: number
  totalCount: number
  questions: unknown[]
}> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/exam/submit`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, answers }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal mengirim jawaban ujian' }))
    throw new Error(err.message ?? 'Gagal mengirim jawaban ujian')
  }

  return res.json()
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface ActivityRecord {
  id: string
  type: 'chat' | 'quiz' | 'exam' | 'summary'
  documentName: string | null
  score: number | null
  xpEarned: number
  createdAt: string
}

export interface HistoryResponse {
  data: ActivityRecord[]
  total: number
  page: number
  totalPages: number
}

export interface HistoryParams {
  type?: 'chat' | 'quiz' | 'exam' | 'summary'
  startDate?: string
  endDate?: string
  page?: number
}

export async function getHistory(params: HistoryParams = {}): Promise<HistoryResponse> {
  const headers = await getAuthHeaders()

  const query = new URLSearchParams()
  if (params.type) query.set('type', params.type)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  if (params.page) query.set('page', String(params.page))

  const url = `${API_BASE}/api/history${query.toString() ? `?${query.toString()}` : ''}`
  const res = await fetch(url, { headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal mengambil riwayat' }))
    throw new Error(err.message ?? 'Gagal mengambil riwayat')
  }

  return res.json()
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsSummary {
  totalXP: number
  currentLevel: number
  currentStreak: number
  quizzesCompleted: number
  averageScore: number
  activityByDay: { date: string; count: number }[]
  topicPerformance: { documentName: string; averageScore: number }[]
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  const headers = await getAuthHeaders()

  const res = await fetch(`${API_BASE}/api/analytics`, { headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal mengambil data analitik' }))
    throw new Error(err.message ?? 'Gagal mengambil data analitik')
  }

  return res.json()
}
