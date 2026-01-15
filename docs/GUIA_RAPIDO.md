# 🚀 Guia Rápido - Configurar Banco de Dados

## Opção Mais Fácil: Neon (Recomendado) ⭐

**Não precisa instalar nada!** Use um banco na nuvem gratuito:

### Passo a Passo:

1. **Acesse:** https://neon.tech
2. **Clique em "Sign Up"** (pode usar conta GitHub)
3. **Crie um novo projeto:**
   - Nome: `pizzaria-system`
   - Região: `São Paulo` (ou mais próxima)
4. **Após criar, copie a "Connection String"** que aparece
5. **Cole no arquivo `.env`** na raiz do projeto:

```env
DATABASE_URL="cole_aqui_a_connection_string_do_neon"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_SUBDOMAIN="demo"
```

**Pronto!** Agora você pode rodar:
```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

---

## Opção 2: Instalar PostgreSQL Localmente

Se preferir instalar no seu computador:

### 1. Baixar PostgreSQL

**Link direto:** https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Ou acesse: https://www.postgresql.org/download/windows/

- Escolha a versão mais recente (ex: PostgreSQL 16)
- Baixe o instalador Windows x86-64

### 2. Instalar

1. Execute o arquivo baixado
2. **Next** em todas as telas (deixe padrões)
3. **Senha importante:** Quando pedir senha do usuário `postgres`, defina uma senha e **ANOTE**!
4. Porta: deixe `5432` (padrão)
5. Finalize a instalação

### 3. Criar o Banco

Abra o **pgAdmin** (instalado junto) ou use o terminal:

**Opção A - pgAdmin (Interface Gráfica):**
1. Abra pgAdmin
2. Conecte no servidor (senha que você definiu)
3. Clique com botão direito em "Databases" > "Create" > "Database"
4. Nome: `pizzaria_db`
5. Salve

**Opção B - Terminal:**
```bash
# Abra o PowerShell como Administrador
psql -U postgres

# Digite a senha quando pedir
# Depois execute:
CREATE DATABASE pizzaria_db;
\q
```

### 4. Configurar no Projeto

Edite o arquivo `.env` na raiz:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA_AQUI@localhost:5432/pizzaria_db?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DEFAULT_SUBDOMAIN="demo"
```

Substitua `SUA_SENHA_AQUI` pela senha que você definiu na instalação.

---

## Depois de Configurar (qualquer opção)

Execute os comandos:

```bash
# 1. Criar tabelas
pnpm db:migrate

# 2. Popular com dados de exemplo
pnpm db:seed

# 3. Iniciar servidor
pnpm dev
```

Acesse: http://localhost:3000

---

## Precisa de Ajuda?

- **Neon:** https://neon.tech/docs
- **PostgreSQL:** https://www.postgresql.org/docs/

