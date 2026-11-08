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

### 2026-11-08 · health-status-web · Seletor de tema travado durante o iris
- **Errado:** depois de trocar o tema, o seletor não respondia até o iris (1 s) terminar: durante a View Transition, todo clique cai no `<html>`.
- **Correção pedida:** com print do seletor de tema: "essa aqui depois que eu troco ela demora para mim poder clicar novamente".
- **Regra:** durante a View Transition, um toque encerra a transição (`skipTransition`) e é repetido no controle sob o ponto; testar dois cliques seguidos no navegador.
- **Skill atualizada:** `skills/frontend-design/MOTION-THEMING.md` (anti-pattern "Iris que trava o clique").
- **Vezes:** 1

### 2026-11-08 · health-status-web · Troca de idioma travando a página
- **Errado:** a barra de 90 dias tinha um popover do Base UI e dois hooks (idioma, mensagens) em cada dia: 1.350 botões na página, cada um formatando a data; trocar o idioma travava a página ~470 ms (modo dev) e a pílula do seletor não animava.
- **Correção pedida:** "esse aqyu também está sem a animação porque?" (pílula do idioma); depois: "Outra que quando eu troco de idioma a pagina inteira trava kk".
- **Regra:** item repetido às centenas é elemento simples, sem hook nem primitivo headless; o detalhe aparece num ponto só por linha (a legenda) e só o item ativo é formatado; medir o bloqueio no navegador antes e depois.
- **Skill atualizada:** `skills/frontend-house-style/PERFORMANCE.md` (anti-pattern "Primitivo pesado por célula").
- **Vezes:** 1

### 2026-11-08 · health-status-web · Pílula do tema sem animação
- **Errado:** a pílula do seletor de tema pulava sem deslizar, porque o CSS do iris (copiado do portal) zera todas as transições da página (`[data-theme-switching] * { transition: none !important }`) durante a troca.
- **Correção pedida:** "porque o pillSlider não tem a animação ? Porque não pegou do portal?".
- **Regra:** o que precisa se mover durante a troca de tema (a pílula) fica fora da regra que zera as transições (`*:not([data-segment-pill])`); conferir medindo a posição ao longo do tempo, não só pelo print.
- **Skill atualizada:** `skills/frontend-design/MOTION-THEMING.md` (anti-pattern "Pílula parada na troca de tema").
- **Vezes:** 1

### 2026-11-08 · health-status-web · Pílula do seletor fora da cor primária
- **Errado:** a pílula do controle segmentado (tema e idioma) era cinza-claro (`surface-raised`), não a cor primária da marca.
- **Correção pedida:** "O PILLSLIDER NÃO ESTÁ SEGUINDO A COLOCARAÇÃO CORRETA QUE SERIA PRIMARY"; aceitou o texto branco a 3,0:1 sobre o laranja.
- **Regra:** a pílula do ativo num controle segmentado usa a cor primária da marca com texto branco.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Seletores misturados").
- **Vezes:** 1

### 2026-11-08 · health-status-web · Serviços dentro de um card
- **Errado:** os 15 serviços eram linhas com divisor dentro de um card com o título "Serviços" e a busca no cabeçalho do card.
- **Correção pedida:** "Remove para nos Serviço e coloca cada um card sozinho saca".
- **Repetição (2026-11-08):** com print das linhas da Vercel: "deixa dessa forma aqui os cards dos servicos".
- **Regra:** em página de status, cada item é uma linha sem caixa (nome à esquerda, status em texto colorido à direita, barra de 90 dias embaixo, divisor entre as linhas); sem histórico, os dias passados ficam cinza e hoje usa o status atual.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Lista de status numa caixa" em "Why it looks amateur").
- **Vezes:** 2

### 2026-11-08 · health-status-web · Seletores e botões com visuais misturados
- **Errado:** o tema eram três ícones soltos com o ativo em `bg-surface-muted` (96%) sobre a página (95%), quase invisível no claro; o idioma era texto sublinhado; "Atualizar agora" era botão fantasma sobre a faixa verde.
- **Correção pedida:** "Os botões pelo oque estava vendo no health está meio errado"; escolheu "Segmentado igual ao portal".
- **Regra:** escolha exclusiva é um controle segmentado só (caixa com borda, pílula elevada no ativo, igual ao `ThemeModeSwitch` do portal), e botão de ação sobre faixa colorida tem contorno; conferir o ativo no print claro e escuro.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Seletores misturados" em "Why it looks amateur").
- **Vezes:** 1

### 2026-11-08 · health-status-web · Iris rápido demais
- **Errado:** a troca de tema em círculo ("iris", copiada do `merchant-portal-web`) durava 500 ms.
- **Correção pedida:** "iris está trocanod muito rapido".
- **Repetição (2026-11-08):** subi para 800 ms; o usuário: "pode subir para 1ms" (1 s).
- **Regra:** transição que cobre a tela inteira, como o iris do tema, dura 1 s com curva que desacelera no fim, e some com redução de movimento.
- **Skill atualizada:** `skills/frontend-design/MOTION-THEMING.md` (anti-pattern "Iris apressado").
- **Vezes:** 2

### 2026-11-08 · health-status-web · Campo sem placeholder
- **Errado:** o campo "Buscar serviço" tinha rótulo visível e nenhum placeholder, seguindo a regra da skill de que placeholder nunca é dica nem exemplo.
- **Correção pedida:** "adiciona na skill também para ter placeholder nos inputs".
- **Regra:** todo campo de texto tem rótulo visível **e** placeholder com um exemplo do que digitar; o placeholder nunca substitui o rótulo.
- **Skill atualizada:** `skills/frontend-design/FORMS-COPY.md` (linha da tabela "Labels and fields" e anti-pattern "Campo sem exemplo"), `SKILL.md` (regra 7) e `skills/frontend-house-style/scripts/check-style.mjs` (`input-placeholder`).
- **Vezes:** 1

### 2026-11-08 · health-status-web · Rodapé empurrado pela lista
- **Errado:** a página de status crescia com a lista dos 15 serviços (`min-h-dvh` e lista sem limite), e o rodapé com o seletor de idioma saía da tela.
- **Correção pedida:** "O footer está saindo da tela porque não tem tamanho max-h na lista dos serviços".
- **Repetição (2026-11-08):** a barra de rolagem da lista ficava por cima do status e das barras; o usuário, com print: "tem o scroll aqui ele fica bem bem em cima das coisas precisa arrumar".
- **Repetição (2026-11-08):** com a lista rolando por dentro, a barra de rolagem do navegador do usuário tinha outra largura e a lista ficou mais larga que a faixa e o cabeçalho; o usuário, com print: "o card em cima está meio toto", "torto se vc olhar embaixo está maior que o card", "e header tambem está torto".
- **Regra:** a página inteira rola, com cabeçalho e rodapé `sticky` e fundo da página; nunca lista rolando por dentro numa coluna alinhada com outros blocos.
- **Skill atualizada:** `skills/frontend-design/LAYOUT-RESPONSIVE.md` (anti-pattern "Lista que empurra o rodapé").
- **Vezes:** 3

