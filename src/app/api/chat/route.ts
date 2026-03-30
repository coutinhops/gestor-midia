import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { configRepo } from '@/lib/db'

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message, context } = await req.json()
  if (!message) return NextResponse.json({ error: 'Mensagem obrigatória' }, { status: 400 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      reply: 'O Chat IA requer uma chave OPENAI_API_KEY configurada no servidor. Por favor, configure essa variável de ambiente.'
    })
  }

  const config = configRepo.get(user.userId)
  
  const systemPrompt = `Você é um assistente especializado em análise de performance de campanhas de marketing digital da clínica Oralunic.

Você tem acesso a dados de:
- Meta Ads (Facebook/Instagram): campanhas, conjuntos de anúncios e anúncios
- Google Ads: campanhas de pesquisa, Performance Max e remarketing

Responda sempre em português brasileiro de forma clara e objetiva.
Analise campanhas, compare contas, identifique oportunidades e gere relatórios de marketing.

Contexto do usuário: ${user.name} (${user.role})
${context ? `Dados de contexto disponíveis: ${JSON.stringify(context)}` : ''}`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || 'Não consegui gerar uma resposta.'
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[chat]', error)
    return NextResponse.json({ error: 'Erro ao processar mensagem' }, { status: 500 })
  }
}
