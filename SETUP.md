# Setup do Sistema Multi-Tenant de Pizzarias

## Pré-requisitos

- Node.js 18+
- pnpm 8+
- PostgreSQL (local ou gerenciado como Neon/Supabase)

## Instalação

1. **Instalar dependências**
```bash
pnpm install
```

2. **Configurar banco de dados**

Criar arquivo `.env` na raiz:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pizzaria_db?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_SUBDOMAIN="demo"
```

3. **Gerar Prisma Client**
```bash
pnpm db:generate
```

4. **Rodar migrations**
```bash
pnpm db:migrate
```

5. **Popular banco com dados de exemplo (opcional)**
```bash
pnpm db:seed
```

Isso criará:
- Tenant "demo" com subdomain "demo"
- Categorias (Pizzas, Bebidas)
- Produtos de exemplo (Margherita, Calabresa, Coca-Cola)
- Modificadores (Bordas, Adicionais)
- Horários de funcionamento
- Zona de entrega

6. **Rodar aplicação**
```bash
pnpm dev
```

Acesse: `http://localhost:3000` (ou `http://demo.localhost:3000` se configurar hosts)

## Estrutura Multi-Tenant

### Identificação por Subdomínio

O sistema identifica o tenant pelo subdomínio:
- `demo.localhost:3000` → tenant com subdomain "demo"
- `pizzaria1.seudominio.com` → tenant com subdomain "pizzaria1"

### Configuração Local

Para testar subdomínios localmente, adicione ao `/etc/hosts` (Linux/Mac) ou `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 demo.localhost
127.0.0.1 pizzaria1.localhost
```

## Próximos Passos

1. **Criar produtos e categorias** via Prisma Studio ou API
2. **Configurar horários** da pizzaria (StoreHours)
3. **Definir zonas de entrega** (DeliveryZone)
4. **Configurar pagamentos** (integração com gateway)
5. **Adicionar realtime** (Supabase Realtime ou Pusher)

## Scripts Úteis

```bash
# Desenvolvimento
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Prisma Studio
pnpm db:studio

# Seed (popular com dados de exemplo)
pnpm db:seed

# Nova migration
cd packages/db
pnpm db:migrate --name nome_da_migration
```

## Arquitetura

```
pizzaria_system/
├── apps/
│   └── storefront/     # Frontend do cliente
├── packages/
│   ├── db/             # Schema Prisma
│   └── validators/     # Schemas Zod
```

## Variáveis de Ambiente

### Obrigatórias
- `DATABASE_URL` - String de conexão PostgreSQL
- `NEXT_PUBLIC_APP_URL` - URL base da aplicação
- `DEFAULT_SUBDOMAIN` - Subdomínio padrão para desenvolvimento

### Opcionais
- `UPSTASH_REDIS_REST_URL` - Redis para cache/rate limit
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` - Para realtime
- `MERCADO_PAGO_ACCESS_TOKEN` - Integração pagamentos
- `STRIPE_SECRET_KEY` - Integração Stripe

