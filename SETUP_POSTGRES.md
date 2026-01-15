# Configuração do PostgreSQL

Você tem duas opções para configurar o banco de dados:

## Opção 1: Serviço Gerenciado (RECOMENDADO - Mais Fácil) 🚀

### Neon (PostgreSQL Serverless - Gratuito)

1. **Acesse:** https://neon.tech
2. **Crie uma conta** (pode usar GitHub)
3. **Crie um novo projeto:**
   - Nome: `pizzaria-system`
   - Região: escolha a mais próxima (ex: São Paulo)
4. **Copie a connection string** que aparece após criar o projeto
5. **Cole no arquivo `.env`** substituindo o `DATABASE_URL`

A connection string será algo como:
```
postgresql://usuario:senha@ep-xxx-xxx.region.neon.tech/pizzaria_db?sslmode=require
```

### Supabase (Alternativa)

1. **Acesse:** https://supabase.com
2. **Crie uma conta** e um novo projeto
3. **Vá em Settings > Database**
4. **Copie a connection string** (URI)
5. **Cole no arquivo `.env`**

---

## Opção 2: Instalação Local (Windows)

Se preferir instalar localmente, siga os passos abaixo.

### Passo 1: Baixar PostgreSQL

1. Acesse: https://www.postgresql.org/download/windows/
2. Clique em "Download the installer"
3. Baixe o instalador (ex: postgresql-16.x-windows-x64.exe)

### Passo 2: Instalar

1. Execute o instalador
2. **Componentes:** Deixe tudo marcado (PostgreSQL Server, pgAdmin, Command Line Tools)
3. **Diretório de instalação:** Deixe o padrão
4. **Dados:** Deixe o padrão
5. **Senha do superusuário:** Defina uma senha (ANOTE ELA!)
   - Usuário padrão: `postgres`
   - Senha: (a que você definir)
6. **Porta:** Deixe 5432 (padrão)
7. **Locale:** Deixe o padrão
8. Finalize a instalação

### Passo 3: Configurar no Projeto

Após instalar, atualize o `.env`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/pizzaria_db?schema=public"
```

Substitua `SUA_SENHA` pela senha que você definiu na instalação.

### Passo 4: Criar o Banco

Abra o **pgAdmin** (instalado com PostgreSQL) ou use o terminal:

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar o banco
CREATE DATABASE pizzaria_db;

# Sair
\q
```

Ou use o comando direto:
```bash
createdb -U postgres pizzaria_db
```

---

## Recomendação

Para desenvolvimento, recomendo usar **Neon** (Opção 1) porque:
- ✅ Não precisa instalar nada
- ✅ Gratuito
- ✅ Funciona na nuvem (acesso de qualquer lugar)
- ✅ Backup automático
- ✅ Mais rápido de configurar

Depois que configurar, me avise e continuo com as migrations!

