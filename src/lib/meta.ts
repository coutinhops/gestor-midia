export const META_API_BASE = 'https://graph.facebook.com/v19.0'

// ─── Lead Action Types ────────────────────────────────────────────────────────
// All action types recognised as leads by the Meta API (same set used in source)
export const LEAD_ACTION_TYPES = new Set([
  'lead',
  'onsite_conversion.lead_grouped',
  'onsite_web_lead',
  'omni_lead',
  'offsite_conversion.fb_pixel_lead',
  'submit_application',
  'contact',
])

export function countLeads(actions: Array<{ action_type: string; value: string }> = []): number {
  return actions.filter(a => LEAD_ACTION_TYPES.has(a.action_type)).reduce((sum, a) => sum + (Number(a.value) || 0), 0)
}

export interface MetricsInput { spend: number; impressions: number; clicks: number; reach: number; frequency: number; leads: number }
export interface Metrics extends MetricsInput { ctr: number; cpc: number; cpm: number; cpl: number; leadRate: number }

export function calcMetrics(raw: MetricsInput): Metrics {
  const { spend, impressions, clicks, reach, frequency, leads } = raw
  return { spend, impressions, clicks, reach, frequency, leads, ctr: impressions > 0 ? Math.round((clicks / impressions) * 100 * 100) / 100 : 0, cpc: clicks > 0 ? Math.round((spend / clicks) * 100) / 100 : 0, cpm: impressions > 0 ? Math.round((spend / impressions) * 1000 * 100) / 100 : 0, cpl: leads > 0 ? Math.round((spend / leads) * 100) / 100 : 0, leadRate: clicks > 0 ? Math.round((leads / clicks) * 100 * 100) / 100 : 0 }
}

export type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'last_30d' | 'this_month' | 'last_month' | 'custom'

export const PEP��D_LABELS: Record<DatePreset | string, string> = {
  today: 'Hoje', yesterday: 'Ontem', last_7d: 'Últimos 7 dias', last_30d: 'Últimos 30 dias', this_month: 'Este mês', last_month: 'Mês passado', custom: 'Personalizado'
}

export function buildDateParams(preset: DatePreset | string, since?: string, until?: string): Record<string, string> {
  if (preset === 'custom' && since && until) return { time_range: JSON.stringify({ since, until }) }
  return { date_preset: preset }
}

export const BENCHMARKS = { cpm: { min: 15, max: 35 }, ctr: { min: 1.2, max: 3 }, cpc: { min: 1.5, max: 4 }, frequency: { min: 1.8, max: 3.5 } }

export type PlanKey = 'slim' | 'smart' | 'platinum'
export interface PlanConfig { cplRef: number; invTotal: number; invMin: number; invMax: number; googleAds: number; topoRef: number; meioRef: number; fundoRef: number }
export const PLANS: Record<PlanKey, PlanConfig> = {
  slim: { cplRef: 70, invTotal: 6000, invMin: 5100, invMax: 7000, googleAds: 1, topoRef: 600, meioRef: 600, fundoRef: 4800 },
  smart: { cplRef: 60, invTotal: 8000, invMin: 6800, invMax: 9500, googleAds: 0, topoRef: 800, meioRef: 800, fundoRef: 6400 },
  platinum: { cplRef: 45, invTotal: 14000, invMin: 11900, invMax: 16000, googleAds: 0, topoRef: 1400, meioRef: 1400, fundoRef: 11200 },
}

export function classifyObjective(objective: string): 'topo' | 'meio' | 'fundo' {
  const obj = objective?.toUpperCase() || ''
  if (['REACH', 'BRAND_AWARENESS', 'OUTCOME_AWARENESS'].includes(obj)) return 'topo'
  if (['OUTCOME_LEADS', 'LEAD_GENERATION', 'CONVERSIONS', 'OUTCOME_SALES', 'MESSAGES'].includes(obj)) return 'fundo'
  return 'meio'
}

