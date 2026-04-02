// Google Ads API Client
const GADS_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GADS_API_BASE = 'https://googleads.googleapis.com/v16'
let cachedAccessToken: string | null = null
let tokenExpiresAt = 0
async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60000) return cachedAccessToken
  const body = new URLSearchParams({ client_id: process.env.GADS_CLIENT_ID || '', client_secret: process.env.GADS_CLIENT_SECRET || '', refresh_token: process.env.GADS_REFRESH_TOKEN || '', grant_type: 'refresh_token' })
  const res = await fetch(GADS_TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to get Google Ads access token')
  cachedAccessToken = data.access_token
   tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000
  return cachedAccessToken!
}
export async function queryGoogleAds(gaqlQuery: string, customerId?: string): Promise<any[]> {
  const accessToken = await getAccessToken()
  const devToken = process.env.GADS_DEV_TOKEN || ''
  const mccId = process.env.GADS_MCC_ID || ''
  const cid = (customerId || mccId).replace(/-/g, '')
  const res = await fetch(`${GADS_API_BASE}/customers/${cid}/googleAds:searchStream`, { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'developer-token': devToken, 'login-customer-id': mccId.replace(/-/g, ''), 'Content-Type': 'application/json' }, body: JSON.stringify({ query: gaqlQuery }) })
  if (!res.ok) throw new Error(`Google Ads API error: ${await res.text()}`)
  const data = await res.json()
  const results: any[] = []
  if (Array.isArray(data)) for (const batch of data) if (batch.results) results.push(...batch.results)
  return results
}
export async function getAdsCampaigns(dateRange: { start: string; end: string }, customerId?: string) {
  const query = `SELECT campaign.id, campaign.name, campaign.status, metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr FROM campaign WHERE segments.date BETWEEN '${dateRange.start}' AND '${dateRange.end}' AND campaign.status != 'REMOVED' ORDER BY metrics.cost_micros DESC`
  return queryGoogleAds(query, customerId)
}
