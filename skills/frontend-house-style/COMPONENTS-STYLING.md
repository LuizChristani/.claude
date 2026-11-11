---
name: frontend-house-style-components
description: Component anatomy and styling of the React house style — compound components, context per compound, variants in a styles file with tailwind-variants, semantic CSS-variable tokens, named screen variants, accessibility defaults. Use when creating/editing a component, checking whether the app already has one to reuse, adding a variant, or styling a screen.
type: reference
scope: frontend
tokens: ~2k
---

# Components and styling

> **TL;DR:** Antes de criar, procure na aplicação um componente que já sirva. Componente reutilizável é composto (`Root` + partes + contexto + `*.styles.ts`). Cor, raio e espaçamento vêm de tokens semânticos, nunca de valor solto.

## Reuse before creating

**Antes de criar um componente, procure na aplicação um que já faça o trabalho.** Componente novo só nasce depois da busca, e só quando nenhum existente serve nem com uma variante nova.

| Onde procurar | Como |
| --- | --- |
| `components/` (compartilhados) | Liste a pasta e leia o `index.ts` de cada composto: `ls src/components` |
| `components/` da tela vizinha (`pages/*/components/`) | Busque pelo papel, não pelo nome que você ia dar: `grep -rli "dialog\|modal\|sheet" src --include=*.tsx` |
| Arquivos `*.styles.ts` | As variantes que já existem: `grep -rn "variants:" src --include=*.styles.ts` |
| Wrappers da lib headless | Dialog, menu, select, popover e tooltip do projeto já embrulham a lib ([Headless primitives](#headless-primitives)) |

Ordem de decisão, pare no primeiro passo que resolver:

1. **Existe e serve como está?** Use.
2. **Existe, mas falta um visual?** Acrescente uma variante no `*.styles.ts` dele.
3. **Existe, mas falta uma peça?** Componha com as partes do composto (`Card.Root` + `Card.Title` + o seu conteúdo).
4. **Existe numa tela só, e a sua é a segunda a precisar?** Mova-o de `pages/<rota>/components/` para `components/` e use nas duas ([ARCHITECTURE.md](ARCHITECTURE.md)).
5. **Nada serve?** Crie. Diga ao usuário quais componentes você olhou e por que nenhum serviu.

❌ Errado: um `ConfirmDeleteModal` feito do zero, com `div`, overlay e botões próprios, num app que já tem `Dialog` e `Button`. Agora são dois modais com foco, animação e Esc diferentes.

✅ Certo: o `Dialog` que já existe, com o conteúdo da tela.

```tsx
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Title>Excluir usuário?</Dialog.Title>
  <Dialog.Actions>
    <Button variant="ghost" onClick={close}>Cancelar</Button>
    <Button variant="danger" onClick={() => void remove(user.id)}>Excluir</Button>
  </Dialog.Actions>
</Dialog.Root>
```

**Custo:** a busca toma um minuto antes de cada componente novo. Um componente duplicado custa mais: dois visuais que se separam com o tempo e duas correções para cada bug.

## Compound component anatomy

```text
components/button/
  ButtonRoot.tsx       o elemento raiz + Provider do contexto
  ButtonIcon.tsx       parte que lê o contexto
  ButtonContext.ts     createContext + hook useButton()
  button.styles.ts     tv() com variants
  index.ts             Object.assign + export type
```

```ts
import { tv } from '@/lib/cn';

/** Button styles: `variant` colours it, `size` sets height and padding. */
export const button = tv({
  base: 'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-muted',
    },
    size: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4',
      lg: 'h-12 px-6 text-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export const ICON_SIZE = { sm: 14, md: 16, lg: 20 } as const;
```

```tsx
import { useMemo, type ComponentProps } from 'react';
import type { VariantProps } from 'tailwind-variants';
import { button } from './button.styles';
import { ButtonContext } from './ButtonContext';

export interface ButtonProps
  extends Omit<ComponentProps<'button'>, 'className'>, VariantProps<typeof button> {
  className?: string;
}

/** The `<button>` with `variant` and `size`; defaults to `type="button"`. */
export function ButtonRoot({ size = 'md', variant, className, type = 'button', ...rest }: ButtonProps) {
  const context = useMemo(() => ({ size }), [size]);
  return (
    <ButtonContext value={context}>
      <button
        {...rest}
        type={type}
        className={button({ size, variant, className })}
      />
    </ButtonContext>
  );
}
```

```ts
import { ButtonIcon } from './ButtonIcon';
import { ButtonRoot } from './ButtonRoot';

/** Composable button: `Button` is the root and `Button.Icon` an icon sized to it. */
export const Button = Object.assign(ButtonRoot, { Icon: ButtonIcon });

export type { ButtonProps } from './ButtonRoot';
```

| Regra | Detalhe |
| --- | --- |
| Quando compor | 2+ regiões configuráveis (cabeçalho, corpo, rodapé, ícone) → partes; senão um componente simples num arquivo só |
| Região opcional | Vira parte de **posição** (`Header.IconLeft`, `Header.Title`, `Header.IconRight`) com `...rest` do elemento, e quem usa monta só o que quer e decide ícone e ação. Anti-patterns: **interruptor-por-prop** (`onBack?`/`onClose?` ligando botões, `cn(onBack ? … : …)` corrigindo o espaçamento) e **parte-por-ação** (`Header.Back`, `Header.Close`, ou opções `{ back, close }` numa fábrica decidindo quais partes aparecem) |
| Props | `interface` que estende `ComponentProps<'el'>`; defaults na desestruturação; `...rest` no elemento raiz |
| `ref` | Prop comum (React 19); nada de `forwardRef` novo |
| Contexto | Valor memoizado com `useMemo` (a exceção de [PERFORMANCE.md](PERFORMANCE.md); dispensável com React Compiler); `<Ctx value={…}>` (React 19); hook `use<Name>()` ao lado |
| Dados | Componente compartilhado não busca dados; recebe por props |
| Botão | `type="button"` por padrão; ícone decorativo com `aria-hidden="true"`; botão só de ícone exige `aria-label` |

## No JSX in variables

Um componente calcula com funções de `lib/` e **retorna** JSX. Ele nunca guarda JSX numa variável para encaixar depois: se um pedaço da tela merece um nome, ele vira um componente.

```tsx
export function InvoiceRow({ invoice }: InvoiceRowProps) {
  const total = invoice.unitPrice * invoice.quantity;
  const totals = (
    <div className="flex flex-col items-end">
      <span>{formatMoney(total)}</span>
    </div>
  );
  return (
    <li>
      {invoice.name}
      {totals}
    </li>
  );
}
```

O exemplo acima viola a regra. A versão certa, um componente por arquivo:

`InvoiceTotals.tsx`:

```tsx
/** The amount column of an invoice row. */
export function InvoiceTotals({ total }: InvoiceTotalsProps) {
  return (
    <div className="flex flex-col items-end">
      <span>{formatMoney(total)}</span>
    </div>
  );
}
```

`InvoiceRow.tsx`:

```tsx
/** One invoice line: its name and its total. */
export function InvoiceRow({ invoice }: InvoiceRowProps) {
  const total = invoiceTotal(invoice);
  return (
    <li>
      {invoice.name}
      <InvoiceTotals total={total} />
    </li>
  );
}
```

| Faça | Não faça |
| --- | --- |
| Pedaço de tela com nome → componente (`<InvoiceTotals />`) | `const totals = (<div>…</div>)` dentro do componente |
| Conta numa função de `lib/` (`invoiceTotal(invoice)`), testada | Conta no corpo do componente ou dentro do JSX (`total={price * quantity}`) |
| Variante visual → prop do componente ou variante no `tv()` | Duas variáveis de JSX escolhidas por ternário |
| Condicional curta direto no JSX (`{isOpen && <Panel />}`) | Variável de JSX montada com `if` antes do `return` |
| Mesmo componente em dois lugares → objeto de props tipado e `<UserActions {...actions} />` em cada lugar | `const actions = (<UserActions … />)` e `{actions}` nos dois |
| Variante de layout → um componente por layout (`UserPanelWide`, `UserPanelCompact`) | `const content = (…)` e `const phoneContent = (…)` escolhidos por condição |

**Nunca, nem com um elemento só.** `const actions = <UserActions … />` também é JSX em variável, mesmo sem nenhuma tag nativa. **Nem dentro de `useMemo`:** `const field = useMemo(() => <SearchInput … />, […])` é a mesma violação, com dependências a mais ([PERFORMANCE.md](PERFORMANCE.md#memoized-jsx)).

❌ Errado: o elemento guardado para aparecer nos dois layouts.

```tsx
const actions = (
  <UserActions user={user} onEdit={onEdit} onRemove={onRemove} readOnly={readOnly} />
);
const wide = <div className="grid grid-cols-2">{actions}</div>;
const compact = <div className="flex flex-col">{actions}</div>;
return isCompact ? compact : wide;
```

✅ Certo: as props num objeto tipado, o componente escrito onde aparece, e cada layout no próprio componente.

`UserPanel.tsx`:

```tsx
/** The user panel in the layout that fits the screen. */
export function UserPanel({ user, onEdit, onRemove, readOnly }: UserPanelProps) {
  const isCompact = useCompactScreen();
  const actions: UserActionsProps = { user, onEdit, onRemove, readOnly };
  if (isCompact) return <UserPanelCompact actions={actions} />;
  return <UserPanelWide actions={actions} />;
}
```

`UserPanelCompact.tsx`:

```tsx
/** The user panel stacked for a narrow screen. */
export function UserPanelCompact({ actions }: UserPanelLayoutProps) {
  return (
    <div className="flex flex-col">
      <UserActions {...actions} />
    </div>
  );
}
```

O objeto de props pode ir para uma `const`; o JSX, nunca ([Spread props](#spread-props)).

- O componente extraído vai para o **próprio arquivo** ([One component per file](#one-component-per-file)): em `pages/<rota>/components/` se só uma tela usa, em `components/` se duas ou mais usam.
- O ganho: o pedaço extraído tem props tipadas, nome no React DevTools e pode ser testado sozinho.

## No markup in props

Prop que recebe JSX (slot: `icon`, `action`, `footer`, `pictureAction`) recebe **um elemento de componente**, nunca um bloco de marcação. Botão com handler, classes, ícone, texto e condição montados dentro de `prop={…}` viram um componente no próprio arquivo, e a prop recebe esse componente.

❌ Errado: um botão inteiro, com condição, handler e classes, dentro da prop.

```tsx
<UserCard
  user={user}
  action={
    canMessage &&
    !user.blocked && (
      <button
        type="button"
        onClick={() => onMessage(user.id)}
        aria-label={`Enviar mensagem para ${user.name}`}
        className="flex size-10 items-center justify-center rounded-full bg-surface"
      >
        <ChatIcon aria-hidden="true" />
      </button>
    )
  }
/>
```

✅ Certo: o botão é um componente; a condição vira um booleano com nome; a prop recebe o elemento.

`MessageUserButton.tsx`:

```tsx
/** Round button that opens a conversation with the user. */
export function MessageUserButton({ user, onMessage }: MessageUserButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onMessage(user.id)}
      aria-label={`Enviar mensagem para ${user.name}`}
      className={messageUserButton()}
    >
      <ChatIcon aria-hidden="true" />
    </button>
  );
}
```

`UserCard` em uso:

```tsx
const messageable = canMessageUser(user, canMessage);
return (
  <UserCard
    user={user}
    action={messageable && <MessageUserButton user={user} onMessage={onMessage} />}
  />
);
```

| Pode ir na prop | Vira componente |
| --- | --- |
| Um elemento de componente: `icon={<ChatIcon />}`, `action={<MessageUserButton … />}` | Qualquer elemento nativo (`<button>`, `<div>`, `<span>`) dentro de `prop={…}` |
| Condição curta com nome antes do elemento: `action={messageable && <MessageUserButton … />}` | Condição composta (`a && !b && (…)`) montada dentro da prop |
| — | Handler, `className` ou texto de tela dentro da prop |

## One component per file

Cada arquivo `.tsx` declara **um** componente. Nunca declare um componente dentro do corpo de outro, e nunca dois componentes no mesmo arquivo: skeleton, parte de um composto, item de lista e linha de tabela ganham cada um o seu arquivo, na mesma pasta.

❌ Errado: componente declarado dentro de outro. Ele vira um tipo novo a cada render, então o React desmonta e remonta o filho, que perde o estado e o foco ([react.dev](https://react.dev/learn/preserving-and-resetting-state)).

```tsx
export function UserList({ users }: UserListProps) {
  function UserRow({ user }: UserRowProps) {
    return <li>{user.name}</li>;
  }
  return (
    <ul>
      {users.map((user) => (
        <UserRow
          key={user.id}
          user={user}
        />
      ))}
    </ul>
  );
}
```

❌ Errado: dois componentes no mesmo arquivo, mesmo que o segundo não seja exportado.

```tsx
export function UserList({ users }: UserListProps) {
  return <ul>{users.map((user) => <UserRow key={user.id} user={user} />)}</ul>;
}

function UserRow({ user }: UserRowProps) {
  return <li>{user.name}</li>;
}
```

✅ Certo: cada componente no seu arquivo, na pasta do componente principal.

```text
components/user-list/
  UserList.tsx
  UserRow.tsx
  index.ts
```

| Regra | Detalhe |
| --- | --- |
| Um por arquivo | O nome do arquivo é o nome do componente (`UserRow.tsx` → `UserRow`) |
| Pasta | Componente com partes ganha uma pasta kebab-case; as partes ficam dentro dela |
| Entrada | `index.ts` reexporta o que é público; partes internas não entram no `index.ts` |
| Entrada com um arquivo só | Pasta sem outro arquivo para reexportar não ganha `index.ts`: o arquivo de entrada leva o nome do componente (`button.ts`), para achar pelo nome na busca |
| Projeto que já usa `index.ts` | Vale a convenção do projeto existente; esta regra só vale para projeto novo ou sem convenção |
| Componente dinâmico | Escolher de um mapa (`const View = VIEWS[kind]`) é permitido; declarar uma função componente no corpo, não |
| Arquivos que não são componente | Contexto + hook (`<Name>Context.ts`), estilos (`<name>.styles.ts`) e tipos ficam em arquivos próprios ao lado |

## Spread props

Quando um objeto já tem o formato das props do componente, passe-o com spread em vez de prop por prop.

```tsx
const user: UserProps = { id: 23, name: 'Ana', bio: 'Frontend engineer', avatarUrl: '/ana.png' };

return <User {...user} />;
```

| Faça | Não faça |
| --- | --- |
| `<User {...user} />` | `<User id={user.id} name={user.name} bio={user.bio} avatarUrl={user.avatarUrl} />` |
| Tipar o objeto com o tipo das props (`UserProps` ou `Pick<UserProps, …>`) | Espalhar um objeto com campos que o componente não declara |
| Prop explícita **depois** do spread para sobrescrever (`<User {...user} name={displayName} />`) | Prop explícita antes do spread, que o spread apaga sem aviso |
| Em listas: `users.map((user) => <User key={user.id} {...user} />)` | Espalhar dado cru da API sem validar ou mapear para as props |

- O spread em elemento HTML (`<input {...rest} />`) só recebe o `...rest` já tipado com `ComponentProps<'el'>`. Objeto de domínio espalhado no DOM vaza atributos inválidos.
- Se o objeto tem campos a mais, desestruture antes (`const { internalId: _internalId, ...props } = user;`) ou passe as props explícitas.

## Styles files

- Variantes ficam em `<name>.styles.ts`, exportando `tv({ base, variants, compoundVariants, defaultVariants })`.
- `tv` e `cn` vêm de `@/lib/cn`: um `createTV` com `extendTailwindMerge` registrando os tokens próprios do projeto. Sem isso, o merge descarta classes customizadas.
- O `className` de fora entra **dentro** da chamada: `button({ size, className })`, não `cn(button(), className)`.
- Componente com várias regiões usa `slots`: `card.root({ className })`, `card.header()`.
- **Classe completa:** escreva cada classe inteira (`cn('px-4', isOpen && 'px-6')`). Nunca monte por concatenação (`` `px-${size}` ``, `` `bg-${color}-500` ``): o Tailwind só gera as classes que encontra escritas por inteiro no código. Valor dinâmico de verdade vira variante no `tv()` ou variável CSS.
- **Uma receita por visual:** dois componentes com a mesma aparência compartilham a mesma função `tv()`, nunca uma cópia das classes. Exemplo: um link com cara de botão é `<Link className={button({ variant: 'primary' })}>`. Duas cópias de um visual são dois designs esperando para divergir.
- Loading e skeleton de componente seguem [ASYNC-UI.md](ASYNC-UI.md).

## Tokens

Quais papéis, escalas e contrastes os tokens precisam ter: [frontend-design](../frontend-design/FOUNDATIONS.md).

| Regra | Como |
| --- | --- |
| Cores | Variáveis CSS com nome semântico (`--background`, `--foreground`, `--primary`, `--primary-foreground`, `--muted`, `--ring`) mapeadas no tema do Tailwind |
| Claro e escuro | Os mesmos tokens redefinidos sob `.dark` (ou `[data-theme]`); os componentes não mudam |
| Sem valor solto | Nenhum `bg-[#…]` ou `p-[13px]` no componente; crie o token |
| Raio e sombra | Tokens próprios (`rounded-card`, `rounded-button`) quando o design define |
| Tamanho de tela | Mobile-first; variantes nomeadas no `global.css` (`@custom-variant short (…)`) quando um breakpoint se repete |
| Inline `style` | Só para valor calculado em runtime |
| Animação | `motion` para entrada, saída e layout; `transition-*` para hover; respeitar `prefers-reduced-motion` |

## Accessibility defaults

- HTML semântico primeiro (`button`, `nav`, `main`, `label`); ARIA só quando o HTML não resolve.
- Todo elemento interativo funciona no teclado e tem foco visível (`focus-visible:ring-*`).
- Campo com erro: `aria-invalid` + mensagem com `role="alert"` ou `aria-describedby`.
- Modal: prende o foco, fecha com Esc e devolve o foco ao fechar.

## Headless primitives

Dialog, menu, select, combobox, popover, tooltip, tabs e accordion **nunca são feitos do zero**: foco preso, teclado, ARIA e leitor de tela quase sempre saem com bug. Use uma lib headless (sem estilo) e estilize as partes com os slots do `tv()`.

| Regra | Detalhe |
| --- | --- |
| Qual lib | A que o projeto já usa ([Radix](https://www.radix-ui.com/primitives), [Base UI](https://base-ui.com), [React Aria](https://react-aria.adobe.com)); uma só por projeto |
| Projeto novo | Escolha uma com o usuário e registre no `.claude/` do projeto |
| Embrulho | Cada primitivo ganha um componente do projeto (`components/dialog/`); telas importam do projeto, nunca da lib direto, para a troca de lib acontecer num lugar só |
| Quem faz o quê | A lib dá o comportamento; o `*.styles.ts` dá a aparência |
| Componente próprio como filho | Precisa repassar as props recebidas e aceitar `ref` no elemento raiz; os componentes da casa já fazem isso com `...rest` (no React 19 o `ref` é prop, sem `forwardRef`) |

## Swapping the element

| Necessidade | Como |
| --- | --- |
| Elemento com a aparência de outro (link com cara de botão) | A receita compartilhada: `<Link className={button({ variant: 'primary' })}>` |
| Comportamento de um primitivo em outro elemento (link como gatilho de tooltip) | O mecanismo da lib: `asChild` no Radix, `render` no Base UI |
| Prop `as` genérica própria | Só quando o chamador precisa de verdade trocar o elemento; a tipagem polimórfica custa caro |

```tsx
<Tooltip.Trigger asChild>
  <Link to="/settings">Configurações</Link>
</Tooltip.Trigger>
```

```tsx
<Menu.Trigger render={<Button variant="secondary" />}>Opções</Menu.Trigger>
```

Fontes: https://www.radix-ui.com/primitives/docs/guides/composition e https://base-ui.com/react/handbook/composition

## Anti-patterns

- **Sopa de booleanos:** `<Card bordered compact highlighted />`. Use `variant`/`size` no `tv()` ou partes compostas.
- **Valor solto:** `bg-[#3b82f6]`. Use ou crie um token semântico.
- **Merge cego:** `cn(button(), className)` com classes customizadas que o `tailwind-merge` padrão não reconhece.
