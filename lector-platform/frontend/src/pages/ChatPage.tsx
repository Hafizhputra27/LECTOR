import { useState } from 'react'
import ChatInterface from '../components/chat/ChatInterface'
import DocumentUpload from '../components/document/DocumentUpload'
import DocumentList from '../components/document/DocumentList'
import { useDocumentStore } from '../store/documentStore'

export default function ChatPage() {
  const { activeDocument } = useDocumentStore()
  const [showUpload, setShowUpload] = useState(false)

  if (!activeDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
        <div className="w-full max-w-xl">
          <h2 className="font-heading text-lg font-semibold mb-4 text-center" style={{ color: 'var(--text)' }}>
            Pilih atau Unggah Dokumen
          </h2>

          {/* Document list */}
          <DocumentList />

          {/* Toggle upload */}
          <div className="mt-4">
            <button
              onClick={() => setShowUpload((v) => !v)}
              className="w-full py-2 text-sm text-[#9d8ff9] hover:text-[#7c6af7] border border-[#7c6af7]/30 hover:border-[#7c6af7]/60 rounded-lg transition-colors font-body"
              style={{ background: 'var(--surface)' }}
            >
              {showUpload ? '✕ Tutup' : '+ Unggah Dokumen Baru'}
            </button>
            {showUpload && (
              <div className="mt-3">
                <DocumentUpload onSuccess={() => setShowUpload(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <ChatInterface />
}
