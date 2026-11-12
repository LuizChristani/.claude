---
name: complexity-audit-measure
description: How the complexity audit confirms a cost by running code — the doubling method with a temporary test file (time ratio per doubling of n reveals the growth), counting queries and requests per operation, EXPLAIN for unindexed filters, React Profiler for render cost, and memory measurement — with the official tools per stack. Use when measuring a candidate before writing it into a complexity report.
type: reference
scope: cross-cutting
tokens: ~1.5k
---

# Measure

> **TL;DR:** Rode o trecho com `n`, `2n`, `4n` e `8n` e olhe a razão entre os tempos: ~2 é linear, ~4 é quadrático. Para I/O, conte as chamadas com 1, 10 e 100 itens. O arquivo de medição é temporário e apagado no fim.

## Doubling method

Se o tempo é `c·nᵏ`, dobrar o `n` multiplica o tempo por `2ᵏ`. A razão entre execuções seguidas revela o `k`.

| Razão `T(2n) / T(n)` | Crescimento |
| --- | --- |
| ~1 | O(1) |
| ~2 | O(n) |
| Um pouco acima de 2 | O(n log n) |
| ~4 | O(n²) |
| ~8 | O(n³) |

- Rode cada tamanho várias vezes e fique com o **menor** tempo: o ruído só soma tempo. A doc do `timeit` do Python recomenda o mesmo (https://docs.python.org/3/library/timeit.html#timeit.Timer.repeat).
- Suba o `n` até o tempo do menor tamanho ficar bem acima da resolução do relógio; tempos de microssegundos dão razões sem sentido. Não há número oficial: aumente até as razões ficarem estáveis entre execuções.
- Meça com dados no formato real (chaves repetidas, itens sem relação), não só o caso feliz.

### Harness (JS/TS)

Um arquivo de teste temporário, rodado pelo runner que o projeto já tem (ele já resolve TypeScript e os aliases). Rode só esse arquivo, copie a tabela para o relatório e apague o arquivo.

`lib/orders/tests/attachUsers.growth.tmp.test.ts`:

```ts
import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';

import { attachUsers } from '../attachUsers';

const SIZES = [2000, 4000, 8000, 16000];
const REPEATS = 5;

function makeInput(size: number) {
  const users = Array.from({ length: size }, (_, index) => ({ id: `u${index}` }));
  const orders = Array.from({ length: size }, (_, index) => ({ id: `o${index}`, userId: `u${size - index - 1}` }));
  const input = { users, orders };
  return input;
}

function fastestRun(size: number) {
  const input = makeInput(size);
  const times = Array.from({ length: REPEATS }, () => {
    const start = performance.now();
    attachUsers(input.orders, input.users);
    const elapsed = performance.now() - start;
    return elapsed;
  });
  const fastest = Math.min(...times);
  return fastest;
}

describe('attachUsers growth', () => {
  it('prints the time ratio for each doubling of n', () => {
    const times = SIZES.map(fastestRun);
    const rows = SIZES.map((size, index) => ({ size, ms: times[index], ratio: index === 0 ? '-' : times[index] / times[index - 1] }));
    console.table(rows);
    expect(times).toHaveLength(SIZES.length);
  });
});
```

Fonte: https://nodejs.org/api/perf_hooks.html#performancenow

**🔧 Stack note:** a API `bench` do Vitest é experimental e foi reescrita no Vitest 5 (https://vitest.dev/guide/benchmarking); o harness acima não depende dela. Em Jest, troque o import do `vitest` pelos globais do Jest.

| Stack | Ferramenta oficial | Fonte |
| --- | --- | --- |
| Go | `func BenchmarkXxx(b *testing.B)` com `for b.Loop()` (Go 1.24+), `b.ReportAllocs()`, rodado com `go test -bench` | https://pkg.go.dev/testing#hdr-Benchmarks |
| Python | `timeit.repeat(...)` e o `min()` do resultado | https://docs.python.org/3/library/timeit.html |
| Outra | O benchmark da doc oficial da linguagem; sem um, o mesmo harness com o relógio monotônico dela | — |

## Queries

| Passo | Como |
| --- | --- |
| Contar chamadas | Ligue o log de consultas do ORM ou do driver (doc oficial dele) ou o log de rede do app; rode a operação com 1, 10 e 100 itens |
| Ler o resultado | Contagem constante: ok. Contagem que cresce com os itens: N+1 |
| Filtro sem índice | `EXPLAIN` da consulta; no PostgreSQL, `EXPLAIN ANALYZE` executa de verdade e mostra linhas e tempo reais |
| Consulta que escreve | `EXPLAIN ANALYZE` só dentro de `BEGIN; … ROLLBACK;`, como a doc manda, e nunca em produção sem o usuário pedir |

Fonte: https://www.postgresql.org/docs/current/using-explain.html e https://www.postgresql.org/docs/current/sql-explain.html

Outro banco: o `EXPLAIN` (ou equivalente) da doc oficial dele.

## Render

- Siga o "How to measure" de [PERFORMANCE.md](../frontend-house-style/PERFORMANCE.md#how-to-measure).
- O `<Profiler onRender>` entrega `actualDuration` (tempo do render atual) e `baseDuration` (estimativa sem otimização); o profiling vem **desligado no build de produção** e precisa do build de profiling do React.

Fonte: https://react.dev/reference/react/Profiler

## Memory

| Onde | Como | Fonte |
| --- | --- | --- |
| Node | `process.memoryUsage().heapUsed` antes e depois, nos mesmos tamanhos da dobra | https://nodejs.org/api/process.html#processmemoryusage |
| Navegador | Heap snapshot e allocation timeline do Chrome DevTools; snapshot antes e depois de repetir a ação | https://developer.chrome.com/docs/devtools/memory-problems |
| Go | `b.ReportAllocs()` no benchmark | https://pkg.go.dev/testing#B.ReportAllocs |

Memória que sobe a cada repetição da mesma ação, sem voltar, é vazamento; registre a ação e o crescimento por repetição.

## Anti-patterns

- **Medição no modo dev:** tempo medido com o build de desenvolvimento e as checagens extras ligadas; o número não vale para produção.
- **Uma execução só:** um tempo por tamanho, sem repetição; o ruído vira "crescimento".
- **Benchmark esquecido:** o arquivo `.tmp.test` fica no projeto e passa a rodar no CI.
