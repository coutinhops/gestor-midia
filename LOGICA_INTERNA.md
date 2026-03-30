# Lógica Interna — Gestor de Mídia Oralunic
> Mapeamento completo de cruzamentos de dados, bases de cálculo e razões de cada análise.

---

## 1. Arquitetura do Sistema

| Camada | Tecnologia | Função |
|---|---|---|
| Frontend | Next.js 14 App Router + Tailwind | UI e lógica de cliente |
| Auth | JWT (jose) + bcryptjs | Cookie HttpOnly `auth_token` |
| Banco | SQLite via better-sqlite3 | Usuários, configs, contas |
| API Meta | Meta Marketing API v19.0 | Fonte principal de dados |
| API Google | Google Ads API v16 (GAQL) | Campanhas de pesquisa |
| IA | OpenAI GPT-4o-mini | Chat inteligente |
| Charts | Recharts | Visualizações |

---

## 2. Planos e Referências de Investimento

O sistema opera com 3 tiers de plano, cada um com CPL-alvo e alocação de verba definidos:

```
Plano   | CPL-ref | Total/mês | Topo    | Meio    | Fundo   | Google Ads
--------|---------|-----------|---------|---------|---------|----------
Slim    | R$ 70   | R$ 6.000  | R$ 600  | R$ 600  | R$ 4.800| ✓ (usa)
Smart   | R$ 60   | R$ 8.000  | R$ 800  | R$ 800  | R$ 6.400| ✗
Platinum| R$ 45   | R$ 14.000 | R$ 1.400| R$ 1.400| R$11.200| ✗
```

**Razão:** 80% da verba vai ao fundo do funil (conversão/leads), 10% topo, 10% meio.
O Slim inclui Google Ads porque com R$6k apenas Meta pode ser insuficiente.

---

## 3. Benchmarks Globais de Performance

Usados em todas as auditorias e comparações:

| Métrica | Mínimo | Máximo |
|---------|--------|--------|
| CPM     | R$ 15  | R$ 35  |
| CTR     | 1,2%   | 3,0%   |
| CPC     | R$ 1,50| R$ 4,00|
| Frequência | 1,8x | 3,5x  |

A verificação tem **30% de tolerância**:
- `value >= min × 0.7` → ok (verde)
- `value <= max × 1.3` → warn (amarelo)
- caso contrário → bad (vermelho)

---

## 4. Contagem de Leads (Cruzamento Crítico)

**Nunca usar apenas `action_type === 'lead'`**. O sistema soma todos estes tipos:

```
lead
onsite_conversion.lead_grouped
onsite_web_lead
omni_lead
offsite_conversion.fb_pixel_lead
submit_application
contact
```

**Razão:** O Meta fragmenta conversões por canal (Instant Form, Pixel, WhatsApp, etc.).
Somar apenas `lead` subestima o volume real em 20–40% dependendo da configuração.

**Fórmula:**
```
leads = Σ actions[action_type ∈ LEAD_TYPES].value
```

---

## 5. Cálculo de Métricas Derivadas

Todas calculadas a partir dos campos brutos da Meta API:

| Métrica | Fórmula |
|---------|---------|
| CTR | `(clicks / impressions) × 100` |
| CPC | `spend / clicks` |
| CPM | `(spend / impressions) × 1000` |
| CPL | `spend / leads` |
| Lead Rate | `(leads / clicks) × 100` |

---

## 6. Classificação de Objetivos de Campanha (por Funil)

```
TOPO  → REACH, BRAND_AWARENESS, OUTCOME_AWARENESS
MEIO  → OUTCOME_ENGAGEMENT (e outros)
FUNDO → OUTCOME_LEADS, LEAD_GENERATION, CONVERSIONS,
        OUTCOME_SALES, MESSAGES
```

**Razão:** A auditoria verifica se existe campanha de fundo (necessária para gerar leads)
e se há complemento de topo (importante para saúde de longo prazo do funil).

---

## 7. Classificação de Anúncios

Cada anúncio é classificado com base em CTR e CPL vs a meta do plano:

```
CTR ≥ 2% E CPL ≤ meta          → Winner    (escalar com segurança)
CTR ≥ 1,5% E CPL ≤ meta × 1,2  → Potencial (otimizar pós-clique)
CTR ≥ 1,2%                      → Investigar (revisar página/formulário)
spend ≥ R$ 2 (CTR baixo)        → Kill       (candidato à pausa)
caso contrário                   → Em análise
```

**Razão:** CTR baixo com gasto significa criativo ruim (kill). CTR bom com CPL alto indica
problema pós-clique (página de destino, formulário). Ambos são questões diferentes.

