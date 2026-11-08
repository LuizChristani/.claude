---
name: frontend-house-style
description: The user's house style for any React + TypeScript application — pure logic in lib/ with no React, hooks as the only bridge, pages that only render, compound components with variants in a styles file, semantic design tokens, store modules with one file per role and past-tense event names, a single server-cache client, const-then-return, JSDoc of at most 2 lines as the only comment, 100% coverage on pure code. Use when creating, scaffolding or reviewing code in any React project (page, component, hook, store, API endpoint, test), deciding where a file goes, or when the user asks for "o meu padrão", "do jeito que eu gosto" or "house style".
type: skill
scope: frontend
tokens: ~2k (references ~6k on demand)
---

# Frontend house style (React)

> **TL;DR:** Regra de negócio é função pura em `lib/`, sem React, testada a 100%. Hooks ligam essa lógica à tela, e as páginas só desenham. Exports nomeados com `function`, valor calculado numa `const` antes do `return`, e o único comentário é JSDoc de até 2 linhas.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when (go to) |
| --- | --- |
| Criar, estruturar ou revisar código em qualquer projeto React | Criar um frontend do zero → [[frontend-project-setup]] |
| Decidir em que pasta um arquivo entra | Backend ou integração entre serviços (fora do escopo desta skill) |
| Revisar um diff pelo estilo | — |

## Core principle

**A regra não depende da tela.** Toda decisão (cálculo, validação, fluxo) é uma função pura ou uma máquina de estados em `lib/`, testável sem renderizar nada. O React só liga essa lógica à interface.

## Default stack

| Necessidade | Padrão da casa (projeto novo) | Projeto que já usa outra lib |
| --- | --- | --- |
| Estado global | Redux Toolkit | Zustand, Jotai, Context: mesmas regras de [STATE-DATA.md](STATE-DATA.md) |
| Cache do servidor | RTK Query | TanStack Query: mesmas regras (um cliente, retry só em leitura) |
| Estilo | Tailwind + `tailwind-variants` | CVA, CSS Modules: variantes num arquivo `*.styles` ao lado do componente |
| Widgets interativos | Lib headless escolhida com o usuário | Radix, Base UI ou React Aria: a que o projeto já usa |
| Fluxo complexo (3+ fases assíncronas) | Escolha do projeto | XState ou máquina própria em `lib/`: a que o projeto já usa |
| Validação | zod | valibot, yup: schema na fronteira |
| Formulários | Escolha do projeto; validação com zod em projeto novo, sempre confirmada com o usuário | `useState` + schema, `<form action>` + `useActionState`, React Hook Form, TanStack Form: o que o projeto registrou no `CLAUDE.md` dele |
| Testes | Vitest | Jest: mesmas regras |
| Lint e formatação | oxlint + Prettier + lefthook | ESLint, Biome: as mesmas regras ativas |

Nunca adicione uma segunda lib para uma necessidade que o projeto já resolve. Onde a casa aceita mais de uma opção (variantes com `tv()` ou CVA; fluxo complexo com XState ou máquina própria; formulários), **vale a escolha do projeto**: o que ele já usa ou o que o `.claude/` dele documenta. Projeto novo sem decisão: pergunte ao usuário.

## Procedure

