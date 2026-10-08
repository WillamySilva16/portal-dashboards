import Link from "next/link";
import { Suspense } from "react";
import { getAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { liberarDashboard, removerPermissao, salvarDashboard } from "../actions";
import { botao, botaoLeve, Cartao, Erro, input } from "../ui";

export default function Page({ searchParams }: PageProps<"/admin/dashboards">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Carregando…</p>}>
      <Erro searchParams={searchParams} />
      <Conteudo />
    </Suspense>
  );
}

async function Conteudo() {
  await getAdmin();
  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [dashboards, usuarios, setores, views] = await Promise.all([
    prisma.dashboard.findMany({
      orderBy: { title: "asc" },
      include: {
        permissions: {
          include: { user: { select: { email: true, name: true } }, department: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.user.findMany({ where: { active: true, role: "VIEWER" }, orderBy: { email: "asc" }, select: { id: true, email: true } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.accessLog.groupBy({
      by: ["dashboardId"],
      where: { action: "VIEW_DASHBOARD", createdAt: { gte: desde } },
      _count: { _all: true },
    }),
  ]);
  const viewsPor = new Map(views.map((v) => [v.dashboardId, v._count._all]));

  if (dashboards.length === 0) {
    return <p className="text-sm text-zinc-500">Nenhum dashboard cadastrado.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Admins veem todos os dashboards. Os demais só veem o que for liberado aqui, pra pessoa ou pro setor dela.
      </p>
      {dashboards.map((d) => (
        <Cartao key={d.id} titulo={d.title}>
          <div className="grid gap-6 lg:grid-cols-2">
            <form action={salvarDashboard} className="space-y-2">
              <input type="hidden" name="id" value={d.id} />
              <label className="block text-xs font-medium text-zinc-500">
                Título
                <input name="title" defaultValue={d.title} className={`${input} mt-1 w-full`} />
              </label>
              <label className="block text-xs font-medium text-zinc-500">
                Descrição
                <input name="description" defaultValue={d.description ?? ""} className={`${input} mt-1 w-full`} />
              </label>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-zinc-500">
                  Categoria
                  <input name="category" defaultValue={d.category ?? ""} className={`${input} w-40`} />
                </label>
                <label className="flex h-9 items-center gap-2 text-sm text-zinc-700">
                  <input type="checkbox" name="active" defaultChecked={d.active} className="size-4 accent-[#17324d]" />
                  Ativo no catálogo
                </label>
                <button className={botaoLeve}>Salvar</button>
              </div>
              <p className="pt-1 text-xs text-zinc-500">
                <Link href={`/d/${d.slug}`} className="underline">/d/{d.slug}</Link> ·{" "}
                {viewsPor.get(d.id) ?? 0} visualizações nos últimos 30 dias
              </p>
            </form>

            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500">Quem pode ver</p>
              {d.permissions.length === 0 ? (
                <p className="mb-3 text-sm text-zinc-400">Só os admins, por enquanto.</p>
              ) : (
                <ul className="mb-3 divide-y divide-zinc-100 rounded-lg ring-1 ring-zinc-200">
                  {d.permissions.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm">
                      <span>
                        {p.department ? (
                          <><span className="mr-1.5 rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600">setor</span>{p.department.name}</>
                        ) : (
                          p.user?.email
                        )}
                      </span>
                      <form action={removerPermissao}>
                        <input type="hidden" name="id" value={p.id} />
                        <button className="text-xs text-zinc-500 underline hover:text-red-700">Remover</button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
              <form action={liberarDashboard} className="flex gap-2">
                <input type="hidden" name="dashboardId" value={d.id} />
                <select name="alvo" required defaultValue="" className={`${input} min-w-0 flex-1`}>
                  <option value="" disabled>Escolha uma pessoa ou setor…</option>
                  {setores.length > 0 && (
                    <optgroup label="Setores">
                      {setores.map((s) => (
                        <option key={s.id} value={`d:${s.id}`}>{s.name}</option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="Pessoas">
                    {usuarios.map((u) => (
                      <option key={u.id} value={`u:${u.id}`}>{u.email}</option>
                    ))}
                  </optgroup>
                </select>
                <button className={botao}>Liberar</button>
              </form>
            </div>
          </div>
        </Cartao>
      ))}
    </div>
  );
}