### 2026-11-08 · health-status-web · Lista de serviços sem busca
- **Errado:** entreguei a lista de 15 serviços sem campo para procurar um serviço.
- **Correção pedida:** "Precisa ajustar algumas coisas não tem input para pesquisar o serviço".
- **Revertido (2026-11-08):** o usuário pediu "Remove o buscar servico" e, perguntado, "o campo de busca inteiro"; a busca saiu do `health-status-web`.
- **Regra:** nenhuma regra geral: busca em lista é decisão de cada tela, perguntada ao usuário.
- **Skill atualizada:** o anti-pattern "Lista longa sem busca" foi tirado de `skills/frontend-design/LAYOUT-RESPONSIVE.md`.
- **Vezes:** 1

### 2026-11-08 · health-status-web · Faixa de status desproporcional
- **Errado:** a faixa "Estamos funcionando normalmente" tinha ícone de 36 px numa coluna própria (sozinho numa linha no celular), título grande quebrando e o "Atualizado há…" com o botão "Atualizar agora" soltos embaixo, recuados.
- **Correção pedida:** "O card aonde aparece que está tudo funcionado está desproporcional sla".
- **Repetição (2026-11-08):** pus o "Atualizar agora" como botão com contorno numa faixa de rodapé; o usuário, com print: "esse botão de atualizar agora está estranho ai remove ele e coloca o atualizar no lado direito"; depois: "items-center ai para fica no meio".
- **Repetição (2026-11-08):** com print do status da Vercel (faixa azul cheia "All Systems Operational"): "queria algo assim sem input sem nada"; escolheu "Só a faixa como na imagem".
- **Regra:** a faixa do estado geral é um bloco de cor cheia numa linha só (ícone e título centralizados), sem subtítulo, horário nem botão; a cor diz o estado, com texto de contraste AA; conferir o print no celular e no desktop.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Faixa de status desproporcional" em "Why it looks amateur").
- **Vezes:** 4

### 2026-11-08 · meu-cardapio · HTTP misturado com regras e hooks
- **Errado:** `src/lib/` e `src/hooks/` eram planas: requisição, stream SSE, URL, DPoP, parse de resposta e status do RTK Query ficavam ao lado das regras (`cart`, `coupon`), e os hooks que chamam a API ao lado de `use-toast` e `use-disclosure`.
- **Correção pedida:** "Preciso que lib e hooks o que for de http fica em uma pasta separada… porque se não fica junto com regras e hooks ai fica ruim para se achar"; depois: "pode adicionar na geral".
- **Regra:** o que fala com a rede mora em `lib/http/` (requisição, stream, URL, autenticação, status do cliente de cache, corpo de requisição e resposta) e o hook que chama a API em `hooks/http/`; regra, utilitário e hook de UI ficam fora, e módulo misto é separado em dois.
- **Skill atualizada:** `skills/frontend-house-style/ARCHITECTURE.md` (tabela de camadas, árvore, seção "HTTP in its own folder" e anti-patterns "`lib/` vazada" e "HTTP misturado"), `SKILL.md` (regra 28), `CODE-STYLE.md` (import do exemplo) e `scripts/check-style.mjs` (`http-outside-folder`).
- **Vezes:** 1

### 2026-11-08 · health-status-web · Plano colado no chat
- **Errado:** na fase 5 da `frontend-project-setup`, mandei o plano inteiro no chat (decisões, Mermaid de camadas, rotas e dados, wireframe, paleta e passos); no terminal o Mermaid não desenha e o plano fica perdido na conversa.
- **Correção pedida:** "Pode seguir, mas adiciona na skill para criar em um readme"; depois: "o que ela faz hoje só que em um MD".
- **Regra:** o plano da fase 5 é escrito em `<projeto>/docs/PLAN.md` (o único arquivo permitido antes da aprovação); no chat vão só o resumo, o caminho e a pergunta de aprovação.
- **Skill atualizada:** `skills/frontend-project-setup/PLAN.md` (seção "Where the plan lives" e anti-pattern "Plano no chat"), `SKILL.md` (fase 5, regra 1 e checklist), `SCAFFOLD.md` ("Plan first") e `PROJECT-DOCS.md` (linha do `docs/PLAN.md`).
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Brilho que parecia mancha
- **Errado:** o brilho dos cards da configuração (`TileGlint`) era uma faixa larga na cor primária, desenhada por baixo do conteúdo; escurecia o semicírculo tingido e parecia uma mancha laranja passando (a primeira versão, em blocos de opacidade, ainda saía listrada, e uma tentativa com a cor por `className` no `Stop` saiu cinza).
- **Correção pedida:** "o brilho está estranho pode olhar ai".
- **Regra:** brilho é luz: faixa estreita e clara (branco, borda suave, meio mais forte) por cima do conteúdo, sem pegar toque, e desligado com redução de movimento.
- **Skill atualizada:** `skills/frontend-design/MOTION-THEMING.md` (anti-pattern "Brilho que mancha").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Valor da mesa fora do padrão das linhas
- **Errado:** no cabeçalho da gaveta, pus o total da mesa ("R$ 13,09") como texto preto em negrito, sem ícone, embaixo da linha "Mesa 03", que tem ícone laranja e texto cinza normal.
- **Correção pedida:** com print do cabeçalho: "faltou o icone a cor do valor esta errado".
- **Regra:** dado novo debaixo de um título entra como mais uma linha igual às irmãs (mesmo ícone em cor e tamanho, texto no tom e peso de subtítulo); no `meu-cardapio`, `DrawerInfoLine`.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Linha de informação fora do padrão das irmãs" em "Why it looks amateur").
- **Vezes:** 1

### 2026-11-06 · self-service-kiosk · Hover que vaza no botão de idioma
- **Errado:** os botões de idioma (`LanguageChoice`) tinham `bg-surface` com `hover:bg-surface-hover` (preto a 5%); no hover o fundo branco sumia e, sobre o painel de acrílico, o botão ficava vazado mostrando a foto.
- **Correção pedida:** "HOVER FICOU FEIO PO"; "DO INGLES ETC".
- **Regra:** hover de controle com fundo cheio é um tom sólido um degrau abaixo (`hover:bg-surface-muted`, contorno `hover:ring-border-hover`); token translúcido de hover só em controle sem fundo próprio; conferir o hover no print sobre o fundo real.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Hover que vaza" em "Why it looks amateur").
- **Vezes:** 1

### 2026-11-06 · self-service-kiosk · Painel sólido sobre os slides
- **Errado:** na tela inicial com promoções ao fundo, pus as boas-vindas num painel `bg-surface/90` com `backdrop-blur-md`, uma placa quase branca tapando a foto.
- **Correção pedida:** "FAZ O CARD FICAR MAIS ACRILICO TA MUITO SLA".
- **Regra:** painel por cima de foto, vídeo ou slide é acrílico: superfície em ~55%, desfoque forte com saturação e borda clara de 1 px, com o contraste do texto conferido no print em claro e escuro.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Placa sólida sobre a foto" em "Why it looks amateur").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · JSDoc em campo de interface
- **Errado:** no `PriceTag`, pus `/** A rail's size step, which scales the price…; left out, the menu card's size. */` em cima de `size?: StorefrontSizeToken`; o app tinha mais 15 props comentadas assim.
- **Correção pedida:** colou a interface com "props assim coloca na skill para nunca fazer"; depois: "Nos props não vai ter, o nome da variavel precisa ser autoexplicativo".
- **Repetição (2026-11-06):** tirei das props, mas deixei JSDoc nos campos de dado (`StoreProfile.bannerUrl`, `whatsappPhone`, `MenuProduct.discount` e mais 9 em `lib/`). O usuário colou o trecho do `StoreProfile`: "tem lugar que ainda tem isso"; depois: "ajusta no check para não passar a proxima vez".
- **Regra:** nenhum campo de `interface` ou `type` de objeto leva JSDoc, seja props ou dado; se o campo precisa de comentário, o nome está errado (no `meu-cardapio`, `size` → `railSize`, `label` → `accessibilityLabel`, `discount` → `discountPercent`); o JSDoc fica só no tipo ou no componente.
- **Skill atualizada:** `skills/frontend-house-style/CODE-STYLE.md` ("Campos sem comentário" em "Typing props and data"), `SKILL.md` (regra 5) e `scripts/check-style.mjs` (`field-jsdoc`, que trocou o `props-jsdoc` e vale para qualquer `interface`/`type` de objeto).
- **Vezes:** 2

