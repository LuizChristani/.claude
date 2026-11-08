---
name: frontend-house-style-state-data
description: State and data layer of the React house style — where each kind of state lives, store modules with one file per role, past-tense event actions, typed hooks, listener middleware, one server-cache client with a custom base query, tags and retry rules. Use when adding a slice, selector, endpoint, or deciding where state goes.
type: reference
scope: frontend
tokens: ~2k
---

# State and data

> **TL;DR:** Estado mora no lugar mais baixo que resolve. Domínio compartilhado vai num módulo do store com um arquivo por papel. Dado do servidor fica num cliente de cache só, nunca copiado para o store.

🔧 **Stack note:** exemplos com Redux Toolkit 2 + RTK Query. Com Zustand ou TanStack Query, as regras das tabelas valem iguais.

## Where state lives

| Estado | Onde | Exemplo |
| --- | --- | --- |
| UI de um componente | `useState` | modal aberto, rascunho de campo |
| Compartilhado numa subárvore pequena | Context ([Context](#context)) | aba ativa de um `Tabs` |
| Global e da aplicação inteira ([Store or local](#store-or-local)) | Módulo do store | sessão, preferências, caixa de notificações lidas/não lidas |
| Toast (aviso passageiro de UI) | Context com um provider que guarda o toast e desenha o host; o hook `useToast()` lê só as ações | "Salvo", "Não foi possível enviar" |
| Dado do servidor | Cache de servidor (RTK Query) | lista de usuários |
| Fluxo assíncrono complexo | Máquina em `lib/` ([ARCHITECTURE.md](ARCHITECTURE.md)) | upload, wizard |
| Filtro compartilhável por link | URL (`useSearchParams`) | busca, página, ordenação |
| Precisa sobreviver a reload | `localStorage` via chaves em `config/` | tema escolhido |
| Derivável de outro estado | Não guarde: derive no seletor ou no render | total, contagem |

## State structure

| Regra | ❌ | ✅ |
| --- | --- | --- |
| Agrupe o que muda junto | `x` e `y` em dois `useState` que sempre mudam juntos | `const [position, setPosition] = useState({ x: 0, y: 0 })`, atualizando com `{ ...position, x }` (nunca `setPosition({ x })`, que perde o `y`) |
| Um status no lugar de booleanos | `isSending` + `isSent` | `status: 'typing' \| 'sending' \| 'sent'` |
| Guarde o id, não o objeto | `selectedUser` (cópia que fica velha) | `selectedUserId` e o objeto derivado com `users.find(...)` |
| Estado plano | Árvore aninhada difícil de atualizar | Mapa por id, com `childIds` |
| Não copie prop para estado | `useState(color)` que para de acompanhar a prop | Use a prop direto; se a cópia for de propósito, o nome é `initialColor` ou `defaultColor` |

Fonte: https://react.dev/learn/choosing-the-state-structure

## Store or local

A doc do Redux não dá número: onde cada estado mora é decisão por caso. Global e da aplicação inteira vai no store; local fica no componente mais próximo. Quanto mais "sim" nestas perguntas, mais o dado tende ao store:

- Outras partes do app se importam com esse dado?
- Você precisa derivar outros dados a partir dele?
- O mesmo dado alimenta vários componentes?
- Vale poder voltar esse estado a um ponto no tempo?
- Quer manter o dado durante o hot reload?

Formulário e estado de UI (dropdown aberto, rascunho de campo) quase nunca vão para o store: comece com `useState`. Dado do servidor fica no cache de servidor, nunca no store.

Fontes: https://redux.js.org/faq/organizing-state e https://redux.js.org/style-guide/

## Context

Estado compartilhado numa subárvore usa **dois contexts**: um para o estado e outro para o `dispatch`. Quem só dispara ações não re-renderiza quando o estado muda, porque o `dispatch` não muda.

```text
components/filters/
  FiltersContext.ts     os dois contexts + useFilters() e useFiltersDispatch()
  FiltersProvider.tsx   useReducer com o reducer puro de lib/, provendo os dois
```

`FiltersContext.ts`:

```ts
export const FiltersContext = createContext<Filters | null>(null);
export const FiltersDispatchContext = createContext<Dispatch<FiltersAction> | null>(null);

/** Current filters; throws outside `FiltersProvider`. */
export function useFilters(): Filters {
  const filters = useContext(FiltersContext);
  if (!filters) throw new Error('useFilters must be used inside FiltersProvider');
  return filters;
}

/** Dispatch of the filters reducer; throws outside `FiltersProvider`. */
export function useFiltersDispatch(): Dispatch<FiltersAction> {
  const dispatch = useContext(FiltersDispatchContext);
  if (!dispatch) throw new Error('useFiltersDispatch must be used inside FiltersProvider');
  return dispatch;
}
```

`FiltersProvider.tsx`:

```tsx
/** Holds the filters state and provides it and its dispatch separately. */
export function FiltersProvider({ children }: FiltersProviderProps) {
  const [filters, dispatch] = useReducer(filtersReducer, initialFilters);
  return (
    <FiltersContext value={filters}>
      <FiltersDispatchContext value={dispatch}>{children}</FiltersDispatchContext>
    </FiltersContext>
  );
}
```

| Regra | Detalhe |
| --- | --- |
| Reducer | Puro, em `lib/`, testado; sem `switch` (mapa de handlers por tipo de ação) |
| Fora do provider | O hook lança erro; nunca devolve `null` silencioso |
| Valor que muda a cada tecla ou a cada frame | Não vai em Context: store com seletor, ou estado local |
| Domínio do app inteiro | Slice do store, não Context |
| Toast | Context, nunca slice: é estado de tela que some em segundos, sem domínio, histórico nem persistência. O provider passa o toast como prop ao host que ele mesmo desenha; o context leva só as ações estáveis (`show`, `dismiss`, em `useMemo`), para quem só mostra não re-renderizar. Em React Native, cada `Modal` (outra janela) tem um ponto de toast dentro dele que se registra no provider, e o toast é desenhado só no modal de cima |

Fonte: https://react.dev/learn/scaling-up-with-reducer-and-context

## Slice files

```text
store/slice/notifications/
  notifications.action.ts        State, initial state, case reducers
  notifications.slice.ts         createSlice + export das ações
  notifications.selectors.ts     seletores sobre slice.selectSlice
  notifications.extraReducers.ts reação a ações de outros slices (quando houver)
  tests/
```

```ts
import type { PayloadAction, SliceCaseReducers } from '@reduxjs/toolkit';

/** The notifications slice state: messages waiting to be read. */
export interface NotificationsState {
  items: Notification[];
}

export const initialNotificationsState: NotificationsState = { items: [] };

/** Case reducers of the notifications slice; `notifications.slice.ts` turns them into actions. */
export const notificationsReducers = {
  notificationReceived(state, action: PayloadAction<Notification>): void {
    state.items.push(action.payload);
  },
  notificationDismissed(state, action: PayloadAction<string>): void {
    state.items = state.items.filter((item) => item.id !== action.payload);
  },
} satisfies SliceCaseReducers<NotificationsState>;
```

```ts
type NotificationsRootState = Parameters<typeof notificationsSlice.selectSlice>[0];

export const selectNotifications = (state: NotificationsRootState) =>
  notificationsSlice.selectSlice(state).items;
```

| Regra | Detalhe |
| --- | --- |
| Nome da ação | Evento no passado, `<noun><PastVerb>` (`itemAdded`, `filtersReset`), não comando (`setItems`) |
| Direção de import | `selectors` → `slice` → `action`; nunca o contrário (evita import circular) |
| Registro | `reducer: { [slice.reducerPath]: slice.reducer }` |
| Hooks tipados | `useAppDispatch = useDispatch.withTypes<AppDispatch>()`; nunca o `useDispatch` cru |
| Reação transversal | `createListenerMiddleware` + `isAnyOf(...)`, em `.prepend(...)` (ex.: `sessionEnded` → `api.util.resetApiState()`) |

## Server cache

```ts
/** RTK Query root; every domain injects its endpoints. */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: resilientBaseQuery,
  tagTypes: ['User'],
  endpoints: () => ({}),
});
```

```ts
export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, ...body }) => ({ url: `users/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const { useGetUsersQuery, useUpdateUserMutation } = usersApi;
```

| Regra | Detalhe |
| --- | --- |
| Um cliente só | Um `createApi`; cada domínio em `store/api/<domain>/<domain>Api.ts` + `types.ts`, via `injectEndpoints` |
| `baseQuery` próprio | URL base, headers de auth e prefixos montados num lugar só; endpoints marcam flags em `extraOptions` em vez de repetir lógica |
| Falha | O `baseQuery` devolve `{ error }`; nunca lança |
| Retry | Só em GET e só em erro passageiro (rede, timeout, 429, 5xx), com limite baixo; escrita nunca repete sozinha |
| Coerência | Toda mutation invalida as tags das queries que ela afeta |
| Política de cache | `keepUnusedDataFor` e refetch definidos explicitamente no `createApi`, conforme o app |
| Na tela | Tratar `isLoading`, `isError` e lista vazia em toda tela que lê dados |
| Ler o cache | Sempre pelo hook gerado (`useGetUsersQuery`); para redesenhar só quando um campo muda, `selectFromResult` no próprio hook. Nunca um seletor montado com `api.endpoints.x.select()` ([RTK Query: selectFromResult](https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#selectfromresult)) |

## Anti-patterns

- **Store-espelho:** um slice que copia a resposta do RTK Query. O cache já é o estado.
- **Seletor de endpoint:** `const selectUsers = usersApi.endpoints.getUsers.select()` num arquivo de seletores para ler o cache com `useSelector`. Esconde que o dado vem de uma query e quem segura a assinatura; leia com o hook gerado e `selectFromResult`:

  ```ts
  /** The user's name; it redraws only when the name changes, not on each refetch. */
  export function useUserName(id: string): string {
    const { name } = useGetUserQuery(id, { selectFromResult: ({ data }) => ({ name: data?.name ?? '' }) });
    return name;
  }
  ```
- **Ação-comando:** `setUsers`, `updateState`. Nomeie o que aconteceu.
- **Retry em escrita:** repetir um POST sem chave de idempotência duplica a operação.
