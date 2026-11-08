---
name: frontend-house-style-routing
description: Routing rules of the house style for React Router (data mode) and Expo Router — one route table, guarded (public)/(private) route groups, layouts and guards bound once, route-level lazy loading with retry, typed paths, params and search params validated on read, Link vs NavLink vs navigate vs redirect, 404, scroll restoration and safe redirects. Use when adding a route, page, guard, protected route group, redirect, link or URL state.
type: reference
scope: frontend
tokens: ~1.5k
---

# Routing

> **TL;DR:** Uma tabela de rotas só. Molduras e guards ligados uma vez. Caminhos montados por funções tipadas, nunca por string solta. Params e search params validados ao ler. `<Link>` para navegar, `<NavLink>` no menu, `redirect` em loader e action, `navigate` só depois de uma ação.

🔧 **Stack note:** React Router em modo data (`createBrowserRouter`). Em outro roteador ou no modo framework, os princípios valem e a API muda: confira a doc oficial dele.

## Route table

| Regra | Detalhe |
| --- | --- |
| Um lugar só | Toda rota declarada num arquivo (`pages/Routes.tsx` ou `app/router.tsx`, conforme a estrutura) |
| Moldura | Rota sem `path` com `Component` de layout e `<Outlet />`; guards e comportamentos globais vivem nela |
| Rota índice | `{ index: true, Component: … }` para a tela padrão da moldura; rota índice não tem filhos |
| Error boundary | Um só, na rota raiz ([ARCHITECTURE.md](ARCHITECTURE.md) → Error boundary) |
| 404 de URL | Rota curinga `*` no fim da moldura, com a página de não encontrado |
| 404 de registro | Loader que não acha o registro lança `throw data('…', { status: 404 })`; o boundary da raiz trata com `isRouteErrorResponse` |
| Rolagem | Um `<ScrollRestoration />` só, no layout raiz |

## Guarded route groups (Expo Router)

🔧 **Stack note:** Expo Router (React Native). O princípio vale para a moldura do React Router: o guard protege um grupo inteiro, nunca tela por tela.

As rotas ficam em dois grupos, como os route groups do Next: `(public)` para o que qualquer um abre e `(private)` para o que exige a condição (login, vínculo, assinatura). O grupo não entra na URL (`(private)/index.tsx` é `/`, `(public)/sign-in/index.tsx` é `/sign-in`). Cada tela mora direto no grupo, sem pasta intermediária (`features/`) dentro dele.

```text
src/app/
  _layout.tsx            protege (private) inteiro
  (private)/
    _layout.tsx          <Stack />
    index.tsx            /
    settings/index.tsx   /settings
  (public)/
    _layout.tsx          restrições de rotas públicas
    sign-in/index.tsx    /sign-in
    update/index.tsx     /update
```

| Grupo | Guard | Onde |
| --- | --- | --- |
| `(private)` | `guard={condição}` com `redirectTo` para a tela pública de entrada | Layout raiz |
| `(public)` | Nenhum: abre nos dois estados | Layout raiz, fora de `Stack.Protected` |
| Rota pública só para quem **não** cumpre a condição (entrar, configurar) | `guard={!condição}` com `redirectTo="/"` | `_layout.tsx` do `(public)` |

❌ Errado: grupo com nome genérico ou inventado, pasta `features/` repetida dentro do grupo e tela protegida uma a uma.

```text
src/app/(app)/index.tsx
src/app/(setup)/features/sign-in/index.tsx
src/app/features/update/index.tsx
```

✅ Certo: `(private)` guardado na raiz, `(public)` aberto, e a restrição da tela de entrada no layout do `(public)`.

`app/_layout.tsx` (trecho):

```tsx
const GROUP_SCREEN_OPTIONS = { headerShown: false } as const;

/** The app's routes: `(private)` only after sign-in, `(public)` always. */
export function AppStack() {
  const isSignedIn = useIsSignedIn();
  return (
    <Stack>
      <Stack.Protected guard={isSignedIn} redirectTo="/sign-in">
        <Stack.Screen name="(private)" options={GROUP_SCREEN_OPTIONS} />
      </Stack.Protected>
      <Stack.Screen name="(public)" options={GROUP_SCREEN_OPTIONS} />
    </Stack>
  );
}
```

`app/(public)/_layout.tsx`:

```tsx
/** Routes anyone can open; the sign-in screen only while signed out. */
export default function PublicLayout() {
  const isSignedIn = useIsSignedIn();
  return (
    <Stack>
      <Stack.Protected guard={!isSignedIn} redirectTo="/">
        <Stack.Screen name="sign-in/index" />
      </Stack.Protected>
    </Stack>
  );
}
```

| Regra | Detalhe |
| --- | --- |
| Toda rota num dos dois grupos | O Expo Router inclui toda rota; só as declaradas num `Stack.Protected` são protegidas, então rota solta em `src/app/` fica aberta |
| Header do grupo escondido na raiz | `headerShown: false` na tela do grupo, para não somar com o `<Stack />` interno |
| Componente não mora em `src/app/` | Todo arquivo ali vira rota; componentes vão para `src/components/` |
| Proteção só no cliente | Não substitui a checagem do servidor |

