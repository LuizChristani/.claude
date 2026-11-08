---
name: frontend-house-style-official-docs
description: Where to check every framework and library API before using it — official documentation sites of the default stack and the rules for citing them. Use before writing code with any library API, when unsure of a signature or version, or when introducing a new pattern.
type: reference
scope: frontend
tokens: ~0.5k
---

# Official docs

> **TL;DR:** Toda API é conferida na documentação oficial da versão instalada antes de ser usada. Nada de memória, blog ou tutorial de terceiro.

Antes de escrever código com uma API, confira na documentação oficial: a assinatura, o que mudou na versão instalada (`package.json`) e o que a doc marca como deprecated, experimental ou canary. Use a ferramenta de busca/leitura web ou um MCP de documentação, se houver.

| Lib | Documentação oficial |
| --- | --- |
| React | https://react.dev |
| React Router | https://reactrouter.com |
| Redux Toolkit e RTK Query | https://redux.js.org/toolkit/ |
| React Redux | https://react-redux.js.org |
| Tailwind CSS | https://tailwindcss.com/docs (o que muda da v3 para a v4 e o procedimento: [TAILWIND.md](TAILWIND.md)) |
| tailwind-variants | https://www.tailwind-variants.org |
| zod | https://zod.dev |
| Radix Primitives | https://www.radix-ui.com/primitives |
| Base UI | https://base-ui.com |
| React Aria | https://react-aria.adobe.com |
| XState | https://stately.ai/docs |
| class-variance-authority (CVA) | https://cva.style |
| motion | https://motion.dev/docs |
| Vitest | https://vitest.dev |
| Vite | https://vite.dev |
| TypeScript | https://www.typescriptlang.org/docs |
| oxlint | https://oxc.rs/docs/guide/usage/linter |
| Prettier | https://prettier.io/docs |

- Lib fora da tabela: a documentação do site oficial ou do repositório oficial do pacote, nunca blog ou tutorial de terceiro.
- Ao introduzir um padrão novo no projeto, cite na resposta ao usuário o link da página da doc que o embasa.
- Se a doc contradiz esta skill (API mudou, recomendação nova), siga a doc e avise o usuário para atualizar a skill.

## Setup guides: follow the paths as written

Guia oficial de instalação ou integração (de framework, bundler, plugin de CSS) é seguido ao pé da letra no **onde**: local de cada arquivo, nome e caminho de import. Arrumar a pasta "para ficar mais organizado" muda o que o guia testou.

❌ Errado: o guia manda `styles.css` na raiz e `import '../../styles.css'` no layout raiz; o arquivo vai para `src/` e o import vira `'../styles.css'`.

✅ Certo: `styles.css` fica na raiz e o import é o do guia. Querendo outro lugar, mostre ao usuário o que o guia diz e pergunte antes de mover.

- Anti-pattern **Guia reorganizado**: os passos do guia são seguidos, mas os arquivos vão para onde parece melhor.
- Se o usuário já escreveu o caminho do guia, ele não é "erro de caminho" para corrigir: confira no guia antes de trocar.

## URLs and delegated reads

URL de site ou repositório oficial pode ser tentada mesmo sem o caminho ter sido visto. O risco é o 404 (página movida, `.html` a mais, nome de pacote trocado), e a regra trata disso.

| Regra | Detalhe |
| --- | --- |
| Só fonte oficial | Site ou repositório oficial da lib: pode ir ao agente de leitura ou ao `WebFetch`, com o caminho provável; blog, tutorial e resposta de fórum continuam proibidos |
| Caminho incerto | Quando a página exata é duvidosa, passe a raiz da doc e o assunto ("ache a página de instalação com npm") ou busque antes: custa uma leitura a mais e evita o 404 |
| Nome de pacote ou repositório | Confira o nome exato no registro do pacote (`npm view <pkg> homepage repository.url`) antes de montar uma URL com ele |
| 404 ou página fora do ar | Avise o usuário na hora (qual URL falhou e que o caminho era suposto); tente a raiz da doc ou outra fonte oficial (tipos instalados em `node_modules`, README do repositório oficial); não repita a mesma URL |
| Relatório do agente | Peça `não confirmado` e o motivo para o que a doc não mostrou; esse item não vira código sem uma segunda fonte oficial |

❌ Errado: a leitura de `https://lib.dev/installation/node.html` volta com 404 e a lacuna é preenchida com o que se lembra, sem avisar.

✅ Certo: o 404 é avisado, a raiz `https://lib.dev/` é aberta, a página real (`/installation/node/`) é achada na navegação e o comando é tirado dela.

- Anti-pattern **Lacuna de memória**: o 404 é engolido e o código segue com o que "parece certo".
- Custo da regra: uma leitura a mais quando o caminho falha; o ganho é nunca escrever uma API sem fonte.
- Não há checagem automática: a URL mora no texto do prompt, não no código, então não há linha para o `check-style.mjs` apontar.
