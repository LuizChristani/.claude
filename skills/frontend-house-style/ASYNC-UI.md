---
name: frontend-house-style-async-ui
description: How data screens handle loading, error and empty in the house style — one AsyncState boundary in a fixed order, skeletons drawn by each component itself through a loading scope, first-load detection that keeps content on refresh, and isLoading (action) vs skeleton (data). Use when building a screen or component that shows server data, adding loading/empty/error UI, or a button that triggers an async action.
type: reference
scope: frontend
tokens: ~1.5k
---

# Async UI

> **TL;DR:** Uma tela com dados passa por um `AsyncState`, que resolve erro, primeiro carregamento, vazio e conteúdo, nessa ordem. Cada componente de dados **desenha o próprio skeleton**, então a tela nunca monta skeleton à parte.

## Skeleton lives inside the component

```text
components/loading-scope/
  LoadingScopeContext.ts   o contexto + o hook useScopedLoading
  LoadingScope.tsx         o componente que liga o escopo
  index.ts
```

`LoadingScopeContext.ts`:

```ts
export const LoadingScopeContext = createContext(false);

/** Whether a component draws its skeleton: its own `loading` prop or the enclosing scope. */
export function useScopedLoading(loading = false): boolean {
  const scoped = useContext(LoadingScopeContext);
  const isLoading = loading || scoped;
  return isLoading;
}
```

`LoadingScope.tsx`:

```tsx
/** Puts every data component below in its skeleton state while `loading`. */
export function LoadingScope({ loading, children }: LoadingScopeProps) {
  return <LoadingScopeContext value={loading}>{children}</LoadingScopeContext>;
}
```

```text
components/user-card/
  UserCard.tsx           o card
  UserCardSkeleton.tsx   o skeleton do card, num arquivo próprio
  userCard.styles.ts     os slots do tv(), usados pelos dois
```

`UserCard.tsx`:

```tsx
/** A user's card; draws a same-size skeleton while loading. */
export function UserCard({ user, loading }: UserCardProps) {
  const skeleton = useScopedLoading(loading);
  if (skeleton || !user) return <UserCardSkeleton />;
  return (
    <article className={userCard.root()}>
      <Avatar
        className={userCard.avatar()}
        src={user.avatarUrl}
      />
      <h3 className={userCard.name()}>{user.name}</h3>
    </article>
  );
}
```

`UserCardSkeleton.tsx`:

```tsx
/** Same-size placeholder of `UserCard`, built from the same style slots. */
export function UserCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className={userCard.root()}
    >
      <div className={userCard.avatar({ className: 'animate-pulse bg-muted' })} />
      <div className={userCard.name({ className: 'h-5 w-32 animate-pulse rounded bg-muted' })} />
    </article>
  );
}
```

O skeleton usa os **mesmos slots** do `tv()` do card (`userCard.root()`, `userCard.avatar()`), então tem o mesmo tamanho e não causa pulo de layout.

| Regra | Detalhe |
| --- | --- |
| Quem desenha | Todo componente que mostra dado assíncrono tem a sua versão skeleton, num arquivo próprio ao lado dele (`UserCardSkeleton.tsx`) |
| Como liga | `useScopedLoading(loading)`: a prop própria ou o `LoadingScope` acima; a tela não passa `loading` item por item |
| Forma | Mesmo tamanho e layout do conteúdo real (sem pulo de layout), `aria-hidden`, sem clique |
| Listas | Desenham um número fixo de linhas skeleton (`SKELETON_ROWS = 3`) |
| Controles estáticos | Filtros, abas e botões dentro do escopo também viram skeleton, para a região carregar junta |
| Proibido | Tela com `{isLoading ? <UsersSkeleton /> : <UserList />}` montando skeleton à mão |

## AsyncState

```tsx
/** Resolves error, first load, empty and content, in this order. */
export function AsyncState({ loading, error, isEmpty, empty, onRetry, children }: AsyncStateProps) {
  if (error) return <ErrorState onRetry={onRetry} />;
  if (loading) return <LoadingScope loading>{children}</LoadingScope>;
  if (isEmpty) return empty;
  return children;
}
```

```ts
/** First load or new arguments show skeletons; a refresh with the same arguments keeps the content. */
export function isFirstLoad(query: QueryFlags, keepPrevious = false): boolean {
  const changedArgs = !keepPrevious && query.isFetching && query.currentData === undefined;
  const firstLoad = query.isLoading || changedArgs;
  return firstLoad;
}
```

```tsx
/** The users list screen. */
export function UsersPage() {
  const query = useGetUsersQuery();
  const users = query.currentData;
  const loading = isFirstLoad(query);
  return (
    <AsyncState
      loading={loading}
      error={query.error}
      isEmpty={users?.length === 0}
      empty={<EmptyState title="Nenhum usuário ainda" />}
      onRetry={query.refetch}
    >
      <UserList users={users} />
    </AsyncState>
  );
}
```

| Regra | Detalhe |
| --- | --- |
| Ordem fixa | Erro → primeiro carregamento → vazio → conteúdo; nunca dois estados ao mesmo tempo |
| Erro | Mensagem segura para o usuário + botão de tentar de novo; o detalhe vai para o log |
| Refresh | Com o mesmo argumento, o conteúdo antigo fica na tela (sem piscar skeleton) |
| Troca de argumento | Mostra skeleton, a menos que `keepPrevious` (ex.: paginação que mantém a página atual) |
| Vazio | Sempre um estado vazio com texto e, quando fizer sentido, uma ação |

## isLoading vs skeleton

