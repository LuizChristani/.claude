---
name: qa-regression-tests
description: How the QA skill writes regression tests for code that already exists — only test files change, asserted values come from the plan's oracle, mocks only at the boundary, a test that exposes a bug becomes a known failure with a bug ID using the runner's expected-failure marker, and the lifecycle of that marker once the bug is fixed. Use when writing or running the tests of a QA plan.
type: reference
scope: cross-cutting
tokens: ~1.5k
---

# Regression tests

> **TL;DR:** Siga o runner, a pasta e as regras de teste que o projeto já tem. Afirme o valor do plano, não o da função. Bug achado: o teste entra com o marcador de falha esperada e o ID do bug no nome.

## Rules

| Regra | Detalhe |
| --- | --- |
| Só arquivo de teste | Criar ou editar teste, fixture e mock de teste; nunca o arquivo testado nem o config do runner |
| Padrão do projeto | Local, nome e idioma dos testes como o projeto já faz; em React, [TESTING-TOOLING.md](../frontend-house-style/TESTING-TOOLING.md) |
| Valor literal do plano | `expect(total).toBe(0)`, nunca o esperado recalculado com a mesma conta da função |
| Mock na fronteira | Rede, relógio, armazenamento, aleatório e módulo nativo; a unidade e as funções puras que ela chama rodam de verdade |
| Determinístico | Relógio fixo, dados fixos, nenhuma rede real; o teste passa igual em qualquer máquina |
| Um caso, um teste | O nome do teste é a frase do caso do plano, no idioma de teste do projeto |

## Known failure

Quando o teste do caso falha porque a função está errada (o esperado tem fonte e a saída contradiz):

1. Gere o ID `QA-AAAA-MM-DD-N` (data do relatório, `N` sequencial nele).
2. Marque o teste com o marcador de falha esperada do runner e ponha o ID no fim do nome.
3. Registre o bug no relatório com o mesmo ID ([REPORT.md](REPORT.md)).

| Runner | Marcador | Fonte |
| --- | --- | --- |
| Vitest | `it.fails(name, fn)` ou opção `{ fails: true }`: passa se falhar, falha se passar | https://vitest.dev/api/#test-fails |
| Jest | `it.failing(name, fn)`: mesmo comportamento; só com o runner padrão `jest-circus` | https://jestjs.io/docs/api#testfailingname-fn-timeout |
| pytest | `@pytest.mark.xfail(strict=True, reason="QA-…")`: com `strict`, passar inesperadamente falha a suíte | https://docs.pytest.org/en/stable/how-to/skipping.html#strict-parameter |
| Sem marcador (ex.: Go `testing`) | Pular com o ID no motivo (`t.Skip("QA-…")`); avise no relatório que o teste **não** avisa quando o bug for corrigido | https://pkg.go.dev/testing#hdr-Skipping |

**🔧 Stack note:** o marcador inverte o resultado: quando o bug for corrigido, o teste passa a falhar e avisa.

❌ Errado: o teste copia a saída atual e fica verde. O total negativo vira comportamento esperado.

`lib/invoices/tests/calculateInvoiceTotal.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { calculateInvoiceTotal } from '../calculateInvoiceTotal';

describe('calculateInvoiceTotal', () => {
  it('applies a discount larger than the items', () => {
    const total = calculateInvoiceTotal({ items: [{ amount: 1000 }], discount: 1500 });
    expect(total).toBe(-500);
  });
});
```

✅ Certo: o teste afirma o esperado do plano (`0`, fonte "pedido") e entra como falha conhecida com o ID do bug.

`lib/invoices/tests/calculateInvoiceTotal.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { calculateInvoiceTotal } from '../calculateInvoiceTotal';

describe('calculateInvoiceTotal', () => {
  it('sums the item amounts', () => {
    const total = calculateInvoiceTotal({ items: [{ amount: 1000 }, { amount: 500 }], discount: 0 });
    expect(total).toBe(1500);
  });

  it.fails('never returns a negative total [QA-2026-01-15-1]', () => {
    const total = calculateInvoiceTotal({ items: [{ amount: 1000 }], discount: 1500 });
    expect(total).toBe(0);
  });
});
```

## After the fix

O conserto não é desta skill, mas o ciclo do marcador é:

| Situação | O que fazer |
| --- | --- |
| O teste marcado passou a falhar ("passou inesperadamente") | O bug foi corrigido: tire o marcador, rode de novo e mude o status no relatório para "Corrigido" |
| O teste marcado continua passando | O bug segue aberto; nada muda |
| O comportamento mudou por decisão do usuário | Atualize o esperado e a fonte no plano; tire o marcador |

## Not testable

Código que só se testa mudando produção (regra dentro do componente, dependência criada lá dentro sem como injetar, `new Date()` no meio da regra) fica sem teste. No relatório: unidade, motivo e a mudança mínima que tornaria testável, como proposta.

## Running

1. Rode só os arquivos novos e confirme que cada um passa (ou falha, se marcado) **pelo motivo certo**: leia a mensagem da asserção.
2. Rode a suíte inteira; nenhum teste antigo pode ter mudado de resultado.
3. Rode o lint e o formatter do projeto nos arquivos de teste tocados (inclusive os editados por shell).

## Anti-patterns

- **Espelho da implementação:** o esperado é calculado com a mesma fórmula da função (`expect(total).toBe(items.reduce(…) - discount)`); o teste repete o bug.
- **Mock da própria unidade:** a função testada ou a regra pura que ela chama é mockada; o teste prova só o mock.
- **Marcador mudo:** falha conhecida sem ID, ou `skip` "temporário" sem entrada no relatório.
- **Verde pelo motivo errado:** o teste marcado falha por import quebrado ou mock errado, não pelo bug; o marcador esconde o erro do próprio teste.
