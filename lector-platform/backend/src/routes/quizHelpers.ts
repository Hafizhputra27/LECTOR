import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '../services/supabase'

export interface QuizQuestion {
  question: string
  options: { A: string; B: string; C: string; D: string }
  correctAnswer: 'A' | 'B' | 'C' | 'D'
  explanation: string
}

/**
 * Fetches up to 10 chunks for a document and asks Gemini to generate
 * `questionCount` multiple-choice questions in Bahasa Indonesia.
 */
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

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  let text = result.response.text().trim()

  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

  return JSON.parse(text) as QuizQuestion[]
}
