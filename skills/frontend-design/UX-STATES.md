---
name: frontend-design-ux-states
description: UX rules of the design skill — usability definition and the 10 heuristics as actions, response-time limits, skeleton vs spinner vs progress bar, the state matrix (loading, empty, error, partial, offline, success), destructive actions, notifications, navigation depth, defaults and button prominence. Use when defining what a screen shows while loading, empty or failing, choosing a loading indicator, deciding between confirm and undo, or structuring navigation and flows.
type: reference
scope: frontend
tokens: ~2k
---

# UX and states

> **TL;DR:** Cada tela responde a seis estados, cada espera tem o indicador certo para o tempo dela, e erro destrutivo se resolve com desfazer antes de confirmação.

## Usability and the 10 heuristics

Usabilidade é "usuários específicos alcançam objetivos específicos com eficácia, eficiência e satisfação num contexto específico" (ISO 9241-11; definição lida em resumo do catálogo, não no texto da norma).

| # | Heurística | Faça |
| --- | --- | --- |
| 1 | Visibilidade de status | Dê retorno oportuno a toda ação |
| 2 | Linguagem do usuário | Palavras e ordem dele, nunca jargão interno |
| 3 | Controle | Desfazer, refazer, cancelar claro |
| 4 | Consistência | Mesma palavra e ação para a mesma coisa; siga convenções da plataforma |
| 5 | Prevenção de erro | Restrições e padrões sensatos; avise antes do que é arriscado |
| 6 | Reconhecer > lembrar | Opções e ajuda visíveis no contexto |
| 7 | Flexibilidade | Atalhos para o frequente sem pesar para o iniciante |
| 8 | Minimalismo | Só o que serve ao objetivo principal |
| 9 | Erros | Linguagem simples, problema exato, correção; sem códigos |
| 10 | Ajuda | Idealmente nenhuma; senão, no contexto e por tarefa |

