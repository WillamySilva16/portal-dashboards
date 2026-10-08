// src/lib/vagas.ts
// Dados e cálculos do Dashboard de Vagas. Reproduz as regras do Power BI
// (Power Query + medidas DAX) em TypeScript. A base é pequena (alguns
// milhares de posições), então filtramos e agregamos em memória.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/db";

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export type Linha = {
  vaga: number;
  posicao: number;
  status: string | null;
  data: Date;
  ano: number;
  mes: number; // 1-12
  dias: number | null;
  fechamento: number | null; // dia do fechamento (ms UTC)
  situacao: Situacao;
  statusRS: "CONCLUÍDA" | "EM ANDAMENTO" | "EXCLUÍDA" | "SEM CLASSIFICAÇÃO";
  etapaRS: string;
  sla: string | null;
  solicitante: string | null;
  cargo: string;
  categoria: string;
  cliente: string | null;
  local: string;
  segmento: string;
  supervisao: string | null;
  base: string | null;
};

// Situação da vaga, pelo Status do sistema. "Em andamento" é só ENVIA SELEÇÃO;
// os poucos ENVIA REAVALIAÇÃO / RETORNA SELEÇÃO ficam em "Outra situação".
export type Situacao = "Concluída" | "Cancelada" | "Em andamento" | "Outra situação";
function situacaoDe(status: string | null): Situacao {
  const st = (status ?? "").trim().toUpperCase();
  if (st === "CONCLUÍDO") return "Concluída";
  if (st === "CANCELA") return "Cancelada";
  if (st === "ENVIA SELEÇÃO") return "Em andamento";
  return "Outra situação";
}

// Mesmo mapeamento da coluna "Etapa R&S" do Power Query
const ETAPAS: Record<string, string> = {
  "ADMISSÃO": "Admissão",
  "CONFERENCIA DE DOCUMENTAÇÃO - ADMISSÂO": "Conferência de Documentação",
  "CONFERENCIA DE DOCUMENTAÇÃO - ADMISSAO": "Conferência de Documentação",
  "DOCUMENTAÇÃO": "Documentação",
  "ENCAMINHAMENTO PARA SETOR DE DOC.": "Encaminhamento para Documentação",
  "INTEGRAÇÃO": "Integração",
};

const DIA = 24 * 60 * 60 * 1000;

// Dados crus do banco, em cache por alguns minutos (o robô atualiza a tabela inteira).
async function lerBanco() {
  "use cache";
  cacheTag("vagas");
  cacheLife("minutes");
  const [rows, ultima] = await Promise.all([
    prisma.vagaPosicao.findMany({ orderBy: [{ vaga: "desc" }, { posicao: "asc" }] }),
    prisma.vagaPosicao.aggregate({ _max: { importadoEm: true } }),
  ]);
  return { rows, atualizadoEm: ultima._max.importadoEm };
}

export async function getVagas() {
  const { rows, atualizadoEm } = await lerBanco();
  const linhas: Linha[] = rows.map((r) => {
    const sit = (r.situacaoFase ?? "").trim().toUpperCase();
    const fase = (r.fase ?? "").trim().toUpperCase();
    // O Prisma lê datas sem fuso como UTC; usamos os campos UTC pra não trocar o dia
    const f = r.fechamento;
    const fechDia = f ? Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate()) : null;
    return {
      vaga: r.vaga,
      posicao: r.posicao,
      status: r.status,
      data: r.data,
      ano: r.data.getUTCFullYear(),
      mes: r.data.getUTCMonth() + 1,
      dias: fechDia === null ? null : Math.round((fechDia - r.data.getTime()) / DIA),
      fechamento: fechDia,
      situacao: situacaoDe(r.status),
      statusRS:
        sit === "APROVADO" ? "CONCLUÍDA"
        : sit === "PENDENTE" ? "EM ANDAMENTO"
        : sit === "FUNCIONÁRIO EXCLUÍDO" ? "EXCLUÍDA"
        : "SEM CLASSIFICAÇÃO",
      etapaRS: ETAPAS[fase] ?? (fase === "" ? "Não informado" : r.fase!),
      sla: r.sla,
      solicitante: r.solicitante,
      cargo: r.cargo ?? "Não informado",
      categoria: r.categoria ?? "Não informado",
      cliente: r.cliente,
      local: r.local ?? "Não informado",
      segmento: r.segmento ?? "Não informado",
      supervisao: r.supervisao,
      base: r.base,
    };
  });
  return { linhas, atualizadoEm };
}

