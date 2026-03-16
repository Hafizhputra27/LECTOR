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
  const systemInstruction =
    'Kamu adalah asisten belajar AI untuk mahasiswa Indonesia. Jawab pertanyaan berdasarkan konteks dokumen yang diberikan dalam Bahasa Indonesia.'

  const contextText = chunks.join('\n\n')

  return `${systemInstruction}

Konteks dari dokumen:
---
${contextText}
---

Pertanyaan: ${query}

Jawab berdasarkan konteks di atas dalam Bahasa Indonesia:`
}
