# Sistema de Tema Global - Multi-tenant Pizzaria

## Visao Geral

O projeto utiliza um sistema de tema global baseado em CSS Variables (Custom Properties) que permite:
- Personalizacao por tenant (multi-tenant)
- Suporte a dark mode
- Escalabilidade e manutencao facil
- Responsividade otimizada com unidades REM

## Estrutura do Sistema de Tema

### 1. Variaveis CSS Globais (`globals.css`)

O sistema define variaveis CSS na raiz (`:root`) que podem ser sobrescritas por tenant:

#### Cores do Sistema
```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: [dinamico por tenant]
--secondary: [dinamico por tenant]
--card, --popover, --muted, --accent, --destructive
```

#### Sistema de Espacamento (baseado em REM)
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;     /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */
```

#### Escala Tipografica (baseado em REM)
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg: 1.125rem;    /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
--font-size-6xl: 3.75rem;    /* 60px */
```

#### Line Heights
```css
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

#### Shadows
```css
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
```

#### Z-Index Scale
```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
```

### 2. Personalizacao por Tenant (`layout.tsx`)

Cada tenant pode ter suas proprias cores primarias e secundarias:

```typescript
// Converte cores hex do tenant para HSL
const primaryHsl = hexToHsl(tenant.primaryColor);
const secondaryHsl = hexToHsl(tenant.secondaryColor);

// Injeta no :root via style tag
:root {
  --primary: ${primaryHsl};
  --secondary: ${secondaryHsl};
}
```

### 3. Integracao com Tailwind CSS (`tailwind.config.ts`)

As variaveis CSS sao mapeadas para classes Tailwind:

```typescript
colors: {
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
  },
  // ...
}
```

## Unidades REM vs PX

### Por que usar REM?

1. **Acessibilidade**: Respeita as preferencias do usuario (zoom do navegador)
2. **Responsividade**: Escala automaticamente com o tamanho da fonte base
3. **Consistencia**: Mantem proporcoes em diferentes dispositivos
4. **Mobile-friendly**: Melhor experiencia em dispositivos moveis

### Base Font Size

```css
html {
  font-size: 16px; /* Base para calculo de rem */
}
```

**Conversao**: 1rem = 16px (padrao do navegador)

### Exemplos de Conversao

| PX | REM | Uso |
|---|---|---|
| 4px | 0.25rem | Espacamento muito pequeno |
| 8px | 0.5rem | Espacamento pequeno |
| 16px | 1rem | Base (font-size padrao) |
| 24px | 1.5rem | Espacamento medio |
| 32px | 2rem | Espacamento grande |
| 48px | 3rem | Espacamento muito grande |

### Uso no Codigo

**Antes (PX - nao recomendado)**:
```tsx
<div className="h-[400px]">...</div>
```

**Depois (REM - recomendado)**:
```tsx
<div className="h-[25rem]">...</div> // 25rem = 400px (base 16px)
```

## Dark Mode

O sistema suporta dark mode atraves da classe `.dark`:

```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

## Uso das Variaveis

### Em Componentes React/TSX

```tsx
// Usando classes Tailwind (recomendado)
<div className="bg-primary text-primary-foreground p-md">
  Conteudo
</div>

// Usando CSS direto (quando necessario)
<div style={{ 
  backgroundColor: 'hsl(var(--primary))',
  padding: 'var(--spacing-md)'
}}>
  Conteudo
</div>
```

### Em CSS Custom

```css
.custom-component {
  background-color: hsl(var(--primary));
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  box-shadow: var(--shadow-lg);
}
```

## Boas Praticas

1. **Sempre use REM para dimensoes**: Espacamento, tamanhos de fonte, alturas, larguras
2. **Use variaveis CSS**: Nao hardcode valores, use as variaveis definidas
3. **Respeite a escala**: Use os valores predefinidos (xs, sm, md, lg, xl, etc)
4. **Teste em diferentes tamanhos de fonte**: Garanta que o layout funciona com zoom
5. **Mobile-first**: Sempre considere dispositivos moveis primeiro

## Checklist de Validacao

- [x] Sistema de variaveis CSS implementado
- [x] Personalizacao por tenant funcionando
- [x] Base font-size definida (16px)
- [x] Conversao de PX para REM no banner hero
- [x] Variaveis de espacamento em REM
- [x] Escala tipografica em REM
- [x] Integracao com Tailwind CSS
- [x] Suporte a dark mode
- [x] Z-index scale definido
- [x] Shadow system definido

## Proximos Passos

1. Converter todos os valores PX restantes para REM
2. Adicionar mais variaveis de tema conforme necessario
3. Implementar toggle de dark mode (se necessario)
4. Documentar padroes de uso para a equipe

