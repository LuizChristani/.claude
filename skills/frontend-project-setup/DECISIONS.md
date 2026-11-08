---
name: frontend-project-setup-decisions
description: The decision tree to grill the user with, one question at a time, in every new frontend setup — product decisions plus every library and tool choice, each asked explicitly with a recommendation, never assumed from the house stack, the references or the project type. Use in phase 3 of frontend-project-setup.
type: reference
scope: frontend
tokens: ~2k
---

# Decisions

> **TL;DR:** Em **todo** setup, de qualquer projeto, pergunte **cada** decisão abaixo, inclusive cada biblioteca e ferramenta. O stack da [[frontend-house-style]] e as referências só servem para a sua recomendação; nunca para pular a pergunta.

## How to grill

- Interrogue sem parar até ter entendimento compartilhado: percorra cada ramo da árvore abaixo, resolvendo as dependências entre as decisões uma por uma.
- Uma pergunta por mensagem: a pergunta, as opções principais, a sua recomendação e o motivo em uma linha. Espere a resposta antes da próxima.
- Se a resposta pode ser achada explorando código (projetos locais, backend, projeto de referência), explore em vez de perguntar.
- Responda no idioma do usuário; código e identificadores em inglês.
- **Nenhuma escolha entra por padrão.** Nem a da casa, nem a que a referência sugere, nem a que "todo projeto desse tipo usa". Sempre pergunte e espere a resposta.
- O que os projetos já clonados na máquina usam também entra na recomendação ([STRUCTURE.md](STRUCTURE.md) → Scan local projects), sempre como pergunta.
- Referência ou doc oficial que já indicam uma escolha viram a recomendação ("o design system de vocês é feito sobre Radix, então recomendo Radix"), mas a pergunta continua.
- Só o usuário pode dispensar perguntas, e só dizendo isso de forma explícita (ex.: "pode seguir com as suas recomendações no resto"). Registre quais foram dispensadas.
- Quando um termo do domínio se resolve, anote para o `CONTEXT.md`.
- Escolha diferente da casa é válida: os princípios da [[frontend-house-style]] passam a valer para a lib escolhida (camadas, estilo de código, testes).

## 1. Product decisions

| # | Decisão | Pergunta | ADR? |
| --- | --- | --- | --- |
| P0 | Projeto de referência | Existe um frontend que serve de referência? Qual, e o que tirar dele (estrutura, componentes, visual, fluxos, uso da API)? ([STRUCTURE.md](STRUCTURE.md) → Reference project) | Não |
| P1 | Renderização | SPA, ou precisa de SEO, página pública indexável ou render no servidor (SSR, SSG)? | Sim |
| P2 | Plataforma | Web no navegador, PWA, desktop ou dentro de um app mobile? Quais telas e navegadores? | Sim |
| P3 | Telas e rotas | Quais telas na v1, quais exigem login, qual é a inicial? | Não |
| P4 | Autenticação | **Primeiro: segue a autenticação de algum projeto existente? Qual?** Se não: quem autentica, padrão (RFC 10017), onde fica a sessão, renovação, expiração, permissões, logout ([AUTH.md](AUTH.md)) | Sim |
| P5 | Backend e contrato | **Vai usar um backend pronto? Qual** (repositório clonado na máquina, API publicada, serviço de terceiro) ou ele ainda não existe? De onde vêm os payloads? Protocolo, autenticação, URL por ambiente, geração de tipos ([BACKEND.md](BACKEND.md)) | Sim |
| P6 | Idioma, moeda, datas | Um idioma ou vários? Qual moeda, fuso e formato de data? | Sim, se vários idiomas |
| P7 | Acessibilidade | Qual nível (WCAG AA ou mais)? Algum público ou contrato exige mais? | Não |
| P8 | Tema | Claro, escuro, os dois? Tema por cliente (white-label)? | Sim, se white-label |
| P9 | Feature flags | Vai ter rollout gradual ou ambientes com features diferentes? | Não |
| P10 | Ambientes e deploy | Onde roda, quais ambientes, CI em qual serviço? | Sim |
| P11 | Repositório | Onde fica, nome do pacote, quem mais mexe? | Não |

## 2. Structure

| # | Decisão | Pergunta | ADR? |
| --- | --- | --- | --- |
| E1 | Estrutura do frontend | Sempre com **3 ou 4 opções**, montadas a partir dos projetos já clonados na máquina e do catálogo de [STRUCTURE.md](STRUCTURE.md), cada uma com a árvore das features reais do projeto | Sim |

