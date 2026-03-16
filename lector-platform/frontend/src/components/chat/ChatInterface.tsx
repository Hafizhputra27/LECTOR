import { useState, useRef, useEffect, useCallback } from 'react'
import { useDocumentStore } from '../../store/documentStore'
import { streamChat, getSummary, getDocuments, uploadDocument } from '../../services/api'
import { useThemeStore } from '../../store/themeStore'
import MessageBubble from './MessageBubble'
import QuickActions from './QuickActions'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function ChatInterface() {
  const { documents, activeDocument, setDocuments, setActiveDocument, addDocument } = useDocumentStore()
  const { theme } = useThemeStore()
  const isLight = theme === 'light'
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [showDocPanel, setShowDocPanel] = useState(false)
  const [uploading, setUploading] = useState(false)
  const uploadInputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    getDocuments()
      .then((docs) => setDocuments(Array.isArray(docs) ? docs : []))
      .catch(() => {})
  }, [setDocuments])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function switchDocument(docId: string) {
    const doc = documents.find((d) => d.id === docId)
    if (!doc || doc.id === activeDocument?.id) return
    setActiveDocument(doc)
    setMessages([])
    setSessionId(null)
    setError(null)
    setLastMessage(null)
    setShowDocPanel(false)
  }

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const newDoc = await uploadDocument(file)
      addDocument(newDoc)
      setActiveDocument(newDoc)
      setMessages([])
      setSessionId(null)
      setError(null)
      setShowDocPanel(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengunggah dokumen')
    } finally {
      setUploading(false)
    }
  }

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading || !activeDocument) return

      setError(null)
      setLastMessage(trimmed)
      setInput('')

      const userMsg: Message = { id: generateId(), role: 'user', content: trimmed }
      const assistantId = generateId()
      const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', isStreaming: true }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsLoading(true)

      const isSummaryRequest =
        trimmed.toLowerCase() === 'buat ringkasan terstruktur dari dokumen ini' ||
        trimmed.toLowerCase() === 'ringkasan' ||
        trimmed.toLowerCase() === 'buat ringkasan'

      if (isSummaryRequest) {
        try {
          const result = await getSummary(activeDocument.id, sessionId)
          if (result.sessionId && result.sessionId !== sessionId) setSessionId(result.sessionId)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: result.summary, isStreaming: false } : m
            )
          )
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Gagal membuat ringkasan'
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: `⚠️ ${msg}`, isStreaming: false } : m
            )
          )
          setError(msg)
        }
        setIsLoading(false)
        return
      }

      await streamChat(
        activeDocument.id,
        trimmed,
        sessionId,
        (token, sid) => {
          if (sid && sid !== sessionId) setSessionId(sid)
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + token } : m
            )
          )
        },
        () => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
          )
          setIsLoading(false)
        },
        (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: `⚠️ ${err}`, isStreaming: false } : m
            )
          )
          setIsLoading(false)
          setError(err)
        }
      )
    },
    [isLoading, activeDocument, sessionId]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  if (!activeDocument) {
    return (
      <div className="flex items-center justify-center h-full text-center px-6">
        <div className="max-w-sm">
          <div className="text-4xl mb-4">📄</div>
          <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Pilih atau unggah dokumen terlebih dahulu untuk memulai chat.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full gap-4">
      <input
        ref={uploadInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx"
        className="hidden"
        onChange={handleUploadFile}
      />

      {/* Main chat area */}
      <div
        className="flex-1 flex flex-col min-w-0 rounded-xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Message list */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center select-none pointer-events-none">
              <img
                src="/logo_lector.png"
                alt=""
                className="w-24 h-24 object-contain mb-4"
                style={{ opacity: 0.08, filter: 'grayscale(30%)' }}
              />
              <p className="font-body text-sm pointer-events-auto" style={{ color: 'var(--text-muted)' }}>
                Tanyakan apa saja tentang{' '}
                <span className="text-[#7c6af7]/70">{activeDocument.fileName}</span>
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={msg.isStreaming}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 bg-red-900/30 border-t border-red-500/20 flex items-center justify-between gap-3">
            <span className="text-red-400 text-xs font-body">{error}</span>
            <button
              onClick={() => {
                setError(null)
                if (lastMessage) sendMessage(lastMessage)
              }}
              className="text-xs text-red-300 hover:text-white border border-red-500/40 hover:border-red-400 px-3 py-1 rounded font-body transition-colors flex-shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ketik pertanyaan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
              rows={2}
              className="flex-1 text-sm font-body rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-1 focus:ring-[#7c6af7]/50 disabled:opacity-50 transition-colors"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-[#7c6af7] hover:bg-[#7c6af7]/80 text-white rounded-lg font-body text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '↑'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar panel */}
      <div className="hidden lg:flex flex-col w-64 gap-4 flex-shrink-0">
        {/* Active document + switcher */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-xs font-body uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Dokumen Aktif
            </p>
            <button
              onClick={() => setShowDocPanel((v) => !v)}
              className="text-xs text-[#9d8ff9] hover:text-[#7c6af7] font-body transition-colors"
            >
              {showDocPanel ? 'Tutup' : 'Ganti'}
            </button>
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-start gap-2">
              <span className="text-lg">
                {activeDocument.fileType === 'pdf' ? '📄' : '📊'}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-body truncate" style={{ color: 'var(--text)' }}>
                  {activeDocument.fileName}
                </p>
                <p className="text-xs font-body mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {activeDocument.fileType.toUpperCase()}
                  {activeDocument.pageCount ? ` · ${activeDocument.pageCount} hal` : ''}
                </p>
                <span
                  className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-body"
                  style={{
                    background: activeDocument.status === 'ready'
                      ? (isLight ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.2)')
                      : activeDocument.status === 'processing'
                      ? (isLight ? 'rgba(234,179,8,0.15)' : 'rgba(234,179,8,0.2)')
                      : (isLight ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.2)'),
                    color: activeDocument.status === 'ready'
                      ? (isLight ? '#16a34a' : '#4ade80')
                      : activeDocument.status === 'processing'
                      ? (isLight ? '#ca8a04' : '#facc15')
                      : (isLight ? '#dc2626' : '#f87171'),
                  }}
                >
                  {activeDocument.status === 'ready' ? 'Siap' : activeDocument.status === 'processing' ? 'Memproses' : 'Error'}
                </span>
              </div>
            </div>
          </div>

          {showDocPanel && (
            <div
              className="px-3 py-3 flex flex-col gap-2 max-h-64 overflow-y-auto"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {documents.map((doc) => {
                const isActive = doc.id === activeDocument.id
                return (
                  <button
                    key={doc.id}
                    onClick={() => switchDocument(doc.id)}
                    disabled={isActive}
                    className={[
                      'w-full text-left rounded-lg px-3 py-2 text-xs font-body transition-colors',
                      isActive
                        ? 'bg-[#7c6af7]/20 text-[#9d8ff9] cursor-default'
                        : isLight
                        ? 'bg-gray-100 text-gray-600 hover:bg-[#7c6af7]/10 hover:text-gray-900'
                        : 'bg-white/5 text-gray-300 hover:bg-[#7c6af7]/10 hover:text-white',
                    ].join(' ')}
                  >
                    <span className="mr-1.5">{doc.fileType === 'pdf' ? '📄' : '📊'}</span>
                    <span className="truncate">{doc.fileName}</span>
                    {isActive && <span className="ml-1 text-[#9d8ff9]">✓</span>}
                  </button>
                )
              })}

              <button
                onClick={() => uploadInputRef.current?.click()}
                disabled={uploading}
                className="w-full text-left rounded-lg px-3 py-2 text-xs font-body transition-colors disabled:opacity-40 border border-dashed border-[#7c6af7]/30 text-[#9d8ff9] hover:bg-[#7c6af7]/10"
                style={{ background: 'var(--surface-2)' }}
              >
                {uploading ? '⏳ Mengunggah...' : '+ Unggah Dokumen Baru'}
              </button>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <QuickActions onAction={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  )
}
