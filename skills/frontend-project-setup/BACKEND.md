---
name: frontend-project-setup-backend
description: How to decide the backend of a new frontend and get its communication payloads — always ask whether an existing backend will be used and which one (cloned repo, published API, third-party service), discover local backend repos, extract endpoints and payloads from contract, docs or code with source references, turn them into validated schemas, and record them in the project's docs/API.md. Use in phases 2–3 of frontend-project-setup (decision P5) and whenever the frontend needs a backend's payloads.
type: reference
scope: frontend
tokens: ~2k
---

# Backend

> **TL;DR:** Em todo setup, pergunte se o front vai usar um backend pronto e **qual**. Os payloads vêm desse backend (contrato, docs ou código, com a fonte anotada), viram schemas validados e ficam registrados em `docs/API.md`. Nunca invente um campo.

## Questions

Perguntadas no grill (decisão P5 de [DECISIONS.md](DECISIONS.md)), uma por vez:

| Pergunta | Por quê |
| --- | --- |
| Vai usar um backend pronto ou ele ainda não existe? | Define se os payloads são extraídos ou desenhados junto com o usuário |
| Qual? Um repositório clonado na máquina, uma API já publicada ou um serviço de terceiro? | É de lá que saem os payloads |
| É um backend só ou vários? Tem gateway ou BFF na frente? | Decide quantos clientes e qual URL base |
| Qual protocolo: REST, GraphQL, gRPC-web, WebSocket ou SSE? | Decide o cache de servidor (S5) e a forma dos schemas |
| Como o front se autentica nele? | Liga com P4; decide headers e renovação de sessão |
| Qual a URL base em cada ambiente? O CORS libera o front? | Configuração de ambiente e bloqueios no navegador |
| Ele publica contrato? Muda com frequência? Quem avisa quando muda? | Decide se gera tipos a partir do contrato e como manter atualizado |

## Find local backends

A varredura de [STRUCTURE.md](STRUCTURE.md) já percorre todos os repositórios da pasta de projetos. Os que ficaram de fora por não serem frontend viram candidatos aqui:

| Sinal | Indica |
| --- | --- |
| `go.mod`, `Cargo.toml`, `pyproject.toml`, `pom.xml`, `build.gradle` | Backend nessa linguagem |
| `package.json` com framework de servidor (Express, Fastify, NestJS, Hono) e sem lib de UI | Backend em Node |
| `openapi.*`, `swagger.*`, `*.proto`, `*.graphql` | Contrato formal disponível |

Mostre ao usuário uma tabela (repositório, linguagem, framework, tem contrato?) e pergunte quais o front vai usar.

## Where payloads come from

Em ordem de confiança. Use a primeira fonte que existir e confirme com as seguintes.

| # | Fonte | Onde procurar | Como extrair |
| --- | --- | --- | --- |
| 1 | Contrato formal: OpenAPI, schema GraphQL, `.proto` | Repositório do backend, pasta de docs, rota publicada da spec | Ler inteiro; ficar com os endpoints que a v1 usa |
| 2 | Docs do backend: `CLAUDE.md`, `.claude/`, docs de contrato, ADRs | Repositório do backend | Contratos e regras escritos, inclusive formato de erro |
| 3 | Código do backend: rotas, handlers, DTOs ou structs (com as tags de serialização), validações, enums, erros | Repositório do backend | Seguir rota → handler → tipo de entrada e saída; anotar `arquivo:linha` |
| 4 | Exemplos: coleções Postman, Insomnia ou Bruno, arquivos `.http`, testes de integração, fixtures | Repositório do backend | Payloads reais de exemplo |
| 5 | Frontend que já consome esse backend (o projeto de referência ou outro front local) | Schemas, tipos e chamadas de API desse front | Confirmar os payloads e ver como erros e paginação são tratados; nunca no lugar das fontes 1 a 3 |
| 6 | Resposta real de um ambiente de desenvolvimento ou homologação | Só com permissão do usuário e credenciais fora do repositório | Confirmar formatos; nunca produção sem OK explícito; nunca salvar segredo ou dado pessoal |

