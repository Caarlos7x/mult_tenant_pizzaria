# Rotas do Projeto - Sistema Multi-tenant Pizzaria

## Rotas Publicas (Frontend)

### Pagina Principal
- **`/`** (home) - `apps/storefront/src/app/page.tsx`
  - Banner hero com imagem da pizzaria
  - Produtos em destaque
  - Header e Footer

### Menu e Produtos
- **`/menu`** - `apps/storefront/src/app/menu/page.tsx`
  - Cardapio completo por categorias
  - Produtos com variantes e modificadores
  - Header e Footer

### Carrinho e Checkout
- **`/cart`** - `apps/storefront/src/app/cart/page.tsx`
  - Visualizacao do carrinho
  - Edicao de itens
  - Botao para checkout

- **`/checkout`** - `apps/storefront/src/app/checkout/page.tsx`
  - Formulario de checkout
  - Endereco de entrega
  - Metodo de pagamento
  - Finalizacao do pedido

### Autenticacao
- **`/login`** - `apps/storefront/src/app/login/page.tsx`
  - Login com email/telefone e senha
  - Redireciona para /account apos login

- **`/register`** - `apps/storefront/src/app/register/page.tsx`
  - Cadastro de novo usuario
  - Formulario com validacao
  - Redireciona para login apos registro

## Rotas Protegidas (Requerem Autenticacao)

### Conta do Usuario
- **`/account`** - `apps/storefront/src/app/account/page.tsx`
  - Dados do usuario
  - Historico de pedidos recentes
  - Gerenciamento de enderecos
  - Botao de logout

### Pedidos
- **`/orders`** - `apps/storefront/src/app/orders/page.tsx`
  - Lista de todos os pedidos do usuario
  - Status de cada pedido
  - Link para detalhes

- **`/orders/[id]`** - `apps/storefront/src/app/orders/[id]/page.tsx`
  - Detalhes completos do pedido
  - Itens do pedido
  - Endereco de entrega
  - Status do pedido (timeline)
  - Resumo financeiro
  - Informacoes de pagamento

## Rotas API

### Autenticacao
- **`/api/auth/[...nextauth]`** - `apps/storefront/src/app/api/auth/[...nextauth]/route.ts`
  - GET/POST - Handlers do NextAuth
  - Gerenciamento de sessoes

- **`/api/auth/register`** - `apps/storefront/src/app/api/auth/register/route.ts`
  - POST - Registro de novo usuario
  - Hash de senha com bcrypt
  - Validacao com Zod

### Carrinho
- **`/api/cart/add`** - `apps/storefront/src/app/api/cart/add/route.ts`
  - POST - Adiciona item ao carrinho
  - Validacao de tenant

### Pedidos
- **`/api/orders/create`** - `apps/storefront/src/app/api/orders/create/route.ts`
  - POST - Cria novo pedido
  - Processa itens do carrinho
  - Salva endereco e metodo de pagamento
  - Vincula ao usuario logado

### Enderecos
- **`/api/addresses/create`** - `apps/storefront/src/app/api/addresses/create/route.ts`
  - POST - Cria novo endereco
  - Requer autenticacao
  - Vincula ao usuario logado

### CEP (Busca de Endereco)
- **`/api/cep/[cep]`** - `apps/storefront/src/app/api/cep/[cep]/route.ts`
  - GET - Busca endereco por CEP
  - Integracao com ViaCEP
  - Retorna dados formatados

## Resumo de Rotas

### Total de Rotas Frontend: 9
1. `/` - Home
2. `/menu` - Cardapio
3. `/cart` - Carrinho
4. `/checkout` - Checkout
5. `/login` - Login
6. `/register` - Registro
7. `/account` - Minha Conta (protegida)
8. `/orders` - Meus Pedidos (protegida)
9. `/orders/[id]` - Detalhes do Pedido (protegida)

### Total de Rotas API: 6
1. `/api/auth/[...nextauth]` - NextAuth handlers
2. `/api/auth/register` - Registro
3. `/api/cart/add` - Adicionar ao carrinho
4. `/api/orders/create` - Criar pedido
5. `/api/addresses/create` - Criar endereco
6. `/api/cep/[cep]` - Buscar CEP

## Notas Importantes

- Todas as rotas frontend incluem Header e Footer (exceto login/register que podem ter layout diferente)
- Rotas protegidas redirecionam para `/login` se nao autenticado
- Todas as rotas respeitam o multi-tenant (filtro por tenantId)
- As rotas API validam tenant via middleware/headers

