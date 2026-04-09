'use client'
import { useState, useEffect } from 'react'
import ErrorCard from '@/components/ErrorCard'
import MetricCard from '@/components/MetricCard'
import PeriodFilter from '@/components/PeriodFilter'
import { countLeads, countLeadForms, countConversations } from '@/lib/meta'

interface Metrics {
  spend: number
  impressions: number
  clicks: number
  ctr: number
  cpm: number
  cpc: number
  reach: number
  frequency: number
  leads: number
  leadForms: number
  conversations: number
  cpl: number
  cplForms: number
  cplConversations: number
}

interface AccountRank {
  id: string
  name: string
  leads: number
  spend: number
  cpl: number
}

const PERIOD_LABEL: Record<string, string> = {
  today: 'Hoje',
  yesterday: 'Ontem',
  last_7d: 'Últimos 7 dias',
  last_30d: 'Últimos 30 dias',
  this_month: 'Este mês',
  last_month: 'Mês passado',
}

export default function DashboardPage() {
  const [period, setPeriod] = useState('last_7d')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [topAccounts, setTopAccounts] = useState<AccountRank[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [accountsWithData, setAccountsWithData] = useState(0)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setUser)
  }, [])

  useEffect(() => {
    loadData()
  }, [period])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const cfg = await fetch('/api/user-config').then(r => r.json())
      if (!cfg.meta_token) {
        setError('Token Meta não configurado em Configurações.')
        setLoading(false)
        return
      }

      // ── Merge ALL account sources for maximum coverage ─────────────────────
      // Source priority: cfg.accounts (SQLite/env) → meta_account_ids → /me/adaccounts
      const accountMap = new Map<string, string>()
      // 1. Accounts from SQLite (seeded from META_ACCOUNT_NAMES env var)
      ;(cfg.accounts || []).forEach((a: any) => accountMap.set(a.id, a.name || a.id))
      // 2. IDs from META_ACCOUNT_IDS env var (may have accounts not in #1)
      ;(cfg.meta_account_ids || []).forEach((id: string) => {
        if (!accountMap.has(id)) accountMap.set(id, id)
      })
      // 3. Meta API auto-discovery — adds accounts the token can see directly
      try {
        const adData = await fetch('/api/meta/me/adaccounts?fields=id,name&limit=500').then(r => r.json())
        ;(adData?.data || []).forEach((a: any) => {
          if (!accountMap.has(a.id)) accountMap.set(a.id, a.name || a.id)
          else if (accountMap.get(a.id) === a.id) accountMap.set(a.id, a.name || a.id)
        })
      } catch {}

      const cfgAccounts = Array.from(accountMap.entries()).map(([id, name]) => ({ id, name }))
      const accountIds = cfgAccounts.map(a => a.id)

      if (accountIds.length === 0) {
        setError('Nenhuma conta Meta encontrada. Verifique as Configurações.')
        setLoading(false)
        return
      }

      setTotalAccounts(accountIds.length)

      const fields = 'account_name,spend,impressions,clicks,reach,frequency,actions,action_values'
      let totalSpend = 0, totalImpressions = 0, totalClicks = 0, totalReach = 0
      let totalLeadForms = 0, totalConversations = 0
      const accountResults: AccountRank[] = []

      const insightResults = await Promise.all(
        accountIds.map((accountId: string) =>
          fetch(`/api/meta/${accountId}/insights?fields=${fields}&level=account&limit=1&date_preset=${period}`)
            .then(r => r.json())
            .catch(() => null)
        )
      )

      let withData = 0
      for (let i = 0; i < accountIds.length; i++) {
        const data = insightResults[i]
        const accountId = accountIds[i]
        if (data?.data?.[0]) {
          withData++
          const d = data.data[0]
          const spend = parseFloat(d.spend || '0')
          const impressions = parseInt(d.impressions || '0')
          const clicks = parseInt(d.clicks || '0')
          const reach = parseInt(d.reach || '0')
          const forms  = countLeadForms(d.actions || [])
          const convos = countConversations(d.actions || [])
          const leads  = countLeads(d.actions || [])

          totalSpend += spend
          totalImpressions += impressions
          totalClicks += clicks
          totalReach += reach
          totalLeadForms += forms
          totalConversations += convos

          // Use name from cfgAccounts if available (more reliable than account_name field)
          const knownName = cfgAccounts.find((a: { id: string }) => a.id === accountId)?.name
          accountResults.push({
            id: accountId,
            name: knownName || d.account_name || accountId,
            leads,
            spend,
            cpl: leads > 0 ? spend / leads : 0,
          })
        }
      }

      setAccountsWithData(withData)

      const top3 = accountResults.sort((a, b) => b.leads - a.leads).slice(0, 3)
      setTopAccounts(top3)

      const totalLeads = totalLeadForms + totalConversations
      setMetrics({
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0,
        cpm: totalImpressions > 0 ? (totalSpend / totalImpressions * 1000) : 0,
        cpc: totalClicks > 0 ? (totalSpend / totalClicks) : 0,
        reach: totalReach,
        frequency: totalReach > 0 ? (totalImpressions / totalReach) : 0,
        leads: totalLeads,
        leadForms: totalLeadForms,
        conversations: totalConversations,
        cpl: totalLeads > 0 ? (totalSpend / totalLeads) : 0,
        cplForms: totalLeadForms > 0 ? (totalSpend / totalLeadForms) : 0,
        cplConversations: totalConversations > 0 ? (totalSpend / totalConversations) : 0,
      })
    } catch {
      setError('Erro ao carregar dados.')
    }
    setLoading(false)
  }

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)
  const fmtN = (n: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(n)
  const fmtP = (n: number) => `${n.toFixed(2)}%`

  const medals = ['🥇', '🥈', '🥉']
  const periodLabel = PERIOD_LABEL[period] || period

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Visão Geral</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
            Consolidado de todas as unidades · {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && totalAccounts > 0 && (
            <span className="text-xs px-2 py-1 rounded" style={{ background: 'var(--card)', color: accountsWithData === totalAccounts ? 'var(--teal)' : '#f59e0b', border: '1px solid var(--border)' }}>
              {accountsWithData}/{totalAccounts} contas
            </span>
          )}
          {user && (
            <>
              <span className={user.role === 'admin' ? 'badge-admin' : 'badge-viewer'}>{user.role}</span>
              <span className="text-sm" style={{ color: 'var(--text)' }}>{user.name}</span>
            </>
          )}
        </div>
      </div>

      <PeriodFilter value={period} onChange={setPeriod} />

      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Performance Consolidada</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Soma de todas as {totalAccounts > 0 ? totalAccounts : ''} unidades · dados diretos da Meta API · paridade com o Gerenciador de Anúncios.
          </p>
        </div>

        {loading && (
          <div className="error-card">
            <p className="text-sm animate-pulse" style={{ color: 'var(--muted)' }}>Carregando dados de todas as unidades...</p>
          </div>
        )}

        {!loading && error && (
          <ErrorCard title="Erro ao carregar" message={error} />
        )}

        {!loading && metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Investimento" value={fmt(metrics.spend)} sub={`${accountsWithData} unidades`} />
            <MetricCard label="Impressões" value={fmtN(metrics.impressions)} sub={`CPM ${fmt(metrics.cpm)}`} />
            <MetricCard label="Cliques" value={fmtN(metrics.clicks)} sub={`CTR ${fmtP(metrics.ctr)}`} />
            <MetricCard label="Alcance" value={fmtN(metrics.reach)} sub={`Freq. ${metrics.frequency.toFixed(2)}`} />
            <MetricCard label="CPC Médio" value={fmt(metrics.cpc)} />
            <MetricCard label="Cadastros" value={fmtN(metrics.leadForms)} sub="Formulários Lead Ads" />
            <MetricCard label="Conversas" value={fmtN(metrics.conversations)} sub="WhatsApp / Messenger" />
            <MetricCard label="CPL Cadastro" value={metrics.leadForms > 0 ? fmt(metrics.cplForms) : '—'} highlight />
            <MetricCard label="CPL Conversa" value={metrics.conversations > 0 ? fmt(metrics.cplConversations) : '—'} highlight />
          </div>
        )}

        {!loading && topAccounts.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>Top 3 Unidades</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Ranking por leads gerados no período.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topAccounts.map((acc, i) => (
                <div key={acc.id} className="metric-card flex items-start gap-3">
                  <span className="text-2xl leading-none mt-0.5">{medals[i]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>{acc.name}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--teal)' }}>
                      {fmtN(acc.leads)} <span className="text-sm font-normal" style={{ color: 'var(--muted)' }}>leads</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                      CPL {fmt(acc.cpl)} · Inv. {fmt(acc.spend)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
