interface QuickActionsProps {
  onAction: (prompt: string) => void
  disabled?: boolean
}

const ACTIONS = [
  { label: '💡 Jelaskan konsep utama', prompt: 'Jelaskan konsep utama dari dokumen ini' },
  { label: '📝 Buat ringkasan', prompt: 'Buat ringkasan terstruktur dari dokumen ini' },
  { label: '❓ Contoh soal', prompt: 'Berikan contoh soal dari materi dokumen ini' },
]

export default function QuickActions({ onAction, disabled }: QuickActionsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-body uppercase tracking-wider mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
        Aksi Cepat
      </p>
      {ACTIONS.map((action) => (
        <button
          key={action.prompt}
          onClick={() => onAction(action.prompt)}
          disabled={disabled}
          className="text-left px-3 py-2.5 rounded-xl text-xs font-body transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:text-[#7c6af7] hover:border-[#7c6af7]/25"
          style={{
            background: 'var(--surface-2)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}
