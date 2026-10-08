# Tela de admin

Abra pelo link **Admin** no topo (só aparece pra quem é ADMIN) ou em `/admin`.

| Aba | O que faz |
|---|---|
| **Usuários** | Libera um e-mail novo (com setor e perfil), edita nome/setor/perfil e ativa ou desativa. Desativar corta o acesso na hora. Você não consegue tirar o seu próprio admin nem se desativar, pra ninguém se trancar pra fora. |
| **Setores** | Cria e exclui setores (RH, Financeiro...). Excluir deixa as pessoas sem setor e remove as permissões do setor. |
| **Dashboards e permissões** | Edita título, descrição, categoria e se aparece no catálogo. Libera o dashboard pra uma pessoa ou pra um setor inteiro, e remove. Mostra as visualizações dos últimos 30 dias. |
| **Log de acessos** | Resumo dos últimos 7 dias, filtro por e-mail, ação, dashboard e período, e **Exportar CSV** (abre direto no Excel). |

Todas as ações conferem no servidor se quem está mexendo é ADMIN ativo.

## Como aplicar
Extraia o ZIP na pasta `portal-dashboards` substituindo os arquivos e rode `npm run dev`. Não tem mudança no banco além das que vieram no pacote anterior (se ainda não aplicou, siga o `LEIA-ME-VAGAS.md` antes).
