# Segurança e Sistema de Roles

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sistema de Roles](#sistema-de-roles)
3. [Como Funciona a Segurança](#como-funciona-a-segurança)
4. [Proteção Contra Acesso Não Autorizado](#proteção-contra-acesso-não-autorizado)
5. [Como Criar um Administrador](#como-criar-um-administrador)
6. [Perguntas Frequentes](#perguntas-frequentes)

---

## 🎯 Visão Geral

O sistema utiliza um modelo de **roles (papéis)** para controlar o acesso e as permissões dos usuários. Cada usuário possui um `role` que determina quais funcionalidades ele pode acessar.

**Importante:** O sistema é **seguro por padrão** - apenas usuários com o role `ADMIN` ou `ATTENDANT` podem acessar o painel administrativo.

---

## 🔐 Sistema de Roles

### Roles Disponíveis

O sistema possui 4 tipos de roles definidos no enum `UserRole`:

```typescript
enum UserRole {
  ADMIN      // Administrador - Acesso total ao painel
  ATTENDANT  // Atendente - Acesso ao painel para gerenciar pedidos
  DELIVERY   // Entregador - Acesso limitado (futuro)
  CUSTOMER   // Cliente - Acesso apenas ao site público
}
```

### Estrutura no Banco de Dados

```prisma
model User {
  id          String   @id @default(cuid())
  tenantId    String
  email       String
  name        String?
  phone       String?
  role        UserRole @default(CUSTOMER)  // ← Campo que define permissões
  password    String?
  // ...
}
```

---

## 🛡️ Como Funciona a Segurança

### 1. Registro de Usuários

**Todos os usuários registrados são criados como `CUSTOMER` por padrão.**

```typescript
// apps/storefront/src/app/api/auth/register/route.ts
const user = await prisma.user.create({
  data: {
    tenantId,
    name: validatedData.name,
    email: validatedData.email,
    phone: validatedData.phone,
    password: hashedPassword,
    role: "CUSTOMER",  // ← SEMPRE CUSTOMER no registro!
  },
});
```

**⚠️ IMPORTANTE:** 
- O campo `role` é **independente** do nome ou email do usuário
- Criar uma conta com nome "admin" ou email "admin@exemplo.com" **NÃO** concede acesso administrativo
- Apenas o campo `role` no banco de dados determina as permissões

### 2. Verificação de Acesso

O sistema verifica o `role` do usuário em todas as rotas protegidas:

```typescript
// apps/storefront/src/lib/admin-auth.ts
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?redirect=/admin");
  }

  const userRole = (session.user as any)?.role;

  // Verifica se o role é ADMIN
  if (userRole !== "ADMIN") {
    redirect("/");  // Redireciona para home se não for admin
  }

  return { user: session.user };
}
```

### 3. Redirecionamento Após Login

O sistema redireciona automaticamente baseado no `role`:

```typescript
// apps/storefront/src/app/login/page.tsx
const userRole = session?.user?.role;

if (userRole === "ADMIN" || userRole === "ATTENDANT") {
  router.push("/admin");  // → Painel administrativo
} else {
  router.push("/account");  // → Área do cliente
}
```

---

## 🔒 Proteção Contra Acesso Não Autorizado

### Cenário: Alguém cria conta com nome "admin"

**Exemplo:**
- Nome: "Admin"
- Email: "admin@exemplo.com"
- Senha: "123456"

**O que acontece no banco de dados:**
```json
{
  "name": "Admin",
  "email": "admin@exemplo.com",
  "role": "CUSTOMER"  // ← SEMPRE CUSTOMER no registro!
}
```

**Resultado:**
- ❌ **NÃO** tem acesso ao `/admin`
- ✅ É redirecionado para `/account` após login
- ❌ **NÃO** pode gerenciar produtos, pedidos, configurações
- ✅ Apenas acesso ao site público (cardápio, carrinho, pedidos próprios)

### Por que isso é seguro?

1. **O campo `role` é independente do nome/email**
   - O sistema verifica apenas `user.role === "ADMIN"`
   - Nome e email não influenciam nas permissões

2. **Registro sempre cria como CUSTOMER**
   - Não há como criar um usuário admin pelo formulário de registro
   - O role deve ser alterado manualmente no banco de dados

3. **Verificação em todas as rotas protegidas**
   - Todas as rotas `/admin/*` verificam o role
   - Se não for ADMIN, o usuário é redirecionado

---

## 👨‍💼 Como Criar um Administrador

### Método 1: Script Automatizado (Recomendado)

```bash
# No diretório raiz do projeto
pnpm db:create-admin
```

O script irá:
1. Solicitar email e senha
2. Criar ou atualizar o usuário com `role: "ADMIN"`
3. Mostrar as credenciais de acesso

### Método 2: SQL Direto no Banco

```sql
-- Atualizar usuário existente para ADMIN
UPDATE "User" 
SET role = 'ADMIN' 
WHERE email = 'admin@exemplo.com';
```

### Método 3: Prisma Studio

1. Execute: `pnpm db:studio`
2. Abra a tabela `User`
3. Encontre o usuário desejado
4. Altere o campo `role` de `CUSTOMER` para `ADMIN`
5. Salve as alterações

### Método 4: Script TypeScript

```typescript
// scripts/create-admin-user.ts
import { prisma } from "@pizzaria/db";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = "admin@exemplo.com";
  const password = "senha-segura-123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.update({
    where: { email },
    data: {
      role: "ADMIN",
      password: hashedPassword,
    },
  });

  console.log("Admin criado:", admin);
}
```

---

## ❓ Perguntas Frequentes

### 1. Se alguém criar uma conta com nome "admin", terá acesso de administrador?

**Não!** O nome não tem relação com as permissões. Apenas o campo `role` no banco de dados determina o acesso. No registro, todos os usuários são criados com `role: "CUSTOMER"`.

### 2. Se alguém criar uma conta com email "admin@exemplo.com", terá acesso?

**Não!** O email também não tem relação com as permissões. O sistema verifica apenas o campo `role`.

### 3. Como o sistema sabe se um usuário é administrador?

O sistema verifica o campo `role` na sessão do usuário:

```typescript
const userRole = session?.user?.role;
if (userRole === "ADMIN") {
  // Acesso permitido
}
```

### 4. Posso ter múltiplos administradores?

**Sim!** Você pode ter quantos usuários com `role: "ADMIN"` precisar. Cada um terá acesso completo ao painel administrativo do seu tenant.

### 5. Como remover acesso de administrador de alguém?

Altere o `role` do usuário no banco de dados:

```sql
UPDATE "User" 
SET role = 'CUSTOMER' 
WHERE email = 'usuario@exemplo.com';
```

### 6. Qual a diferença entre ADMIN e ATTENDANT?

- **ADMIN**: Acesso total (produtos, pedidos, configurações, relatórios)
- **ATTENDANT**: Acesso limitado (gerenciar pedidos, atualizar status)

### 7. O sistema é seguro contra SQL Injection?

**Sim!** O sistema usa Prisma ORM, que protege automaticamente contra SQL Injection através de queries parametrizadas.

### 8. Como proteger rotas de API?

Todas as rotas de API em `/api/admin/*` devem verificar o role:

```typescript
// apps/storefront/src/app/api/admin/*/route.ts
const session = await auth();
const userRole = (session.user as any)?.role;

if (userRole !== "ADMIN") {
  return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
}
```

---

## 📝 Resumo

✅ **Seguro por padrão**: Todos os registros criam usuários como `CUSTOMER`  
✅ **Verificação de role**: Sistema verifica `role` em todas as rotas protegidas  
✅ **Independente de nome/email**: Apenas o campo `role` determina permissões  
✅ **Múltiplos admins**: Suporta múltiplos administradores por tenant  
✅ **Fácil gerenciamento**: Scripts e ferramentas para criar/remover admins  

---

## 🔗 Referências

- [Painel Administrativo](./ADMIN_PANEL.md) - Guia de uso do painel
- [Estrutura Multi-tenant](./ESTRUTURA_MULTI_TENANT.md) - Como funciona o multi-tenant
- [Rotas do Sistema](./ROTAS.md) - Lista de todas as rotas

---

**Última atualização:** Janeiro 2025

