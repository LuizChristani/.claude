---
name: frontend-house-style-effects
description: When a React effect is allowed in the house style — decision order, smell-to-replacement catalog for Redux/RTK Query/React Router, the one-line reason comment on every retained effect, red flags and audit workflow. Use when writing or reviewing useEffect/useLayoutEffect, derived or mirrored state, effect-based fetching, subscriptions or init code.
type: reference
scope: frontend
tokens: ~1.5k
---

# Effects

> **TL;DR:** `useEffect` serve só para sincronizar a tela com um sistema **fora do React**. Valor derivado se calcula no render, ação do usuário vai no handler, e dado do servidor vem do RTK Query. O padrão é **nenhum** efeito: ele só existe onde é necessário de verdade, e o comentário não o torna necessário.

## Decision order

Antes de escrever um efeito, siga esta ordem e pare no primeiro passo que resolver:

1. **O que dispara o trabalho e qual sistema externo ele sincroniza?** Se não há sistema externo, não é efeito.
2. **O valor sai de props ou estado?** Calcule no render. Nunca use um efeito para manter um estado duplicado.
3. **Uma ação do usuário causou isso?** Faça no handler ou no callback da mutation, mantendo a ordem e o tratamento de erro.
4. **Uma troca de entidade deve zerar todo o estado local?** Use `key={entity.id}` no componente. Nunca use como `key` um valor que muda a cada tecla.
5. **O router, o RTK Query ou o store já cuidam desse ciclo de vida?** Use a API deles. Não adicione outra lib só para tirar um efeito.
6. **É inicialização do app?** Faça no `main.tsx` ou numa factory com `dispose`, fora de componente. Nunca coloque estado por usuário num singleton global, nem rode código de browser no import do módulo.
7. **Sobrou sincronizar com um sistema externo real?** Então é efeito: confira dependências, cleanup, cancelamento, corrida e a simetria setup/cleanup do StrictMode. `useLayoutEffect` só quando precisa rodar antes da pintura.

## Catalog

| Smell | Substituir por |
| --- | --- |
| `useEffect(() => setX(f(y)), [y])`, estado espelhando props ou estado | `const x = f(y)` no render |
| Estado inicializado num efeito | `useState(() => init())` |
| Estado resetado quando uma prop muda | `key` no componente; derive a partir de um id guardado |
| Flag de estado para um efeito fazer o trabalho (`setSubmitted(true)` → efeito faz o POST) | Fazer o trabalho no handler |
| Toast, navegação, analytics ou POST quando um estado vira X | Fazer onde X foi causado: handler, callback da mutation, loader |
| Efeito B depende de estado setado pelo efeito A (cadeia) | Um evento calcula todo o próximo estado; o resto se deriva |
| Efeito chama `onChange(state)` do pai | Chamar no mesmo handler que muda o estado, ou subir o estado |
| Filho busca e empurra o dado para o pai | O pai busca e passa para baixo |
| `fetch().then(setState)` num efeito | Query do RTK Query (ou `loader` da rota) |
| `subscribe` manual + `setState` para valor de store | `useAppSelector` ou `useSyncExternalStore` |
| Reagir no componente a uma ação do Redux | `createListenerMiddleware` no store |
| `useEffect(() => { … }, [])` para iniciar o app ou o usuário | `main.tsx` ou factory fora do React |
| "Carregar mais enquanto `hasNext`" num efeito | Continuar no callback da página anterior, ou pedir ao usuário (botão, sentinela) |
| `eslint-disable` / `oxlint-disable` de `exhaustive-deps` | O efeito está modelando um evento; mova-o |
| Eventos do browser (`online`, `visibilitychange`, `storage`) espalhados | Registrar onde o dono é criado, com um cleanup só |

## Necessity test

Um efeito só fica se passar nas duas perguntas. Falhou numa, ele sai: refatore pelo catálogo ou pergunte ao usuário.

1. **Existe um sistema fora do React do outro lado?** API do DOM ou do navegador, timer, socket, widget de terceiro, ponte nativa, listener global.
2. **Nenhum passo da ordem de decisão (2 a 6) resolve?** Derivar no render, handler, `key`, API do router ou do store, init fora do React.

