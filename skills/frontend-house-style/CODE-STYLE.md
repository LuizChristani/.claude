---
name: frontend-house-style-code
description: Line-level code style of the React house style — exports, const-then-return, JSDoc, types, imports, naming, runtime validation, storage and async handling. Use when writing or reviewing any TS/TSX line.
type: reference
scope: frontend
tokens: ~1.5k
---

# Code style

> **TL;DR:** `export function`, `const` com nome antes do `return`, JSDoc ≤ 2 linhas como único comentário, zero `any`.

## Exports and functions

| Faça | Não faça |
| --- | --- |
| `export function UserCard(props: UserCardProps)` | `export const UserCard = (props) => …` |
| `export default` só onde o framework exige (`App`, arquivos de rota do Next.js) | `export default function UserCard` |
| Arrow só para callbacks, seletores e funções locais curtas | Arrow como componente ou função exportada |
| Composto: `export const Card = Object.assign(CardRoot, { Title: CardTitle })` | Partes soltas sem raiz comum |

## const-then-return

Valor calculado ganha uma `const` com nome, e o `return` devolve essa `const`.

```ts
export function fullName(user: User): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return name;
}
```

| Pode retornar direto | Precisa da `const` antes |
| --- | --- |
| Identificador ou campo (`return name;`, `return user.id;`) | Chamada (`return format(x);`) |
| Literal (`return null;`, `return false;`) | Ternário, `&&`, `\|\|`, `??`, comparação |
| JSX (`return ( <div>… )`); JSX **nunca** vai para uma `const` (ver COMPONENTS-STYLING.md) | `await`, `new`, template literal |
| Objeto ou array montado com valores já nomeados | Aritmética |
| Função (cleanup: `return () => clearTimeout(timer);`) | — |

**Nunca renomeie no `return`.** Se o valor deve sair com outro nome, renomeie a declaração e use a forma curta.

| ❌ | ✅ |
| --- | --- |
| `return { nextFrom: targetFrom };` | Renomear `targetFrom` para `nextFrom` (e as chamadas) e `return { nextFrom };` |
| Corpo curto de arrow (`(user) => user.id`) | — |

## Comments

- O único comentário permitido é **JSDoc** (`/** … */`), em **todo** símbolo exportado.
- Em inglês, no máximo **2 linhas**, dizendo o que o símbolo é ou garante, não como ele faz.
- Zero `//` e `{/* */}` no corpo. Explicação longa vai para `docs/`.
- Única exceção: a linha `//` logo acima de um `useEffect` mantido, dizendo qual sistema externo ele sincroniza ([EFFECTS.md](EFFECTS.md)).

```ts
/** Returns the value only after it stops changing for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay: number): T {
```

## Types

