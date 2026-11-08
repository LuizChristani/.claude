---
name: frontend-project-setup-scaffold
description: The build order for a new React frontend after the plan is approved — each step with the official doc page to check first, what to configure per frontend-house-style, and how to verify it — ending in a walking skeleton of the main journey. Use in phases 5–7 of frontend-project-setup.
type: reference
scope: frontend
tokens: ~2k
---

# Scaffold

> **TL;DR:** Um passo por vez, na ordem abaixo. Em cada passo: abra a página da doc oficial, aplique o que a [[frontend-house-style]] pede, verifique e só então siga. Nenhum comando ou versão de memória.

## Plan first

Antes do primeiro comando, escreva o plano completo de [PLAN.md](PLAN.md) em `docs/PLAN.md` do projeto novo e mande no chat só o resumo e o caminho: os desenhos de como o projeto vai ficar e os passos abaixo com as escolhas do grill aplicadas, o nome do projeto, a pasta onde ele vai ser criado e as libs que serão instaladas. Siga só depois do "pode seguir".

## Build order

A tabela usa a recomendação da casa como exemplo. Em cada passo, use a **lib que o usuário escolheu no grill** e a doc oficial **dela**; o que a coluna "Aplique" pede (princípio da [[frontend-house-style]]) vale para qualquer lib. Passo de uma lib que o usuário recusou (ex.: sem estado global) sai do plano.