### 2026-11-06 · meu-cardapio · Seletor feito com `endpoints.x.select()`
- **Errado:** para ler a aparência da loja sem uma assinatura por card, criei `store/api/merchant/merchant.selectors.ts` com `merchantApi.endpoints.getStorefrontAppearance.select()` e lia o cache com `useAppSelector`.
- **Correção pedida:** citou `merchantApi.endpoints.getStorefrontAppearance.select();` com "depois que terminar corrige as coisas que ficaram assim...".
- **Regra:** cache do RTK Query se lê pelo hook gerado (`useGetXQuery`), com `selectFromResult` quando só um campo importa; nunca seletor montado com `api.endpoints.x.select()`.
- **Skill atualizada:** `skills/frontend-house-style/STATE-DATA.md` (linha "Ler o cache" em "Server cache" e anti-pattern "Seletor de endpoint") e `scripts/check-style.mjs` (`rtkq-endpoint-select`).
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Status da configuração em pedaços
- **Errado:** na Configuração, ao abrir o app, os cartões mostravam estados errados enquanto os dados chegavam: "Mesa: Nenhuma escolhida" e "Cardápio: Escolha a mesa antes" por ~2 s (a mesa ainda não tinha sido lida), depois "Abrir e fixar na tela" sem ✓ e, ~0,4 s depois, o ✓ (catálogo baixado).
- **Correção pedida:** com print dos cartões: "aqui tem um bug aonde aparece abrir e fixar na tela e depois o certinho pode gravar ai a tela e ver".
- **Regra:** cartão ou linha de status nunca mostra um estado que ainda não é sabido ("nenhuma", "pronto") nem o estado final em pedaços: enquanto o dado carrega, diz que carrega ("Carregando…", "Baixando o cardápio…", com spinner no lugar do ✓), e texto e ✓ do estado pronto entram juntos.
- **Skill atualizada:** `skills/frontend-design/UX-STATES.md` (anti-pattern "Status em pedaços").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Toast atrás do modal
- **Errado:** o `ToastHost` era desenhado só pelo `ToastProvider`, na janela do app; com uma folha aberta (`Modal`), o erro "O envio do pedido para a mesa ainda não está disponível neste aparelho." aparecia apagado atrás do scrim.
- **Correção pedida:** com print do toast atrás do modal de pagamento: "olha como fica o toast aparece embaixo dos modais não faz sentido".
- **Regra:** em React Native, `Modal` é outra janela e cobre tudo da tela; todo modal do app tem um ponto de toast dentro dele (`ToastLayer`), e o provider desenha o toast só no modal de cima, ou na tela quando não há modal.
- **Skill atualizada:** `skills/frontend-house-style/STATE-DATA.md` (linha "Toast" da tabela do Context) e `skills/frontend-design/UX-STATES.md` (anti-pattern "Toast atrás do modal").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Frase partida entre título e subtítulo
- **Errado:** em "Informações da loja", a linha da mesa tinha o título em negrito "Você está na" e o subtítulo cinza "Mesa de desenvolvimento", uma frase cortada em dois pesos, com o dado mais fraco que o rótulo.
- **Correção pedida:** com print da linha: "mesa aqui deveria aparecer corretamente...".
- **Regra:** numa linha de lista, o título é o dado (o nome da mesa, a rua) e nunca um pedaço de frase que o subtítulo completa; quando o título da seção já diz o que é, a linha leva só o dado.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Frase partida na linha" em "Why it looks amateur").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Contador que anima ao montar
- **Errado:** o `CollapsibleStepper` animava a largura com `withTiming` dentro do `useAnimatedStyle`, então qualquer mudança de largura animava: na montagem (64 px de reserva, depois a foto medida sem o "+", depois a certa). "Início" da gaveta monta a lista de novo (troca de `key`), e todo "− 1 +" encolhia e crescia; o mesmo vale para card reciclado na rolagem.
- **Correção pedida:** "quando clicar no menu e sair dele vai ver que vai crescer o + e -"; depois "clica em inicio para vc ver".
- **Regra:** animação de abrir/fechar anda num progresso 0→1 que nasce no estado atual e só anima quando o estado troca; medida que chega (`onLayout`) entra direto, e a peça fica escondida até ser medida.
- **Repetição (2026-11-06):** depois da primeira correção, o contador ainda "aumentava um pouco no lado esquerdo": até as medidas chegarem (quase 1 s depois nessa lista) a parte "− n" usava a largura de reserva de 64 px e depois pulava para a medida. O usuário: "ele ainda está aumentando um pouco se for ver no lado esquerdo". A versão seguinte (largura `auto` com o conteúdo em 100%) quebrou o contador; o usuário, com print: "ai o bug".
- **Regra (completa):** parado e aberto, o que ocupa o espaço do pai é feito pelo layout (`flexGrow: 1` com base 0, vizinho com `shrink-0`), nunca por largura medida; a medida só entra durante a animação de abrir/fechar; nunca largura `auto` com filho em `100%` dela.
- **Skill atualizada:** `skills/frontend-design/MOTION-THEMING.md` (anti-pattern "Anima ao montar").
- **Vezes:** 2

