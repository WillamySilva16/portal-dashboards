// Baixa a tabela do Dashboard de Vagas (com os filtros e a ordem da tela) em CSV, pra abrir no Excel.
// ?tipo=posicoes baixa uma linha por posição (aba Análise), ?tipo=arrastadas as vagas
// arrastadas pro mês de referência; sem tipo, uma linha por vaga.
import { respostaCsv } from "@/lib/csv";
import { exportarDashboard } from "@/lib/dal";
import { arrastadasEm, filtrar, getVagas, lerFiltros, linhasPorVaga, mesReferencia, ordenar, type Coluna } from "@/lib/vagas";
import { COLUNAS_ARRASTADAS, COLUNAS_POSICOES, COLUNAS_VAGAS, EXTRAS_POSICOES, EXTRAS_VAGAS, textoCelula } from "../colunas";

function planilha<T>(itens: T[], colunas: Coluna<T>[]) {
  return [colunas.map((c) => c.titulo), ...itens.map((x) => colunas.map((c) => textoCelula(c.valor(x))))];
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sp = Object.fromEntries(url.searchParams);
  if (!(await exportarDashboard("vagas", url.pathname + url.search))) {
    return new Response("Acesso negado", { status: 403 });
  }

  const { linhas } = await getVagas();
  const f = lerFiltros(sp);
  if (sp.tipo === "arrastadas") {
    const arr = linhasPorVaga(arrastadasEm(filtrar(linhas, f, true), mesReferencia(f).inicio)).reverse();
    return respostaCsv(planilha(ordenar(arr, sp.ordem, COLUNAS_ARRASTADAS), [...COLUNAS_ARRASTADAS, ...EXTRAS_VAGAS]), "vagas-arrastadas");
  }
  const sel = filtrar(linhas, f);
  if (sp.tipo === "posicoes") {
    const posicoes = [...sel].sort((a, b) => b.data.getTime() - a.data.getTime() || b.vaga - a.vaga || a.posicao - b.posicao);
    return respostaCsv(planilha(ordenar(posicoes, sp.ordem, COLUNAS_POSICOES), [...COLUNAS_POSICOES, ...EXTRAS_POSICOES]), "posicoes");
  }
  return respostaCsv(planilha(ordenar(linhasPorVaga(sel), sp.ordem, COLUNAS_VAGAS), [...COLUNAS_VAGAS, ...EXTRAS_VAGAS]), "vagas");
}
