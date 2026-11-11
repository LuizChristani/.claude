# Memória de correções de código

Registro do que o Claude fez errado no código e de como o usuário pediu para corrigir. Vale para todos os projetos em `meu-controle/`.

## Como usar

- **Antes de escrever código:** leia as entradas abaixo e não repita nenhum desses erros.
- **Quando o usuário corrigir algo no código:** acrescente uma entrada no topo de "Entradas", no mesmo turno, antes de seguir com a tarefa.
- Uma entrada por correção. Se a mesma correção se repetir, não crie outra entrada: atualize a existente e some 1 em "Vezes".
- Toda correção de código também atualiza, no mesmo turno, a skill que cobre o assunto em `skills/` (ex.: `skills/frontend-house-style/CODE-STYLE.md`). A entrada cita o arquivo da skill que mudou.

## Formato

```md
### AAAA-MM-DD · <projeto> · <assunto curto>
- **Errado:** o que o Claude fez (arquivo/trecho, se houver).
- **Correção pedida:** o que o usuário pediu, com as palavras dele quando possível.
- **Regra:** o que fazer daqui em diante, em uma frase.
- **Skill atualizada:** caminho do arquivo da skill que recebeu a regra.
- **Vezes:** 1
```

## Entradas

### 2026-11-10 · subdomain-checker · "Pega tudo" com uma fonte só por padrão
- **Errado:** o pedido era um verificador que pegasse "tudo o que tiver antes do .meusite.com"; em `subdomain-checker/subdomains.mjs` usei só o crt.sh por padrão e deixei a força bruta de DNS atrás de `--brute`.
- **Correção pedida:** "precisa trazer tudo o que tiver antes do dominio po", "mas não me traz os nomes deles" e "ainda não puxa tudo o que tiver atras antes de chegar no dominio de fato" (subdomínios de vários níveis, como `api.dev.meusite.com`).
- **Regra:** "tudo" numa ferramenta de busca liga todas as fontes e todos os níveis por padrão (a flag serve para limitar), a saída mostra o nome completo de cada achado, e a resposta diz o que a ferramenta não consegue achar.
- **Skill atualizada:** `skills/request-reading/SKILL.md` (tabela "How to do it", Wrong vs right, anti-pattern "Tudo atrás de flag").
- **Vezes:** 2

### 2026-11-10 · meu-cardapio · Pedido de fonte maior virou layout em colunas
- **Errado:** o pedido era só aumentar a fonte do card "Conectar na nuvem" na tela deitada (tablet); em `src/components/device-setup/cloud-pairing.tsx` pus também `landscape:flex-row`, `landscape:max-w-3xl`, divisória `landscape:border-l` e texto à esquerda, com o código ao lado.
- **Correção pedida:** "não faz nem sentido isso aqui, precisa ser flex flex-col as coisas e não flex quando na horizontal … não era para fazer isso era somente para aumentar o tamanho da fonte".
- **Regra:** pedido que mexe numa propriedade (fonte, cor, espaço) muda só ela; direção, colunas e estrutura do layout ficam como estão, e reorganizar é proposta para o usuário decidir.
- **Skill atualizada:** `skills/request-reading/SKILL.md` (tabela "How to do it", Wrong vs right, anti-pattern "Ajuste que vira redesenho", Checklist) e `meu-cardapio/.claude/skills/meu-cardapio/12-STYLING.md` (Scoped changes).
- **Vezes:** 1

### 2026-11-10 · meu-cardapio · Arquivos editados por shell sem Prettier
- **Errado:** editei `button.tsx`, `table-list.tsx`, `use-checkout-steps.ts` e outros com `python`/heredoc no shell; o hook de formatação só roda em Edit/Write, e o `button.tsx`, que estava formatado, ficou fora do Prettier.
- **Correção pedida:** "Não tem prettier format no meu-cardapio?"
- **Regra:** todo arquivo criado ou editado por shell passa por `prettier --check` (e `--write` se falhar) com o binário do projeto antes de fechar a tarefa, mesmo sem script `format`.
- **Skill atualizada:** `skills/frontend-house-style/SKILL.md` (passo 5), `skills/frontend-house-style/TESTING-TOOLING.md` (Anti-patterns).
- **Vezes:** 1

### 2026-11-10 · meu-cardapio · Orientação do aparelho em ajuste responsivo
- **Errado:** o usuário perguntou se "no iphone ele iria caber 2 colunas"; supus o iPhone em pé e baixei o mínimo dos cards de mesa (`TABLE_TILE_MIN_DP` 220 → 135 no celular), pondo 2 colunas no celular em pé.
- **Correção pedida:** "mas estou falando deitado po não em pé, e não em pé".
- **Regra:** em ajuste de layout por aparelho, quando a orientação não estiver dita, pergunte se é em pé ou deitado antes de mudar; no meu-cardapio o celular em pé fica com 1 coluna e as colunas extras são para o aparelho deitado e o tablet.
- **Skill atualizada:** `meu-cardapio/.claude/skills/meu-cardapio/12-STYLING.md` (Scoped changes), criada em 2026-11-10.
- **Vezes:** 1

