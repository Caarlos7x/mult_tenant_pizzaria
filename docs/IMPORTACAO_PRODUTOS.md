# Guia de Importação de Produtos via Excel

Este guia explica como importar produtos em massa usando uma planilha Excel.

## Como Usar

1. Acesse o painel administrativo: `/admin/products`
2. Clique no botão "Importar"
3. Baixe o template Excel
4. Preencha a planilha com os dados dos seus produtos
5. Faça upload da planilha preenchida
6. Revise os produtos importados

## Colunas da Planilha

A planilha deve conter as seguintes colunas (nomes exatos ou variações aceitas):

### Colunas Obrigatórias

| Nome da Coluna | Variações Aceitas | Tipo | Descrição | Exemplo |
|---------------|-------------------|------|-----------|---------|
| `name` | `nome` | Texto | Nome do produto | "Pizza Margherita" |
| `basePrice` | `preco`, `price`, `baseprice` | Número | Preço base do produto | 25.00 |
| `type` | `tipo` | Texto | Tipo do produto (veja valores abaixo) | "PIZZA" |

### Colunas Opcionais

| Nome da Coluna | Variações Aceitas | Tipo | Descrição | Valor Padrão |
|---------------|-------------------|------|-----------|--------------|
| `description` | `descricao` | Texto | Descrição do produto | "" |
| `status` | - | Texto | Status do produto (veja valores abaixo) | "ACTIVE" |
| `categoryName` | `categoria`, `category`, `categoryname` | Texto | Nome da categoria (será criada se não existir) | null |
| `imageUrl` | `imagem`, `image`, `imageurl` | URL | URL da imagem do produto | null |
| `sortOrder` | `ordem`, `order`, `sortorder` | Número | Ordem de exibição | 0 |

## Valores Aceitos

### Tipo de Produto (`type`)

- `PIZZA` - Pizza
- `DRINK` - Bebida
- `COMBO` - Combo
- `DESSERT` - Sobremesa
- `OTHER` - Outro

### Status do Produto (`status`)

- `ACTIVE` - Ativo (padrão)
- `INACTIVE` - Inativo
- `OUT_OF_STOCK` - Sem Estoque

## Exemplo de Planilha

| name | description | type | status | basePrice | categoryName | imageUrl | sortOrder |
|------|-------------|------|--------|-----------|--------------|----------|-----------|
| Pizza Margherita | Molho de tomate, mussarela e manjericão | PIZZA | ACTIVE | 25.00 | Pizzas | https://example.com/pizza.jpg | 1 |
| Coca-Cola 2L | Refrigerante Coca-Cola 2 litros | DRINK | ACTIVE | 8.00 | Bebidas | | 2 |
| Pizza Calabresa | Calabresa, cebola e azeitona | PIZZA | ACTIVE | 30.00 | Pizzas | | 3 |

## Observações Importantes

1. **Nomes das Colunas**: Os nomes das colunas são case-insensitive e espaços são ignorados. Por exemplo, `Nome`, `nome`, `NOME` são todos aceitos.

2. **Categorias**: Se você especificar um nome de categoria que não existe, ela será criada automaticamente.

3. **Preços**: Use ponto (.) como separador decimal. Exemplo: `25.50` (não use vírgula).

4. **URLs de Imagem**: Deixe vazio se não tiver imagem. URLs devem ser válidas.

5. **Validação**: Produtos com dados inválidos serão ignorados e você verá uma lista de erros após a importação.

6. **Duplicatas**: A importação não verifica duplicatas. Se você importar o mesmo produto duas vezes, ele será criado novamente.

## Tratamento de Erros

Após a importação, você verá:
- Quantos produtos foram importados com sucesso
- Lista de erros (se houver)
- Número da linha onde cada erro ocorreu

Corrija os erros na planilha e importe novamente apenas as linhas corrigidas.

## Limitações

- Não é possível importar variantes de produtos (tamanhos, bordas, etc.) via planilha
- Não é possível importar modificadores (adicionais) via planilha
- Esses recursos devem ser configurados manualmente após a importação

