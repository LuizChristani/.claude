---
name: qa-plan
description: How the QA skill builds a test plan — inventory of the units in scope, risk-based priority, where the expected result comes from (the oracle), and the case catalog for pure functions, hooks and components, mobile device boundaries and HTTP endpoints. Use when writing the plan section of a QA report.
type: reference
scope: cross-cutting
tokens: ~1.5k
---

# Test plan

> **TL;DR:** Inventário das unidades, prioridade por risco, e para cada unidade os casos com a fonte do resultado esperado. Sem fonte, o caso vira dúvida.

## Inventory

Uma linha por unidade testável no escopo, antes de escrever qualquer caso.

| Unidade | Tipo | Arquivo | Testes hoje | Risco |
| --- | --- | --- | --- | --- |
| `calculateInvoiceTotal` | Função pura | `lib/invoices/calculateInvoiceTotal.ts` | Nenhum | Alto |
| `POST /invoices` | Endpoint | `routes/invoices.ts` | Só sucesso | Alto |

- "Testes hoje" diz o que já existe: o plano completa, não repete. A lista do `qa-scan.mjs` e a cobertura do runner preenchem essa coluna.
- Unidade que não dá para testar sem mudar o código entra no inventário com tipo "Não testável" e vai para o relatório.

## Priority

Teste primeiro o que, se quebrar, custa mais. Critérios, nesta ordem:

| # | Critério | Exemplo neutro |
| --- | --- | --- |
| 1 | Mexe com dinheiro, dado do usuário, autenticação ou permissão | Total, login, exclusão |
| 2 | Está no fluxo principal do app | Criar e listar o recurso central |
| 3 | Mudou há pouco ou já quebrou antes | Arquivos do diff, bugs de relatórios anteriores |
| 4 | Tem muitas ramificações | Função com vários `if` ou mapa de estados |

Não há número oficial de casos por unidade; o catálogo abaixo decide quais existem.

## Oracle

O resultado esperado de cada caso vem de uma destas fontes, nesta ordem:

| # | Fonte | Como citar no plano |
| --- | --- | --- |
| 1 | O que o usuário pediu na conversa ou no pedido da feature | "pedido" |
| 2 | O `.claude/`, o `CLAUDE.md` ou a doc da aplicação | caminho do arquivo |
| 3 | O contrato: tipos, schema, JSDoc, nome da função, status HTTP da spec | `arquivo:linha` |
| 4 | Comportamento atual **coerente** com 1–3 e sem sinal de erro | "atual, coerente com …" |

- Saída atual que contradiz 1–3 é **bug**.
- Saída atual que nenhuma fonte confirma nem contradiz (o vazio devolve `null` ou `[]`?) é **dúvida**: entra no relatório como pergunta e fica sem teste até a resposta.

## Case catalog

### Função pura

| Caso | O que afirmar |
| --- | --- |
| Caminho feliz | O valor exato para uma entrada típica |
| Vazio | Lista vazia, string vazia, objeto sem campos opcionais |
| Zero e negativo | `0`, `-1` onde o tipo permite |
| Limite | Primeiro e último valor aceitos, e um além de cada um |
| Inválido | Entrada fora do contrato: erro lançado ou valor de erro, como o contrato diz |
| Cada ramificação | Um caso por `if`, por chave de mapa e por estado |

### Hook e componente (web e mobile)

| Caso | O que afirmar |
| --- | --- |
| Estados de dado | Carregando, vazio, erro e com dado, cada um com o texto que o usuário vê |
| Regra exposta | A regra que o hook expõe, testada pela função de `lib/` que ele usa |
| Permissão e papel | O que aparece e o que some para cada papel |

### Fronteira do aparelho (mobile)

| Caso | O que afirmar |
| --- | --- |
| Permissão negada | O app mostra o caminho para conceder, sem quebrar |
| Sem rede | Erro com saída para tentar de novo; nada se perde |
| Relógio, armazenamento, módulo nativo | Com o mock da fronteira devolvendo sucesso, falha e valor estranho |

Código nativo (Kotlin, Java) só entra se o projeto já tiver o runner nativo configurado; senão, vai para "Não testável".

### Endpoint HTTP

| Caso | Status esperado (RFC 9110) |
| --- | --- |
| Sucesso | `200`, `201` ou `204`, e o corpo no formato do contrato |
| Sem credencial | `401` |
| Credencial sem permissão | `403` |
| Recurso inexistente | `404` |
| Corpo inválido | `400` ou `422`, o que o projeto padronizou |
| Conflito (duplicado, versão velha) | `409` |
| Dado de outro usuário | Nunca aparece na resposta |

Fonte: https://www.rfc-editor.org/rfc/rfc9110#section-15

O status exato de cada caso segue o que a API documenta; o RFC decide só o significado de cada código.

## Plan format

Cada caso é uma linha no relatório:

| ID | Unidade | Caso | Entrada | Esperado | Fonte |
| --- | --- | --- | --- | --- | --- |
| C1 | `calculateInvoiceTotal` | Desconto maior que o total | itens `1000`, desconto `1500` | `0` | pedido |
| C2 | `calculateInvoiceTotal` | Sem itens | `[]` | `0`? | dúvida |

## Anti-patterns

- **Plano sem fonte:** a coluna "Esperado" preenchida rodando a função; o plano vira fotografia do código atual.
- **Catálogo pela metade:** só o caminho feliz porque "o resto é improvável"; o improvável é onde o bug mora.
