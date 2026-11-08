---
name: frontend-design-foundations
description: Visual foundations of the design skill — type scale and line length, semantic color roles and the 12-step scale, spacing scale and grouping, elevation, radius and icons, each tied to an official source. Use when choosing font sizes, colors, spacing, shadows, radii or icons, or defining tokens for a new screen.
type: reference
scope: frontend
tokens: ~2k
---

# Foundations

> **TL;DR:** Escala fechada de texto, cores por papel, espaço em múltiplos de uma unidade. Nada fora da escala. Como os tokens viram classes: [COMPONENTS-STYLING.md](../frontend-house-style/COMPONENTS-STYLING.md).

## Typography

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Escala nomeada por papel | display, headline, title, body, label; cada token tem família, tamanho, altura de linha e peso | [Material typography](https://github.com/material-components/material-web/blob/main/docs/theming/typography.md) |
| Escala fechada | Reuse os degraus; nunca invente um tamanho (GOV.UK: 16/19/24/27/36/48/80 px) | [GOV.UK type scale](https://design-system.service.gov.uk/styles/type-scale/) |
| Altura de linha sem unidade, ≥ 1,5 no parágrafo | `line-height: 1.5` escala com o zoom; sem 3+ linhas apertadas | [MDN line-height](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height) |
| Tamanho em `rem` | Fluido com `clamp()`: o máximo é no mínimo 2× o mínimo, em unidade relativa | [MDN clamp](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp) |
| Medida do texto corrido | No máximo 75 caracteres por linha | [GOV.UK layout](https://design-system.service.gov.uk/styles/layout/) |
| Títulos grandes encolhem no celular, corpo não | GOV.UK: 48→32 e 36→27 abaixo de 640 px; corpo igual | GOV.UK type scale |
| Alinhar à esquerda, sem justificar | Texto justificado cansa, sobretudo ampliado | [GOV.UK](https://design-system.service.gov.uk/styles/font-override-classes/) |
| Pesos Regular, Medium, Semibold, Bold | Evite Light/Thin; negrito com parcimônia | [Apple HIG typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| Poucas famílias | Número tabular (`tabular-nums`) em colunas e contadores | Apple HIG typography; GOV.UK |
| Fonte web | WOFF2, subset, `font-display`, `size-adjust` no fallback; `system-ui` se não precisa de marca | [web.dev font best practices](https://web.dev/articles/font-best-practices) |

Sem número nas fontes: o tamanho mínimo de corpo para a web. Use o padrão do projeto (`1rem`) e nunca abaixo dele para texto de leitura.

## Color

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Cor por papel | `primary`, `surface`, `error`…; nunca valor fixo nem papel reaproveitado | [Apple HIG color](https://developer.apple.com/design/human-interface-guidelines/color) |
| Par `X` / `on-X` | Todo fundo vem com a cor de conteúdo que garante o contraste | [Material color](https://github.com/material-components/material-web/blob/main/docs/theming/color.md) |
| Camadas de superfície nomeadas | `surface`, `container-low`, `container`, `container-high`… em vez de cinzas soltos | Material color |
| Escala de 12 degraus com função fixa | 1–2 fundo, 3–5 componente, 6–7 borda, 8 foco, 9 sólido, 11–12 texto | [Radix scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) |
| Texto nos degraus 11/12 sobre fundo 1–2 | Radix mira Lc 60 e Lc 90 (APCA) | Radix scale |
| Status por família | erro = vermelho, sucesso = verde, aviso = amarelo/âmbar, info = azul | [Radix composing](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette) |
| Uma cor só para foco | GOV.UK usa amarelo `#ffdd00` com texto escuro | [GOV.UK colour](https://design-system.service.gov.uk/styles/colour/) |
| Escuro é escala própria, não inversão | Mesmos papéis, valores próprios | [Apple HIG dark mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) |
| Não edite escalas prontas | Adicione a escala da marca ao lado | Radix composing |

## Spacing and grouping

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Tudo é múltiplo de uma unidade | Tailwind `0.25rem` (4 px); GOV.UK 5 px | [Tailwind theme](https://tailwindcss.com/docs/theme); [GOV.UK spacing](https://design-system.service.gov.uk/styles/spacing/) |
| Espaço responsivo | Degraus grandes encolhem no celular (GOV.UK: 25→15, 60→40) | GOV.UK spacing |
| Proximidade agrupa | Menos espaço dentro do grupo que entre grupos | [Apple HIG layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| Ordem por importância | O que mais importa vai ao topo e ao início; subordinado recuado | Apple HIG layout |
| Densidade só por padding e altura de linha | Nunca reduzindo o texto abaixo do mínimo | Apple HIG typography |

## Elevation, radius, icons

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Sombra de escala fixa | `shadow-xs … 2xl`; não invente sombra por componente | [Tailwind box-shadow](https://tailwindcss.com/docs/box-shadow) |
| No escuro, elevação é superfície mais clara | Sombra some em fundo escuro | Apple HIG dark mode |
| Raio só da escala | Canto interno = raio externo − folga | Tailwind theme |
| Ícone acompanha o texto | Mesmo peso e escala relativa ao texto; uma família só | [Apple SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols) |
| Ícone sem texto precisa de nome acessível | `aria-label` ou texto oculto | Apple HIG color (formas + rótulos) |

Composição (camadas, hierarquia, cor de destaque, diagnóstico de tela amadora): [VISUAL-DESIGN.md](VISUAL-DESIGN.md). Não verificados, então sem número aqui: valores em dp de cada nível de elevação, valores de raio e tamanhos da escala tipográfica do Material 3.

## Wrong vs right

❌ Errado: valores soltos que quebram a escala e o tema.

```tsx
<p className="text-[15px] leading-[19px] text-[#6b7280]">Last updated yesterday</p>
```

✅ Certo: papéis de texto e cor de tokens.

```tsx
<p className="text-sm text-muted-foreground">Last updated yesterday</p>
```

## Anti-patterns

- **Escala infinita:** cada tela com seus próprios 13, 15, 17 px.
- **Cinza mágico:** `#6b7280` colado onde cabe `muted-foreground`.
- **Escuro por inversão:** troca preto por branco e perde contraste.
- **Sombra decorativa:** profundidade sem hierarquia.

## Trade-offs

- Escala fechada custa liberdade: um tamanho "quase certo" vira pedido de novo token, o que mantém o sistema coeso.
- Escala de 12 degraus pede disciplina: use a função de cada degrau, não "o que parece bom".

## Checklist

- [ ] Todo tamanho, cor, espaço, raio e sombra vem de token
- [ ] Parágrafo com altura de linha ≥ 1,5 e medida ≤ 75 caracteres
- [ ] Cada fundo tem seu `on-` e passa nos contrastes ([ACCESSIBILITY.md](ACCESSIBILITY.md))
- [ ] Escuro tem valores próprios para os mesmos papéis