### 2026-11-09 · meu-cardapio · Header composto por posição, sem lógica de botões na fábrica
- **Errado:** primeiro `ScreenHeader({ icon, title, onBack?, onClose? })` com `cn(onBack ? "pl-1" : "pl-4", …)`; depois partes por ação (`ScreenHeader.Back`, `ScreenHeader.Close`) e a fábrica `headerWithIcon(icon, buttons)` decidindo `showBack`/`buttons.close`.
- **Correção pedida:** "ScreenHeader porque não quebra que nem o pattern que tem na docs?" e depois "Era somente separar ScreenHeader.IconLeft e ScreenHeader.IconRight … porque não segue o padrão do código".
- **Regra:** componente com regiões opcionais vira composto com partes de **posição** (`IconLeft`, `Title`, `IconRight`) que recebem as props do elemento (`...rest`, como as partes do `Card`); quem usa decide ícone e ação, e a fábrica ou o pai não ganham opções para ligar e desligar partes.
- **Skill atualizada:** `skills/frontend-house-style/COMPONENTS-STYLING.md` (Compound component anatomy, linha "Região opcional").
- **Vezes:** 2

### 2026-11-09 · meu-cardapio · Função `render*` dentro da fábrica
- **Errado:** `function renderHeader(…)` declarada dentro de `headerWithIcon` e devolvida por ela.
- **Correção pedida:** "porque adicionou function? e renderHeader não faz sentido po"
- **Regra:** fábrica que devolve componente para uma opção do framework guarda a arrow numa `const` com o nome da opção (`const header = (…) => …; return header;`), nunca numa `function render…` interna; a arrow anônima no `return` é barrada pelo `react/display-name`.
- **Skill atualizada:** `skills/frontend-house-style/CODE-STYLE.md` (Exports and functions), `scripts/check-style.mjs` (`inner-render-function`).
- **Vezes:** 1

### 2026-11-09 · meu-cardapio · Tipagem da assinatura do header
- **Errado:** `headerWithIcon(icon: ComponentProps<typeof Icon>["name"], { back = true, close = false }: HeaderButtons = {})` em `src/components/screen-header/header-with-icon.tsx`.
- **Correção pedida:** "que tipagem é essa........."
- **Regra:** a assinatura só tem nomes de tipo: o tipo derivado ganha nome exportado junto da origem (`IconName`), as opções viram `interface` com campos obrigatórios e o padrão fica numa `const` com nome (`buttons: HeaderButtons = BACK_ONLY`).
- **Skill atualizada:** `skills/frontend-house-style/CODE-STYLE.md` (Typing props and data, "Tipo com nome na assinatura"), `scripts/check-style.mjs` (`inline-derived-type`, `param-default-destructure`).
- **Vezes:** 1

### 2026-11-09 · self-service-kiosk · Posição do botão Voltar nas etapas
- **Errado:** tirei o "Voltar" da `TopBar` e o pus numa faixa própria no rodapé da tela (`BottomBar` no `MainLayout`); depois, ao lado do botão principal, na mesma linha.
- **Correção pedida:** "o volta aqui deveria ser junto com go to payment" e depois "precisa ficar embaixo": logo abaixo da ação principal, com a largura toda, como o "Pular".
- **Regra:** nas etapas do fluxo (menos o cart, onde fica na `TopBar`) o "Voltar" é um botão `outline` `size="step"` empilhado logo abaixo da ação principal; sem ação principal, ele vai logo abaixo dos cards.
- **Skill atualizada:** `self-service-kiosk/.claude/skills/self-service-kiosk/SCREENS-UI.md` (Back button) e `SKILL.md` (Non-negotiables, regra 8), criada em 2026-11-10.
- **Vezes:** 1

### 2026-11-09 · geral · JSX dentro de useMemo
- **Errado:** `const productSearchInput = useMemo(() => (<SearchInput … />), [handleProductSearchKeyDown, searchTerm, setSearchTerm])` e depois `{productSearchInput}` no `return`, "para não recriar a cada render".
- **Correção pedida:** "com useMemo ele memoriza correto só que fica feio, somente quando necessariamente precisa ser utilizado se não não é para utilizar".
- **Regra:** nunca embrulhar JSX em `useMemo`; o elemento vai direto no JSX e, se o Profiler mostrar re-render caro, usa-se `memo` no componente filho.
- **Skill atualizada:** `skills/frontend-house-style/PERFORMANCE.md` (seção Memoized JSX), `COMPONENTS-STYLING.md`, `SKILL.md` (regra 12), `scripts/check-style.mjs` (`jsx-in-memo`).
- **Vezes:** 1
