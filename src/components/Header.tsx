'use client'
import { useState } from 'react'

interface User { name: string; role: string }

interface HeaderProps {
  title: string
  user: User
  period?: string
  onPeriodChange?: (period: string) => void
  showAutoRefresh?: boolean
}

const PERIODS = [
  { label: 'Hoje', value: 'today' },
  { label: 'Ontem', value: 'yesterday' },
  { label: '7 dias', value: 'last_7d' },
  { label: '30 dias', value: 'last_30d' },
  { label: 'Este mês', value: 'this_month' },
  { label: 'Mês passado', value: 'last_month' },
  { label: 'Personalizado', value: 'custom' },
]

export default function Header({ title, user, period = 'last_7d', onPeriodChange, showAutoRefresh = true }: HeaderProps) {
  const [autoRefresh, setAutoRefresh] = useState(false)

  const periodLabel = PERIODS.find(p => p.value === period)?.label || 'Últimos 7 dias'

  return (
    <header className="sticky top-0 z-30" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{title}</h1>
        <div className="flex items-center gap-3">
          {showAutoRefresh && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <span>Últimos {periodLabel.toLowerCase().includes('dia') ? periodLabel.toLowerCase() : '7 dias'}</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="px-2 py-1 rounded text-xs border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Auto-refresh: {autoRefresh ? 'on' : 'off'}
              </button>
            </div>
          )}
          <span className={user.role === 'admin' ? 'badge-admin' : 'badge-viewer'}>
            {user.role}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{user.name}</span>
        </div>
      </div>

      {/* Period Filter */}
      {onPeriodChange && (
        <div className="flex items-center gap-2 px-6 pb-3">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>Período</span>
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={`period-btn ${period === p.value ? 'active' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
