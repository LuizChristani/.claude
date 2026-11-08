---
name: frontend-project-setup-structure
description: How to decide the folder structure of a new frontend — always scan the projects already cloned on the machine, then present 3 to 4 tailored structure options (trees filled with the project's real features, origin, fit, cost and how the house-style principles map onto each) and let the user choose. Use in phase 3 of frontend-project-setup, decision E1.
type: reference
scope: frontend
tokens: ~2k
---

# Structure

> **TL;DR:** Em todo setup, olhe primeiro os projetos já clonados na máquina. Depois apresente **3 ou 4 formas** de estruturar o frontend, cada uma com a árvore montada com as telas e features reais do projeto novo. O usuário escolhe; a escolha vira ADR.

## 1. Scan local projects

Sempre, antes de montar as opções.

| Passo | Como |
| --- | --- |
| Achar a pasta dos projetos | A pasta que agrupa os projetos do usuário (ex.: `<workspace>/`, com todos os repositórios dentro), normalmente a pasta onde o projeto novo vai nascer. Se não souber qual é, pergunte |
| Listar os repositórios | **Todos** os repositórios dentro dela, um nível abaixo (pastas com `.git`); não pare nos primeiros |
| Ficar só com os frontends | Um repositório é frontend quando um `package.json` dele (até 3 níveis, fora de `node_modules`) tem uma lib de UI nas dependências: `react`, `vue`, `svelte`, `@angular/core`, `solid-js` ou `preact`. Backends (`go.mod`, `Cargo.toml` sem UI, `pyproject.toml`, servidores Node sem lib de UI) e ferramentas sem UI ficam de fora |
| Evitar falsos positivos | Ignore saídas de build (`dist`, `build`, `.next`, `out`, `coverage`) e `node_modules`. Um `package.json` aninhado dentro de um frontend (um SDK, um pacote interno) é parte do mesmo projeto, não outro frontend; a exceção é um monorepo com `apps/*`, em que cada app com UI conta como um frontend |
| App com casca nativa | Desktop ou mobile com front web dentro (pasta nativa ao lado do `src/`): conta como frontend, e só a parte web é lida |
| Ler cada um | Árvore de `src/` até 3 níveis; `CLAUDE.md`, `AGENTS.md`, `.claude/` e docs de arquitetura; dependências do `package.json`; regras de import do lint |
| Delegar | Muitos repositórios: listar e filtrar com agente haiku, ler a estrutura com agente sonnet (política de modelos do `CLAUDE.md`) |
| Relatar | Mostre ao usuário, em uma tabela: projeto, padrão de estrutura, stack principal e o que parece funcionar bem ou mal |

O que os projetos locais usam também entra na recomendação das decisões de stack ([DECISIONS.md](DECISIONS.md)), sempre como pergunta.

## Reference project

Se o usuário indicar um projeto de frontend como referência (P0):

| Situação | O que fazer |
| --- | --- |
| Está na pasta de projetos | Ler como os outros, com mais profundidade: estrutura, componentes base, tokens, padrões de tela e de chamada à API |
| Não está na máquina | Pedir o caminho ou a URL do repositório. **Clonar só com permissão do usuário**, na pasta de projetos; ou ler pelo remoto (`gh`, a interface do git) sem clonar, se ele preferir |
| Sem acesso | Pedir ao usuário prints, a árvore de pastas ou os arquivos principais |

- O projeto de referência entra **sempre** como uma das 3 ou 4 opções de estrutura, dizendo o que vem dele.
- O que foi tirado dele (estrutura, componentes, tokens, fluxos) fica anotado no plano e no `CLAUDE.md` do projeto novo, com o nome do projeto de referência.
- Copiar um padrão não é copiar um erro: o que o projeto de referência faz contra a [[frontend-house-style]] é apontado ao usuário, que decide se repete.

## 2. Build 3 to 4 options

- **Nunca menos de 3, nunca mais de 4.**
- Se o usuário indicou um projeto de referência, uma opção é a estrutura dele.
- Pelo menos uma opção sai de um projeto local, quando existir um, dizendo de qual.
- As outras saem do catálogo abaixo, escolhidas pelo tamanho do negócio, pela plataforma (P1, P2) e pelo framework (S2).
- Cada árvore usa as **telas e features reais** levantadas no intake, nunca nomes genéricos.

| Modelo | Forma | Quando cabe | Custo | Fonte |
| --- | --- | --- | --- | --- |
| **Camadas por tipo, com colocation por tela** | `pages/<rota>/` (com `components/`, `hooks/`, `lib/` da tela) + `components/`, `hooks/`, `store/`, `lib/` compartilhados | App de poucas a dezenas de telas, um time | Com muitas features, as pastas compartilhadas crescem | [[frontend-house-style]] → ARCHITECTURE.md |
| **Por feature** | `app/` (rotas, providers) + `features/<feature>/` (`api`, `components`, `hooks`, `stores`, `types`, `utils`) + compartilhados (`components`, `hooks`, `lib`, `types`, `utils`) | App com várias áreas de negócio independentes | Exige disciplina para não importar uma feature de dentro de outra | https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md |
| **Feature-Sliced Design** | Camadas `app`, `pages`, `widgets`, `features`, `entities`, `shared`; cada camada dividida em slices (por domínio) e segmentos (`ui`, `api`, `model`, `lib`, `config`) | App grande, time grande ou com muita gente entrando | Mais conceitos e mais pastas; curva de aprendizado | https://feature-sliced.design/docs/get-started/overview |
| **Rotas por arquivo do framework** | A pasta de rotas do framework (S2) com colocation por rota, mais compartilhados | Quando S2 é um framework com roteamento por arquivo | Estrutura amarrada às convenções do framework | Doc oficial do framework escolhido |
| **Monorepo com pacotes** | `apps/<app>` + `packages/ui`, `packages/<domínio>`, `packages/config` | Vários apps que dividem design system ou domínio | Tooling de monorepo, versionamento entre pacotes | Doc oficial da ferramenta de monorepo escolhida |

## 3. Present each option

Para cada opção, mostre:

1. **Nome e origem**: projeto local de onde veio, ou a fonte oficial com link.
2. **Árvore** com as features reais do projeto novo.
3. **Regra de import**: quem pode importar quem, e como o lint vai garantir.
4. **Onde ficam os princípios da casa** (tabela abaixo).
5. **Quando cabe e quanto custa**, em uma linha cada.

No fim, a sua recomendação e o motivo. Se a ferramenta de pergunta com opções e pré-visualização existir, use-a com a árvore de cada opção na pré-visualização.

| Princípio da [[frontend-house-style]] | Camadas por tipo | Por feature | Feature-Sliced Design |
| --- | --- | --- | --- |
| Regra pura, sem React | `lib/`, `pages/<rota>/lib/` | `lib/`, `features/<f>/utils/` | Segmentos `lib` e `model` (a parte sem React) |
| Estado global e API | `store/` | `stores/`, `features/<f>/api/`, `features/<f>/stores/` | Segmentos `api` e `model` em `entities` e `features` |
| Componente compartilhado | `components/` | `components/` | `shared/ui` |
| Tela | `pages/<rota>/page.tsx` | `app/routes/` compondo features | `pages/<slice>/ui` |
| Direção dos imports | pages → layout → components → hooks → store → lib | shared → features → app; feature não importa feature | Uma camada só importa das camadas abaixo; slice não importa slice da mesma camada |

As regras de código (um componente por arquivo, sem `switch`, `const` antes do `return`, JSDoc…) valem igual em qualquer estrutura.

## 4. Record

- A escolha vira ADR, com as opções que ficaram de fora e por quê.
- O `CLAUDE.md` do projeto ganha a seção "Estrutura", com a árvore e a regra de import ([PROJECT-DOCS.md](PROJECT-DOCS.md)).
- O passo "Pastas" do [SCAFFOLD.md](SCAFFOLD.md) cria essa árvore, e o lint ganha a regra de import da estrutura escolhida.
