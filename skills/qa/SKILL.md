---
name: qa
description: Quality assurance for any app (web React, mobile Android, API/backend), in any project — lists everything in the app that has no test, builds a test plan from the code in scope, writes regression tests for code that already exists so nothing breaks again, marks a test that exposes a bug as a known failure tied to a bug ID, and only reports bugs (never fixes them) in a dated report inside the app's own .claude/qa/. Use when the user runs /qa or asks for "QA", "plano de testes", "testa essa feature", "cobre com testes o que já existe", "teste de regressão", "não quero que quebre mais nada" or "o que está sem teste".
type: skill
scope: cross-cutting
tokens: ~1.5k (references ~4k on demand)
disable-model-invocation: true
---

# QA

> **TL;DR:** Primeiro a lista do que está sem teste no app inteiro, depois o plano, os testes e o relatório. O teste afirma o comportamento **certo**, vindo de uma fonte, nunca o que o código faz hoje. Teste que acha bug entra marcado como falha conhecida com um ID, e o bug vai para o relatório no `.claude/qa/` da aplicação. Código de produção não é tocado.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when (go to) |
| --- | --- |
| O usuário chama `/qa` ou pede QA, plano de testes ou teste de regressão | Escrever o teste de uma feature nova junto com ela → as regras de teste do projeto ([TESTING-TOOLING.md](../frontend-house-style/TESTING-TOOLING.md) em React) |
| Cobrir com testes funções, hooks, telas ou endpoints que já existem | Corrigir um bug do relatório → só depois que o usuário pedir, fora desta skill |
| Conferir o que uma mudança pode ter quebrado | Medir o custo de um algoritmo → skill de complexidade |

## Core principle

**QA mede, não conserta.** A entrega é o plano, os testes e o relatório; o código de produção fica como está. Um teste vale pelo **oráculo**: o resultado esperado vem do pedido, do `.claude/` da aplicação ou do contrato (tipos, JSDoc, nome), nunca da saída atual da função.

## Procedure

1. **Escopo.** Liste o que entra (feature, diff, pasta, endpoint). "Tudo" cobre todos os módulos ([request-reading](../request-reading/SKILL.md)). Leia o `.claude/` da aplicação: as decisões de lá são oráculo.
2. **Stack de teste.** Ache o runner, o config e a pasta de testes que o projeto já usa e confira a API na documentação oficial da versão instalada. Projeto sem runner: relate e pergunte; não instale nada por conta própria.
3. **Sem teste.** Rode `node <this-skill-dir>/scripts/qa-scan.mjs <raiz-da-app>` e, se o projeto já tiver cobertura configurada, o comando de cobertura dele. Liste no relatório **tudo** o que está sem teste na aplicação inteira, não só no escopo, por [REPORT.md](REPORT.md#untested).
4. **Plano.** Monte o inventário e os casos por [PLAN.md](PLAN.md) e escreva-os no relatório antes de qualquer teste. Pedido só de plano termina aqui.
5. **Testes.** Escreva só arquivos de teste, por [REGRESSION-TESTS.md](REGRESSION-TESTS.md). Teste que falha por bug vira falha conhecida com ID; caso sem oráculo vira dúvida, sem teste.
6. **Rodar.** Rode os testes novos e a suíte inteira, o lint e o formatter nos arquivos de teste. A suíte termina verde, com as falhas conhecidas contadas à parte.
7. **Relatório.** Complete o arquivo por [REPORT.md](REPORT.md) e rode o `qa-scan.mjs` de novo: nenhum marcador sem ID ou fora do relatório.
8. **Resposta.** Resumo curto: quantos arquivos sem teste, quantos casos, quantos testes novos, bugs por gravidade, dúvidas e o caminho do relatório. Nenhum bug é corrigido.

## Non-negotiables

| # | Regra | ❌ Violação típica |
| --- | --- | --- |
| 1 | Zero edição em código de produção; só arquivos de teste e o relatório | "Já aproveitei e corrigi o arredondamento" |
| 2 | O valor esperado vem de uma fonte citada no plano, nunca da saída atual | `expect(total).toBe(-500)` porque é o que a função devolve |
| 3 | Teste que expõe bug entra com o marcador de falha esperada do runner e o ID do bug no nome | Teste vermelho na suíte, ou o caso apagado |
| 4 | Todo ID de falha conhecida existe no relatório, e todo bug do relatório tem passos e esperado × obtido | `it.fails('works')` sem ID |
| 5 | Código que não dá para testar sem mudar é só relatado | Extrair a regra do componente "para conseguir testar" |
| 6 | Mock só na fronteira (rede, relógio, armazenamento, módulo nativo); nunca a unidade testada | `vi.mock('../calculateTotal')` no teste do `calculateTotal` |
| 7 | Nada é instalado nem configurado sem o usuário pedir | Adicionar um runner novo ao `package.json` |
| 8 | Toda rodada lista o que está sem teste no app inteiro, mesmo fora do escopo | Relatório que só fala da feature pedida e esconde o resto descoberto |

## Anti-patterns

- **Teste que abençoa o bug:** o teste copia a saída atual e fica verde; o bug vira comportamento oficial e a correção futura quebra o teste.
- **Conserto escondido:** o QA muda o código de produção e o relatório diz "corrigido"; ninguém avaliou a mudança.
- **Só o caminho feliz:** um caso por função, sem vazio, limite, inválido nem erro.
- **Buraco calado:** o QA cobre o escopo e não diz que o resto do app está sem teste; o usuário acha que está protegido.
- **Falha sem rastro:** teste pulado ou marcado como falha sem ID nem entrada no relatório; ninguém lembra por quê.

## Trade-offs

| Escolha | Custo | Quando o simples vence |
| --- | --- | --- |
| Plano escrito antes dos testes | Um passo a mais | Uma função pura pequena com contrato óbvio → plano de 3 linhas |
| Falha conhecida no lugar de teste vermelho | Suíte verde com bug aberto; depende do relatório ser lido | O usuário pediu que a suíte cobre a correção → teste vermelho, avisado |
| Dúvida no lugar de teste | O caso fica descoberto até o usuário responder | O `.claude/` da app ou o contrato já respondem → teste |

## Checklist

- [ ] Nenhum arquivo de produção mudou (`git status` só mostra testes e o relatório)
- [ ] Cada caso do plano tem a fonte do esperado
- [ ] Suíte inteira verde; falhas conhecidas listadas com ID
- [ ] `qa-scan.mjs` sem achados de marcador
- [ ] Relatório em `.claude/qa/` da aplicação com o que está sem teste, plano, resultado, bugs, dúvidas e o que não deu para testar

## See also

- [request-reading](../request-reading/SKILL.md) — "tudo" cobre todos os módulos; análise entrega diagnóstico
- [frontend-house-style/TESTING-TOOLING.md](../frontend-house-style/TESTING-TOOLING.md) — local, nomes e mocks dos testes em React
- [frontend-design/UX-STATES.md](../frontend-design/UX-STATES.md) — estados de tela que viram casos (vazio, carregando, erro)