| Motivo que **não** segura um efeito | Para onde vai |
| --- | --- |
| "Espelha o valor numa ref para o callback ler o mais novo" | `useEffectEvent` (React 19.2+) dentro do efeito que usa o callback |
| "Inicia o fluxo quando a tela abre" | O handler ou o `loader` que abriu a tela, ou a factory do fluxo |
| "Navega, mostra toast ou chama o pai quando o estado vira X" | O handler ou o callback que fez o estado virar X |
| "Grava o estado no store ou no pai quando ele muda" | O mesmo handler que muda o estado |
| "Loga quando algo acontece" | Onde o algo acontece |
| "Funciona e mexer é arriscado" | Não é motivo: refatore com teste, ou pergunte ao usuário |

**Decisão em aberto nunca fica no código.** Se tirar o efeito muda um comportamento que só o usuário pode decidir, pergunte. Um comentário "decision pending" ou "TODO" acima do efeito não é permitido.

❌ Errado: o efeito fica, e o comentário só descreve o que ele faz.

```tsx
const [checked, setChecked] = useState(false);

// Tells the parent whenever `checked` changes.
useEffect(() => {
  onChange(checked);
}, [checked, onChange]);
```

✅ Certo: não há sistema externo. Quem muda o valor avisa o pai no mesmo handler.

```tsx
const [checked, setChecked] = useState(false);

function toggle() {
  const next = !checked;
  setChecked(next);
  onChange(next);
}
```

Fonte: https://react.dev/learn/you-might-not-need-an-effect#notifying-parent-components-about-state-changes

## Retained effects

Todo efeito que fica leva **uma linha** de comentário, em inglês, logo acima dele, dizendo qual sistema externo ele sincroniza e por que nenhuma outra opção cobre. É a única exceção à regra de só JSDoc.

```tsx
// Syncs the map widget's center with `center`: the map library lives outside React.
useEffect(() => {
  map.setCenter(center);
}, [map, center]);
```

## Writing a retained effect

| Regra | Detalhe |
| --- | --- |
| Um efeito por sincronização | Cada efeito sincroniza uma coisa independente; não junte dois efeitos só para reaproveitar código |
| Dependências não se escolhem | Tudo o que o efeito lê do componente entra; nunca desligue o lint de dependências |
| Objeto e função não são dependência | Criados no render, mudam a cada render: mova-os para dentro do efeito ou dependa de valores primitivos |
| Lógica não reativa dentro do efeito | `useEffectEvent` (React 19.2+): chamado só de dentro de efeitos, nunca passado a componentes ou hooks, nunca usado para esconder uma dependência; nome do evento que o usuário percebe (`onConnected`), nunca `onMount` |
| Valor mutável não é dependência | `ref.current` e `location.pathname` não disparam efeito; para assinar algo externo, `useSyncExternalStore` |

Fontes: https://react.dev/learn/lifecycle-of-reactive-effects, https://react.dev/learn/separating-events-from-effects e https://react.dev/reference/react/useEffectEvent

## Red flags

- Efeito novo sem sistema externo nomeado (ou sem o comentário de uma linha).
- `setState` dentro do corpo de um efeito.
- Efeito com dependência de um estado que outro efeito seta.
- Toast, navegação ou escrita na rede dentro de um efeito.
- `[]` em inicialização não idempotente, que quebra no StrictMode.
- Regra `exhaustive-deps` desligada.

## Audit workflow

1. Inventário: `git grep -n "useEffect\|useLayoutEffect" -- src`.
2. Classifique cada um pela ordem de decisão e pelo catálogo: o que faz e o que dispara.
3. Para cada um que sai, diga a substituição e para onde a lógica vai. Refatore um por vez e rode os testes depois de cada um.
4. Para cada um que fica, prove o [Necessity test](#necessity-test) e escreva o comentário de uma linha com o sistema externo. Efeito que falha no teste não ganha comentário: sai.
5. Relate: removidos (padrão → substituição) e mantidos (sistema externo). O que depende de decisão de produto vira pergunta ao usuário antes de terminar, nunca comentário no código.
