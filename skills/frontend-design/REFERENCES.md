---
name: frontend-design-references
description: Verified human-made design references for task and productivity UIs — design decisions published by the teams (Linear, Notion, Things, Bear, Todoist, Carbon, Atlassian, Geist, Radix), numbers measured on their live sites, what they have in common, and how to run a reference sweep before designing. Use at the start of any screen design, when a UI looks generic, or when you need a real number (type pair, spacing step, radius, motion duration) with a source.
type: reference
scope: frontend
tokens: ~2.5k
---

# Human-made references

> **TL;DR:** Regra não substitui olhar trabalho de gente boa. Antes de desenhar, abra 3 a 5 referências feitas por pessoas, extraia decisões concretas (método e número) e olhe como elas **parecem**. Texto diz o que fizeram; só olhar mostra o resultado.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when |
| --- | --- |
| Começar o desenho de uma tela, ou quando ela parece genérica | Checar contraste ou foco → [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| Precisar de um número (par de tipo, passo de espaço, raio, duração) com fonte | Decidir a estrutura de arquivos → `frontend-house-style` |

## Reference sweep

| Passo | O que fazer |
| --- | --- |
| 1. Escolher | 3 a 5 produtos do mesmo tipo que a tela, feitos por pessoas identificáveis |
| 2. Ler | Post de design, estudo de caso ou documentação do sistema; anote método e número, com a URL |
| 3. Olhar | Abra o site ou o produto num navegador, tire um print e descreva o que vê: tipo, escala, cor, densidade, identidade |
| 4. Medir | No site vivo, leia o CSS calculado (fonte, tamanho, peso, espaçamento entre letras, raio, fundo) |
| 5. Registrar | No plano de [DIRECTION.md](DIRECTION.md): o que você adota, o que descarta e por quê |

**Pesquisa delegada:** quem pesquisa por você pode inventar. Na primeira rodada, 1 de 8 afirmações verificadas tinha uma citação que não existe na página. Reabra toda fonte antes de pôr um fato numa skill.

## Verified facts

Verificado = a página foi aberta por quem escreveu esta skill, em 2026-11-04.

| Fonte | Fato | Aplicação |
| --- | --- | --- |
| [Linear, redesign (parte II)](https://linear.app/now/how-we-redesigned-the-linear-ui) | O tema passou de 98 variáveis para 3: cor base, acento e contraste, em LCH; títulos em Inter Display e o resto em Inter; o azul do chrome foi reduzido nos cálculos de cor | Gere os temas claro e escuro de poucas entradas; use uma família com papel de título e de texto |
| [Notion, páginas](https://www.notion.com/blog/updating-the-design-of-notion-pages) | "When a list item's neighbor is another list item, we reduce the padding" | O espaço entre linhas de lista é menor que entre grupos; o espaço depende do vizinho |
| [Things, novidades](https://culturedcode.com/things/features/) | Campos extras da tarefa ficam "neatly tucked away in the corner until you need them" | Mostre só o título; categoria e prazo aparecem quando preciso |
| [Bear Sans](https://blog.bear.app/2023/08/learn-about-our-new-custom-font-bear-sans/) | "Avenir can be fatiguing to read at smaller body text sizes"; mudou altura-x e aberturas das letras | Fonte geométrica larga cansa em corpo pequeno; escolha pelo desenho das letras |
| [Carbon, movimento](https://www.carbondesignsystem.com/building-blocks/foundations/motion/overview) | Durações 70, 110, 150, 240, 400 e 700 ms; curva produtiva `cubic-bezier(0.2, 0, 0.38, 0.9)` | Hover e botão a 70–110 ms; expansão pequena a 150 ms |
| [Atlassian, movimento](https://atlassian.design/foundations/motion) | Interações 50–150 ms; transições 150–400 ms; `ease-out` prático `cubic-bezier(0.4, 1, 0.6, 1)` | Movimento do dia a dia curto, para não atrasar a próxima ação |
| [Vercel Geist, materiais](https://vercel.com/geist/materials) | Raios: 6 px (base, pequeno, tooltip), 12 px (médio, grande, menu, modal), 16 px (tela cheia) | Raio por camada, não um só para tudo |
| [Radix Themes, tipografia](https://www.radix-ui.com/themes/docs/theme/typography) | Pares tamanho/entrelinha: 12/16, 14/20, 16/24, 18/26, 20/28, 24/30, 28/36 | Use os pares juntos |

**Relatados por outra pesquisa e não reabertos por mim:** Primer (espaço 0, 4, 8, 16, 24, 32, 40, 48, 64, 80, 96, 112, 128 px), Atlassian (base de 8 px), Carbon (2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160 px), Todoist Quick Add (`#projeto`, data digitada), Akiflow (`#`, `*`, `<`, Esc remove o reconhecimento), Superhuman (atalho ao lado do comando). Confira antes de citar.

## Measured on live sites

Medição em 2026-11-04, no CSS calculado das páginas de marketing (não do app logado).

| Site | Corpo | Título (h1) | Fundo | Acento |
| --- | --- | --- | --- | --- |
| Linear | Inter Variable 16/24 | 64 px, peso 510, −0,022 em | `rgb(8, 9, 10)` | `rgb(94, 106, 210)` |
| Todoist | Graphik 16 | 55 px, peso 600, −0,01 em | branco quente `oklch(0.9945 0.0017 67.8)` | `rgb(228, 66, 50)` |
| Superlist | sem-serifa | Haffer 64 px, peso 600, −0,02 em | `rgb(24, 24, 36)` | vermelho-laranja |
| Notion | NotionInter 16/24 | 96 px, peso 600, −0,048 em | branco | `rgb(0, 117, 222)` |
| Raycast | Inter 16 | 64 px, peso 600 | `rgb(7, 8, 10)` | claro neutro |
| Amie | Inter 16/28 | — | `rgb(250, 250, 250)` | `rgb(17, 168, 255)` |
| Bear | Bear Sans 16/27,2 | Bear Sans Headline 51 px, peso 400 | — | — |
| Things | sistema 18/25,2 | 24 px, peso 400 | `rgb(242, 245, 247)` | azul |

## What they share (observed)

| Traço | O que se vê | Aplicação |
| --- | --- | --- |
| Título grande com espaçamento negativo | 55–96 px, entre −0,01 e −0,05 em, pesos 500–600 | Um título com personalidade, não o tamanho do corpo |
| Corpo em 16 px, entrelinha 1,5 a 1,7 | Em quase todos | Texto de leitura nunca abaixo de 16 px |
| Fundo com matiz | Quase-preto azulado, branco quente, azul-gelo; nunca cinza puro | Dê um matiz ao neutro |
| Um acento assumido | Uma cor só, usada com decisão | Acento na ação principal e na identidade |
| Elemento de identidade | Logo, ícone ou ilustração forte (o ícone grande do Things, o logo do Todoist) | Uma marca visível, mesmo simples |
| Interface do produto quieta | Texto pequeno, linhas finas, metadados discretos, data com cor semântica | O app é calmo; o título e a marca carregam o caráter |
| Texto com ponto de vista | "Clareza, finalmente." | Título e vazio com voz própria |
| Raio 8–10 px nos botões | Todoist 8, Superlist 10, Amie 8, Raycast 8, Notion 8 | Raio moderado e consistente |

## Anti-patterns

- **Referência só de texto:** ler o post e nunca abrir o produto; o resultado fica descrito, não visto.
- **Pesquisa delegada sem conferir:** pôr na skill o que um agente trouxe sem reabrir a fonte.
- **Copiar o look da página de marketing para dentro do app:** o título de 64 px é da landing; no app, o caráter vem da marca, do vazio e do ritmo.

## Checklist

- [ ] 3 a 5 referências abertas, com URL, método e número anotados
- [ ] Print olhado e descrito; CSS medido nas que importam
- [ ] Nenhum fato de pesquisa delegada sem reabrir a fonte
- [ ] O plano diz o que foi adotado e o que foi descartado
