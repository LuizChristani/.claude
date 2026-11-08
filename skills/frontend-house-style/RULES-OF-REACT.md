---
name: frontend-house-style-rules-of-react
description: The Rules of React as the house style applies them — pure render, components and hooks called only by React, hooks at the top level, stable keys, refs kept out of render — with wrong vs right examples and official sources. Use when writing or reviewing any component or hook, list rendering, refs, or code that runs during render.
type: reference
scope: frontend
tokens: ~1.5k
---

# Rules of React

> **TL;DR:** São regras, não sugestões: quebrar uma delas é bug. O render é puro, só o React chama componentes e hooks, hooks ficam no topo, `key` vem do dado e `ref` não é lido durante o render.

Fonte geral: https://react.dev/reference/rules

## Pure render

O mesmo props, state e context devolve sempre o mesmo JSX.

| Regra | Detalhe |
| --- | --- |
| Nada imprevisível no render | Sem `new Date()`, `Date.now()` ou `Math.random()` durante o render; o valor vem de um evento, de um efeito ou de um store externo |
| Nunca mutar o que veio de fora | Props, state, context, argumentos e retornos de hooks e valores já passados ao JSX são imutáveis; copie antes (`toSorted`, `[...items]`, `{ ...user }`) |
| Mutação local é permitida | Um array criado neste render pode receber `push` |
| Efeito colateral fora do render | `document.title`, storage e rede vão para um handler ou efeito; título da página com `<title>` (React 19) |
| Strict Mode ligado | Em desenvolvimento ele renderiza duas vezes para expor render impuro |

❌ Errado: ordena a prop no lugar e mexe no `document` durante o render.

```tsx
export function UserList({ users }: UserListProps) {
  users.sort((a, b) => a.name.localeCompare(b.name));
  document.title = `${users.length} usuários`;
  return <ul>{users.map((user) => <UserRow key={user.id} {...user} />)}</ul>;
}
```

✅ Certo: a ordenação é uma função pura de `lib/` que devolve uma cópia, e o título é um elemento.

```tsx
export function UserList({ users }: UserListProps) {
  const sorted = sortByName(users);
  const title = usersTitle(users.length);
  return (
    <>
      <title>{title}</title>
      <ul>
        {sorted.map((user) => (
          <UserRow
            key={user.id}
            {...user}
          />
        ))}
      </ul>
    </>
  );
}
```

Fontes: https://react.dev/reference/rules/components-and-hooks-must-be-pure e https://react.dev/learn/keeping-components-pure

## Components and hooks are called by React

| Regra | ❌ | ✅ |
| --- | --- | --- |
| Componente só em JSX | `{UserCard({ user })}` | `<UserCard user={user} />` |
| Hook nunca vira valor | `<Table useData={useUsers} />`, `withLogging(useUsers)` | Chamar o hook dentro do componente ou de outro hook |
| Hook no topo | Dentro de `if`, `for`, `try/catch`, handler, callback de `useMemo` ou depois de um `return` antecipado | Antes de qualquer `return`, sempre na mesma ordem |
| Hook só em componente ou hook | Chamar `useUser()` numa função comum de `lib/` | `lib/` recebe o valor por argumento |

Fontes: https://react.dev/reference/rules/react-calls-components-and-hooks e https://react.dev/reference/rules/rules-of-hooks

## Keys

| Regra | Detalhe |
| --- | --- |
| Do dado | `key` é o id estável do item (`user.id`) |
| Nunca o índice | Em lista que muda, reordena ou tem estado; a única exceção é lista estática que nunca reordena |
| Nunca gerada no render | Sem `Math.random()` nem `crypto.randomUUID()` no render; item criado no front ganha o id no momento da criação (no handler) |
| No elemento do `map` | `<UserCard key={user.id} {...user} />`, nunca no `div` de dentro do `UserCard` |
| Vários elementos por item | `<Fragment key={user.id}>`; o `<>` não aceita `key` |
| Não é prop | O componente não recebe `key`; se precisar do id, passe também como prop |

Fonte: https://react.dev/learn/rendering-lists

## Refs

| Regra | Detalhe |
| --- | --- |
| Fora do render | Nunca leia nem escreva `ref.current` durante o render; a exceção é a inicialização preguiçosa (`if (!ref.current) ref.current = createThing()`) |
| Se aparece na tela, é state | `{isOnRef.current ? 'On' : 'Off'}` é sinal de que o valor devia ser state |
| Um por instância | Timer, handle ou instância de lib externa vai num `useRef`, nunca numa variável de módulo (que é compartilhada por todas as instâncias) |
| Válvula de escape | Se boa parte do fluxo de dados passa por refs, repense o desenho |

Fonte: https://react.dev/learn/referencing-values-with-refs

## Checklist

- [ ] Nenhum `Date`, `Math.random` ou efeito colateral durante o render
- [ ] Nenhuma mutação de props, state ou valores vindos de hooks
- [ ] Componentes só em JSX; hooks só no topo, nunca passados como valor
- [ ] Toda `key` vem de um id estável do dado
- [ ] Nenhum `ref.current` lido ou escrito no render
