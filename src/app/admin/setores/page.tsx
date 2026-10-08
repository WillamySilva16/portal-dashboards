import { Suspense } from "react";
import { getAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { criarSetor, excluirSetor } from "../actions";
import { botao, botaoLeve, Cartao, Erro, input, td, th } from "../ui";

export default function Page({ searchParams }: PageProps<"/admin/setores">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Carregando…</p>}>
      <Erro searchParams={searchParams} />
      <Conteudo />
    </Suspense>
  );
}

async function Conteudo() {
  await getAdmin();
  const setores = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, permissions: true } } },
  });

  return (
    <div className="space-y-4">
      <Cartao titulo="Novo setor">
        <form action={criarSetor} className="flex flex-wrap gap-3">
          <input name="name" required placeholder="Ex.: RH, Financeiro, Operações" className={`${input} min-w-72 flex-1`} />
          <button className={botao}>Criar</button>
        </form>
        <p className="mt-2 text-xs text-zinc-500">
          Liberar um dashboard pra um setor libera pra todo mundo dele, inclusive quem entrar depois.
        </p>
      </Cartao>

      <Cartao titulo={`Setores (${setores.length})`}>
        {setores.length === 0 ? (
          <p className="text-sm text-zinc-500">Nenhum setor cadastrado.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-marca text-xs text-white">
              <tr>
                <th className={th}>Setor</th>
                <th className={th}>Pessoas</th>
                <th className={th}>Dashboards liberados</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {setores.map((s) => (
                <tr key={s.id}>
                  <td className={td}>{s.name}</td>
                  <td className={`${td} tabular-nums`}>{s._count.users}</td>
                  <td className={`${td} tabular-nums`}>{s._count.permissions}</td>
                  <td className={`${td} text-right`}>
                    <form action={excluirSetor}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className={botaoLeve} title="As pessoas ficam sem setor e as permissões do setor são removidas">
                        Excluir
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Cartao>
    </div>
  );
}
