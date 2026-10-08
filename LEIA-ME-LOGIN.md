# Login com Google + whitelist + log de acessos

## O que tem neste pacote
| Arquivo | O que faz |
|---|---|
| `src/auth.ts` | Configura o Auth.js com Google. Só deixa entrar quem está na tabela `User` com `active = true`. Grava LOGIN, LOGIN_DENIED e LOGOUT no `AccessLog` (com IP e navegador) e atualiza `lastLoginAt`. |
| `src/app/api/auth/[...nextauth]/route.ts` | Rota que o Google chama de volta (`/api/auth/callback/google`). |
| `src/proxy.ts` | Barreira geral: quem não tem sessão vai pro `/login`. (No Next 16 o `middleware.ts` virou `proxy.ts`.) |
| `src/lib/dal.ts` | Relê o usuário no banco a cada página. Desativou no banco, perdeu o acesso na hora. Também lista os dashboards que a pessoa pode ver (ADMIN vê todos; os outros, os liberados pra ela ou pro setor dela). |
| `src/app/login/page.tsx` | Tela de login, com aviso quando o e-mail não está liberado. |
| `src/app/page.tsx` | Tela inicial: nome do usuário, botão Sair e catálogo de dashboards. |
| `src/app/layout.tsx` | Título do site e idioma pt-BR. |
| `package.json` / `package-lock.json` | Adicionam `next-auth@5 (beta)` e `server-only`. |

## Como aplicar
1. Extraia o ZIP **dentro** da pasta `portal-dashboards`, substituindo os arquivos.
2. No terminal, na pasta do projeto:
   ```powershell
   npm install
   npx auth secret
   ```
   O `npx auth secret` cria a variável `AUTH_SECRET` no `.env.local`. Se preferir, copie a linha pro `.env`.
3. Confira se o `.env` tem estas variáveis (sem colar os valores em chat nenhum):
   ```
   DATABASE_URL="..."          # já existia
   AUTH_GOOGLE_ID="..."        # criado no Google Cloud
   AUTH_GOOGLE_SECRET="..."
   AUTH_SECRET="..."           # gerado no passo 2
   ```
4. Rode `npm run dev` e abra http://localhost:3000.

## Como testar
- Sem login, qualquer página manda pro `/login`.
- Entrando com o e-mail do admin: aparece seu nome com a etiqueta "admin" e o catálogo (vazio até cadastrar dashboards).
- Entrando com um e-mail que não está na tabela `User`: volta pro login com "Seu e-mail não está liberado".
- Na tabela `AccessLog` (aba Data do Postgres no Railway) aparecem as linhas LOGIN, LOGIN_DENIED e LOGOUT.

## Quando for pro Railway
- Adicione no serviço as mesmas variáveis do `.env` e mais `AUTH_TRUST_HOST=true`.
- No Google Cloud, inclua a URL de produção nas origens e em `https://SEU-DOMINIO/api/auth/callback/google`.