- Doc e código discordam: vale o código, e o usuário é avisado da diferença.
- Serviço de terceiro: a doc oficial do serviço e o SDK oficial, se existir.
- Backend ainda não existe: o contrato é desenhado com o usuário no grill e escrito como schema; o esqueleto simula a API atrás da mesma interface ([INTAKE.md](INTAKE.md) → Missing references).

## What to extract

Para cada endpoint que as telas da v1 usam:

| Tela | Método e caminho | Para que serve | Request (params, body) | Response de sucesso | Erros (formato e códigos) | Paginação | Auth | Fonte |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ProjectsPage` | `GET /projects` | Lista os projetos do usuário logado para a tela inicial; filtra por status; só leitura | `?page`, `?status` | `{ items, nextCursor }` | `{ error: { code, message } }`, 401, 422 | cursor | Bearer | `api/projects/handler.go:42` |
| `ProjectsPage` | `POST /projects` | Cria um projeto quando o usuário confirma o formulário "Novo projeto"; **muda dados** e devolve o projeto criado | body `{ name, description }` | `{ id, name, … }` | 409 nome repetido, 422 | — | Bearer | `api/projects/handler.go:78` |

A coluna **Para que serve** diz, em linguagem de negócio:

- **O que o endpoint faz**, com os termos do `CONTEXT.md` (não "retorna dados", e sim "lista os projetos do usuário logado").
- **Que ação ou tela precisa dele** e em que momento (ao abrir a tela, ao confirmar um formulário, ao rolar a lista).
- **Se só lê ou se muda dados**, e qual efeito colateral importa para a tela (envia e-mail, muda status, gasta crédito).
- **Regra de negócio que ele aplica** e que a tela precisa respeitar (ex.: "só o dono pode editar").

Se a fonte não deixa claro para que o endpoint serve, pergunte ao usuário antes de usá-lo; endpoint sem propósito claro não entra na v1.

E também: enums e seus valores, formato de data e de dinheiro (unidade menor ou decimal), tipo dos ids, campos que podem vir nulos, padrão de nomes (`snake_case` ou `camelCase`) e versão da API.

## Payloads to code

- **Um schema por payload**, igual ao que o backend envia (mesmos nomes de campo), com o tipo derivado dele. A validação acontece na fronteira, como a [[frontend-house-style]] pede.
- **Mapeamento na borda:** se o front usa outro formato (camelCase, dinheiro em unidade menor, datas como objeto), a conversão é uma função pura em `lib/`, testada; o resto do app só vê o formato do front.
- **Lugar:** segue a estrutura escolhida em E1 (ex.: `store/api/<domain>/types.ts` ou `features/<f>/api/`).
- **Tipos gerados** a partir de OpenAPI ou GraphQL, se essa for a decisão: gerador escolhido no grill e conferido na doc oficial; arquivo gerado nunca é editado à mão.
- **Fonte e propósito no código:** o JSDoc de cada endpoint diz para que ele serve, e o de cada schema cita de onde veio (`arquivo:linha` do backend ou a URL da spec), sempre em até 2 linhas.
- **Simulação:** os dados simulados do esqueleto são fixtures que passam no schema; um teste garante isso.

## Record

- `docs/API.md` no projeto ([PROJECT-DOCS.md](PROJECT-DOCS.md)): backends usados, URL base por ambiente (sem segredos), a tabela de endpoints acima **com a coluna Para que serve**, as fontes e como atualizar quando o backend mudar.
- ADR para a escolha do backend, do protocolo e da geração de tipos.
- O mapa de endpoints entra nos desenhos do plano ([PLAN.md](PLAN.md)).

## Anti-patterns

- **Payload inventado:** campo que "deve existir" sem fonte. Quebra na primeira chamada real.
- **Tipo sem validação:** `as Project` na resposta da API. O backend muda e o erro aparece longe da causa.
- **Doc velha:** copiar o contrato de um documento sem conferir o código atual do backend.
- **Produção para "ver o formato":** chamar a API de produção sem autorização, ou salvar a resposta com dados reais no repositório.
