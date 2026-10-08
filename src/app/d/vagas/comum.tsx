import Link from "next/link";
import { MESES, type Filtros, type Linha } from "@/lib/vagas";

export const num = (n: number) => n.toLocaleString("pt-BR");
export const dataBR = (d: Date) => d.toLocaleDateString("pt-BR", { timeZone: "UTC" });

// Monta a query string mantendo os filtros ao trocar de aba
export function qs(f: Filtros) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v !== undefined) p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function Abas({ atual, filtros }: { atual: "geral" | "analise"; filtros: Filtros }) {
  const aba = (id: string, href: string, texto: string) => (
    <Link
      href={href + qs(filtros)}
      className={`border-b-2 px-1 pb-2 text-sm font-medium ${
        atual === id ? "border-marca text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {texto}
    </Link>
  );
  return (
    <nav className="flex gap-6 border-b border-zinc-200">
      {aba("geral", "/d/vagas", "Visão geral")}
      {aba("analise", "/d/vagas/analise", "Análise de Recrutamento")}
    </nav>
  );
}

// Equivalente à medida "Subtítulo" do Power BI
export function subtitulo(f: Filtros, linhas: Linha[]) {
  const mes = f.mes ? MESES[f.mes - 1] : "Todos os meses";
  const ano = f.ano ? String(f.ano) : "todos os anos";
  const ate = linhas.reduce<Date | null>((m, l) => (!m || l.data > m ? l.data : m), null);
  return `${mes} de ${ano}${ate ? `  |  Dados até ${dataBR(ate)}` : ""}`;
}

// Texto "▲ 12 vs. mês anterior"
export function variacao(atual: number | null, anterior: number | null | undefined, casas = 0) {
  if (anterior === undefined) return "Selecione ano e mês para comparar";
  if (atual === null || anterior === null || anterior === 0) return "Sem base no mês anterior";
  const d = atual - anterior;
  return `${d >= 0 ? "▲" : "▼"} ${Math.abs(d).toLocaleString("pt-BR", { maximumFractionDigits: casas, minimumFractionDigits: casas })} vs. mês anterior`;
}

export const opcoesMes = MESES.map((m, i) => ({ valor: String(i + 1), texto: m }));
export const lista = (vs: string[]) => vs.map((v) => ({ valor: v, texto: v }));

export function Tag({ texto }: { texto: string | null }) {
  if (!texto) return <span className="text-zinc-400">—</span>;
  const cor: Record<string, string> = {
    "Fora do prazo": "bg-red-50 text-red-700",
    "Em alerta": "bg-amber-50 text-amber-800",
    "Dentro do prazo": "bg-green-50 text-green-800",
    "Concluída": "bg-green-50 text-green-800",
    "CONCLUÍDA": "bg-green-50 text-green-800",
    "Cancelada": "bg-zinc-100 text-zinc-600",
    "EXCLUÍDA": "bg-red-50 text-red-700",
    "Em andamento": "bg-blue-50 text-blue-800",
    "EM ANDAMENTO": "bg-blue-50 text-blue-800",
  };
  return <span className={`rounded px-1.5 py-0.5 text-xs whitespace-nowrap ${cor[texto] ?? "bg-zinc-100 text-zinc-700"}`}>{texto}</span>;
}
