# Sistema Multi-Tenant de Pizzarias

Sistema escalável para gerenciamento de múltiplas pizzarias com arquitetura serverless e multi-tenant.

## Estrutura do Projeto

```
pizzaria_system/
├── apps/
│   ├── storefront/     # Site do cliente (pedidos online)
│   └── admin/          # Painel de gestão
├── packages/
│   ├── db/             # Schema Prisma e cliente DB
│   ├── ui/             # Design system compartilhado
│   ├── core/           # Regras de negócio
│   └── validators/     # Schemas Zod compartilhados
```

## Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind
- **Database**: PostgreSQL (Prisma ORM)
- **Hosting**: Vercel
- **Cache**: Upstash Redis (opcional)
- **Realtime**: Supabase Realtime ou Pusher

## Multi-Tenant

Sistema utiliza **shared database** com `tenant_id` e identificação por **subdomínio**.

## Desenvolvimento

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento
pnpm dev

# Gerar Prisma Client
pnpm db:generate

# Rodar migrations
pnpm db:migrate
```

## Variáveis de Ambiente

Criar `.env` na raiz e em cada app com:

```
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

