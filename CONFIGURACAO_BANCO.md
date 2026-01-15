# Configuração do Banco de Dados

## ⚠️ IMPORTANTE

Antes de rodar as migrations, você precisa:

1. **Ter um banco PostgreSQL rodando** (local ou remoto como Neon/Supabase)

2. **Criar o arquivo `.env` na raiz do projeto** com suas credenciais:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/pizzaria_db?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_SUBDOMAIN="demo"
```

### Exemplos de DATABASE_URL:

**PostgreSQL Local:**
```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/pizzaria_db?schema=public"
```

**Neon (PostgreSQL Serverless):**
```env
DATABASE_URL="postgresql://usuario:senha@ep-xxx-xxx.region.neon.tech/pizzaria_db?sslmode=require"
```

**Supabase:**
```env
DATABASE_URL="postgresql://postgres.xxx:senha@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## Passos para Configurar

1. **Criar o banco de dados** (se ainda não existir):
```sql
CREATE DATABASE pizzaria_db;
```

2. **Criar o arquivo `.env`** na raiz do projeto com o `DATABASE_URL` correto

3. **Rodar as migrations:**
```bash
pnpm db:migrate
```

4. **Popular com dados de exemplo:**
```bash
pnpm db:seed
```

5. **Iniciar o servidor:**
```bash
pnpm dev
```

## Verificar Conexão

Você pode testar a conexão usando o Prisma Studio:
```bash
pnpm db:studio
```

Isso abrirá uma interface visual para ver e editar os dados do banco.

