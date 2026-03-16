import { useState, useCallback } from 'react'
import { streamChat, awardXP } from '../services/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

interface UseChatReturn {
  messages: Message[]
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  sessionId: string | null
  sendMessage: (text: string) => Promise<void>
  error: string | null
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useChat(documentId: string | null): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading || !documentId) return

      setError(null)
      setInput('')

      const userMsg: Message = { id: generateId(), role: 'user', content: trimmed }
      const assistantId = generateId()
      const assistantMsg: Message = { id: assistantId, role: 'assistant', content: '', isStreaming: true }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsLoading(true)

      let succeeded = false

      await streamChat(
        documentId,
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
          succeeded = true
        },
        (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `⚠️ ${err}`, isStreaming: false }
                : m
            )
          )
          setIsLoading(false)
          setError(err)
        }
      )

      if (succeeded) {
        awardXP('chat_session').catch(() => {
          // XP award failure is non-critical, silently ignore
        })
      }
    },
    [isLoading, documentId, sessionId]
  )

  return { messages, input, setInput, isLoading, sessionId, sendMessage, error }
}
