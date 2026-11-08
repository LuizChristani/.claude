---
name: frontend-house-style-authoring
description: The authoring standard for this skill and every skill in the library — project-agnostic content, neutral examples written from scratch, frontmatter with "Use when" triggers, file skeleton, writing rules, wrong-vs-right format, official-doc sourcing, size limits, and how a user correction becomes a rule. Use when creating or editing any skill file, recording a user correction into a skill, or reviewing a skill for quality.
type: reference
scope: cross-cutting
tokens: ~2k
---

# Authoring

> **TL;DR:** Uma skill ensina o **como**, sem o domínio de nenhum projeto. Exemplos são escritos do zero, seguem o estilo da casa e cada afirmação sobre uma API vem da documentação oficial. `SKILL.md` curto, detalhe em arquivos irmãos.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when |
| --- | --- |
| Criar ou editar qualquer arquivo de skill | Escrever código de aplicação → as regras da própria skill |
| Transformar uma correção do usuário em regra | Documentar um projeto específico → o `.claude/` daquele projeto |
| Revisar a qualidade de uma skill | — |

## Global vs per-project

| Onde | O que entra |
| --- | --- |
| Biblioteca compartilhada de skills (a pasta `skills/` onde esta skill mora) | Padrões, anti-patterns, trade-offs e checklists que valem para **qualquer** projeto |
| `<projeto>/.claude/` | O domínio, os caminhos, as decisões e as exceções **daquele** projeto |

- Se uma frase só faz sentido num projeto, ela não entra na skill compartilhada.
- Ao extrair um padrão de um projeto, leve só o padrão: o código, os nomes e os ajustes de lá ficam lá.
- Em choque, a regra do `.claude/` do projeto vence a da skill compartilhada.

## Neutral vocabulary

Os exemplos usam domínios neutros, nunca os substantivos do projeto de onde o padrão saiu.

| ❌ Vaza um projeto | ✅ Use |
| --- | --- |
| Substantivos do domínio do projeto de onde o padrão saiu (o negócio, os produtos e os papéis de usuário dele) | `users`, `posts`, `notifications`, `invoices`, `upload`, `checkout` genérico |
| Nome de serviço ou empresa | `service-a`, "a API" |
| Símbolo, código de moeda ou regra de um país específico | `amount` em unidade menor, `DEFAULT_CURRENCY` |
| Ajustes de um projeto (tempo de cache, tamanhos, breakpoints, número de retries) | O princípio, com o valor deixado para o projeto |

Quando um padrão depende de uma lib, marque: **🔧 Stack note:** e diga o que vale para outras libs.

## Frontmatter

```yaml
---
name: kebab-case-id
description: One sentence on what it does. Use when <specific triggers, keywords, file types>.
type: skill | reference
scope: frontend | backend | cross-cutting
tokens: ~2k
---
```

- A `description` é a única coisa que o modelo vê para decidir se carrega a skill: primeira frase = o que faz; segunda = "Use when …", com os gatilhos reais (palavras do usuário, tipos de arquivo, tarefas).
- Terceira pessoa, em inglês, até ~1024 caracteres.
- `disable-model-invocation: true` só em skill que deve ser chamada à mão.

## File skeleton

```md
# <Title>

> **TL;DR:** 1–3 linhas acionáveis.

## Use when / Don't use when
## Core principle
## How to do it
## Wrong vs right
## Anti-patterns
## Trade-offs
## Checklist
## See also
```

Pule uma seção só quando ela realmente não se aplica.

## Writing rules

