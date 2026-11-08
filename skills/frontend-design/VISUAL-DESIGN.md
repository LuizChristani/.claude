---
name: frontend-design-visual-design
description: Visual composition rules of the design skill — visual hierarchy, grouping, surface layers and elevation in light and dark, accent color and button emphasis, borders, radius, component finish, and a diagnosis of why a screen looks amateur. Use when a screen looks flat, generic or "vibecoded", when composing a page or card layout, choosing surface colors, borders, shadows or the accent color, or reviewing visual polish.
type: reference
scope: frontend
tokens: ~2.5k
---

# Visual design

> **TL;DR:** Uma tela profissional tem hierarquia (poucos tamanhos, um destaque), camadas de superfície que se distinguem nos dois temas, cor de destaque só onde importa e acabamento igual em tudo, inclusive nos widgets de terceiros. Os átomos (escala, tokens) estão em [FOUNDATIONS.md](FOUNDATIONS.md); aqui está a composição.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when |
| --- | --- |
| A tela parece chapada, genérica ou "feita por IA" | Escolher um tamanho ou cor isolado → [FOUNDATIONS.md](FOUNDATIONS.md) |
| Compor página, card, lista ou formulário | Contraste, foco e teclado → [ACCESSIBILITY.md](ACCESSIBILITY.md) |
| Decidir superfícies, bordas, sombras e cor de destaque | Estados de carregamento, vazio e erro → [UX-STATES.md](UX-STATES.md) |

## Core principle

1. **Hierarquia antes de enfeite:** o olho acha o mais importante sem ler.
2. **Camadas visíveis:** fundo, superfície e elevado se distinguem em claro e em escuro.
3. **Contenção:** uma cor de destaque, poucos pesos, poucos níveis de sombra.
4. **Consistência:** o mesmo papel tem o mesmo visual em toda a tela, inclusive em lib de terceiro.