### 2026-11-06 · meu-cardapio · Botão cheio solto no rodapé da gaveta
- **Errado:** na gaveta do menu, "Chamar o garçom" virou um `Button` primário laranja de largura total, sem ícone, separado por um divisor no rodapé; ficou mais pesado que tudo na gaveta e brigava com a barra laranja "Ver sacola" atrás do scrim.
- **Correção pedida:** com print do rodapé: "botão aqui ficou ruim".
- **Regra:** ação de apoio dentro de um painel de navegação (gaveta, menu) não é um bloco de cor cheia no rodapé: vira mais uma linha do painel, no grupo do assunto dela (o usuário escolheu "Chamar o garçom" como linha num grupo "Mesa"); o laranja cheio fica para a ação principal da tela.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Menu lateral de links soltos", parte do rodapé).
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Mesa sumindo a cada refetch
- **Errado:** a gaveta do menu mostra a mesa por `useChosenTable`, que decidia a mesa de desenvolvimento com `settled: isError || isSuccess`; ao abrir a gaveta, a nova assinatura refaz a busca das mesas, o `isError` volta a `false` enquanto busca, a linha "Mesa de desenvolvimento" some e volta ~300 ms depois, e o cabeçalho pula.
- **Correção pedida:** "quando clica no menu ele fica pulando a parte da mesa em desenvolvimento pode conectar via adb para ver".
- **Regra:** "a busca já respondeu" de uma query do RTK Query é `error !== undefined || isSuccess`, nunca `isError`, que vira `false` em todo refetch; e componente que monta ao abrir (gaveta, folha) é conferido no aparelho abrindo e fechando.
- **Skill atualizada:** `skills/frontend-house-style/ASYNC-UI.md` (anti-pattern "Erro que some no refetch").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Selo que quebra e painel sob a barra de status
- **Errado:** no cabeçalho da gaveta do menu, a mesa ia num selo `rounded-full` com o nome livre; "Mesa de desenvolvimento" quebrou em duas linhas e a pílula ficou torta. O painel (num `Modal` com `statusBarTranslucent`) subia até debaixo da barra de status com fundo claro: o relógio claro sumiu no fundo e o canto arredondado ficou sob a câmera.
- **Correção pedida:** com print do cabeçalho: "ué".
- **Regra:** selo ou chip com texto que vem de dado tem uma linha só (`numberOfLines={1}`, encolhe com reticências) ou deixa de ser selo; num `Modal` de React Native, painel de fundo claro começa abaixo do `insets.top` (a barra de status do modal fica com ícones claros sobre o scrim).
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Selo que quebra" em "Why it looks amateur") e `skills/frontend-design/LAYOUT-RESPONSIVE.md` (anti-pattern "Painel sob a barra de status (React Native)").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · `router.back()` sem tela embaixo
- **Errado:** "Ver cardápio" da sacola, a tela de produto, o "Adicionar" e a leitura do QR chamavam `router.back()` direto; com a Sacola aberta como primeira tela da pilha, deu `The action 'GO_BACK' was not handled by any navigator`.
- **Correção pedida:** com print do erro: "quebrou".
- **Regra:** voltar depois de um botão ou ação usa `backOr(fallback)` (`router.canGoBack()` ou `router.replace`); no `meu-cardapio`, `src/lib/back-or.ts`.
- **Skill atualizada:** `skills/frontend-house-style/ROUTING.md` (anti-pattern "Voltar às cegas (Expo Router)").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Peso do título e do subtítulo
- **Errado:** na lista da tela Servidor, o rótulo ("Loja") era pequeno e cinza e o valor ("MeuControle Store") em `font-medium`; ações e título do cabeçalho em `font-medium`.
- **Correção pedida:** com print: "Titulo: bold, subtitulo normal, e no caso de title loja deveria ser bold e o que é cada coisa normal".
- **Regra:** título em negrito, subtítulo em peso normal e cor secundária; numa linha de detalhe, o rótulo é o título e o valor o subtítulo.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Peso invertido na linha" em "Why it looks amateur").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Lista de ajustes miúda
- **Errado:** na lista da tela Servidor, usei a escala da web (rótulo `text-sm`, valor `text-base`, título de seção `text-xs`, ícone em `size-9`); com o `rem` 14 do NativeWind, ficou tudo pequeno no aparelho.
- **Correção pedida:** com print: "podemos aumentar as coisas aqui deixar maior está pequeninho não".
- **Regra:** em React Native com NativeWind, texto de leitura começa em `text-base` e valor/ação de lista em `text-lg`; `text-xs` só em selo.
- **Repetição (2026-11-06):** os cards da configuração (`SetupTile`: título `text-lg`, detalhe `text-sm`, ícone 30) também estavam pequenos; o usuário, com print: "aqui da para aumentar um pouco o tamnho também".
- **Skill atualizada:** `skills/frontend-house-style/TAILWIND.md` (seção "NativeWind sizes").
- **Vezes:** 2

### 2026-11-06 · meu-cardapio · Vão entre a seta e o título
- **Errado:** pus ícone no título com `headerTitle` dentro do cabeçalho nativo; no Android o título fica na margem fixa depois da seta, com um vão grande.
- **Correção pedida:** com print: "arruma esse espaçamento aqui entre o voltar e o servidor olha que coisa feia".
- **Regra:** título com mais que texto usa cabeçalho próprio na opção `header`; no `meu-cardapio`, `ScreenHeader` via `headerWithIcon`.
- **Skill atualizada:** `skills/frontend-house-style/ROUTING.md` (anti-pattern "Título enfeitado no cabeçalho nativo").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Tela de ajustes feita de cards brancos
- **Errado:** a tela Servidor era um card "Conexão" com linhas de rótulo e valor, um card "Testar conexão" com botão de contorno e um botão de contorno "Trocar servidor" solto; tudo branco e com o mesmo peso.
- **Correção pedida:** com print: "ficou meio estranho assim olha ai tudo branco"; escolheu "Lista de ajustes".
- **Regra:** tela de ajustes ou de detalhes é lista agrupada como os ajustes do sistema (título de seção cinza fora do card, linhas com ícone, ações como linhas, destrutiva em texto vermelho num grupo próprio); no `meu-cardapio`, `components/settings-list/`.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (linha "Pilha de cards brancos" em "Why it looks amateur") e `UX-STATES.md` ("Vermelho antes da hora" passa a aceitar a linha de texto vermelho).
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Toast num slice do Redux
- **Errado:** o toast morava em `store/slice/toast` (`toastShown`/`toastDismissed`, `selectToast`), com o `ToastHost` lendo o store.
- **Correção pedida:** "não entendi porque o toast fica no slice"; depois "cria dentro de um context mesmo sem redux".
- **Regra:** toast é Context: um `ToastProvider` guarda o toast e desenha o host, e o `useToast()` lê só as ações estáveis; nada de slice para aviso passageiro de UI.
- **Skill atualizada:** `skills/frontend-house-style/STATE-DATA.md` (linha "Toast" na tabela "Where state lives" e na tabela de regras do Context).
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Tela de produto empilhada várias vezes
- **Errado:** o card do cardápio fazia `router.push(ROUTES.item(offerId))` e a rota `item/[offerId]` não tinha `getId`; toques rápidos empilhavam a mesma tela de complementos umas 4 vezes, e o voltar do celular passava por cada uma.
- **Correção pedida:** "Quando clico em qualquer card várias vezes bem rápido ele abre tipo 4 vezes o mesma parte de complementos ai para voltar no celular ele volta um por vez".
- **Regra:** rota de detalhe com param no Stack do Expo Router tem `dangerouslySingular`, para o mesmo item não empilhar cópias; no `meu-cardapio`, em `src/app/(private)/_layout.tsx`. A primeira correção usou `getId` (da página de Stack do Expo); o console do Expo Router 58 avisou que está obsoleto, e o usuário colou o aviso.
- **Skill atualizada:** `skills/frontend-house-style/ROUTING.md` (anti-pattern "Detalhe empilhado em dobro (Expo Router)").
- **Vezes:** 1

### 2026-11-06 · meu-cardapio · Resultado em texto colorido e botão vermelho que só pergunta
- **Errado:** na tela Servidor, o resultado de "Testar conexão" virava o parágrafo do card em verde (ou vermelho), e "Trocar servidor", que só abre a confirmação, era um botão `danger` vermelho em largura total.
- **Correção pedida:** com print do card: "essa mensagem aqui verde não faz sentido quebra todo o design e o botão vermelho também"; escolheu "Toast" e "Outline".
- **Regra:** texto de card não muda de cor com o resultado; o resultado de uma ação que a pessoa disparou vai no toast do app (cor só no ícone dele); vermelho só no botão que executa o destrutivo (o confirmar do diálogo), e o botão que só abre a confirmação é `outline`.
- **Skill atualizada:** `skills/frontend-design/UX-STATES.md` (anti-patterns "Resultado pintado no texto" e "Vermelho antes da hora").
- **Vezes:** 1

