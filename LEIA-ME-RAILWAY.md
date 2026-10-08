# Publicar no Railway

O site sobe no **mesmo projeto do Railway** onde já está o Postgres.

1. **Criar o serviço:** no projeto do Railway, clique em **+ New → GitHub Repo** e escolha `portal-dashboards` (branch `master`). A cada merge na `master` ele publica sozinho.
2. **Variáveis** (aba *Variables* do serviço novo):
   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (a URL interna; troque `Postgres` pelo nome do serviço do banco, se for outro) |
   | `AUTH_SECRET` | o mesmo do seu `.env.local` (ou gere outro com `npx auth secret`) |
   | `AUTH_GOOGLE_ID` | o mesmo do `.env` |
   | `AUTH_GOOGLE_SECRET` | o mesmo do `.env` |
   | `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | o endereço do site, sem barra no final (ex.: `https://portal-dashboards-production.up.railway.app`). Sem ela, o login volta pra `localhost:8080` com `error=Configuration`. |
3. **Domínio:** em *Settings → Networking*, clique em **Generate Domain**. Vai sair algo como `portal-dashboards-production.up.railway.app`.
4. **Google Cloud:** na credencial OAuth do projeto `portal-dashboards`, adicione:
   - Origens JavaScript autorizadas: `https://SEU-DOMINIO`
   - URIs de redirecionamento autorizados: `https://SEU-DOMINIO/api/auth/callback/google`
5. **Deploy:** o build roda `prisma generate && next build`, e o start roda `prisma migrate deploy && next start`, então as tabelas novas são criadas sozinhas a cada publicação.

O robô continua rodando no seu PC (precisa enxergar o SQL Server) e grava no Postgres pela URL **pública** (`PORTAL_DATABASE_URL` no `robo/.env`).
