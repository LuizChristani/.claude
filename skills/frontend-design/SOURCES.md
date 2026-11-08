---
name: frontend-design-sources
description: Sources, verification gaps and house decisions behind the design skill — which official pages back each file, what could not be verified, and where sources disagree. Use when updating a design rule, adding a number, or checking whether a rule has an official source.
type: reference
scope: frontend
tokens: ~1k
---

# Sources and decisions

> **TL;DR:** Cada regra tem fonte oficial. Número só entra quando a fonte dá um. Onde as fontes divergem ou não deram resposta, a decisão está registrada aqui. Pesquisa feita em 2026-11-04.

## Sources

| Fonte | Usada para |
| --- | --- |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) e [Understanding](https://www.w3.org/WAI/WCAG22/Understanding/) | Contraste, alvo, foco, reflow, movimento, erros |
| [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) | Dialog, tabs, combobox, menu button |
| [MDN](https://developer.mozilla.org) e [web.dev](https://web.dev) | CSS (`clamp`, `color-scheme`, `pointer`, `forced-colors`), fontes, tema |
| [GOV.UK Design System](https://design-system.service.gov.uk) | Escala de texto, espaço, formulários, erro, botão, tabela, estilo de texto |
| [Nielsen Norman Group](https://www.nngroup.com) | Heurísticas, tempo de resposta, estados, confirmação, formulários |
| [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) | Tipografia, cor, escuro, movimento, alertas, botões |
| [Material (material-web e Android)](https://github.com/material-components/material-web) | Papéis de cor e texto, janelas, duração e easing |
| [Radix Colors](https://www.radix-ui.com/colors) e [Tailwind](https://tailwindcss.com/docs) | Escala de 12 degraus, espaço, raio, sombra, breakpoints |
| Pesquisa de design feito por pessoas (Codex com busca na web, 94 buscas, relatório conferido por amostra em 2026-11-04) e sites vivos medidos no navegador | Referências e números de [REFERENCES.md](REFERENCES.md); 1 de 8 afirmações conferidas tinha citação inexistente, então só entra o que foi reaberto |
| [Anthropic skills: frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Apache-2.0, lido em 2026-11-04) | Processo plano, revisão e crítica; tells de tela gerada; restrição; tipografia, movimento e texto como design ([DIRECTION.md](DIRECTION.md)) |
| [Material Web: elevation, shape, divider, button](https://github.com/material-components/material-web/tree/main/docs) e [Android Material 3](https://developer.android.com/develop/ui/compose/designsystems/material3) | Níveis de elevação, escada de ênfase dos botões, divisor, sobreposição tonal no escuro ([VISUAL-DESIGN.md](VISUAL-DESIGN.md)) |

## Verification gaps

| Lacuna | Tratamento |
| --- | --- |
| `m3.material.io` e as páginas HTML do Apple HIG não renderizam sem JavaScript | Material lido pelo GitHub e `developer.android.com`; Apple pelo JSON em `developer.apple.com/tutorials/data/design/human-interface-guidelines/` |
| Níveis de elevação, raios e escala de texto do Material 3 | Sem número na skill |
| Margens, gutters e colunas do Material 3; "propósitos do movimento" do Material | Sem regra |
| Estados parcial e offline | Decisão do projeto, marcada como derivada |
| Texto completo da ISO 9241-11; páginas do NN/g sobre botão (404) e algumas lidas só em resumo (padrões, hierarquia de botões, toast) | Marcadas "(resumo)" no arquivo; confira antes de citar como norma |
| Prazo de 5 s do WCAG 2.2.2; exceções do 2.4.13; critério do papel `menu` | Fora da skill ou marcado como não verificado |
| Script de tema sem flash e armazenamento do override | Só a referência do Tailwind (classe inline no `<head>`) |
| Número de contraste ou de degrau entre fundo e superfície; valores de margem do Apple HIG; uso de cada `surface-container-*` do Material; dp de cada nível de elevação | Nenhuma fonte lida traz; a skill usa o teste visual e a decisão da casa (degrau **e** borda de 1 px) |
| Dark mode no NN/g: halation e contraste mínimo | A página não trata; vale o 4,5:1 (alvo 7:1 em texto pequeno) do Apple HIG dark mode |
| Artigo do NN/g sobre espaço em branco (404) | Substituído por NN/g proximity, form spacing e common region |
| Páginas do Apple HIG e do Material lidas só em parte (o fetch corta o JSON) | Regras vindas do trecho cortado ficaram de fora ou marcadas como não confirmadas |

## House decisions (sources disagree)

| Tema | Fontes | Decisão |
| --- | --- | --- |
| Quando validar o campo | GOV.UK: no envio. NN/g: ao sair do campo | Ao sair do campo, nunca por tecla, mais resumo no envio |
| Caixa do texto de botão e título | Apple: title case. GOV.UK: sentence case | Sentence case |
| Tema | Apple: seguir o sistema, sem seletor próprio | Sistema por padrão; seletor manual é opcional e persiste |
| Separação entre camadas | Nenhuma fonte dá número | Degrau de tom **e** borda de 1 px, conferidos no navegador nos dois temas |

## Updating this skill

- Regra nova: fonte oficial, número só se a página trouxer um, link no arquivo.
- Fonte contradiz a skill: siga a fonte, corrija o arquivo e avise o usuário.
- Siga [AUTHORING.md](../frontend-house-style/AUTHORING.md).
