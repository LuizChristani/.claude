---
name: frontend-project-setup-project-docs
description: The files a new frontend gets so every future session knows the business and the decisions — the project's CLAUDE.md, CONTEXT.md glossary, ADRs and README — with templates. Use in phase 4 of frontend-project-setup, or when a project is missing them.
type: reference
scope: frontend
tokens: ~1k
---

# Project docs

> **TL;DR:** O negócio e as decisões ficam no próprio projeto, não na conversa. `CLAUDE.md` diz o que o projeto é e quais regras valem; `CONTEXT.md` é o glossário; `docs/adr/` guarda as decisões difíceis de desfazer.

## Files

| Arquivo | Conteúdo | Formato |
| --- | --- | --- |
| `CLAUDE.md` (raiz do projeto) | O que o projeto é, para quem, a stack decidida, as exceções à [[frontend-house-style]] e os comandos | Template abaixo |
| `CONTEXT.md` | Glossário do domínio, e nada mais | [Glossary format](#glossary-format) |
| `docs/adr/NNNN-slug.md` | Uma decisão por arquivo: contexto, escolha e motivo | [ADR format](#adr-format) |
| `docs/API.md` | Backends usados, URL base por ambiente (sem segredos), mapa de endpoints com **para que serve cada um**, payloads e a fonte de cada um, como atualizar quando o backend mudar | [BACKEND.md](BACKEND.md) |
| `docs/PLAN.md` | O plano da fase 5, escrito antes da aprovação e mantido como registro, com a linha `Status: aprovado em AAAA-MM-DD` | [PLAN.md](PLAN.md) |
| `docs/ARCHITECTURE.md` | Os desenhos aprovados no plano: árvore, camadas, rotas, caminho dos dados, wireframe e paleta | [PLAN.md](PLAN.md) |
| `README.md` | Como rodar, testar e fazer build; para pessoas | Curto, com os scripts |
| `.claude/skills/` (só se precisar) | Regra específica do projeto que não cabe no `CLAUDE.md` | [[frontend-house-style]] → AUTHORING.md |

## CLAUDE.md template

```md
# <Nome do projeto>

<Uma ou duas frases: o que o app faz e para quem.>

## Jornada principal

<Os passos da jornada mais importante.>

## Stack

Segue os princípios da skill `frontend-house-style`, aplicados às escolhas deste projeto. Uma linha por decisão de stack do grill (S1 a S24), inclusive as que ficaram iguais à recomendação da casa:

| Decisão | Escolha | ADR |
| --- | --- | --- |
| Framework / bundler | <escolha> | docs/adr/000X |
| Estado global | <escolha> | docs/adr/000X |
| Cache do servidor | <escolha> | docs/adr/000X |
| … | … | … |

## Projeto de referência

<Nome do projeto de frontend usado como referência (P0) e o que veio dele: estrutura, componentes, tokens, fluxos. "Nenhum" se não houve.>

## Estrutura

<A árvore escolhida em E1, com uma linha por pasta, e a regra de import entre elas. ADR: docs/adr/000X.>

## Exceções à frontend-house-style

<Regra deste projeto que vence a skill, com o motivo. Vazio se não houver.>

## Domínio

Glossário em `CONTEXT.md`. Use sempre os termos de lá.

## Arquitetura

Desenhos em `docs/ARCHITECTURE.md`. Mudou a estrutura, as rotas ou o caminho dos dados? Atualize os desenhos no mesmo commit.

## Comandos

| Script | Para quê |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run lint` / `typecheck` / `test:coverage` / `build` / `check:style` | Gates |
```

## Glossary format

`CONTEXT.md` é o glossário do domínio (a linguagem do negócio) e nada mais: sem detalhe de implementação, sem especificação, sem rascunho.

```md
# <Nome do contexto>

<Uma ou duas frases: o que é este contexto e por que existe.>

## Language

**Order**:
<Uma ou duas frases dizendo o que o termo é.>
_Avoid_: Purchase, transaction

**Customer**:
<Uma ou duas frases dizendo o que o termo é.>
_Avoid_: Client, buyer
```

| Regra | Detalhe |
| --- | --- |
| Opinativo | Várias palavras para o mesmo conceito: escolha uma e liste as outras em `_Avoid_` |
| Definição curta | Uma ou duas frases, dizendo o que o termo **é**, não o que faz |
| Só termos do domínio | Conceito geral de programação (timeout, tipo de erro) não entra |
| Grupos | Subtítulos quando surgirem grupos naturais; lista simples serve |
| Quando criar | No grill, assim que o primeiro termo se resolve; cada termo é escrito na hora, não no fim |
| Vários contextos | Um `CONTEXT-MAP.md` na raiz lista cada contexto, onde ele mora e como eles se relacionam |

## ADR format

```md
# <Título curto da decisão>

<Uma a três frases: o contexto, o que foi decidido e por quê.>
```

| Regra | Detalhe |
| --- | --- |
| Onde | `docs/adr/`, numerados em sequência (`0001-slug.md`); o próximo número é o maior que existe mais um |
| Quando escrever | Só quando as três valem: difícil de desfazer, surpreendente sem contexto **e** fruto de uma escolha real entre alternativas |
| O que costuma valer | Forma da arquitetura, padrão de integração, tecnologia com lock-in, limites de escopo, desvio deliberado do óbvio, restrição que não aparece no código, alternativa rejeitada que alguém vai sugerir de novo |
| Seções opcionais | `Status` (proposto, aceito, substituído), opções consideradas e consequências, só quando acrescentam |

_Os formatos de glossário e ADR são adaptados do `grill-with-docs` de Matt Pocock — github.com/mattpocock/skills._

## Rules

- `CONTEXT.md` nasce no grill, termo por termo, assim que cada um se resolve; não deixe para o fim.
- ADR só quando a decisão é difícil de desfazer, surpreendente sem contexto **e** fruto de uma escolha real entre alternativas.
- O `CLAUDE.md` do projeto é a fonte da verdade sobre o projeto: em choque com uma skill compartilhada, ele vence.
- Nenhum segredo nesses arquivos: chaves e credenciais ficam em variáveis de ambiente fora do repositório.
