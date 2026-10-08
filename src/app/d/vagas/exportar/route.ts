// Baixa a tabela do Dashboard de Vagas (com os filtros e a ordem da tela) em CSV, pra abrir no Excel.
// ?tipo=posicoes baixa uma linha por posição (aba Análise); sem ele, uma linha por vaga.
import { respostaCsv } from "@/lib/csv";
import { exportarDashboard } from "@/lib/dal";
import { filtrar, getVagas, lerFiltros, linhasPorVaga, ordenar, type Coluna } from "@/lib/vagas";
import { COLUNAS_POSICOES, COLUNAS_VAGAS, EXTRAS_POSICOES, EXTRAS_VAGAS, textoCelula } from "../colunas";

function planilha<T>(itens: T[], colunas: Coluna<T>[]) {
  return [colunas.map((c) => c.titulo), ...itens.map((x) => colunas.map((c) => textoCelula(c.valor(x))))];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sp = Object.fromEntries(url.searchParams);
  if (!(await exportarDashboard("vagas", url.pathname + url.search))) {
    return new Response("Acesso negado", { status: 403 });
  }

  const sel = filtrar((await getVagas()).linhas, lerFiltros(sp));
  if (sp.tipo === "posicoes") {
    const posicoes = [...sel].sort((a, b) => b.data.getTime() - a.data.getTime() || b.vaga - a.vaga || a.posicao - b.posicao);
    return respostaCsv(planilha(ordenar(posicoes, sp.ordem, COLUNAS_POSICOES), [...COLUNAS_POSICOES, ...EXTRAS_POSICOES]), "posicoes");
  }
  return respostaCsv(planilha(ordenar(linhasPorVaga(sel), sp.ordem, COLUNAS_VAGAS), [...COLUNAS_VAGAS, ...EXTRAS_VAGAS]), "vagas");
}
