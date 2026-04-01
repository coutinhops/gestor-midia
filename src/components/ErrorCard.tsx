interface ErrorCardProps {
  title: string
  message: string
}

export default function ErrorCard({ title, message }: ErrorCardProps) {
  return (
    <div className="error-card">
      <p className="text-lg font-semibold mb-2" style={{ color: 'var(--teal)' }}>{title}</p>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>{message}</p>
    </div>
  )
}
