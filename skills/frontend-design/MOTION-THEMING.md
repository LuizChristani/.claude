---
name: frontend-design-motion-theming
description: Motion and theming rules of the design skill — purposes of motion, duration and easing tokens, reduced motion, dark mode and color-scheme, theme persistence without a flash, contrast preferences and forced colors. Use when adding an animation or transition, building a theme or dark mode, or supporting prefers-reduced-motion, prefers-contrast and forced-colors.
type: reference
scope: frontend
tokens: ~2k
---

# Motion and theming

> **TL;DR:** Movimento só quando ajuda (retorno, orientação, continuidade), nunca decorativo e sempre com saída para quem pediu menos movimento. Tema segue o sistema por padrão e tem valores próprios no escuro.

## Motion

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Só com função | Retorno, orientação ou continuidade; nunca decorativo | [Apple HIG motion](https://developer.apple.com/design/human-interface-guidelines/motion) |
| Retorno breve e preciso | Não anime o que se repete o tempo todo | Apple HIG motion |
| Nunca faça esperar | O usuário pode interromper a animação | Apple HIG motion |
| Movimento nunca é o único portador de informação | Some com mudança de estado ou texto | Apple HIG motion |
| Padrão pela relação entre elementos | Transformação de contêiner (cartão → detalhe), eixo compartilhado (ordem espacial), esmaecer através (destinos sem relação), esmaecer (aparece no lugar) | [Material motion](https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md) |
| Duração cresce com a distância | Tokens do Material: curto 50–200 ms, médio 250–400, longo 450–600, extra longo 700–1000; esmaecer ~150 ms entrando e 75 ms saindo; transições de contêiner e eixo ~300 ms | Material motion (tabela com inconsistência no 50 ms; confira antes de fixar) |
| Easing | Curvas do Material: padrão `(0.2, 0, 0, 1)`, entrada desacelera `(0, 0, 0, 1)`, saída acelera `(0.3, 0, 1, 1)`; linear só para progresso não espacial | Material motion |
| Prefira `opacity` e `transform` | Inferência da orientação de movimento reduzido, não afirmação de desempenho da fonte | [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) |

## Reduced motion

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| `@media (prefers-reduced-motion: reduce)` | Remova, reduza ou troque o movimento | MDN reduced motion |
| Troque, não só apague | Escala, pan, paralaxe e eixo z viram esmaecer; sem animar para dentro de desfoque | [Apple HIG accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) |
| Movimento por interação é desligável | WCAG 2.3.3 (AAA); respeitar a configuração do sistema vale | [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) |
| Nada pisca mais de 3 vezes por segundo | WCAG 2.3.1 (A) | [WCAG 2.2](https://www.w3.org/TR/WCAG22/) |
| View Transitions | `document.startViewTransition()` com teste de suporte e fallback; desligue as animações `::view-transition-*` sob movimento reduzido (padrão comum, não texto da MDN: confira antes) | [MDN View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) |

❌ Errado: animação fixa que ignora a preferência.

```css
.toast {
  animation: slide-in 400ms ease-out;
}
```

✅ Certo: a versão reduzida troca o deslize por esmaecer.

```css
.toast {
  animation: slide-in 300ms var(--ease-decelerate);
}

@media (prefers-reduced-motion: reduce) {
  .toast {
    animation: fade-in 150ms linear;
  }
}
```

## Theming and dark mode

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Siga o sistema por padrão | Seletor manual só se necessário; o override persiste entre recargas | [Apple HIG dark mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) |
| `color-scheme: light dark` no `:root` e `<meta name="color-scheme">` no `<head>` | Controles nativos e barras de rolagem acompanham; evita flash no carregamento | [MDN color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) |
| Variáveis semânticas por esquema | `light-dark()` ou `prefers-color-scheme`; nada de cor bruta no componente | MDN color-scheme; [web.dev prefers-color-scheme](https://web.dev/articles/prefers-color-scheme) |
| Alternância manual com classe ou `data-theme` | Defina inline no `<head>`, antes da primeira pintura | [Tailwind dark mode](https://tailwindcss.com/docs/dark-mode) |
| Ouça `matchMedia('(prefers-color-scheme: dark)')` | O modo automático muda com o app aberto; `theme-color` com `media` | web.dev prefers-color-scheme |
| Paleta escura: fundo mais suave, primeiro plano mais claro | Superfícies elevadas mais claras; não é inversão | Apple HIG dark mode |
| Contraste nos dois esquemas | 4,5:1 (texto), 3:1 (grande/UI); teste também com contraste aumentado | [WCAG 1.4.3](https://www.w3.org/TR/WCAG22/) |
| `prefers-contrast: more` | Bordas e contornos mais fortes | [MDN prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast) |
| `forced-colors: active` | Use cores do sistema; sombra e imagem de fundo somem, então carregue sentido em borda real; `forced-color-adjust: none` só em ajuste pequeno | [MDN forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors) |
| Elementos nativos | `forced-colors` lê a semântica nativa, não `role` | MDN forced-colors |

Lacuna: nenhuma fonte oficial descreve o armazenamento do override nem o script que evita o flash; a única referência é a do Tailwind, de definir a classe inline no `<head>`.

## Anti-patterns

- **Animação decorativa:** movimento sem função.
- **Ignorar a preferência:** sem `prefers-reduced-motion`.
- **Pílula parada na troca de tema:** o iris marca o `<html>` (ex.: `data-theme-switching`) e zera todas as transições para as cores não animarem por baixo do círculo; o controle que disparou a troca (a pílula do seletor de tema) perde o deslize junto. Exclua da regra o que precisa se mover (`*:not([data-segment-pill])`): o lado novo da View Transition é desenhado ao vivo, então a pílula desliza enquanto o círculo abre.
- **Iris que trava o clique:** enquanto uma View Transition roda, o navegador manda todo clique para o `<html>` (`pointer-events: none` no `::view-transition` não resolve), e o seletor fica sem resposta até a animação acabar. Durante a transição, um `pointerdown` chama `transition.skipTransition()` e, quando ela termina, repete o clique no botão ou link sob o ponto (`document.elementFromPoint(...).closest('button, a').click()`); conferir clicando duas vezes seguidas no navegador.
- **Iris apressado:** a troca de tema em círculo (View Transition que revela a tela nova a partir do botão) cobre a tela inteira e, com 500 ms, passa rápido demais para ser vista. Use 1 s (escolha do usuário; o Carbon dá 700 ms para movimento expressivo grande), com curva que desacelera no fim, numa constante só, e sem animação com `prefers-reduced-motion`.
- **Escuro invertido:** o claro com `filter: invert`.
- **Flash de tema:** a página pisca no esquema errado antes de aplicar o salvo.
- **Sentido na sombra:** estado que só existe em `box-shadow` e some em cores forçadas.
- **Folha que só entra:** bottom sheet com o modal fazendo o fade da janela inteira enquanto uma animação de entrada sobe o painel. As duas brigam ao abrir, e ao fechar o modal some de uma vez, sem o painel descer. Certo: o modal sem animação própria, um único progresso 0→1 que esmaece o fundo e desliza o painel pela altura medida, nos dois sentidos, e o modal fica montado até o painel terminar de descer. 🔧 **Stack note:** no React Native, `Modal` com `animationType="none"` e o progresso num shared value do Reanimated (`withTiming` com callback que desmonta ao terminar o fechamento); a mesma ideia vale para qualquer lib de animação.
- **Contador que surge:** um "+" que vira "− n +" trocando o controle inteiro com zoom ou fade. O controle **cresce**: o "+" fica parado e a parte "− n" abre animando a largura, presa ao lado do "+" para sair de trás dele (nunca cortada do lado errado nem por cima do botão).
- **Anima ao montar:** a animação liga direto no valor final (`width: withTiming(open ? w : 0)` dentro do estilo animado), então toda mudança anima: a montagem, o item que a lista recicla e cada medida que chega. Guarde um progresso 0→1 que nasce no estado atual (`open ? 1 : 0`), anime só a troca do estado e use a medida só durante a animação. Parada e aberta, a peça que ocupa o espaço do pai vem do layout (`flexGrow: 1` com base 0 e o vizinho sem encolher), nunca de uma largura medida ou de reserva, que pula quando a medida chega; e nunca largura `auto` com um filho em 100% dela, que cresce sem limite.
- **Brilho que mancha:** o efeito de brilho (glint, sheen) feito com a cor de destaque por baixo do conteúdo escurece o que atravessa e parece uma mancha passando. Brilho é luz: faixa estreita e clara (branco com borda suave e meio mais forte) por cima do conteúdo, sem pegar toque e desligada sob movimento reduzido; ela aparece onde há cor (ícone, área tingida) e some no fundo claro. No React Native, o degradê do `react-native-svg` recebe a cor direto nas props do `Stop`, nunca por `className`.

## Trade-offs

- Versão reduzida de cada animação dobra o trabalho; centralize duração e easing em tokens e faça um único bloco reduzido.
- Seletor manual de tema acrescenta estado persistente e script no `<head>`; o ganho é o controle, o custo é o risco de flash.

## Checklist

- [ ] Cada movimento tem função e uma versão sob `prefers-reduced-motion`
- [ ] `color-scheme` declarado; tokens com valores para os dois esquemas
- [ ] Contraste conferido no claro e no escuro; `forced-colors` testado
- [ ] Override de tema persiste e é aplicado antes da primeira pintura
