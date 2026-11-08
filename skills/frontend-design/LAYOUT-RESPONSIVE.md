---
name: frontend-design-layout
description: Layout and responsiveness rules of the design skill — mobile-first, breakpoints, content width, container vs media queries, viewport units, safe areas, touch vs pointer and hover. Use when building a page layout, choosing breakpoints, making a component adapt to its slot, or fixing mobile overflow and touch targets.
type: reference
scope: frontend
tokens: ~1.5k
---

# Layout and responsiveness

> **TL;DR:** Mobile primeiro, breakpoint onde o conteúdo quebra, largura de conteúdo limitada, componente reutilizável adapta ao próprio espaço (container query) e a tela inteira adapta à janela (media query).

## Rules

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Mobile primeiro | Estilo base para a tela menor, `min-width` para crescer; em Tailwind, o prefixo `sm:` significa "sm e acima" | [web.dev responsive basics](https://web.dev/articles/responsive-web-design-basics); [Tailwind responsive](https://tailwindcss.com/docs/responsive-design) |
| Viewport | `<meta name="viewport" content="width=device-width, initial-scale=1">`; nunca `user-scalable=no` nem `maximum-scale` | web.dev responsive basics |
| Breakpoint no ponto de quebra | Nunca por aparelho ou marca | web.dev responsive basics |
| Janela, não dispositivo | Decida pelo tamanho da janela, nunca por `isTablet`; ela muda em tempo de execução | [Android window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/window-size-classes) |
| Mesma função em todo tamanho | Muda quanto aparece (barra de abas vira lateral), não o que o usuário consegue fazer | [Apple HIG layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| Nunca esconder conteúdo por falta de espaço | Reorganize | web.dev responsive basics |
| Largura de conteúdo limitada | Texto corrido ~70–80 caracteres (GOV.UK ~75; página até 1020 px); conteúdo principal em 2/3 da grade mesmo sem lateral | [GOV.UK layout](https://design-system.service.gov.uk/styles/layout/) |
| Flex, grid e porcentagem | Nada de largura fixa em px; imagem com `max-width: 100%`, `display: block` e `width`/`height` | web.dev responsive basics |
| Media query para a página, container query para o componente | `container-type: inline-size` no pai; em Tailwind, `@container` e `@md:` | [MDN container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries); Tailwind responsive |
| Altura total | `100svh` no lugar de `100vh` no celular; `dvh` com cuidado | [MDN length](https://developer.mozilla.org/en-US/docs/Web/CSS/length) |
| Safe area | Rodapé e barra fixa com `env(safe-area-inset-bottom)` | [MDN env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env) |
| Texto ampliado | Suporte ≥ 200%; linhas crescem e empilham, não cortam | Apple HIG accessibility |

## Breakpoints de referência

Use os do projeto. Sem preferência declarada, os padrões do Tailwind:

| Nome | Largura mínima |
| --- | --- |
| `sm` | 640 px |
| `md` | 768 px |
| `lg` | 1024 px |
| `xl` | 1280 px |
| `2xl` | 1536 px |

Referências para decidir arranjo por janela: Material compact < 600, medium 600–839, expanded 840–1199, large 1200–1599, extra-large ≥ 1600 dp (fonte: Android window size classes). Sem fonte para margens, gutters e colunas do Material 3; GOV.UK usa gutter de 30 px.

## Touch vs pointer

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Alvo mínimo 24×24 px | Exceções: espaçamento, inline, essencial, controle do navegador | [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| No toque, mire em 44×44 | Apple: 44 pt padrão, 28 pt mínimo, ~12 pt de folga | [Apple HIG accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| Aumente por `@media (pointer: coarse)` | `any-pointer` se houver mais de uma entrada | [MDN pointer](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer) |
| Hover só dentro de `@media (hover: hover)` | Hover nunca é o único caminho para uma função | [MDN hover](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover) |

## Wrong vs right

❌ Errado: decisão por dispositivo e `vh` que estoura no celular.

```tsx
<main className={isTablet ? 'w-[768px] h-screen' : 'w-[375px] h-screen'}>{children}</main>
```

✅ Certo: fluido, limitado e mobile primeiro.

```tsx
<main className="mx-auto min-h-svh w-full max-w-3xl px-4 py-6 md:px-8">{children}</main>
```

## Anti-patterns

- **Layout por dispositivo:** `isTablet`, `isIPhone`.
- **Hover escondido:** ação que só aparece no hover.
- **Zoom bloqueado:** `user-scalable=no`.
- **Linha infinita:** parágrafo em 1500 px de largura.
- **Lista que empurra o rodapé:** página de consulta com lista longa cresce e o rodapé (idioma, links) some. Deixe a **página** rolar e prenda cabeçalho e rodapé com `sticky top-0`/`sticky bottom-0` e fundo da página. Não faça a lista rolar por dentro: a barra de rolagem interna come a largura só da lista, que fica desalinhada ("torta") com o cabeçalho e a faixa de cima, conforme a largura da barra de cada navegador.
- **Painel sob a barra de status (React Native):** gaveta ou folha num `Modal` com `statusBarTranslucent` que sobe com fundo claro até o topo; a janela do modal mantém os ícones da barra claros e eles somem, e o canto arredondado fica sob a câmera. Comece o painel abaixo do `insets.top` e deixe o scrim cobrir a barra.

## Trade-offs

- Container query custa uma camada de contenção; use em componente reutilizável, não em toda `div`.
- `svh` não acompanha a barra de endereço recolhida; é o preço de nunca estourar a tela.

## Checklist

- [ ] Funciona de 320 px de largura sem rolagem horizontal
- [ ] Largura do texto limitada; imagens com dimensões
- [ ] Alvos ≥ 24 px (44 px no toque); nenhuma função só no hover
- [ ] Barras fixas respeitam a safe area
