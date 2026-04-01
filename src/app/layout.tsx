import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gestor de Mídia — Oralunic',
  description: 'Gestor de Mídia da Rede Oralunic',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