### 2026-11-06 · merchant-service-gateway · Alterei código num pedido de análise
- **Errado:** o pedido era "verifica pra mim o POS está dando problema de cors em homolog"; achei a causa no gateway (o 503 do proxy `/pos` sai sem CORS porque o fasthttp zera a resposta) e, quando o usuário avisou que o gateway estava na máquina, escrevi um teste e uma correção em `pos_proxy_client.go` sem perguntar.
- **Correção pedida:** "porque está mexendo no codigo do gateway?"; "era somente para analisar".
- **Regra:** pedido de "verificar", "analisar" ou "ver o problema" termina em diagnóstico e proposta de correção; editar código só depois que o usuário pedir a mudança, e "o código está na máquina" não é esse pedido.
- **Skill atualizada:** `skills/request-reading/SKILL.md` (nova, agnóstica de projeto: linha "verifica/analisa" em "How to do it" e anti-patterns "Conserto não pedido" e "Acesso como autorização"), local escolhido pelo usuário.
- **Vezes:** 1

### 2026-11-05 · meu-cardapio · Folha de baixo com animação brigando
- **Errado:** as folhas (categorias, observação e foto da opção) usavam `Modal animationType="fade"` com o painel em `SlideInDown`; o fade da janela e a subida do painel brigavam ao abrir, e ao fechar o modal sumia de uma vez, sem o painel descer.
- **Correção pedida:** com print da folha "Categorias": "essa tela aqui continua bugadona"; escolheu "Animação de abrir/fechar".
- **Regra:** bottom sheet anima fundo e painel com um só progresso nos dois sentidos, com o modal sem animação própria e montado até o fechamento terminar; no `meu-cardapio`, o `BottomSheet` com `useSheetMotion`.
- **Skill atualizada:** `skills/frontend-design/MOTION-THEMING.md` (anti-pattern "Folha que só entra").
- **Vezes:** 1

### 2026-11-05 · meu-cardapio · Largura calculada com px do Tailwind
- **Errado:** para o contador aberto ocupar a foto, fixei 78 px supondo `size-32` = 128 e `size-10` = 40; no NativeWind o `rem` é 14 (112 e 35), e o contador vazou da foto.
- **Correção pedida:** com print: "tá passando ai".
- **Regra:** em React Native, nunca derive pixel de classe do Tailwind; quando uma medida depende de outra peça, meça com `onLayout` (no `meu-cardapio`, `CollapsibleStepper` com `fillWidth` medido pelo `ProductQuickAdd`); flutuantes do mesmo canto ficam num contêiner em coluna (no `meu-cardapio`, `MenuBottomDock`).
- **Repetição (2026-11-06):** pus o botão "Sair do quiosque" a `insets.bottom + 88` supondo a barra da sacola com 56 px; ficou no meio da tela mesmo sem a barra. O usuário, com print: "arruma para ser bem embaixo do celular...".
- **Skill atualizada:** `skills/frontend-house-style/TAILWIND.md` (seção "NativeWind sizes", linha do flutuante acima de outro).
- **Vezes:** 2

### 2026-11-05 · meu-cardapio · Confirmação com Alert do sistema
- **Errado:** "Remover item" e "Esvaziar sacola?" usavam `Alert.alert`; o primeiro diálogo próprio saiu com os botões estreitos e o texto deslocado (o `Animated.View` em volta do card não tinha largura).
- **Correção pedida:** "faz essa confirmação ser uma personalizada"; depois "ai o modal que vc fez precisa arrumar".
- **Regra:** confirmação destrutiva é o `ConfirmDialog` no estilo do `FeedbackModal` do customer, e o invólucro animado do card tem largura total.
- **Skill atualizada:** `skills/frontend-design/UX-STATES.md` (anti-pattern "Diálogo do sistema").
- **Vezes:** 1

### 2026-11-05 · meu-cardapio · Toast nativo do Android
- **Errado:** confirmei "Adicionado à sacola" com `ToastAndroid` (para usar "coisa nativa"); saiu cinza, fora do tema e por cima da barra da sacola.
- **Correção pedida:** "essa notify aqui é muito muito feia sla"; depois "Um toast acho que seria mais bonito".
- **Regra:** confirmação de ação é um toast próprio no tema, seguindo a referência (no `meu-cardapio`, `ToastHost` + `useToast`, como o react-toastify do customer: topo, card claro, check, barra de 4 s, entrada com bounce); nada de `ToastAndroid`.
- **Skill atualizada:** `skills/frontend-design/UX-STATES.md` (anti-pattern "Toast do sistema").
- **Vezes:** 1

### 2026-11-05 · meu-cardapio · Selo de contagem oval
- **Errado:** o número da sacola na barra "Ver sacola" era um `Text` com `min-w-5 rounded-full px-1`; a altura vinha da linha do texto e o círculo saía oval.
- **Correção pedida:** com print: "a bolinha aqui está oval"; depois, no contador "Itens" da sacola: "bolinha aqui não está redonda".
- **Regra:** selo de número é uma `View` com `h-5 min-w-5 items-center justify-center rounded-full` e o texto dentro; a forma nunca vem da linha do texto.
- **Skill atualizada:** `skills/frontend-design/VISUAL-DESIGN.md` (seção "Count badges") e `skills/frontend-house-style/scripts/check-style.mjs` (`text-badge`).
- **Vezes:** 2

### 2026-11-05 · meu-cardapio · Loading de tela cheia para um trecho
- **Errado:** no pulo entre categorias, cobri a lista inteira com spinner grande e "Carregando…".
- **Correção pedida:** "não era para ser um loading assim... era para ser algo meio sutil para somente a pessoa saber que está carregando"; "igual o que o customer faz".
- **Regra:** carregamento de um trecho usa o skeleton com brilho da referência (no `meu-cardapio`, `Skeleton`, `ProductCardSkeleton`, `MenuSkeleton`), no formato do conteúdo; foto também brilha até carregar.
- **Repetição (2026-11-06):** a lista de mesas (`TableList`) mostrava o `LoadingState` (spinner grande) a cada entrada na tela Mesa; o usuário: "porque quando entra em um desses está aparecendo um loading?" e escolheu skeleton e pré-carregar as mesas (`TableListSkeleton`, `useCacheWarmup`).
- **Skill atualizada:** `skills/frontend-design/UX-STATES.md` (anti-pattern "Tela inteira para um trecho").
- **Vezes:** 2

### 2026-11-05 · meu-cardapio · Contador "+" que surgia em vez de crescer
- **Errado:** o "+" de adicionar virava "− n +" trocando o controle inteiro com `ZoomIn`; depois, ao animar a largura, o "− n" era cortado do lado errado e o "1" passava por baixo do "+". Também ficava lento (≈500 ms) porque a tela inteira assinava a sacola e redesenhava a lista a cada toque.
- **Correção pedida:** "A animação do + e - é crescendo e não aparecendo assim que nem você fez"; "tá bem bugadinha ou é lenta mesmo".
- **Regra:** contador colapsável cresce: "+" fixo e a parte "− n" abrindo a largura, presa à direita para sair de trás do "+"; e quem mostra a sacola assina a sacola sozinho (componente próprio e seletor por produto), para um toque não redesenhar a lista.
- **Skill atualizada:** `skills/frontend-design/MOTION-THEMING.md` (anti-pattern "Contador que surge").
- **Vezes:** 1

