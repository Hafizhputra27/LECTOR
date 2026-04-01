import { supabaseAdmin } from '../services/supabase'
import { generateText } from '../services/openrouter'

export interface QuizQuestion {
  question: string
  options: { A: string; B: string; C: string; D: string }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

export async function generateQuestionsForDocument(
  documentId: string,
  questionCount: number
): Promise<QuizQuestion[]> {
  const { data: chunks, error: chunksError } = await supabaseAdmin
    .from('document_chunks')
    .select('content')
    .eq('document_id', documentId)
    .order('chunk_index', { ascending: true })
    .limit(10)

  if (chunksError || !chunks || chunks.length === 0) {
    throw new Error('Tidak ada konten dokumen yang ditemukan')
  }

  const context = chunks.map((c: { content: string }) => c.content).join('\n\n')

  const prompt = `Kamu adalah asisten pembuat soal untuk mahasiswa Indonesia.
Berdasarkan materi berikut, buat ${questionCount} soal pilihan ganda dalam Bahasa Indonesia.

Materi:
---
${context}
---

Kembalikan HANYA array JSON (tanpa markdown, tanpa penjelasan tambahan) dengan format:
[
  {
    "question": "Pertanyaan di sini?",
    "options": { "A": "Pilihan A", "B": "Pilihan B", "C": "Pilihan C", "D": "Pilihan D" },
    "correctAnswer": "A",
    "explanation": "Penjelasan mengapa jawaban ini benar."
  }
]

Pastikan setiap soal memiliki tepat 4 pilihan (A, B, C, D) dan satu jawaban benar.`

  let text = await generateText(prompt)
  text = text.trim()

  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

  // Strip <think>...</think> tags (some models include reasoning)
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()

  // Find JSON array in response
  const jsonStart = text.indexOf('[')
  const jsonEnd = text.lastIndexOf(']')
  if (jsonStart !== -1 && jsonEnd !== -1) {
    text = text.slice(jsonStart, jsonEnd + 1)
  }

  return JSON.parse(text) as QuizQuestion[]
}