Fonte: [NN/g 10 heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

## Response time and loading

| Espera | O que mostrar | Fonte |
| --- | --- | --- |
| ≤ 0,1 s | Nada além do resultado; seleção e clique respondem nesse limite | [NN/g response times](https://www.nngroup.com/articles/response-times-3-important-limits/) |
| < 1 s | Nem esqueleto nem spinner: não melhoram e distraem | [NN/g skeleton screens](https://www.nngroup.com/articles/skeleton-screens/) |
| > 1 s | Mostre que o sistema está trabalhando | NN/g response times |
| ~2–10 s, módulo ou cartão | Spinner com texto ("Loading comments…") | [NN/g progress indicators](https://www.nngroup.com/articles/progress-indicators/) |
| < 10 s, página inteira | Esqueleto; não para upload, download ou conversão | NN/g skeleton screens |
| ≥ 10 s ou várias etapas | Barra de porcentagem, estimativa e saída para interromper | NN/g progress indicators |

- Total desconhecido: mostre progresso absoluto ("Atualizando item 3 de 50"); spinner por último.
- Nunca "Loading…" parado nem aviso "não clique de novo"; reconheça o primeiro clique na hora.

## State matrix

Toda tela define estes seis; os três primeiros têm fonte, os dois seguintes são decisão do projeto (a pesquisa não achou fonte oficial para eles):

| Estado | Regra | Fonte |
| --- | --- | --- |
| Loading | Indicador pelo tempo (tabela acima) | NN/g |
| Vazio | Diga **por que** está vazio, ensine para que serve a área e ofereça a ação direta; "sem resultados" ≠ "carregando" ≠ "erro" | [NN/g empty states](https://www.nngroup.com/articles/empty-state-interface-design/) |
| Erro | Ao lado do elemento, com ícone/borda além da cor; severidade define a proeminência; modal bloqueante só para o grave; mantenha o que o usuário digitou | [NN/g error messages](https://www.nngroup.com/articles/error-message-guidelines/) |
| Parcial / desatualizado | Decisão do projeto: mostre o dado que existe e marque o que falta ou está velho | derivado |
| Offline | Decisão do projeto: diga que está offline e o que continua funcionando | derivado |
| Sucesso | Confirmação no lugar da ação; toast só se for transitório | NN/g |

No código, o `AsyncState` resolve erro, primeiro carregamento, vazio e conteúdo ([ASYNC-UI.md](../frontend-house-style/ASYNC-UI.md)); parcial e offline entram como estados extras do projeto.

## Destructive actions and notifications

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Desfazer antes de confirmar | Confirmação só para o grave e quase irreversível; confirmação demais vira clique reflexo | [NN/g confirmation dialogs](https://www.nngroup.com/articles/confirmation-dialog/) |
| Diálogo de confirmação | Nome do item afetado; botões com o resultado ("Delete file" / "Keep file"); sem "Yes" como padrão | NN/g confirmation dialogs |
| Toast/snackbar | Só para confirmação transitória e de baixo risco, com Undo opcional; nunca erro que bloqueia ou erro de campo (some e passa batido) | NN/g error messages |
| Aviso (alert) | Só para decisão; informação vai no contexto | [Apple HIG alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) |

## Navigation, flows and defaults

| Regra | Detalhe | Fonte |
| --- | --- | --- |
| Conteúdo importante raso | Hierarquia plana para categorias distintas; funda só com muitas, e então atalhos e migalhas | [NN/g flat vs deep](https://www.nngroup.com/articles/flat-vs-deep-hierarchy/) |
| Navegação visível com poucas opções | "Cerca de 5 ou menos"; menu escondido reduz descoberta | [NN/g mobile navigation](https://www.nngroup.com/articles/mobile-navigation-patterns/) |
| Divulgação progressiva em até 2 níveis | O frequente primeiro; o raro atrás de um controle claro | [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) |
| Uma pergunta por página, por padrão | Peça só o necessário, uma vez; "Continue" (não "Next"); voltar funcional; "(optional)" em vez de asterisco | [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/) |
| Uma ação principal por vista | Preenchida; secundária em contorno; terciária mais leve; posição igual em modais e formulários | [NN/g UI elements](https://www.nngroup.com/articles/ui-elements-glossary/) (lida em resumo) |
| Padrões | Preencha o valor mais comum; nunca pré-marque consentimento ou promoção | [NN/g defaults](https://www.nngroup.com/articles/the-power-of-defaults/) (resumo) |

## Wrong vs right

❌ Errado: confirmação genérica para um item que dá para desfazer.

```tsx
if (window.confirm('Are you sure?')) removeNote(note.id);
```

✅ Certo: remove na hora e oferece desfazer.

```tsx
const removed = removeNote(note.id);
toast('Note deleted', { action: { label: 'Undo', onClick: () => restoreNote(removed) } });
```

## Anti-patterns

- **Spinner eterno:** espera de 30 s sem porcentagem nem saída.
- **Diálogo do sistema:** `Alert.alert` (ou `window.confirm`) para confirmar uma ação destrutiva: fora do tema e diferente da referência. Use um diálogo próprio no estilo dela (ícone, título, a pergunta com o nome do item em negrito, confirmar destrutivo e "Voltar"); em React Native sobre `Modal`, e o invólucro animado do card com largura total para o `w-full` dos botões ter referência.
- **Toast do sistema:** `ToastAndroid` (ou alerta nativo) para confirmar uma ação: cinza, fora do tema e por cima de outros controles. Confirmação é um toast próprio no tema do app, no lugar e no estilo da referência (ex.: topo, card claro, ícone de sucesso, barra de tempo).
- **Toast atrás do modal:** o toast desenhado só na tela fica apagado atrás do scrim quando há uma folha ou um diálogo aberto, justo quando a ação dentro dele falha. O toast aparece por cima da camada mais alta aberta; em React Native, onde o `Modal` é outra janela, isso pede um ponto de toast dentro de cada modal.
- **Status em pedaços:** um indicador de etapa (cartão de configuração, linha de status) mostra "nenhum" ou "pronto" antes de o dado chegar, ou monta o estado final aos poucos (o texto de pronto agora, o ✓ depois). Enquanto o dado carrega, o indicador diz isso ("Carregando…", com spinner no lugar do ✓); o texto e o ✓ do estado pronto entram juntos.
- **Tela inteira para um trecho:** cobrir a tela com spinner e "Carregando…" enquanto só uma parte carrega (um pulo numa lista virtualizada, uma foto). O sinal é discreto e no lugar do conteúdo: skeleton com brilho no formato do card e da foto, como o app de referência faz.
- **Vazio mudo:** "No data" sem causa nem ação.
- **Toast de erro:** some em segundos e o erro passa batido.
- **Resultado pintado no texto:** o parágrafo de um card troca para verde ou vermelho conforme o resultado de um teste ou ação ("Conexão funcionando…" em verde). Texto corrido fica na cor de texto do tema; o resultado de uma ação que a pessoa acabou de disparar vai no toast do app, com a cor só no ícone.
- **Vermelho antes da hora:** botão `danger` cheio para uma ação que só abre a confirmação ("Sair da conta", "Trocar conta"). Ele é `outline`, ou, numa lista de ajustes, uma linha com o texto vermelho sem fundo; o fundo vermelho fica só no botão que executa o destrutivo, dentro do diálogo.
- **"Are you sure?":** não diz o que será afetado.
- **Menu fundo:** quatro níveis para chegar ao que importa.

## Trade-offs

- Desfazer exige guardar o item removido por alguns segundos e um caminho de restauração; confirmar é mais barato, mas interrompe.
- Uma pergunta por página reduz erro e aumenta passos; agrupe só quando teste de uso mostrar que ajuda.

## Checklist

- [ ] Os seis estados definidos; vazio com causa e ação
- [ ] Indicador de espera compatível com o tempo esperado
- [ ] Destrutivo comum tem desfazer; confirmação nomeia o item e os botões dizem o resultado
- [ ] Uma ação principal; navegação rasa; padrões sensatos
