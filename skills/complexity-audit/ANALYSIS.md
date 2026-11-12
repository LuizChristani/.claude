---
name: complexity-audit-analysis
description: How the complexity audit computes the cost of a piece of code — naming the variables that grow, combining loop levels, the cost of common built-ins with their official source, counting I/O calls per request (N+1), memory growth, and turning the result into an impact level against the real data size and a time budget. Use when analyzing a candidate found by the complexity scan or by reading code.
type: reference
scope: cross-cutting
tokens: ~1.5k
---

# Analysis

> **TL;DR:** Nomeie o que cresce, multiplique o que está aninhado, some o que está em sequência e fique com o termo dominante. Conte à parte as chamadas de I/O e a memória. O impacto vem do `n` real contra o orçamento da operação.

## Name the variables

| Passo | Exemplo neutro |
| --- | --- |
| Dê uma letra a cada coleção que cresce | `n` = usuários, `m` = pedidos, `k` = itens por pedido |
| Diga de onde vem o tamanho real | "`n` ≤ 50 por página (paginação da API)", "`m` ≈ 200 mil (tabela de pedidos)" |
| Coleção de tamanho fixo não é variável | 7 dias da semana, 3 status: custo constante |

## Combine the levels

| Estrutura | Custo |
| --- | --- |
| Loops em sequência sobre `n` e `m` | O(n + m) |
| Loop sobre `n` com loop ou busca linear em `m` dentro | O(n·m) |
| Loop sobre `n` com busca em `Map`/`Set` dentro | O(n) em média |
| Loop sobre `n` que copia o acumulado a cada volta (`[...acc, x]`) | O(n²) de tempo e O(n²) de memória alocada ao todo |
| Ordenar uma vez | O(n log n) no V8 (Timsort) |
| Ordenar dentro de um loop sobre `n` | O(n · n log n) |
| Recursão | Número de chamadas × custo de cada uma |

Fique com o termo que domina no `n` real: O(n·m + n) vira O(n·m).

## Built-in costs

| Operação | Custo | Fonte |
| --- | --- | --- |
| `Map`/`Set`: `get`, `has`, `set`, `add`, `delete` | Sublinear em média, pela especificação | https://tc39.es/ecma262/#sec-map-objects |
| `Array`: `find`, `findIndex`, `includes`, `indexOf`, `some`, `every`, `filter`, `map` | Linear: o algoritmo do spec percorre os elementos | https://tc39.es/ecma262/#sec-array.prototype.find |
| Cópia: spread, `slice`, `concat`, `toSorted`, `Object.assign` | Linear no tamanho copiado; aloca a cópia inteira | https://tc39.es/ecma262/#sec-array.prototype.slice |
| `sort` | O spec exige ordenação estável e não fixa o custo; o V8 usa Timsort (desde a v7.0), O(n log n) no pior caso | https://v8.dev/blog/array-sort |

**🔧 Stack note:** em outra linguagem, use a doc oficial dela para o custo das estruturas (dicionário, conjunto, lista). Sem custo documentado, diga isso e meça.

## I/O per request

O custo de I/O se conta em **chamadas**, não em Big-O de CPU.

| Padrão | Chamadas | Latência |
| --- | --- | --- |
| Uma consulta para a lista + uma por item | 1 + n (o **N+1**) | Em sequência: n × ida e volta |
| Uma por item em paralelo (`Promise.all`) | 1 + n | Uma ida e volta, mas `n` conexões e carga no servidor |
| Consulta em lote (`WHERE id IN (…)`, endpoint em lote) | 2 | Duas idas e voltas |
| Junção no banco | 1 | Uma ida e volta |

- Consulta com filtro em coluna sem índice é O(linhas da tabela) **dentro do banco**, a cada chamada; confirme com o `EXPLAIN` do banco ([MEASURE.md](MEASURE.md#queries)).
- Carregar a tabela inteira para filtrar na memória custa O(tabela) de rede, memória e CPU, mesmo que a tela mostre 20 linhas.

## Memory

| Pergunta | Exemplo |
| --- | --- |
| Quanto o trecho guarda ao mesmo tempo? | Índice `Map` de `m` itens: O(m) |
| Quanto aloca ao todo, mesmo que solte depois? | Spread no `reduce`: O(n²) alocado, pressão no coletor de lixo |
| Algo cresce sem limite enquanto o app roda? | Cache sem tamanho máximo, listener nunca removido, lista que só recebe `push` |
| Lê tudo de uma vez o que poderia vir em partes? | Arquivo ou resposta inteira na memória no lugar de stream ou paginação |

## Render (React)

- Cálculo no corpo do componente roda a **cada render**: custo do cálculo × número de renders da interação.
- Lista de `n` linhas sem virtualização cria `n` nós; o limite e as regras de memoização são os de [PERFORMANCE.md](../frontend-house-style/PERFORMANCE.md#decision-rules).
- Antes de memoizar um cálculo O(n·m), baixe o custo dele (índice em `Map` numa função de `lib/`); memoizar só esconde o custo até o próximo render que muda a entrada.

## Impact

O impacto compara o tempo no `n` real com o orçamento da operação. Não há número oficial único de orçamento para API ou job: use o que o projeto documenta ou pergunte ao usuário.

| Operação | Orçamento | Fonte |
| --- | --- | --- |
| Resposta a uma interação na web | INP ≤ 200 ms é "bom"; > 500 ms é "ruim" | https://web.dev/articles/inp |
| API, job, tela mobile | O do projeto (`.claude/`, SLO) ou o que o usuário disser | — |

| Impacto | Quando |
| --- | --- |
| Crítico | Passa do orçamento hoje, no `n` real, ou derruba o serviço (memória, conexões) |
| Alto | Fica dentro hoje, mas passa no crescimento esperado do `n` |
| Médio | Cresce pior que o necessário, mas fica dentro do orçamento no `n` previsto |
| Baixo | `n` pequeno e limitado; não ganha proposta |

## Anti-patterns

- **Pior caso de enfeite:** dar O(n²) a um loop cuja coleção interna tem tamanho fixo; o custo real é linear.
- **CPU no lugar de rede:** analisar o Big-O do `map` e não contar as `n` consultas que ele dispara.
