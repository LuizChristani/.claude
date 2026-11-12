---
name: qa-report
description: Format of the QA report the QA skill writes in the workspace root .claude/qa/<app>/ (never inside the app) — file location and name, sections, the list of everything without tests, bug IDs, severity levels and statuses. Use when creating or updating a QA report or reading one to decide what to fix.
type: reference
scope: cross-cutting
tokens: ~1k
---

# QA report

> **TL;DR:** Um arquivo por rodada em `<workspace>/.claude/qa/<app>/AAAA-MM-DD-<assunto>.md`, na `.claude/` da raiz (a mesma que guarda esta biblioteca de skills), com escopo, o que está sem teste no app inteiro, plano, resultado, bugs, dúvidas e o que não deu para testar. Bug só é relatado; a correção é decidida pelo usuário depois.

## Location

| Item | Regra |
| --- | --- |
| Pasta | `.claude/qa/<app>/` na `.claude/` da raiz do workspace, a mesma que guarda a biblioteca de skills; `<app>` é o nome da pasta da aplicação. **Nunca** no `.claude/` da aplicação: lá ele some (pasta oculta, muitas vezes no `.gitignore`) |
| Nome | `AAAA-MM-DD-<assunto-em-kebab>.md`; segunda rodada no mesmo dia e assunto ganha `-2` |
| Rodada nova sobre o mesmo assunto | Arquivo novo; os bugs ainda abertos da rodada anterior são citados pelo ID, não copiados |

## Bug ID

`QA-AAAA-MM-DD-N`: a data do relatório e um número sequencial dentro dele. O mesmo ID aparece no nome do teste marcado e na seção de bugs.

## Untested

Toda rodada lista o que está sem teste na aplicação **inteira**, não só no escopo pedido.

| Fonte | Quando usar |
| --- | --- |
| Relatório de cobertura do runner | O projeto já tem cobertura configurada: rode o comando dele e use as linhas e arquivos descobertos |
| `scripts/qa-scan.mjs <raiz-da-app>` | Sempre; sem cobertura configurada, é a única fonte. Heurística por import: arquivo que nenhum teste importa (JS/TS, Python), pacote Go sem `_test.go`, classe sem `<Nome>Test` (Kotlin/Java) |

- Agrupe por pasta e marque o risco de cada grupo pelos critérios de [PLAN.md](PLAN.md#priority).
- O que entrou nesta rodada sai da lista; o que ficou de fora é dito com o motivo ("fora do escopo pedido", "não testável").
- Módulo que só aparece em `vi.mock`/`jest.mock` conta como sem teste: o teste o troca por um falso e não o exercita.
- Diga o limite da heurística: arquivo importado por um teste conta como testado, mesmo que só uma função dele tenha caso; e import pelo índice de um pacote (`from '@scope/pkg'`) conta só o índice, então arquivos usados só por ele aparecem como sem teste. Os aliases vêm dos `paths` do `tsconfig.json` da raiz.

## Severity

| Gravidade | Quando |
| --- | --- |
| Crítica | Perde ou corrompe dado, valor de dinheiro errado, falha de segurança ou permissão, app não abre |
| Alta | Fluxo principal quebrado sem contorno |
| Média | Quebrado com contorno, ou borda que o usuário alcança no uso normal |
| Baixa | Texto, visual, ou borda improvável |

Não há escala oficial única; esta é a da casa. Na dúvida entre duas, use a mais alta e diga por quê.

## Status

| Status | Significado |
| --- | --- |
| Aberto | Achado, aguardando avaliação do usuário |
| Aceito | O usuário confirmou que é bug e vai corrigir |
| Não é bug | O usuário confirmou o comportamento atual; o teste vira normal com a fonte "decisão do usuário" |
| Corrigido | O teste marcado passou a falhar, o marcador saiu e o teste está verde |

## Template

```md
# QA · <assunto> · AAAA-MM-DD

## Escopo
- Pedido: <o que foi pedido, nas palavras do usuário>
- Unidades: <pastas, arquivos ou endpoints>
- Runner: <runner e versão>; comando: `<comando de teste>`

## Sem teste (app inteiro)
- Fonte: <cobertura do runner | qa-scan.mjs>
| Pasta | Arquivos sem teste | Risco | Nesta rodada? |
| --- | --- | --- | --- |

## Inventário
| Unidade | Tipo | Arquivo | Testes antes | Risco |
| --- | --- | --- | --- | --- |

## Plano
| ID | Unidade | Caso | Entrada | Esperado | Fonte |
| --- | --- | --- | --- | --- | --- |

## Resultado
- Casos: <n> · testes novos: <n> · arquivos de teste: <lista>
- Suíte: <n> passando, <n> falhas conhecidas, <n> pulados
- Bugs: <n> crítica, <n> alta, <n> média, <n> baixa

## Bugs
### QA-AAAA-MM-DD-1 · <título curto> · <gravidade> · Aberto
- **Onde:** `arquivo:linha`
- **Passos / entrada:** <como reproduzir>
- **Esperado:** <valor> (fonte: <fonte>)
- **Obtido:** <valor>
- **Teste:** `<arquivo de teste>` › `<nome do teste>`
- **Impacto:** <quem é afetado e como>

## Dúvidas
| Caso | Pergunta | Comportamento atual |
| --- | --- | --- |

## Não testável
| Unidade | Motivo | Mudança mínima proposta |
| --- | --- | --- |
```

## Anti-patterns

- **Relatório dentro do app:** o arquivo vai para o `.claude/` da aplicação, que é oculto e costuma estar no `.gitignore`; o usuário procura e não acha. Sempre na `.claude/` da raiz, em `qa/<app>/`.

- **Lista de cobertura só do escopo:** a seção "Sem teste" lista só a feature pedida; o resto do app descoberto some do radar.
- **Bug sem reprodução:** "o total às vezes sai errado", sem entrada, esperado e obtido; ninguém consegue avaliar.
- **Relatório que conserta:** seção "Correções aplicadas"; QA só relata.
- **Gravidade de enfeite:** tudo "Crítica"; a fila de correção perde a ordem.