| Regra | Como |
| --- | --- |
| Sem `any`, `@ts-ignore`, `@ts-expect-error` | `unknown` + type guard (`function isUser(v: unknown): v is User`) |
| `as` | Só depois de checagem em runtime, ou em teste |
| Formas de objeto e props | `interface` |
| Uniões, tipos derivados de schema, mapeados | `type` |
| Objeto tipado sem alargar o tipo | `satisfies` |
| Mapa constante | `as const` |
| Estados exclusivos | União discriminada, nunca vários booleanos; os valores vêm de um objeto `as const` ([No magic strings](#no-magic-strings)) |
| Argumento não usado | Prefixo `_` |

## Typing props and data

**Campos sem comentário:** nenhum campo de `interface` ou de `type` de objeto leva JSDoc, seja de props, seja de dado (resposta da API, estado, perfil). O nome do campo tem que se explicar sozinho; se ele precisa de comentário para dizer o que é, troque o nome (`discount` → `discountPercent`). O JSDoc fica só no tipo ou no componente; o `check-style.mjs` acusa como `field-jsdoc`.

❌ Errado: o comentário explica um nome vago, e o "sem ela" esconde um segundo comportamento.

```tsx
interface PriceProps {
  amount: number;
  /** A list's size step, which scales the amount; left out, the card's size. */
  size?: Size;
}
```

✅ Certo: o nome diz de onde vem o valor e para que serve.

```tsx
interface PriceProps {
  amount: number;
  listSize?: Size;
}

/** A user as the profile screen shows it; a missing photo is `null`. */
interface UserProfile {
  name: string;
  avatarUrl: string | null;
  unreadCount: number;
}

/** An amount in minor units; inside a list, `listSize` scales it to the list's step. */
export function Price({ amount, listSize }: PriceProps) {
```

**Props discriminadas:** prop que só faz sentido numa variante só existe nessa variante.

```tsx
type ActionLinkProps = { children: ReactNode } & (
  | { kind: 'link'; href: string }
  | { kind: 'action'; onAction: () => void }
);

/** A link or a button with the same look, chosen by `kind`. */
export function ActionLink(props: ActionLinkProps) {
  if (props.kind === 'link') return <a href={props.href}>{props.children}</a>;
  return (
    <button
      type="button"
      onClick={props.onAction}
    >
      {props.children}
    </button>
  );
}
```

Estreite por `props.kind` antes de desestruturar; desestruturar antes perde o vínculo entre `kind` e as outras props.

**Genéricos:** componente reutilizável sobre qualquer tipo de item recebe `T`, nunca `any`.

```tsx
interface SelectProps<T> {
  options: readonly T[];
  value: T;
  getKey: (option: T) => string;
  getLabel: (option: T) => string;
  onChange: (option: T) => void;
}

/** Select over any option type; `getKey` identifies each option. */
export function Select<T>(props: SelectProps<T>) {
```

`<Select options={users} getLabel={(user) => user.name} … />` infere `T = User` sozinho. Só use genérico quando dois ou mais tipos usam o componente de verdade.

**União derivada de uma constante:** uma fonte só para os valores, o tipo e o schema.

```ts
export const ROLES = ['admin', 'editor', 'viewer'] as const;
export type Role = (typeof ROLES)[number];
export const RoleSchema = z.enum(ROLES);

const ROLE_LABEL = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Leitor',
} as const satisfies Record<Role, string>;
```

**IDs com marca (opcional):** quando vários tipos de id circulam juntos, a marca impede passar um pelo outro.

```ts
declare const brand: unique symbol;
type Brand<T, Name extends string> = T & { readonly [brand]: Name };

export type UserId = Brand<string, 'UserId'>;
export type TeamId = Brand<string, 'TeamId'>;
```

- O id ganha a marca uma vez, na fronteira (no schema que valida a resposta da API); o resto do app só recebe `UserId`.
- Custa cerimônia: use quando o app tem 3 ou mais tipos de id trafegando nas mesmas funções.

## Naming

| Tipo | Convenção | Exemplo |
| --- | --- | --- |
| Componente e arquivo dele | PascalCase | `UserCard.tsx` |
| Página | `<Name>Page` em `page.tsx` | `ProfilePage` |
| Hook | `use<Name>.ts` | `useDebouncedValue.ts` |
| Módulo puro | camelCase, um assunto por arquivo; nunca `utils` | `formatDate.ts` |
| Arquivo de variantes | `<name>.styles.ts` | `button.styles.ts` |
| Contexto | `<Name>Context.ts` + hook `use<Name>()` | `TabsContext.ts` |
| Schema | `<Name>Schema` + `type <Name> = z.infer<…>` | `UserSchema` |
| Constante | UPPER_SNAKE | `MAX_RETRIES` |
| Pasta | kebab-case | `date-picker/` |
| Booleano | `is`/`has`/`can` | `isOpen` |
| Ação do store | Evento no passado | `notificationDismissed` |

## Size limits

| Limite | Valor | Ao passar |
| --- | --- | --- |
| Função | ~50 linhas | Quebrar por responsabilidade em funções com nome |
| Indentação | 3 níveis | Early return; extrair o bloco interno numa função |
| Componente | ~200 linhas | Extrair partes em componentes |
| Props | 5 (fora `children`, `className` e as nativas do `...rest`) | Compor em partes, ou agrupar num objeto tipado passado com spread |
| Hook | ~50 linhas e 6 valores no retorno | Dividir por responsabilidade ([ARCHITECTURE.md](ARCHITECTURE.md#hooks-one-responsibility)) |
| Prop drilling | 2 níveis | Contexto do composto ou store |

## No switch

**Nunca use `switch`.** Escolha por valor vira um mapa tipado; condição vira `if` com early return.

```ts
const STATUS_LABEL = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
} as const satisfies Record<PostStatus, string>;

/** Display label of a post status. */
export function statusLabel(status: PostStatus): string {
  const label = STATUS_LABEL[status];
  return label;
}
```

| Caso | Substituir por |
| --- | --- |
| Valor → valor (rótulo, cor, ícone, variante) | `const MAP = { … } as const satisfies Record<Union, T>` |
| Valor → componente | Mapa de componentes (`Record<Kind, ComponentType<Props>>`) e `const View = VIEWS[kind]` |
| Valor → comportamento | Mapa de funções (`Record<Kind, (input: Input) => Output>`) |
| Condições que não são um valor só | `if` com early return |
| Reducer | Case reducers do `createSlice`, nunca `switch (action.type)` |

O `satisfies Record<Union, T>` dá erro de compilação quando um caso novo entra na união e falta no mapa, a mesma garantia de exaustividade que o `switch` daria.

## No magic strings

**O tipo declara as strings; um objeto `as const` em `SCREAMING_CASE`, conferido contra o tipo com `satisfies`, é o que o código usa.** Discriminante de estado, status, tipo de evento, modo e papel: comparar, montar e passar o valor usa sempre o objeto. A string só aparece no tipo e no objeto, e o compilador barra qualquer diferença entre os dois.

`uploadState.ts`:

```ts
/** The upload flow, one shape per kind. */
export type UploadState =
  | { kind: 'idle' }
  | { kind: 'sending'; file: File; progress: number }
  | { kind: 'done'; file: File; url: string }
  | { kind: 'failed'; reason: string };

/** One upload kind. */
export type UploadKind = UploadState['kind'];

/** Every upload kind, for comparing and building states. */
export const UPLOAD_KIND = {
  Idle: 'idle',
  Sending: 'sending',
  Done: 'done',
  Failed: 'failed',
} as const satisfies Record<string, UploadKind>;

/** True while the upload holds a file: sending or done. */
export function hasFile(state: UploadState): state is Extract<UploadState, { file: File }> {
  const holds = state.kind === UPLOAD_KIND.Sending || state.kind === UPLOAD_KIND.Done;
  return holds;
}
```

União simples, sem objeto de estado:

```ts
/** Who can see a post. */
export type Visibility = 'public' | 'followers' | 'private';

/** Every visibility, for comparing and building values. */
export const VISIBILITY = {
  Public: 'public',
  Followers: 'followers',
  Private: 'private',
} as const satisfies Record<string, Visibility>;
```

❌ Errado: a string solta repetida pela base, e o mesmo "ou" copiado em cada tela. Renomear um valor vira caça ao texto, e ninguém sabe que `sending || done` quer dizer "tem arquivo".

```ts
if (state.kind === 'sending' || state.kind === 'done') showPreview(state.file);
setState({ kind: 'idle' });
```

✅ Certo: o objeto e um predicado com nome.

```ts
if (hasFile(state)) showPreview(state.file);
setState({ kind: UPLOAD_KIND.Idle });
```

| Caso | Como |
| --- | --- |
| Declarar o tipo | Literal no tipo (`{ kind: 'done' }`, `'public' \| 'private'`); **nunca** `typeof UPLOAD_KIND.Done` nem `(typeof UPLOAD_KIND)[keyof typeof UPLOAD_KIND]` |
| Comparar | `state.kind === UPLOAD_KIND.Done` |
| Montar um estado ou evento | `{ kind: UPLOAD_KIND.Idle }` |
| Dois ou mais valores no mesmo teste | Predicado com nome, ao lado do tipo (`hasFile(state)`), nunca o `\|\|` repetido |
| Chave de um mapa `satisfies Record<Union, T>` | Literal liberado: o compilador confere cada chave |
| `typeof x === 'string'` e strings da plataforma (`event.key`, `url.protocol`, `document.visibilityState`, `error.name`) | Literal liberado: o valor não é do app |
| Teste que confere o formato enviado à rede ou ao storage | Literal liberado |
| String vazia (`value === ''`) | Literal liberado: não é valor de união |
| Schema zod com os mesmos valores | `z.enum(UPLOAD_KIND)`: o zod aceita o objeto `as const`; nunca repetir a lista ([zod.dev](https://zod.dev/api?id=enums)) |
| Nome | Objeto em `SCREAMING_CASE` (`UPLOAD_KIND`), tipo em `PascalCase` (`UploadKind`), chaves em `PascalCase`. Nunca o mesmo nome para os dois: a regra `no-redeclare` do lint acusa |

**Por que não `enum`:** a doc do TypeScript recomenda o objeto `as const` no lugar do `enum`, porque ele continua sendo JavaScript; e o `enum` não compila com `erasableSyntaxOnly`. Nunca `const enum`.

Fonte: https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums e https://www.typescriptlang.org/tsconfig/#erasableSyntaxOnly

O `satisfies Record<string, UploadKind>` faz o compilador recusar um valor do objeto que não exista no tipo, e o `as const` mantém cada valor como literal, para o `===` estreitar a união.

Fonte: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator

**Custo:** a string aparece duas vezes, no tipo e no objeto, e o `satisfies` não acusa um valor do tipo que falte no objeto. Compensa sempre que o valor é comparado ou montado fora do arquivo que o declara.

## Imports

**Imports em grupos por papel, sempre na mesma ordem, com uma linha em branco entre os grupos.** Dentro do grupo, a ordem é a do formatter (natural, por caminho). Quem lê o topo do arquivo vê de cara do que ele depende: do framework, de outra lib ou de qual camada do projeto.

| # | Grupo | Exemplos |
| --- | --- | --- |
| 1 | React e pacotes `react-*` | `react`, `react-dom`, o roteador e o binding do store quando o nome começa com `react` |
| 2 | Outros pacotes | Validação, animação, ícones, cliente HTTP |
| 3 | Telas, molduras e componentes do projeto | `@/pages/…`, `@/layout/…`, `@/components/…` |
| 4 | Hooks | `@/hooks/…` |
| 5 | Estado e dados do servidor | `@/store/…` (qualquer que seja a lib de estado) |
| 6 | Código puro e constantes | `@/lib/…`, `@/config/…` |
| 7 | Só tipos | `import type { User } from '@/lib/types/user'` |
| 8 | Relativos | `./UserAvatar`, `../hooks/useUserForm` (no máximo um `../`) |
| 9 | Estilos e imports de efeito | `import './user.css'` |

`UserPanel.tsx`:

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { motion } from 'motion/react';
import { z } from 'zod';

import { Button } from '@/components/button';
import { UserCard } from '@/components/UserCard';

import { useUser } from '@/hooks/http/useUser';

import { useGetUserQuery } from '@/store/api/userApi';

import { formatMoney } from '@/lib/money';

import type { User } from '@/lib/types/user';

import { UserAvatar } from './UserAvatar';

import './user.css';
```

| Regra | Detalhe |
| --- | --- |
| Pasta nova no projeto | Entra no grupo do papel dela (ver [ARCHITECTURE.md](ARCHITECTURE.md)) e no config do formatter; nunca cai no grupo de pacotes por acidente |
| Só tipos | `import type { X }` em linha própria, no grupo 7; import que traz valor e tipo fica no grupo do valor |
| Import de efeito (CSS, polyfill) | Por último, escrito à mão: o formatter não move import de efeito e ele trava a ordenação em volta |
| Caminho | `@/` para subir mais de um nível; `../../` é proibido (regra `no-restricted-imports`) |
| Ordem | O formatter ordena; não arrume à mão (exceto o grupo 9) |

**🔧 Stack note:** com `@ianvs/prettier-plugin-sort-imports`, os grupos acima ficam assim. As expressões não se sobrepõem, porque o README não define qual grupo ganha quando um import casa com duas; `<BUILTIN_MODULES>` vem primeiro porque o plugin o injeta no topo de qualquer forma; `""` cria a linha em branco; `<TYPES>` junta os imports de tipo. Com ESLint (`import/order`) ou Biome, configure os mesmos grupos, na mesma ordem, com linha em branco entre eles.

```json
{
  "importOrder": [
    "<BUILTIN_MODULES>",
    "^react(-[\\w-]+)?(/.*)?$",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/(pages|layout|components)(/.*)?$",
    "",
    "^@/hooks(/.*)?$",
    "",
    "^@/store(/.*)?$",
    "",
    "^@/(lib|config)(/.*)?$",
    "",
    "<TYPES>",
    "",
    "^[.]"
  ],
  "importOrderTypeScriptVersion": "<versão do typescript no package.json>"
}
```

Fonte: https://github.com/IanVS/prettier-plugin-sort-imports e https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/order.md

## React Native runtime

Em React Native o código roda no Hermes, não no Node nem no navegador. Método novo de array que o Hermes não traz passa no TypeScript e no lint e só quebra no aparelho, com `TypeError: undefined is not a function`.

| ❌ Não use em React Native | ✅ Use |
| --- | --- |
| `list.toSorted(compare)` | `[...list].sort(compare)` (ou `.sort` direto sobre um array que `filter`/`map` acabou de criar) |
| `list.toReversed()` | `[...list].reverse()` |
| `list.toSpliced(i, n)` | `[...list.slice(0, i), ...list.slice(i + n)]` |

- Antes de usar um método da ES2023 ou mais novo num app React Native, confirme que o Hermes da versão instalada o traz; na dúvida, rode no aparelho antes de dar por pronto.
- O `check-style.mjs` aponta `hermes-builtin` em projeto que depende de `react-native`.

## Boundaries and data

| Assunto | Regra |
| --- | --- |
| Dado de fora do app (API sem contrato tipado, storage, `postMessage`, URL) | `Schema.safeParse`; em falha, cair num default seguro |
| Variável de ambiente | Lida e validada num módulo só em `config/`; o resto do app importa de lá |
| Storage local | Chaves num objeto em `config/`; todo acesso dentro de `try/catch` |
| Dinheiro (se o app lida com isso) | Inteiro em unidade menor; um formatador só, chamado na exibição |
| Datas | Um módulo de formatação; nunca `toLocaleString` espalhado |
| Navegação por clique | `<Link to={path}>`, nunca `<button onClick={() => navigate(path)}>`; `navigate()` só depois de uma ação (ex.: salvar e redirecionar) |
| Promise solta em handler | Descartar com `void` (`onClick={() => void save(form)}`) |
| Handler inline (`onClick={() => …}`) | Liberado: função nova não causa re-render; só quebra um filho em `memo` (ver PERFORMANCE.md) |
| Falha engolida de propósito | Log de aviso com o erro; nunca dado pessoal |