## Hierarchy

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| No máximo 3 tamanhos de texto por vista | O elemento mais importante é o maior; no máximo 2 elementos grandes | [NN/g visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/) |
| Faixas de referência | Corpo 14–16 px, subtítulo 18–22 px, título até 32 px | NN/g visual hierarchy |
| Hierarquia vem de contraste, não de matiz | Contraste de valor e saturação; saturado para o importante, vermelho só para aviso e erro | NN/g visual hierarchy |
| Poucas cores de destaque | No máximo 2 primárias e 2 secundárias em design simples; no máximo 3 variações de contraste em design complexo | NN/g visual hierarchy |
| Tamanho, peso e cor trabalham juntos | Ajuste peso, tamanho e cor para enfatizar; evite pesos leves | [Apple HIG typography](https://developer.apple.com/design/human-interface-guidelines/typography) |
| Mais importante no topo e no início | Subordinado vem recuado | [Apple HIG layout](https://developer.apple.com/design/human-interface-guidelines/layout) |
| Teste do olho semicerrado | Desfoque a tela: o que continua legível é o que o olho vê primeiro | NN/g visual hierarchy |

## Grouping and layers

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Proximidade agrupa | Espaço entre grupos maior que dentro do grupo; o rótulo fica mais perto do próprio campo que dos outros | [NN/g proximity](https://www.nngroup.com/articles/gestalt-proximity/); [NN/g form spacing](https://www.nngroup.com/articles/form-design-white-space/) |
| Container só quando o espaço não basta | Borda ou fundo para agrupar; excesso gera ruído, e seção de fundo cheio cria "falso fim de página" | [NN/g common region](https://www.nngroup.com/articles/common-region/) |
| Fundos em três níveis | Primário para a tela, secundário para grupos, terciário para grupos dentro de grupos | [Apple HIG color](https://developer.apple.com/design/human-interface-guidelines/color) |
| Divisor de largura total separa seções sem relação; recuado separa itens do mesmo grupo | 1 px, cor de divisor própria (`outline-variant`) | [Material divider](https://github.com/material-components/material-web/blob/main/docs/components/divider.md) |
| Card para itens diferentes; lista para itens iguais | Itens homogêneos ou para comparar ficam melhor em lista | [NN/g cards](https://www.nngroup.com/articles/cards-component/) |
| Camada acima é mais clara no escuro | Apple: fundo base escuro e elevado mais claro; Material: sobreposição tonal | [Apple HIG dark mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode); [Android Material 3](https://developer.android.com/develop/ui/compose/designsystems/material3) |
| Separação mínima entre fundo e superfície | Nenhuma fonte dá um número de contraste entre camadas. Decisão da casa: degrau de tom **e** borda de 1 px visível, nos dois temas; nunca só um degrau quase igual | Casa (derivada) |

## Surfaces and elevation

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Poucos níveis de elevação | Material tem 6 (0 a +5); em repouso só 0 a +3, e +4 e +5 ficam para hover e arrastar | [Material elevation](https://github.com/material-components/material-web/blob/main/docs/components/elevation.md) |
| Sombra é complemento | Evite "shadow creep": sombra só quando precisa separar de um fundo com padrão | [Material button](https://github.com/material-components/material-web/blob/main/docs/components/button.md) |
| Escala de sombra fixa | `shadow-2xs … 2xl` do Tailwind; não invente por componente | [Tailwind box-shadow](https://tailwindcss.com/docs/box-shadow) |
| Escuro: elevação é tom | A sombra some; a superfície mais alta fica mais clara | Apple HIG dark mode |
| Cores de sistema e semânticas | Sem valor fixo; cada papel com variante clara e escura | Apple HIG dark mode e color |
| `color-scheme` no `:root` | Controles nativos, barras de rolagem e o fundo do canvas seguem o tema; meta `color-scheme` evita o flash | [web.dev color-scheme](https://web.dev/articles/color-scheme) |

## Accent color and buttons

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Cor de destaque com parcimônia | Só para a ação principal e para status; no fundo do botão, não no texto; não colorir o fundo de vários controles | Apple HIG color |
| Um ou dois botões proeminentes por vista | Distinga o preferido por **estilo**, nunca por tamanho | [Apple HIG buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) |
| Escada de ênfase | Preenchido (ação final) > tonal > contorno > texto; elevado só se precisa separar do fundo | Material button |
| Destrutivo nunca é o principal | Vermelho de sistema, em estilo secundário até a confirmação | Apple HIG buttons |
| Mesma cor, mesmo significado | Nunca a mesma cor para coisas diferentes; cor nunca é o único sinal | Apple HIG color |
| Estado de pressionado sempre | Todo botão customizado tem hover, foco, pressionado e desabilitado desenhados | Apple HIG buttons |

## Radius, borders, page

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Escala de raio única | Tailwind: 2, 4, 6, 8, 12, 16, 24, 32 px; Material: nenhum a total. O canto interno = raio externo − folga | [Tailwind radius](https://tailwindcss.com/docs/border-radius); [Material shape](https://github.com/material-components/material-web/blob/main/docs/theming/shape.md) |
| Largura de página limitada | Até 1020 px e linha de texto de até 75 caracteres | [GOV.UK layout](https://design-system.service.gov.uk/styles/layout/) |
| Alinhe o que é relacionado | Itens alinhados parecem do mesmo grupo | Apple HIG layout |
| Divulgação progressiva | Esconda o secundário atrás de uma ação, não numa tela cheia de controles | Apple HIG layout |
| Consistência interna e externa | A mesma coisa tem o mesmo visual na tela toda e segue a convenção do mercado | [NN/g heuristic 4](https://www.nngroup.com/articles/ten-usability-heuristics/) |

## Why it looks amateur

| Anti-pattern | Sintoma | Correção |
| --- | --- | --- |
| **Tela chapada** | Fundo e card quase da mesma cor, sem borda; tudo parece uma folha só | Degrau de tom **e** borda de 1 px; no escuro, superfície mais clara |
| **Tudo é card** | Borda em cada bloco e cada linha | Use espaço para agrupar; container só quando não basta |
| **Faixa de status desproporcional** | Ícone grande numa coluna própria (ou sozinho numa linha no celular), título que quebra em duas linhas grandes, "atualizado há…" e o botão soltos embaixo, recuados pelo padding do botão fantasma | Bloco de cor cheia numa linha só, como o da Vercel: ícone de traço e título ("Estamos funcionando normalmente"), centralizados na vertical, sem subtítulo, sem horário e sem botão; a cor diz o estado (verde, âmbar, vermelho, cinza sem resposta), com texto de contraste AA sobre ela; a lista abaixo mostra quem está com problema; conferir o print em 390 px e em desktop |
| **Seletores misturados** | Tema com ícones soltos e o ativo num tom quase igual ao fundo, idioma como links sublinhados, ação como texto fantasma sobre faixa colorida: três visuais para "escolha" e "botão" | Toda escolha exclusiva (tema, idioma, período) é o mesmo controle segmentado: caixa com borda de 1 px e pílula na cor primária da marca sob o ativo, com texto branco; botão sobre faixa colorida tem contorno e fundo de superfície |
| **Lista de status numa caixa** | Página de status com todos os serviços como linhas com divisor dentro de um card "Serviços" com título | Como o status da Vercel: cada item com status próprio (serviço, integração, terminal) é uma linha sem caixa, com o nome à esquerda, o status em texto colorido à direita e a barra de 90 dias embaixo ("90 dias atrás" e "Hoje"; 30 dias no celular), linhas separadas por divisor de 1 px e sem título visível em volta. Sem histórico, os dias passados ficam cinza "sem dados" e hoje usa o status atual |
| **Laranja em tudo** | Chip, botão, ícone e badge com a cor de destaque | Destaque só na ação principal; seleção em tom suave |
| **Hierarquia plana** | Título, rótulo e valor com o mesmo tamanho e peso | No máximo 3 tamanhos, um deles claramente maior |
| **Peso invertido na linha** | Linha de lista ou card com o rótulo pequeno e cinza em cima e o valor em `font-medium` embaixo, ou título em `font-medium` | Título em negrito (`font-bold`), subtítulo em peso normal e cor secundária; numa linha de detalhe, o rótulo ("Loja") é o título e o valor é o subtítulo; o título do cabeçalho também em negrito |
| **Linha de informação fora do padrão das irmãs** | Debaixo de um título, uma linha nova de dado (um valor, uma contagem) entra sem o ícone que as outras linhas têm, ou em outra cor e outro peso (preto negrito ao lado de linhas cinza normais) | Toda linha de informação do mesmo bloco tem a mesma anatomia: ícone na mesma cor e tamanho, texto no tom e peso de subtítulo; um dado novo vira mais uma linha igual às outras, nunca um texto solto com estilo próprio |
| **Frase partida na linha** | O título em negrito é o começo de uma frase ("Você está em") e o subtítulo cinza a completa com o dado; o dado sai mais fraco que o rótulo | O título é o próprio dado; o que ele é fica no título da seção ou num rótulo curto (substantivo, nunca meia frase) |
| **Espaço uniforme** | O mesmo intervalo entre tudo; nada se agrupa | Menos espaço dentro do grupo que entre grupos |
| **Visual de fábrica** | Toast, calendário ou controle nativo que ignora o tema | Estilizar com os tokens e `color-scheme` |
| **Sombra e raio por componente** | Cada peça com a sua curva e a sua sombra | Uma escala de raio e de sombra, só da escala |
| **Selo que quebra** | Selo ou chip `rounded-full` com texto que vem de dado (nome, endereço) quebra em duas linhas e vira uma pílula torta | Selo tem uma linha só: limite a uma linha com reticências e deixe-o encolher; texto que pode ser longo vai numa linha de texto com ícone, sem forma de selo |
| **Placa sólida sobre a foto** | Painel quase opaco (`bg-surface/90`, desfoque leve) por cima de slide, vídeo ou foto: vira uma placa branca que tapa a mídia | Painel de acrílico: superfície em ~55% (`bg-surface/55`), desfoque forte (`backdrop-blur-2xl`) com saturação (`backdrop-saturate-150`) e borda clara de 1 px; conferir o contraste do texto no print, em claro e escuro |
| **Hover que vaza** | Controle com fundo cheio (`bg-surface`) troca o fundo no hover por um token translúcido (`hover:bg-surface-hover`, preto a 5%); o botão perde o branco e, sobre acrílico ou foto, fica vazado | Hover de controle preenchido é um tom sólido um degrau abaixo (`hover:bg-surface-muted`) e, se quiser, o contorno mais escuro (`hover:ring-border-hover`); token translúcido só em controle sem fundo próprio |
| **Menu lateral de links soltos** | Gaveta (drawer) feita só de linhas de ícone na cor de destaque + texto, sem grupo, sem cabeçalho com identidade e sem degrau de tom entre o painel e a tela; parece uma lista de depuração | Cabeçalho com a identidade (logo, nome e um dado útil) num tom próprio; itens agrupados por assunto com título de seção pequeno e cinza; ícone neutro num quadrado de tom suave e destaque só no item atual ou na ação principal; o que é contexto (ex.: onde a pessoa está) num bloco à parte, não como mais uma linha; ação de apoio vira mais uma linha, no grupo do assunto dela, nunca um botão de cor cheia no rodapé que pesa mais que a tela atrás; conferir o painel num print antes de entregar |
| **Pilha de cards brancos** | Tela de ajustes ou de detalhes feita de cards brancos empilhados, cada um com título em negrito, e botões de contorno iguais soltos entre eles | Lista agrupada como os ajustes do sistema: título de seção pequeno e cinza fora do card, linhas com ícone num quadrado de tom suave, divisor recuado até o texto, ações como linhas (chevron; destrutiva em texto vermelho, sem fundo, num grupo só dela) e nota curta embaixo do grupo |
| **Bonito que não funciona** | Estética no lugar de uso claro | A estética perdoa erro pequeno, não grande ([NN/g aesthetic-usability](https://www.nngroup.com/articles/aesthetic-usability-effect/)) |

## Count badges

Selo de número (sacola, notificações) é uma caixa com **altura fixa e largura mínima iguais** (ex.: `h-5 min-w-5`), `rounded-full`, com o número centralizado dentro. Nunca deixe a forma vir da linha do texto: a altura da linha difere da largura e o círculo sai oval. Com dois dígitos ele estica para os lados e vira pílula. Em React Native, o `check-style.mjs` da `frontend-house-style` aponta `text-badge` num `<Text>` com `rounded-full`.

## Wrong vs right

❌ Errado: o fundo e a superfície diferem por um degrau imperceptível e o card não tem borda. No escuro a tela vira uma massa só.

```css
:root {
  --canvas: 0 0% 95%;
  --surface: 0 0% 100%;
}

.dark {
  --canvas: 240 5% 11%;
  --surface: 240 5% 13%;
}
```

✅ Certo: um degrau claro entre as camadas e uma borda própria da superfície, nos dois temas. Os números são do projeto: meça a separação no navegador e ajuste até a camada se ler sem esforço.

```css
:root {
  --canvas: 240 5% 94%;
  --surface: 0 0% 100%;
  --surface-border: 240 5% 82%;
}

.dark {
  --canvas: 240 6% 8%;
  --surface: 240 5% 14%;
  --surface-border: 240 4% 24%;
}
```

## Trade-offs

- Borda mais forte e degrau maior deixam a tela menos "leve"; compensa com espaço, não apagando a camada.
- Menos cor de destaque parece sóbrio demais num produto de marca forte: coloque a marca no logo, no foco e na ação principal.
- A skill não tem o número da separação entre camadas porque nenhuma fonte oficial o traz; por isso o teste é visual e medido no projeto.

## Checklist

- [ ] Desfocada, a tela ainda mostra o que é o mais importante
- [ ] No máximo 3 tamanhos de texto; um botão preenchido por vista
- [ ] Fundo, superfície e elevado se distinguem em claro **e** em escuro, com borda de 1 px
- [ ] Cor de destaque só na ação principal, no foco e na seleção, e nunca como único sinal
- [ ] Uma escala de raio e de sombra; nenhuma sombra decorativa
- [ ] `color-scheme` definido; toast, calendário e controles nativos seguem o tema
- [ ] Hover, foco, pressionado e desabilitado desenhados em todo controle
- [ ] Itens iguais em lista, não em card por linha, salvo ação própria por item

## See also

- [FOUNDATIONS.md](FOUNDATIONS.md) — escala de texto, papéis de cor, espaço e raio
- [UX-STATES.md](UX-STATES.md) — os seis estados
- [SOURCES.md](SOURCES.md) — o que as fontes não deram
