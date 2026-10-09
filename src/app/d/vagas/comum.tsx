import Link from "next/link";
import { MESES, periodosRapidos, type Coluna, type Filtros, type Linha } from "@/lib/vagas";
import { dataBR } from "./colunas";

export { dataBR };

export const num = (n: number) => n.toLocaleString("pt-BR");

// Monta a query string mantendo os filtros ao trocar de aba (e a ordem da tabela, se tiver)
export function qs(f: Filtros, ordem?: string) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v !== undefined) p.set(k, String(v));
  if (ordem) p.set("ordem", ordem);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function Abas({ atual, filtros }: { atual: "geral" | "analise" | "arrastadas"; filtros: Filtros }) {
  const aba = (id: string, href: string, texto: string) => (
    <Link
      href={href + qs(filtros)}
      className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
        atual === id ? "bg-marca text-white shadow-sm dark:bg-[#2a78d6]" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {texto}
    </Link>
  );
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3">
      <div className="cartao inline-flex gap-1 p-1">
        {aba("geral", "/d/vagas", "Visão geral")}
        {aba("analise", "/d/vagas/analise", "Análise de Recrutamento")}
        {aba("arrastadas", "/d/vagas/arrastadas", "Vagas arrastadas")}
      </div>
      <Link
        href={"/d/vagas/tv" + qs(filtros)}
        target="_blank"
        className="inline-flex items-center gap-1.5 rounded-lg bg-superficie px-3 py-1.5 text-sm font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
        title="Tela cheia pra deixar numa TV (leva os filtros escolhidos aqui)"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
        Modo TV
      </Link>
    </nav>
  );
}

// Topo da página: caminho, título, subtítulo e quando os dados foram atualizados
export function Topo({ titulo, subtitulo, atualizadoEm }: { titulo: string; subtitulo: string; atualizadoEm?: Date | null }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-zinc-400">
          <Link href="/" className="hover:text-zinc-700">Dashboards</Link>
          <span className="mx-1.5">/</span>
          <span className="text-zinc-500">{titulo}</span>
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{titulo}</h1>
        <p className="mt-0.5 text-sm text-zinc-500">{subtitulo}</p>
      </div>
      {atualizadoEm && (
        <p className="inline-flex items-center gap-2 rounded-full bg-superficie px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Atualizado em {atualizadoEm.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}
        </p>
      )}
    </div>
  );
}

// "2026-09-01" -> "01/09/2026"
const isoBR = (iso: string) => iso.split("-").reverse().join("/");

// "Abertas de 01/09/2026 a 30/09/2026"
export function periodoTexto(f: Filtros) {
  if (f.de && f.ate) return `Abertas de ${isoBR(f.de)} a ${isoBR(f.ate)}`;
  if (f.de) return `Abertas a partir de ${isoBR(f.de)}`;
  if (f.ate) return `Abertas até ${isoBR(f.ate)}`;
  return null;
}

// Equivalente à medida "Subtítulo" do Power BI
export function subtitulo(f: Filtros, linhas: Linha[]) {
  const mes = f.mes ? MESES[f.mes - 1] : "Todos os meses";
  const ano = f.ano ? String(f.ano) : "todos os anos";
  const ate = linhas.reduce<Date | null>((m, l) => (!m || l.data > m ? l.data : m), null);
  const periodo = periodoTexto(f);
  const base = periodo && !f.ano && !f.mes ? periodo : `${mes} de ${ano}${periodo ? `  |  ${periodo}` : ""}`;
  return `${base}${ate ? `  |  Dados até ${dataBR(ate)}` : ""}`;
}

// Atalhos de período de abertura (este mês, últimos 30 dias...). Trocam ano/mês pelo período.
export function PeriodoRapido({ base, filtros }: { base: string; filtros: Filtros }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="rotulo mr-1">Abertas em</span>
      {periodosRapidos().map((p) => {
        const ativo = filtros.de === p.de && filtros.ate === p.ate;
        return (
          <Link
            key={p.texto}
            href={base + qs({ ...filtros, ano: undefined, mes: undefined, de: ativo ? undefined : p.de, ate: ativo ? undefined : p.ate })}
            scroll={false}
            className={`rounded-full px-2.5 py-1 ring-1 ${ativo ? "bg-marca text-white ring-marca dark:bg-[#2a78d6] dark:ring-[#2a78d6]" : "bg-zinc-50 text-zinc-700 ring-zinc-200 hover:bg-zinc-100"}`}
          >
            {p.texto}
          </Link>
        );
      })}
    </div>
  );
}

