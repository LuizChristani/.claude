---
name: frontend-house-style-architecture
description: Folder layout and layer rules of the React house style — pages, layout, components, hooks, store, pure lib, and the http/ subfolders of lib and hooks — plus feature colocation and keeping complex async flows outside React. Use when deciding where a file goes, scaffolding a page or feature, adding an API call, request, stream, URL builder or response parser, or checking import direction.
type: reference
scope: frontend
tokens: ~2k
---

# Architecture

> **TL;DR:** Quem está em cima usa quem está embaixo, nunca o contrário. `lib/` é o fundo: funções puras, sem React, sem store.

## Layers

A árvore abaixo é a **recomendação da casa**. O projeto pode ter escolhido outra estrutura (por feature, Feature-Sliced Design, rotas por arquivo, monorepo); nesse caso vale a do projeto, e os princípios desta página (núcleo puro, direção dos imports, colocation) se aplicam a ela, como mapeado na skill `frontend-project-setup` → STRUCTURE.md.


| Pasta | Papel | Pode importar | Não pode importar |
| --- | --- | --- | --- |
| `pages/<rota>/` | Telas: desenham e repassam eventos | tudo abaixo | outra página |
| `layout/` | Molduras de rota: guards e comportamentos globais ligados uma vez | `components`, `hooks`, `lib`, `store` | `pages` |
| `components/` | Peças visuais usadas por 2+ telas | `hooks`, `lib` | `pages`, `layout` |
| `hooks/` | Ponte entre React e o resto | `lib`, `store` | `pages`, `components` |
| `hooks/http/` | Hooks que chamam a API ([HTTP in its own folder](#http-in-its-own-folder)) | `lib`, `store` | `pages`, `components` |
| `store/` | Estado global e cache do servidor | `lib` | React components |
| `lib/` | Funções puras e máquinas de estado | `lib/http`, `lib/types`, pacotes | React, `store` |
| `lib/http/` | O que fala com a rede: requisição, stream, URL, autenticação, corpo de requisição e resposta | `lib`, `lib/types`, pacotes | React, `store` |
| `lib/types/` | Tipos compartilhados por `lib` e `store` | nada do app | — |
| `config/` | Constantes (chaves de storage, env lido num lugar só) | nada | — |
| `styles/` | Tokens e CSS global | — | — |

- Regra de desempate: se a função não precisa de hook nem de JSX, ela vai para `lib/`.
- Next.js e outros frameworks com rotas por arquivo: `app/` substitui `pages/` e `Routes.tsx`, e as camadas abaixo continuam iguais.

## Layout

```text
src/
  main.tsx              Provider do store, <App />
  App.tsx               Router e hosts globais (toasts, modais globais)
  pages/
    Routes.tsx          tabela única de rotas
    <kebab-rota>/
      page.tsx          export function <Name>Page
      components/       widgets só desta tela
      hooks/            hooks só desta tela
      lib/              funções puras desta tela (testadas)
      tests/
  layout/
  components/
    <kebab-nome>/       componente composto (ver COMPONENTS-STYLING.md)
    Spinner.tsx         componente simples: um arquivo só
  hooks/                use<Name>.ts, um por arquivo
    http/               hooks que chamam a API
  lib/
    http/               o que fala com a rede
    <area>/             subpasta quando a área tem 3+ módulos
    types/
    tests/
  store/
    store.ts
    hooks/index.ts
    api/                api.ts, baseQuery.ts, <domain>/<domain>Api.ts + types.ts
    slice/<name>/       um arquivo por papel (ver STATE-DATA.md)
  config/
  styles/
```

Algo só sobe de `pages/<rota>/` para `components/`, `hooks/` ou `lib/` quando **duas ou mais** telas usam.

## HTTP in its own folder

> **TL;DR:** O que fala com a rede mora em `lib/http/` e `hooks/http/`. Regra de negócio, utilitário e hook de UI ficam fora. Quem procura uma requisição abre uma pasta só, sem garimpar no meio das regras.

| Pasta | Entra | Fica fora |
| --- | --- | --- |
| `lib/http/` | Faz `fetch` ou abre um stream (SSE, WebSocket); monta URL ou base da API; monta header de autenticação ou assina a requisição; lê o status ou o erro do cliente de cache (`FetchBaseQueryError`, flags de carregamento); lê o corpo da resposta ou monta o da requisição (`parseInvoice`, `buildInvoiceRequest`) | Regra de negócio, cálculo, formatação, texto de tela, utilitário genérico (`base64`, `cn`) |
| `hooks/http/` | Chama um hook gerado do cliente de cache (`useGetUsersQuery`, `useCreateInvoiceMutation`, `useLazyGetUserQuery`) ou a rede por um módulo de `lib/http/` | Estado de diálogo, toast, animação, hook que só compõe outros hooks |

| Caso | Decisão |
| --- | --- |
| Módulo que mistura leitura da resposta e regra | Separe em dois: o parse vai para `lib/http/`, a regra fica em `lib/` |
| Endpoints do cliente de cache (`createApi`, `injectEndpoints`) | Continuam em `store/api/` ([STATE-DATA.md](STATE-DATA.md)) |
| Hook que lê a API e também deriva dado | `hooks/http/`: o que decide é chamar a API; a derivação vem de `lib/` |
| Pasta colocada numa tela (`pages/<rota>/hooks/`, `pages/<rota>/lib/`) | A mesma divisão: `http/` dentro dela |

`lib/http/` segue as regras de `lib/`: sem React e sem store. É o único lugar de `lib/` onde aparece `fetch`.

❌ Errado: requisição, URL e parse soltos entre as regras; o hook da query ao lado do hook do diálogo.

```text
src/
  hooks/
    useDisclosure.ts
    useInvoices.ts
    useToast.ts
    useUser.ts
  lib/
    apiBase.ts
    formatMoney.ts
    invoiceTotal.ts
    parseInvoice.ts
    usersClient.ts
```

✅ Certo: a rede numa pasta própria, em `lib/` e em `hooks/`.

```text
src/
  hooks/
    http/
      useInvoices.ts
      useUser.ts
    useDisclosure.ts
    useToast.ts
  lib/
    http/
      apiBase.ts
      parseInvoice.ts
      usersClient.ts
    formatMoney.ts
    invoiceTotal.ts
```

Custo: um nível a mais no import (`@/lib/http/parseInvoice`) e a decisão de onde mora um módulo misto. Vale desde o primeiro módulo de rede, porque a alternativa é a pasta virar depósito.

## Hooks: one responsibility

> **TL;DR:** Um hook faz uma coisa e o nome diz qual. Hook que junta dados, estado de diálogo, derivações e handlers de uma tela inteira é um **hook-deus** e é proibido.

❌ Errado: `useUsersPage` junta três hooks de dados, três `useState` de diálogo, derivações e 25 valores no `return`; a tela lê tudo de um saco `page.x`.

```ts
export function useUsersPage() {
  const { users, loading, error, refetch } = useUsers();
  const actions = useUserActions();
  const [editingId, setEditingId] = useState<string>();
  const [removingId, setRemovingId] = useState<string>();
  const [inviteOpen, setInviteOpen] = useState(false);

  return {
    users,
    loading,
    error,
    inviteOpen,
    add: (values: UserFormValues) => void actions.add(values),
    startEdit: (user: User) => setEditingId(user.id),
    cancelEdit: () => setEditingId(undefined),
    startRemove: (user: User) => setRemovingId(user.id),
    cancelRemove: () => setRemovingId(undefined),
    setInviteOpen,
  };
}
```

✅ Certo: cada hook com uma responsabilidade; a tela é uma composição de seções, e cada seção chama só o que usa.

`useDisclosure.ts`:

```ts
/** Open/closed state for a dialog or popover. */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return { isOpen, open, close };
}
```

`UserListSection.tsx` chama `useUsers()` e `useDisclosure()`; `UserInviteDialog.tsx` recebe `isOpen` e `onClose`. A `page.tsx` só compõe as seções.

| Regra | Detalhe |
| --- | --- |
| Uma responsabilidade | Buscar dados, guardar estado de UI, ou ligar uma ação: um hook para cada |
| Sem hook por tela | Nada de `use<Tela>Page`, `use<Tela>Screen` nem `use<Tela>Controller`; a tela é composta por seções, cada uma com seus hooks |
| Retorno pequeno | Até 6 valores; passou disso, o hook faz coisa demais: divida |
| Tamanho | Corpo do hook dentro do limite de função (~50 linhas); veja [CODE-STYLE.md](CODE-STYLE.md) |
| Estado de abrir/fechar | `useDisclosure` (genérico) ou `useState` no componente do diálogo; nunca no hook da tela |
| Seleção para editar/remover | Fica no componente que renderiza o diálogo, não num hook que atende a tela inteira |
| Sem embrulho inútil | `add: (v) => void actions.add(v)` só descarta o retorno: faça a action já devolver `void` e exponha-a direto |
| Sem lambda no `return` | Handler com nome (`function startEdit`) ou função de `lib/`; não `startEdit: (u) => setEditingId(u.id)` |
| Derivação | Chame a função de `lib/` onde o dado é usado; não pré-calcule tudo no hook para a tela só repassar |
| Tela lê desestruturado | `const { users, loading } = useUsers()`; nunca um saco `page.x` com dezenas de campos |

- **Custo:** mais arquivos e mais hooks pequenos. Vale porque cada um se testa e se lê isolado, e a tela deixa de acordar tudo a cada mudança.
- **Quando o simples vence:** tela minúscula com um hook de dados e um `useState` não precisa de `useDisclosure`; não crie abstração para um uso.

## Complex flows outside React

| Fluxo | Onde fica |
| --- | --- |
| Até 2 estados síncronos | `useState` |
| Transições locais com várias ações | `useReducer`, com reducer puro em `lib/` |
| 3+ fases assíncronas, retry, cancelamento ou precisa sobreviver a reload | Máquina em `lib/`, na forma que o projeto usa: XState (`setup().createMachine`, `useActorRef` + `useSelector`) ou máquina própria assinada por `useSyncExternalStore` (exemplo abaixo) |

```ts
export type UploadState =
  | { phase: 'idle' }
  | { phase: 'uploading'; progress: number }
  | { phase: 'failed'; reason: string }
  | { phase: 'done'; fileId: string };

export interface StorageGateway {
  upload(file: Blob, onProgress: (progress: number) => void): Promise<string>;
}

export interface Upload {
  getState(): UploadState;
  subscribe(listener: () => void): () => void;
  start(file: Blob): Promise<void>;
}

/** Upload flow kept outside React; `subscribe` and `getState` feed `useSyncExternalStore`. */
export function createUpload(storage: StorageGateway): Upload {
  let state: UploadState = { phase: 'idle' };
  const listeners = new Set<() => void>();

  function setState(next: UploadState): void {
    state = next;
    listeners.forEach((listener) => listener());
  }

  function getState(): UploadState {
    return state;
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  async function start(file: Blob): Promise<void> {
    setState({ phase: 'uploading', progress: 0 });
    try {
      const fileId = await storage.upload(file, (progress) => setState({ phase: 'uploading', progress }));
      setState({ phase: 'done', fileId });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      setState({ phase: 'failed', reason });
    }
  }

  const upload = { getState, subscribe, start };
  return upload;
}
```

```ts
/** Current state of an upload flow, re-rendering on every change. */
export function useUploadState(upload: Upload): UploadState {
  const state = useSyncExternalStore(upload.subscribe, upload.getState);
  return state;
}
```

- As dependências externas (`StorageGateway`) entram por interface. Os testes passam uma versão falsa, e um hook ou o composition root passa a real.
- `getState()` devolve a **mesma referência** enquanto nada muda; senão `useSyncExternalStore` entra em loop.
- Os estados são uma união discriminada, nunca um punhado de booleanos (`isLoading`, `isError`, `isDone`).

## Error boundary

**Um só, na raiz, para a aplicação inteira.** Nada de boundary por rota nem por componente.

| Regra | Detalhe |
| --- | --- |
| Onde | O `ErrorBoundary` da rota raiz (React Router, modo data). Erro de renderização, de loader ou de action numa rota filha sobe até o boundary mais próximo, que é o da raiz |
| O que mostra | Uma tela de erro com mensagem segura para o usuário e uma ação (tentar de novo, voltar ao início); nunca stack trace |
| 404 e erro esperado | `useRouteError()` + `isRouteErrorResponse(error)` separam o erro com status (ex.: 404) da exceção inesperada |
| Relato | O boundary envia a exceção para o monitoramento escolhido, sem dados pessoais |
| Erro de dados | Falha de API não é boundary: fica no `AsyncState` da tela ([ASYNC-UI.md](ASYNC-UI.md)) |
| Fora do router | A doc só garante o boundary para o que roda dentro das rotas; mantenha os providers em volta do `RouterProvider` simples, sem lógica que possa lançar erro |

Fonte: https://reactrouter.com/how-to/error-boundary

## Feature flags

```ts
/** Features in gradual rollout: on only with the exact string `'true'`. */
export const FEATURES = {
  newBilling: import.meta.env.VITE_FEATURE_NEW_BILLING === 'true',
} as const;

/** Kill switches of features already live: off only with the exact string `'false'`. */
export const KILL_SWITCHES = {
  chat: import.meta.env.VITE_FEATURE_CHAT !== 'false',
} as const;
```

| Regra | Detalhe |
| --- | --- |
| Lugar | Um módulo só, `config/featureFlags.ts`; nenhum outro arquivo lê `VITE_FEATURE_*` |
| Feature nova | Falha **fechada**: só liga com `'true'` exato, então um ambiente sem a variável fica seguro |
| Kill switch | Falha **aberta**: só desliga com `'false'` exato, então o que já funciona não some por esquecimento |
| Desligada | A rota não é registrada e o item de menu e os pontos de entrada somem juntos; colar a URL não reabre a tela |
| Segurança | Flag esconde a interface; quem autoriza é o servidor |
| Testes | Cada flag é testada ligada e desligada |
| Fim do rollout | A flag e o caminho morto são removidos |

## Anti-patterns

- **`lib/` vazada:** `lib/` importa o store, ou faz `fetch` fora de `lib/http/`. A regra que precisa ler da rede recebe a função de leitura por parâmetro.
- **HTTP misturado:** módulo de rede ou hook que chama a API solto no meio das regras e dos hooks de UI. Mova para `lib/http/` ou `hooks/http/` ([HTTP in its own folder](#http-in-its-own-folder)).
- **`components/` como depósito:** cheio de widgets que uma tela só usa.
- **Hook-deus:** `use<Tela>Page` que agrega dados, diálogos, derivações e handlers e devolve dezenas de valores. Divida por responsabilidade (seção acima).
- **Global repetido:** o mesmo guard, tema ou analytics ligado em cada página em vez de uma vez no layout.
