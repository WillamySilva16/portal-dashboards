# Como mexer no Dashboard de Vagas

Guia rápido pra trocar filtros, colunas, gráficos e nomes sem precisar de ajuda.
Depois de mexer: `npm run dev`, abra http://localhost:3000/d/vagas pra conferir,
e suba pro GitHub (commit + push). O Railway publica sozinho depois do merge.

## Onde fica cada coisa

| Quero mexer em... | Arquivo |
|---|---|
| Filtros do topo (as caixinhas de seleção) | `src/app/d/vagas/page.tsx` (Visão geral), `analise/page.tsx`, `arrastadas/page.tsx`: procure `campos={[` |
| Colunas das tabelas e da planilha baixada | `src/app/d/vagas/colunas.ts` |
| Nome que aparece nos chips de "Filtros ativos" | `src/app/d/vagas/comum.tsx`: procure `ROTULOS` |
| Gráficos e cards | as mesmas páginas: procure `<Secao titulo=` (gráficos) e `<Kpi` (cards) |
| Regras de negócio (o que é Concluída, Pendente, Em andamento...) | `src/lib/vagas.ts`: `situacaoDe` e `sitPosicaoDe` |
| Quais colunas o robô traz do SQL Server | `robo/atualizar_vagas.py`: lista `COLUNAS` (nome no SQL → nome no banco) |

## Os campos disponíveis

Cada linha tem estes campos (definidos em `src/lib/vagas.ts`, tipo `Linha`):
`vaga`, `posicao`, `data`, `ano`, `mes`, `dias`, `situacao`, `sitPosicao`, `status`,
`statusRS`, `etapaRS`, `sla`, `solicitante`, `cargo`, `categoria`, `cliente` (empresa: XRS, RS FREE LANCE...),
`local` (nome do cliente), `segmento`, `supervisao`, `base`.

Repare: **o que a tela chama de "Cliente" é o campo `local`**. O campo `cliente` do
banco é a empresa e só aparece na planilha, como "Empresa".

## Exemplos

**Trocar o nome de um filtro** (o que aparece na tela): mude só o `rotulo`.

```tsx
{ tipo: "select", nome: "local", rotulo: "Cliente", valor: f.local, opcoes: lista(opcoes(linhas, "local")) },
```

`nome` é o filtro (vai na URL e precisa existir em `Filtros` no `src/lib/vagas.ts`),
`rotulo` é o texto, e o último `"local"` é o campo de onde vêm as opções.

**Tirar um filtro**: apague a linha dele dentro de `campos={[ ... ]}`.

**Trocar o campo de um gráfico de barras**, por exemplo de categoria pra segmento:

```tsx
<Secao titulo="Vagas abertas por segmento">
  <GraficoBarras dados={vagasPor(filtrar(linhas, f), "segmento", 10)} />
</Secao>
```

Sem `campo=` o gráfico só mostra; com `campo="categoria"` clicar na barra filtra o
dashboard (só funciona pra campos que já são filtros).

**Renomear, tirar ou trocar a ordem de uma coluna**: em `colunas.ts`, cada linha é uma coluna.
`titulo` é o nome; a ordem da lista é a ordem na planilha baixada.
Na tela, a tabela também tem as células escritas na página (`<td>...</td>`, mesma
ordem da lista), então ao tirar ou mudar a ordem de uma coluna, mude o `<td>` junto.
`EXTRAS_...` são colunas que só vão pra planilha.

**Trazer uma coluna nova do SQL Server**: precisa mexer no `Vagas.sql`, no robô, no
`prisma/schema.prisma` (+ migração) e no `src/lib/vagas.ts`. Esse vale pedir ajuda.
