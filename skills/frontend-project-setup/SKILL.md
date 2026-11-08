---
name: frontend-project-setup
description: Starts a brand-new React frontend from zero, shaped by the user's business and design references — collects references, grills the user one question at a time until every decision is unambiguous, records the domain glossary and decisions in the new project's own .claude/, then scaffolds the app following frontend-house-style with every install step checked against the official docs, and finishes with a working, fully green walking skeleton. Use when the user wants to create, start, bootstrap or scaffold a new frontend/app/project from scratch ("criar um front do zero", "começar um projeto novo", "startar um projeto").
type: skill
scope: frontend
tokens: ~2k (references ~6k on demand)
---

# Frontend project setup

> **TL;DR:** Nada de código antes de entender o negócio. Peça as referências, faça o grill ([DECISIONS.md](DECISIONS.md)) até não sobrar ambiguidade, registre o glossário e as decisões no `.claude/` do projeto novo e só então monte o app, passo a passo pela documentação oficial, seguindo a `frontend-house-style`. Termina com um esqueleto funcionando e tudo verde.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when (go to) |
| --- | --- |
| Criar um frontend React do zero para um negócio novo | Mexer num projeto que já existe → [[frontend-house-style]] |
| Montar a base (stack, tokens, pastas, tooling) antes da primeira feature | Só discutir uma ideia, sem criar projeto → converse direto, sem esta skill |
| | Backend ou integração entre serviços (fora do escopo desta skill) |

## Core principle

**O começo decide a qualidade do projeto inteiro.** Cada decisão errada no dia 1 (stack, tokens, estrutura, nomes do domínio) vira retrabalho em todas as telas. Por isso a skill gasta o tempo em entender e decidir, e o scaffold é só a execução do que foi decidido.

## Procedure

Siga as fases em ordem. Não pule uma fase sem o usuário pedir.

| # | Fase | Saída | Detalhe |
| --- | --- | --- | --- |
| 1 | **Intake** | Resumo do negócio + lista de referências recebidas e faltando | [INTAKE.md](INTAKE.md) |
| 2 | **Ler as referências** | Notas do que cada referência define (cores, tipografia, telas), do que os **projetos já clonados na máquina** usam e dos **payloads do backend** escolhido | [INTAKE.md](INTAKE.md), [STRUCTURE.md](STRUCTURE.md), [BACKEND.md](BACKEND.md) |
| 3 | **Grill** | Todas as decisões de produto, a **estrutura em 3 ou 4 opções** e **cada** escolha de stack perguntadas, uma por vez, com a sua recomendação | [DECISIONS.md](DECISIONS.md) → How to grill + [STRUCTURE.md](STRUCTURE.md) |
| 4 | **Registrar** | `CLAUDE.md`, `CONTEXT.md` e `docs/adr/` do projeto novo | [PROJECT-DOCS.md](PROJECT-DOCS.md) |
| 5 | **Plano** | `docs/PLAN.md` no projeto novo, com os passos do scaffold e os **desenhos de como vai ficar** (árvore, camadas, rotas, dados, wireframe, paleta); no chat só o resumo e o caminho; **aprovação do usuário** | [PLAN.md](PLAN.md) |
| 6 | **Scaffold** | App montado passo a passo, cada passo conferido na doc oficial e verificado | [SCAFFOLD.md](SCAFFOLD.md) |
| 7 | **Esqueleto** | Uma tela real da jornada principal, de ponta a ponta | [SCAFFOLD.md](SCAFFOLD.md) |
| 8 | **Pronto** | Definição de pronto cumprida e relatório final ao usuário | [Checklist](#checklist) |

## Non-negotiables

| # | Regra | ❌ Violação típica |
| --- | --- | --- |
| 1 | Nenhum arquivo do app antes do fim do grill e da aprovação do plano; antes disso, só o `docs/PLAN.md` | Rodar o `create vite` na primeira mensagem |
| 2 | Toda decisão vem do usuário, das referências ou da doc oficial; nunca de suposição | Inventar a cor primária ou o nome de uma entidade |
| 3 | Todo comando de instalação e config é conferido na doc oficial **no momento** ([[frontend-house-style]] → OFFICIAL-DOCS.md) | Copiar comando de memória, com flag que mudou |
| 4 | Os princípios da [[frontend-house-style]] valem desde o primeiro arquivo, aplicados às libs que o usuário escolheu | "Depois a gente arruma o estilo" |
| 5 | Os valores do design system vêm das referências; sem referência, token marcado como provisório e listado no relatório | Hex inventado sem aviso |
| 6 | **Em todo setup, de qualquer projeto, cada biblioteca e ferramenta é perguntada ao usuário**, com recomendação; nenhuma entra por padrão da casa, por referência ou por tipo de projeto. Só o usuário dispensa perguntas, de forma explícita | Instalar Redux "porque é o padrão" sem perguntar |
| 7 | Sempre perguntar se há um projeto de frontend de referência; a estrutura é sempre apresentada em 3 ou 4 opções, partindo dele e dos projetos já clonados na máquina; clonar só com permissão | Criar as pastas no formato de sempre sem mostrar alternativas |
| 8 | Sempre perguntar se vai usar um backend pronto e qual; payloads só do contrato, das docs ou do código desse backend, com a fonte anotada | Tipo de resposta inventado "que deve ser assim" |
| 9 | Escolhas com lock-in viram ADR | Escolher e não registrar |
| 10 | Nada de commit, push ou repositório remoto sem o usuário pedir | `git push` no fim do scaffold |
| 11 | Agentes de leitura de doc ou de varredura seguem a política de modelos do `CLAUDE.md` do workspace (sonnet para ler, haiku para checar) | Fan-out inteiro no modelo mais forte |

## Anti-patterns

- **Scaffold primeiro, perguntas depois:** a estrutura nasce genérica e depois briga com o negócio.
- **Design system inventado:** cores e fontes "bonitas" no lugar das referências do usuário.
- **Template de tutorial:** comandos e configs copiados de memória, desatualizados para a versão instalada.
- **Kit completo no dia 1:** dezenas de componentes que nenhuma tela usa. Monte a base e o que o esqueleto precisa; o resto nasce com as features.

## Trade-offs

- O intake e o grill levam tempo antes de qualquer tela aparecer. É o preço de não refazer a base depois.
- Um esqueleto de uma tela só parece pouco, mas prova a stack inteira (rotas, dados, estado, tokens, testes, build) de ponta a ponta.

## Checklist

- [ ] Negócio resumido e confirmado pelo usuário; referências lidas
- [ ] Grill terminado: todas as decisões de [DECISIONS.md](DECISIONS.md) respondidas pelo usuário (ou dispensadas por ele, de forma explícita)
- [ ] `CLAUDE.md`, `CONTEXT.md` e ADRs do projeto escritos
- [ ] Plano escrito em `docs/PLAN.md` e aprovado antes do scaffold, com os desenhos de [PLAN.md](PLAN.md); desenhos salvos em `docs/ARCHITECTURE.md` do projeto
- [ ] Cada passo do scaffold conferido na doc oficial e verificado, inclusive higiene do repositório, autenticação e libs escolhidas
- [ ] `lint`, `typecheck`, `test:coverage`, `build` e `check:style` verdes; app abre no `dev`
- [ ] Esqueleto da jornada principal funcionando com tokens reais
- [ ] Relatório final: o que foi feito, decisões, tokens provisórios, próximos passos
