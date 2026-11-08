---
name: frontend-house-style-security
description: Frontend security rules of the house style — XSS (escaping, dangerouslySetInnerHTML only with DOMPurify, URL allow-list), secrets and the public bundle, session and token storage, safe redirects, PII in logs and monitoring, links to other sites, security headers and CSP on the server, dependency audit, and the server as the real authority. Use when rendering user or external content, handling auth, URLs, redirects, env vars, logs, or configuring the host.
type: reference
scope: frontend
tokens: ~1.5k
---

# Security

> **TL;DR:** O React já escapa o que vai no JSX; não abra brecha. HTML externo só com DOMPurify, URL de usuário só `http` e `https`, nada de segredo no bundle, sessão em cookie `HttpOnly`, redirect só para dentro do app e cabeçalhos de segurança no servidor. Quem autoriza é sempre o backend.

## XSS

| Regra | Detalhe |
| --- | --- |
| Deixe o React escapar | Texto vai como filho do JSX; nunca monte HTML com string |
| `dangerouslySetInnerHTML` | Proibido por padrão. Se o usuário escreve HTML de verdade (editor rico), sanitize com DOMPurify (`DOMPurify.sanitize(dirty)`) logo antes de renderizar, e não altere o resultado depois |
| URL vinda do usuário ou da API | Em `href` e `src`, só `http:` e `https:` (lista de permitidos, numa função de `lib/` testada). O React 19 bloqueia `javascript:`, mas isso não substitui a validação |
| Código dinâmico | Nunca `eval`, `new Function` nem `setTimeout` com string |
| Dado externo | Validado por schema na fronteira ([CODE-STYLE.md](CODE-STYLE.md) → Boundaries and data) |

Fontes: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html e https://github.com/cure53/DOMPurify

## Secrets and the bundle

- Tudo que vai para o navegador é público, inclusive as variáveis `VITE_*`. Chave privada, segredo de cliente OAuth e senha nunca entram no front.
- `.env` com valores reais fica fora do repositório; o `.env.example` lista as variáveis sem segredo.

## Session and tokens

| Regra | Detalhe |
| --- | --- |
| Onde fica a sessão | Cookie `HttpOnly` + `Secure` + `SameSite` é o padrão. Identificador de sessão ou token no `localStorage` só com decisão explícita do usuário e ADR: qualquer XSS lê o storage |
| Fluxo OAuth | Authorization Code com PKCE; nunca Implicit nem senha enviada direto ao provedor |
| Logout | Limpa store, cache da API e dados locais |
| Permissão | Esconder um botão é só interface; o servidor revalida tudo |

Fontes: https://datatracker.ietf.org/doc/rfc10017/ e https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html. Montagem completa em [[frontend-project-setup]] → AUTH.md.

## Redirects and links

- Destino de redirect que vem do usuário só aceita caminho interno ([ROUTING.md](ROUTING.md) → Safe redirects).
- `target="_blank"` já impede o acesso da página aberta à que abriu (comportamento de `noopener`); use `rel="noreferrer"` quando também não quiser enviar a origem.

Fonte: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener

## Personal data

- Nunca em log, mensagem de erro, monitoramento, analytics, URL ou storage sem necessidade: e-mail, documento, telefone, endereço, token.
- O monitoramento remove dados pessoais antes de enviar; o usuário é identificado por um id opaco.

## Server-side protections

O host que serve o app envia em **toda** resposta:

| Cabeçalho | Para quê |
| --- | --- |
| `Content-Security-Policy` | Restringe de onde vêm scripts e recursos; versão estrita com nonce ou hash, `object-src 'none'`, `base-uri 'none'`, sem `'unsafe-inline'` e `'unsafe-eval'`; `frame-ancestors` contra clickjacking |
| `Strict-Transport-Security` | Força HTTPS |
| `X-Content-Type-Options: nosniff` | O navegador não adivinha o tipo do arquivo |
| `Referrer-Policy` | Controla o quanto da URL vai para outros sites |
| `Permissions-Policy` | Desliga câmera, microfone e localização que o app não usa |

- CSP é a segunda camada: não substitui sanitizar e validar.
- CSP por `<meta>` funciona em SPA estático, mas não tem todos os recursos (sem `frame-ancestors`, sem modo só-relatório).

Fontes: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP e as páginas de cada cabeçalho em https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/

## Dependencies

- Lockfile versionado; `npm audit` (ou o equivalente do gerenciador) nos gates, falhando em vulnerabilidade alta ou crítica.
- Nunca silencie o audit com cópia corrigida de pacote ou override `file:`: aviso sem correção publicada fica visível e é relatado.
- Antes de adicionar uma lib, confira manutenção, licença e se ela já não duplica algo do projeto.

Fonte: https://docs.npmjs.com/cli/commands/npm-audit

## Anti-patterns

- **HTML cru da API:** `dangerouslySetInnerHTML={{ __html: post.body }}` sem sanitizar.
- **Segredo "escondido" no bundle:** chave de API privada numa `VITE_*`.
- **Link de usuário sem checar:** `<a href={profile.website}>` aceitando qualquer esquema.
- **Dado pessoal no monitoramento:** o e-mail do usuário dentro da mensagem de erro enviada.
- **Segurança só no front:** confiar que o botão escondido impede a ação.

## Checklist

- [ ] Nenhum `dangerouslySetInnerHTML` sem DOMPurify
- [ ] URLs de usuário passam pela lista `http`/`https`
- [ ] Nenhum segredo em `VITE_*` nem em arquivo versionado
- [ ] Sessão conforme a decisão registrada (cookie `HttpOnly` por padrão)
- [ ] Redirects só para caminho interno
- [ ] Nenhum dado pessoal em log, erro ou monitoramento
- [ ] Cabeçalhos de segurança configurados no host