### 2026-11-05 · meu-cardapio · Réplica do customer incompleta
- **Errado:** ao copiar telas do `customer-delivery-webpage`, trabalhei a partir de um resumo e deixei peças de fora: na tela de produto, a etiqueta de preço "a partir de", o "Ver mais", o contador que abre do "+" e o rodapé; no card do cardápio, a descrição, o "-X%" na foto e o botão de adicionar direto na foto.
- **Correção pedida:** "isso aqui está igual ao customer?"; depois "No card está faltando informações... Já falei opara você trazer tudo que o customer tem..."; depois, na sacola: "aqui também falta informações já falei olha no customer e veja o que falta"; depois, nas opções do produto: "Já te falei para fazer igual ao customer...".
- **Regra:** pedido de "igual ao <app de referência>": abrir o código-fonte do componente de referência, listar tudo o que ele mostra (campos, selos, botões, estados: promoção, indisponível, vazio) e conferir item por item na réplica antes de entregar; o que não der para trazer (dado que a API não tem) é dito na entrega.
- **Repetição (2026-11-06, merchant-portal-web):** pedido de "um card novo igual ao do fechamento para o pagamento combinado" no detalhe do pedido; fiz o card com a linha do card Pagamento (ícone, método em caixa alta, selo) e sem o "Editar" do cabeçalho. O usuário, com print dos dois cards: "olha era para ser igualzinho... Faltou algumas coisa editar o combinado para poder adicionar mais, etc.".
- **Skill atualizada:** `skills/frontend-design/DIRECTION.md` (seção "Copying a reference screen", item do checklist e, na repetição de 2026-11-06, a linha sobre referência dentro do mesmo app), local escolhido pelo usuário.
- **Vezes:** 5

### 2026-11-05 · meu-cardapio · Vão entre o rodapé e o teclado
- **Errado:** na tela de produto, o rodapé fixo (`AddToCartBar`) somava `useSafeAreaInsets().bottom` sempre; com o teclado aberto na observação, ficava um vão da altura da barra de navegação entre o botão e o teclado.
- **Correção pedida:** com print do teclado aberto: "olha o espaçamento que está ficando na parte de baixo quando abre o teclado".
- **Regra:** rodapé fixo em tela com `TextInput` só reserva o inset de baixo com o teclado fechado (hook com `useSyncExternalStore` sobre os eventos do `Keyboard`); no `meu-cardapio`, `useFooterInset`.
- **Skill atualizada:** `skills/frontend-design/FORMS-COPY.md` (linha "Rodapé fixo" na tabela "On-screen keyboard (React Native)" e anti-pattern "Vão em cima do teclado").
- **Vezes:** 1

### 2026-11-05 · meu-cardapio · Método de array que o Hermes não tem
- **Errado:** no cardápio, ordenei categorias, opções e grupos com `.toSorted()` (`src/lib/menu.ts`, `item-price.ts`, `cart.ts`, `item-detail.tsx`, `option-group.tsx`); passou no typecheck, no lint e no bundle, mas no Android deu `Render Error: undefined is not a function` em `buildMenu`.
- **Correção pedida:** colou o erro do aparelho (`src/lib/menu.ts (63:13)`).
- **Regra:** em React Native (Hermes), nada de `toSorted`/`toReversed`/`toSpliced`; copiar e ordenar (`[...list].sort(…)`), e rodar no aparelho antes de dar por pronto.
- **Skill atualizada:** `skills/frontend-house-style/CODE-STYLE.md` (seção "React Native runtime") e `scripts/check-style.mjs` (`hermes-builtin`, só em projeto com `react-native`).
- **Vezes:** 1

### 2026-11-05 · meu-cardapio · Grupos de rota fora do padrão (public)/(private)
- **Errado:** para proteger as rotas que exigem o vínculo, criei o grupo `src/app/(app)` (nome copiado do exemplo da doc); corrigido para "semântico", inventei `(linked)` e `(setup)` e deixei `features/` repetido dentro dos grupos (`(setup)/features/config`).
- **Correção pedida:** "(private) e (public) mas semantico"; depois, com print da árvore: "não po olha como vc fez" e "eu quero uma tipo next (public) para as publica (private) para as privadas sacou?".
- **Regra:** em Expo Router, as rotas ficam em `src/app/(public)/` (abertas a todos) e `src/app/(private)/` (exigem a condição, guardadas no layout raiz), como os route groups do Next; cada tela direto no grupo, sem `features/` dentro; restrição extra numa rota pública (ex.: setup só sem vínculo) vai no `_layout.tsx` do `(public)`.
- **Skill atualizada:** `skills/frontend-house-style/ROUTING.md` (seção "Guarded route groups (Expo Router)" reescrita e anti-pattern "Grupo `(app)`").
- **Vezes:** 2

### 2026-11-05 · meu-cardapio · Formulário coberto pelo teclado
- **Errado:** montei a tela de configuração com `TextInput` (endereço do servidor local) dentro de uma `View` centralizada; no Android o teclado cobria o campo e o botão "Conectar".
- **Correção pedida:** com um print do teclado por cima do formulário: "precisa adicionar para quando tiver TextInput ele subir que nem no mobile faz".
- **Regra:** em React Native, toda tela com `TextInput` fica dentro de um `KeyboardAvoidingView` com `behavior="padding"` nas duas plataformas (Expo é edge-to-edge no Android) e `keyboardVerticalOffset` da altura do header, com `ScrollView` `keyboardShouldPersistTaps="handled"`; no `meu-cardapio`, o componente `KeyboardScreen`. Fonte: https://docs.expo.dev/guides/keyboard-handling/
- **Skill atualizada:** `skills/frontend-design/FORMS-COPY.md` (seção "On-screen keyboard (React Native)", anti-pattern "Campo embaixo do teclado" e checklist), `SKILL.md` (linha 4 da tabela de etapas); o usuário escolheu a `frontend-design`.
- **Vezes:** 1

### 2026-11-05 · meu-cardapio · Arquivo do guia oficial movido de lugar
- **Errado:** o usuário tinha `import "../../global.css"` no layout raiz, como o guia de Tailwind do Expo manda (`global.css` na raiz do projeto); ao mover as rotas para `src/app`, tratei o caminho como erro, movi o `global.css` para `src/` e troquei o import para `../global.css`, sem conferir o guia.
- **Correção pedida:** mandou o link https://docs.expo.dev/guides/tailwind/ com "aqui seu ...".
- **Regra:** em setup com guia oficial, o local dos arquivos e os caminhos de import são os do guia; antes de "corrigir" um caminho que o usuário escreveu, conferir no guia, e para mudar de lugar, perguntar.
- **Skill atualizada:** `skills/frontend-house-style/OFFICIAL-DOCS.md` (seção "Setup guides: follow the paths as written").
- **Vezes:** 1

### 2026-11-04 · self-service-kiosk · Tailwind escrito de memória
- **Errado:** ao extrair o `ProductDetailsButton`, levei `focus-visible:outline-none` para `DETAILS_PILL_CLASS` sem conferir a doc; o projeto está no Tailwind 4.3, onde `outline-none` tira o contorno de verdade (inclusive no alto contraste) e o equivalente da v3 é `outline-hidden`. A base tem mais classes da v3 (`outline-none` no kiosk, 114 achados no `merchant-portal-web`).
- **Correção pedida:** "adiciona para verificar a documentação official do tailwind para IA parar de fazer cagada".
- **Regra:** antes de escrever classe, variante ou diretiva do Tailwind, ler a versão no `package.json` e abrir a página oficial em tailwindcss.com/docs; na v4, nenhuma classe da v3 (tabela em `TAILWIND.md`).
- **Skill atualizada:** `skills/frontend-house-style/TAILWIND.md` (novo), `SKILL.md` (regra 27 e passo 4), `OFFICIAL-DOCS.md` (linha do Tailwind) e `scripts/check-style.mjs` (`tailwind-v3`).
- **Vezes:** 1

