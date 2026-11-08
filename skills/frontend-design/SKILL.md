---
name: frontend-design
description: Design rules for any web UI, backed by official standards (WCAG 2.2, WAI-ARIA APG, Material 3, Apple HIG, GOV.UK Design System, Nielsen Norman Group, MDN, web.dev) — visual hierarchy, type scale, semantic color roles, spacing, responsive layout, motion, dark mode, accessibility, UI states, forms, buttons, dialogs, tables and microcopy. Use when designing, building or reviewing how a screen or component looks and behaves, choosing sizes, colors or spacing, writing UI copy or error messages, defining loading/empty/error states, or when the user says "design", "UX", "usabilidade", "acessibilidade", "layout", "fica bonito", "UI", "profissional", "feio", "genérico" or "vibecoding". Also covers design direction (plan, review against the generic default, screenshot critique) and visual composition: surface layers, borders, elevation, accent color and polish.
type: skill
scope: frontend
tokens: ~2k
---

# Frontend design

> **TL;DR:** Design é decisão com motivo e fonte, não gosto. Toda tela define cor por papel, espaço por escala, os seis estados e a acessibilidade antes de ficar "bonita". Cada regra aqui tem número só quando uma fonte oficial dá um.

## Use when / Don't use when

| ✅ Use when | ❌ Don't use when |
| --- | --- |
| Montar ou revisar a aparência e o comportamento de uma tela ou componente | Decidir onde o arquivo mora ou como o código se organiza → `frontend-house-style` |
| Escolher tamanho, cor, espaço, movimento ou texto de interface | Gráficos e dashboards → skill `dataviz` |
| Definir loading, vazio, erro, formulário, diálogo ou tabela | Implementar tokens e `tv()` → [COMPONENTS-STYLING.md](../frontend-house-style/COMPONENTS-STYLING.md) |

## Core principle

1. **Papel, não aparência:** cor, tamanho e espaço vêm de tokens com papel (`surface`, `on-surface`, `body`, `space-4`).
2. **Estado antes de pixel:** a tela só está desenhada quando os seis estados existem ([UX-STATES.md](UX-STATES.md)).
3. **Acessível por construção:** contraste, foco, alvo e teclado entram no primeiro desenho, não numa revisão final.
4. **Uma ação principal por vista**, e o resto com menos peso.

## How to do it

| Etapa | Pergunta | Arquivo |
| --- | --- | --- |
| 0a. Referências | Quais trabalhos feitos por pessoas você abriu, olhou e mediu antes de desenhar? | [REFERENCES.md](REFERENCES.md) |
| 0. Direção | Para este briefing, qual é o plano (cor, tipo, layout, princípios) e ele foge do padrão genérico? | [DIRECTION.md](DIRECTION.md) |
| 1. Fundamentos | Que escala de texto, papéis de cor, espaço, raio e sombra a tela usa? | [FOUNDATIONS.md](FOUNDATIONS.md) |
| 1b. Composição visual | A tela tem hierarquia, camadas distintas em claro e escuro, um só destaque e acabamento igual em tudo? | [VISUAL-DESIGN.md](VISUAL-DESIGN.md) |
| 2. Layout | Como ela se comporta de 320 px a telas largas, no toque e no mouse? | [LAYOUT-RESPONSIVE.md](LAYOUT-RESPONSIVE.md) |
| 3. Estados e fluxo | Carregando, vazio, erro, parcial, offline, sucesso: o que o usuário vê em cada um? | [UX-STATES.md](UX-STATES.md) |
| 4. Formulários e texto | Rótulo, validação, teclado no app (React Native), botões, diálogo, tabela e microcopy | [FORMS-COPY.md](FORMS-COPY.md) |
| 5. Movimento e tema | O que anima, e como fica em escuro, contraste alto e movimento reduzido? | [MOTION-THEMING.md](MOTION-THEMING.md) |
| 6. Acessibilidade | Passa nos critérios do WCAG 2.2 AA e no teclado? | [ACCESSIBILITY.md](ACCESSIBILITY.md) |

Fontes, lacunas e decisões da casa: [SOURCES.md](SOURCES.md).

## Non-negotiables

