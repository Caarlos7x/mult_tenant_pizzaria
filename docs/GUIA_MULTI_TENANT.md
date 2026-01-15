# Guia Completo - Sistema Multi-Tenant

## Visao Geral

O sistema utiliza uma arquitetura **Shared Database, Shared Schema** com isolamento de dados via `tenant_id`. Cada cliente (tenant) possui:
- Subdominio proprio (ex: `cliente1.seudominio.com`)
- Dados completamente isolados
- Customizacoes visuais independentes
- Configuracoes proprias

## Como Funciona o Isolamento

### 1. Identificacao do Tenant

O sistema identifica o tenant de duas formas:

#### A. Por Subdominio (Padrao)
```
demo.seudominio.com     → Tenant "demo"
cliente1.seudominio.com → Tenant "cliente1"
cliente2.seudominio.com → Tenant "cliente2"
```

#### B. Por Dominio Proprio (Opcional)
```
pizzaria-cliente1.com.br → Tenant "cliente1"
```

### 2. Fluxo de Resolucao

```
1. Usuario acessa: cliente1.seudominio.com
2. Middleware extrai subdominio: "cliente1"
3. Middleware adiciona header: x-tenant-subdomain
4. getTenant() busca no banco pelo subdominio
5. Retorna dados do tenant (cores, logo, etc)
6. Todas as queries incluem WHERE tenantId = tenant.id
```

### 3. Isolamento de Dados

**TODAS** as tabelas relacionadas a negocio possuem `tenantId`:

```prisma
model Product {
  id       String @id
  tenantId String  // ← ISOLAMENTO
  name     String
  // ...
}

model Order {
  id       String @id
  tenantId String  // ← ISOLAMENTO
  // ...
}

model User {
  id       String @id
  tenantId String  // ← ISOLAMENTO
  email    String
  // ...
  @@unique([tenantId, email]) // Email unico por tenant
}
```

## Estrutura do Projeto

```
pizzaria_system/
├── packages/
│   ├── db/                    # Schema Prisma multi-tenant
│   │   └── prisma/
│   │       └── schema.prisma  # Define Tenant e todas as tabelas
│   └── validators/             # Validacoes Zod
│
└── apps/
    └── storefront/            # Aplicacao Next.js
        ├── src/
        │   ├── app/            # Rotas Next.js
        │   ├── components/     # Componentes React
        │   ├── lib/
        │   │   ├── get-tenant.ts    # Busca tenant atual
        │   │   └── auth.ts          # Autenticacao (filtra por tenant)
        │   └── middleware.ts   # Resolve subdominio
        └── ...
```

## Como Adicionar um Novo Cliente

### Passo 1: Criar Tenant no Banco de Dados

```typescript
// Exemplo: scripts/create-tenant.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTenant() {
  const tenant = await prisma.tenant.create({
    data: {
      subdomain: "cliente1",           // Subdominio unico
      name: "Pizzaria do Cliente 1",   // Nome da pizzaria
      slug: "cliente1",                 // Slug unico
      
      // Branding
      primaryColor: "#dc2626",          // Cor primaria (vermelho)
      secondaryColor: "#ea580c",        // Cor secundaria (laranja)
      logoUrl: "https://...",           // URL do logo
      coverUrl: "https://...",         // URL da imagem de capa
      font: "Inter",                    // Fonte customizada
      
      // Configuracoes
      isActive: true,
      currency: "BRL",
      timezone: "America/Sao_Paulo",
      
      // Opcional: dominio proprio
      domain: "pizzaria-cliente1.com.br",
    },
  });
  
  console.log("Tenant criado:", tenant);
}

createTenant();
```

### Passo 2: Configurar DNS

Para subdominio:
```
cliente1.seudominio.com → CNAME → seu-servidor.com
```

Para dominio proprio:
```
pizzaria-cliente1.com.br → A → IP_DO_SERVIDOR
```

### Passo 3: Popular Dados Iniciais

```typescript
// Criar categorias
await prisma.category.createMany({
  data: [
    {
      tenantId: tenant.id,
      name: "Pizzas",
      sortOrder: 1,
    },
    {
      tenantId: tenant.id,
      name: "Bebidas",
      sortOrder: 2,
    },
  ],
});

// Criar produtos
await prisma.product.create({
  data: {
    tenantId: tenant.id,
    name: "Pizza Margherita",
    categoryId: categoriaPizzas.id,
    basePrice: 35.00,
    type: "PIZZA",
    status: "ACTIVE",
  },
});
```

