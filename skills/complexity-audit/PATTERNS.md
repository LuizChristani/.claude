---
name: complexity-audit-patterns
description: Catalog of heavy-code patterns the complexity audit looks for and the optimization proposed for each — linear search inside a loop, spread accumulation, N+1 queries and requests, sequential awaits, load-all-then-filter, sort inside a loop, unindexed filters, heavy render computation and unbounded memory — with wrong-vs-right examples and the price of each fix. Use when reading code for heavy spots or writing the proposals of a complexity report.
type: reference
scope: cross-cutting
tokens: ~2k
---

# Patterns

> **TL;DR:** Cada padrão tem nome, custo antes e depois e o preço do conserto. A proposta só vale se o resultado continuar igual, incluindo ordem, duplicados e vazio.

## Catalog

| Padrão | Custo antes | Proposta | Custo depois | Preço |
| --- | --- | --- | --- | --- |
| **Busca linear no loop** (`find`, `filter`, `includes` dentro de `map`/`for`) | O(n·m) | Índice `Map`/`Set` montado uma vez | O(n + m) | Memória O(m) |
| **Acúmulo por cópia** (`[...acc, x]`, `{ ...acc, [k]: v }` no `reduce`) | O(n²) tempo e alocação | `push` num array local, `flatMap`, `Object.fromEntries` | O(n) | Nenhum |
| **N+1 de consulta ou requisição** | 1 + n chamadas | Consulta em lote ou junção, agrupada num `Map` | 2 chamadas (ou 1) | Agrupar no código; consulta maior |
| **Await em fila** (`await` independente dentro do loop) | n × ida e volta | Lote; sem lote, `Promise.all` com limite de concorrência | 1 ida e volta | `n` chamadas continuam; carga no servidor |
| **Carrega tudo, filtra na memória** | O(tabela) de rede e memória | Filtro, ordenação e paginação no banco ou na API | O(página) | Mudar a consulta ou o contrato da API |
| **Ordena no loop** | O(n · n log n) | Ordenar uma vez fora do loop | O(n log n) | Nenhum |
| **Filtro sem índice** | O(linhas) por consulta no banco | Índice na coluna do filtro, confirmado pelo `EXPLAIN` | Sublinear com índice | Escrita mais lenta e espaço em disco |
| **Cálculo pesado no render** | Custo × renders | Baixar o custo numa função de `lib/`; memoizar só pelas regras de [PERFORMANCE.md](../frontend-house-style/PERFORMANCE.md) | O custo novo, uma vez por mudança de entrada | Ver PERFORMANCE.md |
| **Memória sem teto** (cache sem limite, listener sem remoção) | Cresce enquanto o app roda | Limite de tamanho ou expiração; remover o listener na limpeza | Limitada | Código de limpeza |

## Wrong vs right

### Busca linear no loop

❌ Errado: para cada pedido, uma busca linear na lista de usuários. O(n·m), `n` = pedidos, `m` = usuários.

`lib/orders/attachUsers.ts`:

```ts
export function attachUsers(orders: Order[], users: User[]) {
  const withUsers = orders.map((order) => ({
    ...order,
    user: users.find((user) => user.id === order.userId),
  }));
  return withUsers;
}
```

✅ Certo: o índice é montado uma vez. O(n + m), com memória O(m) a mais; o resultado é igual, inclusive `undefined` para usuário que não existe.

`lib/orders/attachUsers.ts`:

```ts
export function attachUsers(orders: Order[], users: User[]) {
  const usersById = new Map(users.map((user) => [user.id, user]));
  const withUsers = orders.map((order) => ({ ...order, user: usersById.get(order.userId) }));
  return withUsers;
}
```

Fonte: https://tc39.es/ecma262/#sec-map-objects

### Acúmulo por cópia

❌ Errado: cada volta copia tudo o que já foi acumulado. O(n²) de tempo e de alocação, `n` = posts.

```ts
export function collectTags(posts: Post[]) {
  const tags = posts.reduce<string[]>((acc, post) => [...acc, ...post.tags], []);
  return tags;
}
```

✅ Certo: uma passada, sem cópia do acumulado. O(n + total de tags).

```ts
export function collectTags(posts: Post[]) {
  const tags = posts.flatMap((post) => post.tags);
  return tags;
}
```

### N+1 de consulta

❌ Errado: uma consulta para os usuários e uma por usuário para as faturas. 1 + n chamadas, em fila.

`lib/http/loadUsersWithInvoices.ts`:

```ts
export async function loadUsersWithInvoices(repo: BillingRepo) {
  const users = await repo.listUsers();
  const result = [];
  for (const user of users) {
    const invoices = await repo.listInvoicesByUser(user.id);
    result.push({ ...user, invoices });
  }
  return result;
}
```

✅ Certo: duas chamadas, independente de `n`, agrupadas num `Map`. O repositório precisa de um método em lote (`WHERE user_id IN (…)` ou endpoint em lote); se ele não existir, a proposta inclui criá-lo.

`lib/http/loadUsersWithInvoices.ts`:

```ts
export async function loadUsersWithInvoices(repo: BillingRepo) {
  const users = await repo.listUsers();
  const invoices = await repo.listInvoicesByUsers(users.map((user) => user.id));
  const invoicesByUser = Map.groupBy(invoices, (invoice) => invoice.userId);
  const result = users.map((user) => ({ ...user, invoices: invoicesByUser.get(user.id) ?? [] }));
  return result;
}
```

Fonte: https://tc39.es/ecma262/#sec-map.groupby (`Map.groupBy`, ES2024; confira o suporte do runtime do projeto)

**🔧 Stack note:** em ORM, a mesma ideia é o carregamento antecipado da relação (eager loading); o nome e a API são os da doc oficial do ORM do projeto.

## Proving the result is the same

| Proposta | Prova |
| --- | --- |
| Qualquer troca de algoritmo | Testes da função antes e depois, com vazio, duplicado, chave ausente e ordem ([qa](../qa/SKILL.md)) |
| Lote no lugar de N+1 | Mesmo resultado com 0, 1 e vários itens, e com item sem filhos |
| Filtro movido para o banco | Mesma lista para os mesmos filtros, incluindo a ordenação |

## Anti-patterns

- **Índice para lista fixa:** montar `Map` para 5 itens que nunca crescem; mais código, nenhum ganho.
- **Paralelo como cura do N+1:** trocar o `for await` por `Promise.all` e chamar de resolvido; as `n` chamadas continuam.
- **Índice no chute:** propor índice sem o `EXPLAIN` mostrar a varredura sequencial da tabela grande.