| # | Regra | ❌ Violação típica |
| --- | --- | --- |
| 1 | Texto de corpo ≥ 4,5:1 e componente de UI ≥ 3:1 de contraste, nos dois temas | Cinza claro sobre branco no tema escuro e no claro |
| 2 | Alvo de clique ≥ 24×24 px; no toque, mire em 44×44 | Ícone de 16 px sem área de toque |
| 3 | Foco visível em todo elemento operável; nunca `outline: none` sem substituto | Botão sem anel de foco |
| 4 | Cor nunca é o único sinal (erro, status, série, link) | Borda vermelha sem texto de erro |
| 5 | Toda tela define loading, vazio, erro, parcial, offline e sucesso | Lista que só desenha o caso feliz |
| 6 | Uma ação principal por vista; destrutivo nunca é o principal | Dois botões preenchidos lado a lado |
| 7 | Todo campo tem rótulo visível **e** placeholder com um exemplo; placeholder nunca substitui o rótulo | Só `placeholder="E-mail"`, ou campo sem placeholder |
| 8 | Erro diz o que houve e como corrigir, ao lado do campo, com texto | "Campo inválido" em tooltip |
| 9 | Cor, raio, sombra e espaço de tokens; nada de valor solto | `p-[13px]`, `#3b82f6` no componente |
| 10 | Movimento só com função e respeita `prefers-reduced-motion` | Animação decorativa que ignora a preferência |
| 11 | Mobile primeiro; nunca bloquear zoom; breakpoint onde o conteúdo quebra | `user-scalable=no`, `if (isTablet)` |
| 12 | Texto de interface em sentence case, verbo + objeto nos botões | "OK", "Submit", "Salvar Alterações" |
| 13 | Fundo, superfície e elevado se distinguem nos dois temas (degrau de tom **e** borda de 1 px); no máximo 3 tamanhos de texto e 1 ou 2 botões proeminentes por vista ([VISUAL-DESIGN.md](VISUAL-DESIGN.md)) | Card quase da cor do fundo, sem borda; laranja em chip, botão e ícone |
| 14 | **Direção antes do código:** 3 a 5 referências de gente abertas e medidas ([REFERENCES.md](REFERENCES.md)), plano escrito (4 a 6 cores nomeadas, tipografia, layout com wireframe, princípios) revisado contra o padrão genérico; depois de construir, prints do vazio, do preenchido e do erro, nos dois temas, olhados e criticados ([DIRECTION.md](DIRECTION.md)) | Começar pelo JSX com os tokens do último projeto; desenhar sem abrir uma referência feita por gente; dar a tela por pronta só porque o checklist passou |

## Anti-patterns

- **Tela de caso feliz:** só desenha o dado carregado. Defina a matriz de estados.
- **Cor como sinal único:** vermelho/verde sem ícone nem texto.
- **Placeholder-rótulo:** some ao digitar e falha em contraste.
- **Modal para tudo:** interrompe o fluxo; use inline, undo ou página.
- **Confirmação por reflexo:** "Tem certeza?" genérico; prefira desfazer.
- **Tudo em destaque:** com cinco botões primários, nenhum é.
- **Valor solto:** cor, espaço ou raio fora da escala.
- **Tela chapada e visual de fábrica:** sem camadas nem hierarquia, com widgets de terceiro fora do tema. Veja o diagnóstico em [VISUAL-DESIGN.md](VISUAL-DESIGN.md#why-it-looks-amateur).

## Trade-offs

- Os seis estados e a checagem de contraste custam tempo no primeiro desenho; evitam retrabalho e bug de acessibilidade depois.
- Alvo de 44 px ocupa espaço: em telas densas de mouse, 24 px é o mínimo, não a meta.
- Seguir o tema do sistema tira o controle visual da marca; um seletor manual é opcional e precisa persistir ([MOTION-THEMING.md](MOTION-THEMING.md)).

## Checklist

- [ ] Texto, ícones e bordas passam nos contrastes da regra 1 em claro e escuro
- [ ] Alvos, foco e navegação por teclado conferidos
- [ ] Os seis estados desenhados e ligados ao `AsyncState`
- [ ] Uma ação principal; textos em sentence case; erros com causa e correção
- [ ] Nenhum valor solto; movimento respeita a preferência do sistema
- [ ] Passa no checklist de acabamento de [VISUAL-DESIGN.md](VISUAL-DESIGN.md): camadas, hierarquia, destaque e widgets no tema
- [ ] Toda afirmação nova tem fonte em [SOURCES.md](SOURCES.md)

## See also

- [frontend-house-style](../frontend-house-style/SKILL.md) — tokens, componentes e `AsyncState`
- [AUTHORING.md](../frontend-house-style/AUTHORING.md) — como editar esta skill
- [request-reading](../request-reading/SKILL.md) — pedido vago de melhoria em tela que já existe: propostas antes da troca