## Como Customizar por Cliente

### 1. Cores (Primary e Secondary)

As cores sao aplicadas automaticamente via CSS Variables:

```typescript
// No banco de dados
tenant.primaryColor = "#dc2626";    // Vermelho
tenant.secondaryColor = "#ea580c";  // Laranja

// No layout.tsx (automatico)
:root {
  --primary: ${hexToHsl(tenant.primaryColor)};
  --secondary: ${hexToHsl(tenant.secondaryColor)};
}
```

**Onde as cores aparecem:**
- Botoes primarios
- Links e hover states
- Badges e status
- Header e footer (se configurado)
- Banner hero

### 2. Logo

```typescript
tenant.logoUrl = "https://cdn.exemplo.com/logos/cliente1.png";
```

O logo aparece automaticamente no header.

### 3. Imagem de Capa (Banner)

```typescript
tenant.coverUrl = "https://cdn.exemplo.com/covers/cliente1.jpg";
```

Usada no banner hero da pagina principal.

### 4. Fonte Customizada

```typescript
tenant.font = "Roboto, sans-serif";
```

Aplicada automaticamente no HTML.

### 5. Configuracoes Especificas

```typescript
tenant.currency = "BRL";              // Moeda
tenant.timezone = "America/Sao_Paulo"; // Fuso horario
tenant.isActive = true;               // Ativar/desativar
```

## Exemplos de Queries com Isolamento

### ✅ CORRETO - Sempre incluir tenantId

```typescript
// Buscar produtos
const products = await prisma.product.findMany({
  where: {
    tenantId: tenant.id,  // ← SEMPRE incluir
    status: "ACTIVE",
  },
});

// Criar pedido
const order = await prisma.order.create({
  data: {
    tenantId: tenant.id,  // ← SEMPRE incluir
    customerEmail: email,
    // ...
  },
});

// Buscar usuario
const user = await prisma.user.findFirst({
  where: {
    tenantId: tenant.id,  // ← SEMPRE incluir
    email: email,
  },
});
```

### ❌ ERRADO - Sem tenantId

```typescript
// NUNCA fazer isso!
const products = await prisma.product.findMany({
  where: {
    status: "ACTIVE",  // ← FALTA tenantId!
  },
});
```

## Helpers Disponiveis

### getTenant()

Retorna o tenant atual baseado no subdominio:

```typescript
import { getTenant } from "@/lib/get-tenant";

const tenant = await getTenant();
// Retorna: { id, name, primaryColor, logoUrl, ... }
```

### getTenantId()

Retorna apenas o ID do tenant (para queries):

```typescript
import { getTenantId } from "@/lib/get-tenant";

const tenantId = await getTenantId();
// Retorna: "clmxxxxx..."
```

## Estrutura de Dados por Tenant

Cada tenant possui seus proprios:

- ✅ **Produtos** (Product)
- ✅ **Categorias** (Category)
- ✅ **Pedidos** (Order)
- ✅ **Usuarios** (User)
- ✅ **Enderecos** (Address)
- ✅ **Zonas de Entrega** (DeliveryZone)
- ✅ **Horarios de Funcionamento** (StoreHours)
- ✅ **Promocoes** (Promotion)

## Customizacoes Visuais Aplicadas Automaticamente

### 1. Cores no CSS

```css
/* globals.css - Aplicado automaticamente */
:root {
  --primary: [cor do tenant];
  --secondary: [cor do tenant];
}
```

### 2. Logo no Header

```tsx
// components/header.tsx
{tenant.logoUrl ? (
  <img src={tenant.logoUrl} alt={tenant.name} />
) : (
  <div>🍕</div> // Fallback
)}
```

### 3. Banner Hero

```tsx
// app/page.tsx
{tenant.coverUrl && (
  <div style={{ backgroundImage: `url(${tenant.coverUrl})` }}>
    {/* Banner */}
  </div>
)}
```

## Checklist para Novo Cliente

- [ ] Criar registro na tabela `Tenant`
- [ ] Definir subdominio unico
- [ ] Configurar cores (primaryColor, secondaryColor)
- [ ] Fazer upload de logo (logoUrl)
- [ ] Fazer upload de imagem de capa (coverUrl)
- [ ] Configurar DNS (subdominio ou dominio proprio)
- [ ] Criar categorias iniciais
- [ ] Criar produtos iniciais
- [ ] Criar zona de entrega
- [ ] Configurar horarios de funcionamento
- [ ] Testar acesso pelo subdominio
- [ ] Validar isolamento de dados

