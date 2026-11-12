---
name: complexity-audit-report
description: Format of the complexity report written in the workspace root .claude/complexity/<app>/ (never inside the app) — file location and name, finding IDs, the per-finding cost table (time, memory, I/O, real n, measured or not), proposals with their price and proof, and the list of what was checked and is fine. Use when creating or updating a complexity report.
type: reference
scope: cross-cutting
tokens: ~1k
---

# Complexity report

> **TL;DR:** Um arquivo por rodada em `<workspace>/.claude/complexity/<app>/AAAA-MM-DD-<assunto>.md`, na `.claude/` da raiz (a mesma que guarda esta biblioteca de skills). Cada achado tem onde, custo de tempo, memória e I/O, o `n` real, a medição e as propostas. O que foi olhado e está bem também entra.

## Location

| Item | Regra |
| --- | --- |
| Pasta | `.claude/complexity/<app>/` na `.claude/` da raiz do workspace, a mesma que guarda a biblioteca de skills; `<app>` é o nome da pasta da aplicação. **Nunca** no `.claude/` da aplicação |
| Nome | `AAAA-MM-DD-<assunto-em-kebab>.md`; segunda rodada no mesmo dia e assunto ganha `-2` |
| ID do achado | `CX-AAAA-MM-DD-N`, sequencial dentro do relatório |

## Status

| Status | Significado |
| --- | --- |
| Aberto | Achado, aguardando o usuário escolher uma proposta |
| Escolhido | O usuário escolheu a proposta `P<n>`; a mudança é feita fora desta skill |
| Aceito como está | O usuário decidiu manter; o motivo fica registrado |
| Resolvido | A proposta foi aplicada e a nova medição está no relatório |

## Template

```md
# Complexity · <assunto> · AAAA-MM-DD

## Escopo
- Pedido: <o que foi pedido, nas palavras do usuário>
- Unidades: <pastas, arquivos, endpoints ou telas>
- Tamanhos reais: <n = …, fonte>; orçamento: <tempo, fonte>

## Resumo
| ID | Onde | Tempo | Memória | I/O | n real | Medido | Impacto |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Achados
### CX-AAAA-MM-DD-1 · <nome do padrão> · <impacto> · Aberto
- **Onde:** `arquivo:linha`
- **Variáveis:** n = <…>, m = <…>
- **Custo:** tempo <O(…)>, memória <O(…)>, I/O <chamadas>
- **Medição:** <tabela da dobra ou contagem de chamadas> | não medido: <motivo>
- **Impacto no n real:** <tempo ou chamadas estimadas contra o orçamento>
- **Propostas:**
  - **P1 (recomendada):** <mudança> → <custo novo>; preço: <…>; prova: <testes>
  - **P2:** <…>

## Olhado e sem problema
| Onde | Por quê |
| --- | --- |

## Não medido
| Onde | Motivo |
| --- | --- |
```

## Anti-patterns

- **Relatório dentro do app:** o arquivo vai para o `.claude/` da aplicação, oculto e muitas vezes no `.gitignore`; o usuário não acha. Sempre na `.claude/` da raiz, em `complexity/<app>/`.

- **Relatório só de problemas:** sem a seção "Olhado e sem problema", ninguém sabe o que foi coberto.
- **Proposta sem preço:** "use um índice" sem dizer a memória, a escrita mais lenta ou a migração que ele custa.
