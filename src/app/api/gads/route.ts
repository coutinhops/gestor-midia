import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { getAdsCampaigns } from '@/lib/gads'

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { dateRange, customerId } = body

    if (!process.env.GADS_CLIENT_ID || !process.env.GADS_REFRESH_TOKEN) {
      return NextResponse.json({ error: 'Google Ads não configurado. Defina as variáveis de ambiente GADS_*.' }, { status: 503 })
    }

    const campaigns = await getAdsCampaigns(
      dateRange || { start: getDateString(-7), end: getDateString(0) },
      customerId
    )

    // Transform campaigns to our format
    const formatted = campaigns.map((r: any) => ({
      customerId: r.customer?.id,
      customerName: r.customer?.descriptiveName || '',
      campaignId: r.campaign?.id,
      campaignName: r.campaign?.name || '',
      status: r.campaign?.status || '',
      channelType: r.campaign?.advertisingChannelType || '',
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      costMicros: Number(r.metrics?.costMicros || 0),
      cost: Number(r.metrics?.costMicros || 0) / 1_000_000,
      ctr: Number(r.metrics?.ctr || 0) * 100,
      averageCpc: Number(r.metrics?.averageCpc || 0) / 1_000_000,
      conversions: Number(r.metrics?.conversions || 0),
      conversionsValue: Number(r.metrics?.conversionsValue || 0),
    }))

    return NextResponse.json({ campaigns: formatted })
  } catch (error: any) {
    console.error('[gads]', error)
    return NextResponse.json({ error: error.message || 'Erro ao consultar Google Ads' }, { status: 500 })
  }
}

function getDateString(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}
