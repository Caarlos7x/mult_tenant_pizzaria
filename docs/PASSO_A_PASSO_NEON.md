# Passo a Passo - Neon Setup

## Na tela atual do Neon:

### 1. Corrigir o nome do projeto
- Mude de "poizzaria-system" para **"pizzaria-system"** (sem o 'i' extra)

### 2. Escolher região mais próxima
- Clique no dropdown "Region"
- Procure por:
  - **"AWS South America (São Paulo)"** (melhor opção se disponível)
  - Ou **"AWS US East 1 (N. Virginia)"** (mais próxima dos EUA)
- Evite "Ohio" se houver opções mais próximas

### 3. Deixar outras configurações como estão:
- ✅ Postgres version: 17 (está bom)
- ✅ Cloud provider: AWS (está bom)
- ✅ Neon Auth: OFF (pode deixar desligado)

### 4. Clicar em "Create Project" ou "Continue"

---

## Depois de criar o projeto:

1. **Você verá uma tela com a "Connection String"**
   - Será algo como: `postgresql://usuario:senha@ep-xxx-xxx.region.neon.tech/neondb?sslmode=require`

2. **Copie essa connection string completa**

3. **Me avise quando tiver copiado** e eu atualizo o arquivo `.env` para você!

---

## Próximos passos (depois de configurar):

```bash
pnpm db:migrate  # Criar tabelas
pnpm db:seed     # Popular dados
pnpm dev         # Iniciar servidor
```