1. Leia o `package.json` e mapeie a stack do projeto pela tabela acima.
2. **Antes de usar qualquer API de framework ou biblioteca, consulte a documentação oficial** da versão instalada ([OFFICIAL-DOCS.md](OFFICIAL-DOCS.md)). Nunca escreva uma API de memória.
3. Decida a camada e a pasta por [ARCHITECTURE.md](ARCHITECTURE.md). **Antes de criar um componente, procure na aplicação um que já sirva** ([COMPONENTS-STYLING.md](COMPONENTS-STYLING.md#reuse-before-creating)).
4. Escreva seguindo as regras abaixo. Detalhes: [CODE-STYLE.md](CODE-STYLE.md), [COMPONENTS-STYLING.md](COMPONENTS-STYLING.md), [STATE-DATA.md](STATE-DATA.md), [TESTING-TOOLING.md](TESTING-TOOLING.md), [PERFORMANCE.md](PERFORMANCE.md), [EFFECTS.md](EFFECTS.md), [ASYNC-UI.md](ASYNC-UI.md), [RULES-OF-REACT.md](RULES-OF-REACT.md), [ROUTING.md](ROUTING.md), [SECURITY.md](SECURITY.md), [TAILWIND.md](TAILWIND.md).
5. Rode `node <this-skill-dir>/scripts/check-style.mjs src`, o lint, o typecheck e os testes. Corrija o que apontarem **nos arquivos que você tocou**. Rode o `check-style.mjs` à mão nos arquivos tocados antes de dar a tarefa por pronta, **mesmo com o hook calado**: hook em silêncio não prova nada (ele não vê edição feita por shell e pode nem rodar num pacote de monorepo).
6. Se a aplicação tiver o próprio `.claude/` (ou `CLAUDE.md`/`AGENTS.md`, docs de padrões) e uma regra de lá chocar com esta skill, **vale sempre a da aplicação**. Siga-a e avise o usuário do choque.
7. Quando o usuário corrigir código que você escreveu: registre a correção no arquivo de memória de correções que o `CLAUDE.md` do workspace indica **e** atualize, no mesmo turno, o arquivo desta skill que cobre o assunto (regra, exemplo, anti-pattern e, se der, o `check-style.mjs`). Correção específica de uma aplicação vai para o `.claude/` dela. A skill nunca fica atrás da última correção. Para escrever ou editar qualquer skill, siga [AUTHORING.md](AUTHORING.md).

## Non-negotiables

| # | Regra | ❌ Violação típica |
| --- | --- | --- |
| 1 | `lib/` não importa React nem o store | Função de `lib/` chamando `useSelector` |
| 2 | Páginas só desenham e repassam eventos; a regra vai para `lib/` ou para um hook | `if` de regra de negócio no JSX |
| 3 | Exports nomeados com `function`; `export default` só onde o framework exige | `export const UserCard = () => …` |
| 4 | Valor calculado → `const` com nome → `return` da `const` | `return users.filter(…)` |
| 5 | Só JSDoc, em inglês, ≤ 2 linhas, em todo export; zero `//` e `{/* */}`, exceto a linha que explica um `useEffect` mantido; **nenhum JSDoc em campo de `interface` ou `type`** (props ou dado): o nome do campo se explica sozinho ([CODE-STYLE.md](CODE-STYLE.md#typing-props-and-data)) | Comentário narrando o passo; `/** … */` em cima de uma prop ou de um campo de dado |
| 6 | Zero `any` e `@ts-*`; `unknown` + type guard | `as any` para calar o compilador |
| 7 | Imports em grupos por papel, nessa ordem e com linha em branco entre eles: React → outros pacotes → componentes → hooks → estado → `lib`/`config` → tipos → relativos → estilos ([CODE-STYLE.md](CODE-STYLE.md#imports)); `@/` para subir mais de um nível, `../` no máximo uma vez | `from '../../lib/x'`, ou `@/lib/money` misturado com os pacotes |
| 8 | Dado vindo de fora do app é validado por schema na fronteira | Confiar no `JSON.parse` |
| 9 | Código, JSDoc, testes e commits em inglês; texto de tela no idioma do produto | Variável `nomeCompleto` |
| 10 | Commits no formato Conventional Commits | `ajustes` |
| 11 | Objeto com o formato das props → spread (`<User {...user} />`), tipado com o tipo das props | `<User id={user.id} name={user.name} … />` |
| 12 | Sem otimização prematura: `useMemo`, `useCallback`, `memo`, virtualização e debounce só com medição ou regra de [PERFORMANCE.md](PERFORMANCE.md) | `useCallback` em todo handler "por precaução" |
| 13 | JSX nunca vai para uma variável, **nem um elemento só de componente**, nem vira bloco de marcação dentro de uma prop: pedaço de tela com nome vira componente; o mesmo componente em dois lugares é escrito nos dois com um objeto de props (`<UserActions {...actions} />`); layout de desktop e de celular é um componente cada ([No JSX in variables](COMPONENTS-STYLING.md#no-jsx-in-variables), [No markup in props](COMPONENTS-STYLING.md#no-markup-in-props)); conta vem de uma função de `lib/` | `const totals = (<div>…</div>)`, `const actions = (<UserActions … />)` usado em dois layouts, `action={a && !b && (<button …>…</button>)}` ou `total={price * qty}` |
| 14 | **`useEffect` só onde é necessário de verdade**: o padrão é nenhum efeito; ele só fica para sincronizar com um sistema fora do React e depois de passar no [Necessity test](EFFECTS.md#necessity-test). O comentário de uma linha nomeia esse sistema e não torna o efeito necessário; decisão em aberto vira pergunta ao usuário, nunca comentário | `useEffect(() => setTotal(f(items)), [items])`, ou efeito mantido com `// decision pending` |
| 15 | Tela com dados passa por `AsyncState`; cada componente desenha o próprio skeleton ([ASYNC-UI.md](ASYNC-UI.md)) | `{isLoading ? <ListSkeleton /> : <List />}` na tela |
| 16 | Função ≤ ~50 linhas e 3 níveis de indentação; componente ≤ ~200 linhas e 5 props; drilling ≤ 2 níveis | Componente de 400 linhas com 12 props |
| 17 | **Nunca `switch`**: mapa tipado com `satisfies Record<Union, T>` ou `if` com early return | `switch (status) { case … }` |
| 18 | Toda API de framework ou lib é conferida na documentação oficial da versão do `package.json` antes de ser usada; a URL lida é de site ou repositório oficial, e um 404 é avisado ao usuário, nunca preenchido de memória ([OFFICIAL-DOCS.md](OFFICIAL-DOCS.md#urls-and-delegated-reads)) | API escrita de memória, ou 404 de doc coberto de memória |
| 19 | **Um componente por arquivo**: nunca declarar componente dentro de outro, nem dois no mesmo arquivo; skeleton, parte e item de lista ganham arquivo próprio | `function UserRow()` dentro de `UserList.tsx` |
| 20 | Dialog, menu, select, combobox, popover e tooltip sobre lib headless embrulhada num componente do projeto; nunca do zero | Modal feito à mão com `div` e `onKeyDown` |
| 21 | As regras do React são lei: render puro, componente só em JSX, hook no topo, `key` do dado, `ref` fora do render ([RULES-OF-REACT.md](RULES-OF-REACT.md)) | `key={index}` numa lista que muda |
| 22 | Rotas numa tabela só, caminhos por funções tipadas, params validados ao ler ([ROUTING.md](ROUTING.md)) | `` <Link to={`/users/${id}`}> `` espalhado |
| 23 | Segurança: sem HTML cru, sem segredo no bundle, sessão em cookie `HttpOnly` por padrão, redirect só interno, sem dado pessoal em log ([SECURITY.md](SECURITY.md)) | `dangerouslySetInnerHTML` com HTML da API |
| 24 | **Um hook, uma responsabilidade**: nada de `use<Tela>Page` que junta dados, diálogos e handlers; retorno até 6 valores, sem lambda no `return`, sem saco `page.x` ([ARCHITECTURE.md](ARCHITECTURE.md#hooks-one-responsibility)) | `useTasksPage` devolvendo 25 campos |
| 25 | **Sem magic string**: valor de união de strings do app (estado, status, evento, modo) é declarado como literal no tipo e usado pelo código através de um objeto `as const` em `SCREAMING_CASE` com `satisfies Record<string, Tipo>`; nunca `typeof OBJETO.Chave` no tipo; dois ou mais valores no mesmo teste viram predicado com nome ([CODE-STYLE.md](CODE-STYLE.md#no-magic-strings)) | `state.kind === 'confirming' \|\| state.kind === 'linking'` |
| 26 | **Reusar antes de criar**: antes de um componente novo, procure na aplicação um que já sirva; se faltar visual, variante; se faltar peça, composição; criar é o último passo, avisando o que foi olhado ([COMPONENTS-STYLING.md](COMPONENTS-STYLING.md#reuse-before-creating)) | `ConfirmModal` feito do zero num app que já tem `Dialog` |
| 27 | **Tailwind nunca de memória**: leia a versão do `tailwindcss` no `package.json` e abra a página oficial de toda utility, variante ou diretiva nova no projeto; na v4, nada de classe da v3 e toda classe na forma canônica do `tailwindcss canonicalize` ([TAILWIND.md](TAILWIND.md#canonical-classes)) | `focus:outline-none`, `bg-opacity-50`, `flex-shrink-0` ou `bg-[--brand]` num projeto na v4; `h-5 w-5`, `pl-4 pr-4`, `bg-[#fff]` no lugar de `size-5`, `px-4`, `bg-white` |
| 28 | **HTTP numa pasta própria**: o que fala com a rede (requisição, stream, URL, autenticação, parse da resposta) mora em `lib/http/`, e o hook que chama a API mora em `hooks/http/`; regra e hook de UI ficam fora ([ARCHITECTURE.md](ARCHITECTURE.md#http-in-its-own-folder)) | `usersClient.ts` e `parseInvoice.ts` ao lado de `invoiceTotal.ts`; `useInvoices` (query) ao lado de `useDisclosure` |

## Anti-patterns

- **Lógica na tela:** a regra só se testa renderizando. Mova-a para `lib/` e teste lá.
- **Retorno anônimo:** `return a ? b(c) : d;`. O nome da `const` documenta o valor e dá onde pôr o breakpoint.
- **Comentário-narrador:** `// increments the counter`. Se o "porquê" importa, ele vai para o JSDoc ou para `docs/`.
- **Gaveta `utils.ts`:** helpers sem relação no mesmo arquivo. Crie um módulo por assunto (`formatDate.ts`, `slugify.ts`).

## Trade-offs

- A `const` antes do `return` custa uma linha. Arrow de corpo curto (`(user) => user.id`) continua liberada.
- 100% de cobertura vale só para o código puro. Hooks de cola são excluídos **nominalmente** no config, nunca com comentário de ignore.
- JSDoc de 2 linhas não comporta explicação longa: ela vai para `docs/`.

## Checklist

- [ ] Cada arquivo está na camada certa; nenhum import contra a direção das camadas
- [ ] `check-style.mjs`, lint (warnings contam como erro), typecheck e testes verdes
- [ ] Toda regra nova em `lib/` tem teste; cobertura do código puro em 100%
- [ ] Commit no formato `type(scope): summary`, em inglês

## See also

- [frontend-design](../frontend-design/SKILL.md) — regras de design (cor, texto, espaço, estados, formulários, acessibilidade) com fonte oficial
- [request-reading](../request-reading/SKILL.md) — quando o pedido é de análise e não de mudança
