# Estrutura Multi-Tenant - Resumo Visual

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIO                             │
│  Acessa: cliente1.seudominio.com                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              MIDDLEWARE (Edge Runtime)                  │
│  • Extrai subdominio: "cliente1"                        │
│  • Adiciona header: x-tenant-subdomain                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│          getTenant() (Node.js Runtime)                  │
│  • Busca tenant no banco pelo subdominio               │
│  • Retorna: { id, name, primaryColor, logoUrl, ... }    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              LAYOUT (Root Layout)                       │
│  • Injeta CSS Variables com cores do tenant            │
│  • Aplica logo e font customizados                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              COMPONENTES E PAGINAS                      │
│  • Todas as queries incluem WHERE tenantId = ...       │
│  • Cores aplicadas automaticamente via CSS Variables   │
└─────────────────────────────────────────────────────────┘
```

## Isolamento de Dados

```
┌─────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Tenant                                          │  │
│  │  ├─ id: "tenant-1"                              │  │
│  │  ├─ subdomain: "cliente1"                      │  │
│  │  ├─ primaryColor: "#dc2626"                     │  │
│  │  └─ logoUrl: "https://..."                      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Product                                         │  │
│  │  ├─ id: "prod-1"                                │  │
│  │  ├─ tenantId: "tenant-1"  ← ISOLAMENTO         │  │
│  │  ├─ name: "Pizza Margherita"                    │  │
│  │  └─ basePrice: 35.00                            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Order                                           │  │
│  │  ├─ id: "order-1"                               │  │
│  │  ├─ tenantId: "tenant-1"  ← ISOLAMENTO          │  │
│  │  └─ total: 74.00                                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  User                                             │  │
│  │  ├─ id: "user-1"                                 │  │
│  │  ├─ tenantId: "tenant-1"  ← ISOLAMENTO          │  │
│  │  ├─ email: "cliente@cliente1.com"                │  │
│  │  └─ role: "CUSTOMER"                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Fluxo de Customizacao

```
┌─────────────────────────────────────────────────────────┐
│  1. DADOS NO BANCO (Tenant)                            │
│                                                         │
│  tenant = {                                             │
│    primaryColor: "#dc2626",                            │
│    secondaryColor: "#ea580c",                          │
│    logoUrl: "https://cdn.../logo.png",                 │
│    coverUrl: "https://cdn.../cover.jpg"                 │
│  }                                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  2. LAYOUT.TSX (Converte e Injeta)                     │
│                                                         │
│  const primaryHsl = hexToHsl(tenant.primaryColor);     │
│                                                         │
│  <style>                                                │
│    :root {                                              │
│      --primary: ${primaryHsl};                          │
│      --secondary: ${secondaryHsl};                     │
│    }                                                    │
│  </style>                                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  3. CSS GLOBAL (Aplica Variaveis)                      │
│                                                         │
│  .bg-primary {                                          │
│    background-color: hsl(var(--primary));              │
│  }                                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  4. COMPONENTES (Usam Classes Tailwind)                │
│                                                         │
│  <Button className="bg-primary">                        │
│    Adicionar                                            │
│  </Button>                                              │
│                                                         │
│  <img src={tenant.logoUrl} />                           │
└─────────────────────────────────────────────────────────┘
```

## Exemplo: Dois Clientes

```
┌─────────────────────────────────────────────────────────┐
│  CLIENTE 1: cliente1.seudominio.com                    │
│                                                         │
│  Tenant:                                                │
│    • primaryColor: "#dc2626" (Vermelho)                │
│    • logoUrl: "logo-cliente1.png"                      │
│                                                         │
│  Dados Isolados:                                        │
│    • 15 produtos                                        │
│    • 50 pedidos                                         │
│    • 200 usuarios                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CLIENTE 2: cliente2.seudominio.com                    │
│                                                         │
│  Tenant:                                                │
│    • primaryColor: "#10b981" (Verde)                   │
│    • logoUrl: "logo-cliente2.png"                      │
│                                                         │
│  Dados Isolados:                                        │
│    • 20 produtos                                        │
│    • 100 pedidos                                        │
│    • 150 usuarios                                       │
└─────────────────────────────────────────────────────────┘

✅ Dados completamente isolados
✅ Cores independentes
✅ Logos diferentes
✅ Nenhuma interferencia entre clientes
```

## Como Adicionar Novo Cliente (Passo a Passo)

```
1. EXECUTAR SCRIPT
   └─> pnpm tsx scripts/create-tenant.ts \
       --subdomain novocliente \
       --name "Pizzaria Novo Cliente" \
       --primaryColor "#10b981"

2. SCRIPT CRIA NO BANCO:
   ├─> Tenant (novocliente)
   ├─> Categorias (Pizzas, Bebidas)
   ├─> Produtos exemplo (3 produtos)
   ├─> Zona de entrega
   └─> Horarios de funcionamento

3. CONFIGURAR DNS:
   └─> novocliente.seudominio.com → CNAME → servidor

4. FAZER UPLOAD DE ASSETS:
   ├─> Logo → logoUrl
   └─> Imagem de capa → coverUrl

5. TESTAR:
   └─> Acessar: novocliente.seudominio.com
```

## Estrutura de Arquivos

```
pizzaria_system/
│
├── packages/
│   └── db/
│       └── prisma/
│           └── schema.prisma          ← Define Tenant e isolamento
│
├── apps/
│   └── storefront/
│       ├── src/
│       │   ├── middleware.ts          ← Resolve subdominio
│       │   ├── lib/
│       │   │   └── get-tenant.ts       ← Busca tenant do banco
│       │   ├── app/
│       │   │   └── layout.tsx          ← Injeta cores do tenant
│       │   └── components/
│       │       └── header.tsx          ← Usa logo do tenant
│       │
│       └── ...
│
└── scripts/
    └── create-tenant.ts                ← Script para criar clientes
```

## Seguranca: Sempre Validar Tenant

```
┌─────────────────────────────────────────────────────────┐
│  ✅ CORRETO                                              │
│                                                         │
│  const tenantId = await getTenantId();                │
│                                                         │
│  await prisma.product.findMany({                       │
│    where: {                                             │
│      tenantId,  ← Sempre do header/middleware          │
│      status: "ACTIVE"                                   │
│    }                                                    │
│  });                                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ❌ ERRADO                                               │
│                                                         │
│  const tenantId = request.body.tenantId;  ← NUNCA!     │
│                                                         │
│  await prisma.product.findMany({                       │
│    where: {                                             │
│      status: "ACTIVE"  ← FALTA tenantId!                │
│    }                                                    │
│  });                                                    │
└─────────────────────────────────────────────────────────┘
```

## Vantagens da Arquitetura

✅ **Isolamento Completo**: Cada cliente ve apenas seus dados
✅ **Customizacao Independente**: Cores, logos, fontes por cliente
✅ **Escalabilidade**: Um banco, multiplos clientes
✅ **Manutencao Centralizada**: Uma codebase, todas as melhorias
✅ **Custo Eficiente**: Shared infrastructure
✅ **Seguranca**: tenantId em todas as queries
✅ **Facil de Adicionar Clientes**: Script automatizado

## Resumo

1. **Identificacao**: Subdominio → Tenant
2. **Isolamento**: tenantId em todas as tabelas
3. **Customizacao**: Cores/logo via CSS Variables
4. **Seguranca**: Sempre validar tenant do header
5. **Adicionar Cliente**: Script automatizado + DNS

Para mais detalhes, veja: `GUIA_MULTI_TENANT.md`