---

## 8. Score de Auditoria

Score composto em escala 0–100: **40% estrutural + 60% performance**

### Itens Estruturais (peso total = 40%)

| Item | Peso | Lógica |
|------|------|--------|
| Volume ativo | 15 | Máx 8 campanhas; adsets e ads > 0 |
| Objetivos | 20 | Tem fundo? Tem topo? |
| Conjuntos zumbi | 15 | Conjuntos com gasto e zero leads |

### Itens de Performance (peso total = 60%)

| Item | Peso | Lógica |
|------|------|--------|
| CPM | 15 | Benchmark check |
| CTR | 15 | Benchmark check |
| CPC | 15 | Benchmark check |
| CPL vs meta | **35** | Item mais pesado — define rentabilidade |
| Frequência | 15 | Benchmark check |

**Fórmula final:**
```
score = round(0.4 × structScore + 0.6 × perfScore)
```

### Labels por score:
```
Estrutural:  ≥80 → Saudável | ≥60 → Atenção | <60 → Crítico
Performance: ≥80 → Excelente | ≥60 → Dentro da faixa | <60 → Crítico
Final:       ≥80 → Saudável | ≥60 → Atenção | <60 → Crítico
```

---

## 9. Recomendações Automáticas (Fix List)

Geradas automaticamente com base nos dados:

| Trigger | Recomendação |
|---------|--------------|
| CPM ruim | "Ampliar segmentação para reduzir CPM" |
| CTR ruim | "Testar novos hooks/criativos para melhorar CTR" |
| Conjuntos zumbi | "Pausar N conjuntos sem retorno" |
| Frequência alta | "Renovar criativos — frequência muito alta" |
| Verba mal distribuída | "Redistribuir entre funis conforme plano" |
| Naming fora de padrão | "Renomear campanhas (padrão: FUNIL_CANAL_REDE_OBJETIVO)" |

---

## 10. Tipos de Público (Segmentação)

Classificação automática com base no objeto `targeting` da API:

| Tipo | Identificador |
|------|--------------|
| Advantage+ | `targeting.advantage_audience` existe |
| Lookalike | `targeting.lookalike_specs.length > 0` |
| Personalizado | `targeting.custom_audiences.length > 0` |
| Interesses | `targeting.flexible_spec[0].interests` ou `.behaviors` |
| Amplo | sem nenhum dos acima |

---

## 11. Mapeamento Regional (Estado → Macro-Região)

```
Sudeste:     SP, RJ, MG, ES
Sul:         PR, SC, RS
Centro-Oeste: GO, MT, MS, DF
Nordeste:    BA, SE, AL, PE, PB, RN, CE, PI, MA
Norte:       AM, PA, AP, AC, RO, RR, TO
```

**Razão:** Permite agregar performance por region no painel Rede,
identificando quais mercados têm melhor CPL e CTR.

---

## 12. Mapeamento de Períodos

| Preset | Label (PT) | Params API |
|--------|-----------|------------|
| today | Hoje | `date_preset=today` |
| yesterday | Ontem | `date_preset=yesterday` |
| last_7d | Últimos 7 dias | `date_preset=last_7d` |
| last_30d | Últimos 30 dias | `date_preset=last_30d` |
| this_month | Este mês | `date_preset=this_month` |
| last_month | Mês passado | `date_preset=last_month` |
| custom | Personalizado | `time_range={"since":"YYYY-MM-DD","until":"YYYY-MM-DD"}` |

---

## 13. Alertas Mês a Mês (Comparativo)

O sistema compara o mês atual com o anterior e dispara alertas:

| Condição | Alerta |
|----------|--------|
| CPL subiu > 18% | 🔴 "CPL subiu X% no mês atual" |
| Leads caíram < 80% do mês anterior | ⚠️ "Leads caíram X% na comparação mensal" |

**Razão:** 18% de tolerância no CPL reflete variação sazonal normal.
Abaixo de 80% de leads sugere problema operacional.

---

## 14. Funil de Conversão (Visualização Comparativo)

```
TOPO  → Alcance + Impressões + CPM
          (campanhas com objetivo REACH/AWARENESS)

MEIO  → Cliques + CTR + CPC
          (campanhas de engajamento e consideração)

FUNDO → Leads + CPL
          (campanhas de geração de leads e conversão)
          CPL verde se ≤ meta definida pelo usuário
```

---

## 15. Série Diária (Análise Diária)

