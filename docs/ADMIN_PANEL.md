# Painel Administrativo - Guia de Uso

## Visao Geral

O painel administrativo permite que proprietarios (usuarios com role `ADMIN`) gerenciem:
- Produtos e precos
- Configuracoes da pizzaria (cores, logo, banner, telefone)
- Visualizacao de pedidos
- Dashboard com estatisticas

## Acesso

### URL
```
/admin
```

### Requisitos
- Usuario autenticado
- Role: `ADMIN`

### Redirecionamento
- Se nao autenticado: redireciona para `/login?redirect=/admin`
- Se nao for admin: redireciona para `/` (home)

## Estrutura do Painel

### 1. Dashboard (`/admin`)
- Estatisticas gerais:
  - Total de produtos
  - Total de pedidos
  - Receita total
  - Numero de clientes
- Pedidos recentes (ultimos 5)

### 2. Produtos (`/admin/products`)
- Lista todos os produtos
- Exibe: nome, categoria, preco, status
- Botao para criar novo produto
- Botao para editar produto

**Funcionalidades:**
- ✅ Listar produtos
- ⏳ Criar produto (página `/admin/products/new` - a implementar)
- ⏳ Editar produto (página `/admin/products/[id]/edit` - a implementar)
- ⏳ Deletar produto (a implementar)

### 3. Pedidos (`/admin/orders`)
- Lista todos os pedidos
- Exibe: numero do pedido, cliente, total, status, pagamento, data
- Botao para ver detalhes do pedido

**Funcionalidades:**
- ✅ Listar pedidos
- ⏳ Ver detalhes do pedido (página `/admin/orders/[id]` - a implementar)
- ⏳ Atualizar status do pedido (a implementar)

### 4. Configuracoes (`/admin/settings`)
- Informacoes basicas:
  - Nome da pizzaria
  - Telefone
- Branding:
  - Cor primaria (com seletor de cor)
  - Cor secundaria (com seletor de cor)
  - URL do logo
  - URL da imagem de capa (banner)
- Configuracoes:
  - Moeda (BRL, USD, EUR)
  - Fuso horario

**Funcionalidades:**
- ✅ Editar todas as configuracoes
- ✅ Salvar alteracoes
- ✅ Validacao de formulario
- ✅ Feedback de sucesso/erro

## Como Criar um Usuario Admin

### Opcao 1: Via Prisma Studio
```bash
pnpm db:studio
```

1. Abrir tabela `User`
2. Criar novo usuario ou editar existente
3. Definir `role` como `ADMIN`
4. Definir `tenantId` do tenant desejado
5. Definir `email` e `password` (hash com bcrypt)

### Opcao 2: Via Script
```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  const tenant = await prisma.tenant.findFirst({
    where: { subdomain: "demo" },
  });

  if (!tenant) {
    console.error("Tenant não encontrado");
    return;
  }

  const hashedPassword = await bcrypt.hash("senha123", 10);

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: "admin@demo.com",
      password: hashedPassword,
      role: "ADMIN",
      name: "Administrador",
    },
  });

  console.log("Admin criado:", admin);
}
```

### Opcao 3: Via API (a implementar)
Criar rota `/api/admin/users/create` para criar usuarios admin

## Seguranca

### Validacao de Role
Todas as rotas admin verificam:
1. Se usuario esta autenticado
2. Se usuario tem role `ADMIN`
3. Se tenantId corresponde ao tenant atual

### Isolamento
- Admin so ve dados do seu proprio tenant
- Nao pode acessar dados de outros tenants
- Todas as queries incluem `WHERE tenantId = ...`

## Funcionalidades Implementadas

### ✅ Completas
- [x] Layout admin com sidebar
- [x] Dashboard com estatisticas
- [x] Listagem de produtos
- [x] Listagem de pedidos
- [x] Configuracoes do tenant (cores, logo, banner, telefone)
- [x] Protecao de rotas por role ADMIN
- [x] Validacao de formularios

### ⏳ Pendentes
- [ ] Criar/editar produtos
- [ ] Deletar produtos
- [ ] Gerenciar categorias
- [ ] Ver detalhes do pedido no admin
- [ ] Atualizar status do pedido
- [ ] Gerenciar usuarios (criar atendentes, etc)
- [ ] Gerenciar zonas de entrega
- [ ] Gerenciar horarios de funcionamento
- [ ] Upload de imagens (logo, banner, produtos)
- [ ] Relatorios e graficos

## Estrutura de Arquivos

```
apps/storefront/src/
├── app/
│   └── admin/
│       ├── layout.tsx          # Layout com sidebar
│       ├── page.tsx            # Dashboard
│       ├── products/
│       │   └── page.tsx         # Lista de produtos
│       ├── orders/
│       │   └── page.tsx         # Lista de pedidos
│       └── settings/
│           └── page.tsx         # Configuracoes
├── components/
│   └── admin/
│       └── tenant-settings-form.tsx  # Formulario de config
└── lib/
    └── admin-auth.ts           # Helpers de autenticacao admin
```

## API Routes

### `/api/admin/tenant/update` (PATCH)
Atualiza configuracoes do tenant.

**Body:**
```json
{
  "name": "Pizzaria Demo",
  "primaryColor": "#dc2626",
  "secondaryColor": "#ea580c",
  "logoUrl": "https://...",
  "coverUrl": "https://...",
  "phone": "(11) 99999-9999",
  "currency": "BRL",
  "timezone": "America/Sao_Paulo"
}
```

**Requisitos:**
- Autenticado
- Role: ADMIN

## Prximos Passos

1. **Implementar CRUD completo de produtos**
   - Criar pagina `/admin/products/new`
   - Criar pagina `/admin/products/[id]/edit`
   - Adicionar funcionalidade de deletar

2. **Implementar gerenciamento de pedidos**
   - Criar pagina `/admin/orders/[id]`
   - Adicionar atualizacao de status
   - Adicionar filtros e busca

3. **Adicionar upload de imagens**
   - Integrar com servico de storage (S3, Cloudinary, etc)
   - Upload de logo, banner e imagens de produtos

4. **Melhorar dashboard**
   - Graficos de vendas
   - Produtos mais vendidos
   - Relatorios

5. **Gerenciamento de usuarios**
   - Criar atendentes
   - Gerenciar permissoes
   - Listar usuarios

## Notas Importantes

- O campo `phone` no tenant ainda nao existe no schema. Se necessario, adicionar via migration.
- As imagens (logo, banner) devem ser hospedadas externamente (CDN, S3, etc)
- Todas as alteracoes sao aplicadas imediatamente (sem cache)
- O painel respeita o multi-tenant: cada admin so gerencia seu proprio tenant

