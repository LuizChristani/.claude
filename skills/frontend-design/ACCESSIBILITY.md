---
name: frontend-design-accessibility
description: Accessibility rules of the design skill, from WCAG 2.2 and the WAI-ARIA Authoring Practices — contrast ratios, target size, focus, reflow and text spacing, color independence, keyboard, status messages, error identification and the key patterns for dialog, tabs, combobox and menu button. Use when checking a screen against WCAG 2.2 AA, choosing colors or sizes that must pass, or building an interactive widget.
type: reference
scope: frontend
tokens: ~2k
---

# Accessibility

> **TL;DR:** O piso é WCAG 2.2 AA. Contraste, alvo, foco, zoom, teclado e anúncio de status entram no desenho. Widget interativo segue o roteiro do APG; prefira lib headless ([COMPONENTS-STYLING.md](../frontend-house-style/COMPONENTS-STYLING.md)).

## Contrast

| Regra | Número | Critério |
| --- | --- | --- |
| Texto de corpo | ≥ 4,5:1 | 1.4.3 (AA) |
| Texto grande (18 pt, ou 14 pt em negrito) | ≥ 3:1 | 1.4.3 (AA) |
| Bordas e estados de componente, gráficos com sentido | ≥ 3:1 contra o vizinho | 1.4.11 (AA) |
| Melhor caso (opcional) | 7:1 (grande 4,5:1) | 1.4.6 (AAA) |

- Desabilitado e logotipo são isentos, mas não use a isenção para o que o usuário precisa ler.
- Fonte: [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Target, focus, zoom

| Regra | Número | Critério |
| --- | --- | --- |
| Alvo de ponteiro | ≥ 24×24 px, ou círculo de 24 px sem tocar outro alvo | 2.5.8 (AA) |
| Alvo no toque | 44×44 px | 2.5.5 (AAA) |
| Foco visível em todo operável | sem número | 2.4.7 (AA) |
| Foco nunca totalmente coberto por cabeçalho fixo, banner ou cookie bar | use `scroll-padding` | 2.4.11 (AA) |
| Indicador forte (opcional) | perímetro ≥ 2 px e mudança ≥ 3:1 | 2.4.13 (AAA; exceções completas não verificadas) |
| Conteúdo em hover/foco (tooltip, popover) | dispensável, "hoverable" e persistente | 1.4.13 (AA) |
| Reflow sem rolagem em duas dimensões | 320 px de largura (400% em 1280 px) | 1.4.10 (AA) |
| Texto ampliável | 200% sem perda | 1.4.4 (AA) |
| Espaçamento de texto sobrescrito sem corte | linha 1,5×, parágrafo 2×, letra 0,12×, palavra 0,16× | 1.4.12 (AA) |

Fontes: [alvo mínimo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [alvo ampliado](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), [foco não obscurecido](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). Anel de foco de duas cores contrasta em qualquer fundo ([GOV.UK focus](https://design-system.service.gov.uk/get-started/focus-states/)). Evite altura fixa em container de texto.

## Color, keyboard, structure

| Regra | Critério |
| --- | --- |
| Cor nunca é o único sinal (erro, obrigatório, link, série): some texto, ícone, padrão ou sublinhado | 1.4.1 (A) |
| Erro descrito em texto, com o campo identificado e como corrigir | 3.3.1 (A), 3.3.3 (AA) |
| Tudo operável por teclado, sem tempo por tecla | 2.1.1 (A) |
| Nunca prenda o foco; exceção é o modal, que o Escape fecha | 2.1.2 (A) |
| Ordem do DOM = ordem visual; foco em ordem com sentido | 1.3.2, 2.4.3 (A) |
| Link para pular blocos repetidos | 2.4.1 (A) |
| Mudança de status sem mover o foco: `role="status"` (resultado), `role="alert"` (erro/aviso), `role="log"` (sequência) | 4.1.3 (AA) |
| Não use `alert`/`assertive` para o que não é urgente | interrompe o usuário |
| Piscar: no máximo 3 vezes por segundo | 2.3.1 (A) |

Fontes: [identificação de erro](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [sequência significativa](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html), [mensagens de status](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). Preferências do sistema: [MOTION-THEMING.md](MOTION-THEMING.md).

## Widget patterns (APG)

| Padrão | Contrato mínimo |
| --- | --- |
| [Dialog modal](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | `role="dialog"`, `aria-modal="true"`, nome por `aria-labelledby`; ao abrir, foco para dentro (irreversível: na ação menos destrutiva); Tab circula dentro; Escape fecha; ao fechar, foco volta a quem abriu; botão de fechar visível |
| [Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) | `tablist` > `tab` + `tabpanel`; `aria-selected`, `aria-controls`, `aria-labelledby`; Tab entra na aba ativa e depois vai ao painel; setas movem entre abas; Home/End opcionais |
| [Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete`, `aria-activedescendant` (o foco do DOM fica no input); seta abre, Enter aceita, Escape fecha |
| [Menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) | botão com `aria-haspopup="menu"` e `aria-expanded`; Enter/Espaço abre no primeiro item; só para menu de ações. Navegação do site é lista de links; o critério para escolher o papel `menu` não foi verificado na página do padrão de menu |

## Wrong vs right

❌ Errado: anel removido e erro só em cor.

```tsx
<input className="outline-none border-red-500" />
```

✅ Certo: foco visível e erro com texto, ligado ao campo.

```tsx
<input className="border-input focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive" aria-invalid aria-describedby="name-error" />
<p id="name-error">Error: Enter your full name</p>
```

## Anti-patterns

- **Div-botão:** `div` clicável sem teclado, papel nem foco.
- **Foco sumido:** `outline: none` sem substituto.
- **Alvo de ícone:** 16 px sem área de toque.
- **Alerta ruidoso:** `role="alert"` para toda mensagem.
- **Teste só de olho:** contraste "parece bom" sem medir.

## Trade-offs

- AAA (7:1, 44 px, foco forte) custa espaço e paleta; adote onde der e trate AA como piso.
- Os testes automáticos pegam parte dos critérios; teclado e leitor de tela precisam de passada manual.

## Checklist

- [ ] Contrastes medidos nos dois temas
- [ ] Alvos, foco e ordem de tabulação conferidos só com teclado
- [ ] Zoom de 200% e largura de 320 px sem perda
- [ ] Erros e status anunciados; nada depende só de cor
- [ ] Widgets seguem o contrato do APG ou usam lib headless que o segue
