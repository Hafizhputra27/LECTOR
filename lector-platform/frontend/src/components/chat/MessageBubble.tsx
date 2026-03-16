import { useThemeStore } from '../../store/themeStore'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export default function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user'
  const { theme } = useThemeStore()
  const isLight = theme === 'light'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 gap-2.5`}>
      {!isUser && (
        <img
          src="/logo_lector.png"
          alt="LECTOR"
          className="w-8 h-8 rounded-full object-contain flex-shrink-0 mt-0.5"
          style={{ boxShadow: '0 0 0 1px var(--border)' }}
        />
      )}
      <div
        className={`max-w-[78%] px-4 py-3 text-sm font-body leading-relaxed ${
          isUser
            ? 'bg-[#7c6af7]/90 text-white rounded-2xl rounded-tr-md shadow-md shadow-[#7c6af7]/20'
            : `rounded-2xl rounded-tl-md ${isLight ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-white/5 border border-white/8 text-gray-100'}`
        }`}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {content}
        {isStreaming && (
          <span className="inline-block ml-0.5 animate-pulse text-[#9d8ff9]">▌</span>
        )}
      </div>
      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#7c6af7] text-xs font-bold flex-shrink-0 mt-0.5"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          U
        </div>
      )}
    </div>
  )
}
