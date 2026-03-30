'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

interface Account {
  id: string
  slug: string
  name: string
  color: string
}

interface User {
  name: string
  email: string
  role: string
}

interface SidebarProps {
  user: User
  accounts: Account[]
}

const NAV_ITEMS = [
  { label: 'Visão Geral', href: '/dashboard' },
  { label: 'Análise da Rede', href: '/dashboard/rede' },
  { label: 'Análise Diária', href: '/dashboard/diaria' },
  { label: 'Todas as Contas', href: '/dashboard/contas' },
  { label: 'Por Unidade', href: '/dashboard/auditoria' },
  { label: 'Comparativo Mensal', href: '/dashboard/comparativo' },
  { label: 'Google Ads', href: '/dashboard/google' },
  { label: 'Chat IA', href: '/dashboard/chat' },
  { label: 'Configurações', href: '/dashboard/settings' },
]

export default function Sidebar({ user, accounts }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col z-40" style={{ background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#1a3a4a' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#00c4a0" strokeWidth="2"/>
            <circle cx="12" cy="12" r="4" fill="#00c4a0"/>
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-[10px] font-bold tracking-widest px-1 mb-3 uppercase" style={{ color: 'var(--muted)' }}>Painel</p>

        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Individual Accounts */}
        <div className="mt-6">
          <p className="text-[10px] font-bold tracking-widest px-1 mb-3 uppercase" style={{ color: 'var(--muted)' }}>Contas Individuais</p>
          <input
            type="text"
            placeholder="Buscar conta..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field text-xs py-2 mb-3"
          />
          <div className="space-y-0.5">
            {filtered.map(acc => (
              <a
                key={acc.id}
                href={`/dashboard/individual/${acc.slug}`}
                className={`sidebar-link ${pathname === `/dashboard/individual/${acc.slug}` ? 'active' : ''}`}
              >
                <span className="w-2 h-2 rounded-full mr-2 flex-shrink-0" style={{ background: acc.color }} />
                {acc.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-center mt-3 justify-center hover:text-red-400"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