| # | Passo | Confira antes | Aplique (frontend-house-style) | Verifique |
| --- | --- | --- | --- | --- |
| 1 | Criar o app Vite com React + TypeScript | https://vite.dev/guide/ | Gerenciador de pacotes e nome decididos no grill (S1) | `npm run dev` abre a página inicial |
| 2 | Higiene do repositório | [Repository hygiene](#repository-hygiene) | `git init` (perguntado), `.gitignore`, `.env.example`, versão do Node fixada, lockfile, `README.md` | Itens da seção conferidos |
| 3 | TypeScript estrito e alias `@/` | https://www.typescriptlang.org/tsconfig | `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `@/* → ./src/*` (TESTING-TOOLING.md) | `npx tsc --noEmit` limpo |
| 4 | React Compiler | https://react.dev/learn/react-compiler/installation | Ligado, salvo decisão contrária no grill (PERFORMANCE.md) | Build passa; badge "Memo ✨" no React DevTools |
| 5 | Tailwind CSS | https://tailwindcss.com/docs/installation/using-vite | `styles/tokens.css` + `styles/global.css` | Uma classe utilitária aplica |
| 6 | Tokens do design system | As referências do intake | Variáveis CSS semânticas, claro e escuro se decidido; provisórios marcados (COMPONENTS-STYLING.md → Tokens) | Cores, fonte e raio iguais às referências |
| 7 | `cn` e `tv` | https://www.tailwind-variants.org (ou https://cva.style) | `lib/cn.ts` com `extendTailwindMerge` conhecendo os tokens próprios | Teste de merge de classe customizada |
| 8 | Prettier | https://prettier.io/docs | Config da casa com os plugins de ordenar imports e classes (TESTING-TOOLING.md) | `npm run format:check` limpo |
| 9 | oxlint | https://oxc.rs/docs/guide/usage/linter | Regras da casa, inclusive `no-restricted-imports` para `../../` | `npm run lint` limpo |
| 10 | Vitest e cobertura | https://vitest.dev | Testes em `tests/`, cobertura 100% em `lib/**`, `pages/**/lib/**`, `store/slice/**` | `npm run test:coverage` verde |
| 11 | `check-style.mjs` | — | Copiar `scripts/check-style.mjs` da [[frontend-house-style]] para `scripts/`; script `check:style` | `npm run check:style` limpo |
| 12 | lefthook | https://github.com/evilmartians/lefthook | Pre-commit: oxlint `--deny-warnings`, prettier, `tsc --noEmit`, `check:style` | Hook roda num commit de teste (sem commitar de verdade sem o usuário pedir) |
| 13 | Pastas | A fonte da estrutura escolhida (STRUCTURE.md) | A árvore escolhida em E1; a regra de import dela no lint | Árvore igual à do ADR; lint barra um import proibido de teste |
| 14 | Ambiente | https://vite.dev/guide/env-and-mode | `config/env.ts` lê e valida `import.meta.env` com zod; `config/featureFlags.ts`; toda variável também no `.env.example` | App falha com mensagem clara sem a variável |
| 15 | Store e API | https://redux.js.org/toolkit/ | `store.ts`, hooks tipados, uma `api` com `injectEndpoints`, `baseQuery` próprio (STATE-DATA.md); endpoints e schemas da v1 a partir do mapa de [BACKEND.md](BACKEND.md), com a fonte no JSDoc | Teste do `baseQuery` com fetch falso; fixtures passam nos schemas |
| 16 | Rotas e layout | https://reactrouter.com | ROUTING.md: tabela única, layout com `<Outlet />`, **um error boundary só, na raiz, para a aplicação inteira**, rota `*` de 404, `PATHS` tipados, `lazy` com `loadWithRetry`, `<ScrollRestoration />` | Navegar entre rotas; rota inexistente mostra o 404; erro forçado numa tela cai no boundary da raiz |
| 17 | Autenticação | [AUTH.md](AUTH.md) e a doc do provedor escolhido em P4 | Sessão, guard de rota, login, 401 e logout como em AUTH.md | Os cenários de verificação de AUTH.md |
| 18 | Base de UI | Doc da lib headless escolhida | `Button` composto, `LoadingScope`, `AsyncState`, `EmptyState`, `ErrorState` (ASYNC-UI.md); primitivos da lib headless só quando o esqueleto precisar | Testes de HTML renderizado |
| 19 | Libs escolhidas restantes | A doc oficial de cada uma | [Chosen libs](#chosen-libs): uma lib por vez | Cada lib provada por um uso real |
| 20 | Esqueleto | — | A primeira tela da jornada principal, com dados reais ou simulados atrás da mesma interface | Abre, carrega com skeleton, mostra vazio, erro e conteúdo |

## Repository hygiene

| Item | Confira antes | Regra |
| --- | --- | --- |
| `git init` | — | **Pergunte** antes; o repositório pode já existir ou ser criado em outro lugar. Nada de commit ou remoto sem o usuário pedir |
| `.gitignore` | https://git-scm.com/docs/gitignore | `node_modules`, saídas de build, cobertura, `.env*` com exceção do `.env.example`, arquivos de editor e de sistema |
| `.env.example` | https://vite.dev/guide/env-and-mode | Toda variável que `config/env.ts` lê, com valor de exemplo ou vazio e uma linha dizendo para que serve; nunca segredo real |
| Versão do Node | https://nodejs.org/en/about/previous-releases | A versão LTS ativa no dia, fixada em `.nvmrc` e em `engines` do `package.json` (https://docs.npmjs.com/cli/configuring-npm/package-json) |
| Lockfile | Doc do gerenciador escolhido (S1) | Versionado; instalação no CI e por outras pessoas com o comando de instalação limpa do gerenciador |
| `README.md` | — | O que o app é, como rodar, as variáveis de ambiente e os scripts; aponta para `CLAUDE.md`, `CONTEXT.md` e `docs/` |
| Segredos | — | Nenhuma chave, token ou senha em arquivo versionado; o que vai no bundle do navegador (`VITE_*`) é público por definição |

## Chosen libs

Para cada lib escolhida no grill que não tem passo próprio na tabela: leia a página de instalação e de uso da doc oficial **dela**, instale, configure seguindo o princípio da [[frontend-house-style]] e prove com um uso real.

| Escolha | Onde encaixa | Prova |
| --- | --- | --- |
| Formulários (S14) | Biblioteca ou padrão escolhido, com o schema de validação (S13) e erros por campo | O formulário que a jornada principal tiver, ou um teste do schema |
| i18n (S16) | Provider no `main.tsx`; textos da tela do esqueleto pelas chaves; datas e números pelo locale | A tela do esqueleto em dois idiomas |
| E2E (S20) | Pasta de testes E2E separada dos unitários | Um teste da jornada principal até a tela do esqueleto |
| Monitoramento (S25) | Iniciado no `main.tsx`, com DSN ou chave em `config/env.ts`; o error boundary da raiz reporta; dados pessoais removidos antes do envio; amostragem em produção | Um erro forçado aparece no painel da ferramenta (ambiente de desenvolvimento) |
| Catálogo de componentes (S26) | A ferramenta, o conteúdo e os estados que o usuário definiu em S26; nada além disso | O catálogo abre e mostra os componentes e estados combinados |
| Libs do negócio (S24) | Atrás de um componente ou adaptador do projeto; telas não importam a lib direto | Um uso real no esqueleto, ou o passo seguinte da jornada |

- Uma lib por vez: instala, configura, verifica, e só depois a próxima.
- Lib que ninguém usa ainda não entra: se o esqueleto não precisa dela, ela fica para a feature que precisar, anotada nos próximos passos.

## Walking skeleton

- Uma tela só, da jornada principal, passando por **todas** as camadas: rota → página → hook → store/API → componentes com tokens reais.
- Com os quatro estados da [[frontend-house-style]] → ASYNC-UI.md funcionando: carregando, erro com tentar de novo, vazio e conteúdo.
- Com o glossário do `CONTEXT.md` nos nomes de tipos, componentes e rotas.
- Com testes: as funções puras a 100% e a tela pelo HTML renderizado.

## Definition of done

| Gate | Comando |
| --- | --- |
| Lint | `npm run lint` |
| Tipos | `npm run typecheck` |
| Testes e cobertura | `npm run test:coverage` |
| Estilo da casa | `npm run check:style` |
| Build | `npm run build` |
| App abre | `npm run dev` e a tela do esqueleto renderiza |

## Final report

Ao terminar, entregue ao usuário:

- O que foi criado, por passo, e onde, comparado com os desenhos aprovados no plano.
- As decisões tomadas e os ADRs escritos.
- Os tokens provisórios e o que falta de referência.
- O que ficou simulado (API, autenticação) e como trocar pelo real.
- Os próximos passos sugeridos (próximas telas da jornada, na ordem).