// ---------- Filtros (vêm da URL: ?ano=2026&mes=9&base=...) ----------

export type Filtros = {
  ano?: number;
  mes?: number;
  base?: string;
  local?: string;
  cliente?: string;
  situacao?: string;
  status?: string;
  statusRS?: string;
  categoria?: string;
  etapa?: string;
  vaga?: string;
};

export function lerFiltros(sp: Record<string, string | string[] | undefined>): Filtros {
  const s = (k: string) => {
    const v = sp[k];
    const t = (Array.isArray(v) ? v[0] : v)?.trim();
    return t ? t : undefined;
  };
  const n = (k: string) => (s(k) && !isNaN(Number(s(k))) ? Number(s(k)) : undefined);
  return {
    ano: n("ano"), mes: n("mes"), base: s("base"), local: s("local"), cliente: s("cliente"),
    situacao: s("situacao"), status: s("status"), statusRS: s("statusRS"),
    categoria: s("categoria"), etapa: s("etapa"), vaga: s("vaga"),
  };
}

// Filtros como texto, pro filtro cruzado (lado do navegador)
export function filtrosTexto(f: Filtros) {
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v === undefined ? undefined : String(v)]));
}

export function filtrar(linhas: Linha[], f: Filtros, ignorarPeriodo = false) {
  return linhas.filter(
    (l) =>
      (ignorarPeriodo || f.ano === undefined || l.ano === f.ano) &&
      (ignorarPeriodo || f.mes === undefined || l.mes === f.mes) &&
      (f.base === undefined || l.base === f.base) &&
      (f.local === undefined || l.local === f.local) &&
      (f.cliente === undefined || l.cliente === f.cliente) &&
      (f.situacao === undefined || l.situacao === f.situacao) &&
      (f.status === undefined || l.status === f.status) &&
      (f.statusRS === undefined || l.statusRS === f.statusRS) &&
      (f.categoria === undefined || l.categoria === f.categoria) &&
      (f.etapa === undefined || l.etapaRS === f.etapa) &&
      (f.vaga === undefined || String(l.vaga).includes(f.vaga))
  );
}

export function opcoes(linhas: Linha[], campo: keyof Linha) {
  const set = new Set<string>();
  for (const l of linhas) {
    const v = l[campo];
    if (v !== null && v !== undefined && v !== "") set.add(String(v));
  }
  return [...set].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

// ---------- Medidas (equivalentes às do Power BI) ----------

const vagasDistintas = (ls: Linha[]) => new Set(ls.map((l) => l.vaga)).size;

export function medidasVagas(ls: Linha[]) {
  // Tempo Médio = média, por vaga, do maior "Dias" (AVERAGEX ignora vazios)
  const maxDias = new Map<number, number>();
  for (const l of ls) {
    if (l.dias === null) continue;
    maxDias.set(l.vaga, Math.max(maxDias.get(l.vaga) ?? -Infinity, l.dias));
  }
  const tempos = [...maxDias.values()];
  return {
    abertas: vagasDistintas(ls),
    concluidas: vagasDistintas(ls.filter((l) => l.situacao === "Concluída")),
    andamento: vagasDistintas(ls.filter((l) => l.situacao === "Em andamento")),
    canceladas: vagasDistintas(ls.filter((l) => l.situacao === "Cancelada")),
    outras: vagasDistintas(ls.filter((l) => l.situacao === "Outra situação")),
    tempoMedio: tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : null,
  };
}

export function medidasPosicoes(ls: Linha[]) {
  return {
    semClassificacao: ls.filter((l) => l.statusRS === "SEM CLASSIFICAÇÃO").length,
    solicitadas: ls.length,
    concluidas: ls.filter((l) => l.statusRS === "CONCLUÍDA").length,
    andamento: ls.filter((l) => l.statusRS === "EM ANDAMENTO").length,
    excluidas: ls.filter((l) => l.statusRS === "EXCLUÍDA").length,
  };
}

// Linhas do mês anterior ao filtrado (com os demais filtros), pra comparação.
// Só existe quando há mês selecionado, como no Power BI.
export function linhasMesAnterior(linhas: Linha[], f: Filtros) {
  if (f.mes === undefined) return null;
  const ano = f.ano ?? new Date().getFullYear();
  const [a, m] = f.mes === 1 ? [ano - 1, 12] : [ano, f.mes - 1];
  return filtrar(linhas, { ...f, ano: a, mes: m });
}

// Abertas x concluídas por mês de abertura
export function porMes(ls: Linha[]) {
  const grupos = new Map<string, Linha[]>();
  for (const l of ls) {
    const k = `${l.ano}-${String(l.mes).padStart(2, "0")}`;
    grupos.set(k, [...(grupos.get(k) ?? []), l]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, g]) => {
      const [ano, mes] = k.split("-").map(Number);
      return {
        mes: `${MESES[mes - 1].slice(0, 3)}/${String(ano).slice(2)}`,
        ano,
        m: mes,
        Abertas: vagasDistintas(g),
        Concluídas: vagasDistintas(g.filter((l) => l.situacao === "Concluída")),
      };
    });
}

