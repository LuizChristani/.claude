---
name: frontend-design-direction
description: The design direction process of the design skill — ground the subject, write a design plan (named palette, type roles, layout with wireframe, principles), review it against the generic default, build, then critique with screenshots of first-run, populated and error states in both themes; plus the tells of a templated screen, restraint, typography as personality, structure as information, sparing motion and copy as design. Use before designing or redesigning any screen, when a screen looks generic, templated or "vibecoded", or when starting a new UI from a brief.
type: reference
scope: frontend
tokens: ~2.5k
---

# Design direction

> **TL;DR:** Regra e checklist não desenham uma tela. Antes de escrever JSX, escreva um plano de design **para este briefing**, compare com o que você faria em qualquer tela parecida e corrija o que for genérico. Depois de construir, olhe prints do primeiro uso, do preenchido e do erro, nos dois temas.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when |
| --- | --- |
| Desenhar ou redesenhar uma tela, ou começar uma UI de um briefing | Ajustar um token ou um componente isolado → [FOUNDATIONS.md](FOUNDATIONS.md) |
| A tela está correta e mesmo assim parece genérica | Checar contraste, foco e teclado → [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| Revisar o acabamento antes de dizer "pronto" | Camadas, bordas e sombras → [VISUAL-DESIGN.md](VISUAL-DESIGN.md) |

## Core principle

1. **Escolha, não default:** cada decisão de cor, tipo e layout existe por causa deste assunto e deste usuário.
2. **O briefing vence:** se o usuário ou o design system do projeto fixa uma direção, siga-a à risca e seja distinto na composição e no texto.
3. **Uma ousadia só:** um elemento memorável, e o resto quieto e disciplinado.
4. **O primeiro uso é a vitrine:** o estado vazio é o que a pessoa vê primeiro.

## Process

| Etapa | O que fazer | Saída |
| --- | --- | --- |
| 0. Referências | Faça o sweep de [REFERENCES.md](REFERENCES.md): 3 a 5 trabalhos feitos por pessoas, olhados e medidos | Método, número e o que adotar |
| 1. Assunto | Diga qual é o produto, quem usa e qual é o trabalho principal da tela; confirme com o usuário se o briefing não disser | Uma frase de cada |
| 2. Plano | Escreva o plano abaixo, curto | Plano de design |
| 3. Revisão | Pergunte: "se me pedissem outra tela parecida, eu chegaria aqui?" Se sim, é default: mude e diga o que mudou e por quê | Plano revisado |
| 4. Construção | Só agora escreva o código, seguindo o plano revisado | Tela |
| 5. Crítica | Prints do **vazio**, do preenchido e do erro, em claro e escuro; tire um acessório (corte um enfeite que não serve ao briefing) | Lista de ajustes |

**Formato do plano:**

| Parte | Conteúdo |
| --- | --- |
| Cor | 4 a 6 valores nomeados (`fundo`, `superfície`, `texto`, `destaque`…), com o papel de cada um |
| Tipo | As famílias e o papel de cada uma; uma ou duas, e se duas, bem distintas |
| Layout | Uma frase de conceito, um wireframe em ASCII e o alinhamento (esquerda, centro) |
| Princípios | O que torna esta tela diferente das outras |

## Copying a reference screen

Quando o pedido é "igual ao <app ou tela de referência>", a direção já está dada: o trabalho é não perder nada no caminho. Réplica feita a partir de um resumo sai com peças faltando.

| Passo | Como |
| --- | --- |
| 1. Ler a fonte | Abra o código do componente de referência (e dos filhos que ele usa), não um resumo nem um print |
| 2. Inventariar | Liste tudo o que ele mostra: campos de texto, selos e marcas, botões e ações rápidas (inclusive a ação do cabeçalho, como "Editar"), imagem e o que vai sobre ela, e cada estado (promoção, indisponível, vazio, carregando, erro) |
| 2a. Referência no mesmo app | Quando a referência é outro card ou tela do próprio app ("igual ao card de Fechamentos"), use os mesmos componentes que ela usa (a mesma lista, a mesma casca de card, a mesma linha de resumo), não um parecido de outro card |
| 3. Conferir | Antes de entregar, marque cada item da lista na réplica, olhando o print da réplica ao lado da referência |
| 4. Declarar o que falta | O que não dá para trazer (dado que a API não manda, recurso da plataforma) vai escrito na entrega, com o motivo |

❌ Errado: card de produto copiado "de olho": nome e preço, sem a descrição, sem o selo de desconto na foto e sem o botão de adicionar rápido que a referência tem.

❌ Errado: "card novo igual ao de Fechamentos" montado com a linha do card Pagamento (ícone, método em caixa alta) e sem o "Editar" que o card de Fechamentos tem no cabeçalho.

✅ Certo: inventário do card de referência (foto, selo de desconto, botão de adicionar sobre a foto, nome em até 2 linhas, descrição em 1 linha, preço com "a partir de" e preço antigo riscado, estado indisponível), cada item conferido na réplica, e a entrega diz "a faixa de promoção ficou de fora: a API não manda o texto".

## Tells of a templated screen

| Tell | Por que parece gerado | O que fazer |
| --- | --- | --- |
| **Kit de cards** | Tudo em cards iguais, um raio só, a mesma sombra cinza, gradiente decorativo | Hierarquia de superfícies: só o que merece destaque ganha caixa |
| **Destaque em tudo** | A cor de marca em botão, chip, ícone e badge | A marca em um lugar só, a ação principal |
| **Estado vazio de caixa tracejada** | Um ícone pequeno e cinza dentro de uma caixa | Texto que convida a agir, no lugar do conteúdo |
| **Rótulos em caixa alta e metadados com ponto médio** | "ETIQUETA" sobre cada título; `A · B · C` | Rótulo só quando informa; frases normais |
| **Palavra de destaque no título** | Uma palavra em itálico ou outra cor | Título inteiro com o mesmo tratamento |
| **Fundo creme com serifa e barro; ou quase preto com um verde ácido** | As duas combinações mais comuns de página gerada | Use só se o briefing pedir |
| **Tela que pede o mesmo cuidado em todo lugar** | Nada se destaca | Um elemento memorável e o resto calmo |

Fonte da lista e do processo: [Anthropic skills, frontend-design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md) (Apache-2.0); a adaptação é nossa.

## Typography is the personality

| Regra | Detalhe |
| --- | --- |
| Escolha deliberada | Não use a família que você usaria em qualquer projeto; se o projeto já tem uma, trabalhe pela escala, pelo peso e pelo espaçamento |
| Uma ou duas famílias | Se duas, claramente distintas |
| Escala definida | Degraus, pesos e entrelinha escolhidos, não herdados |
| Título é elemento de design | O tratamento do texto faz parte da tela, não só entrega o conteúdo |
| Linha curta | Menos de 80 caracteres; serifa aceita um pouco mais, com mais entrelinha |

## Structure is information

| Regra | Detalhe |
| --- | --- |
| Borda, divisor, número e rótulo dizem algo | Se não dizem, saem |
| Numeração só para sequência | Passo a passo ou linha do tempo; nunca "01 / 02 / 03" decorativo |
| Agrupe pelo significado | Seções que o usuário reconhece ("Pendentes", "Concluídas"), não só uma lista longa |

## Motion, sparingly

| Regra | Detalhe |
| --- | --- |
| Movimento que o usuário não pediu | Pouco e com propósito, para chamar atenção; um momento orquestrado vale mais que efeitos espalhados |
| Movimento que responde à ação | Bem-vindo: abrir, expandir, confirmar, mostrando o que mudou |
| Padrão gerado | Entrada com fade e deslize em toda seção e hover em todo card |

## Copy is design

| Regra | Detalhe |
| --- | --- |
| Palavra existe para facilitar | Escreva do ponto de vista de quem usa, em frases simples |
| Verbo ativo no botão | "Salvar alterações", não "Enviar"; a mesma ação tem o mesmo nome no fluxo todo (botão "Publicar", aviso "Publicado") |
| Vazio é convite | Diga o que fazer, não o clima |
| Erro diz o que houve e como corrigir | Sem pedir desculpa e sem vaguear |
| Cada texto faz uma coisa | Nada repetido na mesma tela |

## Wrong vs right

❌ Errado: estado vazio de lista de notas, com duas caixas do mesmo peso e o texto repetido.

```text
┌────────────────────────────┐
│ Título  [____________]     │
│ Pasta [v]  Data [v]  [Add] │
└────────────────────────────┘
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│   (ícone)                  │
│   Nenhuma nota ainda       │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

✅ Certo: a pergunta é o título e o rótulo do campo, o botão fica colado ao campo, e o vazio é um convite no lugar da lista.

```text
O que você quer anotar?
[ _____________________ ][ Anotar ]
Pasta ▾   Lembrar em ▾

Escreva a primeira nota acima.
Ela aparece aqui, com a pasta e a data.
```

## Trade-offs

- Distinção custa tempo de plano e revisão; evita a tela que serve a qualquer produto e a nenhum.
- Projeto com design system fechado limita cor e tipo: a distinção vem da composição, da hierarquia e do texto.
- Os prints dependem de um navegador no ambiente; sem eles, descreva o que viu e diga que não foi visto.

## Checklist

- [ ] Plano escrito (cor, tipo, layout com wireframe, princípios) e revisado contra o default
- [ ] Nenhum tell da tabela sem uma razão do briefing
- [ ] Um elemento memorável; o resto quieto
- [ ] Prints do vazio, do preenchido e do erro, em claro e escuro, olhados e criticados
- [ ] Estado vazio é um convite; textos sem repetição; botões com verbo ativo
- [ ] Réplica de tela de referência: inventário da fonte conferido item por item, e o que ficou de fora declarado

## See also

- [VISUAL-DESIGN.md](VISUAL-DESIGN.md) — camadas, bordas, destaque e acabamento
- [UX-STATES.md](UX-STATES.md) — os seis estados
- [FORMS-COPY.md](FORMS-COPY.md) — formulários e microcopy
