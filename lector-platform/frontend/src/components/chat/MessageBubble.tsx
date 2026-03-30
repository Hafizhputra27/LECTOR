import { useThemeStore } from '../../store/themeStore'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

// Simple markdown renderer — no external deps needed
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Heading ##
    if (line.startsWith('## ')) {
      nodes.push(<h3 key={i} className="text-base font-heading font-bold mt-3 mb-1" style={{ color: 'var(--text)' }}>{line.slice(3)}</h3>)
      i++; continue
    }
    // Heading ###
    if (line.startsWith('### ')) {
      nodes.push(<h4 key={i} className="text-sm font-heading font-semibold mt-2 mb-0.5 text-[#9d8ff9]">{line.slice(4)}</h4>)
      i++; continue
    }
    // Heading #
    if (line.startsWith('# ')) {
      nodes.push(<h2 key={i} className="text-lg font-heading font-bold mt-3 mb-1" style={{ color: 'var(--text)' }}>{line.slice(2)}</h2>)
      i++; continue
    }
    // Bullet list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-1.5 space-y-0.5 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm">
              <span className="text-[#7c6af7] mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-[#7c6af7]" />
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }
    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = []
      let num = 1
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-1.5 space-y-0.5 pl-4">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm">
              <span className="text-[#7c6af7] font-mono font-bold flex-shrink-0">{num++}.</span>
              <span>{inlineFormat(item)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }
    // Code block
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      nodes.push(
        <pre key={`code-${i}`} className="my-2 p-3 rounded-lg text-xs font-mono overflow-x-auto" style={{ background: 'var(--surface-2)', color: '#9d8ff9', border: '1px solid var(--border)' }}>
          {codeLines.join('\n')}
        </pre>
      )
      continue
    }
    // Horizontal rule
    if (line === '---' || line === '***') {
      nodes.push(<hr key={i} className="my-2 border-[var(--border)]" />)
      i++; continue
    }
    // Empty line → spacing
    if (line.trim() === '') {
      nodes.push(<div key={i} className="h-1.5" />)
      i++; continue
    }
    // Bold line (entire line is **text**)
    if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
      nodes.push(<p key={i} className="text-sm font-semibold my-0.5" style={{ color: 'var(--text)' }}>{line.slice(2, -2)}</p>)
      i++; continue
    }
    // Normal paragraph
    nodes.push(<p key={i} className="text-sm leading-relaxed my-0.5">{inlineFormat(line)}</p>)
    i++
  }
  return nodes
}

// Inline formatting: **bold**, *italic*, `code`
function inlineFormat(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[2]) parts.push(<strong key={key++} className="font-semibold" style={{ color: 'var(--text)' }}>{match[2]}</strong>)
    else if (match[3]) parts.push(<em key={key++} className="italic">{match[3]}</em>)
    else if (match[4]) parts.push(<code key={key++} className="px-1 py-0.5 rounded text-xs font-mono text-[#9d8ff9]" style={{ background: 'var(--surface-2)' }}>{match[4]}</code>)
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 ? parts[0] : <>{parts}</>
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
        className={`max-w-[78%] px-4 py-3 text-sm font-body ${
          isUser
            ? 'bg-[#7c6af7]/90 text-white rounded-2xl rounded-tr-md shadow-md shadow-[#7c6af7]/20'
            : `rounded-2xl rounded-tl-md ${isLight ? 'bg-gray-100 text-gray-800 border border-gray-200' : 'bg-white/5 border border-white/8 text-gray-100'}`
        }`}
        style={{ wordBreak: 'break-word' }}
      >
        {isUser ? (
          <span style={{ whiteSpace: 'pre-wrap' }}>{content}</span>
        ) : (
          <div className="space-y-0.5">
            {renderMarkdown(content)}
          </div>
        )}
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