// Vagas abertas (distintas) agrupadas por um campo, maiores primeiro.
// Acima de `limite` grupos, o resto vira "Outros" (ou é cortado, com agruparResto = false).
export function vagasPor(ls: Linha[], campo: keyof Linha, limite = 10, agruparResto = true) {
  const grupos = new Map<string, Set<number>>();
  for (const l of ls) {
    const k = String(l[campo] ?? "Não informado");
    if (!grupos.has(k)) grupos.set(k, new Set());
    grupos.get(k)!.add(l.vaga);
  }
  const lista = [...grupos.entries()]
    .map(([nome, s]) => ({ nome, valor: s.size }))
    .sort((a, b) => b.valor - a.valor);
  if (lista.length <= limite) return lista;
  if (!agruparResto) return lista.slice(0, limite);
  const resto = lista.slice(limite - 1);
  const outrasVagas = new Set(ls.filter((l) => resto.some((r) => r.nome === String(l[campo] ?? "Não informado"))).map((l) => l.vaga));
  return [...lista.slice(0, limite - 1), { nome: `Outros (${resto.length})`, valor: outrasVagas.size }];
}

// ---------- Tabelas (tela e planilha) ----------

export type VagaTabela = Linha & { diasMax: number | null; posicoes: number };

// Uma linha por vaga (como a tabela do Power BI, que agrupa as posições), mais recentes primeiro
export function linhasPorVaga(linhas: Linha[]): VagaTabela[] {
  const porVaga = new Map<number, VagaTabela>();
  for (const l of linhas) {
    const atual = porVaga.get(l.vaga);
    const dias = Math.max(atual?.diasMax ?? -Infinity, l.dias ?? -Infinity);
    porVaga.set(l.vaga, {
      ...(atual ?? l),
      diasMax: Number.isFinite(dias) ? dias : null,
      posicoes: (atual?.posicoes ?? 0) + 1,
    });
  }
  return [...porVaga.values()].sort((a, b) => b.data.getTime() - a.data.getTime() || b.vaga - a.vaga);
}

type Valor = string | number | Date | null | undefined;

export type Coluna<T> = {
  id: string;
  titulo: string;
  valor: (x: T) => Valor;
  numero?: boolean; // alinha à direita e ordena do maior pro menor no 1º clique
};