// Texto "▲ 12 vs. mês anterior"
export function variacao(atual: number | null, anterior: number | null | undefined, casas = 0) {
  if (anterior === undefined) return undefined; // sem mês escolhido não há com o que comparar
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
    "Outra situação": "bg-amber-50 text-amber-800",
    "Fechada": "bg-green-50 text-green-800",
    "Pendente": "bg-amber-50 text-amber-800",
    "Excluída": "bg-red-50 text-red-700",
    "Não preenchida": "bg-zinc-100 text-zinc-600",
    "EM ANDAMENTO": "bg-blue-50 text-blue-800",
  };
  return <span className={`rounded px-1.5 py-0.5 text-xs whitespace-nowrap ${cor[texto] ?? "bg-zinc-100 text-zinc-700"}`}>{texto}</span>;
}

const ROTULOS: Record<string, string> = {
  ano: "Ano", mes: "Mês", base: "Base", local: "Cliente", cliente: "Empresa", situacao: "Situação",
  status: "Status", statusRS: "Status R&S", categoria: "Categoria", etapa: "Etapa", sitPosicao: "Situação da posição", vaga: "Vaga",
  de: "Aberta a partir de", ate: "Aberta até",
};

// Faixa "Filtros ativos" com um × em cada um, como os chips do Power BI
export function FiltrosAtivos({ base, filtros }: { base: string; filtros: Filtros }) {
  const ativos = Object.entries(filtros).filter(([, v]) => v !== undefined) as [keyof Filtros, string | number][];
  if (!ativos.length) return <p className="text-xs text-zinc-400">Dica: clique numa barra ou numa linha da tabela pra filtrar o dashboard inteiro. Escolha ano e mês pra comparar com o mês anterior.</p>;
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="rotulo mr-1">Filtros ativos</span>
      {ativos.map(([k, v]) => (
        <Link
          key={k}
          href={base + qs({ ...filtros, [k]: undefined })}
          scroll={false}
          title="Tirar este filtro"
          className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-900 ring-1 ring-blue-200 hover:bg-blue-100"
        >
          {ROTULOS[k] ?? k}: <strong className="font-semibold">{k === "mes" ? MESES[Number(v) - 1] : k === "de" || k === "ate" ? isoBR(String(v)) : String(v)}</strong>
          <span aria-hidden className="text-blue-500">×</span>
        </Link>
      ))}
      <Link href={base} scroll={false} className="text-zinc-500 underline hover:text-zinc-900">
        Limpar tudo
      </Link>
    </div>
  );
}

export function lerOrdem(sp: Record<string, string | string[] | undefined>) {
  const v = sp.ordem;
  return typeof v === "string" && v ? v : undefined;
}

// Cabeçalho de tabela: clicar no título ordena; clicar de novo inverte
export function CabecalhoOrdenavel<T>({ colunas, base, filtros, ordem }: { colunas: Coluna<T>[]; base: string; filtros: Filtros; ordem?: string }) {
  return (
    <thead className="cabeca-tabela">
      <tr>
        {colunas.map((c) => {
          const atual = ordem?.replace(/^-/, "") === c.id;
          const desc = atual ? ordem!.startsWith("-") : false;
          // 1º clique: números e datas do maior pro menor, texto de A a Z
          const proxima = atual ? (desc ? c.id : `-${c.id}`) : c.numero ? `-${c.id}` : c.id;
          return (
            <th key={c.id} className={`px-3 py-2.5 font-semibold whitespace-nowrap ${c.numero ? "text-right" : ""}`} aria-sort={atual ? (desc ? "descending" : "ascending") : undefined}>
              <Link href={base + qs(filtros, proxima)} scroll={false} title="Clique pra ordenar" className="inline-flex items-center gap-1 hover:text-zinc-900">
                {c.titulo}
                <span aria-hidden className={atual ? "text-[#2a78d6]" : "opacity-30"}>{atual ? (desc ? "▼" : "▲") : "↕"}</span>
              </Link>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

// Botão de baixar a planilha com os filtros e a ordem da tela
export function BotaoBaixar({ href }: { href: string }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 rounded-lg bg-superficie px-3 py-1.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
        <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />
      </svg>
      Baixar planilha
    </a>
  );
}
