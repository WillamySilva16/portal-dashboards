import { Suspense } from "react";
import { getAdmin } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { criarUsuario, salvarUsuario } from "../actions";
import { botao, botaoLeve, Cartao, dataHora, Erro, input, td, th } from "../ui";

export default function Page({ searchParams }: PageProps<"/admin/usuarios">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Carregando…</p>}>
      <Erro searchParams={searchParams} />
      <Conteudo />
    </Suspense>
  );
}

async function Conteudo() {
  const eu = await getAdmin();
  const [usuarios, setores] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ active: "desc" }, { email: "asc" }] }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-4">
      <Cartao titulo="Liberar novo e-mail">
        <form action={criarUsuario} className="flex flex-wrap items-end gap-3">
          <input name="email" type="email" required placeholder="nome@rsterceirizacao.com.br" className={`${input} min-w-72 flex-1`} />
          <input name="name" placeholder="Nome (opcional)" className={`${input} min-w-48`} />
          <SelSetor setores={setores} />
          <select name="role" defaultValue="VIEWER" className={input}>
            <option value="VIEWER">Visualizador</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className={botao}>Liberar</button>
        </form>
        <p className="mt-2 text-xs text-zinc-500">
          A pessoa entra com a conta Google desse e-mail. Depois, libere os dashboards pra ela ou pro setor dela.
        </p>
      </Cartao>

      <Cartao titulo={`Usuários (${usuarios.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-marca text-xs text-white">
              <tr>
                <th className={th}>E-mail</th>
                <th className={th}>Nome</th>
                <th className={th}>Setor</th>
                <th className={th}>Perfil</th>
                <th className={th}>Ativo</th>
                <th className={th}>Último login</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {usuarios.map((u) => (
                // Cada linha é um formulário: edita e clica Salvar
                <tr key={u.id} className={u.active ? "" : "text-zinc-400"}>
                  <td className={td}>
                    {u.email}
                    {u.id === eu.id && <span className="ml-1 text-xs text-zinc-400">(você)</span>}
                  </td>
                  <td className={td}>
                    <input form={`u${u.id}`} name="name" defaultValue={u.name ?? ""} className={`${input} w-44`} />
                  </td>
                  <td className={td}>
                    <SelSetor setores={setores} form={`u${u.id}`} valor={u.departmentId} />
                  </td>
                  <td className={td}>
                    <select form={`u${u.id}`} name="role" defaultValue={u.role} className={input}>
                      <option value="VIEWER">Visualizador</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className={td}>
                    <input form={`u${u.id}`} type="checkbox" name="active" defaultChecked={u.active} className="size-4 accent-[#17324d]" />
                  </td>
                  <td className={`${td} whitespace-nowrap`}>{dataHora(u.lastLoginAt)}</td>
                  <td className={td}>
                    <form id={`u${u.id}`} action={salvarUsuario}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className={botaoLeve}>Salvar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-zinc-500">Desmarcar &quot;Ativo&quot; corta o acesso na hora, mesmo de quem já está logado.</p>
      </Cartao>
    </div>
  );
}

function SelSetor({ setores, valor, form }: { setores: { id: number; name: string }[]; valor?: number | null; form?: string }) {
  return (
    <select form={form} name="departmentId" defaultValue={valor ?? ""} className={input}>
      <option value="">Sem setor</option>
      {setores.map((s) => (
        <option key={s.id} value={s.id}>{s.name}</option>
      ))}
    </select>
  );
}
