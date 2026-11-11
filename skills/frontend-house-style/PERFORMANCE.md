---
name: frontend-house-style-performance
description: Performance rules of the React house style — avoid over-optimization, measure before memoizing, when useMemo/useCallback/memo, virtualization, debounce and code splitting are justified. Use when tempted to add memoization or any optimization, reviewing a diff full of useMemo/useCallback, or fixing a slow screen.
type: reference
scope: frontend
tokens: ~1k
---

# Performance

> **TL;DR:** Evite otimização prematura. Escreva o código simples primeiro, meça com o React Profiler e só então otimize o que a medição apontou.

## Core principle

**Otimização sem medição é custo sem retorno.** Cada `useMemo`, `useCallback` e `memo` acrescenta código, uma lista de dependências que pode ficar errada e uma comparação a cada render. Só vale quando resolve um problema que alguém viu.

## Decision rules

| Otimização | Só use quando | Senão |
| --- | --- | --- |
| `useMemo` em cálculo | O Profiler mostra o cálculo como gargalo, ou ele percorre 1.000+ itens a cada render | Calcule direto no render |
| `useMemo` / `useCallback` por identidade | O valor é dependência de um efeito, é o `value` de um Context ou vai para um filho já em `memo` | Valor ou função inline |
| `memo(Component)` | O Profiler mostra re-renders caros com as mesmas props | Componente normal |
| `useMemo` em JSX | **Nunca.** Se o Profiler mostrar re-render caro do filho, use `memo` no componente filho ([JSX memoizado](#memoized-jsx)) | Elemento escrito direto no JSX |
| Virtualizar lista | 200+ linhas visíveis no mesmo scroll, ou travamento medido | `.map` simples |
| Debounce / throttle | Evento de alta frequência que dispara rede ou cálculo pesado (busca digitada, scroll, resize) | Handler direto |
| `lazyWithRetry` + `Suspense` | Rota ou painel pesado que nem todo usuário abre | Import normal |
| Cache próprio | Nunca para dado do servidor: o cliente de cache já resolve | Use o cache de servidor |

- **React Compiler** (estável desde a v1.0, out/2025): em projeto novo, ative. Com ele, código novo não leva `useMemo`, `useCallback` nem `memo` à mão; use `useMemo`/`useCallback` só como válvula de escape quando precisar de controle exato (ex.: dependência de um efeito). Memoização que já existe fica, ou sai uma por vez com teste, porque removê-la muda o que o compilador gera. Fonte: https://react.dev/blog/2025/10/07/react-compiler-1
- Setup no Vite com `@vitejs/plugin-react` 6+: `babel-plugin-react-compiler` e `@rolldown/plugin-babel`, com `babel({ presets: [reactCompilerPreset()] })` nos plugins. Confira a versão na doc antes: https://react.dev/learn/react-compiler/installation
- Antes de memoizar, tente o que é de graça: mover o estado para mais perto de quem usa, passar `children` em vez de renderizar dentro, e usar seletores mais estreitos no store.

## Memoized JSX

Criar um elemento (`<SearchInput … />`) a cada render é só criar um objeto: é barato e não é o problema. O que custa é o filho re-renderizar, e quem evita isso é `memo` no componente, só depois de medir. `useMemo` em volta de JSX funciona, mas a doc oficial não recomenda: não pode ser condicional, traz uma lista de dependências para manter e ainda é JSX numa variável ([No JSX in variables](COMPONENTS-STYLING.md#no-jsx-in-variables)).

❌ Errado: o elemento guardado num `useMemo` "para não ser recriado a cada render".

```tsx
const searchField = useMemo(
  () => (
    <SearchInput
      value={searchTerm}
      onValueChange={setSearchTerm}
      onKeyDown={handleSearchKeyDown}
      placeholder="e.g. Jane Doe"
      aria-label="Search users"
    />
  ),
  [handleSearchKeyDown, searchTerm, setSearchTerm],
);
return <Toolbar>{searchField}</Toolbar>;
```

✅ Certo: o elemento escrito onde aparece, sem memoização.

`UserToolbar.tsx`:

```tsx
/** The toolbar above the user list, with the search field. */
export function UserToolbar({ searchTerm, onSearchTermChange, onSearchKeyDown }: UserToolbarProps) {
  return (
    <Toolbar>
      <SearchInput
        value={searchTerm}
        onValueChange={onSearchTermChange}
        onKeyDown={onSearchKeyDown}
        placeholder="e.g. Jane Doe"
        aria-label="Search users"
      />
    </Toolbar>
  );
}
```

| Situação | Faça |
| --- | --- |
| Nenhuma medição | Elemento direto no JSX |
| O Profiler mostra o filho re-renderizando caro com as mesmas props | `export const SearchInput = memo(function SearchInput(…) { … })` e props estáveis |
| Projeto com React Compiler | Elemento direto no JSX; o compilador memoiza sozinho |

Fonte: https://react.dev/reference/react/useMemo#memoizing-individual-jsx-nodes

## Lazy routes with retry

Depois de um deploy, a aba aberta ainda pede os chunks antigos, que não existem mais, e a rota quebra. Nunca use `React.lazy` cru: use `lazyWithRetry`, que tenta de novo com espera crescente e, em último caso, recarrega a página uma vez.

```ts
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 350;
const RELOAD_KEY = 'app:chunk-reload-at';
const RELOAD_COOLDOWN_MS = 30_000;
const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \S+ failed|Unable to preload CSS/i;

/** Whether an error is a failed download of a lazy chunk; browsers word it differently. */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  const isChunkError = CHUNK_ERROR.test(message);
  return isChunkError;
}

function wait(ms: number): Promise<void> {
  const timer = new Promise<void>((resolve) => setTimeout(resolve, ms));
  return timer;
}

function canReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY));
    const allowed = !Number.isFinite(last) || Date.now() - last >= RELOAD_COOLDOWN_MS;
    if (allowed) sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    return allowed;
  } catch {
    return false;
  }
}

/** Loads a dynamic import, retrying chunk failures and reloading the page once as a last resort. */
export async function loadWithRetry<T>(factory: () => Promise<T>, attempt = 0): Promise<T> {
  try {
    const loaded = await factory();
    return loaded;
  } catch (error) {
    if (!isChunkLoadError(error)) throw error;
    if (attempt < MAX_RETRIES) {
      await wait(RETRY_DELAY_MS * 2 ** attempt);
      const retried = await loadWithRetry(factory, attempt + 1);
      return retried;
    }
    if (navigator.onLine && canReload()) {
      window.location.reload();
      const reloading = new Promise<T>(() => {});
      return reloading;
    }
    throw error;
  }
}

/** Drop-in `React.lazy` for routes, resilient to stale chunks after a deploy. */
export function lazyWithRetry<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
): LazyExoticComponent<ComponentType<P>> {
  const component = lazy(() => loadWithRetry(factory));
  return component;
}
```

- `lazyWithRetry` mora em `lib/lazyWithRetry.ts` e tem testes de `isChunkLoadError` e `loadWithRetry` com uma factory falsa.
- O `Suspense` fica no layout, com um fallback de skeleton; a falha final cai no error boundary da raiz (ARCHITECTURE.md → Error boundary).

## How to measure

1. Reproduza a lentidão num build de produção (`npm run build && npm run preview`), não no dev.
2. Grave a interação no Profiler do React DevTools e ache o componente com mais tempo ou mais renders.
3. Aplique **uma** otimização, grave de novo e compare.
4. Se não melhorou, remova a otimização.

## Anti-patterns

- **Primitivo pesado por célula:** popover, tooltip ou hook de store em cada um de centenas de itens repetidos (90 dias × 15 linhas = 1.350 popovers, cada um formatando a própria data). Qualquer troca global (idioma, tema) redesenha todos e trava a página por centenas de ms, e a animação que deveria rodar some. Os itens viram elementos simples sem hook, e o detalhe sai de um ponto só (a legenda da linha, um popover por linha); meça o bloqueio no navegador antes e depois.
- **Memo em tudo:** `useCallback` em cada handler e `useMemo` em cada objeto "por precaução". É ruído, e a lista de dependências errada vira bug.
- **JSX memoizado:** `useMemo(() => <SearchInput … />, […])` para o elemento "não ser recriado". Recriar o elemento não custa; o código fica mais feio e ganha dependências para manter. Escreva o elemento no JSX e, se a medição pedir, `memo` no componente ([Memoized JSX](#memoized-jsx)).
- **`memo` furado:** envolver o filho em `memo` e passar um objeto ou arrow novo a cada render. A comparação roda e falha sempre.
- **Otimização de microbenchmark:** trocar `.map` por `for` ou evitar spread para ganhar nanossegundos que ninguém percebe.
- **Cache duplicado:** guardar dado do servidor em estado próprio "para ficar mais rápido".

## Trade-offs

- Simples primeiro pode exigir uma segunda passada quando a tela crescer. Essa passada é barata se a regra estiver em `lib/` e os componentes forem pequenos.
- O `value` de um Context é a exceção comum: sem React Compiler, memoize-o, porque um objeto novo re-renderiza todos os consumidores.
