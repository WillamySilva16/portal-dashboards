// Dashboard de Vagas: Visão geral
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { Filtros } from "@/components/filtros";
import { GraficoBarras, GraficoMensal } from "@/components/graficos";
import { FiltroCruzado, LinhaFiltro } from "@/components/filtro-cruzado";
import { Kpi, Secao } from "@/components/kpi";
import { abrirDashboard } from "@/lib/dal";
import { filtrar, filtrosTexto, getVagas, lerFiltros, linhasMesAnterior, medidasVagas, opcoes, porMes, vagasPor, type Linha } from "@/lib/vagas";
import { Abas, dataBR, FiltrosAtivos, qs, lista, num, opcoesMes, subtitulo, Tag, variacao } from "./comum";

export const metadata = { title: "Vagas | Portal de Dashboards" };

export default function Page({ searchParams }: PageProps<"/d/vagas">) {
  return (
    <div className="flex flex-1 flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-7xl space-y-4 p-6">
        <Suspense fallback={<p className="text-sm text-zinc-500">Carregando…</p>}>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/d/vagas">["searchParams"] }) {
  const { dashboard } = await abrirDashboard("vagas");
  const f = lerFiltros(await searchParams);
  const { linhas, atualizadoEm } = await getVagas();

  const sel = filtrar(linhas, f);
  const m = medidasVagas(sel);
  const ant = linhasMesAnterior(linhas, f);
  const mAnt = ant ? medidasVagas(ant) : undefined;

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{dashboard.title}</h1>
          <p className="text-sm text-zinc-500">{subtitulo(f, linhas)}</p>
        </div>
        {atualizadoEm && (
          <p className="text-xs text-zinc-400">
            Atualizado em {atualizadoEm.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
          </p>
        )}
      </div>

      <Abas atual="geral" filtros={f} />

      <FiltroCruzado base="/d/vagas" filtros={filtrosTexto(f)}>
        <Filtros
          key={qs(f)}
          todos={filtrosTexto(f)}
          action="/d/vagas"
          campos={[
            { tipo: "select", nome: "ano", rotulo: "Ano", valor: f.ano?.toString(), opcoes: lista(opcoes(linhas, "ano")) },
            { tipo: "select", nome: "mes", rotulo: "Mês", valor: f.mes?.toString(), opcoes: opcoesMes },
            { tipo: "select", nome: "base", rotulo: "Base", valor: f.base, opcoes: lista(opcoes(linhas, "base")) },
            { tipo: "select", nome: "local", rotulo: "Local", valor: f.local, opcoes: lista(opcoes(linhas, "local")) },
            { tipo: "select", nome: "situacao", rotulo: "Situação", valor: f.situacao, opcoes: lista(opcoes(linhas, "situacao")) },
            { tipo: "select", nome: "status", rotulo: "Status", valor: f.status, opcoes: lista(opcoes(linhas, "status")) },
            { tipo: "texto", nome: "vaga", rotulo: "Vaga", valor: f.vaga, placeholder: "Nº da vaga" },
          ]}
        />
        <FiltrosAtivos base="/d/vagas" filtros={f} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi titulo="Vagas abertas" valor={num(m.abertas)} cor="#2F80ED" variacao={variacao(m.abertas, mAnt?.abertas)} />
          <Kpi titulo="Vagas concluídas" valor={num(m.concluidas)} cor="#16A085" variacao={variacao(m.concluidas, mAnt?.concluidas)} />
          <Kpi titulo="Em andamento" valor={num(m.andamento)} cor="#F39C12" variacao={variacao(m.andamento, mAnt?.andamento)} />
          <Kpi
            titulo="Tempo médio de fechamento (dias)"
            valor={m.tempoMedio === null ? "—" : m.tempoMedio.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
            cor="#8E5DE7"
            variacao={variacao(m.tempoMedio, mAnt === undefined ? undefined : mAnt.tempoMedio, 1)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Secao titulo="Vagas por mês">
            <GraficoMensal dados={porMes(f.mes === undefined ? sel : filtrar(linhas, f, true))} ano={f.ano} mes={f.mes} />
          </Secao>
          <Secao titulo="Vagas abertas por categoria">
            <GraficoBarras
              dados={vagasPor(filtrar(linhas, { ...f, categoria: undefined }), "categoria", 10)}
              campo="categoria"
              selecionado={f.categoria}
            />
          </Secao>
        </div>

        <Secao titulo="Detalhamento das vagas">
          <TabelaVagas linhas={sel} />
        </Secao>
      </FiltroCruzado>
    </>
  );
}

const LIMITE = 300;

// Uma linha por vaga (como a tabela do Power BI, que agrupa as posições)
function TabelaVagas({ linhas }: { linhas: Linha[] }) {
  const porVaga = new Map<number, Linha & { diasMax: number | null }>();
  for (const l of linhas) {
    const atual = porVaga.get(l.vaga);
    const dias = Math.max(atual?.diasMax ?? -Infinity, l.dias ?? -Infinity);
    porVaga.set(l.vaga, { ...(atual ?? l), diasMax: Number.isFinite(dias) ? dias : null });
  }
  const vagas = [...porVaga.values()].sort((a, b) => b.data.getTime() - a.data.getTime() || b.vaga - a.vaga);

  return (
    <div className="max-h-[520px] overflow-auto">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-marca text-xs text-white">
          <tr>
            {["Data", "Vaga", "Supervisão", "Cargo", "Local", "Base", "Dias", "Situação", "SLA"].map((h) => (
              <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {vagas.slice(0, LIMITE).map((v) => (
            <LinhaFiltro key={v.vaga} valores={{ vaga: String(v.vaga) }}>
              <td className="px-3 py-1.5 whitespace-nowrap tabular-nums">{dataBR(v.data)}</td>
              <td className="px-3 py-1.5 tabular-nums">{v.vaga}</td>
              <td className="px-3 py-1.5">{v.supervisao ?? "—"}</td>
              <td className="px-3 py-1.5">{v.cargo}</td>
              <td className="px-3 py-1.5">{v.local}</td>
              <td className="px-3 py-1.5 whitespace-nowrap">{v.base ?? "—"}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{v.diasMax ?? "—"}</td>
              <td className="px-3 py-1.5"><Tag texto={v.situacao} /></td>
              <td className="px-3 py-1.5"><Tag texto={v.sla} /></td>
            </LinhaFiltro>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-zinc-400">
        {vagas.length > LIMITE ? `Mostrando ${LIMITE} de ${num(vagas.length)} vagas. Use os filtros pra refinar.` : `${num(vagas.length)} vagas.`}
      </p>
    </div>
  );
}