Custo: um `_layout.tsx` por grupo; em troca, nenhuma tela nova fica aberta por esquecimento.

Fontes: https://docs.expo.dev/router/advanced/protected/, https://docs.expo.dev/router/advanced/authentication/, https://docs.expo.dev/router/basics/notation/

## Lazy routes

Telas pesadas carregam sob demanda pela propriedade `lazy` da rota, passando pelo `loadWithRetry` ([PERFORMANCE.md](PERFORMANCE.md) → Lazy routes with retry):

```tsx
{
  path: 'reports',
  lazy: async () => {
    const module = await loadWithRetry(() => import('@/pages/reports/page'));
    const route = { Component: module.ReportsPage };
    return route;
  },
}
```

## Typed paths

O helper `href()` do React Router não está disponível no modo data. Caminhos com parâmetro são montados por funções tipadas num arquivo só, e nenhuma tela escreve a URL à mão.

```ts
export const PATHS = {
  users: () => '/users',
  user: (userId: UserId) => `/users/${encodeURIComponent(userId)}`,
} as const;
```

`<Link to={PATHS.user(user.id)}>` em vez de `` <Link to={`/users/${user.id}`}> ``.

## Params and search params

| Regra | Detalhe |
| --- | --- |
| Validar ao ler | `useParams()` e `useSearchParams()` devolvem texto: passe por um schema (zod) antes de usar; inválido → 404 ou valor padrão |
| URL como estado | Filtro, página e ordenação que valem a pena compartilhar ficam na URL ([STATE-DATA.md](STATE-DATA.md)) |
| Não mutar | Nunca altere o `searchParams` direto; use o setter, que navega |
| Histórico | Filtro digitado troca a entrada (`replace`); mudança de tela empilha |

## Navigation

| Situação | Use |
| --- | --- |
| Clique que leva a outra tela | `<Link to={…}>` |
| Item de menu que mostra a tela ativa | `<NavLink>` (aplica `aria-current="page"` e o estado ativo; `end` para não marcar rotas filhas) |
| Antes de carregar uma tela (loader, action, guard) | `redirect(…)` |
| Depois de uma ação do usuário (salvou, saiu por inatividade) | `navigate(…)`; `{ replace: true }` quando voltar não faz sentido |
| Transição animada entre telas | `<ViewTransition>` do React; a opção `viewTransition` do roteador está deprecated |

## Safe redirects

- `redirect` aceita URL absoluta e leva a outros domínios: todo destino que vem do usuário (`?returnTo=`) passa por uma função que só aceita caminho interno do app.
- Essa função mora em `lib/`, com teste para `//outro-site.com`, `https://outro-site.com` e `javascript:`.

## Anti-patterns

- **URL na mão:** template string de caminho espalhada pelas telas; uma rota muda e metade dos links quebra.
- **Param sem validação:** `useParams().id` usado direto numa chamada de API.
- **Guard por tela:** cada página checando login; o guard é da moldura.
- **Grupo `(app)`:** grupo de rota com nome genérico ou inventado (`(app)`, `(linked)`, `(setup)`); os grupos são `(public)` e `(private)`, sem `features/` dentro.
- **Botão que navega:** `<button onClick={() => navigate(…)}>` onde cabia um `<Link>`.
- **Voltar às cegas (Expo Router):** `router.back()` num botão ("Ver cardápio", "Adicionar") ou depois de uma ação, sem conferir se há tela embaixo; quando a tela abriu primeiro (recarga, link), dá `GO_BACK was not handled by any navigator`. Use um `backOr(fallback)` que faz `router.canGoBack() ? router.back() : router.replace(fallback)`.
- **Título enfeitado no cabeçalho nativo (Expo Router):** `headerTitle` com componente (ícone + texto) dentro do cabeçalho nativo; no Android o título começa numa margem fixa depois da seta, e o vão fica grande. Quando o título leva mais que texto, a tela usa um cabeçalho próprio na opção `header` (seta, ícone e título no mesmo bloco, com o inset de cima), igual ao cabeçalho próprio das outras telas. Fonte: [React Navigation, native stack `header`](https://reactnavigation.org/docs/native-stack-navigator#header).
- **Detalhe empilhado em dobro (Expo Router):** toques rápidos num card fazem `router.push` da mesma rota de detalhe várias vezes, e o voltar precisa passar por cada cópia. A rota com param ganha `dangerouslySingular` no `<Stack.Screen>`: o id da tela vira o caminho com os params (`item/42`), e o mesmo id volta para a tela que já existe; para outro id, passe uma função `(name, params) => string`. Não use `getId`: a página [Custom push behavior](https://docs.expo.dev/router/advanced/stack/#custom-push-behavior) ainda o mostra, mas o Expo Router 58 o marca como obsoleto no console ("Please rename the prop to 'dangerouslySingular'"; `build/useScreens.js`).

Fontes: https://reactrouter.com/start/data/routing, https://reactrouter.com/start/data/route-object, https://reactrouter.com/api/hooks/useParams, https://reactrouter.com/api/hooks/useSearchParams, https://reactrouter.com/api/components/NavLink, https://reactrouter.com/api/utils/redirect, https://reactrouter.com/api/components/ScrollRestoration
