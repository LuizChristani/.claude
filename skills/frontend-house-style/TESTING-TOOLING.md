---
name: frontend-house-style-testing-tooling
description: Tests and tooling of the React house style — Vitest layout and coverage of pure code, static-markup component tests, Prettier/oxlint/lefthook/tsconfig settings, Conventional Commits. Use when writing tests, configuring lint/format/hooks, or committing.
type: reference
scope: frontend
tokens: ~1.5k
---

# Testing and tooling

> **TL;DR:** O código puro tem 100% de cobertura. Componente se testa pelo HTML renderizado, com a regra tirada dele. Lint, format e typecheck rodam antes de cada commit.

## Tests

| Regra | Detalhe |
| --- | --- |
| Local | Subpasta `tests/` ao lado do código: `lib/tests/formatDate.test.ts` importa `../formatDate` |
| Nomes | `describe` e `it` em inglês, frase de comportamento (`'returns an empty string for a missing date'`) |
| Agrupamento | Vários `describe` por tema no mesmo arquivo |
| Funções e máquinas | Dependências falsas injetadas; afirmar a saída, os estados e as chamadas, nunca o estado interno |
| Bordas | Vazio, zero, negativo, limite e valor inválido têm cada um o seu caso |
| Componentes | `renderToStaticMarkup` + `vi.mock` dos hooks e do store; afirmar sobre o HTML |
| Interação complexa | Não teste clicando: tire a regra para `lib/` ou para um reducer e teste lá |

```tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { UserList } from '../UserList';

vi.mock('@/store/api/users/usersApi', () => ({
  useGetUsersQuery: () => ({ data: [], isLoading: false, isError: false }),
}));

describe('UserList', () => {
  it('shows the empty state when there are no users', () => {
    const html = renderToStaticMarkup(<UserList />);
    expect(html).toContain('No users yet');
  });
});
```

## Coverage

```ts
const coverage = {
  provider: 'v8' as const,
  include: ['src/lib/**', 'src/pages/**/lib/**', 'src/store/slice/**'],
  exclude: ['**/*.test.ts'],
  thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
};
```

- Arquivo de cola que não vale testar é excluído **pelo nome** nesse config.
- Nunca `/* v8 ignore */` nem `istanbul ignore`.

## Tooling

| Ferramenta | Configuração |
| --- | --- |
| TypeScript | `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, paths `@/* → ./src/*` |
| Prettier | `singleQuote`, `semi`, `printWidth: 100`, `singleAttributePerLine`; plugins `@ianvs/prettier-plugin-sort-imports` e `prettier-plugin-tailwindcss` com `tailwindFunctions: ["cn", "tv"]` |
| oxlint | `typescript/no-explicit-any`, `typescript/ban-ts-comment`, `no-restricted-imports` para `../../**`, `no-unused-vars` com `^_`, `react/rules-of-hooks`, `react/exhaustive-deps`, `react/set-state-in-effect`, `react/purity`, `react/refs`, `react/static-components`, `react/only-export-components` |
| lefthook (pre-commit) | `oxlint --fix --deny-warnings` e `prettier --write` nos arquivos staged, mais `tsc --noEmit` |
| Scripts | `dev`, `build` (`tsc && vite build`), `test`, `test:coverage`, `lint`, `format`, `format:check` |

## Commits

- Conventional Commits em inglês, com escopo quando houver: `feat(profile): …`, `fix(auth): …`, `refactor(styles): …`.
- Resumo no imperativo, dizendo o efeito para quem usa (`keep the sidebar open after a reload`).

## Anti-patterns

- **Teste de implementação:** afirmar estado interno, contar renders ou checar classe CSS. Afirme o texto e a estrutura que o usuário vê, e as chamadas feitas.
- **Cobertura maquiada:** comentário de ignore para chegar a 100%.