## 3. Stack decisions

Pergunte uma por uma. A coluna "Recomendação da casa" é o ponto de partida da recomendação, não a resposta.

| # | Escolha | Recomendação da casa | Alternativas comuns | ADR? |
| --- | --- | --- | --- | --- |
| S1 | Gerenciador de pacotes | npm | pnpm, yarn, bun | Não |
| S2 | Framework / bundler | Vite (SPA) | Next.js, React Router framework mode, Remix, Astro (conforme P1) | Sim |
| S3 | Roteador | React Router | TanStack Router, o do framework escolhido | Sim |
| S4 | Estado global | Redux Toolkit | Zustand, Jotai, só Context, nenhum | Sim |
| S5 | Cache do servidor | RTK Query | TanStack Query, SWR, Apollo/urql (GraphQL) | Sim |
| S6 | Fluxos complexos | — (sem padrão) | XState, máquina própria, `useReducer` | Sim |
| S7 | Estilo | Tailwind CSS | CSS Modules, vanilla-extract, styled-components | Sim |
| S8 | Variantes | `tailwind-variants` | CVA, nenhuma | Sim |
| S9 | Componentes interativos (headless) | — (sem padrão) | Radix, Base UI, React Aria, design system pronto (MUI, Mantine, shadcn/ui) | Sim |
| S10 | Ícones | `@phosphor-icons/react` | Lucide, Heroicons, os da marca | Não |
| S11 | Fonte | A da marca | Fontsource, Google Fonts, arquivo próprio | Não |
| S12 | Animação | `motion` | Só CSS, View Transitions, outra lib | Não |
| S13 | Validação (inclusive de formulários) | zod: o padrão para projeto novo, **mas sempre perguntado** | valibot, yup, ArkType | Não |
| S14 | Formulários | — (sem padrão) | `useState` + schema, `<form action>` + `useActionState`, React Hook Form, TanStack Form | Sim |
| S15 | Datas | `Intl` nativo | date-fns, dayjs, Temporal | Não |
| S16 | i18n (se P6 pedir) | — | react-i18next, FormatJS / react-intl, Lingui | Sim |
| S17 | React Compiler | Ligado | Desligado | Não |
| S18 | Testes unitários | Vitest | Jest | Não |
| S19 | Testes de componente | HTML renderizado + `vi.mock` | Testing Library, MSW para simular a API | Não |
| S20 | Testes E2E | Nenhum na v1 | Playwright, Cypress | Não |
| S21 | Lint | oxlint | ESLint, Biome | Não |
| S22 | Formatação | Prettier | Biome, dprint | Não |
| S23 | Git hooks | lefthook | husky + lint-staged, nenhum | Não |
| S24 | Libs do negócio | — | O que o domínio pedir: gráficos, mapas, editor de texto, upload, SDKs de terceiros | Sim, se lock-in |
| S25 | Monitoramento de erros e analytics | — (sem padrão) | Sentry, outra ferramenta, só log no console, nenhum; analytics de produto à parte | Sim |
| S26 | Catálogo de componentes | — (sem padrão) | Quer um catálogo? Qual ferramenta (Storybook, Ladle, nenhum)? **O que entra** (só componentes base, também componentes de tela, telas inteiras)? Quais estados por componente (padrão, skeleton, desabilitado, erro, vazio)? Terá teste visual ou de acessibilidade? | Não |

## Dependencies

- P0 vem antes de tudo: o projeto de referência alimenta as recomendações de todas as outras.
- P1 e P2 vêm logo depois: decidem S2 e S3.
- E1 vem depois de P1 a P3 e de S2: a estrutura depende da renderização, das telas e do framework.
- P4 e P5 vêm antes de S4 e S5: o que a API e a sessão entregam decide estado e cache.
- S7, S8, S9 e P8 andam juntos: estilo, variantes, lib headless e tema precisam casar com o design system.
- S14 depende de P5 e S13: o envio do formulário depende da API e da validação.
- S16 só existe se P6 pedir vários idiomas.

## Done

O grill termina quando **todas** as decisões têm resposta do usuário (ou dispensa explícita dele), cada resposta está anotada (no `CONTEXT.md`, num ADR ou no plano) e o usuário confirmou o resumo final.

---

_O jeito de interrogar é adaptado do `grill-me` de Matt Pocock — github.com/mattpocock/skills._
