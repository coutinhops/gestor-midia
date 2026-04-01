import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { accountRepo } from '@/lib/db'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const accounts = accountRepo.list()

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} accounts={accounts} />
      <main className="flex-1 ml-60 min-h-screen" style={{ background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}
