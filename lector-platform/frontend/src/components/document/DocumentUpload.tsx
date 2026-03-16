import { useRef, useState } from 'react'
import { uploadDocument } from '../../services/api'
import { useDocumentStore } from '../../store/documentStore'

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation']
const ACCEPTED_EXTENSIONS = ['.pdf', '.ppt', '.pptx']
const MAX_SIZE_BYTES = 50 * 1024 * 1024

interface Props {
  onSuccess?: () => void
}

function validateFile(file: File): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  const validType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext)
  if (!validType) return 'Format tidak didukung. Gunakan PDF, PPT, atau PPTX.'
  if (file.size > MAX_SIZE_BYTES) return 'Ukuran file melebihi batas 50MB.'
  return null
}

export default function DocumentUpload({ onSuccess }: Props) {
  const addDocument = useDocumentStore((s) => s.addDocument)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    const validationError = validateFile(file)
    if (validationError) { setError(validationError); return }
    setError(null)
    setIsUploading(true)
    try {
      const doc = await uploadDocument(file)
      addDocument(doc)
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal. Coba lagi.')
    } finally {
      setIsUploading(false)
    }
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); setIsDragging(true) }
  function onDragLeave() { setIsDragging(false) }
  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        style={isDragging
          ? { borderColor: '#7c6af7', background: 'rgba(124,106,247,0.08)' }
          : { borderColor: 'var(--border)', background: 'var(--surface)' }
        }
      >
        <input ref={inputRef} type="file" accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden" onChange={onInputChange} disabled={isUploading} />

        {isUploading ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7c6af7] border-t-transparent" />
            <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>Mengunggah dokumen...</p>
          </>
        ) : (
          <>
            <svg className="h-10 w-10 text-[#7c6af7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div className="text-center">
              <p className="font-medium font-body" style={{ color: 'var(--text)' }}>Seret & lepas file di sini</p>
              <p className="mt-1 text-sm font-body" style={{ color: 'var(--text-muted)' }}>
                atau <span className="text-[#7c6af7] underline">klik untuk memilih file</span>
              </p>
            </div>
            <p className="text-xs font-body" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
              PDF, PPT, PPTX — maks. 50MB
            </p>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  )
}
