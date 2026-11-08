---
name: request-reading
description: How to read what the user is actually asking for before acting, in any project, language or task — the verb decides the deliverable (analyze ends in a diagnosis, change ends in an edit), a vague request to improve something that already exists gets 2–3 proposals before anything is replaced, and a universal scope ("always", "every", "all") covers the whole set. Use when a request says "verifica", "analisa", "olha", "vê o problema", "por que", "investiga", "melhora", "deixa mais fácil", "fica melhor", "sempre", "em todas", "toda vez", or whenever it is unclear whether to edit, propose or only report.
type: skill
scope: cross-cutting
tokens: ~1.5k
---

# Request reading

> **TL;DR:** Antes de agir, decida o que o pedido entrega. Verbo de análise entrega diagnóstico, não código. Pedido vago de melhoria em algo que já existe entrega propostas, não a troca. "Sempre" e "todas" valem para o conjunto inteiro, não para a parte que você escolheu.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when |
| --- | --- |
| O pedido usa verbo de análise ("verifica", "analisa", "olha", "investiga", "por que") | O pedido já diz a mudança ("corrige", "troca X por Y", "implementa") → faça |
| O pedido pede melhoria sem dizer qual ("mais fácil", "melhor", "mais bonito", "mais limpo") | O usuário já escolheu entre propostas → aplique a escolhida |
| O pedido tem escopo universal ("sempre", "em todas", "toda vez", "cada") | Como uma API funciona → a documentação oficial |
| Não está claro se é para editar, propor ou só relatar | — |

## Core principle

**O pedido define a entrega, e a entrega não cresce sozinha.** Achar a causa não autoriza o conserto, ter uma ideia melhor não autoriza a troca, e escolher um pedaço do escopo não cumpre o pedido inteiro. Na dúvida entre fazer mais e perguntar, pergunte.

## How to do it

| O pedido diz | A entrega é | Editar? |
| --- | --- | --- |
| "verifica", "analisa", "olha", "vê o problema", "investiga", "por que X acontece?" | Diagnóstico (causa, evidência com `arquivo:linha`, impacto) e proposta de correção | Não. Só depois que o usuário pedir a mudança |
| "melhora", "deixa mais fácil", "fica melhor", "mais bonito", sobre algo que já existe | 2 ou 3 propostas (mockup, trecho ou descrição curta), cada uma com o custo, e a recomendação | Não. Só a proposta que o usuário escolher |
| "sempre", "em todas", "toda vez", "cada" | A mudança aplicada a todos os membros do conjunto (todas as etapas, telas, rotas, endpoints) | Sim, no conjunto inteiro |
| "corrige", "muda para", "implementa", "adiciona" | A mudança | Sim |

- Frases que **não** mudam o verbo: "o código está na máquina", "tenho acesso ao repositório", "pode olhar o projeto". Elas dizem onde olhar, não o que fazer.
- Escopo universal com conjunto incerto: liste os membros que você achou ("o fluxo tem as etapas A, B, C e D") e pergunte antes de escolher um subconjunto.
- Proposta de melhoria: mostre antes de escrever o código final. Rascunho em arquivo temporário vale; trocar o componente, a função ou o formato que existe não vale.

## Wrong vs right

❌ Errado: "verifica por que o upload está dando erro 500 em homologação". A causa é achada num serviço; um teste e uma correção são escritos e o usuário descobre pelo diff.

✅ Certo: "A causa é o proxy de upload, que devolve o 503 sem os cabeçalhos de CORS (`upload_proxy.go:88`). Proposta: copiar os cabeçalhos antes de escrever o erro. Quer que eu faça a mudança?"

❌ Errado: "deixa mais fácil escolher o tipo de entrega". A lista com rádio vira três cards lado a lado, sem aviso.

✅ Certo: três propostas curtas (lista com rádio maior, cards lado a lado, controle segmentado), cada uma com o custo, a recomendação e a pergunta de qual aplicar.

❌ Errado: "os botões de ação precisam aparecer sempre na tela" num checkout de quatro etapas. A barra fica fixa só nas duas primeiras.

✅ Certo: a barra fixa nas quatro etapas; ou, se não está claro quais telas são do fluxo, "achei as etapas Carrinho, Endereço, Pagamento e Revisão; fixo nas quatro?".

## Anti-patterns

- **Conserto não pedido:** o pedido era de análise e a entrega veio com código editado. O usuário perde o controle do que muda e precisa reverter.
- **Acesso como autorização:** tratar "o código está aqui" ou "pode abrir o projeto" como pedido de mudança.
- **Redesenho surpresa:** pedido vago de melhoria respondido com a troca de algo que funciona, sem mostrar antes; o usuário pede para voltar e o trabalho se perde.
- **Sempre pela metade:** escopo universal aplicado a um subconjunto escolhido por conta própria ("só nas etapas que pareciam importantes").

## Trade-offs

| Escolha | Custo | Quando o simples vence |
| --- | --- | --- |
| Parar no diagnóstico | Um turno a mais até o conserto | O pedido já diz a mudança ("corrige") → faça direto |
| Mostrar propostas antes | Um turno a mais e o trabalho de rascunhar 2 ou 3 caminhos | Há uma só forma razoável, ou o usuário disse qual → aplique |
| Listar o conjunto e perguntar | Uma pergunta | O conjunto é óbvio e fechado (todas as rotas de um arquivo) → aplique em todos |

## Checklist

- [ ] Identifiquei o verbo do pedido e a entrega que ele pede (diagnóstico, propostas ou mudança)
- [ ] Pedido de análise: nenhum arquivo do projeto foi editado; a resposta tem causa, evidência e proposta
- [ ] Pedido vago de melhoria: mostrei 2 ou 3 propostas com recomendação antes de trocar o que existe
- [ ] Escopo universal: a mudança cobre todos os membros do conjunto, ou perguntei quais são
- [ ] Nada foi feito além do que o pedido entrega

## See also

- [frontend-design](../frontend-design/SKILL.md) — como desenhar as propostas de UI depois que o usuário escolhe uma
- [frontend-house-style](../frontend-house-style/SKILL.md) — como escrever o código depois que a mudança é pedida
