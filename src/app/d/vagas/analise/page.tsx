// Dashboard de Vagas: Análise de Recrutamento (visão por posição)
import { Suspense } from "react";
import { Cabecalho } from "@/components/cabecalho";
import { Filtros } from "@/components/filtros";
import { GraficoBarras, GraficoMensal } from "@/components/graficos";
import { CorpoFiltro, FiltroCruzado } from "@/components/filtro-cruzado";
import { Kpi, Secao } from "@/components/kpi";
import { abrirDashboard } from "@/lib/dal";
import { filtrar, filtrosTexto, getVagas, lerFiltros, medidasPosicoes, opcoes, ordenar, porMes, vagasPor, type Filtros as FiltrosVagas, type Linha } from "@/lib/vagas";
import { Abas, BotaoBaixar, CabecalhoOrdenavel, dataBR, FiltrosAtivos, lerOrdem, lista, num, opcoesMes, qs, subtitulo, Tag } from "../comum";
import { COLUNAS_POSICOES } from "../colunas";

export const metadata = { title: "Análise de Recrutamento | Portal de Dashboards" };

export default function Page({ searchParams }: PageProps<"/d/vagas/analise">) {
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

async function Conteudo({ searchParams }: { searchParams: PageProps<"/d/vagas/analise">["searchParams"] }) {
  const { dashboard } = await abrirDashboard("vagas");
  const sp = await searchParams;
  const f = lerFiltros(sp);
  const ordem = lerOrdem(sp);
  const naUrl = { ...filtrosTexto(f), ordem };
  const { linhas } = await getVagas();

  const sel = filtrar(linhas, f);
  const m = medidasPosicoes(sel);
  const pct = (n: number) => (m.solicitadas ? `${Math.round((n / m.solicitadas) * 100)}% das posições` : undefined);

  return (
    <>
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">{dashboard.title}</h1>
        <p className="text-sm text-zinc-500">{subtitulo(f, linhas)}</p>
      </div>

      <Abas atual="analise" filtros={f} />

      <FiltroCruzado base="/d/vagas/analise" filtros={naUrl}>
        <Filtros
          key={qs(f, ordem)}
          todos={naUrl}
          action="/d/vagas/analise"
          campos={[
            { tipo: "select", nome: "ano", rotulo: "Ano", valor: f.ano?.toString(), opcoes: lista(opcoes(linhas, "ano")) },
            { tipo: "select", nome: "mes", rotulo: "Mês", valor: f.mes?.toString(), opcoes: opcoesMes },
            { tipo: "select", nome: "base", rotulo: "Base", valor: f.base, opcoes: lista(opcoes(linhas, "base")) },
            { tipo: "select", nome: "cliente", rotulo: "Cliente", valor: f.cliente, opcoes: lista(opcoes(linhas, "cliente")) },
            { tipo: "select", nome: "sitPosicao", rotulo: "Situação da posição", valor: f.sitPosicao, opcoes: lista(opcoes(linhas, "sitPosicao")) },
            { tipo: "select", nome: "statusRS", rotulo: "Status R&S", valor: f.statusRS, opcoes: lista(opcoes(linhas, "statusRS")) },
            { tipo: "texto", nome: "vaga", rotulo: "Vaga", valor: f.vaga, placeholder: "Nº da vaga" },
          ]}
        />
        <FiltrosAtivos base="/d/vagas/analise" filtros={f} />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Kpi titulo="Posições solicitadas" valor={num(m.solicitadas)} cor="#2F80ED" />
          <Kpi titulo="Fechadas" valor={num(m.fechadas)} cor="#16A085" variacao={pct(m.fechadas) ?? "Candidato aprovado"} />
          <Kpi titulo="Pendentes" valor={num(m.pendentes)} cor="#F39C12" variacao={pct(m.pendentes)} />
          <Kpi titulo="Canceladas" valor={num(m.canceladas)} cor="#98A2B3" variacao={pct(m.canceladas)} />
          <Kpi titulo="Excluídas" valor={num(m.excluidas)} cor="#E45757" variacao={pct(m.excluidas)} />
        </div>
        <p className="-mt-2 text-xs text-zinc-500">
          Fechada = candidato aprovado. Pendente = vaga ainda aberta e posição sem aprovado.
          {m.naoPreenchidas > 0 && ` + ${num(m.naoPreenchidas)} não preenchidas (vaga concluída sem aprovado nessa posição).`}
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Secao titulo="Vagas abertas por local (top 10)">
            <GraficoBarras dados={vagasPor(filtrar(linhas, { ...f, local: undefined }), "local", 10, false)} campo="local" selecionado={f.local} />
          </Secao>
          <Secao titulo="Vagas abertas por etapa">
            <GraficoBarras dados={vagasPor(filtrar(linhas, { ...f, etapa: undefined }), "etapaRS", 10)} campo="etapa" selecionado={f.etapa} />
          </Secao>
          <Secao titulo="Vagas por mês">
            <GraficoMensal dados={porMes(f.mes === undefined ? sel : filtrar(linhas, f, true))} ano={f.ano} mes={f.mes} />
          </Secao>
          <Secao titulo="Vagas abertas por status R&S">
            <GraficoBarras dados={vagasPor(filtrar(linhas, { ...f, statusRS: undefined }), "statusRS", 10)} campo="statusRS" selecionado={f.statusRS} />
          </Secao>
        </div>

        <Secao titulo="Posições" acao={<BotaoBaixar href={"/d/vagas/exportar" + qs(f, ordem) + (qs(f, ordem) ? "&" : "?") + "tipo=posicoes"} />}>
          <TabelaPosicoes linhas={sel} filtros={f} ordem={ordem} />
        </Secao>
      </FiltroCruzado>
    </>
  );
}

const LIMITE = 300;

function TabelaPosicoes({ linhas, filtros, ordem }: { linhas: Linha[]; filtros: FiltrosVagas; ordem?: string }) {
  const padrao = [...linhas].sort((a, b) => b.data.getTime() - a.data.getTime() || b.vaga - a.vaga || a.posicao - b.posicao);
  const ordenadas = ordenar(padrao, ordem, COLUNAS_POSICOES);
  return (
    <div className="max-h-[520px] overflow-auto">
      <table className="w-full text-left text-sm">
        <CabecalhoOrdenavel colunas={COLUNAS_POSICOES} base="/d/vagas/analise" filtros={filtros} ordem={ordem} />
        <CorpoFiltro>
          {ordenadas.slice(0, LIMITE).map((l) => (
            <tr key={`${l.vaga}-${l.posicao}`} data-vaga={l.vaga}>
              <td className="px-3 py-1.5 text-right tabular-nums">{l.vaga}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{l.posicao}</td>
              <td className="px-3 py-1.5">{l.cargo}</td>
              <td className="px-3 py-1.5">{l.local}</td>
              <td className="px-3 py-1.5 text-right tabular-nums">{l.dias ?? "—"}</td>
              <td className="px-3 py-1.5"><Tag texto={l.sitPosicao} /></td>
              <td className="px-3 py-1.5"><Tag texto={l.statusRS} /></td>
              <td className="px-3 py-1.5">{l.etapaRS}</td>
              <td className="px-3 py-1.5">{l.solicitante ?? "—"}</td>
              <td className="px-3 py-1.5 text-right whitespace-nowrap tabular-nums">{dataBR(l.data)}</td>
            </tr>
          ))}
        </CorpoFiltro>
      </table>
      <p className="mt-2 text-xs text-zinc-400">
        {ordenadas.length > LIMITE ? `Mostrando ${LIMITE} de ${num(ordenadas.length)} posições. A planilha baixada traz todas.` : `${num(ordenadas.length)} posições.`}
      </p>
    </div>
  );
}
