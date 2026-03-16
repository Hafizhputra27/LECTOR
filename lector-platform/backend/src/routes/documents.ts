import { Router, Request, Response } from 'express'
import multer from 'multer'
import { authMiddleware } from '../middleware/auth'
import { supabaseAdmin } from '../services/supabase'
import {
  extractTextFromPDF,
  extractTextFromPPTX,
  chunkText,
} from '../services/documentProcessor'

const router = Router()

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]
const ALLOWED_EXTENSIONS = ['pdf', 'ppt', 'pptx']

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(_req, file, cb) {
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? ''
    if (ALLOWED_MIME_TYPES.includes(file.mimetype) || ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true)
    } else {
      cb(
        new Error(
          `Format tidak didukung. Format yang didukung: ${ALLOWED_EXTENSIONS.join(', ')}`
        )
      )
    }
  },
})

// POST /api/documents/upload
router.post(
  '/upload',
  authMiddleware,
  (req: Request, res: Response, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          error: `Ukuran file melebihi batas maksimum 50MB.`,
        })
        return
      }
      if (err) {
        res.status(400).json({ error: err.message })
        return
      }
      next()
    })
  },
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'Tidak ada file yang diunggah.' })
      return
    }

    const file = req.file
    const userId = req.user!.id

    // Validate extension
    const ext = file.originalname.split('.').pop()?.toLowerCase() ?? ''
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      res.status(400).json({
        error: `Format tidak didukung. Format yang didukung: ${ALLOWED_EXTENSIONS.join(', ')}`,
      })
      return
    }

    // Validate size (belt-and-suspenders, multer already checks)
    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({
        error: `Ukuran file melebihi batas maksimum 50MB.`,
      })
      return
    }

    const documentId = crypto.randomUUID()
    const storagePath = `${userId}/${documentId}/${file.originalname}`

    try {
      // 1. Extract text (non-fatal — if extraction fails, we still upload the file)
      let extractedText = ''
      if (ext === 'pdf') {
        extractedText = await extractTextFromPDF(file.buffer)
      } else {
        extractedText = await extractTextFromPPTX(file.buffer)
      }
      console.log(`Extracted ${extractedText.length} chars from ${file.originalname}`)

      // 2. Upload file to Supabase Storage
      const { error: storageError } = await supabaseAdmin.storage
        .from('documents')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        })

      if (storageError) {
        res.status(500).json({ error: 'Gagal mengunggah file ke storage.' })
        return
      }

      // 3. Insert document metadata with status 'processing'
      const { data: docData, error: docError } = await supabaseAdmin
        .from('documents')
        .insert({
          id: documentId,
          user_id: userId,
          file_name: file.originalname,
          file_type: ext as 'pdf' | 'ppt' | 'pptx',
          file_size: file.size,
          storage_path: storagePath,
          status: 'processing',
        })
        .select()
        .single()

      if (docError) {
        res.status(500).json({ error: 'Gagal menyimpan metadata dokumen.' })
        return
      }

      // 4. Insert text chunks (or a fallback note if extraction failed)
      const chunks = chunkText(extractedText)
      const chunkRows = chunks.length > 0
        ? chunks.map((content, index) => ({ document_id: documentId, content, chunk_index: index }))
        : [{
            document_id: documentId,
            content: `Dokumen: ${file.originalname}. Teks tidak dapat diekstrak secara otomatis. Silakan tanyakan pertanyaan umum atau coba upload ulang dalam format PDF.`,
            chunk_index: 0,
          }]

      const { error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .insert(chunkRows)

      if (chunkError) {
        // Non-fatal: update status to error and return
        await supabaseAdmin
          .from('documents')
          .update({ status: 'error' })
          .eq('id', documentId)

        res.status(500).json({ error: 'Gagal menyimpan konten dokumen.' })
        return
      }

      // 5. Update document status to 'ready'
      const { data: updatedDoc, error: updateError } = await supabaseAdmin
        .from('documents')
        .update({ status: 'ready' })
        .eq('id', documentId)
        .select()
        .single()

      if (updateError) {
        res.status(500).json({ error: 'Gagal memperbarui status dokumen.' })
        return
      }

      res.status(201).json({ document: updatedDoc ?? docData })
    } catch (err) {
      console.error('Upload error:', err)
      // Attempt to mark document as error if it was created
      await supabaseAdmin
        .from('documents')
        .update({ status: 'error' })
        .eq('id', documentId)

      res.status(500).json({ error: 'Terjadi kesalahan saat memproses dokumen.' })
    }
  }
)

