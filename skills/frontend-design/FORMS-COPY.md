---
name: frontend-design-forms-copy
description: Forms, buttons, dialogs, tables and microcopy rules of the design skill — visible labels, hints, input attributes, on-screen keyboard handling in React Native forms, validation timing and error wording, button hierarchy and labels, modal criteria, table layout, sentence case and text conventions. Use when building or reviewing a form (web or React Native screen with a TextInput), writing button or error text, choosing dialog vs inline, or laying out a data table.
type: reference
scope: frontend
tokens: ~2.5k
---

# Forms, components and copy

> **TL;DR:** Rótulo visível, atributo de entrada certo, validação ao sair do campo e resumo no envio, erro que diz como corrigir, botão com verbo + objeto em sentence case.

## Labels and fields

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Rótulo visível acima do campo | Curto, sem dois-pontos | [GOV.UK text input](https://design-system.service.gov.uk/components/text-input/); [NN/g form design](https://www.nngroup.com/articles/web-form-design/) |
| Todo campo de texto tem placeholder com um exemplo, **além** do rótulo | Exemplo do que digitar (`Ex.: Pedidos, Pagamentos`), nunca o nome do campo; o rótulo visível continua, porque o placeholder some ao digitar e é pulado por alguns leitores de tela; cor do placeholder com contraste conferido | Decisão da casa (pedido do usuário em 2026-11-08); GOV.UK e [NN/g placeholders](https://www.nngroup.com/articles/form-design-placeholders/) desaconselham placeholder, e por isso ele nunca substitui rótulo nem dica |
| Dica: uma frase, sem ponto final, sem link | Visível fora do campo | GOV.UK text input |
| Opcional marcado com "(optional)" | Sem asterisco para obrigatório; corte campos opcionais (no máximo 1 ou 2) | [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/); NN/g form design |
| Uma coluna | Campos curtos e relacionados (cidade/UF/CEP) podem dividir a linha | NN/g form design |
| Largura pelo conteúdo esperado | Campos de largura fixa para tamanho conhecido | GOV.UK text input |
| 2–3 opções: radio, não dropdown | Tudo visível, um clique | NN/g form design |
| Data conhecida: três campos (dia, mês, ano) | Sem avançar o foco sozinho | [GOV.UK date input](https://design-system.service.gov.uk/components/date-input/) |
| Aceite entrada permissiva | Ignore espaços, hífens e parênteses; rejeite só o impossível | [GOV.UK validation](https://design-system.service.gov.uk/patterns/validation/) |

## Input attributes

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| `autocomplete` com o token correto | `email`, `given-name`, `tel`, `postal-code`, `current-password`, `new-password`, `one-time-code`… (WCAG 1.3.5, AA); nunca token inventado; evite `off` | [MDN autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete) |
| `type` conforme o dado, `inputmode` só dica de teclado | `email`, `tel`, `url`, `search` | [MDN inputmode](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode) |
| Número inteiro: `type="text" inputmode="numeric"` | Evite `type="number"` (roda com scroll e valida mal); decimal usa `inputmode="decimal"` | GOV.UK text input |
| `spellcheck="false"` em nome, e-mail e códigos | Sem sublinhado vermelho em identificador | GOV.UK text input |

## On-screen keyboard (React Native)

🔧 **Stack note:** regra de app React Native/Expo. Na web o navegador já rola até o campo focado.

O teclado não pode cobrir o campo em foco nem o botão de enviar. No Expo o Android é edge-to-edge e a janela não encolhe sozinha quando o teclado abre.

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Toda tela com `TextInput` fica num `KeyboardAvoidingView` | `behavior="padding"` nas duas plataformas; sem `behavior` a tela fica embaixo do teclado | [Expo keyboard handling](https://docs.expo.dev/guides/keyboard-handling/) |
| Desconte o header | `keyboardVerticalOffset={useHeaderHeight()}` (`expo-router/react-navigation`) quando a tela tem header; o valor já inclui a status bar | Expo keyboard handling |
| Conteúdo que pode não caber rola | `ScrollView` dentro, com `keyboardShouldPersistTaps="handled"` para o toque no botão funcionar com o teclado aberto | [RN ScrollView](https://reactnative.dev/docs/scrollview) |
| Não some `pan` com `padding` | `softwareKeyboardLayoutMode: "pan"` + `behavior="padding"` sobe o campo duas vezes | Expo keyboard handling |
| Formulário longo, com vários campos | `KeyboardAwareScrollView` do `react-native-keyboard-controller` (precisa de development build) | Expo keyboard handling |
| Rodapé fixo (botão de enviar) com o teclado aberto | O espaço da barra de navegação (`useSafeAreaInsets().bottom`) só vale com o teclado fechado; aberto, o teclado cobre a barra e esse espaço vira um vão entre o rodapé e o teclado. Leia o teclado com `useSyncExternalStore` sobre `Keyboard.addListener("keyboardDidShow" / "keyboardDidHide")` e `Keyboard.isVisible()`, e zere o inset enquanto ele estiver aberto | [RN Keyboard](https://reactnative.dev/docs/keyboard), [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) |

❌ Errado: formulário centralizado numa `View`; o teclado cobre o campo e o botão.

```tsx
export function SignInScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <EmailField />
      <Button>Sign in</Button>
    </View>
  );
}
```

✅ Certo: um componente de tela que sobe com o teclado, usado por toda tela com campo.

`KeyboardScreen.tsx`:

```tsx
/** A screen whose content moves above the keyboard and scrolls when it does not fit. */
export function KeyboardScreen({ children }: KeyboardScreenProps) {
  const headerHeight = useHeaderHeight();
  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={headerHeight} className="flex-1">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="grow items-center justify-center"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

`SignInScreen.tsx`:

```tsx
export function SignInScreen() {
  return (
    <KeyboardScreen>
      <EmailField />
      <Button>Sign in</Button>
    </KeyboardScreen>
  );
}
```

Custo: o `KeyboardAvoidingView` é pouco customizável e não rola até o campo focado; em formulário longo, a lib do teclado vence, ao preço de uma dependência nativa.

## Validation and errors

Decisão da casa: valida **ao sair do campo** (nunca a cada tecla) e mostra resumo no envio. O GOV.UK recomenda validar só no envio; o NN/g recomenda validar após sair do campo. A casa segue o NN/g.

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Valide quando o campo está completo | Nunca no meio da digitação | [NN/g form errors](https://www.nngroup.com/articles/errors-forms-design-guidelines/) |
| Envio com erro | Reexiba o formulário com todas as respostas; resumo no topo (acima do `h1`) com foco, título "There is a problem", cada item levando ao campo; prefixo "Error:" no título da página | [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/) |
| Mensagem ao lado do campo | Mesmo texto do resumo; ícone ou texto além do vermelho | [GOV.UK error message](https://design-system.service.gov.uk/components/error-message/) |
| Fórmula da mensagem | O que houve + como corrigir, no vocabulário do rótulo: "Enter [coisa]", "[Coisa] must be [n] characters or less" | GOV.UK error message |
| Evite | "please", "sorry", "valid/invalid", "oops", culpa e "This field is required" | GOV.UK error message |
| Mensagem no DOM, em região `aria-live="polite"` | Limpe quando o campo ficar válido; sem bolha nativa (`novalidate`) | [MDN form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) |
| Cliente é só UX | Valide no servidor sempre | GOV.UK validation |
| 3+ erros repetidos na mesma tentativa | Problema de design: revise textos e teste | NN/g form errors |
| Sucesso só em campo complexo | Disponibilidade de usuário, força de senha | NN/g form errors |

## Buttons

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Um primário por vista | Estilo diferencia ênfase, não tamanho | [GOV.UK button](https://design-system.service.gov.uk/components/button/); [Apple HIG buttons](https://developer.apple.com/design/human-interface-guidelines/buttons) |
| Destrutivo (vermelho) só para o grave | Nunca é o primário; não dependa só do vermelho | GOV.UK button; Apple HIG buttons |
| Rótulo = verbo + objeto, em sentence case | "Save and continue", "Delete project"; não "OK", "Yes/No" nem "Submit" | GOV.UK button |
| Evite botão desabilitado | Mantenha ativo e explique ao clicar, ou mostre o requisito ao lado (fonte única: GOV.UK) | GOV.UK button |
| Evite duplo envio | Retorno de carregamento e proteção no servidor | GOV.UK button |
| Sem "Limpar"; um Enviar sob o formulário | Cancelar bem menos proeminente | NN/g form design |

## Dialogs

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Modal só para aviso crítico, entrada obrigatória que bloqueia ou assistente curto | Não para conteúdo opcional, checkout ou erro corrigível no lugar | [NN/g modal dialogs](https://www.nngroup.com/articles/modal-nonmodal-dialog/) |
| Alerta com título que diz a situação | Nunca só "Error"; até 2 linhas, no máximo 3 botões, "Cancel" para cancelar | [Apple HIG alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) |
| Foco e teclado | Roteiro do APG em [ACCESSIBILITY.md](ACCESSIBILITY.md) | [APG modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) |

## Tables

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Números alinhados à direita (cabeçalho e células) | Comparação por casa decimal | [GOV.UK table](https://design-system.service.gov.uk/components/table/) |
| `<caption>` e `scope` nos cabeçalhos | Nunca tabela para layout | GOV.UK table |
| Primeira coluna identifica o registro | Colunas por importância, relacionadas juntas; cabeçalho fixo na rolagem; ordenação fácil | [NN/g data tables](https://www.nngroup.com/articles/data-tables/) |

## Microcopy

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Linguagem simples, voz ativa, frase curta | Revise toda frase com mais de 25 palavras | [GOV.UK style guide](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/) |
| Sentence case em títulos, botões e rótulos | Decisão da casa; Apple usa title case, a casa não | GOV.UK style guide |
| "Select", não "click" | Nem todo mundo clica | GOV.UK style guide |
| Datas e números consistentes | O formato do idioma do produto, o mesmo em todo lugar | GOV.UK style guide |
| Tom direto e neutro | Sem culpar o usuário nem esconder a gravidade | Apple HIG alerts |

Idioma do texto: o do produto ([SKILL.md da house style](../frontend-house-style/SKILL.md), regra 9); os exemplos aqui estão em inglês porque o código é em inglês.

## Wrong vs right

❌ Errado: placeholder como rótulo e mensagem genérica em tooltip.

```tsx
<input placeholder="Email" aria-invalid={Boolean(error)} title={error ? 'Invalid field' : undefined} />
```

✅ Certo: rótulo visível, `autocomplete`, mensagem acessível ao lado.

```tsx
<label htmlFor="email">Email address</label>
<input id="email" name="email" type="email" autoComplete="email" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={error ? 'email-error' : undefined} />
{error ? <p id="email-error">Error: Enter an email address in the correct format, like name@example.com</p> : null}
```

## Anti-patterns

- **Placeholder-rótulo**, **erro em tooltip**, **"Invalid field"**.
- **Campo sem exemplo:** campo de texto só com o rótulo, sem placeholder com um exemplo do que digitar; o `check-style.mjs` acusa `input-placeholder`.
- **Campo embaixo do teclado:** tela de app com `TextInput` sem `KeyboardAvoidingView`; o usuário digita sem ver o campo e não alcança o botão.
- **Vão em cima do teclado:** rodapé fixo com `paddingBottom` do safe area mesmo com o teclado aberto; sobra a altura da barra de navegação entre o botão e o teclado.
- **Botão "Submit"/"OK"** onde há um verbo específico.
- **Botão desabilitado mudo:** o usuário não sabe o que falta.
- **Modal de erro:** tira o foco do campo que precisa de correção.
- **Tabela de layout.**

## Trade-offs

- Validar ao sair do campo dá retorno cedo, mas pode irritar quem digita devagar ou troca de campo no meio; o resumo no envio cobre o resto.
- Botão ativo que explica ao clicar custa um estado de erro a mais, em troca de nenhum botão "morto".

## Checklist

- [ ] Todo campo com rótulo visível, `autocomplete`, `type`/`inputmode` certos
- [ ] App React Native: toda tela com `TextInput` sobe com o teclado (`KeyboardAvoidingView` `padding` + offset do header) e o botão funciona com o teclado aberto
- [ ] Erro ao lado do campo e no resumo, com o mesmo texto e dizendo como corrigir
- [ ] Um botão primário; rótulos verbo + objeto em sentence case
- [ ] Modal só nos casos permitidos; tabela com `caption`, `scope` e números à direita
