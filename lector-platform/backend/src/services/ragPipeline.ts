import { supabaseAdmin } from './supabase'

/**
 * Retrieve relevant document chunks for a given query using keyword-based search.
 * Falls back to first `limit` chunks ordered by chunk_index if no keyword matches.
 */
export async function retrieveRelevantChunks(
  documentId: string,
  query: string,
  limit = 5
): Promise<string[]> {
  const keywords = query
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0)

  // Try keyword-based search using ILIKE for each word
  if (keywords.length > 0) {
    // Build OR filter: content ILIKE '%word%' for each keyword
    const ilikeFilter = keywords.map((kw) => `content.ilike.%${kw}%`).join(',')

    const { data, error } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .eq('document_id', documentId)
      .or(ilikeFilter)
      .order('chunk_index', { ascending: true })
      .limit(limit)

    if (!error && data && data.length > 0) {
      return data.map((row: { content: string }) => row.content)
    }
  }

  // Fallback: return first `limit` chunks ordered by chunk_index
  const { data: fallbackData, error: fallbackError } = await supabaseAdmin
    .from('document_chunks')
    .select('content')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true })
    .limit(limit)

  if (fallbackError || !fallbackData) {
    return []
  }

  return fallbackData.map((row: { content: string }) => row.content)
}

/**
 * Build a RAG prompt combining document context chunks with the user's query.
 */
export function buildPrompt(chunks: string[], query: string): string {
  const systemInstruction = `Kamu adalah asisten belajar AI cerdas untuk mahasiswa Indonesia bernama LECTOR.

Aturan menjawab:
- Jawab SELALU dalam Bahasa Indonesia yang jelas dan mudah dipahami
- Gunakan format Markdown untuk membuat jawaban terstruktur dan mudah dibaca:
  - Gunakan ## untuk judul bagian utama
  - Gunakan ### untuk sub-bagian
  - Gunakan **teks** untuk menebalkan istilah penting
  - Gunakan bullet list (- item) untuk daftar poin
  - Gunakan numbered list (1. item) untuk langkah-langkah berurutan
  - Gunakan \`kode\` untuk istilah teknis atau rumus singkat
- Berikan penjelasan yang detail, lengkap, dan akurat berdasarkan konteks dokumen
- Jika ada konsep penting, jelaskan dengan contoh konkret
- Akhiri dengan ringkasan singkat jika jawaban panjang`

  const contextText = chunks.join('\n\n')

  return `${systemInstruction}

## Konteks Dokumen:
---
${contextText}
---

## Pertanyaan:
${query}

## Jawaban:`
}