// `ordem` vem da URL: "dias" (crescente) ou "-dias" (decrescente). Vazios sempre no fim.
export function ordenar<T>(itens: T[], ordem: string | undefined, colunas: Coluna<T>[]) {
  const col = ordem && colunas.find((c) => c.id === ordem.replace(/^-/, ""));
  if (!col) return itens;
  const sinal = ordem.startsWith("-") ? -1 : 1;
  const chave = (v: Valor) => (v instanceof Date ? v.getTime() : v);
  return [...itens].sort((x, y) => {
    const a = chave(col.valor(x));
    const b = chave(col.valor(y));
    const vazioA = a === null || a === undefined || a === "";
    const vazioB = b === null || b === undefined || b === "";
    if (vazioA || vazioB) return Number(vazioA) - Number(vazioB);
    const r = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "pt-BR", { numeric: true });
    return r * sinal;
  });
}

// ---------- Vagas arrastadas ----------
// Vaga arrastada pra um mês = aberta antes do dia 1º dele e ainda não fechada
// nesse dia. Concluídas usam a data de fechamento; canceladas não têm data,
// então ficam de fora. Em andamento (e outras situações abertas) contam sempre.

const ehAberta = (l: Linha) => l.situacao === "Em andamento" || l.situacao === "Outra situação";

// Hoje no fuso de São Paulo, como dia em ms UTC (mesma base das datas do banco)
export function hojeUTC() {
  const [a, m, d] = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }).split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

// Mês de referência: o filtrado (ano/mês); sem mês, o mês atual (ou dezembro, se o ano filtrado já passou)
export function mesReferencia(f: Filtros) {
  const hoje = new Date(hojeUTC());
  const ano = f.ano ?? hoje.getUTCFullYear();
  const mes = f.mes ?? (ano === hoje.getUTCFullYear() ? hoje.getUTCMonth() + 1 : 12);
  return { ano, mes, inicio: Date.UTC(ano, mes - 1, 1) };
}

export function arrastadasEm(ls: Linha[], inicio: number) {
  return ls.filter((l) => l.data.getTime() < inicio && (ehAberta(l) || (l.situacao === "Concluída" && l.fechamento !== null && l.fechamento >= inicio)));
}

export function medidasArrastadas(arr: Linha[]) {
  const hoje = hojeUTC();
  const abertas = arr.filter(ehAberta);
  const idade = new Map<number, number>();
  for (const l of abertas) idade.set(l.vaga, Math.round((hoje - l.data.getTime()) / DIA));
  const dias = [...idade.values()];
  return {
    arrastadas: vagasDistintas(arr),
    aindaAbertas: vagasDistintas(abertas),
    concluidasDepois: vagasDistintas(arr.filter((l) => l.situacao === "Concluída")),
    idadeMedia: dias.length ? dias.reduce((a, b) => a + b, 0) / dias.length : null,
  };
}

// Quantas vagas foram arrastadas pra cada mês (do 2º mês com dados até a referência)
export function arrastadasPorMes(ls: Linha[], ate: number) {
  if (!ls.length) return [];
  const primeira = ls.reduce((m, l) => Math.min(m, l.data.getTime()), Infinity);
  const d0 = new Date(primeira);
  let a = d0.getUTCFullYear();
  let m = d0.getUTCMonth() + 1;
  const meses = [];
  for (;;) {
    m++;
    if (m > 12) { a++; m = 1; }
    const inicio = Date.UTC(a, m - 1, 1);
    if (inicio > ate) break;
    meses.push({ mes: `${MESES[m - 1].slice(0, 3)}/${String(a).slice(2)}`, ano: a, m, Arrastadas: vagasDistintas(arrastadasEm(ls, inicio)) });
  }
  return meses;
}

// Arrastadas por mês de abertura, das mais antigas pras mais novas
export function arrastadasPorAbertura(arr: Linha[]) {
  const grupos = new Map<string, Set<number>>();
  for (const l of [...arr].sort((a, b) => a.data.getTime() - b.data.getTime())) {
    const k = `${MESES[l.mes - 1].slice(0, 3)}/${String(l.ano).slice(2)}`;
    if (!grupos.has(k)) grupos.set(k, new Set());
    grupos.get(k)!.add(l.vaga);
  }
  return [...grupos.entries()].map(([nome, v]) => ({ nome, valor: v.size }));
}
