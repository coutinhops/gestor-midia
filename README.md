# Gestor de Mídia — Oralunic

Clone completo do sistema de gestão de mídia da Oralunic, desenvolvido com Next.js 14 App Router.

## Stack

- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend:** Next.js API Routes (serverless)
- **Banco de Dados:** SQLite via better-sqlite3 (sem configuração externa necessária)
- **Autenticação:** JWT com cookies HttpOnly (jose + bcryptjs)
- **Meta Ads:** Proxy para Meta Marketing API v19.0
- **Google Ads:** Google Ads API v16 via OAuth2
- **Chat IA:** OpenAI GPT-4o-mini

## Instalação

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com seus valores

# 3. Iniciar em desenvolvimento
npm run dev
```

## Variáveis de Ambiente (.env.local)

```
JWT_SECRET=seu_segredo_forte_aqui

# Google Ads (opcional)
GADS_CLIENT_ID=
GADS_CLIENT_SECRET=
GADS_REFRESH_TOKEN=
GADS_DEV_TOKEN=
GADS_MCC_ID=

# OpenAI (opcional, para Chat IA)
OPENAI_API_KEY=

# Admin inicial (criado no primeiro boot)
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=senha_forte_aqui
ADMIN_NAME=Administrador
```

## Estrutura de Rotas

| Rota | Descrição |
|------|-----------|
| `/login` | Login |
| `/register` | Cadastro |
| `/dashboard` | Visão Geral (Performance Consolidada) |
| `/dashboard/rede` | Análise da Rede |
| `/dashboard/diaria` | Análise Diária |
| `/dashboard/contas` | Todas as Contas |
| `/dashboard/auditoria` | Por Unidade |
| `/dashboard/comparativo` | Comparativo Mensal |
| `/dashboard/google` | Google Ads |
| `/dashboard/chat` | Chat IA |
| `/dashboard/settings` | Configurações |
| `/dashboard/individual/[slug]` | Conta Individual |

## API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login com email/senha |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Usuário atual |
| `/api/register` | POST | Cadastrar usuário |
| `/api/user-config` | GET/POST | Configuração do usuário (Meta token) |
| `/api/meta/[...path]` | GET/POST | Proxy para Meta API |
| `/api/gads` | POST | Dados do Google Ads |
| `/api/chat` | POST | Chat IA |

## Banco de Dados

O SQLite é criado automaticamente em `data/gestor.db` na raiz do projeto.

### Tabelas
- `users` — usuários (id, email, name, password_hash, role)
- `user_configs` — configuração por usuário (meta_token, meta_account_ids)
- `accounts` — contas individuais (slug, name, meta_account_id)

## Contas Padrão

O sistema cria automaticamente:
- **Admin:** email e senha definidos em `ADMIN_EMAIL` e `ADMIN_PASSWORD`
- **Contas individuais:** Jardins, Barra, Savassi, Goiânia, Porto Alegre, Salvador

## Deploy (Vercel)

```bash
vercel deploy
```

Configure as variáveis de ambiente no painel da Vercel.  
**Nota:** Para produção, considere migrar SQLite → PostgreSQL (Vercel Postgres ou Neon).