export type AdStatus = 'winner' | 'potencial' | 'investigate' | 'kill' | 'other'
export function classifyAd(ctr: number, cpl: number, spend: number, cplTarget: number): AdStatus {
  if (ctr >= 2 && cpl <= cplTarget) return 'winner'
  if (ctr >= 1.5 && cpl <= cplTarget * 1.2) return 'potencial'
  if (ctr >= 1.2) return 'investigate'
  if (spend >= 2) return 'kill'
  return 'other'
}

export const AD_STATUS_LABELS: Record<AdStatus, string> = { winner: 'Winner', potencial: 'Potencial', investigate: 'Investigar', kill: 'Kill', other: 'Em análise' }

export type BenchmarkTone = 'ok' | 'warn' | 'bad'
export function scoreTone(score: number): BenchmarkTone { if (score >= 80) return 'ok'; if (score >= 60) return 'warn'; return 'bad' }
export function benchmarkCheck(value: number, min: number, max: number): BenchmarkTone { if (value >= min * 0.7) return 'ok'; if (value <= max * 1.3) return 'warn'; return 'bad' }

export const AUDIT_WEIGHTS = { activeVolume: 15, objectives: 20, zombieAdsets: 15, cpm: 15, ctr: 15, cpc: 15, cpl: 35, frequency: 15 }

export function calcAuditScore(structuralScore: number, performanceScore: number): number {
  return Math.round(0.4 * structuralScore + 0.6 * performanceScore)
}

export function auditScoreLabel(score: number, type: 'structural' | 'performance' | 'final'): string {
  if (type === 'structural') { if (score >= 80) return 'Saudável'; if (score >= 60) return 'Atenção'; return 'Crítico' }
  if (type === 'performance') { if (score >= 80) return 'Excelente'; if (score >= 60) return 'Dentro da faixa'; return 'Crítico' }
  if (score >= 80) return 'Saudável'; if (score >= 60) return 'Atenção'; return 'Crítico'
}

export const STATE_REGION: Record<string, string> = {
  SP: 'Sudeste', RJ: 'Sudeste', MG: 'Sudeste', ES: 'Sudeste',
  PR: 'Sul', SC: 'Sul', RS: 'Sul',
  GO: 'Centro-Oeste', MT: 'Centro-Oeste', MS: 'Centro-Oeste', DF: 'Centro-Oeste',
  BA: 'Nordeste', SE: 'Nordeste', AL: 'Nordeste', PE: 'Nordeste',
  PB: 'Nordeste', RN: 'Nordeste', CE: 'Nordeste', PI: 'Nordeste', MA: 'Nordeste',
  AM: 'Norte', PA: 'Norte', AP: 'Norte', AC: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
}

export const MACRO_REGIONS = ['Sudeste', 'Sul', 'Centro-Oeste', 'Nordeste', 'Norte']

export type AudienceType = 'advantage' | 'lookalike' | 'custom' | 'interest' | 'broad'
export function classifyAudience(targeting: any): AudienceType {
  if (!targeting) return 'broad'
  if (targeting.advantage_audience) return 'advantage'
  if ((targeting.lookalike_specs || []).length > 0) return 'lookalike'
  if ((targeting.custom_audiences || []).length > 0) return 'custom'
  if (targeting.flexible_spec && (targeting.flexible_spec[0]?.interests || targeting.flexible_spec[0]?.behaviors)) return 'interest'
  return 'broad'
}

export const AUDIENCE_LABELS: Record<AudienceType, string> = { advantage: 'Advantage+', lookalike: 'Lookalike', custom: 'Personalizado', interest: 'Interesses', broad: 'Amplo' }

export async function metaFetch(path: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${META_API_BASE}${path}`)
  url.searchParams.set('access_token', token)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  const res = await fetch(url.toString())
  return res.json()
}

export function parseMetricValue(value: string | number | undefined, defaultVal = 0): number {
  if (value === undefined || value === null || value === '') return defaultVal
  const n = Number(value)
  return isNaN(n) ? defaultVal : n
}

export function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency, minimumFractionDigits: 2 }).format(value)
}

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}
