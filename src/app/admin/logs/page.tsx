import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { getAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { ACOES, diasAtras, lerFiltrosLog, whereLog } from "@/lib/logs";
import { botao, botaoLeve, Cartao, dataHora, input, td, th } from "../ui";

const POR_PAGINA = 100;

export default function Page({ searchParams }: PageProps<"/admin/logs">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Carregando…</p>}>
      <Conteudo searchParams={searchParams} />
    </Suspense>
  );
}

const corAcao: Record<string, string> = {
  LOGIN: "bg-green-50 text-green-800",
  LOGIN_DENIED: "bg-red-50 text-red-700",
  VIEW_DASHBOARD: "bg-blue-50 text-blue-800",
  VIEW_DENIED: "bg-red-50 text-red-700",
  LOGOUT: "bg-zinc-100 text-zinc-600",
};

async function Conteudo({ searchParams }: { searchParams: PageProps<"/admin/logs">["searchParams"] }) {
  await getAdmin();
  const sp = await searchParams;
  const f = lerFiltrosLog(sp);
  const pagina = Math.max(1, Number(sp.p) || 1);
  const where = whereLog(f);
  const semana = diasAtras(7);

  const [logs, total, dashboards, resumo] = await Promise.all([
    prisma.accessLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      include: { dashboard: { select: { title: true } }, user: { select: { name: true } } },
    }),
    prisma.accessLog.count({ where }),
    prisma.dashboard.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
    prisma.accessLog.groupBy({ by: ["action"], where: { createdAt: { gte: semana } }, _count: { _all: true } }),
  ]);
  const resumoPor = new Map(resumo.map((r) => [r.action, r._count._all]));
  const params = new URLSearchParams(Object.entries(f).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
  const link = (p: number) => `/admin/logs?${new URLSearchParams([...params, ["p", String(p)]])}`;
  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(ACOES) as (keyof typeof ACOES)[]).map((a) => (
          <div key={a} className="rounded-xl bg-white p-3 ring-1 ring-zinc-200">
            <p className="text-xs text-zinc-500">{ACOES[a]} · 7 dias</p>
            <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{(resumoPor.get(a) ?? 0).toLocaleString("pt-BR")}</p>
          </div>
        ))}
      </div>

      <Cartao titulo="Filtrar">
        <Form action="/admin/logs" className="flex flex-wrap items-end gap-3">
          <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-zinc-500">
            E-mail
            <input name="email" defaultValue={f.email} placeholder="parte do e-mail" className={`${input} min-w-48`} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
            Ação
            <select name="acao" defaultValue={f.acao ?? ""} className={input}>
              <option value="">Todas</option>
              {Object.entries(ACOES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
            Dashboard
            <select name="dashboard" defaultValue={f.dashboard ?? ""} className={input}>
              <option value="">Todos</option>
              {dashboards.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
            De
            <input type="date" name="de" defaultValue={f.de} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
            Até
            <input type="date" name="ate" defaultValue={f.ate} className={input} />
          </label>
          <button className={botao}>Filtrar</button>
          <a href={`/admin/logs/exportar?${params}`} className={`${botaoLeve} content-center`}>Exportar CSV</a>
        </Form>
      </Cartao>

      <Cartao titulo={`${total.toLocaleString("pt-BR")} registros`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-marca text-xs text-white">
              <tr>
                <th className={th}>Quando</th>
                <th className={th}>E-mail</th>
                <th className={th}>Ação</th>
                <th className={th}>Dashboard</th>
                <th className={th}>IP</th>
                <th className={th}>Navegador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs.map((l) => (
                <tr key={String(l.id)}>
                  <td className={`${td} whitespace-nowrap tabular-nums`}>{dataHora(l.createdAt)}</td>
                  <td className={td}>
                    {l.email}
                    {l.user?.name && <span className="block text-xs text-zinc-400">{l.user.name}</span>}
                  </td>
                  <td className={td}>
                    <span className={`rounded px-1.5 py-0.5 text-xs whitespace-nowrap ${corAcao[l.action]}`}>{ACOES[l.action]}</span>
                  </td>
                  <td className={td}>{l.dashboard?.title ?? "—"}</td>
                  <td className={`${td} tabular-nums`}>{l.ip ?? "—"}</td>
                  <td className={`${td} max-w-64 truncate text-xs text-zinc-500`} title={l.userAgent ?? ""}>{navegador(l.userAgent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {paginas > 1 && (
          <div className="mt-3 flex items-center gap-3 text-sm text-zinc-600">
            {pagina > 1 && <Link href={link(pagina - 1)} className="underline">← Anteriores</Link>}
            <span>Página {pagina} de {paginas}</span>
            {pagina < paginas && <Link href={link(pagina + 1)} className="underline">Próximos →</Link>}
          </div>
        )}
      </Cartao>
    </div>
  );
}

// Resumo legível do user-agent ("Chrome · Windows")
function navegador(ua: string | null) {
  if (!ua) return "—";
  const nav = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Outro";
  const so = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return so ? `${nav} · ${so}` : nav;
}