### 2026-11-04 · merchant-portal-web (pos) · Elemento de componente guardado em variável
- **Errado:** em `packages/pos/src/ui/counter/sections/order-summary-section.tsx`, guardei `const orderActions = (<OrderActions … />)` para usar no layout de desktop e no de celular, além de `const content`, `const phoneContent` e `const dialogs`. O hook não barrou porque procurava o `react` só no `package.json` do pacote, e o pacote do monorepo não o declara.
- **Correção pedida:** "precisa adicionar isso aqui para não acontecer mais nunca nunca deve fazer isso".
- **Regra:** JSX nunca vai para variável, nem um elemento só de componente; o mesmo componente em dois lugares é escrito nos dois com um objeto de props tipado (`<X {...props} />`), e cada layout (desktop, celular) é um componente próprio.
- **Skill atualizada:** `skills/frontend-house-style/COMPONENTS-STYLING.md` (seção "No JSX in variables": tabela e errado/certo de dois layouts), `SKILL.md` (regra 13); hook `~/.claude/hooks/house-style-check.mjs` passou a achar o `react` até a raiz do repositório (monorepo); `CLAUDE.md` (seção de hooks); `SKILL.md` passo 5 (rodar o `check-style.mjs` à mão nos arquivos tocados mesmo com o hook calado).
- **Vezes:** 1

### 2026-11-04 · self-service-kiosk · `typeof OBJETO.Chave` no tipo
- **Errado:** para tirar as strings soltas, declarei as uniões a partir do objeto: `{ kind: typeof DEVICE_LINK_KIND.Done }` nos membros e `(typeof X)[keyof typeof X]` nos tipos simples.
- **Correção pedida:** "kind: typeof DEVICE_LINK_KIND.Done isso aqui não pode acontecer de forma alguma"; escolheu "Literal no tipo" (sem `enum`).
- **Regra:** o tipo é a fonte e declara as strings (`{ kind: 'done' }`, `type Status = 'idle' | 'done'`); o objeto `SCREAMING_CASE` vem depois com `as const satisfies Record<string, Tipo>`; o código compara e monta com o objeto. Nunca `typeof OBJETO.Chave` nem `keyof typeof OBJETO` para declarar o tipo.
- **Skill atualizada:** `skills/frontend-house-style/CODE-STYLE.md` (seção "No magic strings"), `SKILL.md` (regra 25) e `scripts/check-style.mjs` (`type-from-const`).
- **Vezes:** 1

### 2026-11-04 · self-service-kiosk · Bloco de marcação dentro de prop
- **Errado:** passei um botão inteiro (condição `a && !b && (…)`, `onClick`, `aria-label`, `className` longo, ícone e texto) dentro de `pictureAction={…}` de um card de produto; o checker só olhava JSX em variável.
- **Correção pedida:** "esse tipo de coisa aqui não pode acontecer e quando acontecer precisa ser um componente e mandar para ali".
- **Regra:** prop de slot recebe só um elemento de componente (`action={<MessageUserButton … />}`), com no máximo uma condição com nome antes; elemento nativo, handler, classes ou texto dentro de `prop={…}` viram um componente no próprio arquivo.
- **Skill atualizada:** `skills/frontend-house-style/COMPONENTS-STYLING.md` (seção "No markup in props"), `SKILL.md` (regra 13) e `scripts/check-style.mjs` (`jsx-in-prop`).
- **Vezes:** 1

### 2026-11-04 · merchant-portal-web (pos) · Redesenho de escolha sem mostrar antes
- **Errado:** o usuário pediu para "ajustar para a pessoa poder escolher essas opções mais fácil" (Cliente e "Como o cliente recebe" no celular); troquei as linhas com rádio por três `ChoiceCard` lado a lado e o cartão do cliente por um botão inteiro, sem mostrar a proposta antes.
- **Correção pedida:** "Não, volta essa alteração".
- **Regra:** pedido vago de UI ("mais fácil", "melhor") num componente que já existe: mostre 2 ou 3 propostas (mockup ou trecho) e deixe o usuário escolher antes de trocar o componente.
- **Skill atualizada:** `skills/request-reading/SKILL.md` (linha "melhora/mais fácil" em "How to do it" e anti-pattern "Redesenho surpresa").
- **Vezes:** 1

### 2026-11-04 · merchant-portal-web (pos) · Ação fixa só em parte das etapas
- **Errado:** o usuário pediu que Parcial/Mais opções/Cancelar "sempre aparecesse na tela" no fluxo de celular do Balcão; fixei a fileira só na Sacola e em Cliente e entrega.
- **Correção pedida:** "Os botões precisam aparecer em todos os steps".
- **Regra:** "sempre aparecer na tela" num fluxo de etapas vale para todas as etapas do fluxo; se a lista de telas não estiver clara, pergunte antes de escolher um subconjunto.
- **Skill atualizada:** `skills/request-reading/SKILL.md` (linha "sempre/em todas" em "How to do it" e anti-pattern "Sempre pela metade").
- **Vezes:** 1

### 2026-11-04 · self-service-kiosk · Magic string em união de estados
- **Errado:** comparei e montei estados com string solta (`state.kind === 'confirming' || state.kind === 'linking'`, `{ kind: 'idle' }`) pela base inteira; o checker não pegava e passei a revisão de estilo sem apontar.
- **Correção pedida:** "esse tipo de coisa precisa arrumar para usar um type ou enum para não ficar perdido as coisas com magic string".
- **Regra:** valor de união de strings do app vem de um objeto `as const` em `SCREAMING_CASE` (`UPLOAD_KIND`) com o tipo `PascalCase` derivado dele (`UploadKind`), nunca o mesmo nome para os dois (o `no-redeclare` do lint acusa; o usuário escolheu assim) e nunca `enum` (doc do TypeScript); comparar e montar usa o objeto; dois ou mais valores no mesmo teste viram predicado com nome ao lado do tipo.
- **Skill atualizada:** `skills/frontend-house-style/CODE-STYLE.md` (seção "No magic strings" e tabela "Types"), `SKILL.md` (regra 25) e `scripts/check-style.mjs` (`magic-string`).
- **Vezes:** 1