| # | Regra | Detalhe |
| --- | --- | --- |
| 1 | Tabela para dado estruturado | Opções, mapeamentos e matrizes de decisão viram tabela, não parágrafo |
| 2 | Nenhum bloco de prosa com mais de 4 linhas | Virou parágrafo longo? Transforme em lista, tabela ou checklist |
| 3 | Exemplo concreto e copiável | Código real, não pseudo-código; quem lê troca os nomes e usa |
| 4 | Toda frase é acionável | Nada de "é importante considerar…": diga o que fazer |
| 5 | Dê nome ao anti-pattern | "Store-espelho", "lógica na tela"; nomear é metade do valor |
| 6 | Regra de decisão, não "depende" | Com número **só quando a fonte dá um**; se a doc oficial não tem número, diga isso e liste os critérios |
| 7 | Diga o custo | Todo padrão diz o que custa e quando o simples vence |
| 8 | Checklist verificável | Cada item é um sim ou não que dá para conferir |
| 9 | Um fato mora num lugar só | Os outros arquivos linkam, não copiam |
| 10 | Ancorado em versão | "React 19+: `ref` é prop", nunca "o React novo" |

## Code examples

- Seguem o estilo da casa: sem `//` no código, `const` antes do `return`, JSDoc ≤ 2 linhas, um componente por arquivo, sem `switch`.
- Vários arquivos no mesmo exemplo: um bloco por arquivo, com o nome do arquivo na linha acima (`` `UserCard.tsx`: ``).
- Errado e certo vêm marcados **fora** do código: um parágrafo começando com "❌ Errado:" ou "✅ Certo:" e o motivo, depois o bloco. Nunca `// ❌` dentro do código.
- O exemplo errado pode quebrar as regras de propósito; o certo nunca.

## Official docs as source

- Toda afirmação sobre uma API (assinatura, comportamento, status, versão) é conferida na documentação oficial antes de entrar na skill ([OFFICIAL-DOCS.md](OFFICIAL-DOCS.md)).
- Padrão novo trazido da doc leva o link da página logo abaixo do exemplo (`Fonte: https://…`).
- Se a doc contradiz a skill, a skill é corrigida na hora e o usuário é avisado.
- Nunca tutorial, blog ou resposta de fórum como fonte.

## Size and structure

| Arquivo | Regra |
| --- | --- |
| `SKILL.md` | Até ~100 linhas: TL;DR, quando usar, princípio, procedimento, regras obrigatórias, anti-patterns, trade-offs e checklist |
| Arquivos irmãos (`CODE-STYLE.md`, `PERFORMANCE.md`…) | O detalhe; linkados a partir do `SKILL.md`, a um nível de profundidade só |
| `scripts/` | Checagens determinísticas (como o `check-style.mjs`); toda regra que dá para checar por texto ganha uma checagem |

## From correction to rule

Quando o usuário corrige código, no mesmo turno:

1. Registre a correção no arquivo de memória de correções que o `CLAUDE.md` do workspace indica, no formato de lá, citando o arquivo da skill que mudou.
2. Ache o arquivo da skill que cobre o assunto. Se nenhum cobre, pergunte ao usuário onde a regra mora.
3. Escreva a regra com motivo, o exemplo errado e o certo, e o anti-pattern com nome.
4. Corrija os exemplos da skill que quebravam a regra nova.
5. Se der para checar por texto, adicione a checagem ao `scripts/check-style.mjs` e rode-o num projeto real para ver se aponta casos verdadeiros.
6. Se a regra for obrigatória, adicione uma linha na tabela "Non-negotiables" do `SKILL.md`.

## Language

- Código, identificadores, `description` do frontmatter e títulos de seção: inglês.
- Explicações: PT-BR com acentuação correta (á, ã, ç, é, í, ó, ú). Texto sem acento é erro de ortografia.
- Um idioma por arquivo para as explicações.

## Checklist

- [ ] Nenhum substantivo, caminho ou ajuste de um projeto específico
- [ ] Frontmatter completo; `description` com "Use when …"
- [ ] Nenhum bloco de prosa com mais de 4 linhas; dado estruturado em tabela
- [ ] Pelo menos um anti-pattern com nome e um trade-off
- [ ] Exemplos no estilo da casa; errado e certo marcados fora do código
- [ ] Toda API conferida na doc oficial, com link quando o padrão é novo
- [ ] `SKILL.md` com até ~100 linhas; links resolvem; nenhum fato duplicado
- [ ] PT-BR com acentuação correta
