import { useEffect, useState } from 'react'
import { useDocumentStore, type Document } from '../../store/documentStore'
import { getDocuments, deleteDocument, reprocessDocument } from '../../services/api'

const STATUS_LABEL: Record<Document['status'], string> = {
  processing: 'Memproses',
  ready: 'Siap',
  error: 'Error',
}

const STATUS_CLASS: Record<Document['status'], string> = {
  processing: 'bg-yellow-500/20 text-yellow-400',
  ready: 'bg-green-500/20 text-green-400',
  error: 'bg-red-500/20 text-red-400',
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentList() {
  const { documents, activeDocument, setDocuments, setActiveDocument, removeDocument } = useDocumentStore()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [reprocessingId, setReprocessingId] = useState<string | null>(null)

  useEffect(() => {
    getDocuments()
      .then((docs) => setDocuments(Array.isArray(docs) ? docs : []))
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Gagal memuat dokumen'))
  }, [setDocuments])

  async function handleDelete(doc: Document) {
    if (!window.confirm(`Hapus "${doc.fileName}"?`)) return
    setDeletingId(doc.id)
    try {
      await deleteDocument(doc.id)
      removeDocument(doc.id)
      if (activeDocument?.id === doc.id) setActiveDocument(null)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal menghapus dokumen')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleReprocess(doc: Document) {
    setReprocessingId(doc.id)
    try {
      const result = await reprocessDocument(doc.id)
      setDocuments(documents.map((d) => d.id === doc.id ? { ...d, status: 'ready' } : d))
      if (result.warning) {
        alert(`⚠️ ${result.warning}`)
      } else {
        alert(`Berhasil diproses ulang. ${result.chunkCount} bagian teks ditemukan.`)
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Gagal memproses ulang dokumen')
    } finally {
      setReprocessingId(null)
    }
  }

  if (loadError) {
    return <p className="text-sm text-red-400">{loadError}</p>
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <svg className="h-12 w-12" style={{ color: 'var(--text-muted)', opacity: 0.4 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-sm font-body" style={{ color: 'var(--text-muted)' }}>Belum ada dokumen yang diunggah.</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {documents.map((doc) => {
        const isActive = activeDocument?.id === doc.id
        const isBusy = deletingId === doc.id || reprocessingId === doc.id

        return (
          <li key={doc.id} className="rounded-lg p-3 transition-colors"
            style={isActive
              ? { background: 'rgba(124,106,247,0.1)', border: '1px solid #7c6af7' }
              : { background: 'var(--surface)', border: '1px solid var(--border)' }
            }>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium font-body" style={{ color: 'var(--text)' }}>
                  {doc.fileName}
                </p>
                <p className="text-xs mt-0.5 font-body" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(doc.uploadedAt)}
                  {doc.fileSize ? ` · ${formatSize(doc.fileSize)}` : ''}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[doc.status]}`}>
                {STATUS_LABEL[doc.status]}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setActiveDocument(isActive ? null : doc)}
                disabled={isBusy}
                className="rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40"
                style={isActive
                  ? { background: 'rgba(124,106,247,0.2)', color: '#9d8ff9' }
                  : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }>
                {isActive ? '✓ Aktif' : 'Pilih'}
              </button>

              {(doc.status === 'error' || doc.status === 'ready') && (
                <button onClick={() => handleReprocess(doc)} disabled={isBusy}
                  className="rounded px-2.5 py-1 text-xs font-medium text-yellow-400 transition-colors disabled:opacity-40 hover:bg-yellow-500/20"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  {reprocessingId === doc.id ? '...' : '↺ Proses'}
                </button>
              )}

              <button onClick={() => handleDelete(doc)} disabled={isBusy}
                className="rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40 hover:bg-red-500/20 hover:text-red-400 flex items-center gap-1"
                style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {deletingId === doc.id ? (
                  <span className="inline-block w-3 h-3 border border-current/50 border-t-current rounded-full animate-spin" />
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
                Hapus
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