- **Parâmetro chave:** `time_increment=1` — gera uma linha por dia
- **Limite:** até 90 dias de histórico
- **Métricas disponíveis:** Investimento, Impressões, Cliques, CTR, **Leads**, CPC, CPM, Frequência
- **Leads**: calculados via `countLeads(actions)` por dia
- **Resolução**: dados agregados por conta (level=account)

---

## 16. Página Individual por Conta

**3 abas com drill-down completo:**

### Aba Campanhas
Campos: Campanha, Status, Objetivo (topo/meio/fundo), Investimento, Impressões, Cliques, CTR, Alcance, Leads, CPL

### Aba Conjuntos de Anúncios
Campos: Conjunto, Campanha, Status, Investimento, Impressões, Cliques, CTR, Leads, CPL

### Aba Anúncios
Campos: Anúncio, Status, Investimento, Impressões, Cliques, CTR, Leads, CPL

**Status mapping:**
```
ACTIVE   → "Ativa"   (verde)
PAUSED   → "Pausada" (amarelo)
DELETED  → "Deletada" (vermelho)
ARCHIVED → "Arquivada" (cinza)
```

**Nota:** Usa `effective_status` (não `status`) — reflete o estado real considerando
campanhas/adsets pai que podem estar pausados.

---

## 17. Página de Rede

**Lógica de aggregação:**
- Busca todos os Meta account IDs do usuário em paralelo
- Ordena por investimento (maior → menor)
- Exibe top 8 contas
- Calcula "share" = investimento_conta / investimento_total_rede × 100
- Colunas com código de cor por benchmark (CTR, CPL, CPC, frequência)

---

## 18. Google Ads

**Fonte:** Google Ads API v16 via OAuth2 (não Meta API)
**Autenticação:** `GADS_CLIENT_ID`, `GADS_CLIENT_SECRET`, `GADS_REFRESH_TOKEN`, `GADS_DEV_TOKEN`, `GADS_MCC_ID`
**Query:** GAQL com `searchStream`
**Transformação:** micros → BRL (divide por 1.000.000)

**Métricas exibidas:**
- Investimento, Impressões (CTR), Cliques (CPC médio)
- Conversões, Valor de conversão, Share por conta/campanha

**Observações da operação:** São textos **estáticos** hardcoded no componente — não geradas por IA:
1. "Pesquisa continua sendo o canal mais eficiente em intenção alta"
2. "CPL ajuda a escala, mas precisa de rotina rígida exclusiva"
3. "Revisão de ativos marcados como warning"

---

## 19. Chat IA

- **Modelo:** GPT-4o-mini
- **System prompt:** Contexto sobre campanhas Oralunic
- **Histórico:** mantido no estado do componente (não persiste)
- **Inputs:** usuário digita; IA responde com análise contextual

---

## 20. Fluxo de Autenticação

```
1. POST /api/auth/login → bcrypt compare → JWT sign → Set-Cookie: auth_token (HttpOnly)
2. Middleware verifica JWT em todas as rotas /dashboard/*
3. GET /api/auth/me → decode JWT → retorna {userId, email, name, role, exp}
4. Roles: "admin" (acesso total) | "viewer" (leitura)
5. POST /api/auth/logout → limpa cookie
```

---

## 21. Banco de Dados SQLite

**Tabelas:**
```sql
users        (id, email, password_hash, name, role, created_at)
user_configs (user_id, meta_token, meta_account_ids)  -- JSON
accounts     (id, slug, name, meta_account_id, plan, state, region)
```

**Contas pré-seeded:**
```
ou-jardins     → Oralunic Jardins     (SP / Sudeste)
ou-barra       → Oralunic Barra       (RJ / Sudeste)
ou-savassi     → Oralunic Savassi     (MG / Sudeste)
ou-goiania     → Oralunic Goiânia     (GO / Centro-Oeste)
ou-porto-alegre→ Oralunic Porto Alegre (RS / Sul)
ou-salvador    → Oralunic Salvador    (BA / Nordeste)
```

---

## 22. Proxy da Meta API

`/api/meta/[...path]` — encaminha qualquer chamada para `https://graph.facebook.com/v19.0/`
injetando o `access_token` do usuário. Preserva todos os query params.

**Campos padrão para insights:**
```
spend, impressions, clicks, reach, frequency,
actions, cost_per_action_type,
[+ campos adicionais por nível]
```

**Níveis disponíveis:** `account` | `campaign` | `adset` | `ad`

---

## 23. Paginação da Meta API

A função de fetch interno percorre todas as páginas cursor-based:
```
while (true) {
  fetch page
  accumulate data[]
  if (!paging.cursors.after) break
  fetch next page with after cursor
}
```

Limite de 200 por requisição para campaigns/adsets, 500 para ads.
