interface QuestionNavProps {
  total: number
  current: number
  answers: Record<number, string>
  onNavigate: (index: number) => void
}

export default function QuestionNav({ total, current, answers, onNavigate }: QuestionNavProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: total }, (_, i) => {
        const isAnswered = answers[i] !== undefined
        const isCurrent = i === current

        return (
          <button
            key={i}
            onClick={() => onNavigate(i)}
            className="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
            style={
              isCurrent
                ? { background: '#7c6af7', color: '#fff', boxShadow: '0 0 0 2px rgba(157,143,249,0.5)' }
                : isAnswered
                ? { background: 'rgba(124,106,247,0.3)', color: '#9d8ff9', border: '1px solid rgba(124,106,247,0.4)' }
                : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
            }
          >
            {i + 1}
          </button>
        )
      })}
    </div>
  )
}
