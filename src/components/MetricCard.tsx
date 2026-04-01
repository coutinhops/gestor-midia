interface MetricCardProps {
  label: string
  value: string
  sub?: string
  highlight?: boolean
}

export default function MetricCard({ label, value, sub, highlight }: MetricCardProps) {
  return (
    <div className="metric-card">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: highlight ? 'var(--teal)' : 'var(--text)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{sub}</p>}
    </div>
  )
}
