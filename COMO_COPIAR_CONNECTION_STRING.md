# Como Copiar a Connection String do Neon

## Opção 1: Pelo Card "Connect to your database"

1. **Feche o modal** "Get started with Neon + AI" (clique no X no canto superior direito)
2. **Procure o card** "Connect to your database" (com ícone de plug)
3. **Clique no botão "Connect"** nesse card
4. **Você verá a connection string** - copie ela completa

## Opção 2: Pelo Botão "Connect" no Topo

1. **Clique no botão "Connect"** que está no topo da página (ao lado de "Share")
2. **Escolha a opção** "Connection string" ou "URI"
3. **Copie a string completa** que começa com `postgresql://...`

## Opção 3: Pela Sidebar

1. **Clique em "Settings"** na sidebar esquerda (embaixo de PROJECT)
2. **Procure por "Connection Details"** ou "Database"
3. **Copie a connection string**

---

## O que você vai copiar:

A connection string será algo assim:
```
postgresql://usuario:senha@ep-xxx-xxx-xxx.region.neon.tech/neondb?sslmode=require
```

**Importante:** Copie a string COMPLETA, incluindo tudo depois do `postgresql://`

---

## Depois de copiar:

Me envie a connection string e eu atualizo o arquivo `.env` para você!

