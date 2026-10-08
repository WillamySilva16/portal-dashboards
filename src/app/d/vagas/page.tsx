// Dashboard de Vagas: Visão geral
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { Filtros } from "@/components/filtros";
import { GraficoBarras, GraficoMensal } from "@/components/graficos";
import { CorpoFiltro, FiltroCruzado } from "@/components/filtro-cruzado";
import { Kpi, Secao } from "@/components/kpi";
import { abrirDashboard } from "@/lib/dal";
import { filtrar, filtrosTexto, getVagas, lerFiltros, linhasMesAnterior, linhasPorVaga, medidasVagas, opcoes, ordenar, porMes, vagasPor, type Filtros as FiltrosVagas, type Linha } from "@/lib/vagas";
import { Abas, BotaoBaixar, CabecalhoOrdenavel, dataBR, FiltrosAtivos, lerOrdem, lista, num, opcoesMes, qs, subtitulo, Tag, variacao } from "./comum";
import { COLUNAS_VAGAS } from "./colunas";

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
  const sp = await searchParams;
  const f = lerFiltros(sp);
  const ordem = lerOrdem(sp);
  const naUrl = { ...filtrosTexto(f), ordem };
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

      <FiltroCruzado base="/d/vagas" filtros={naUrl}>
        <Filtros
          key={qs(f, ordem)}
          todos={naUrl}
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi titulo="Vagas abertas" valor={num(m.abertas)} cor="#2F80ED" variacao={variacao(m.abertas, mAnt?.abertas)} />
          <Kpi titulo="Vagas concluídas" valor={num(m.concluidas)} cor="#16A085" variacao={variacao(m.concluidas, mAnt?.concluidas)} />
          <Kpi titulo="Em andamento" valor={num(m.andamento)} cor="#F39C12" variacao={variacao(m.andamento, mAnt?.andamento)} />
          <Kpi titulo="Canceladas" valor={num(m.canceladas)} cor="#98A2B3" variacao={variacao(m.canceladas, mAnt?.canceladas)} />
          <Kpi
            titulo="Tempo médio de fechamento (dias)"
            valor={m.tempoMedio === null ? "—" : m.tempoMedio.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}
            cor="#8E5DE7"
            variacao={variacao(m.tempoMedio, mAnt === undefined ? undefined : mAnt.tempoMedio, 1)}
          />
        </div>
        {m.outras > 0 && (
          <p className="-mt-2 text-xs text-zinc-500">
            + {num(m.outras)} {m.outras === 1 ? "vaga" : "vagas"} em outra situação (Envia Reavaliação, Retorna Seleção…), fora dos cards acima.
          </p>
        )}

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

        <Secao titulo="Detalhamento das vagas" acao={<BotaoBaixar href={"/d/vagas/exportar" + qs(f, ordem)} />}>
          <TabelaVagas linhas={sel} filtros={f} ordem={ordem} />
        </Secao>
      </FiltroCruzado>
    </>
  );
}

const LIMITE = 300;

function TabelaVagas({ linhas, filtros, ordem }: { linhas: Linha[]; filtros: FiltrosVagas; ordem?: string }) {
  const vagas = ordenar(linhasPorVaga(linhas), ordem, COLUNAS_VAGAS);

  return (
    <div className="max-h-[520px] overflow-auto">
      <table className="w-full text-left text-sm">
        <CabecalhoOrdenavel colunas={COLUNAS_VAGAS} base="/d/vagas" filtros={filtros} ordem={ordem} />
        <CorpoFiltro>
          {vagas.slice(0, LIMITE).map((v) => (
            <tr key={v.vaga} data-vaga={v.vaga}>
              <td className="px-3 py-1.5 text-right whitespace-nowrap tabular-nums">{dataBR(v.data)}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{v.vaga}</td>
              <td className="px-3 py-1.5">{v.supervisao ?? "—"}</td>
              <td className="px-3 py-1.5">{v.cargo}</td>
              <td className="px-3 py-1.5">{v.local}</td>
              <td className="px-3 py-1.5 whitespace-nowrap">{v.base ?? "—"}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{v.diasMax ?? "—"}</td>
              <td className="px-3 py-1.5"><Tag texto={v.situacao} /></td>
              <td className="px-3 py-1.5"><Tag texto={v.sla} /></td>
            </tr>
          ))}
        </CorpoFiltro>
      </table>
      <p className="mt-2 text-xs text-zinc-400">
        {vagas.length > LIMITE
          ? `Mostrando ${LIMITE} de ${num(vagas.length)} vagas. A planilha baixada traz todas.`
          : `${num(vagas.length)} vagas.`}
      </p>
    </div>
  );
}
