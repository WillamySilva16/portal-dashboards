# Dashboard de Vagas no portal

Este pacote traz **o login (pacote anterior) + o Dashboard de Vagas**. Se você ainda não aplicou o login, pode aplicar só este, porque ele já inclui tudo.

## O que tem
- **Páginas** `/d/vagas` (Visão geral) e `/d/vagas/analise` (Análise de Recrutamento), recriando as 2 páginas do Power BI: filtros, cards com comparação ao mês anterior, gráficos e tabela.
- **Mesmas regras do Power BI** em `src/lib/vagas.ts`: Situação, Status R&S, Etapa R&S, Dias, Tempo Médio, contagens por vaga distinta e por posição.
- **Tabela `VagaPosicao`** no Postgres (migration `20261008160839_vagas`), uma linha por posição, igual à saída do `Vagas.sql`.
- **Robô** `robo/atualizar_vagas.py`: roda o `Vagas.sql` no SQL Server e regrava a tabela do portal (tudo numa transação; se falhar, o portal mantém os dados anteriores). Tenta 3 vezes se a rede cair.
- **Controle de acesso**: só abre o dashboard quem é ADMIN ou tem permissão (por pessoa ou setor). Cada visualização vai pro `AccessLog` (no máximo 1 registro a cada 30 min por pessoa, pra trocar filtro não encher o log). Acesso negado também é registrado.
- **Catálogo**: os cards da tela inicial agora abrem o dashboard.

## Como aplicar
1. Extraia o ZIP dentro da pasta `portal-dashboards`, substituindo os arquivos.
2. Instale e atualize o banco:
   ```powershell
   npm install
   npx prisma migrate deploy
   npx prisma generate
   npx tsx scripts/criar-dashboard-vagas.ts
   ```
   (Se ainda não fez o login: `npx auth secret` também.)
3. Configure o robô (uma vez):
   ```powershell
   cd robo
   copy ..\..\Dashboard_Recrutamento_PAG2_INTELIGENTE\Vagas.sql .   # ou de onde estiver o seu Vagas.sql
   copy .env.exemplo .env      # e preencha: SQL Server + PORTAL_DATABASE_URL (DATABASE_PUBLIC_URL do Railway)
   pip install -r requirements.txt
   python atualizar_vagas.py
   ```
   O `Vagas.sql` e o `.env` ficam fora do GitHub (estão no `.gitignore`).
4. `npm run dev` e abra http://localhost:3000. O card "Dashboard de Vagas" aparece no catálogo.

## Atualização automática
Agende o `python robo\atualizar_vagas.py` no Agendador de Tarefas do Windows (ex.: de hora em hora) na máquina que acessa o SQL Server. O site mostra "Atualizado em ..." com o horário da última carga.

## Dar acesso a alguém
Por enquanto direto no banco (a tela de admin é o próximo passo):
- Cadastrar a pessoa em `User` (e-mail em minúsculo, `active = true`).
- Liberar o dashboard em `DashboardPermission` com o `dashboardId` do Vagas e o `userId` da pessoa (ou o `departmentId` do setor).
