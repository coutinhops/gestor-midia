'use client'

const PERIODS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: '7 dias', value: 'last_7d' },
  { label: '30 dias', value: 'last_30d' },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Mês passado', value: 'last_month' },
  { label: 'Personalizado', value: 'custom' },
]

interface PeriodFilterProps {
  value: string
  onChange: (v: string) => void
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div className="flex items-center gap-2 px-6 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--muted)' }}>Período</span>
      <div className="flex gap-1 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={`period-btn ${value === p.value ? 'active' : ''}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
