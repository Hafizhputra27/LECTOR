import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabase'

const router = Router()

const PAGE_SIZE = 20

// ─── GET /api/history ─────────────────────────────────────────────────────────

router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id

  const { type, startDate, endDate, page: pageParam } = req.query

  const page = Math.max(1, parseInt(String(pageParam ?? '1'), 10) || 1)
  const offset = (page - 1) * PAGE_SIZE

  try {
    // Build base query with left join on documents for file_name
    let query = supabaseAdmin
      .from('activity_records')
      .select(
        `id, type, score, xp_earned, created_at, document_id,
         documents ( file_name )`,
        { count: 'exact' }
      )
      .eq('user_id', userId)

    // Optional type filter
    if (type && ['chat', 'quiz', 'exam', 'summary'].includes(String(type))) {
      query = query.eq('type', String(type))
    }

    // Optional date range filter
    if (startDate) {
      query = query.gte('created_at', `${String(startDate)}T00:00:00.000Z`)
    }
    if (endDate) {
      query = query.lte('created_at', `${String(endDate)}T23:59:59.999Z`)
    }

    // Order and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    const { data, error, count } = await query

    if (error) {
      res.status(500).json({ error: 'Gagal mengambil riwayat belajar' })
      return
    }

    const total = count ?? 0
    const totalPages = Math.ceil(total / PAGE_SIZE)

    // Shape the response
    const records = (data ?? []).map((row: any) => ({
      id: row.id as string,
      type: row.type as 'chat' | 'quiz' | 'exam' | 'summary',
      documentName: (row.documents?.file_name as string | null) ?? null,
      score: row.score as number | null,
      xpEarned: row.xp_earned as number,
      createdAt: row.created_at as string,
    }))

    res.json({ data: records, total, page, totalPages })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan'
    res.status(500).json({ error: message })
  }
})

export default router