// GET /api/documents
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id

  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: 'Gagal mengambil daftar dokumen.' })
    return
  }

  res.json({ documents: data })
})

// POST /api/documents/:id/reprocess
router.post('/:id/reprocess', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id
  const documentId = req.params.id

  // Verify ownership
  const { data: doc, error: fetchError } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !doc) {
    res.status(404).json({ error: 'Dokumen tidak ditemukan.' })
    return
  }

  try {
    // Download file from storage
    console.log('Attempting to download from storage path:', doc.storage_path)
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('documents')
      .download(doc.storage_path)

    if (downloadError || !fileData) {
      console.error('Storage download error:', JSON.stringify(downloadError), 'path:', doc.storage_path)
      // Try to list files in the bucket to debug
      const { data: listData, error: listError } = await supabaseAdmin.storage
        .from('documents')
        .list(doc.storage_path.split('/').slice(0, -1).join('/'))
      console.error('Bucket list result:', JSON.stringify(listData), 'list error:', JSON.stringify(listError))
      res.status(500).json({ error: `Gagal mengunduh file dari storage: ${downloadError?.message ?? 'unknown'}` })
      return
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const ext = doc.file_type as string

    // Extract text
    let extractedText = ''
    if (ext === 'pdf') {
      extractedText = await extractTextFromPDF(buffer)
    } else {
      extractedText = await extractTextFromPPTX(buffer)
    }

    if (!extractedText || extractedText.trim().length === 0) {
      // Still save document as ready with a note chunk so user can at least try chatting
      const noteChunk = `Dokumen: ${doc.file_name}. Teks tidak dapat diekstrak secara otomatis dari file ini. Silakan tanyakan pertanyaan umum atau coba upload ulang dokumen dalam format PDF.`
      await supabaseAdmin.from('document_chunks').delete().eq('document_id', documentId)
      await supabaseAdmin.from('document_chunks').insert([{
        document_id: documentId,
        content: noteChunk,
        chunk_index: 0,
      }])
      await supabaseAdmin.from('documents').update({ status: 'ready' }).eq('id', documentId)
      res.json({ success: true, chunkCount: 0, warning: 'Teks tidak dapat diekstrak. Coba upload ulang dalam format PDF.' })
      return
    }

    // Delete existing chunks
    await supabaseAdmin
      .from('document_chunks')
      .delete()
      .eq('document_id', documentId)

    // Insert new chunks
    const chunks = chunkText(extractedText)
    if (chunks.length > 0) {
      const chunkRows = chunks.map((content, index) => ({
        document_id: documentId,
        content,
        chunk_index: index,
      }))

      const { error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .insert(chunkRows)

      if (chunkError) {
        res.status(500).json({ error: 'Gagal menyimpan konten dokumen.' })
        return
      }
    }

    // Update status to ready
    await supabaseAdmin
      .from('documents')
      .update({ status: 'ready' })
      .eq('id', documentId)

    res.json({ success: true, chunkCount: chunks.length })
  } catch (err) {
    console.error('Reprocess error:', err)
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses ulang dokumen.' })
  }
})

// DELETE /api/documents/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id
  const documentId = req.params.id

  // Verify ownership
  const { data: doc, error: fetchError } = await supabaseAdmin
    .from('documents')
    .select('id, storage_path')
    .eq('id', documentId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !doc) {
    res.status(404).json({ error: 'Dokumen tidak ditemukan.' })
    return
  }

  // Delete from Supabase Storage (non-fatal if file doesn't exist)
  const { error: storageError } = await supabaseAdmin.storage
    .from('documents')
    .remove([doc.storage_path])

  if (storageError && storageError.message !== 'Object not found') {
    console.error('Storage delete error (non-fatal):', storageError.message)
  }

  // Cascade: delete chat_messages → chat_sessions → document_chunks → document
  const { data: sessions } = await supabaseAdmin
    .from('chat_sessions')
    .select('id')
    .eq('document_id', documentId)

  if (sessions && sessions.length > 0) {
    const sessionIds = sessions.map((s: { id: string }) => s.id)
    await supabaseAdmin.from('chat_messages').delete().in('session_id', sessionIds)
    await supabaseAdmin.from('chat_sessions').delete().eq('document_id', documentId)
  }

  await supabaseAdmin.from('document_chunks').delete().eq('document_id', documentId)

  // Delete document record (cascades to document_chunks via FK)
  const { error: deleteError } = await supabaseAdmin
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', userId)

  if (deleteError) {
    res.status(500).json({ error: 'Gagal menghapus dokumen.' })
    return
  }

  res.json({ success: true })
})

export default router