### 2026-11-04 · task-manager · UI sem composição visual ("vibecoding")
- **Errado:** montei a UI com tokens copiados e checklists, sem direção de design: fundo e card quase iguais, cards idênticos para tudo, laranja em vários controles, formulário vazio como maior elemento, estado vazio de caixa tracejada com texto repetido, widgets de terceiro fora do tema. Dei a tela por pronta porque os números passaram, sem olhar o primeiro uso.
- **Correção pedida:** "Preciso que a skill seja para UI também po porque hoje ela não fica nada profissional ela parece vibecoding"; depois, com um print do estado vazio: "me explica porque está tão feio... não entendi o porque não consegue criar uma skill para ficar top"; e deu como referência https://github.com/anthropics/skills; depois: "A UI AINDA CONTINUA GENERICA MANDA O CODEX FAZER UM SEARCH E TRAZER TUDO QUE ENCONTRA DE DESIGN FEITOS POR PESSOAS E NAO IA PARA VOCE ARRUMAR A SKILL".
- **Regra:** design começa por um plano escrito para o briefing (cores nomeadas, tipografia, layout com wireframe, princípios), revisado contra o padrão genérico; só depois vem o código, e a tela só está pronta depois de olhar prints do vazio, do preenchido e do erro, nos dois temas. Checklist que passa não prova que está bonito.
- **Repetição (2026-11-06, meu-cardapio):** fiz a gaveta do menu (hambúrguer) só copiando a estrutura do customer (linhas de ícone laranja + texto, sem grupo nem degrau de tom) e entreguei sem plano visual nem print; no aparelho o painel saiu cinza e chapado. O usuário, com print: "precisa melhor o design".
- **Skill atualizada:** `skills/frontend-design/DIRECTION.md`, `REFERENCES.md` (novo: referências de gente, verificadas e medidas), `VISUAL-DESIGN.md`, `SKILL.md` (etapas 0 e 0a, regra 14), `FOUNDATIONS.md` e `SOURCES.md`; na repetição de 2026-11-06, `VISUAL-DESIGN.md` (linha "Menu lateral de links soltos" em "Why it looks amateur").
- **Vezes:** 4

### 2026-11-04 · task-manager · 404 de documentação preenchido de memória
- **Errado:** ao delegar a leitura de docs a agentes, tentei caminhos de sites oficiais que eu não tinha visto (`lefthook.dev/installation/node.html`, um `docs/configuration.md` do repositório do `tailwind-merge`, um nome de repositório sem o "css"); deram 404 e só contei ao usuário quando ele perguntou.
- **Correção pedida:** "então já coloca em memoria para não fazer mais isso", depois "se for da fonte official que veio não tem problema".
- **Regra:** URL de site ou repositório oficial pode ser tentada mesmo sem ter visto o caminho; blog e terceiro não. Em 404, avise o usuário na hora, tente a raiz da doc ou outra fonte oficial, e marque o que não foi confirmado, sem preencher a lacuna de memória.
- **Skill atualizada:** `skills/frontend-house-style/OFFICIAL-DOCS.md` (seção "URLs and delegated reads") e `SKILL.md` (regra 18).
- **Vezes:** 1

### 2026-11-04 · task-manager · Hook-deus por tela
- **Errado:** `useTasksPage.ts` juntou 3 hooks de dados, 3 `useState` de diálogo, derivações e handlers, devolvendo 23 valores (com lambdas e `void actions.x()` no `return`), e a tela leu tudo de um saco `page.x`.
- **Correção pedida:** "olha a merda de hook que foi feita. Precisa colocar nas skill para isso nunca nunca acontecer".
- **Regra:** um hook, uma responsabilidade; nada de `use<Tela>Page`; retorno até 6 valores; estado de diálogo fora do hook da tela; sem lambda nem embrulho inútil no `return`; a tela é composta por seções que chamam só os hooks que usam.
- **Skill atualizada:** `skills/frontend-house-style/ARCHITECTURE.md` (seção "Hooks: one responsibility"), `SKILL.md` (regra 24), `CODE-STYLE.md` (limites) e `scripts/check-style.mjs` (`god-hook`, `hook-return-size`).
- **Vezes:** 1

### 2026-11-01 · self-service-kiosk · Renomear no return
- **Errado:** expus um helper interno com outro nome no objeto de retorno de um hook (`return { nextFrom: targetFrom }`, em `usePaymentFlow.ts`).
- **Correção pedida:** "não gosto de renomear no return".
- **Regra:** nunca renomear valor dentro do objeto do `return`; renomear a declaração e as chamadas e usar a forma curta (`return { nextFrom }`).
- **Skill atualizada:** `skills/frontend-house-style/CODE-STYLE.md` (seção const-then-return) e `scripts/check-style.mjs` (`rename-in-return`).
- **Vezes:** 1

### 2026-11-04 · frontend-house-style · Error boundary por rota
- **Errado:** no scaffold e no `PERFORMANCE.md`, escrevi "error boundary por rota".
- **Correção pedida:** "error boundary por rota um só para toda a aplicação".
- **Regra:** um error boundary só, na rota raiz, para a aplicação inteira; nada de boundary por rota nem por componente. Erro de API fica no `AsyncState`.
- **Skill atualizada:** `skills/frontend-house-style/ARCHITECTURE.md` (seção "Error boundary"), `PERFORMANCE.md`, `skills/frontend-project-setup/SCAFFOLD.md` (passo 16).
- **Vezes:** 1

### 2026-11-04 · frontend-project-setup · Stack assumido sem perguntar
- **Errado:** no setup de projeto novo, tratei o stack da casa (Redux, RTK Query, `tv()`, Vitest…) como padrão e só perguntava o que a casa deixava em aberto.
- **Correção pedida:** "ele precisa me questionar o que vou querer usar independente de bibliotecas etc"; "sempre independente do projeto que vai dar setup".
- **Regra:** em todo setup, de qualquer projeto, cada biblioteca e ferramenta é perguntada, uma por vez, com recomendação. O stack da casa e as referências só alimentam a recomendação; só o usuário dispensa perguntas, de forma explícita.
- **Skill atualizada:** `skills/frontend-project-setup/DECISIONS.md` (reescrito), `SKILL.md` (regra 6), `SCAFFOLD.md`, `PROJECT-DOCS.md`.
- **Vezes:** 1

### 2026-11-04 · frontend-house-style · Subcomponente dentro de componente
- **Errado:** nos exemplos da skill, deixei `UserCardSkeleton` no mesmo arquivo do `UserCard` e escrevi que "componente extraído pequeno fica no mesmo arquivo, sem export".
- **Correção pedida:** "uma das coisas que eu não gosto é ter um componente e dentro dele ter outro subcomponente".
- **Regra:** um componente por arquivo. Nunca declarar componente dentro do corpo de outro, nem dois componentes no mesmo arquivo; skeleton, parte de composto e item de lista ganham arquivo próprio na pasta do componente.
- **Skill atualizada:** `skills/frontend-house-style/COMPONENTS-STYLING.md` (seção "One component per file"), `ASYNC-UI.md`, `SKILL.md` (regra 19) e `scripts/check-style.mjs` (`nested-component`, `one-component-per-file`).
- **Vezes:** 1

### 2026-11-03 · self-service-kiosk · Escopo da skill de estilo
- **Errado:** (1) ao ouvir "precisa ser agnóstico", tentei tirar o React e as libs da `frontend-house-style`. (2) Depois mantive os exemplos de código e os ajustes do próprio totem (carrinho, checkout, botão de totem, números de cache e retry) e só troquei alguns nomes.
- **Correção pedida:** "vai ser para REACT só que não vai ser somente para o totem"; "Porque tudo o que tem ali é do totem, exemplos de código do totem? Precisa ser agnóstico no sentido de que deve servir para qualquer aplicação".
- **Regra:** ao extrair padrões de um projeto para uma skill, leve só o padrão. Os exemplos são escritos do zero, com domínio genérico (users, notifications, upload), e nenhum ajuste ou domínio do projeto de origem entra. As libs do usuário são o padrão para projeto novo; em projeto existente, o princípio se aplica à lib que ele já usa. Se o eixo de "agnóstico" não estiver claro, pergunte antes de reescrever.
- **Skill atualizada:** `skills/frontend-house-style/` inteira (reescrita com exemplos genéricos).
- **Vezes:** 2