| Prop | Significa | Visual |
| --- | --- | --- |
| `isLoading` | Uma **ação** em andamento (salvar, enviar) | Botão desabilitado, `aria-busy`, spinner na frente, rótulo mantido invisível para a largura não mudar (ou `loadingLabel`) |
| `skeleton` / escopo | O **dado** que alimenta o componente ainda não chegou | Bloco do mesmo tamanho, sem clique, `aria-hidden` |

```tsx
<Button isLoading={saving} onClick={() => void save(form)}>
  Salvar
</Button>
```

## Wrong vs right

### 1. Skeleton montado na tela

❌ Errado: a tela monta uma segunda cópia do layout só para o carregamento. Quando a lista muda, o skeleton fica para trás, e toda tela repete isso.

```tsx
export function UsersPage() {
  const { data: users, isLoading } = useGetUsersQuery();
  if (isLoading) return <UsersPageSkeleton />;
  return <UserList users={users ?? []} />;
}
```

✅ Certo: a tela passa pelo `AsyncState`, e a `UserList` e os `UserCard` desenham o próprio skeleton (o `UsersPage` da seção [AsyncState](#asyncstate)).

### 2. `loading` passado item por item

❌ Errado: cada componente recebe `loading`, e basta esquecer um para ele aparecer vazio no meio dos skeletons.

```tsx
<Filters loading={loading} />
<UserCard user={users?.[0]} loading={loading} />
<Button loading={loading}>Exportar</Button>
```

✅ Certo: um escopo liga a região inteira (o `AsyncState` já faz isso no primeiro carregamento).

```tsx
<LoadingScope loading={loading}>
  <Filters />
  <UserCard user={users?.[0]} />
  <Button>Exportar</Button>
</LoadingScope>
```

### 3. Estados resolvidos à mão

❌ Errado: cada tela inventa a sua ordem. Aqui o vazio vem antes do erro, então uma falha com cache vazio aparece como "nenhum usuário"; o spinner esconde a página inteira; e não há como tentar de novo.

```tsx
export function UsersPage() {
  const { data: users, isLoading, error } = useGetUsersQuery();
  if (isLoading) return <Spinner />;
  if (users?.length === 0) return <EmptyState title="Nenhum usuário ainda" />;
  if (error) return <ErrorState />;
  return <UserList users={users} />;
}
```

✅ Certo: o `AsyncState` aplica sempre a mesma ordem (erro → primeiro carregamento → vazio → conteúdo), com o botão de tentar de novo.

### 4. Skeleton piscando a cada refresh

❌ Errado: `isFetching` fica `true` em todo refetch (foco na janela, invalidação de tag), e o conteúdo já carregado some atrás do skeleton.

```tsx
const query = useGetUsersQuery();
const loading = query.isFetching;
```

✅ Certo: skeleton só no primeiro carregamento ou quando o argumento muda.

```tsx
const query = useGetUsersQuery();
const loading = isFirstLoad(query);
```

### 5. Skeleton de tamanho diferente

❌ Errado: um bloco genérico com outra altura. Quando o dado chega, tudo abaixo pula de lugar.

```tsx
if (skeleton) return <div className="h-4 w-full animate-pulse bg-muted" />;
```

✅ Certo: o skeleton reaproveita os slots do `tv()` do próprio componente (o `UserCardSkeleton` acima).

### 6. Botão que muda de largura

❌ Errado: o rótulo é trocado pelo spinner, o botão encolhe e o leitor de tela não sabe que algo está em andamento.

```tsx
<Button disabled={saving}>{saving ? <Spinner /> : 'Salvar'}</Button>
```

✅ Certo: o botão recebe `isLoading` e cuida do resto.

```tsx
<Button isLoading={saving}>Salvar</Button>
```

```tsx
/** The `<button>`; `isLoading` disables it, sets `aria-busy` and overlays a spinner keeping its width. */
export function ButtonRoot({
  isLoading = false,
  disabled,
  variant,
  size,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const blocked = disabled || isLoading;
  return (
    <button
      {...rest}
      type={type}
      disabled={blocked}
      aria-busy={isLoading}
      className={button({ variant, size, className })}
    >
      {isLoading && <Spinner className="absolute inset-0 m-auto" />}
      <span className={cn(isLoading && 'invisible')}>{children}</span>
    </button>
  );
}
```

O `base` do `button` precisa de `relative` para o spinner ficar centralizado por cima do rótulo invisível.

## Anti-patterns

- **Skeleton por tela:** cada tela monta o seu skeleton à mão, e ele diverge do componente real.
- **Spinner de página inteira:** esconde a estrutura e causa pulo de layout. Prefira os skeletons no lugar de cada componente.
- **Pisca-pisca no refresh:** trocar o conteúdo por skeleton a cada refetch com o mesmo argumento.
- **Erro que some no refetch:** decidir algo por "a busca já respondeu" com `isError || isSuccess`. No RTK Query, o `isError` volta a `false` enquanto a mesma query busca de novo (nova assinatura que monta, foco, invalidação), e o que depende dele some e volta. Use `error !== undefined || isSuccess`: o `error` fica no cache até a próxima resposta com sucesso (fonte: `src/query/core/buildSlice.ts` do `@reduxjs/toolkit`, que só apaga o `error` no `fulfilled`). Componente que monta ao abrir (gaveta, folha, diálogo) cria uma assinatura nova e refaz a busca: confira-o no aparelho abrindo e fechando várias vezes.
- **Botão que muda de largura:** trocar o rótulo pelo spinner sem guardar o espaço.