## Seguranca e Validacao

### 1. Sempre Validar Tenant

```typescript
// Em API routes
export async function POST(request: NextRequest) {
  const tenantId = await getTenantId();
  
  if (!tenantId) {
    return NextResponse.json(
      { error: "Tenant nao encontrado" },
      { status: 400 }
    );
  }
  
  // Continuar com tenantId validado
}
```

### 2. Nunca Confiar em Dados do Cliente

```typescript
// ❌ ERRADO
const tenantId = request.body.tenantId; // NUNCA fazer isso!

// ✅ CORRETO
const tenantId = await getTenantId(); // Sempre do header/middleware
```

### 3. Validar em Todas as Queries

```typescript
// Sempre incluir tenantId nas queries
await prisma.product.findMany({
  where: {
    tenantId: await getTenantId(), // ← Validado
    // ...
  },
});
```

## Exemplo Completo: Criar Novo Cliente

```typescript
// scripts/create-new-client.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createNewClient() {
  // 1. Criar tenant
  const tenant = await prisma.tenant.create({
    data: {
      subdomain: "novocliente",
      name: "Pizzaria Novo Cliente",
      slug: "novo-cliente",
      primaryColor: "#10b981",    // Verde
      secondaryColor: "#059669",  // Verde escuro
      logoUrl: "https://cdn.exemplo.com/novocliente/logo.png",
      coverUrl: "https://cdn.exemplo.com/novocliente/cover.jpg",
      isActive: true,
      currency: "BRL",
      timezone: "America/Sao_Paulo",
    },
  });

  // 2. Criar categorias
  const categoriaPizzas = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: "Pizzas",
      sortOrder: 1,
    },
  });

  // 3. Criar produtos
  await prisma.product.create({
    data: {
      tenantId: tenant.id,
      categoryId: categoriaPizzas.id,
      name: "Pizza Margherita",
      basePrice: 35.00,
      type: "PIZZA",
      status: "ACTIVE",
    },
  });

  // 4. Criar zona de entrega
  await prisma.deliveryZone.create({
    data: {
      tenantId: tenant.id,
      name: "Zona Central",
      deliveryFee: 5.00,
      minOrderValue: 20.00,
    },
  });

  console.log("✅ Cliente criado com sucesso!");
  console.log(`Acesse: https://novocliente.seudominio.com`);
}

createNewClient();
```

## Dicas Importantes

1. **Subdominios devem ser unicos**: Nao pode haver dois tenants com mesmo subdominio
2. **Dados sao completamente isolados**: Um cliente nunca ve dados de outro
3. **Customizacoes sao independentes**: Mudar cores de um cliente nao afeta outros
4. **Sempre usar getTenantId()**: Nunca confiar em dados do request
5. **Testar isolamento**: Sempre validar que dados de um tenant nao aparecem em outro

## Troubleshooting

### Problema: Tenant nao encontrado

**Causa**: Subdominio nao existe no banco ou DNS nao configurado

**Solucao**:
1. Verificar se tenant existe: `SELECT * FROM "Tenant" WHERE subdomain = 'xxx'`
2. Verificar DNS: `nslookup cliente1.seudominio.com`
3. Verificar variavel `DEFAULT_SUBDOMAIN` no `.env` (para localhost)

### Problema: Dados de outro cliente aparecem

**Causa**: Query sem `tenantId` no WHERE

**Solucao**: Sempre incluir `tenantId` em todas as queries

### Problema: Cores nao aplicam

**Causa**: Valores hex invalidos ou layout nao carregando tenant

**Solucao**: 
1. Verificar formato: `#rrggbb` (6 digitos)
2. Verificar se `getTenant()` esta sendo chamado no layout

## Conclusao

O sistema multi-tenant garante:
- ✅ Isolamento completo de dados
- ✅ Customizacao visual por cliente
- ✅ Escalabilidade (um banco, multiplos clientes)
- ✅ Manutencao centralizada
- ✅ Seguranca via tenantId em todas as queries

Para adicionar um novo cliente, basta criar o registro na tabela `Tenant` e popular os dados iniciais!

