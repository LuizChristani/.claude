---
name: frontend-project-setup-auth
description: How to set up authentication in a new frontend — first ask whether to follow the auth of an existing project, otherwise decide provider, architecture pattern (RFC 10017), flow and session storage with the user, then build session logic, route guard, login, 401/403 handling and logout following frontend-house-style, and verify with fixed scenarios. Use in decision P4 and scaffold step 17 of frontend-project-setup.
type: reference
scope: frontend
tokens: ~2k
---

# Authentication

> **TL;DR:** Primeiro pergunte se a autenticação segue a de algum projeto que já existe. Se não, decida com o usuário o provedor, o padrão (o mais seguro que o backend permitir) e onde fica a sessão. Depois monte sessão, guard, login, 401 e logout num lugar só cada um, e prove com os cenários do fim.

## 1. Follow an existing project?

Sempre a primeira pergunta da decisão P4: **"Quer seguir a autenticação de algum projeto que já existe (o de referência, outro front da pasta de projetos ou um que você indicar), ou desenhar do zero?"**

| Resposta | O que fazer |
| --- | --- |
| Sim, projeto X | Ler a autenticação de X: provedor e fluxo, onde fica a sessão ou o token, renovação, guard de rota, 401 e 403, logout, tela de login e permissões. Mostrar um resumo ao usuário e replicar o padrão com a estrutura (E1) e o estilo do projeto novo |
| Sim, mas X não está na máquina | Mesmo tratamento do projeto de referência ([STRUCTURE.md](STRUCTURE.md) → Reference project): caminho ou URL, clonar só com permissão |
| Não | Decidir com as perguntas da seção 2 |

- O que X faz contra as fontes abaixo (ex.: identificador de sessão no `localStorage`, fluxo Implicit) é apontado ao usuário, que decide se repete.
- A decisão vira ADR: "segue a autenticação de X" ou o padrão escolhido.

## 2. Questions

| Pergunta | Opções | Recomendação |
| --- | --- | --- |
| Quem autentica? | Provedor OIDC, backend próprio com sessão, serviço de terceiro | O que o backend (P5) já usa |
| Qual padrão de arquitetura? | Em ordem decrescente de segurança (RFC 10017): **BFF** (o backend do front faz o OAuth; o navegador só tem cookie de sessão), **backend que obtém os tokens** (o front chama as APIs com o access token), **cliente OAuth no navegador** | O mais seguro que o backend permitir; app sensível pede BFF |
| Qual fluxo? | Authorization Code com PKCE | Sempre esse; nunca Implicit nem senha enviada direto ao provedor (RFC 10017) |
| Onde fica a sessão? | Cookie `HttpOnly` + `Secure` + `SameSite`; token só em memória; `localStorage` ou `sessionStorage` | Cookie `HttpOnly`. Identificador de sessão no `localStorage` só com decisão explícita do usuário e ADR (OWASP) |
| Como renova? | Sessão do servidor, refresh token com rotação, token vinculado ao cliente (DPoP) | O que o provedor suporta, com rotação no mínimo |
| O que o usuário vê quando expira? | Volta ao login e depois à tela onde estava; aviso antes de expirar | Volta ao login com retorno para a mesma tela |
| Tem papéis e permissões? | Esconder ou desabilitar na interface | A interface só esconde; quem autoriza é o servidor |
| Como é o logout? | Só local, também no provedor, em todas as abas | Local + provedor; abas sincronizadas se o app abre em várias |

Fontes: https://datatracker.ietf.org/doc/rfc10017/, https://www.rfc-editor.org/rfc/rfc7636 e https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html. A doc do provedor escolhido vem antes de qualquer código.

## 3. What to build

Os caminhos usam a estrutura de camadas por tipo; adapte à estrutura escolhida em E1.

| Peça | Onde | Regra |
| --- | --- | --- |
| Contrato `AuthGateway` (sessão atual, login, logout, renovação) | `lib/auth/authContracts.ts` | Só tipos; implementação real num adaptador; testes com uma versão falsa |
| Lógica de sessão (expirou? precisa renovar? para onde voltar?) | `lib/auth/` | Pura e 100% testada; `safeReturnTo(path)` só aceita caminho interno do app |
| Estado da sessão | O estado global escolhido (S4) | Eventos no passado: `sessionStarted`, `sessionExpired`, `sessionEnded` |
| Guard de rota | `layout/RequireAuth.tsx` | Ligado **uma vez** na moldura das rotas protegidas; sem sessão → login com o retorno |
| Login | `pages/login/` ou redirecionamento ao provedor | Formulário próprio: schema de validação e erro por campo; senha nunca guardada |
| Callback do OAuth | Rota de callback | Valida `state`, troca o código com o `code_verifier`, volta para o retorno seguro |
| Chamadas autenticadas | O `baseQuery` (ou o cliente escolhido em S5) | Credencial adicionada num lugar só. 401 → uma tentativa de renovação → senão `sessionExpired` e login. 403 → mensagem de sem permissão, sem deslogar |
| Logout | Listener do store | `sessionEnded` limpa o store, o cache da API e os dados locais |

## 4. Verification

| Cenário | Esperado |
| --- | --- |
| Sem sessão, abrir uma rota protegida | Vai para o login e, depois de entrar, volta para a mesma rota |
| Sessão expira durante o uso | Renova sem o usuário perceber; se não der, login com aviso |
| API responde 403 | Mensagem de sem permissão; a sessão continua |
| Logout e entrada com outro usuário | Nenhum dado do usuário anterior aparece (cache e store limpos) |
| Retorno externo (`?returnTo=//outro-site.com`) | Recusado; vai para a tela inicial |
| Recarregar a página logado | Continua logado (conforme o armazenamento decidido) |

## Anti-patterns

- **Token no `localStorage` por costume:** qualquer XSS leva a sessão. Só com decisão explícita e ADR.
- **Guard por tela:** cada página checando login; basta esquecer uma. O guard é um só, na moldura.
- **Logout que não limpa o cache:** o próximo usuário vê os dados do anterior.
- **Redirect aberto:** voltar para qualquer URL que veio no parâmetro.
- **Permissão só no front:** esconder o botão não protege a API.
