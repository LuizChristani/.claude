---
name: complexity-audit
description: Audits how heavy code is to run, in any project and language — time and memory Big-O with named variables (O(n·m), not a bare O(n²)), I/O calls per item (N+1 queries and requests), render cost in React, confirmed by a doubling measurement when possible, weighed against the real data size, and ends in a dated report with optimization proposals; nothing is optimized until the user picks a proposal. Use when the user runs /complexity-audit or asks "quão pesado está", "isso é N+1?", "qual o Big-O", "O(n²)", "está lento", "otimiza esse algoritmo" or "verifica o peso".
type: skill
scope: cross-cutting
tokens: ~1.5k (references ~4k on demand)
disable-model-invocation: true
---

# Complexity audit

> **TL;DR:** Para cada trecho: o custo de tempo, de memória e de I/O, com as variáveis nomeadas, medido pela dobra do `n` quando der e pesado contra o tamanho real dos dados. A entrega é o relatório com propostas; o código só muda depois que o usuário escolher.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when (go to) |
| --- | --- |
| O usuário chama `/complexity-audit` ou pergunta o peso, o Big-O ou se há N+1 | Decidir se um `useMemo` ou `memo` entra → [PERFORMANCE.md](../frontend-house-style/PERFORMANCE.md) |
| Uma tela, endpoint ou job está lento e ninguém sabe onde | Testar se o resultado está certo → [qa](../qa/SKILL.md) |
| Revisar um diff com loop, consulta ou lista que cresce | Aplicar a proposta escolhida → as regras de código do projeto |

## Core principle

**Custo sem `n` real é teoria.** O(n²) com 20 itens que nunca crescem não é problema; O(n) com uma consulta ao banco por item é. Todo achado diz o que cresce, quanto cresce no uso real e quanto isso custa em tempo, memória e chamadas.

## Procedure

1. **Escopo.** Liste o que entra (diff, pasta, endpoint, tela). "Tudo" cobre todos os módulos ([request-reading](../request-reading/SKILL.md)).
2. **Tamanho real.** Ache o `n` de cada coleção (o `.claude/` da aplicação, os dados, a paginação da API) ou pergunte ao usuário. Sem `n` real, o impacto fica "depende de n" e vira pergunta.
3. **Varredura.** Em JS/TS, rode `node <this-skill-dir>/scripts/complexity-scan.mjs <pasta>` para listar candidatos; em outras linguagens, leia o código com o catálogo de [PATTERNS.md](PATTERNS.md). Candidato não é achado.
4. **Análise.** Para cada candidato, calcule tempo, memória e I/O por [ANALYSIS.md](ANALYSIS.md).
5. **Medição.** Confirme por [MEASURE.md](MEASURE.md): dobra do `n`, contagem de consultas, Profiler ou memória. O que não deu para medir fica "não medido", com o motivo.
6. **Propostas.** Para cada achado com impacto, 1 a 3 propostas de [PATTERNS.md](PATTERNS.md), cada uma com o custo novo, o preço (memória, código, índice) e como provar que o resultado não muda.
7. **Relatório.** Escreva por [REPORT.md](REPORT.md) e responda com o resumo: achados por impacto, o pior trecho e o caminho do arquivo.

## Non-negotiables

| # | Regra | ❌ Violação típica |
| --- | --- | --- |
| 1 | Zero edição em código de produção até o usuário escolher a proposta | "Já troquei o `find` por um `Map`" |
| 2 | Todo Big-O nomeia as variáveis | "É O(n²)" sem dizer que `n` é pedidos e o outro é itens |
| 3 | Tempo, memória e I/O são três números separados | Só o Big-O de CPU de um loop que faz uma consulta por volta |
| 4 | Impacto calculado no `n` real; trecho de `n` pequeno e limitado é "Baixo" e não ganha proposta | Propor `Map` para uma lista fixa de 7 dias da semana |
| 5 | Medição citada vem de uma execução, com os números; o resto é marcado "não medido" | "Deve levar uns 2 s" sem rodar |
| 6 | Arquivo de medição é temporário, fora do código de produção, e é apagado no fim; o código dele vai no relatório | Benchmark esquecido em `src/` |
| 7 | Otimização em React segue as regras de decisão de [PERFORMANCE.md](../frontend-house-style/PERFORMANCE.md) | `useMemo` proposto sem medição |

## Anti-patterns

- **Big-O sem n:** o relatório diz O(n²) e não diz se `n` é 10 ou 10 milhões; ninguém sabe se vale mexer.
- **N+1 invisível:** o loop parece O(n) e barato, mas cada volta chama o banco ou a API; o custo real é `n` idas e voltas.
- **Otimização de microbenchmark:** trocar `.map` por `for` para ganhar nanossegundos enquanto a consulta por item continua lá.
- **Proposta que muda o resultado:** a versão rápida ignora duplicados, ordem ou o caso vazio; ninguém provou que a saída é igual.

## Trade-offs

| Escolha | Custo | Quando o simples vence |
| --- | --- | --- |
| Índice em `Map`/`Set` no lugar de busca linear | Memória O(m) a mais e uma linha para montar | `m` pequeno e limitado (dezenas) → busca linear |
| Consulta em lote no lugar de uma por item | Agrupar o resultado no código; consulta maior | Sempre 1 ou 2 itens → a consulta simples |
| Medir pela dobra | Um arquivo temporário e alguns segundos de execução | O custo é óbvio pela leitura e o `n` é pequeno → só análise, marcada "não medido" |

## Checklist

- [ ] Todo achado tem `arquivo:linha`, variáveis nomeadas e tempo, memória e I/O separados
- [ ] O `n` real veio de uma fonte ou de uma pergunta ao usuário
- [ ] Cada medição tem os números; o que não foi medido está marcado
- [ ] Nenhum arquivo de produção mudou; arquivos de medição apagados
- [ ] Toda proposta diz o custo novo, o preço e como provar que o resultado não muda
- [ ] Relatório em `.claude/complexity/<app>/` da raiz do workspace (não no app)

## See also

- [frontend-house-style/PERFORMANCE.md](../frontend-house-style/PERFORMANCE.md) — quando memoizar, virtualizar ou fazer debounce em React
- [qa](../qa/SKILL.md) — testes que provam que a otimização não mudou o resultado
- [request-reading](../request-reading/SKILL.md) — "verifica o peso" entrega diagnóstico e propostas, não o código trocado
