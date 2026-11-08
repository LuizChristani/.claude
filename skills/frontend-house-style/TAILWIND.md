---
name: frontend-house-style-tailwind
description: How to write Tailwind CSS in the house style without writing it from memory — read the installed version, open the official page of every utility and directive before using it, and the v3-to-v4 changes that break silently (removed and renamed utilities, outline-none, ring, CSS-variable arbitrary values, variant order, CSS-first @theme config) and canonical classes (size-5 over h-5 w-5, checked with Tailwind's own canonicalizer). Use whenever writing or reviewing Tailwind classes, a styles file, the global CSS, theme tokens or Tailwind config.
type: reference
scope: frontend
tokens: ~1.5k
---

# Tailwind

> **TL;DR:** Classe do Tailwind não se escreve de memória. Leia a versão no `package.json`, abra a página oficial de cada utility, variante ou diretiva que você ainda não viu no projeto, escreva a forma canônica (`size-5`, não `h-5 w-5`) e rode o `check-style.mjs`, que barra as classes da v3 e as não canônicas num projeto na v4.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when (go to) |
| --- | --- |
| Escrever ou revisar classes, um `*.styles.ts`, o CSS global, tokens de tema | Escolher cor, espaço, tipografia → [frontend-design](../frontend-design/SKILL.md) |
| Mexer em `@theme`, `@utility`, `@custom-variant`, `@source` ou na config | Variantes de componente com `tv()` → [COMPONENTS-STYLING.md](COMPONENTS-STYLING.md#styles-files) |

## Core principle

**A memória do modelo mistura v3 e v4.** Metade dos exemplos que ele viu é da v3. Na v4, várias classes da v3 sumiram, trocaram de nome ou mudaram de efeito sem dar erro: a tela só fica errada.

## Procedure

1. Leia a versão: `tailwindcss` no `package.json` (e no da raiz, em monorepo). Toda decisão abaixo vale para essa versão.
2. Antes de usar uma utility, variante, diretiva ou função que não aparece em outro lugar do projeto, abra a página dela em https://tailwindcss.com/docs, achada pela busca do site. Confira o nome, a escala e o valor que ela gera.
3. Antes de criar um token, uma utility ou uma variante, leia o CSS global do projeto (`@theme`, `@utility`, `@custom-variant`): o projeto pode já ter.
4. Rode `node <skill-dir>/scripts/check-style.mjs src` na raiz do projeto; a regra `tailwind-v3` aponta classe da v3 num projeto na v4, e a `tailwind-canonical`, classe fora da forma canônica ([Canonical classes](#canonical-classes)).
5. Classe que a doc não confirma não entra. 404 ou página que não responde: avise o usuário ([OFFICIAL-DOCS.md](OFFICIAL-DOCS.md#urls-and-delegated-reads)).

## v3 → v4: what breaks silently

Fonte: https://tailwindcss.com/docs/upgrade-guide

| v3 (não use na v4) | v4 |
| --- | --- |
| `bg-opacity-*`, `text-opacity-*`, `border-opacity-*`, `divide-opacity-*`, `ring-opacity-*`, `placeholder-opacity-*` | Modificador de opacidade: `bg-black/50` |
| `flex-shrink-*`, `flex-grow-*` | `shrink-*`, `grow-*` |
| `overflow-ellipsis` | `text-ellipsis` |
| `decoration-slice`, `decoration-clone` | `box-decoration-slice`, `box-decoration-clone` |
| `outline-none` para esconder o contorno no foco | `outline-hidden`; na v4 `outline-none` tira o contorno de verdade, inclusive no modo de alto contraste |
| `shadow-sm`, `shadow` | `shadow-xs`, `shadow-sm` (a escala andou um passo; o mesmo vale para `drop-shadow`, `blur`, `backdrop-blur` e `rounded`) |
| `ring` (3px, azul) | `ring-3`; o `ring` da v4 tem 1px e usa `currentColor` |
| `bg-[--brand]` | `bg-(--brand)` |
| `grid-cols-[max-content,auto]` | `grid-cols-[max-content_auto]` |
| `!flex` | `flex!` |
| `first:*:pt-0` (variantes da direita para a esquerda) | `*:first:pt-0` (da esquerda para a direita) |
| `theme(colors.red.500)` | `var(--color-red-500)` |
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` |
| `@layer utilities { .x {…} }` | `@utility x {…}` |
| `tailwind.config.js` lido automaticamente | Tokens em `@theme` no CSS; JS só com `@config` explícito |

Também mudou na v4: a borda padrão usa `currentColor` (era `gray-200`), o placeholder usa a cor do texto a 50%, o `<button>` tem `cursor: default`, `hover:` só vale em `@media (hover: hover)`, e `space-*`/`divide-*` passaram a usar `:not(:last-child)`.

## Canonical classes

Toda classe vai na **forma canônica**: a mais curta que gera o mesmo CSS, a que o próprio Tailwind sugere. O canonicalizador vem no pacote `tailwindcss` (desde a 4.1.15, com regras novas a cada versão) e só troca uma classe por outra que gera CSS igual, com os tokens do `@theme` do projeto.

| ❌ Não canônica | ✅ Canônica |
| --- | --- |
| `h-5 w-5`, `h-full w-full` | `size-5`, `size-full` |
| `pr-4 pl-4`, `pt-2 pb-2`, `px-5 py-5` | `px-4`, `py-2`, `p-5` |
| `sm:px-6 sm:py-6` | `sm:p-6` |
| `-translate-x-1/2 -translate-y-1/2` | `-translate-1/2` |
| `text-sm leading-snug` | `text-sm/snug` |
| `bg-[#fff]`, `bg-white/[0.05]`, `tracking-[0.1em]` | `bg-white`, `bg-white/5`, `tracking-widest` |
| `text-[var(--brand)]`, `[color:red]/100` | `text-(--brand)`, `text-[red]` |
| `data-[highlighted]:bg-x` | `data-highlighted:bg-x` |
| `[@media(prefers-color-scheme:dark)]:text-gray-400` | `dark:text-gray-400`, só se o projeto não redefiniu `dark` com `@custom-variant` |

❌ Errado: a classe longa compila, mas duplica o que a escala já tem e esconde o token.

```tsx
<span className="h-5 w-5 rounded-full bg-[#fff] pr-4 pl-4" />
```

✅ Certo: a forma que o `tailwindcss canonicalize` devolve.

```tsx
<span className="size-5 rounded-full bg-white px-4" />
```

Como conferir:

| Onde | Como |
| --- | --- |
| `check-style.mjs` | A regra `tailwind-canonical` carrega o CSS global do projeto com o `@tailwindcss/node` e roda o canonicalizador do Tailwind instalado em cada string do arquivo; o hook roda nas linhas alteradas |
| Terminal (`@tailwindcss/cli`) | `tailwindcss canonicalize --css src/styles/global.css "h-5 w-5 pr-4 pl-4"` imprime `size-5 px-4`; `--format json` mostra `input`, `output` e `changed`; `--stream` lê um grupo por linha do stdin. Só imprime, não reescreve arquivo |
| VS Code (Tailwind CSS IntelliSense 0.14.28+) | `tailwindCSS.lint.suggestCanonicalClasses` (padrão `warning`); a 0.14.29+ também troca `px` por `rem` usando o `tailwindCSS.rootFontSize` |

Fonte: https://github.com/tailwindlabs/tailwindcss/blob/main/CHANGELOG.md (4.1.15, 4.1.18, 4.2.2), https://github.com/tailwindlabs/tailwindcss/tree/main/packages/%40tailwindcss-cli/src/commands/canonicalize e https://github.com/tailwindlabs/tailwindcss-intellisense/blob/main/packages/vscode-tailwindcss/README.md

- O `tailwindcss canonicalize` não tem página em tailwindcss.com/docs: o uso acima vem do código-fonte da CLI.
- Valor arbitrário em `px` (`mt-[16px]`) só vira `mt-4` no IntelliSense, que converte pelo `rootFontSize`; a CLI e o `check-style.mjs` não fazem essa troca.

**🔧 Stack note:** o `check-style.mjs` usa `__unstable__loadDesignSystem`, API interna do Tailwind. Se uma atualização quebrar a chamada, a regra é pulada com um aviso no stderr (`tailwind-canonical skipped`); confira a CLI ou o IntelliSense até a checagem ser ajustada. Projeto na v3 não tem canonicalizador.

## Directives (v4)

Fonte: https://tailwindcss.com/docs/functions-and-directives

| Diretiva | Para |
| --- | --- |
| `@import "tailwindcss"` | Carregar o Tailwind |
| `@theme` | Tokens do projeto (cores, fontes, breakpoints) |
| `@utility` | Utility própria que aceita variantes |
| `@custom-variant` | Variante própria (`@custom-variant theme-midnight (&:where([data-theme="midnight"] *));`) |
| `@source` | Pasta que a detecção automática não acha |
| `@reference` | Usar `@apply` em CSS module ou `<style>` sem duplicar o CSS |
| `@config`, `@plugin` | Só compatibilidade com config e plugin em JS |

## NativeWind sizes

🔧 **Stack note:** React Native com NativeWind.

No NativeWind o `rem` vale 14 no aparelho, não 16: `size-32` dá 112, `size-10` dá 35. Nunca converta classe do Tailwind em pixel na mão para calcular outra medida (largura que "sobra", deslocamento, área de toque).

Pela mesma razão, a escala da web fica miúda no celular: em lista, ajustes e cards, texto de leitura começa em `text-base` (valor e ação em `text-lg`), rótulo e nota em `text-base`, título de seção em `text-sm`, e ícone de linha num quadrado `size-12`; `text-xs` só para selo e contagem.

| ❌ Errado | ✅ Certo |
| --- | --- |
| `const OPEN_WIDTH = 128 - 8 - 40` "porque a foto é `size-32`" | Medir com `onLayout` a peça de referência e derivar a medida em tempo de execução |
| Somar classes para posicionar um elemento absoluto | Deixar o layout resolver (`inset-x-1`, `flex-1`, `justify-between`) |
| `bottom: insets.bottom + 88` "para ficar acima da barra flutuante" (supõe `min-h-14` = 56 e reserva o espaço mesmo sem a barra) | Os flutuantes do mesmo canto num só contêiner absoluto em coluna (`absolute inset-x-4 gap-3`); quem aparece e some empurra os outros sozinho |

## Anti-patterns

- **Tailwind de memória:** classe digitada sem checar a página; na v4 ela compila e faz outra coisa.
- **Config fantasma:** editar `tailwind.config.js` num projeto v4 que não tem `@config`; nada muda.
- **Token duplicado:** criar `--color-x` no componente quando o `@theme` já tem o papel.
- **Classe por extenso:** `h-5 w-5`, `pl-4 pr-4`, `bg-[#fff]` quando a forma canônica (`size-5`, `px-4`, `bg-white`) gera o mesmo CSS.
- **Classe montada por concatenação:** `` `bg-${color}-500` `` não é gerada ([COMPONENTS-STYLING.md](COMPONENTS-STYLING.md#styles-files)).

## Trade-offs

| Escolha | Custo | Quando o simples vence |
| --- | --- | --- |
| `tailwind-canonical` no `check-style.mjs` | Carregar o Tailwind do projeto soma de 3 a 7 s por execução (a primeira chamada do canonicalizador monta um cache) | Projeto na v3 ou sem `@tailwindcss/node`: a regra é pulada e vale a conferência no IntelliSense |
| Forma canônica de `text-* leading-*` (`text-sm/snug`) | Quem lê precisa conhecer o modificador de line-height | Nunca: é a forma que o Tailwind sugere; o `.claude/` do projeto pode abrir exceção |

## Checklist

- [ ] Versão do `tailwindcss` lida no `package.json`
- [ ] Toda utility nova no projeto conferida na página oficial
- [ ] Nenhuma classe da tabela v3 → v4 (`check-style.mjs` sem `tailwind-v3`)
- [ ] Toda classe na forma canônica (`check-style.mjs` sem `tailwind-canonical`)
- [ ] Token, utility e variante novos foram para o CSS global (`@theme`, `@utility`, `@custom-variant`)

## See also

- [OFFICIAL-DOCS.md](OFFICIAL-DOCS.md) — onde conferir cada lib
- [COMPONENTS-STYLING.md](COMPONENTS-STYLING.md) — tokens, `tv()`, `cn()`
