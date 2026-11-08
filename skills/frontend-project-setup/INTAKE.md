---
name: frontend-project-setup-intake
description: What to ask the user and which references to collect before starting a new frontend — business, users, journeys, screens, design system, API contracts, platform and constraints — and how to read each kind of reference. Use in phases 1 and 2 of frontend-project-setup.
type: reference
scope: frontend
tokens: ~1.5k
---

# Intake

> **TL;DR:** Uma mensagem só, pedindo o negócio e as referências de uma vez. Depois leia tudo o que chegou antes de fazer a primeira pergunta do grill.

## First message

Abra com uma mensagem curta, em blocos, pedindo tudo de uma vez. O usuário responde o que tiver; o que faltar vira pergunta no grill.

| Bloco | O que pedir |
| --- | --- |
| **Negócio** | O problema que o app resolve, para quem, e o que é sucesso (a métrica ou o resultado esperado) |
| **Usuários** | Quem usa (perfis), em que contexto (escritório, celular na rua, tela de toque) e com que frequência |
| **Jornadas** | As 3 a 5 jornadas principais, do começo ao fim, e qual é a **mais importante** |
| **Telas** | A lista de telas que o usuário já imagina, mesmo incompleta |
| **Design system** | Qualquer uma destas: link do Figma, pacote de design system existente, arquivo de tokens, guia de marca (logo, cores, fontes), prints ou o site atual da empresa |
| **Projeto de referência** | Existe algum projeto de frontend que deve servir de referência (outro app da empresa, um projeto anterior)? Qual: nome do repositório, caminho na máquina ou URL do git? O que tirar dele: estrutura, componentes, visual, fluxos, uso da API? |
| **Referências de produto** | Apps ou sites que o usuário gosta (e o que gosta neles) e os que não quer parecer |
| **Backend** | Vai usar um backend pronto? Qual: repositório clonado na máquina, URL da API ou da doc, serviço de terceiro? Contrato (OpenAPI, coleção de requests, exemplos de JSON), autenticação, ambientes ([BACKEND.md](BACKEND.md)) |
| **Plataforma** | Web no navegador, PWA, desktop ou dentro de um app mobile; telas e navegadores que precisa suportar |
| **Restrições** | Idiomas, moeda e país, nível de acessibilidade, uso offline, prazos, o que já está decidido e não se discute |
| **Documentação extra** | Qualquer doc, regra de negócio ou explicação que o usuário quiser que seja seguida |

## Reading references

Leia **tudo** o que chegou antes do grill. Pergunta cuja resposta está numa referência é pergunta desperdiçada.

| Referência | Como ler | O que extrair |
| --- | --- | --- |
| Imagem ou print | Ferramenta de leitura de arquivo | Cores, tipografia, espaçamentos, raios, padrão de layout, componentes que aparecem |
| URL de site ou doc | Ferramenta ou agente de leitura web (política de modelos do `CLAUDE.md`: sonnet) | Regras, fluxos, tom de voz, estrutura de navegação |
| Figma | MCP de design se houver; senão peça export dos tokens, das telas principais ou prints | Tokens, componentes, variantes, estados |
| Pacote de design system | `package.json` e a doc do pacote | Se ele já resolve tokens e componentes, o projeto usa o pacote em vez de criar outro |
| Backend e contrato de API | [BACKEND.md](BACKEND.md) → Where payloads come from: contrato, docs e código do backend, nessa ordem | Endpoints da v1, payloads, erros, paginação, autenticação, com a fonte de cada um |
| Explicação do usuário | Reler a conversa | Termos do domínio e regras de negócio |
| Projeto de frontend de referência | [STRUCTURE.md](STRUCTURE.md) → Reference project | Estrutura, componentes, tokens, fluxos, como chama a API; o que o usuário pediu para tirar dele |
| Projetos já clonados na máquina | [STRUCTURE.md](STRUCTURE.md) → Scan local projects; sempre, mesmo que o usuário não cite | Estrutura de pastas, stack, regras de import, o que funciona e o que não funciona |

- Anote, para cada referência, o que ela **define** e o que ela **deixa em aberto**.
- Referência que contradiz outra vira pergunta no grill, nunca uma escolha silenciosa.
- Termos do domínio que aparecem nas referências entram como candidatos ao `CONTEXT.md` ([PROJECT-DOCS.md](PROJECT-DOCS.md)).

## Business summary

Antes do grill, devolva ao usuário um resumo de até 10 linhas e peça confirmação:

- O que o app é e para quem.
- A jornada principal, em passos.
- As telas da primeira versão.
- O que as referências definiram (marca, componentes, API).
- O que ainda está em aberto e vai para o grill.

## Missing references

| Falta | O que fazer |
| --- | --- |
| Design system inteiro | Pergunte se o usuário quer propor uma base mínima (paleta, fonte, raio) para ele aprovar; tokens nascem marcados como provisórios |
| Contrato de API | O esqueleto usa dados simulados atrás da mesma interface que a API real vai usar; a troca fica listada nos próximos passos |
| Jornada principal | Não siga: sem ela não existe esqueleto. Pergunte até ter uma |
