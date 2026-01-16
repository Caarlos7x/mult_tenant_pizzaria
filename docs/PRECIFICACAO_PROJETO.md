# Precificação do Sistema de Pizzaria

## 🎯 Estratégia de Precificação

**Modelo:** Tudo incluído (infraestrutura + software)  
**Foco:** Preço acessível para ganhar em volume  
**Diferencial:** Qualidade superior de desenvolvimento frontend

---

## 📋 Índice

1. [Modelo de Negócio](#modelo-de-negócio)
2. [Infraestrutura Gerenciada](#infraestrutura-gerenciada)
3. [Custos de Infraestrutura](#custos-de-infraestrutura)
4. [Custos de Desenvolvimento](#custos-de-desenvolvimento)
5. [Precificação Sugerida](#precificação-sugerida)
6. [Cenários de Uso](#cenários-de-uso)
7. [Análise de Rentabilidade](#análise-de-rentabilidade)
8. [Recomendações](#recomendações)

---

## 🏢 Modelo de Negócio

### Como Funciona

1. **Você gerencia tudo:**
   - Banco de dados Neon (multi-tenant compartilhado)
   - Hospedagem (Vercel/Netlify)
   - Domínio principal (ex: `pizzaria.delivery` ou `wabiz.delivery`)
   - Subdomínios para cada cliente (ex: `michelangelo.pizzaria.delivery`)

2. **Cliente recebe:**
   - URL própria: `michelangelo.pizzaria.delivery`
   - Banco de dados isolado (via `tenant_id`)
   - Sistema completo funcionando
   - Suporte e manutenção

3. **Você cobra:**
   - Setup inicial (configuração + personalização)
   - Mensalidade (tudo incluído: infra + software + suporte)

### Vantagens

✅ **Simplicidade** - Cliente não precisa gerenciar nada  
✅ **Preço acessível** - Economia de escala com multi-tenant  
✅ **Competitivo** - Preço similar ou menor que Wabiz  
✅ **Qualidade** - Diferencial técnico no frontend  
✅ **Escalável** - Um banco Neon suporta múltiplos clientes  

---

## 🗄️ Infraestrutura Gerenciada

### Arquitetura Multi-Tenant

O sistema utiliza **um único banco de dados Neon** compartilhado entre todos os clientes, com isolamento via `tenant_id`:

```
┌─────────────────────────────────────────┐
│     Banco Neon (Compartilhado)          │
│  ┌───────────────────────────────────┐ │
│  │ Tenant: michelangelo               │ │
│  │  - Produtos (tenant_id = "abc")    │ │
│  │  - Pedidos (tenant_id = "abc")    │ │
│  │  - Usuários (tenant_id = "abc")   │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ Tenant: pizzaria2                 │ │
│  │  - Produtos (tenant_id = "def")   │ │
│  │  - Pedidos (tenant_id = "def")    │ │
│  │  - Usuários (tenant_id = "def")   │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### URLs dos Clientes

**Opção 1: Subdomínios (Padrão)**
- `michelangelo.pizzaria.delivery`
- `pizzaria2.pizzaria.delivery`
- `pizzaria3.pizzaria.delivery`

**Opção 2: Domínio Próprio (Opcional - Cliente paga)**
- `michelangelo.com.br` (cliente configura DNS)

### Vantagens do Modelo Multi-Tenant

✅ **Economia de escala** - Um banco suporta 50-100+ clientes  
✅ **Custos diluídos** - Custo Neon dividido entre clientes  
✅ **Manutenção simples** - Um banco para gerenciar  
✅ **Backup centralizado** - Todos os dados em um lugar  

---

## 💰 Custos de Infraestrutura (Seus Custos)

Baseado no [pricing do Neon](https://neon.com/pricing), temos três planos principais:

#### Plano Free (Desenvolvimento/Teste)
- **Custo:** $0/mês
- **Limites:**
  - 100 projetos
  - 100 CU-hours por projeto
  - 0.5 GB por projeto
  - Até 2 CU (8 GB RAM)
- **Uso:** Apenas para desenvolvimento e testes

#### Plano Launch (Pequenas/Médias Pizzarias)
- **Custo:** Baseado em uso
- **Preços:**
  - $0.106 por CU-hour de compute
  - $0.35 por GB-mês de storage
  - Até 16 CU (64 GB RAM)
- **Recursos:**
  - 100 projetos
  - 10 branches por projeto
  - 7 dias de time travel/PITR
  - 3 dias de retenção de monitoramento

#### Plano Scale (Grandes Pizzarias/Franchises)
- **Custo:** Baseado em uso
- **Preços:**
  - $0.222 por CU-hour de compute
  - $0.35 por GB-mês de storage
  - Até 56 CU (224 GB RAM)
- **Recursos:**
  - 1,000+ projetos
  - 25 branches por projeto
  - 30 dias de time travel/PITR
  - 14 dias de retenção de monitoramento
  - 99.95% SLA
  - SOC 2, HIPAA disponível

---

## 📊 Estimativa de Uso por Pizzaria

### Cenário 1: Pequena Pizzaria (1-2 unidades)
- **Pedidos/dia:** 20-50
- **Produtos:** 50-100
- **Usuários:** 100-500 clientes
- **Tamanho do banco:** ~0.5-1 GB
- **Compute:** 1-2 CU (ativa 24/7)
- **Uso mensal estimado:**
  - Compute: 1.5 CU × 730 horas = 1,095 CU-hours
  - Storage: 0.75 GB-mês
  - **Custo Neon:** (1,095 × $0.106) + (0.75 × $0.35) = **$116.15/mês**

### Cenário 2: Média Pizzaria (3-5 unidades)
- **Pedidos/dia:** 100-200
- **Produtos:** 100-200
- **Usuários:** 500-2,000 clientes
- **Tamanho do banco:** ~2-5 GB
- **Compute:** 2-4 CU (ativa 24/7)
- **Uso mensal estimado:**
  - Compute: 3 CU × 730 horas = 2,190 CU-hours
  - Storage: 3.5 GB-mês
  - **Custo Neon:** (2,190 × $0.106) + (3.5 × $0.35) = **$232.87/mês**

### Cenário 3: Grande Pizzaria/Franchise (10+ unidades)
- **Pedidos/dia:** 500-1,000+
- **Produtos:** 200-500
- **Usuários:** 5,000-20,000+ clientes
- **Tamanho do banco:** ~10-50 GB
- **Compute:** 4-8 CU (ativa 24/7)
- **Uso mensal estimado:**
  - Compute: 6 CU × 730 horas = 4,380 CU-hours
  - Storage: 25 GB-mês
  - **Custo Neon (Scale):** (4,380 × $0.222) + (25 × $0.35) = **$978.86/mês**

---

## 💻 Custos de Desenvolvimento

### Desenvolvimento Inicial
- **Tempo estimado:** 200-300 horas
- **Taxa horária sugerida:** R$ 100-150/hora
- **Custo total:** R$ 20,000 - R$ 45,000
- **Inclui:**
  - Desenvolvimento completo do sistema
  - Configuração inicial
  - Treinamento básico
  - Documentação

### Manutenção Mensal
- **Tempo estimado:** 10-20 horas/mês
- **Taxa horária:** R$ 100-150/hora
- **Custo mensal:** R$ 1,000 - R$ 3,000/mês
- **Inclui:**
  - Correções de bugs
  - Atualizações de segurança
  - Suporte técnico
  - Melhorias menores

---

## 🌐 Custos Adicionais (Cliente paga)

### Domínio
- **Custo anual:** R$ 30-50/ano (~R$ 3-5/mês)
- **Provedores:** Registro.br, GoDaddy, Namecheap
- **Cliente paga diretamente**

### Hospedagem (Opcional - Cliente paga)
- **Vercel Hobby:** $0/mês (com limitações)
- **Vercel Pro:** $20/mês (~R$ 100/mês)
- **Netlify:** Similar
- **Cliente pode hospedar onde quiser**

### SSL/HTTPS
- **Custo:** Incluído na maioria dos provedores (gratuito)

---

## 💵 Precificação Sugerida (Modelo Acessível)

### Modelo 1: Assinatura Mensal (SaaS)

#### Plano Básico - R$ 299/mês
- **Para:** Pequenas pizzarias (1-2 unidades)
- **Inclui:**
  - Sistema completo
  - Suporte por email
  - Atualizações de segurança
  - 0.5 GB de storage
  - Até 1,000 pedidos/mês
- **Margem estimada:**
  - Custo Neon: ~R$ 580/mês (convertido)
  - Custo hospedagem: R$ 100/mês
  - Custo domínio: R$ 5/mês
  - **Total custos:** ~R$ 685/mês
  - **Receita:** R$ 299/mês
  - **⚠️ Este plano não é viável isoladamente**

#### Plano Profissional - R$ 799/mês
- **Para:** Médias pizzarias (3-5 unidades)
- **Inclui:**
  - Sistema completo
  - Suporte prioritário
  - Atualizações regulares
  - 5 GB de storage
  - Até 5,000 pedidos/mês
- **Margem estimada:**
  - Custo Neon: ~R$ 1,165/mês
  - Custo hospedagem: R$ 100/mês
  - Custo domínio: R$ 5/mês
  - **Total custos:** ~R$ 1,270/mês
  - **Receita:** R$ 799/mês
  - **⚠️ Este plano também não é viável isoladamente**

#### Plano Enterprise - R$ 2,499/mês
- **Para:** Grandes pizzarias/franchises (10+ unidades)
- **Inclui:**
  - Sistema completo
  - Suporte 24/7
  - Atualizações prioritárias
  - 50 GB de storage
  - Pedidos ilimitados
  - SLA 99.95%
- **Margem estimada:**
  - Custo Neon: ~R$ 4,900/mês
  - Custo hospedagem: R$ 2,000/mês
  - Custo domínio: R$ 5/mês
  - **Total custos:** ~R$ 6,905/mês
  - **Receita:** R$ 2,499/mês
  - **⚠️ Este plano também não é viável isoladamente**

### Modelo 2: Precificação por Uso (Recomendado)

#### Setup Inicial: R$ 5,000 - R$ 10,000 (único)
- Configuração inicial
- Personalização básica
- Treinamento

#### Mensalidade Base: R$ 199/mês
- Sistema básico
- Suporte por email
- Atualizações de segurança

#### Custos Adicionais (Pay-as-you-go):
- **Storage:** R$ 1.75/GB-mês (acima de 1 GB incluído)
- **Compute:** R$ 0.53/CU-hour (acima de 100 CU-hours incluídos)
- **Pedidos extras:** R$ 0.10 por pedido (acima de 1,000/mês incluídos)

**Exemplo de faturamento:**
- Pizzaria média com 3 GB storage, 2,000 CU-hours, 3,000 pedidos:
  - Base: R$ 199
  - Storage extra: (3-1) × R$ 1.75 = R$ 3.50
  - Compute extra: (2,000-100) × R$ 0.53 = R$ 1,007
  - Pedidos extra: (3,000-1,000) × R$ 0.10 = R$ 200
  - **Total:** R$ 1,409.50/mês

### Modelo 3: Precificação Híbrida (Mais Viável)

#### Setup Inicial: R$ 3,000 - R$ 8,000 (único)
- Configuração e personalização
- Treinamento básico

#### Plano Starter - R$ 497/mês
- **Para:** Pequenas pizzarias
- **Inclui:**
  - 1 GB storage
  - 500 CU-hours/mês
  - 1,000 pedidos/mês
  - Suporte por email
- **Custos extras:**
  - Storage: R$ 1.75/GB adicional
  - Compute: R$ 0.53/CU-hour adicional
  - Pedidos: R$ 0.10/pedido adicional

#### Plano Business - R$ 1,297/mês
- **Para:** Médias pizzarias
- **Inclui:**
  - 5 GB storage
  - 2,000 CU-hours/mês
  - 5,000 pedidos/mês
  - Suporte prioritário
- **Custos extras:** Mesmos do Starter

#### Plano Enterprise - R$ 3,497/mês
- **Para:** Grandes pizzarias/franchises
- **Inclui:**
  - 25 GB storage
  - 5,000 CU-hours/mês
  - 20,000 pedidos/mês
  - Suporte 24/7
  - SLA 99.95%
- **Custos extras:** Mesmos do Starter

---

## 📈 Análise de Rentabilidade

### Seus Custos Totais

**Com 50 clientes:**
- Infraestrutura: R$ 2,110/mês
- Manutenção: 50 × R$ 300 = R$ 15,000/mês
- **Total custos:** R$ 17,110/mês
- **Custo por cliente:** R$ 342/mês

**Com 100 clientes:**
- Infraestrutura: R$ 4,110/mês
- Manutenção: 100 × R$ 250 = R$ 25,000/mês
- **Total custos:** R$ 29,110/mês
- **Custo por cliente:** R$ 291/mês

### Receita Mensal

**Cenário Conservador (50 clientes):**
- 30 clientes Básico (R$ 249): R$ 7,470
- 15 clientes Profissional (R$ 349): R$ 5,235
- 5 clientes Enterprise (R$ 497): R$ 2,485
- **Total mensal:** R$ 15,190/mês

**Cenário Otimista (100 clientes):**
- 60 clientes Básico: R$ 14,940
- 30 clientes Profissional: R$ 10,470
- 10 clientes Enterprise: R$ 4,970
- **Total mensal:** R$ 30,380/mês

### Margem de Lucro

**Com 50 clientes:**
- Receita: R$ 15,190/mês
- Custos: R$ 17,110/mês
- **Resultado:** -R$ 1,920/mês (break-even em ~60 clientes)

**Com 60 clientes:**
- Receita: ~R$ 18,000/mês
- Custos: ~R$ 20,000/mês
- **Resultado:** Break-even

**Com 80 clientes:**
- Receita: ~R$ 24,000/mês
- Custos: ~R$ 24,000/mês
- **Resultado:** Break-even

**Com 100 clientes:**
- Receita: R$ 30,380/mês
- Custos: R$ 29,110/mês
- **Margem:** ~4% (R$ 1,270/mês)

**Com 150 clientes:**
- Receita: ~R$ 45,000/mês
- Custos: ~R$ 40,000/mês
- **Margem:** ~11% (R$ 5,000/mês)

### Receita de Setup

**Com 50 clientes/ano:**
- Setup médio: R$ 997
- Total anual: R$ 49,850
- **Mensalizado:** R$ 4,154/mês (bônus)

**Com 100 clientes/ano:**
- Total anual: R$ 99,700
- **Mensalizado:** R$ 8,308/mês (bônus)

---

## 🎯 Recomendações Finais

### Precificação Final (Tudo Incluído)

#### Setup Inicial: R$ 650 - R$ 1,500 (único)
- R$ 650 (básico - similar Wabiz)
- R$ 997 (com mais produtos)
- R$ 1,500 (com domínio próprio)

#### Mensalidade (Tudo Incluído):
- **Básico:** R$ 249/mês
- **Profissional:** R$ 349/mês
- **Enterprise:** R$ 497/mês

**O que está incluído:**
- ✅ URL própria (subdomínio)
- ✅ Banco de dados (isolado)
- ✅ Hospedagem
- ✅ Software completo
- ✅ Suporte e manutenção
- ✅ Atualizações

### Opcional: Domínio Próprio

- Cliente pode usar domínio próprio (ex: `michelangelo.com.br`)
- Cliente paga o domínio diretamente (R$ 30-50/ano)
- Você configura o DNS (incluído no setup)

### Estratégia de Crescimento

1. **Meta inicial:** 50-60 clientes (break-even)
2. **Meta de lucro:** 80-100 clientes (margem de 4-11%)
3. **Meta ideal:** 150+ clientes (margem de 11-20%)

### Vantagens Competitivas

✅ **Preço competitivo:** R$ 249-497/mês (similar ou menor que Wabiz)  
✅ **Qualidade superior:** Frontend moderno e responsivo  
✅ **Tudo incluído:** Cliente não precisa gerenciar nada  
✅ **Multi-tenant eficiente:** Economia de escala  
✅ **Subdomínios gratuitos:** Sem custo adicional  

### Considerações Importantes

1. **Volume é essencial:** Precisa de 60+ clientes para break-even
2. **Automação:** Criar processos para reduzir tempo de suporte
3. **Documentação:** Investir em docs para reduzir suporte
4. **Comunidade:** Criar grupo/chat para clientes se ajudarem
5. **Escalabilidade:** Sistema já é multi-tenant, fácil de escalar
6. **Monitoramento:** Acompanhar uso do Neon para otimizar custos
7. **Otimização:** Queries eficientes reduzem compute do Neon

---

## 📊 Tabela Comparativa

### Custos Totais do Cliente

| Plano | Licença | Neon* | Domínio | Hospedagem | **Total Cliente** |
|-------|---------|-------|---------|------------|-------------------|
| Básico | R$ 197 | R$ 50-150 | R$ 5 | R$ 0-50 | **R$ 252-402/mês** |
| Profissional | R$ 297 | R$ 150-300 | R$ 5 | R$ 0-100 | **R$ 452-702/mês** |
| Enterprise | R$ 497 | R$ 300-800 | R$ 5 | R$ 0-200 | **R$ 802-1,502/mês** |

*Custos do Neon variam conforme uso real

---

## 🆚 Comparação com Wabiz (Principal Concorrente)

### Informações da Wabiz

**Setup/Implantação:**
- **R$ 650** (taxa única)
- Inclui: personalização, cardápio, identidade visual

**Mensalidade:**
- **R$ 249/mês** (um canal: app OU weblink)
- **R$ 346-350/mês** (ambos os canais: app + weblink)
- **Sem comissão por pedido** (mensalidade fixa)

**Suporte:**
- Atendimento até 23h50
- Acompanhamento estratégico por 2 meses após implantação

**Características:**
- Aplicativo próprio (Android/iOS)
- Painel administrativo
- Cardápio digital
- Notificações push
- Sem tempo mínimo de vínculo

### Comparação Detalhada

| Item | **Seu Sistema** | **Wabiz** | **Vantagem** |
|------|----------------|-----------|--------------|
| **Setup** | R$ 650-1,500 | R$ 650 | ✅ Competitivo |
| **Mensalidade** | R$ 249-497 | R$ 249-350 | ✅ Similar/Competitivo |
| **Qualidade Frontend** | ⭐⭐⭐⭐⭐ Moderno | ⭐⭐⭐ Regular | ✅ Seu sistema superior |
| **Infraestrutura** | ✅ Tudo incluído | ✅ Incluída | ✅ Igual |
| **URL** | `cliente.pizzaria.delivery` | `cliente.wabiz.delivery` | ✅ Similar |
| **Customização** | Total (código próprio) | Limitada | ✅ Seu sistema superior |
| **Multi-tenant** | ✅ Sim (eficiente) | ❌ Não | ✅ Seu sistema superior |
| **Banco de Dados** | Isolado (tenant_id) | Wabiz controla | ✅ Seu sistema (isolado) |
| **Suporte** | Email/Prioritário | Até 23h50 | ⚠️ Wabiz mais disponível |
| **Acompanhamento** | Básico | 2 meses estratégico | ⚠️ Wabiz oferece mais |

### Análise Competitiva

**Vantagens do Seu Sistema:**
1. ✅ **Preço mensal menor** (R$ 197 vs R$ 249-350)
2. ✅ **Qualidade técnica superior** (frontend moderno)
3. ✅ **Sem lock-in** (cliente tem seu banco)
4. ✅ **Multi-tenant** (suporta múltiplas pizzarias)
5. ✅ **Customização total** (código próprio)

**Desvantagens do Seu Sistema:**
1. ⚠️ **Setup mais caro** (R$ 1,500-2,500 vs R$ 650)
2. ⚠️ **Cliente precisa gerenciar infra** (Neon)
3. ⚠️ **Suporte menos disponível** (não 24h)

**Estratégia de Posicionamento:**

Para competir com a Wabiz:

1. **Preço similar, qualidade superior:**
   - Setup: R$ 650 (igual Wabiz)
   - Mensalidade: R$ 249 (igual Wabiz básico)
   - **Diferencial:** Qualidade técnica superior

2. **Destaque as vantagens:**
   - "Mesmo preço, qualidade superior"
   - "Frontend moderno e responsivo"
   - "Sistema multi-tenant eficiente"
   - "Dados isolados e seguros"
   - "Customização total"

3. **Pacote competitivo:**
   - Setup: R$ 650 (igual Wabiz)
   - Mensalidade: R$ 249 (igual Wabiz)
   - **Total primeiro ano:** R$ 3,638 vs Wabiz R$ 4,850-5,250
   - **Economia:** R$ 1,212-1,612 no primeiro ano (com plano Profissional)

### Comparação com Outros Concorrentes

| Sistema | Setup | Mensalidade | Qualidade | Infra Própria |
|---------|-------|-------------|-----------|---------------|
| **Seu Sistema** | R$ 1,500-2,500 | R$ 197-497 | ⭐⭐⭐⭐⭐ | ✅ Sim |
| **Wabiz** | R$ 650 | R$ 249-350 | ⭐⭐⭐ | ❌ Não |
| Concorrente A | R$ 1,000-2,000 | R$ 500-800 | ⭐⭐ | ❌ Não |
| Concorrente B | R$ 2,000-5,000 | R$ 800-1,500 | ⭐⭐⭐ | ❌ Não |

**Diferencial:** Preço mensal competitivo com qualidade técnica superior!

---

## 🔗 Referências

- [Neon Pricing](https://neon.com/pricing)
- [Neon Documentation](https://neon.tech/docs)
- [Vercel Pricing](https://vercel.com/pricing)

---

**Última atualização:** Janeiro 2025

